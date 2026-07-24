import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

import { ProjectHoverPreview } from '@/components/common/ProjectHoverPreview'
import { RevealText } from '@/components/common/RevealText'
import { SurfacePanel } from '@/components/common/SurfacePanel'
import { TextBackdrop } from '@/components/common/TextBackdrop'
import { useSkillHighlightOptional } from '@/context/skill-highlight-context'
import { projects, type Project } from '@/data/projects'
import { skillMatchesStack } from '@/lib/skillMatch'
import {
  VIEWPORT,
  fadeUp,
  springSnappy,
  staggerContainer,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

function LiveLink({
  href,
  reduceMotion,
  className,
}: {
  href: string
  reduceMotion: boolean
  className?: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial="rest"
      whileHover="hover"
      className={cn(
        'og-interactive inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary',
        'hover:text-foreground',
        className,
      )}
    >
      Live demo
      <motion.span
        variants={
          reduceMotion
            ? undefined
            : {
                rest: { x: 0, y: 0 },
                hover: {
                  x: 2,
                  y: -2,
                  transition: springSnappy,
                },
              }
        }
        className="inline-flex"
      >
        <ArrowUpRight className="size-4" aria-hidden />
      </motion.span>
    </motion.a>
  )
}

function useProjectHighlight(project: Project) {
  const ctx = useSkillHighlightOptional()
  const skill = ctx?.highlightedSkill ?? null
  if (!skill) return { dimmed: false, matched: false }
  const matched = skillMatchesStack(skill, project.stack)
  return { dimmed: !matched, matched }
}

function FlagshipProject({
  project,
  reduceMotion,
}: {
  project: Project
  reduceMotion: boolean
}) {
  const { dimmed, matched } = useProjectHighlight(project)
  const ctx = useSkillHighlightOptional()
  const skill = ctx?.highlightedSkill
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={fadeUp({ reduceMotion })}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        'relative z-0 transform transition-all duration-500 ease-out',
        'hover:z-10 hover:scale-[1.02]',
        'hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.12)]',
        dimmed && 'opacity-35 saturate-50',
        matched && 'opacity-100',
        reduceMotion && 'hover:scale-100',
      )}
    >
      <ProjectHoverPreview project={hovered ? project : null} />
      <SurfacePanel
        className={cn(
          'og-depth-surface group rounded-xl border border-amber-500/15 bg-neutral-900/40 p-8 backdrop-blur-md',
          'transition-all duration-500 ease-out hover:border-amber-400/40',
          'sm:p-10 lg:p-12',
          matched &&
            'border-amber-400/50 shadow-[0_0_40px_-20px_rgb(198_161_91/0.45)]',
        )}
      >
        <article data-cursor="view">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
              Flagship
            </span>
            <span
              className="hidden h-3 w-px bg-border sm:block"
              aria-hidden
            />
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              Live in production
            </span>
          </div>

          <h3 className="mt-6 max-w-3xl font-display text-3xl font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-4xl md:text-[3.25rem] md:leading-[1.05]">
            {project.title}
          </h3>
          <p className="mt-3 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
            {project.subtitle}
          </p>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            {project.description}
          </p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-3">
            {project.features.slice(0, 6).map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-sm leading-snug text-foreground/90"
              >
                <span
                  className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-11 flex flex-col gap-5 border-t border-border/50 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5">
              {project.stack.slice(0, 8).map((tech) => {
                const lit = skill ? skillMatchesStack(skill, [tech]) : false
                return (
                  <li
                    key={tech}
                    className={cn(
                      'font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase',
                      lit && 'text-primary',
                    )}
                  >
                    {tech}
                  </li>
                )
              })}
            </ul>
            {project.liveUrl ? (
              <LiveLink href={project.liveUrl} reduceMotion={reduceMotion} />
            ) : null}
          </div>
        </article>
      </SurfacePanel>
    </motion.div>
  )
}

function SecondaryProject({
  project,
  reduceMotion,
}: {
  project: Project
  reduceMotion: boolean
}) {
  const { dimmed, matched } = useProjectHighlight(project)
  const ctx = useSkillHighlightOptional()
  const skill = ctx?.highlightedSkill
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      data-cursor="view"
      variants={fadeUp({ reduceMotion })}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={cn(
        'group relative z-0 transform rounded-xl border border-amber-500/15 bg-neutral-900/40 p-8 backdrop-blur-md',
        'transition-all duration-500 ease-out',
        'hover:z-10 hover:scale-[1.02] hover:border-amber-400/40',
        'hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.12)]',
        dimmed && 'opacity-35 saturate-50',
        matched &&
          'border-amber-400/50 opacity-100 shadow-[0_0_28px_-16px_rgb(198_161_91/0.4)]',
        reduceMotion && 'hover:scale-100',
      )}
    >
      <ProjectHoverPreview project={hovered ? project : null} />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-8 bottom-8 left-0 w-px origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100',
          matched && 'scale-y-100',
        )}
      />

      <div className="relative z-[1] flex flex-col gap-4 pl-0 transition-[padding] duration-300 group-hover:pl-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
            {project.title}
          </h3>
          <p className="mt-1.5 font-mono text-xs tracking-[0.1em] text-muted-foreground uppercase">
            {project.subtitle}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
            {project.description}
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
            {project.stack.map((tech) => {
              const lit = skill ? skillMatchesStack(skill, [tech]) : false
              return (
                <li
                  key={tech}
                  className={cn(
                    'font-mono text-[10px] tracking-[0.1em] text-muted-foreground/80 uppercase',
                    lit && 'text-primary',
                  )}
                >
                  {tech}
                </li>
              )
            })}
          </ul>
        </div>
        {project.liveUrl ? (
          <LiveLink
            href={project.liveUrl}
            reduceMotion={reduceMotion}
            className="shrink-0"
          />
        ) : null}
      </div>
    </motion.article>
  )
}

export function Projects() {
  const reduceMotion = useReducedMotion()
  const flagship = projects.find((p) => p.flagship) ?? projects[0]
  const secondary = projects.filter((p) => p.title !== flagship.title)

  return (
    <motion.section
      id="projects"
      aria-labelledby="projects-heading"
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
            Selected work
          </RevealText>

          <RevealText
            as="h2"
            id="projects-heading"
            className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-5xl"
          >
            Shipped systems, not demos
          </RevealText>
        </TextBackdrop>

        <motion.div
          variants={staggerContainer({
            stagger: 0.14,
            reduceMotion: !!reduceMotion,
          })}
          className="mt-14 flex flex-col gap-10"
        >
          <FlagshipProject
            project={flagship}
            reduceMotion={!!reduceMotion}
          />

          <motion.div
            variants={staggerContainer({
              stagger: 0.1,
              reduceMotion: !!reduceMotion,
            })}
          >
            <TextBackdrop className="mb-1">
              <RevealText
                as="p"
                className="font-mono text-[11px] tracking-[0.16em] text-primary/80 uppercase"
              >
                Also building
              </RevealText>
            </TextBackdrop>
            <div className="relative flex flex-col gap-4">
              {secondary.map((project) => (
                <SecondaryProject
                  key={project.title}
                  project={project}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}
