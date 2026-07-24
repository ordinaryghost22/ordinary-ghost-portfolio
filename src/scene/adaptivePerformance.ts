/**
 * Shared adaptive performance state — written by the canvas FPS monitor,
 * read by hooks / NeuralOrb without forcing React re-renders every frame.
 */

export type PerformanceTier = 'high' | 'medium' | 'low'

export type AdaptivePerformanceState = {
  /** Device / UA / memory heuristic */
  deviceLow: boolean
  /** Sustained low FPS forced the scene into low tier */
  fpsLow: boolean
  /** Resolved tier after overrides */
  tier: PerformanceTier
  /** Target device pixel ratio cap */
  dprCap: number
  /** Particle node budget */
  nodeCount: number
  /** Post-FX / glass / orbiting lights allowed */
  allowHeavyFx: boolean
  /** Rolling frame time ms (smoothed) */
  frameMs: number
}

export const adaptivePerformanceRef: AdaptivePerformanceState = {
  deviceLow: false,
  fpsLow: false,
  tier: 'high',
  dprCap: 1.5,
  nodeCount: 200,
  allowHeavyFx: true,
  frameMs: 16.7,
}

export function resolvePerformanceTier(input: {
  performanceMode: 'auto' | 'low' | 'high'
  deviceLow: boolean
  fpsLow: boolean
  compact: boolean
}): AdaptivePerformanceState {
  const { performanceMode, deviceLow, fpsLow, compact } = input

  let tier: PerformanceTier = 'high'
  if (performanceMode === 'low') {
    tier = 'low'
  } else if (performanceMode === 'high') {
    tier = 'high'
  } else if (deviceLow || fpsLow) {
    tier = 'low'
  } else if (compact) {
    tier = 'medium'
  }

  const dprCap = tier === 'low' ? 1 : tier === 'medium' ? 1.25 : 1.5
  const nodeCount =
    tier === 'low' ? 80 : tier === 'medium' || compact ? 140 : 260
  const allowHeavyFx = tier === 'high'

  adaptivePerformanceRef.deviceLow = deviceLow
  adaptivePerformanceRef.fpsLow = fpsLow
  adaptivePerformanceRef.tier = tier
  adaptivePerformanceRef.dprCap = dprCap
  adaptivePerformanceRef.nodeCount = nodeCount
  adaptivePerformanceRef.allowHeavyFx = allowHeavyFx

  return adaptivePerformanceRef
}
