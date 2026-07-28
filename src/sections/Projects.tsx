import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

import { RevealText } from '@/components/common/RevealText'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useSkillHighlightOptional } from '@/context/skill-highlight-context'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { projects } from '@/data/projects'
import {
  BODY_CLASS,
  COL_HEADING,
  PAGE_SHELL,
} from '@/lib/editorial'
import { playUiSound } from '@/lib/uiSounds'
import { VIEWPORT, staggerContainer } from '@/lib/motion'
import { skillMatchesStack } from '@/lib/skillMatch'
import { cn } from '@/lib/utils'

/** Matches `md:gap-10` on the rail */
const RAIL_GAP_PX = 40

function useHorizontalWheel(railRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (rail.scrollWidth <= rail.clientWidth) return

      event.preventDefault()
      rail.scrollLeft += event.deltaY
    }

    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => rail.removeEventListener('wheel', onWheel)
  }, [railRef])
}

function useRailScrollEdges(railRef: RefObject<HTMLDivElement | null>) {
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const rail = railRef.current
    if (!rail) {
      setCanPrev(false)
      setCanNext(false)
      return
    }

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
    setCanPrev(rail.scrollLeft > 2)
    setCanNext(rail.scrollLeft < maxScroll - 2)
  }, [railRef])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    update()
    rail.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update)
    })
    ro.observe(rail)
    for (const child of rail.children) {
      ro.observe(child)
    }

    return () => {
      rail.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [railRef, update])

  return { canPrev, canNext, updateEdges: update }
}

export function Projects() {
  const reduceMotion = !!useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const railRef = useRef<HTMLDivElement>(null)
  useHorizontalWheel(railRef)
  const { canPrev, canNext, updateEdges } = useRailScrollEdges(railRef)

  const skillCtx = useSkillHighlightOptional()
  const highlightedSkill = skillCtx?.highlightedSkill ?? null

  const scrollByCard = useCallback(
    (direction: -1 | 1) => {
      const container = railRef.current
      if (!container) return

      const card = container.querySelector<HTMLElement>('.project-card')
      if (!card) return

      const cardWidth = card.getBoundingClientRect().width + RAIL_GAP_PX
      const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth)
      const nextLeft = Math.min(
        maxScroll,
        Math.max(0, container.scrollLeft + direction * cardWidth),
      )

      container.scrollTo({
        left: nextLeft,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
      window.setTimeout(updateEdges, reduceMotion ? 0 : 450)
    },
    [reduceMotion, updateEdges],
  )

  useEffect(() => {
    if (!isDesktop) return

    const section = railRef.current?.closest('section')
    if (!section) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (!section.contains(document.activeElement)) return

      event.preventDefault()
      scrollByCard(event.key === 'ArrowLeft' ? -1 : 1)
    }

    section.addEventListener('keydown', onKeyDown)
    return () => section.removeEventListener('keydown', onKeyDown)
  }, [isDesktop, scrollByCard])

  return (
    <motion.section
      id="work"
      aria-labelledby="projects-heading"
      className="relative z-[1] border-t border-zinc-900 bg-[#0A0B0E]"
      variants={staggerContainer({ reduceMotion })}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      <div className={cn(PAGE_SHELL, 'pt-24 lg:pt-32')}>
        <div
          className={cn(
            COL_HEADING,
            'flex flex-wrap items-start justify-between gap-8',
          )}
        >
          <div className="max-w-2xl">
            <RevealText
              independent={false}
              as="p"
              className="font-mono text-xs tracking-widest text-zinc-500 uppercase"
            >
              03 — Work
            </RevealText>

            <RevealText
              independent={false}
              as="h2"
              id="projects-heading"
              className="og-hero-display mt-5 text-[clamp(2rem,4.5vw,3.25rem)] text-zinc-50"
            >
              Selected work
            </RevealText>

            <RevealText
              independent={false}
              as="p"
              className={cn(BODY_CLASS, 'mt-5 max-w-[34ch] text-[16px] sm:text-[18px]')}
            >
              Three covers. Open any one to read how it was thought through.
            </RevealText>
          </div>

          {isDesktop ? (
            <div className="mt-1 flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  void playUiSound('click')
                  scrollByCard(-1)
                }}
                aria-label="Previous project"
                disabled={!canPrev}
                className={cn(
                  'inline-flex items-center gap-1 border-b border-transparent pb-0.5',
                  'font-mono text-xs tracking-widest text-zinc-500 uppercase',
                  'transition-colors duration-200 hover:border-zinc-800 hover:text-white',
                  'focus-visible:outline-none focus-visible:text-white',
                  'disabled:pointer-events-none disabled:opacity-30',
                )}
              >
                <ChevronLeft size={14} aria-hidden />
                Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  void playUiSound('click')
                  scrollByCard(1)
                }}
                aria-label="Next project"
                disabled={!canNext}
                className={cn(
                  'inline-flex items-center gap-1 border-b border-transparent pb-0.5',
                  'font-mono text-xs tracking-widest text-zinc-500 uppercase',
                  'transition-colors duration-200 hover:border-zinc-800 hover:text-white',
                  'focus-visible:outline-none focus-visible:text-white',
                  'disabled:pointer-events-none disabled:opacity-30',
                )}
              >
                Next
                <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-7xl lg:mt-24">
        <div
          ref={railRef}
          tabIndex={0}
          className={cn(
            'og-selected-work w-full pb-24 lg:pb-32',
            'flex flex-col gap-16 px-5 sm:px-6',
            'md:flex-row md:gap-10 md:overflow-x-auto md:snap-x md:snap-mandatory md:scroll-smooth',
            'md:outline-none',
          )}
          aria-label="Selected work"
        >
          {projects.map((project) => {
            const skillDimmed =
              !!highlightedSkill &&
              !skillMatchesStack(highlightedSkill, project.stack)

            return (
              <ProjectCard
                key={project.id}
                year={project.year}
                title={project.title}
                description={project.summary}
                tags={project.tags}
                screenshotSrc={project.screenshotSrc}
                href={project.href}
                hasColorReveal={project.hasColorReveal}
                url={project.previewUrl}
                dimmed={skillDimmed}
                className="md:snap-start"
              />
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
