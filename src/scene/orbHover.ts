/** Shared hover proximity + pointer NDC for orb shell shaders */
export type OrbHoverState = {
  /** 0–1 proximity to orb center in screen space */
  amount: number
  /** Smoothed pointer NDC */
  x: number
  y: number
}
