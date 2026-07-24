import { motion, useReducedMotion } from 'framer-motion'
import { Check, Copy, Phone } from 'lucide-react'
import { useCallback, useState } from 'react'

import { MagneticAnchor, RevealText, TextBackdrop } from '@/components/common'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_TEL_HREF,
  CONTACT_WHATSAPP_HREF,
  socialBadgeClassName,
  socialLinks,
} from '@/data/contact'
import {
  useGsapParallaxScrub,
  useGsapSectionRef,
  useGsapStaggerReveal,
} from '@/hooks/useGsapScroll'
import { playUiSound } from '@/lib/uiSounds'
import { VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      void playUiSound('success')
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => {
        void onCopy()
      }}
      onPointerEnter={() => {
        void playUiSound('hover')
      }}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60',
        'text-neutral-400 transition-all duration-300',
        'hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-400',
        'hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
      )}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  )
}

export function Contact() {
  const reduceMotion = useReducedMotion()
  const sectionRef = useGsapSectionRef<HTMLElement>()

  useGsapStaggerReveal(sectionRef, '.gsap-reveal')
  useGsapParallaxScrub(sectionRef, '.gsap-parallax', 28)

  return (
    <motion.section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative z-[1] border-t border-border/60"
      variants={staggerContainer({
        reduceMotion: !!reduceMotion,
      })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <TextBackdrop className="gsap-parallax max-w-3xl">
          <RevealText
            as="p"
            className="font-mono text-xs tracking-[0.18em] text-primary uppercase"
          >
            Contact
          </RevealText>

          <RevealText
            as="h2"
            id="contact-heading"
            className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl"
          >
            Let&apos;s build something
          </RevealText>

          <RevealText
            as="p"
            className="mt-7 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
          >
            Open to product collaborations, AI systems work, and focused
            engineering engagements. One message is enough to start.
          </RevealText>

          <motion.div
            variants={fadeUp({ reduceMotion: !!reduceMotion })}
            className="gsap-reveal mt-12 flex flex-wrap items-center gap-3"
          >
            <MagneticAnchor
              href={`mailto:${CONTACT_EMAIL}`}
              className={cn(
                'inline-block cursor-pointer font-mono text-xl text-neutral-100 sm:text-2xl',
                'transition-all duration-300 hover:text-amber-400',
                'hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]',
                'focus-visible:text-amber-400 focus-visible:outline-none',
              )}
            >
              {CONTACT_EMAIL} ↗
            </MagneticAnchor>
            <CopyEmailButton />
          </motion.div>

          <motion.div
            variants={fadeUp({ reduceMotion: !!reduceMotion })}
            className="gsap-reveal mt-5"
          >
            <a
              href={CONTACT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onPointerEnter={() => {
                void playUiSound('hover')
              }}
              onClick={() => {
                void playUiSound('click')
              }}
              className={cn(
                'inline-flex items-center gap-2 font-mono text-sm text-neutral-400 sm:text-base',
                'transition-all duration-300 hover:text-amber-400',
                'hover:drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]',
                'focus-visible:text-amber-400 focus-visible:outline-none',
              )}
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              <span>{CONTACT_PHONE}</span>
              <span className="text-neutral-600">· WhatsApp</span>
            </a>
            <span className="sr-only">
              Also available via{' '}
              <a href={CONTACT_TEL_HREF}>{CONTACT_PHONE}</a>
            </span>
          </motion.div>

          <motion.ul
            variants={fadeUp({ reduceMotion: !!reduceMotion })}
            className="gsap-reveal mt-10 flex flex-wrap gap-3"
          >
            {socialLinks.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={() => {
                      void playUiSound('hover')
                    }}
                    onClick={() => {
                      void playUiSound('click')
                    }}
                    className={socialBadgeClassName}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="font-mono text-xs tracking-[0.12em] uppercase">
                      {link.label}
                    </span>
                  </a>
                </li>
              )
            })}
          </motion.ul>
        </TextBackdrop>
      </div>
    </motion.section>
  )
}
