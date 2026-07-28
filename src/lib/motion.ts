import type { Transition, Variants } from 'framer-motion'

/**
 * Ordinary Ghost — Motion tokens
 * Durations only; ease-out curves. No bounce. No elastic.
 * One continuous publication: subtle opacity + 12–16px travel.
 */

/** Canonical ease-out — precision settle, never bounce */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/** @deprecated Prefer EASE_OUT — kept for existing imports */
export const EASE_OUT_EXPO = EASE_OUT

/** Motion duration tokens (seconds) */
export const DURATION = {
  /** Controls, links, buttons, arrows */
  hover: 0.18,
  /** Cards, panels, surfaces, expand/collapse */
  card: 0.25,
  /** Element reveals as they enter the viewport */
  section: 0.55,
  /** Hero entrance / archive morph */
  hero: 0.8,
} as const

/**
 * Section shell — early enough that children begin revealing
 * before the block feels “arrived.”
 */
export const VIEWPORT = {
  once: true,
  margin: '-6% 0px -10% 0px' as const,
  amount: 0.2 as const,
}

/**
 * Individual copy / media — fires as each element crosses the fold.
 */
export const VIEWPORT_ELEMENT = {
  once: true,
  margin: '0px 0px -8% 0px' as const,
  amount: 0.35 as const,
}

/** Canonical text/content entrance duration */
export const REVEAL_DURATION: number = DURATION.section

/** Canonical text/content lift distance (px) — never dramatic */
export const REVEAL_Y = 14

/** Media / screenshot lift — slightly quieter than copy */
export const MEDIA_REVEAL_Y = 12

/** Label → heading → paragraph sequencing inside a cluster */
export const REVEAL_STAGGER = 0.1

export const entranceTransition = (
  duration: number = REVEAL_DURATION,
  reduceMotion = false,
): Transition => ({
  duration: reduceMotion ? 0 : duration,
  ease: EASE_OUT,
})

/**
 * Soft follow for magnetic / cursor — critically damped feel.
 * Not a bounce spring; overshoot is intentionally minimal.
 */
export const springSoft: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 36,
  mass: 0.55,
}

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 480,
  damping: 38,
  mass: 0.4,
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
 * Canonical slide-up-fade reveal.
 * Defaults: y 14, duration section (550ms), ease-out.
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

/** Screenshots / frames — never pop */
export function mediaFadeUp({
  reduceMotion = false,
  delay = 0,
}: {
  reduceMotion?: boolean
  delay?: number
} = {}): Variants {
  return fadeUp({
    y: MEDIA_REVEAL_Y,
    duration: DURATION.section,
    delay,
    reduceMotion,
  })
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

/** Card / surface hover — 250ms ease-out, 2px lift */
export const hoverLift = {
  y: -2,
  transition: { duration: DURATION.card, ease: EASE_OUT },
} as const

/** Press feedback — engineered, not playful */
export const pressScale = {
  scale: 0.98,
  transition: { duration: DURATION.hover, ease: EASE_OUT },
} as const

/** @deprecated Prefer pressScale — no grow-on-hover in the new system */
export const hoverScale = {
  scale: 1,
  transition: { duration: DURATION.hover, ease: EASE_OUT },
} as const

/** Arrow travel on text links / CTAs — 3px, 180ms */
export const ARROW_TRAVEL_PX = 3
