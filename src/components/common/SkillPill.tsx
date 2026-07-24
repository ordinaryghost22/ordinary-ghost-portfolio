import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

import { useSkillHighlight } from '@/context/skill-highlight-context'
import { springSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'

type SkillPillProps = {
  skill: string
  reduceMotion?: boolean
}

/**
 * Glassmorphism skill tag — magnetic suction, 3D tilt, cross-highlights projects.
 */
export function SkillPill({ skill, reduceMotion: reduceProp }: SkillPillProps) {
  const reduceMotionHook = useReducedMotion()
  const reduceMotion = reduceProp ?? !!reduceMotionHook
  const { highlightedSkill, setHighlightedSkill } = useSkillHighlight()
  const active = highlightedSkill === skill

  const nodeRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scaleMv = useMotionValue(1)

  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springRX = useSpring(rotateX, springSoft)
  const springRY = useSpring(rotateY, springSoft)
  const springScale = useSpring(scaleMv, springSoft)

  const glareX = useTransform(springRY, [-10, 10], [20, 80])
  const glareY = useTransform(springRX, [-10, 10], [70, 30])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.22), transparent 55%)`

  useEffect(() => {
    scaleMv.set(active ? 1.05 : 1)
  }, [active, scaleMv])

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : {
              x: springX,
              y: springY,
              rotateX: springRX,
              rotateY: springRY,
              scale: springScale,
              transformPerspective: 600,
            }
      }
      className="inline-flex [transform-style:preserve-3d]"
    >
      <button
        type="button"
        ref={nodeRef}
        data-magnetic
        aria-pressed={active}
        onPointerEnter={() => setHighlightedSkill(skill)}
        onPointerLeave={() => {
          setHighlightedSkill(null)
          x.set(0)
          y.set(0)
          rotateX.set(0)
          rotateY.set(0)
        }}
        onFocus={() => setHighlightedSkill(skill)}
        onBlur={() => setHighlightedSkill(null)}
        onPointerMove={(event) => {
          if (reduceMotion || !nodeRef.current) return
          const rect = nodeRef.current.getBoundingClientRect()
          const px = (event.clientX - rect.left) / rect.width - 0.5
          const py = (event.clientY - rect.top) / rect.height - 0.5
          x.set(px * 10)
          y.set(py * 10)
          rotateY.set(px * 14)
          rotateX.set(-py * 12)
        }}
        className={cn(
          'og-liquid-glass relative overflow-visible rounded-full border border-transparent px-3.5 py-1.5',
          'font-mono text-[11px] tracking-[0.08em] text-foreground/85 uppercase',
          'transition-[border-color,color,box-shadow] duration-250',
          'hover:border-amber-400/60 hover:text-foreground',
          'hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          active &&
            'border-amber-400/60 text-primary shadow-[0_0_10px_rgba(245,158,11,0.3)]',
        )}
      >
        <motion.span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 overflow-hidden rounded-full',
            reduceMotion ? 'opacity-0' : 'opacity-40',
          )}
          style={{ background: glareBg }}
        />
        <span className="relative z-[1] whitespace-nowrap">{skill}</span>
      </button>
    </motion.div>
  )
}
