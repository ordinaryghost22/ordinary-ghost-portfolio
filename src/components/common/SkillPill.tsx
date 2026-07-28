import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
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
 * Skill tag — quiet surface, consistent radius, no glow.
 */
export function SkillPill({ skill, reduceMotion: reduceProp }: SkillPillProps) {
  const reduceMotionHook = useReducedMotion()
  const reduceMotion = reduceProp ?? !!reduceMotionHook
  const { highlightedSkill, setHighlightedSkill } = useSkillHighlight()
  const active = highlightedSkill === skill

  const nodeRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scaleMv = useMotionValue(1)

  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springScale = useSpring(scaleMv, springSoft)

  useEffect(() => {
    scaleMv.set(active ? 1.02 : 1)
  }, [active, scaleMv])

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : {
              x: springX,
              y: springY,
              scale: springScale,
            }
      }
      className="inline-flex"
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
        }}
        onFocus={() => setHighlightedSkill(skill)}
        onBlur={() => setHighlightedSkill(null)}
        onPointerMove={(event) => {
          if (reduceMotion || !nodeRef.current) return
          const rect = nodeRef.current.getBoundingClientRect()
          const px = (event.clientX - rect.left) / rect.width - 0.5
          const py = (event.clientY - rect.top) / rect.height - 0.5
          x.set(px * 6)
          y.set(py * 6)
        }}
        className={cn(
          'relative overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.08)]',
          'bg-[#111111] px-4 py-2',
          'text-[14px] font-medium tracking-[-0.01em] text-[#A1A1AA]',
          'transition-[border-color,color,background-color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          'hover:border-[rgba(255,255,255,0.16)] hover:bg-[#171717] hover:text-[#FAFAFA]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          active &&
            'border-[rgba(255,255,255,0.16)] bg-[#171717] text-[#FAFAFA]',
        )}
      >
        <span className="relative z-[1] whitespace-nowrap">{skill}</span>
      </button>
    </motion.div>
  )
}
