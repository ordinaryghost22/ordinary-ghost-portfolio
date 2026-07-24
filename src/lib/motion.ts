import type { Transition, Variants } from 'framer-motion'

/** Fast-out, gentle settle — use for all entrance transitions */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export const VIEWPORT = {
  once: true,
  margin: '-80px' as const,
}

/** Canonical text/content entrance duration */
export const REVEAL_DURATION = 0.7

/** Canonical text/content lift distance (px) */
export const REVEAL_Y = 20

/** Canonical heading → body sequencing inside a section */
export const REVEAL_STAGGER = 0.12

export const entranceTransition = (
  duration = REVEAL_DURATION,
  reduceMotion = false,
): Transition => ({
  duration: reduceMotion ? 0 : duration,
  ease: EASE_OUT_EXPO,
})

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 28,
  mass: 0.6,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 28,
  mass: 0.45,
}

type StaggerOptions = {
  stagger?: number
  delay?: number
  reduceMotion?: boolean
  /** Slightly tighter timing on narrow viewports */
  compact?: boolean
}

export function staggerContainer({
  stagger = REVEAL_STAGGER,
  delay = 0,
  reduceMotion = false,
  compact = false,
}: StaggerOptions = {}): Variants {
  const factor = compact ? 0.75 : 1

  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : stagger * factor,
        delayChildren: reduceMotion ? 0 : delay * factor,
      },
    },
  }
}

type FadeUpOptions = {
  y?: number
  duration?: number
  delay?: number
  reduceMotion?: boolean
}

/**
 * Canonical slide-up-fade reveal for site text.
 * Defaults: y 20, duration 0.7, ease [0.16, 1, 0.3, 1].
 * Override only for intentionally distinct treatments (e.g. skills settle).
 */
export function fadeUp({
  y = REVEAL_Y,
  duration = REVEAL_DURATION,
  delay = 0,
  reduceMotion = false,
}: FadeUpOptions = {}): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
  }

  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...entranceTransition(duration),
        delay,
      },
    },
  }
}

export function fadeDown({
  y = -8,
  duration = REVEAL_DURATION,
  reduceMotion = false,
}: FadeUpOptions = {}): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1, y: 0 },
      visible: { opacity: 1, y: 0 },
    }
  }

  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: entranceTransition(duration),
    },
  }
}

export const hoverLift = {
  y: -4,
  transition: { duration: 0.25, ease: EASE_OUT_EXPO },
} as const

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.25, ease: EASE_OUT_EXPO },
} as const
