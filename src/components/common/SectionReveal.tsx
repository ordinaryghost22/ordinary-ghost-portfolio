import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  REVEAL_STAGGER,
  VIEWPORT,
  fadeUp,
  staggerContainer,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

type SectionRevealProps = {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  id?: string
  'aria-labelledby'?: string
}

/**
 * Canonical whileInView section shell. Wrap direct children in RevealText / MotionItem.
 */
export function SectionReveal({
  children,
  className,
  stagger = REVEAL_STAGGER,
  delay = 0,
  id,
  'aria-labelledby': ariaLabelledBy,
}: SectionRevealProps) {
  const reduceMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 640px)')

  return (
    <motion.section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(className)}
      variants={staggerContainer({
        stagger,
        delay,
        reduceMotion: !!reduceMotion,
        compact,
      })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.section>
  )
}

type MotionItemProps = {
  children: ReactNode
  className?: string
  y?: number
  duration?: number
  as?: 'div' | 'p' | 'h2' | 'h3' | 'ul' | 'li'
}

/** @deprecated Prefer RevealText for copy; kept for layout blocks. */
export function MotionItem({
  children,
  className,
  y,
  duration,
  as = 'div',
}: MotionItemProps) {
  const reduceMotion = useReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      variants={fadeUp({
        ...(y !== undefined ? { y } : {}),
        ...(duration !== undefined ? { duration } : {}),
        reduceMotion: !!reduceMotion,
      })}
      className={cn(className)}
    >
      {children}
    </Tag>
  )
}
