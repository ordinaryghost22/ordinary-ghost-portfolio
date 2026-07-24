import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'

import { useDeviceLowPowerHints } from '@/hooks/useEffectiveLowPower'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSceneControls } from '@/hooks/useSceneControls'
import {
  adaptivePerformanceRef,
  resolvePerformanceTier,
} from '@/scene/adaptivePerformance'

const ENTER_MS = 22.5
const EXIT_MS = 17.5
const ENTER_FRAMES = 40
const EXIT_FRAMES = 90

/**
 * Monitors frame delta, scales DPR, and reports FPS pressure to SceneControls.
 * Keeps the canvas near a locked ~60 FPS on weak GPUs / mobile.
 */
export function AdaptivePerformanceController() {
  const { gl } = useThree()
  const { performanceMode, setFpsForcedLow, fpsForcedLow } = useSceneControls()
  const deviceLow = useDeviceLowPowerHints()
  const compact = useMediaQuery('(max-width: 640px)')

  const badStreak = useRef(0)
  const goodStreak = useRef(0)
  const smoothedMs = useRef(16.7)

  useEffect(() => {
    const state = resolvePerformanceTier({
      performanceMode,
      deviceLow,
      fpsLow: fpsForcedLow,
      compact: !!compact,
    })
    const next = Math.min(window.devicePixelRatio || 1, state.dprCap)
    gl.setPixelRatio(next)
  }, [performanceMode, deviceLow, fpsForcedLow, compact, gl])

  useFrame((_, delta) => {
    const ms = Math.min(delta * 1000, 50)
    smoothedMs.current += (ms - smoothedMs.current) * 0.12
    adaptivePerformanceRef.frameMs = smoothedMs.current

    if (performanceMode !== 'auto') {
      badStreak.current = 0
      goodStreak.current = 0
      return
    }

    if (smoothedMs.current > ENTER_MS) {
      badStreak.current += 1
      goodStreak.current = 0
      if (!fpsForcedLow && badStreak.current >= ENTER_FRAMES) {
        setFpsForcedLow(true)
      }
    } else if (smoothedMs.current < EXIT_MS) {
      goodStreak.current += 1
      badStreak.current = 0
      if (fpsForcedLow && goodStreak.current >= EXIT_FRAMES) {
        setFpsForcedLow(false)
      }
    } else {
      badStreak.current = 0
      goodStreak.current = 0
    }
  })

  return null
}
