import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

import { RevealText } from '@/components/common/RevealText'
import { aboutContent } from '@/data/about'
import {
  BODY_CLASS,
  COL_CONTENT,
  COL_HEADING,
  COL_LABEL,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
} from '@/lib/editorial'
import { DURATION, EASE_OUT, VIEWPORT, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function SectionLabel({
  index,
  title,
}: {
  index?: string
  title: string
}) {
  return (
    <p className={LABEL_CLASS}>
      {index ? (
        <>
          <span>{index}</span>
          <span className="mx-2 text-zinc-700" aria-hidden>
            —
          </span>
        </>
      ) : null}
      <span>{title}</span>
    </p>
  )
}

function PathTimeline({
  steps,
  reduceMotion,
}: {
  steps: readonly string[]
  reduceMotion: boolean
}) {
  const ref = useRef<HTMLOListElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })

  return (
    <ol ref={ref} className="relative space-y-6">
      <span
        aria-hidden
        className="absolute top-1 bottom-1 -left-6 hidden w-px bg-zinc-800/80 md:block"
      />
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-0 w-px bg-zinc-800/80 md:hidden"
      />

      {steps.map((step, index) => {
        const num = String(index + 1).padStart(2, '0')
        return (
          <motion.li
            key={step}
            className="group pl-6 md:pl-0"
            initial={false}
            animate={
              inView || reduceMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{
              duration: reduceMotion ? 0 : DURATION.hero,
              ease: EASE_OUT,
              delay: reduceMotion ? 0 : 0.12 + index * 0.08,
            }}
          >
            <p
              className={cn(
                META_CLASS,
                'tabular-nums transition-colors duration-200 group-hover:text-white',
              )}
            >
              {num}
            </p>
            <p
              className={cn(
                'og-hero-display mt-2 text-[20px] leading-snug text-zinc-100 sm:text-[22px]',
                'transition-colors duration-200 group-hover:text-white',
              )}
            >
              {step}
            </p>
          </motion.li>
        )
      })}
    </ol>
  )
}

export function About() {
  const reduceMotion = !!useReducedMotion()

  return (
    <motion.section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-[1] border-t border-zinc-900"
      variants={staggerContainer({ reduceMotion })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="py-16 md:py-24 lg:py-28">
        {/* Masthead — headline flush left */}
        <div className={cn(PAGE_SHELL, 'border-b border-zinc-900 pb-16')}>
          <div className={COL_HEADING}>
            <RevealText independent={false} as="p" className={LABEL_CLASS}>
              {aboutContent.eyebrow}
            </RevealText>
            <RevealText
              independent={false}
              as="h2"
              id="about-heading"
              className="og-hero-display mt-5 max-w-xl text-[clamp(2.25rem,4.5vw,3.5rem)] text-zinc-50"
            >
              {aboutContent.heading}
            </RevealText>
          </div>
        </div>

        {/* 01 — Philosophy */}
        <div className={cn(PAGE_SHELL, 'border-b border-zinc-900 py-16')}>
          <div className={COL_LABEL}>
            <SectionLabel index="01" title={aboutContent.philosophy.title} />
          </div>
          <div className={cn(COL_CONTENT, 'flex flex-col gap-6')}>
            {aboutContent.philosophy.paragraphs.map((paragraph) => (
              <RevealText
                key={paragraph}
                as="p"
                className={cn(BODY_CLASS, 'max-w-[52ch] text-base sm:text-[17px]')}
              >
                {paragraph}
              </RevealText>
            ))}
          </div>
        </div>

        {/* 02 — Path */}
        <div className={cn(PAGE_SHELL, 'border-b border-zinc-900 py-16')}>
          <div className={COL_LABEL}>
            <SectionLabel index="02" title={aboutContent.journey.title} />
          </div>
          <div className={COL_CONTENT}>
            <PathTimeline
              steps={aboutContent.journey.steps}
              reduceMotion={reduceMotion}
            />
          </div>
        </div>

        {/* Principles — unnumbered (global 03 is Work) */}
        <div className={cn(PAGE_SHELL, 'py-16')}>
          <div className={COL_LABEL}>
            <SectionLabel title={aboutContent.principles.title} />
          </div>
          <div className={COL_CONTENT}>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-12 border-t border-zinc-800 pt-8 md:grid-cols-3">
              {aboutContent.principles.items.map((principle, index) => (
                <RevealText key={principle.title} as="li" className="min-w-0">
                  <p className={cn(META_CLASS, 'tabular-nums')}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="og-hero-display mt-3 text-[20px] leading-snug text-zinc-50 sm:text-[22px]">
                    {principle.title}
                  </h3>
                  <p
                    className={cn(
                      BODY_CLASS,
                      'mt-3 max-w-[36ch] text-[15px]',
                    )}
                  >
                    {principle.body}
                  </p>
                </RevealText>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
