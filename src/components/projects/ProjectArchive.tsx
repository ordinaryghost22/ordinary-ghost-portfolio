import { Link } from 'react-router-dom'

import { BrowserFrame } from '@/components/projects/Frames'
import {
  IRepairLoginMockup,
  OrdinaryGhostMockup,
  TutorMockup,
} from '@/components/projects/ProductMockups'
import type { Project } from '@/data/projects'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

function CoverFace({ project }: { project: Project }) {
  if (project.cover === 'irepair-login') return <IRepairLoginMockup />
  if (project.cover === 'tutor') return <TutorMockup />
  return <OrdinaryGhostMockup />
}

/**
 * Legacy archive cover — kept for case-study pages.
 * Selected Work uses {@link ProjectCard} instead.
 */
export function ArchiveCover({
  project,
  active,
  dimmed,
}: {
  project: Project
  active: boolean
  dimmed?: boolean
}) {
  return (
    <article
      data-archive-cover
      data-project-id={project.id}
      className={cn(
        'og-archive-cover group relative flex h-[min(70vh,720px)] w-[min(80vw,1400px)] shrink-0 snap-center flex-col',
        'origin-center transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        active ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-[0.78]',
        dimmed && 'opacity-40',
      )}
    >
      <Link
        to={project.href}
        onPointerEnter={() => {
          void playUiSound('hover')
        }}
        onClick={() => {
          void playUiSound('click')
        }}
        className={cn(
          'flex h-full flex-col outline-none',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-[#090909]',
        )}
        aria-label={`${project.title} — Explore case study`}
      >
        <div
          className={cn(
            'relative min-h-0 flex-[0.65]',
            'transition-[transform,box-shadow] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:-translate-y-0.5',
          )}
        >
          <BrowserFrame
            variant="cover"
            url={project.previewUrl}
            className={cn(
              'h-full transition-[box-shadow] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:shadow-[0_14px_36px_-12px_rgb(0_0_0/0.65)]',
            )}
          >
            <CoverFace project={project} />
          </BrowserFrame>
        </div>

        <div className="flex min-h-0 flex-[0.35] flex-col justify-between pt-8 sm:pt-10">
          <div>
            <p className="text-[12px] font-medium tracking-[0.14em] text-[#6B7280] tabular-nums uppercase">
              {project.year}
            </p>
            <h3 className="mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[#FAFAFA]">
              {project.title}
            </h3>
            <p className="mt-4 max-w-[36ch] text-[16px] leading-[1.6] tracking-[-0.011em] text-[#A1A1AA] sm:text-[17px]">
              {project.summary}
            </p>
            <p className="mt-5 text-[12px] tracking-[0.04em] text-[#6B7280]">
              {project.tags.join(' · ')}
            </p>
          </div>

          <span
            className={cn(
              'mt-8 inline-flex items-center gap-2 text-[14px] font-medium tracking-[-0.01em] text-[#FAFAFA]',
            )}
          >
            Explore Case Study
            <span
              aria-hidden
              className="inline-block transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[3px]"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  )
}
