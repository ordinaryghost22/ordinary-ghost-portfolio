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

export const LIGHTING_PRESETS: Record<LightingTheme, LightingPreset> = {
  void: {
    background: '#09090b',
    fogNear: 6.2,
    fogFar: 16,
    ambient: { intensity: 0.22, color: '#f5f4f0' },
    fill: {
      intensity: 0.18,
      color: '#8f8d86',
      position: [-2.6, -1.0, 2.2],
    },
    key: { intensity: 0.58, color: '#c6a15b' },
    orbitEnabled: true,
  },
  ember: {
    background: '#0a0705',
    fogNear: 5.5,
    fogFar: 14.5,
    ambient: { intensity: 0.16, color: '#f0e6d8' },
    fill: {
      intensity: 0.22,
      color: '#a8784a',
      position: [-2.2, -0.6, 2.0],
    },
    key: { intensity: 0.72, color: '#e0a050' },
    orbitEnabled: true,
  },
  fog: {
    background: '#08090a',
    fogNear: 5.8,
    fogFar: 15,
    ambient: { intensity: 0.3, color: '#d8dce0' },
    fill: {
      intensity: 0.28,
      color: '#9aa3ad',
      position: [-2.4, -0.8, 2.4],
    },
    key: { intensity: 0.48, color: '#c8d0d8' },
    orbitEnabled: true,
  },
  studio: {
    background: '#0c0c0b',
    fogNear: 7.5,
    fogFar: 18,
    ambient: { intensity: 0.42, color: '#f5f4f0' },
    fill: {
      intensity: 0.35,
      color: '#b8b5ae',
      position: [-2.8, 0.4, 2.6],
    },
    key: { intensity: 0.4, color: '#c6a15b' },
    orbitEnabled: false,
  },
}
