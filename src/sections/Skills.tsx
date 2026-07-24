import { motion, useReducedMotion } from 'framer-motion'

import { RevealText } from '@/components/common/RevealText'
import { SkillPill } from '@/components/common/SkillPill'
import { TextBackdrop } from '@/components/common/TextBackdrop'
import { skillCategories } from '@/data/skills'
import { VIEWPORT, fadeUp, staggerContainer } from '@/lib/motion'

export function Skills() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      id="skills"
      aria-labelledby="skills-heading"
      className="relative z-[1] border-t border-border/60"
      variants={staggerContainer({
        reduceMotion: !!reduceMotion,
      })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
        <TextBackdrop className="max-w-2xl">
          <RevealText
            as="p"
            className="font-mono text-xs tracking-[0.18em] text-primary uppercase"
          >
            Stack
          </RevealText>

          <RevealText
            as="h2"
            id="skills-heading"
            className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-5xl"
          >
            Tools that ship
          </RevealText>

          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            Hover a skill to highlight projects that use it.
          </p>
        </TextBackdrop>

        <motion.div
          variants={staggerContainer({
            stagger: 0.07,
            delay: 0.04,
            reduceMotion: !!reduceMotion,
          })}
          className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {skillCategories.map((category) => (
            <motion.div
              key={category.label}
              variants={fadeUp({
                y: 16,
                duration: 0.5,
                reduceMotion: !!reduceMotion,
              })}
              className="min-w-0"
            >
              <p className="border-b border-border/50 pb-3 font-mono text-[11px] tracking-[0.16em] text-primary/80 uppercase">
                {category.label}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <li key={item} className="min-w-0">
                    <SkillPill
                      skill={item}
                      reduceMotion={!!reduceMotion}
                    />
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
