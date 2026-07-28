import { motion, useReducedMotion } from 'framer-motion'

import { RevealText } from '@/components/common/RevealText'
import { RESUME_DOWNLOAD_NAME, RESUME_URL } from '@/data/contact'
import { resumeContent } from '@/data/resume'
import {
  BODY_CLASS,
  COL_CONTENT,
  COL_HEADING,
  COL_LABEL,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
  TEXT_LINK_CLASS,
  TEXT_LINK_UNDERLINE,
} from '@/lib/editorial'
import { VIEWPORT, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function ChapterLabel({ title }: { title: string }) {
  return <p className={LABEL_CLASS}>{title}</p>
}

function ListChapter({
  title,
  items,
  reduceMotion,
}: {
  title: string
  items: readonly string[]
  reduceMotion: boolean
}) {
  return (
    <motion.div
      variants={staggerContainer({
        stagger: 0.06,
        reduceMotion,
      })}
      className={cn(PAGE_SHELL, 'border-t border-zinc-900 py-16')}
    >
      <RevealText as="div" className={COL_LABEL}>
        <ChapterLabel title={title} />
      </RevealText>

      <ul className={cn(COL_CONTENT, 'flex flex-col gap-5')}>
        {items.map((item) => (
          <RevealText
            key={item}
            as="li"
            className={cn(BODY_CLASS, 'max-w-xl text-[17px] font-medium')}
          >
            {item}
          </RevealText>
        ))}
      </ul>
    </motion.div>
  )
}

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
      <div className="py-16 md:py-24 lg:py-28">
        {/* Masthead — 05 Resume */}
        <div className={cn(PAGE_SHELL, 'border-b border-zinc-900 pb-16')}>
          <div className={COL_HEADING}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
              <div>
                <RevealText independent={false} as="p" className={LABEL_CLASS}>
                  05 — Resume
                </RevealText>
                <RevealText
                  independent={false}
                  as="h2"
                  id="resume-heading"
                  className="og-hero-display mt-5 text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-50"
                >
                  {resumeContent.heading}
                </RevealText>
              </div>

              <a
                href={RESUME_URL}
                download={RESUME_DOWNLOAD_NAME}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(TEXT_LINK_CLASS, TEXT_LINK_UNDERLINE)}
              >
                {resumeContent.downloadLabel}
                <span aria-hidden>↓</span>
              </a>
            </div>

            <RevealText
              independent={false}
              as="p"
              className={cn(BODY_CLASS, 'mt-5 max-w-[36ch] text-[18px]')}
            >
              {resumeContent.intro}
            </RevealText>
          </div>
        </div>

        {/* Experience */}
        <motion.div
          variants={staggerContainer({
            stagger: 0.08,
            reduceMotion,
          })}
          className={cn(PAGE_SHELL, 'border-t border-zinc-900 py-16')}
        >
          <RevealText as="div" className={COL_LABEL}>
            <ChapterLabel title={resumeContent.experience.title} />
          </RevealText>

          <ol className={cn(COL_CONTENT, 'flex flex-col gap-12')}>
            {resumeContent.experience.milestones.map((milestone) => (
              <RevealText key={milestone.title} as="li">
                <p className={META_CLASS}>{milestone.period}</p>
                <h3 className="mt-2 text-[22px] font-medium tracking-[-0.02em] text-zinc-50 sm:text-[24px]">
                  {milestone.title}
                </h3>
                <p className={cn(BODY_CLASS, 'mt-3 max-w-[40ch] text-[15px]')}>
                  {milestone.description}
                </p>
                <p className={cn(BODY_CLASS, 'mt-3 max-w-[40ch] text-[15px]')}>
                  <span className="text-zinc-500">Impact — </span>
                  {milestone.impact}
                </p>
              </RevealText>
            ))}
          </ol>
        </motion.div>

        <ListChapter
          title={resumeContent.projectsDelivered.title}
          items={resumeContent.projectsDelivered.items}
          reduceMotion={reduceMotion}
        />
        <ListChapter
          title={resumeContent.education.title}
          items={resumeContent.education.items}
          reduceMotion={reduceMotion}
        />
        <ListChapter
          title={resumeContent.achievements.title}
          items={resumeContent.achievements.items}
          reduceMotion={reduceMotion}
        />
        <ListChapter
          title={resumeContent.currentFocus.title}
          items={resumeContent.currentFocus.items}
          reduceMotion={reduceMotion}
        />
      </div>
    </motion.section>
  )
}
