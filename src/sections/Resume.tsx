import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { RevealText } from '@/components/common/RevealText'
import { RESUME_URL } from '@/data/contact'
import { resumeContent } from '@/data/resume'
import {
  BODY_CLASS,
  COL_HEADING,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
  TEXT_LINK_CLASS,
  TEXT_LINK_UNDERLINE,
} from '@/lib/editorial'
import { VIEWPORT, staggerContainer } from '@/lib/motion'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

/**
 * Resume — sparse, premium list.
 * Apple / Linear / Vercel: hairlines, quiet type, no chapter clutter.
 */
export function Resume() {
  const reduceMotion = !!useReducedMotion()

  return (
    <motion.section
      id="resume"
      aria-labelledby="resume-heading"
      className="relative z-[1] border-t border-zinc-900"
      variants={staggerContainer({ reduceMotion })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className={cn(PAGE_SHELL, 'py-20 md:py-28 lg:py-32')}>
        <div className={COL_HEADING}>
          {/* Header */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <RevealText independent={false} as="p" className={LABEL_CLASS}>
                05 — {resumeContent.eyebrow}
              </RevealText>
              <RevealText
                independent={false}
                as="h2"
                id="resume-heading"
                className="og-hero-display mt-4 text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-50"
              >
                {resumeContent.heading}
              </RevealText>
            </div>

            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              className={cn(TEXT_LINK_CLASS, TEXT_LINK_UNDERLINE, 'mb-1')}
            >
              {resumeContent.downloadLabel}
              <span aria-hidden>↗</span>
            </a>
          </div>

          <RevealText
            independent={false}
            as="p"
            className={cn(BODY_CLASS, 'mt-6 max-w-[36ch] text-[16px]')}
          >
            {resumeContent.intro}
          </RevealText>

          {/* Experience */}
          <div className="mt-16 border-t border-zinc-800/80">
            <p className={cn(META_CLASS, 'pt-8 uppercase tracking-widest')}>
              Experience
            </p>

            <ul className="mt-6">
              {resumeContent.experience.map((item) => (
                <RevealText
                  key={item.role}
                  as="li"
                  className="border-b border-zinc-900 py-7 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h3 className="text-[17px] font-medium tracking-[-0.02em] text-zinc-50 sm:text-[18px]">
                      {item.role}
                    </h3>
                    <p className={cn(META_CLASS, 'tabular-nums')}>
                      {item.period}
                    </p>
                  </div>
                  <p className={cn(BODY_CLASS, 'mt-2 max-w-[48ch] text-[15px]')}>
                    {item.detail}
                  </p>
                </RevealText>
              ))}
            </ul>
          </div>

          {/* Selected work */}
          <div className="mt-6 border-t border-zinc-800/80 pt-8">
            <p className={cn(META_CLASS, 'uppercase tracking-widest')}>
              Selected work
            </p>
            <ul className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {resumeContent.selected.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onPointerEnter={() => {
                      void playUiSound('hover')
                    }}
                    onClick={() => {
                      void playUiSound('click')
                    }}
                    className={cn(
                      TEXT_LINK_CLASS,
                      TEXT_LINK_UNDERLINE,
                      'text-[15px] text-zinc-300',
                    )}
                  >
                    {item.name}
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Education */}
          <div className="mt-10 border-t border-zinc-800/80 pt-8">
            <p className={cn(META_CLASS, 'uppercase tracking-widest')}>
              {resumeContent.education.label}
            </p>
            <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em] text-zinc-50 sm:text-[18px]">
              {resumeContent.education.title}
            </h3>
            <p className={cn(BODY_CLASS, 'mt-2 text-[15px]')}>
              {resumeContent.education.detail}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
