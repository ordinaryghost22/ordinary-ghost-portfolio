import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

import { cn } from '@/lib/utils'

type Star = {
  id: number
  left: number
  top: number
  size: number
  opacity: number
  drift: boolean
  duration: number
  delay: number
}

/** 18 stars — different sizes/brightness; some drift, some static */
function buildStars(): Star[] {
  const seeds = [
    [12, 18, 1.0, 0.22, true, 48, 0],
    [28, 8, 1.4, 0.35, false, 0, 0],
    [41, 22, 0.8, 0.16, true, 62, 4],
    [55, 12, 1.1, 0.28, true, 55, 2],
    [68, 28, 0.7, 0.14, false, 0, 0],
    [78, 9, 1.2, 0.3, true, 70, 8],
    [88, 20, 0.9, 0.18, false, 0, 0],
    [18, 38, 1.0, 0.2, true, 52, 1],
    [33, 48, 0.75, 0.12, false, 0, 0],
    [62, 42, 1.3, 0.26, true, 58, 6],
    [84, 36, 0.85, 0.15, true, 66, 3],
    [8, 58, 1.1, 0.24, false, 0, 0],
    [46, 62, 0.7, 0.11, true, 74, 10],
    [72, 55, 1.0, 0.19, false, 0, 0],
    [92, 48, 0.8, 0.13, true, 60, 5],
    [22, 72, 0.9, 0.17, false, 0, 0],
    [58, 78, 1.15, 0.21, true, 68, 7],
    [80, 68, 0.75, 0.12, false, 0, 0],
  ] as const

  return seeds.map((s, id) => ({
    id,
    left: s[0],
    top: s[1],
    size: s[2],
    opacity: s[3],
    drift: s[4],
    duration: s[5],
    delay: s[6],
  }))
}

const PARALLAX_MAX = 6
const PARALLAX_LERP = 0.04

type HeroStarsProps = {
  ready?: boolean
  className?: string
}

/**
 * Minimal star field — ~18 points, monochrome, almost still.
 * No sparkles. No shooting stars.
 */
export function HeroStars({ ready = true, className }: HeroStarsProps) {
  const reduceMotion = !!useReducedMotion()
  const stars = useMemo(() => buildStars(), [])
  const targetX = useRef(0)
  const targetY = useRef(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    if (reduceMotion) {
      targetX.current = 0
      targetY.current = 0
      x.set(0)
      y.set(0)
      return
    }

    const onMove = (event: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      if (cx <= 0 || cy <= 0) return
      const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / cx))
      const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / cy))
      targetX.current = nx * PARALLAX_MAX
      targetY.current = ny * PARALLAX_MAX
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion, x, y])

  useAnimationFrame(() => {
    if (reduceMotion) {
      x.set(0)
      y.set(0)
      return
    }
    x.set(x.get() + (targetX.current - x.get()) * PARALLAX_LERP)
    y.set(y.get() + (targetY.current - y.get()) * PARALLAX_LERP)
  })

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
      style={reduceMotion ? undefined : { x, y }}
      initial={false}
      animate={{ opacity: ready ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-[color:var(--hero-text)]"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          animate={
            ready && !reduceMotion && star.drift
              ? { y: [0, -3, 0], x: [0, 1.5, 0] }
              : undefined
          }
          transition={
            star.drift && !reduceMotion
              ? {
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : undefined
          }
        />
      ))}
    </motion.div>
  )
}
