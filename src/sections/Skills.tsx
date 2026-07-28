import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'

import { RevealText } from '@/components/common/RevealText'
import { useSkillHighlight } from '@/context/skill-highlight-context'
import {
  capabilityGroups,
  type Capability,
  type CapabilityGroup,
} from '@/data/skills'
import { projects } from '@/data/projects'
import {
  BODY_CLASS,
  COL_CONTENT,
  COL_HEADING,
  COL_LABEL,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
} from '@/lib/editorial'
import { DURATION, VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function projectTitles(ids: string[]) {
  return ids
    .map((id) => projects.find((p) => p.id === id)?.title)
    .filter((title): title is string => Boolean(title))
}

function CapabilityRow({ capability }: { capability: Capability }) {
  const [active, setActive] = useState(false)
  const { setHighlightedSkill } = useSkillHighlight()
  const usedIn = projectTitles(capability.usedIn)
  const shipTag = usedIn[0] ?? null

  const activate = () => {
    setActive(true)
    setHighlightedSkill(capability.matchKeys[0] ?? capability.name)
  }

  const deactivate = () => {
    setActive(false)
    setHighlightedSkill(null)
  }

  return (
    <li>
      <button
        type="button"
        className={cn(
          'group flex w-full cursor-pointer items-center justify-between gap-4',
          'border-b border-zinc-800 py-3 text-left',
          'transition-colors duration-200',
          'hover:border-zinc-700',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0E]',
          active ? 'border-zinc-700 text-white' : 'text-zinc-400',
        )}
        onPointerEnter={activate}
        onPointerLeave={deactivate}
        onFocus={activate}
        onBlur={deactivate}
      >
        <span className="min-w-0 text-[16px] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-white sm:text-[17px]">
          {capability.name}
        </span>

        <span
          className={cn(
            'flex shrink-0 items-center gap-2',
            META_CLASS,
            'tracking-wide opacity-100 transition-all duration-200 md:opacity-0',
            'md:group-hover:translate-x-1 md:group-hover:opacity-100 md:group-focus-visible:translate-x-1 md:group-focus-visible:opacity-100',
            active && 'translate-x-1 opacity-100',
          )}
        >
          {shipTag ? (
            <span className="hidden max-w-[14ch] truncate sm:inline">{shipTag}</span>
          ) : null}
          <span aria-hidden className="text-zinc-400">
            →
          </span>
        </span>
      </button>
    </li>
  )
}

function CapabilityChapter({
  group,
  index,
  reduceMotion,
}: {
  group: CapabilityGroup
  index: number
  reduceMotion: boolean
}) {
  return (
    <motion.article
      variants={fadeUp({ reduceMotion, duration: DURATION.section })}
      className="border-t border-zinc-900 pt-10 first:border-t-0 first:pt-0 md:pt-12"
    >
      <header className="mb-6">
        <p className={cn(META_CLASS, 'tabular-nums')}>
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="og-hero-display mt-2 text-[22px] text-zinc-50 sm:text-[24px]">
          {group.title}
        </h3>
        <p className={cn(BODY_CLASS, 'mt-3 max-w-[36ch] text-[15px]')}>
          {group.purpose}
        </p>
      </header>

      <ul>
        {group.capabilities.map((capability) => (
          <CapabilityRow key={capability.name} capability={capability} />
        ))}
      </ul>
    </motion.article>
  )
}

export function Skills() {
  const reduceMotion = !!useReducedMotion()

  return (
    <motion.section
      id="method"
      aria-labelledby="skills-heading"
      className="relative z-[1] border-t border-zinc-900"
      variants={staggerContainer({ reduceMotion })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="py-16 md:py-24 lg:py-28">
        <div className={cn(PAGE_SHELL, 'border-b border-zinc-900 pb-12 md:pb-16')}>
          <div className={COL_HEADING}>
            <RevealText independent={false} as="p" className={LABEL_CLASS}>
              04 — Method
            </RevealText>
            <RevealText
              independent={false}
              as="h2"
              id="skills-heading"
              className="og-hero-display mt-5 text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-50"
            >
              How I work
            </RevealText>
            <RevealText
              independent={false}
              as="p"
              className={cn(
                BODY_CLASS,
                'mt-5 max-w-[40ch] text-[17px] sm:text-[18px]',
              )}
            >
              Across systems, product, and infrastructure. Select a line to see
              where it ships.
            </RevealText>
          </div>
        </div>

        <div className={cn(PAGE_SHELL, 'pt-12 md:pt-16')}>
          <div className={COL_LABEL}>
            <p className={LABEL_CLASS}>Capabilities</p>
          </div>
          <motion.div
            variants={staggerContainer({
              stagger: 0.08,
              reduceMotion,
            })}
            className={cn(COL_CONTENT, 'flex flex-col gap-4 md:gap-6')}
          >
            {capabilityGroups.map((group, index) => (
              <CapabilityChapter
                key={group.title}
                group={group}
                index={index}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
