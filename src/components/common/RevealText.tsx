import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { VIEWPORT_ELEMENT, fadeUp } from '@/lib/motion'
import { cn } from '@/lib/utils'

type RevealTextAs = 'div' | 'p' | 'span' | 'h2' | 'h3' | 'h4' | 'ul' | 'li'

type RevealTextProps = {
  children: ReactNode
  className?: string
  as?: RevealTextAs
  id?: string
  /**
   * Only override for intentionally distinct treatments.
   * Default is the site-wide reveal (14px / 550ms).
   */
  y?: number
  duration?: number
  /** Override prefers-reduced-motion / intro gate (true = no travel). */
  reduceMotion?: boolean
  /**
   * When true (default), reveal as this element enters the viewport.
   * Set false when a parent staggerContainer owns the choreography.
   */
  independent?: boolean
}

/**
 * Canonical slide-up-fade text entrance.
 *
 * Default: progressive whileInView — label, heading, and body
 * appear as they cross the fold, not as one section flash.
 *
 * Pass independent={false} inside a staggerContainer when the
 * parent should sequence children (e.g. header clusters).
 */
export function RevealText({
  children,
  className,
  as = 'div',
  id,
  y,
  duration,
  reduceMotion: reduceMotionProp,
  independent = true,
}: RevealTextProps) {
  const prefersReduced = useReducedMotion()
  const reduceMotion = reduceMotionProp ?? !!prefersReduced
  const Tag = motion[as]
  const variants = fadeUp({
    ...(y !== undefined ? { y } : {}),
    ...(duration !== undefined ? { duration } : {}),
    reduceMotion,
  })

  if (independent) {
    return (
      <Tag
        id={id}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ELEMENT}
        variants={variants}
        className={cn(className)}
      >
        {children}
      </Tag>
    )
  }

  return (
    <Tag id={id} variants={variants} className={cn(className)}>
      {children}
    </Tag>
  )
}
