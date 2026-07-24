import { createContext } from 'react'

export type PerformanceMode = 'auto' | 'low' | 'high'

/** Canvas lighting looks — brand-safe, no purple defaults */
export type LightingTheme = 'void' | 'ember' | 'fog' | 'studio'

/**
 * Particle morph target.
 * `auto` follows scroll sections; `sphere` / `grid` force Shape A / Shape B.
 */
export type MorphShape = 'auto' | 'sphere' | 'grid'

export const LIGHTING_THEMES: LightingTheme[] = [
  'void',
  'ember',
  'fog',
  'studio',
]

export const LIGHTING_THEME_LABELS: Record<LightingTheme, string> = {
  void: 'Void Gold',
  ember: 'Ember Warm',
  fog: 'Fog Silver',
  studio: 'Studio Soft',
}

export type SceneControlsContextValue = {
  performanceMode: PerformanceMode
  setPerformanceMode: (mode: PerformanceMode) => void
  /**
   * Flip between full glow orb (high) and light / low-power.
   * Default is high — low-power is always a manual choice.
   */
  togglePerformanceMode: () => void

  lightingTheme: LightingTheme
  setLightingTheme: (theme: LightingTheme) => void
  cycleLightingTheme: () => void

  morphShape: MorphShape
  setMorphShape: (shape: MorphShape) => void
  /** Toggle Shape A (sphere) ↔ Shape B (cube grid) */
  toggleMorphShape: () => void

  /**
   * Set by the canvas FPS monitor when frames stall.
   * Only applied while performanceMode === 'auto'.
   */
  fpsForcedLow: boolean
  setFpsForcedLow: (low: boolean) => void
}

export const SceneControlsContext =
  createContext<SceneControlsContextValue | null>(null)
