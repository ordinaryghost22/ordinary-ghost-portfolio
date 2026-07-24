import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { scrollProgressRef } from '@/context/scroll-progress-context'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePointerNDC } from '@/hooks/usePointerNDC'
import { useSceneControls } from '@/hooks/useSceneControls'
import { DisplacedOrbShell } from '@/scene/DisplacedOrbShell'
import { AmbientOrbDust } from '@/scene/AmbientOrbDust'
import { GeodesicWireShell } from '@/scene/GeodesicWireShell'
import { OrbCore } from '@/scene/OrbCore'
import { OrbHudRing } from '@/scene/OrbHudRing'
import {
  buildNeighborEdgeIndices,
  pickDominantSection,
  useOrbLayouts,
  writeEdgePositionsAndColors,
} from '@/scene/orbGeometry'
import {
  particleFragmentShader,
  particleVertexShader,
} from '@/scene/particleShaders'
import { ORB_BASE_SCALE } from '@/scene/orbVisualParams'
import type { OrbHoverState } from '@/scene/orbHover'
import { sceneRuntimeRef } from '@/scene/sceneRuntime'

const GOLD = new THREE.Color('#C6A15B')
const LERP = 0.05
const MOUSE_TILT_LERP = 0.075
const MORPH_LERP = 0.045
const RADIUS = 1.55

/** Per-frame idle Y spin — starts immediately on mount (no scroll/hover gate). */
const IDLE_SPIN_PER_FRAME = 0.003
/** Per-node travel duration after its stagger delay (seconds) */
const CONVERGE_DURATION_S = 1.85

/** Hover proximity radius in NDC */
const HOVER_RADIUS_NDC = 0.55
/** ~7% scale lift while hovered (e.g. 0.70 → 0.75 feel) */
const HOVER_SCALE_BOOST = 0.072
const TILT_FOLLOW_X = 0.36
const TILT_FOLLOW_Y = 0.46

type NeuralOrbProps = {
  reducedMotion: boolean
  lowPower: boolean
  /** Adaptive particle budget from performance tier */
  nodeCountOverride?: number
}

function lerpBuffers(
  current: Float32Array,
  target: Float32Array,
  factor: number,
) {
  const n = Math.min(current.length, target.length)
  for (let i = 0; i < n; i++) {
    current[i] += (target[i] - current[i]) * factor
  }
}

function cubicEaseOut(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return 1 - Math.pow(1 - x, 3)
}

export function NeuralOrb({
  reducedMotion,
  lowPower,
  nodeCountOverride,
}: NeuralOrbProps) {
  const { morphShape } = useSceneControls()
  const compact = useMediaQuery('(max-width: 640px)')
  const desktop = useMediaQuery('(min-width: 1024px)')
  const invalidate = useThree((s) => s.invalidate)
  const { camera, size, gl } = useThree()
  // Hover tracking active as soon as the canvas mounts (no click / intro gate)
  const pointer = usePointerNDC(!reducedMotion && !lowPower)

  const nodeCount =
    nodeCountOverride ?? (lowPower || compact ? 100 : 260)
  const layouts = useOrbLayouts(nodeCount, RADIUS)
  const neighborK = lowPower || compact ? 4 : 6

  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const projected = useRef(new THREE.Vector3())
  const hoverRef = useRef<OrbHoverState>({ amount: 0, x: 0, y: 0 })

  const edgePairs = useMemo(
    () => buildNeighborEdgeIndices(layouts.sphere, neighborK),
    [layouts.sphere, neighborK],
  )

  const currentPositions = useRef<Float32Array>(layouts.sphere.slice())
  const targetPositions = useRef<Float32Array>(layouts.sphere.slice())
  const startPositions = useRef<Float32Array>(layouts.sphere.slice())
  const edgeBuffer = useRef<Float32Array>(
    new Float32Array((edgePairs.length / 2) * 6),
  )
  const edgeColorBuffer = useRef<Float32Array>(
    new Float32Array((edgePairs.length / 2) * 6),
  )
  /** Scratch for line segments while GPU-morphing sphere ↔ grid */
  const morphScratch = useRef<Float32Array>(layouts.sphere.slice())

  const live = useRef({
    spinY: 0,
    posX: 0,
    posY: 0.05,
    posZ: 0,
    scale: ORB_BASE_SCALE,
    opacity: 0.5,
    targetPosX: 0,
    targetPosY: 0.05,
    targetPosZ: 0,
    targetScale: 1,
    targetOpacity: 0.5,
    tiltX: 0.15,
    targetTiltX: 0.15,
    spinMultiplier: 1,
    mouseTiltX: 0,
    mouseTiltY: 0,
    hoverAmount: 0,
    // Assembled + ambient on mount — no intro / click gate
    convergeProgress: 1,
    convergeElapsed: 0,
    convergeStarted: true,
    convergeDone: true,
    lineOpacity: 1,
    depthBoost: 0,
    morph: 0,
    targetMorph: 0,
  })

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(layouts.sphere.slice(), 3),
    )
    geo.setAttribute(
      'aPositionB',
      new THREE.BufferAttribute(layouts.grid.slice(), 3),
    )
    return geo
  }, [layouts])

  const pointsMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uSize: { value: lowPower ? 16 : 13 },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        uMorph: { value: 0 },
        uAttenuation: { value: 2.8 },
        uColor: { value: GOLD.clone() },
        uOpacity: { value: 0.85 },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
    })
  }, [gl, lowPower])

  const linesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posBuf = new Float32Array((edgePairs.length / 2) * 6)
    const colBuf = new Float32Array((edgePairs.length / 2) * 6)
    writeEdgePositionsAndColors(
      edgePairs,
      layouts.sphere,
      posBuf,
      colBuf,
    )
    geo.setAttribute('position', new THREE.BufferAttribute(posBuf, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colBuf, 3))
    return geo
  }, [edgePairs, layouts])

  useEffect(() => {
    return () => {
      pointsMat.dispose()
    }
  }, [pointsMat])

  useEffect(() => {
    currentPositions.current = layouts.sphere.slice()
    startPositions.current = layouts.sphere.slice()
    targetPositions.current = layouts.sphere.slice()
    edgeBuffer.current = new Float32Array((edgePairs.length / 2) * 6)
    edgeColorBuffer.current = new Float32Array((edgePairs.length / 2) * 6)
    morphScratch.current = layouts.sphere.slice()
    writeEdgePositionsAndColors(
      edgePairs,
      currentPositions.current,
      edgeBuffer.current,
      edgeColorBuffer.current,
    )

    const pos = pointsGeo.getAttribute('position') as THREE.BufferAttribute
    pos.copyArray(currentPositions.current)
    pos.needsUpdate = true
    const shapeB = pointsGeo.getAttribute('aPositionB') as THREE.BufferAttribute
    shapeB.copyArray(layouts.grid)
    shapeB.needsUpdate = true
    const edge = linesGeo.getAttribute('position') as THREE.BufferAttribute
    edge.copyArray(edgeBuffer.current)
    edge.needsUpdate = true
    const col = linesGeo.getAttribute('color') as THREE.BufferAttribute
    col.copyArray(edgeColorBuffer.current)
    col.needsUpdate = true

    live.current.convergeProgress = 1
    live.current.convergeDone = true
    live.current.convergeStarted = true
    live.current.lineOpacity = 1
    invalidate()
  }, [pointsGeo, linesGeo, layouts, edgePairs, invalidate])

  // Command palette morph override → GPU uMorph target
  useEffect(() => {
    if (morphShape === 'sphere') {
      live.current.targetMorph = 0
      // Anchor Shape A on the sphere layout so GPU mix is clean
      currentPositions.current.set(layouts.sphere)
      targetPositions.current.set(layouts.sphere)
    } else if (morphShape === 'grid') {
      live.current.targetMorph = 1
      currentPositions.current.set(layouts.sphere)
      targetPositions.current.set(layouts.sphere)
    } else {
      live.current.targetMorph = 0
      live.current.morph = 0
    }
    invalidate()
  }, [morphShape, layouts, invalidate])

  useFrame((_, delta) => {
    if (reducedMotion) {
      return
    }

    const state = live.current
    const { sectionProgress } = scrollProgressRef.current
    const dominant = pickDominantSection(sectionProgress)
    const simplifyMorph = lowPower
    const forcedMorph = morphShape !== 'auto'
    const dt = Math.min(delta, 0.05)
    const count = nodeCount
    const delays = layouts.delays
    const start = startPositions.current
    const final = layouts.sphere
    const current = currentPositions.current
    const heroDesktop = desktop && !compact
    const ptr = pointer.current
    const orbAnchor = sceneRuntimeRef.orbAnchor

    // GPU morph toward Shape A/B when command palette overrides scroll morph
    state.morph += (state.targetMorph - state.morph) * MORPH_LERP
    if (Math.abs(state.morph - state.targetMorph) < 0.001) {
      state.morph = state.targetMorph
    }
    pointsMat.uniforms.uMorph.value = state.morph
    pointsMat.uniforms.uPixelRatio.value = Math.min(gl.getPixelRatio(), 2)

    if (forcedMorph) {
      // Idle staging while holding a forced shape
      state.targetPosX = heroDesktop ? 1.55 : 0
      state.targetPosY = 0.05
      state.targetPosZ = heroDesktop ? -1.0 : -0.35
      state.targetScale = compact ? 0.78 : heroDesktop ? 1.1 : 0.95
      state.targetOpacity = 0.48
      state.targetTiltX = 0.12
      state.spinMultiplier = 0.9
      state.lineOpacity = 1 - state.morph * 0.35
      // Keep CPU positions on sphere; shader mixes toward grid
      current.set(layouts.sphere)
    } else if (
      state.convergeStarted &&
      !state.convergeDone &&
      (dominant.key === 'hero' || dominant.amount < 0.25)
    ) {
      state.convergeElapsed += dt
      let easedSum = 0

      for (let i = 0; i < count; i++) {
        const localT = Math.min(
          1,
          Math.max(
            0,
            (state.convergeElapsed - delays[i]) / CONVERGE_DURATION_S,
          ),
        )
        const eased = cubicEaseOut(localT)
        easedSum += eased

        const i3 = i * 3
        current[i3] = start[i3] + (final[i3] - start[i3]) * eased
        current[i3 + 1] =
          start[i3 + 1] + (final[i3 + 1] - start[i3 + 1]) * eased
        current[i3 + 2] =
          start[i3 + 2] + (final[i3 + 2] - start[i3 + 2]) * eased
      }

      state.convergeProgress = easedSum / count
      state.lineOpacity = THREE.MathUtils.smoothstep(
        state.convergeProgress,
        0.7,
        1,
      )

      if (state.convergeProgress >= 0.999) {
        state.convergeDone = true
        state.convergeProgress = 1
        state.lineOpacity = 1
        current.set(final)
        targetPositions.current.set(final)
      }

      state.targetPosX = heroDesktop ? 2 : 0
      state.targetPosY = 0
      state.targetPosZ = heroDesktop ? -1.35 : -0.35
      state.targetScale = compact ? 0.8 : heroDesktop ? 1.18 : 0.92
      state.targetOpacity = 0.5
      state.targetTiltX = 0.12
      state.spinMultiplier = 1
    } else if (simplifyMorph) {
      targetPositions.current.set(layouts.sphere)
      state.targetPosX = heroDesktop ? 1.4 : 0
      state.targetPosY = 0.05
      state.targetPosZ = heroDesktop ? -0.9 : 0
      state.targetScale = compact ? 0.78 : 0.95
      state.targetOpacity = 0.42
      state.targetTiltX = 0.12
      state.spinMultiplier = 1
      state.lineOpacity = 1
      lerpBuffers(current, targetPositions.current, LERP)
    } else {
      state.lineOpacity = 1
      switch (dominant.key) {
        case 'projects':
          targetPositions.current.set(layouts.clusters)
          state.targetPosX = 1.55
          state.targetPosY = 0.15
          state.targetPosZ = -0.4
          state.targetScale = 0.95
          state.targetOpacity = 0.28
          state.targetTiltX = 0.08
          state.spinMultiplier = 0.75
          break
        case 'skills':
          targetPositions.current.set(layouts.grid)
          state.targetPosX = 1.35
          state.targetPosY = 0
          state.targetPosZ = -0.35
          state.targetScale = 0.82
          state.targetOpacity = 0.32
          state.targetTiltX = 0
          state.spinMultiplier = 0.65
          break
        case 'about':
          targetPositions.current.set(layouts.sphere)
          state.targetPosX = 1.45
          state.targetPosY = 0.12
          state.targetPosZ = -0.55
          state.targetScale = 0.88
          state.targetOpacity = 0.34
          state.targetTiltX = 0.22
          state.spinMultiplier = 1.12
          break
        case 'resume':
          targetPositions.current.set(layouts.helix)
          state.targetPosX = 1.4
          state.targetPosY = 0.05
          state.targetPosZ = -0.45
          state.targetScale = 0.88
          state.targetOpacity = 0.3
          state.targetTiltX = 0.08
          state.spinMultiplier = 0.75
          break
        case 'contact':
          targetPositions.current.set(layouts.ring)
          state.targetPosX = 0
          state.targetPosY = -0.08
          state.targetPosZ = -0.6
          state.targetScale = 0.72
          state.targetOpacity = 0.18
          state.targetTiltX = 0.06
          state.spinMultiplier = 0.55
          break
        case 'hero':
        default:
          targetPositions.current.set(layouts.sphere)
          state.targetPosX = heroDesktop ? 2 : 0
          state.targetPosY = 0
          state.targetPosZ = heroDesktop ? -1.45 : -0.4
          state.targetScale = compact ? 0.82 : heroDesktop ? 1.22 : 0.95
          state.targetOpacity = heroDesktop ? 0.52 : 0.48
          state.targetTiltX = 0.12
          state.spinMultiplier = 1
          break
      }
      lerpBuffers(current, targetPositions.current, LERP)
    }

    // Preloader lock — center behind card during boot; slide to x:2 on exit
    if (orbAnchor.locked) {
      state.targetPosX = orbAnchor.x
      state.targetPosY = orbAnchor.y
      state.targetPosZ = orbAnchor.z
      state.targetScale = compact ? 0.86 : 1.08
      state.targetOpacity = 0.55
      state.targetTiltX = 0.08
      state.spinMultiplier = 1
      if (orbAnchor.snap) {
        state.posX = orbAnchor.x
        state.posY = orbAnchor.y
        state.posZ = orbAnchor.z
        orbAnchor.snap = false
      }
    }

    // —— Mouse follow / tilt + proximity hover (document pointer, canvas is pe:none) ——
    let targetHover = 0
    if (ptr.active && groupRef.current && !orbAnchor.locked) {
      projected.current.set(state.posX, state.posY, state.posZ)
      projected.current.project(camera)
      const dx = ptr.x - projected.current.x
      const dy = ptr.y - projected.current.y
      const dist = Math.hypot(dx, dy)
      targetHover = THREE.MathUtils.clamp(1 - dist / HOVER_RADIUS_NDC, 0, 1)

      // Stronger tilt when near the orb; still follows softly at distance
      const follow = 0.35 + targetHover * 0.65
      const aimTiltX = ptr.y * TILT_FOLLOW_X * follow
      const aimTiltY = ptr.x * TILT_FOLLOW_Y * follow
      state.mouseTiltX += (aimTiltX - state.mouseTiltX) * MOUSE_TILT_LERP
      state.mouseTiltY += (aimTiltY - state.mouseTiltY) * MOUSE_TILT_LERP
    } else {
      state.mouseTiltX += (0 - state.mouseTiltX) * MOUSE_TILT_LERP
      state.mouseTiltY += (0 - state.mouseTiltY) * MOUSE_TILT_LERP
    }
    state.hoverAmount += (targetHover - state.hoverAmount) * MOUSE_TILT_LERP

    hoverRef.current.amount = state.hoverAmount
    hoverRef.current.x = ptr.active ? ptr.x : hoverRef.current.x * 0.92
    hoverRef.current.y = ptr.active ? ptr.y : hoverRef.current.y * 0.92

    const hoverSpin = 1 + state.hoverAmount * 0.45
    const hoverScale = 1 + state.hoverAmount * HOVER_SCALE_BOOST
    const audio = sceneRuntimeRef.audio
    const audioSpin = audio.enabled ? 1 + audio.bass * 0.35 : 1
    const audioScale = audio.enabled
      ? 1 + audio.bass * 0.05 + audio.level * 0.03
      : 1

    const posLerp = orbAnchor.locked ? orbAnchor.lerp : LERP
    // Continuous idle spin from first frame — not gated by scroll or hover
    state.spinY +=
      IDLE_SPIN_PER_FRAME * state.spinMultiplier * hoverSpin * audioSpin
    state.tiltX += (state.targetTiltX - state.tiltX) * LERP
    state.posX += (state.targetPosX - state.posX) * posLerp
    state.posY += (state.targetPosY - state.posY) * posLerp
    state.posZ += (state.targetPosZ - state.posZ) * posLerp
    state.scale +=
      (state.targetScale * ORB_BASE_SCALE * hoverScale * audioScale -
        state.scale) *
      LERP
    state.opacity += (state.targetOpacity - state.opacity) * LERP
    state.depthBoost = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(state.spinY * 0.85))

    if (pointsMat.uniforms.uSize) {
      const baseSize = lowPower ? 16 : 13
      pointsMat.uniforms.uSize.value =
        baseSize *
        (1 +
          (audio.enabled ? audio.treble * 0.35 : 0) +
          state.hoverAmount * 0.2)
    }

    const group = groupRef.current
    if (group) {
      group.rotation.x = state.tiltX + state.mouseTiltX
      group.rotation.y = state.spinY + state.mouseTiltY * 0.35
      group.rotation.z = state.mouseTiltY * 0.12
      group.position.set(state.posX, state.posY, state.posZ)
      group.scale.setScalar(state.scale)
    }

    void size.width

    // Mixed positions for line segments when GPU morph is active
    let linePositions: Float32Array = current
    if (forcedMorph && state.morph > 0.001) {
      const grid = layouts.grid
      const scratch = morphScratch.current
      const m = state.morph
      for (let i = 0; i < current.length; i++) {
        scratch[i] = current[i] + (grid[i] - current[i]) * m
      }
      linePositions = scratch
    }

    const posAttr = pointsRef.current?.geometry.getAttribute('position')
    if (posAttr) {
      // Shader mixes position ↔ aPositionB; keep position on sphere when forced
      ;(posAttr.array as Float32Array).set(
        forcedMorph ? layouts.sphere : current,
      )
      posAttr.needsUpdate = true
    }

    writeEdgePositionsAndColors(
      edgePairs,
      linePositions,
      edgeBuffer.current,
      edgeColorBuffer.current,
      state.depthBoost,
    )
    const lineAttr = linesRef.current?.geometry.getAttribute('position')
    if (lineAttr) {
      ;(lineAttr.array as Float32Array).set(edgeBuffer.current)
      lineAttr.needsUpdate = true
    }
    const colorAttr = linesRef.current?.geometry.getAttribute('color')
    if (colorAttr) {
      ;(colorAttr.array as Float32Array).set(edgeColorBuffer.current)
      colorAttr.needsUpdate = true
    }

    pointsMat.uniforms.uOpacity.value = Math.min(0.92, state.opacity + 0.3)

    const lineMat = linesRef.current?.material
    if (lineMat && !Array.isArray(lineMat)) {
      ;(lineMat as THREE.LineBasicMaterial).opacity = state.lineOpacity
    }
  })

  useEffect(() => {
    if (!reducedMotion) return
    const group = groupRef.current
    if (group) {
      group.rotation.x = 0.12
      group.rotation.y = 0.35
      group.position.set(desktop ? 1.6 : 0, 0.05, desktop ? -1.2 : 0)
      group.scale.setScalar(
        (compact ? 0.78 : desktop ? 1.05 : 0.92) * ORB_BASE_SCALE,
      )
    }
    pointsMat.uniforms.uOpacity.value = 0.55
    pointsMat.uniforms.uMorph.value =
      morphShape === 'grid' ? 1 : morphShape === 'sphere' ? 0 : 0
    const lineMat = linesRef.current?.material
    if (lineMat && !Array.isArray(lineMat)) {
      ;(lineMat as THREE.LineBasicMaterial).opacity = 0.85
    }
  }, [
    reducedMotion,
    compact,
    desktop,
    pointsGeo,
    linesGeo,
    pointsMat,
    morphShape,
  ])

  return (
    <group ref={groupRef}>
      <AmbientOrbDust visible={!lowPower && !reducedMotion} />
      <OrbHudRing visible={!lowPower} />
      <OrbCore visible={!lowPower} radius={1.38} />
      <DisplacedOrbShell
        visible={!lowPower}
        hoverRef={hoverRef}
      />
      <GeodesicWireShell
        visible={!lowPower}
        hoverRef={hoverRef}
        radius={1.6}
        detail={lowPower ? 2 : 3}
      />
      <points
        ref={pointsRef}
        geometry={pointsGeo}
        material={pointsMat}
        frustumCulled={false}
      />
      <lineSegments ref={linesRef} geometry={linesGeo} frustumCulled={false}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}
