/**
 * Tweakable shell shader params — edit here without hunting through GLSL.
 */
export const ORB_SHELL_PARAMS = {
  /** Soft fresnel underlayer — sits under geodesic wire */
  radius: 1.55,
  noiseScale: 1.7,
  noiseSpeed: 0.24,
  /** Stronger undulation so silhouette matches the wavy reference */
  noiseIntensity: 0.12,
  /** Hover surface ripple strength */
  mouseRippleIntensity: 0.11,
  mouseRippleFrequency: 11,
  mouseRippleRadius: 0.92,
  fresnelPower: 2.35,
  fresnelIntensity: 0.95,
  fillOpacity: 0.028,
  color: '#C6A15B',
} as const

/**
 * Uniform display scale for the full NeuralOrb group (core + shells + points).
 * ~0.70 ≈ 15–20% smaller than prior 0.85 — fits the right hero column cleanly.
 */
export const ORB_BASE_SCALE = 0.7

/**
 * Post-processing pipeline knobs for SceneCanvas.
 * Tuned for gold wireframe neon bloom + anamorphic framing.
 */
export const POST_FX_PARAMS = {
  bloom: {
    intensity: 0.8,
    luminanceThreshold: 0.2,
    luminanceSmoothing: 0.4,
    radius: 0.68,
  },
  vignette: {
    offset: 0.22,
    darkness: 0.72,
  },
  /** Base anamorphic fringe (extra kick during camera entrance) */
  chromaticAberration: {
    x: 0.0009,
    y: 0.00045,
  },
  grainOpacity: 0.08,
} as const
