import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import type { Project } from '@/data/projects'
import { cn } from '@/lib/utils'

type ProjectHoverPreviewProps = {
  project: Project | null
  className?: string
}

function monogram(title: string) {
  const parts = title.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return title.slice(0, 2).toUpperCase()
}

/**
 * Optional floating preview — kept for command / future surfaces.
 * Projects section no longer uses card hover thumbnails.
 */
export function ProjectHoverPreview({
  project,
  className,
}: ProjectHoverPreviewProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          key={project.id}
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-8 right-8 z-20 hidden w-[200px] overflow-hidden rounded-[20px] md:block',
            'border border-[rgba(255,255,255,0.08)] bg-[#111111]/95',
            'shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl',
            className,
          )}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <div className="relative flex h-[120px] items-center justify-center bg-[#090909]">
            <span className="text-3xl font-medium tracking-[-0.04em] text-[#FAFAFA]/90">
              {monogram(project.title)}
            </span>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] px-3.5 py-2.5">
            <p className="text-sm font-medium tracking-[-0.02em] text-[#FAFAFA]">
              {project.title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[12px] text-[#6B7280]">
              {project.summary}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
