import { motion, useReducedMotion } from 'framer-motion'
import { Download } from 'lucide-react'

import { MagneticAnchor, RevealText, TextBackdrop } from '@/components/common'
import { RESUME_DOWNLOAD_NAME, RESUME_URL } from '@/data/contact'
import { useEffectiveLowPower } from '@/hooks/useEffectiveLowPower'
import { VIEWPORT, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

const highlights = [
  { label: 'Focus', value: 'AI SaaS & automation' },
  { label: 'Mode', value: 'Solo, full-stack delivery' },
  { label: 'Proof', value: 'iRepair live in production' },
] as const

export function Resume() {
  const reduceMotion = useReducedMotion()
  const lowPower = useEffectiveLowPower()

  return (
    <motion.section
      id="resume"
      aria-labelledby="resume-heading"
      className="relative z-[1] border-t border-border/60"
      variants={staggerContainer({
        reduceMotion: !!reduceMotion,
      })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-12 lg:items-end lg:px-8">
        <TextBackdrop className="lg:col-span-7">
          <RevealText
            as="p"
            className="font-mono text-xs tracking-[0.18em] text-primary uppercase"
          >
            Resume
          </RevealText>

          <RevealText
            as="h2"
            id="resume-heading"
            className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-5xl"
          >
            Experience on paper
          </RevealText>

          <RevealText
            as="p"
            className="mt-6 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
          >
            Roles, stack, and shipped systems — a short PDF for when a
            conversation needs something concrete.
          </RevealText>

          <RevealText className="mt-9">
            <MagneticAnchor
              href={RESUME_URL}
              download={RESUME_DOWNLOAD_NAME}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              depthGlyph={<Download className="size-4" aria-hidden />}
              className={cn(
                'og-btn og-interactive inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm text-primary-foreground',
                lowPower ? 'og-glass-cta-fallback' : 'og-glass-cta',
                'hover:brightness-110',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
              )}
            >
              Download CV (PDF)
            </MagneticAnchor>
          </RevealText>
        </TextBackdrop>

        <motion.ul
          variants={staggerContainer({
            stagger: 0.1,
            reduceMotion: !!reduceMotion,
          })}
          className="flex flex-col gap-8 lg:col-span-5"
        >
          {highlights.map((item) => (
            <RevealText key={item.label} as="li">
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {item.label}
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
                {item.value}
              </p>
            </RevealText>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  )
}
