import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { sceneRuntimeRef } from '@/scene/sceneRuntime'

const DUST_COUNT = 180

type AmbientOrbDustProps = {
  /** Inner / outer radius of the dust shell around the orb */
  innerRadius?: number
  outerRadius?: number
  visible?: boolean
}

/**
 * Lightweight golden/white dust field — single Points draw call (~180 verts).
 */
export function AmbientOrbDust({
  innerRadius = 2.15,
  outerRadius = 3.65,
  visible = true,
}: AmbientOrbDustProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const phase = useRef(0)

  const { geometry, base } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3)
    const colors = new Float32Array(DUST_COUNT * 3)
    const seeds = new Float32Array(DUST_COUNT)
    const gold = new THREE.Color('#E4E4E7')
    const white = new THREE.Color('#f5f4f0')

    for (let i = 0; i < DUST_COUNT; i++) {
      const i3 = i * 3
      const u = Math.random()
      const v = Math.random()
      const theta = u * Math.PI * 2
      const phi = Math.acos(2 * v - 1)
      const r = innerRadius + Math.random() * (outerRadius - innerRadius)
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)

      const c = gold.clone().lerp(white, Math.random() * 0.55)
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
      seeds[i] = Math.random() * Math.PI * 2
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return { geometry: geo, base: { positions: positions.slice(), seeds } }
  }, [innerRadius, outerRadius])

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.028,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    const pts = pointsRef.current
    if (!pts) return
    const speed = sceneRuntimeRef.orbFx.particleSpeed
    phase.current += delta * 0.22 * speed
    const attr = pts.geometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    const { positions, seeds } = base
    const t = phase.current
    const amp = 0.045 * (0.85 + speed * 0.35)

    for (let i = 0; i < DUST_COUNT; i++) {
      const i3 = i * 3
      const s = seeds[i]
      arr[i3] = positions[i3] + Math.sin(t + s) * amp
      arr[i3 + 1] = positions[i3 + 1] + Math.cos(t * 0.85 + s) * amp * 1.3
      arr[i3 + 2] = positions[i3 + 2] + Math.sin(t * 0.7 + s * 1.3) * amp * 0.9
    }
    attr.needsUpdate = true
    pts.rotation.y += delta * 0.04 * speed
  })

  if (!visible) return null

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-1}
    />
  )
}
