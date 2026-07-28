import type { LightingTheme } from '@/context/scene-controls-context'

export type LightingPreset = {
  background: string
  fogNear: number
  fogFar: number
  ambient: { intensity: number; color: string }
  fill: { intensity: number; color: string; position: [number, number, number] }
  key: { intensity: number; color: string }
  orbitEnabled: boolean
}

/** Monochrome night-OS lighting — silver key, no gold */
export const LIGHTING_PRESETS: Record<LightingTheme, LightingPreset> = {
  void: {
    background: '#0A0B0E',
    fogNear: 6.2,
    fogFar: 16,
    ambient: { intensity: 0.22, color: '#FAFAFA' },
    fill: {
      intensity: 0.16,
      color: '#A1A1AA',
      position: [-2.6, -1.0, 2.2],
    },
    key: { intensity: 0.52, color: '#E4E4E7' },
    orbitEnabled: true,
  },
  ember: {
    background: '#0A0B0E',
    fogNear: 5.5,
    fogFar: 14.5,
    ambient: { intensity: 0.18, color: '#F4F4F5' },
    fill: {
      intensity: 0.2,
      color: '#A1A1AA',
      position: [-2.2, -0.6, 2.0],
    },
    key: { intensity: 0.62, color: '#D4D4D8' },
    orbitEnabled: true,
  },
  fog: {
    background: '#0A0B0E',
    fogNear: 5.8,
    fogFar: 15,
    ambient: { intensity: 0.28, color: '#E4E4E7' },
    fill: {
      intensity: 0.24,
      color: '#A1A1AA',
      position: [-2.4, -0.8, 2.4],
    },
    key: { intensity: 0.44, color: '#FAFAFA' },
    orbitEnabled: true,
  },
  studio: {
    background: '#0A0B0E',
    fogNear: 7.5,
    fogFar: 18,
    ambient: { intensity: 0.4, color: '#FAFAFA' },
    fill: {
      intensity: 0.32,
      color: '#A1A1AA',
      position: [-2.8, 0.4, 2.6],
    },
    key: { intensity: 0.38, color: '#E4E4E7' },
    orbitEnabled: false,
  },
}
