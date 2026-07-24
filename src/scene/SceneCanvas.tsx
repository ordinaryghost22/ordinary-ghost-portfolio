import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import {
  useEffectiveLowPower,
} from '@/hooks/useEffectiveLowPower'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSceneControls } from '@/hooks/useSceneControls'
import { AdaptivePerformanceController } from '@/scene/AdaptivePerformanceController'
import { resolvePerformanceTier } from '@/scene/adaptivePerformance'
import { CameraEntranceController } from '@/scene/CameraEntranceController'
import { CameraWarpController } from '@/scene/CameraWarpController'
import { LIGHTING_PRESETS } from '@/scene/lightingThemes'
import { NeuralOrb } from '@/scene/NeuralOrb'
import { OrbitingPointLight } from '@/scene/OrbitingPointLight'
import { POST_FX_PARAMS } from '@/scene/orbVisualParams'
import { CAMERA_HOME, sceneRuntimeRef } from '@/scene/sceneRuntime'
import { cn } from '@/lib/utils'

function SceneLighting({
  reducedMotion,
  lowPower,
}: {
  reducedMotion: boolean
  lowPower: boolean
}) {
  const { lightingTheme } = useSceneControls()
  const preset = LIGHTING_PRESETS[lightingTheme]

  return (
    <>
      <ambientLight
        intensity={preset.ambient.intensity}
        color={preset.ambient.color}
      />
      <pointLight
        position={preset.fill.position}
        intensity={preset.fill.intensity}
        color={preset.fill.color}
        distance={12}
        decay={2}
      />
      <OrbitingPointLight
        enabled={!reducedMotion && !lowPower && preset.orbitEnabled}
        intensity={preset.key.intensity}
        radius={3.5}
        speed={0.32}
        color={preset.key.color}
      />
      {(reducedMotion || lowPower || !preset.orbitEnabled) && (
        <pointLight
          position={[2.4, 1.8, 3.2]}
          intensity={preset.key.intensity * (preset.orbitEnabled ? 0.86 : 1)}
          color={preset.key.color}
          distance={14}
          decay={2}
        />
      )}
      <fog
        attach="fog"
        args={[preset.background, preset.fogNear, preset.fogFar]}
      />
    </>
  )
}

function PremiumEffects({ enabled }: { enabled: boolean }) {
  const offset = useRef(new THREE.Vector2(0, 0))
  const bloomRef = useRef<{ intensity: number } | null>(null)

  useFrame(() => {
    const blur = sceneRuntimeRef.cameraEntrance.blur
    const base = POST_FX_PARAMS.chromaticAberration
    offset.current.set(
      base.x + blur * 0.0028,
      base.y + blur * 0.0012,
    )
    if (bloomRef.current) {
      const boost = sceneRuntimeRef.orbFx.bloomBoost
      bloomRef.current.intensity =
        POST_FX_PARAMS.bloom.intensity * (1 + boost * 0.85)
    }
  })

  if (!enabled) return null

  const { bloom, vignette, grainOpacity } = POST_FX_PARAMS

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        ref={bloomRef as never}
        intensity={bloom.intensity}
        luminanceThreshold={bloom.luminanceThreshold}
        luminanceSmoothing={bloom.luminanceSmoothing}
        mipmapBlur
        radius={bloom.radius}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset.current}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        offset={vignette.offset}
        darkness={vignette.darkness}
        eskil={false}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={grainOpacity}
      />
    </EffectComposer>
  )
}

function FrameloopGate({ reducedMotion }: { reducedMotion: boolean }) {
  const set = useThree((s) => s.set)
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    if (reducedMotion) {
      set({ frameloop: 'demand' })
      invalidate()
    } else {
      set({ frameloop: 'always' })
    }
  }, [reducedMotion, set, invalidate])

  return null
}

function SceneBackground() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    scene.background = null
    gl.setClearColor(0x000000, 0)
  }, [gl, scene])

  return null
}

function SceneContent() {
  const { performanceMode, fpsForcedLow } = useSceneControls()
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  )
  const compact = useMediaQuery('(max-width: 640px)')
  const lowPower = useEffectiveLowPower()
  const reducedMotion = !!prefersReducedMotion

  const tierState = useMemo(
    () =>
      resolvePerformanceTier({
        performanceMode,
        deviceLow: false,
        fpsLow: fpsForcedLow,
        compact: !!compact,
      }),
    [performanceMode, fpsForcedLow, compact],
  )

  const effectsOn = !reducedMotion && !lowPower

  return (
    <>
      <SceneBackground />
      <FrameloopGate reducedMotion={reducedMotion} />
      <AdaptivePerformanceController />
      <CameraEntranceController reducedMotion={reducedMotion} />
      <CameraWarpController reducedMotion={reducedMotion} />
      <SceneLighting reducedMotion={reducedMotion} lowPower={lowPower} />
      <NeuralOrb
        reducedMotion={reducedMotion}
        lowPower={lowPower}
        nodeCountOverride={tierState.nodeCount}
      />
      <PremiumEffects enabled={effectsOn} />
    </>
  )
}

/**
 * Persistent fixed WebGL hero layer — mounts immediately at full opacity.
 * Above ambient grid (z-0), below UI (z-20).
 * Loaded client-side only via React.lazy (Vite equivalent of next/dynamic ssr:false).
 */
export function SceneCanvas() {
  const lowPowerHint = useEffectiveLowPower()
  const initialDpr: [number, number] = lowPowerHint ? [1, 1] : [1, 1.5]
  /** Always ready — no fade gate blocking first paint */
  const isLoaded = true

  return (
    <div
      aria-hidden
      data-loaded={isLoaded}
      className={cn(
        'pointer-events-none fixed inset-0 z-0 bg-transparent',
        // Dim orb so typography stays focal; stronger on sm+
        'opacity-40 sm:opacity-70',
        // Mobile (<768): compact centered orb under badge
        'max-md:inset-auto max-md:top-12 max-md:left-1/2 max-md:h-[280px] max-md:w-full max-md:max-w-[280px] max-md:-translate-x-1/2 max-md:touch-pan-y',
      )}
      style={{ pointerEvents: 'none', touchAction: 'pan-y' }}
    >
      <Canvas
        className="pointer-events-none h-full w-full bg-transparent"
        style={{ pointerEvents: 'none', touchAction: 'pan-y', background: 'transparent' }}
        dpr={initialDpr}
        gl={{
          antialias: !lowPowerHint,
          alpha: true,
          premultipliedAlpha: true,
          powerPreference: lowPowerHint ? 'low-power' : 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{
          // Always start at home so the orb is the visible centerpiece immediately
          position: CAMERA_HOME.position,
          fov: CAMERA_HOME.fov,
          near: 0.1,
          far: 1000,
        }}
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default SceneCanvas
