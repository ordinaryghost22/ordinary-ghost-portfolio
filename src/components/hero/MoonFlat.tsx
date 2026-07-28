import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const PARALLAX_MAX = 4
const PARALLAX_LERP = 0.05
const FLOAT_PX = 1.2
const FLOAT_DURATION = 28
const EASE_EXPO = [0.16, 1, 0.3, 1] as const

type MoonFlatProps = {
  className?: string
  ready?: boolean
  oversized?: boolean
}

/**
 * Flat CSS moon — mobile fallback and desktop placeholder until R3F mounts.
 */
export function MoonFlat({
  className,
  ready = true,
  oversized = false,
}: MoonFlatProps) {
  const reduceMotion = useReducedMotion()
  const targetX = useRef(0)
  const targetY = useRef(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const floatPhase = useRef(0)
  const scale = useSpring(ready ? 1 : 0.978, {
    stiffness: 42,
    damping: 24,
    mass: 1.15,
  })

  useEffect(() => {
    scale.set(ready ? 1 : 0.978)
  }, [ready, scale])

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

  useAnimationFrame((_, delta) => {
    if (reduceMotion) {
      x.set(0)
      y.set(0)
      return
    }
    const nextX = x.get() + (targetX.current - x.get()) * PARALLAX_LERP
    floatPhase.current += delta / 1000
    const float =
      -FLOAT_PX *
      Math.sin((floatPhase.current * Math.PI * 2) / FLOAT_DURATION)
    const nextY =
      y.get() +
      (targetY.current + float - y.get()) * PARALLAX_LERP
    x.set(nextX)
    y.set(nextY)
  })

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <div
        className={cn(
          'absolute right-0 bottom-0',
          oversized
            ? 'h-[min(175vw,2100px)] w-[min(175vw,2100px)] translate-x-[30%] translate-y-[38%]'
            : cn(
                'h-[min(125vw,960px)] w-[min(125vw,960px)]',
                'sm:h-[min(100vw,1100px)] sm:w-[min(100vw,1100px)]',
                'lg:h-[min(82vw,1180px)] lg:w-[min(82vw,1180px)]',
                'translate-x-[22%] translate-y-[32%]',
                'sm:translate-x-[18%] sm:translate-y-[30%]',
                'lg:translate-x-[16%] lg:translate-y-[34%]',
              ),
        )}
      >
        <motion.div
          className="relative h-full w-full origin-[40%_45%]"
          style={reduceMotion ? undefined : { x, y, scale }}
          initial={false}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{
            opacity: {
              duration: reduceMotion ? 0 : 1.2,
              ease: EASE_EXPO,
            },
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ x: -8, y: 12 }}
            animate={
              ready && !reduceMotion ? { rotate: 360 } : { rotate: 0 }
            }
            transition={
              ready && !reduceMotion
                ? { duration: 420, repeat: Infinity, ease: 'linear' }
                : { duration: 0 }
            }
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border:
                  '1px solid color-mix(in srgb, var(--hero-moon-light) 14%, transparent)',
              }}
            />
          </motion.div>

          <div
            className="absolute inset-[3%] overflow-hidden rounded-full"
            style={{
              WebkitMaskImage:
                'radial-gradient(circle at 50% 50%, #000 52%, transparent 78%)',
              maskImage:
                'radial-gradient(circle at 50% 50%, #000 52%, transparent 78%)',
              background: `
                radial-gradient(
                  circle at 32% 28%,
                  color-mix(in srgb, var(--hero-moon-light) 22%, var(--hero-moon-mid)) 0%,
                  var(--hero-moon-mid) 42%,
                  color-mix(in srgb, var(--hero-moon-dark) 45%, var(--hero-moon-mid)) 72%,
                  transparent 100%
                )
              `,
            }}
          >
            <span
              className="absolute top-[24%] left-[36%] size-[26%] rounded-full"
              style={{
                background: 'var(--hero-moon-dark)',
                opacity: 0.045,
                filter: 'blur(24px)',
              }}
            />
            <span
              className="absolute top-[54%] left-[22%] size-[20%] rounded-full"
              style={{
                background: 'var(--hero-moon-dark)',
                opacity: 0.038,
                filter: 'blur(20px)',
              }}
            />
            <span
              className="absolute top-[62%] left-[48%] size-[22%] rounded-full"
              style={{
                background: 'var(--hero-moon-dark)',
                opacity: 0.04,
                filter: 'blur(26px)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
