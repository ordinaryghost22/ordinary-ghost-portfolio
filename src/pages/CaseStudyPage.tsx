import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import {
  getAdjacentProjects,
  getProjectBySlug,
} from '@/data/projects'
import {
  BODY_CLASS,
  COL_HEADING,
  LABEL_CLASS,
  META_CLASS,
  PAGE_SHELL,
  TEXT_LINK_CLASS,
  TEXT_LINK_UNDERLINE,
} from '@/lib/editorial'
import { scrollToSection } from '@/lib/scroll'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

/**
 * Per-project case study — content from `projects` data.
 * Placeholder-friendly: always renders a full page for known slugs.
 */
export function CaseStudyPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const project = getProjectBySlug(slug)
  const adjacent = getAdjacentProjects(slug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug])

  if (!project || !adjacent) {
    return <Navigate to="/#work" replace />
  }

  const { prev, next } = adjacent

  return (
    <article className="relative z-[1] min-h-dvh bg-[#0A0B0E]">
      <div className={cn(PAGE_SHELL, 'py-16 md:py-24 lg:py-28')}>
        <div className={COL_HEADING}>
          <button
            type="button"
            onPointerEnter={() => {
              void playUiSound('hover')
            }}
            onClick={() => {
              void playUiSound('click')
              navigate('/#work')
              requestAnimationFrame(() => scrollToSection('work'))
            }}
            className={cn(TEXT_LINK_CLASS, TEXT_LINK_UNDERLINE, 'text-[13px]')}
          >
            <span aria-hidden>←</span>
            Back to work
          </button>

          <p className={cn(LABEL_CLASS, 'mt-12')}>Case study</p>

          <h1 className="og-hero-display mt-5 text-[clamp(2.25rem,8vw,4.25rem)] text-zinc-50">
            {project.title}
          </h1>

          <p className={cn(META_CLASS, 'mt-4 tracking-widest uppercase')}>
            {project.year} · {project.tags.join(' · ')}
          </p>

          <p className={cn(BODY_CLASS, 'mt-8 max-w-[42ch] text-[16px] sm:text-[18px]')}>
            {project.summary}
          </p>

          <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800">
            <img
              src={project.screenshotSrc}
              alt={`${project.title} preview`}
              decoding="async"
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </div>

          <section className="mt-16 border-t border-zinc-900 pt-12">
            <h2 className="og-hero-display text-[24px] text-zinc-50 sm:text-[28px]">Problem</h2>
            <p className={cn(BODY_CLASS, 'mt-4 max-w-[52ch] text-[15px] sm:text-[16px]')}>
              {project.problem}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="og-hero-display text-[24px] text-zinc-50 sm:text-[28px]">Solution</h2>
            <p className={cn(BODY_CLASS, 'mt-4 max-w-[52ch] text-[15px] sm:text-[16px]')}>
              {project.solution.overview}
            </p>
            <p className={cn(BODY_CLASS, 'mt-4 max-w-[52ch] text-[15px] sm:text-[16px]')}>
              {project.solution.architecture}
            </p>
            <p className={cn(BODY_CLASS, 'mt-4 max-w-[52ch] text-[15px] sm:text-[16px]')}>
              {project.solution.ux}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="og-hero-display text-[24px] text-zinc-50 sm:text-[28px]">Outcome</h2>
            <p className={cn(BODY_CLASS, 'mt-4 max-w-[52ch] text-[15px] sm:text-[16px]')}>
              {project.outcome}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="og-hero-display text-[24px] text-zinc-50 sm:text-[28px]">Stack</h2>
            <p className={cn(META_CLASS, 'mt-4 uppercase')}>
              {project.architecture.join(' · ')}
            </p>
          </section>

          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                TEXT_LINK_CLASS,
                TEXT_LINK_UNDERLINE,
                'mt-12 text-[15px]',
              )}
            >
              Open live product
              <span aria-hidden>↗</span>
            </a>
          ) : null}

          <nav
            aria-label="More case studies"
            className="mt-20 flex flex-col gap-6 border-t border-zinc-900 pt-12 sm:flex-row sm:justify-between"
          >
            {prev ? (
              <Link
                to={prev.href}
                onClick={() => {
                  void playUiSound('click')
                }}
                className={cn(TEXT_LINK_CLASS, 'flex flex-col gap-1')}
              >
                <span className={META_CLASS}>← Previous</span>
                <span className="text-zinc-50">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={next.href}
                onClick={() => {
                  void playUiSound('click')
                }}
                className={cn(
                  TEXT_LINK_CLASS,
                  'flex flex-col gap-1 sm:items-end',
                )}
              >
                <span className={META_CLASS}>Next →</span>
                <span className="text-zinc-50">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        </div>
      </div>
    </article>
  )
}
