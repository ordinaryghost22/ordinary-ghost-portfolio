/**
 * Ordinary Ghost — Design tokens (JS)
 * Mirror of CSS custom properties for runtime / Framer / Three.
 * Prefer CSS variables in components; use these when JS needs values.
 */

export const color = {
  background: '#0A0B0E',
  surface: '#111111',
  surfaceHover: '#171717',
  foreground: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#6B7280',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.16)',
  primary: '#FAFAFA',
  primaryForeground: '#0A0B0E',
  destructive: '#B4543F',
} as const

/** Scene / orb accent — cool silver, not gold */
export const sceneAccent = '#E4E4E7' as const

export const type = {
  hero: 72,
  section: 52,
  project: 32,
  heading: 24,
  body: 18,
  small: 14,
  caption: 12,
} as const

/** 8pt spacing system — only these values */
export const space = {
  8: 8,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
  64: 64,
  96: 96,
  128: 128,
} as const

export const radius = {
  button: 14,
  card: 20,
  input: 14,
  image: 20,
} as const

export const elevation = {
  1: '0 1px 2px rgba(0,0,0,0.24)',
  2: '0 4px 16px -4px rgba(0,0,0,0.4)',
  3: '0 12px 32px -12px rgba(0,0,0,0.5)',
} as const

/** Motion duration tokens (ms) — ease-out only */
export const duration = {
  hover: 180,
  card: 250,
  section: 550,
  hero: 800,
} as const

export const button = {
  height: 46,
  radius: 14,
  fontWeight: 500,
  arrowTravel: 3,
  pressScale: 0.98,
} as const

export const texture = {
  gridOpacity: 0.025,
  grainOpacity: 0.028,
} as const

/** Single icon library for the product */
export const iconLibrary = 'lucide' as const
