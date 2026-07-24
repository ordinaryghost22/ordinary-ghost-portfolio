import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

import { DecryptText } from '@/components/common/DecryptText'
import { RevealText } from '@/components/common/RevealText'
import { TextBackdrop } from '@/components/common/TextBackdrop'
import { aboutContent } from '@/data/about'
import { VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'

export function About() {
  const reduceMotion = useReducedMotion()
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const eyebrowInView = useInView(eyebrowRef, { once: true, margin: '-80px' })

  return (
    <motion.section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-[1] border-t border-border/60"
      variants={staggerContainer({
        reduceMotion: !!reduceMotion,
      })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <TextBackdrop className="lg:col-span-7">
          <motion.div
            ref={eyebrowRef}
            variants={fadeUp({ reduceMotion: !!reduceMotion })}
          >
            <DecryptText
              text={aboutContent.eyebrow}
              tickMs={16}
              delayMs={40}
              active={eyebrowInView && !reduceMotion}
              className="font-mono text-xs tracking-[0.18em] text-primary uppercase"
            />
          </motion.div>

          <RevealText
            as="h2"
            id="about-heading"
            className="mt-5 max-w-xl font-display text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl md:text-[2.75rem] md:leading-[1.1]"
          >
            {aboutContent.heading}
          </RevealText>

          <RevealText
            as="p"
            className="mt-7 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
          >
            {aboutContent.body}
          </RevealText>
        </TextBackdrop>

        <motion.aside
          variants={staggerContainer({
            stagger: 0.12,
            reduceMotion: !!reduceMotion,
          })}
          className="flex flex-col justify-end gap-10 border-t border-border/60 pt-10 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
          aria-label="Proof points"
        >
          {aboutContent.facts.map((fact, index) => (
            <RevealText key={fact.label} as="div">
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                <span className="mr-2 text-primary/70">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {fact.label}
              </p>
              <p className="mt-2 font-display text-lg font-semibold tracking-[-0.02em] text-foreground sm:text-xl">
                {fact.value}
              </p>
            </RevealText>
          ))}
        </motion.aside>
      </div>
    </motion.section>
  )
}
