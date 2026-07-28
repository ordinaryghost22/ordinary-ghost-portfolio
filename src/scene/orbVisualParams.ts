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
  color: '#E4E4E7',
} as const

/**
 * Uniform display scale for the full NeuralOrb group (core + shells + points).
 * ~0.70 ≈ 15–20% smaller than prior 0.85 — fits the right hero column cleanly.
 */
export const ORB_BASE_SCALE = 0.7

/**
 * Post-processing pipeline knobs for SceneCanvas.
 * Tuned for silver wireframe + restrained bloom (no neon).
 */
export const POST_FX_PARAMS = {
  bloom: {
    intensity: 0.35,
    luminanceThreshold: 0.35,
    luminanceSmoothing: 0.5,
    radius: 0.55,
  },
  vignette: {
    offset: 0.22,
    darkness: 0.72,
  },
  /** Base anamorphic fringe (extra kick during camera entrance) */
  chromaticAberration: {
    x: 0.0005,
    y: 0.00025,
  },
  grainOpacity: 0.04,
} as const
