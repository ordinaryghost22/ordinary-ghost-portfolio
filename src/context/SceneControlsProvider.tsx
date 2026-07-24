import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  LIGHTING_THEMES,
  SceneControlsContext,
  type LightingTheme,
  type MorphShape,
  type PerformanceMode,
  type SceneControlsContextValue,
} from '@/context/scene-controls-context'
import { disposeUiSounds } from '@/lib/uiSounds'

export function SceneControlsProvider({ children }: { children: ReactNode }) {
  const [performanceMode, setPerformanceMode] =
    useState<PerformanceMode>('high')
  const [lightingTheme, setLightingTheme] = useState<LightingTheme>('void')
  const [morphShape, setMorphShape] = useState<MorphShape>('auto')
  const [fpsForcedLow, setFpsForcedLow] = useState(false)

  const togglePerformanceMode = useCallback(() => {
    // Manual only: full glow orb (high) ↔ light / low-power. Never lands on auto.
    setPerformanceMode((prev) => (prev === 'low' ? 'high' : 'low'))
  }, [])

  const cycleLightingTheme = useCallback(() => {
    setLightingTheme((prev) => {
      const i = LIGHTING_THEMES.indexOf(prev)
      return LIGHTING_THEMES[(i + 1) % LIGHTING_THEMES.length]
    })
  }, [])

  const toggleMorphShape = useCallback(() => {
    setMorphShape((prev) => {
      if (prev === 'sphere') return 'grid'
      if (prev === 'grid') return 'sphere'
      return 'grid'
    })
  }, [])

  // Manual high/low clears FPS pressure latch
  useEffect(() => {
    if (performanceMode !== 'auto') {
      setFpsForcedLow(false)
    }
  }, [performanceMode])

  useEffect(() => {
    return () => {
      disposeUiSounds()
    }
  }, [])

  const value = useMemo<SceneControlsContextValue>(
    () => ({
      performanceMode,
      setPerformanceMode,
      togglePerformanceMode,
      lightingTheme,
      setLightingTheme,
      cycleLightingTheme,
      morphShape,
      setMorphShape,
      toggleMorphShape,
      fpsForcedLow,
      setFpsForcedLow,
    }),
    [
      performanceMode,
      togglePerformanceMode,
      lightingTheme,
      cycleLightingTheme,
      morphShape,
      toggleMorphShape,
      fpsForcedLow,
    ],
  )

  return (
    <SceneControlsContext.Provider value={value}>
      {children}
    </SceneControlsContext.Provider>
  )
}
