import { useMemo } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSceneControls } from '@/hooks/useSceneControls'

function isMobileUserAgent() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
}

function hasLowGpuHints() {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    deviceMemory?: number
    hardwareConcurrency?: number
  }
  const lowMem =
    typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4
  const lowCpu =
    typeof nav.hardwareConcurrency === 'number' &&
    nav.hardwareConcurrency > 0 &&
    nav.hardwareConcurrency <= 4
  return lowMem || lowCpu
}

/**
 * Resolved low-power gate.
 * Full glow orb is the default (`high`). Auto heuristics only apply when
 * performanceMode is explicitly `'auto'`. Manual `'low'` opts into the light version.
 */
export function useEffectiveLowPower() {
  const { performanceMode, fpsForcedLow } = useSceneControls()
  const coarse = useMediaQuery('(pointer: coarse)')
  const mobile = useMemo(() => isMobileUserAgent(), [])
  const lowHw = useMemo(() => hasLowGpuHints(), [])

  return useMemo(() => {
    if (performanceMode === 'low') return true
    if (performanceMode === 'high') return false
    // Explicit auto only — never the default path
    return coarse || mobile || lowHw || fpsForcedLow
  }, [performanceMode, coarse, mobile, lowHw, fpsForcedLow])
}

export function useDeviceLowPowerHints() {
  const coarse = useMediaQuery('(pointer: coarse)')
  const mobile = useMemo(() => isMobileUserAgent(), [])
  const lowHw = useMemo(() => hasLowGpuHints(), [])
  return coarse || mobile || lowHw
}
