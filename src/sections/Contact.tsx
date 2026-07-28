import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

import { RevealText } from '@/components/common/RevealText'
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  contactContent,
  socialLinks,
} from '@/data/contact'
import {
  BODY_CLASS,
  COL_HEADING,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
  TEXT_LINK_CLASS,
  TEXT_LINK_UNDERLINE,
} from '@/lib/editorial'
import { DURATION, VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

const linkedIn = socialLinks.find((link) => link.id === 'linkedin')
const gitHub = socialLinks.find((link) => link.id === 'github')

const valueClassName = cn(
  TEXT_LINK_CLASS,
  'text-zinc-300 hover:text-white',
)

function MetaBlock({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <dt className={cn(META_CLASS, 'mb-2 uppercase')}>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function ExternalArrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
    >
      ↗
    </span>
  )
}

export function Contact() {
  const reduceMotion = !!useReducedMotion()

  return (
    <motion.section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-[1] border-t border-zinc-900"
      variants={staggerContainer({ reduceMotion })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className={cn(PAGE_SHELL, 'pt-24 pb-32 lg:pt-32 lg:pb-40')}>
        <div className={COL_HEADING}>
          <RevealText independent={false} as="p" className={LABEL_CLASS}>
            06 — Contact
          </RevealText>

          <RevealText
            independent={false}
            as="h2"
            id="contact-heading"
            className="og-hero-display mt-5 text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-50"
          >
            {contactContent.heading}
          </RevealText>

          <RevealText
            independent={false}
            as="p"
            className={cn(BODY_CLASS, 'mt-5 max-w-[38ch] text-[16px] sm:text-[18px]')}
          >
            <span className="block">{contactContent.supporting[0]}</span>
            <span className="mt-1 block">{contactContent.supporting[1]}</span>
          </RevealText>

          <motion.div
            variants={fadeUp({
              reduceMotion,
              duration: DURATION.section,
            })}
            className="mt-10"
          >
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              className={cn(
                TEXT_LINK_CLASS,
                TEXT_LINK_UNDERLINE,
                'break-all text-[15px] sm:text-base',
              )}
            >
              {CONTACT_EMAIL}
              <span aria-hidden>↗</span>
            </a>
          </motion.div>
        </div>

        <motion.dl
          variants={fadeUp({
            reduceMotion,
            duration: DURATION.section,
          })}
          className="col-span-full mt-16 grid w-full grid-cols-1 gap-8 border-t border-zinc-800/80 pt-12 sm:grid-cols-2 md:grid-cols-4"
        >
          <MetaBlock label={contactContent.details.email}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              className={cn(valueClassName, 'break-all')}
            >
              {CONTACT_EMAIL}
            </a>
          </MetaBlock>

          {linkedIn ? (
            <MetaBlock label={contactContent.details.linkedin}>
              <a
                href={linkedIn.href}
                target="_blank"
                rel="noopener noreferrer"
                onPointerEnter={() => {
                  void playUiSound('hover')
                }}
                className={valueClassName}
              >
                {linkedIn.label}
                <ExternalArrow />
              </a>
            </MetaBlock>
          ) : null}

          {gitHub ? (
            <MetaBlock label={contactContent.details.github}>
              <a
                href={gitHub.href}
                target="_blank"
                rel="noopener noreferrer"
                onPointerEnter={() => {
                  void playUiSound('hover')
                }}
                className={valueClassName}
              >
                {gitHub.label}
                <ExternalArrow />
              </a>
            </MetaBlock>
          ) : null}

          <MetaBlock label={contactContent.details.location}>
            <p className="text-sm font-medium text-zinc-300">
              {CONTACT_LOCATION}
            </p>
          </MetaBlock>
        </motion.dl>
      </div>
    </motion.section>
  )
}
