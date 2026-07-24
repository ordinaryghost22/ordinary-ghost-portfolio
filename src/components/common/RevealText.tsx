import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

type RevealTextAs = 'div' | 'p' | 'span' | 'h2' | 'h3' | 'h4' | 'ul' | 'li'

type RevealTextProps = {
  children: ReactNode
  className?: string
  as?: RevealTextAs
  id?: string
  /**
   * Only override for intentionally distinct treatments
   * (e.g. skills settle). Default is the site-wide reveal.
   */
  y?: number
  duration?: number
  /** Override prefers-reduced-motion / intro gate (true = no travel). */
  reduceMotion?: boolean
}

/**
 * Canonical slide-up-fade text entrance.
 * Use as a stagger child of a parent with staggerContainer
 * (heading → body at ~0.12s), or wrap a standalone block.
 *
 * Values are locked in `@/lib/motion` fadeUp defaults — do not
 * drift per-section.
 */
export function RevealText({
  children,
  className,
  as = 'div',
  id,
  y,
  duration,
  reduceMotion: reduceMotionProp,
}: RevealTextProps) {
  const prefersReduced = useReducedMotion()
  const reduceMotion = reduceMotionProp ?? !!prefersReduced
  const Tag = motion[as]

  return (
    <Tag
      id={id}
      variants={fadeUp({
        ...(y !== undefined ? { y } : {}),
        ...(duration !== undefined ? { duration } : {}),
        reduceMotion,
      })}
      className={cn(className)}
    >
      {children}
    </Tag>
  )
}
