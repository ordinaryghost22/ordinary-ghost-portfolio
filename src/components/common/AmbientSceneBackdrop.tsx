import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/utils'

/**
 * Fixed ambient layer behind the WebGL canvas (z-0).
 * Transparent base so the void body color reads through; grid + glows only.
 */
export function AmbientSceneBackdrop() {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-transparent"
    >
      {/* Amber + indigo radial glows — right-biased behind the orb */}
      <motion.div
        className="absolute top-[8%] right-[-6%] h-[min(72vw,620px)] w-[min(72vw,620px)] rounded-full bg-[#d4af37]/[0.06] blur-[120px] lg:right-[2%]"
        initial={false}
        animate={
          animate
            ? { opacity: [0.55, 1, 0.55], scale: [1, 1.06, 1] }
            : { opacity: 0.75, scale: 1 }
        }
        transition={
          animate
            ? { duration: 14, repeat: Infinity, ease: 'easeInOut' }
            : undefined
        }
      />
      <motion.div
        className="absolute top-[22%] right-[8%] h-[min(58vw,480px)] w-[min(58vw,480px)] rounded-full bg-[#1e1b4b]/[0.10] blur-[140px] lg:right-[12%]"
        initial={false}
        animate={
          animate
            ? { opacity: [0.45, 0.95, 0.45], scale: [1.04, 1, 1.04] }
            : { opacity: 0.7, scale: 1 }
        }
        transition={
          animate
            ? { duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }
            : undefined
        }
      />

      {/* Ultra-faint engineering grid */}
      <div
        className={cn(
          'absolute inset-0 bg-transparent',
          '[background-image:linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)]',
          '[background-size:72px_72px]',
          '[mask-image:radial-gradient(ellipse_at_70%_45%,black_8%,transparent_62%)]',
        )}
      />
    </div>
  )
}
