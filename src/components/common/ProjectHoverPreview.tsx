import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import type { Project } from '@/data/projects'
import { cn } from '@/lib/utils'

type ProjectHoverPreviewProps = {
  project: Project | null
  className?: string
}

/**
 * Thumbnail anchored to the parent card’s top-right.
 * pointer-events-none so it never steals hover / flickers.
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
          key={project.title}
          aria-hidden
          className={cn(
            'pointer-events-none absolute top-8 right-8 z-20 hidden w-[200px] overflow-hidden rounded-xl md:block',
            'border border-primary/25 bg-[#0c0c0b]/90 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.85)]',
            'backdrop-blur-xl',
            className,
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <div
            className="relative flex h-[120px] items-center justify-center"
            style={{
              background: `linear-gradient(145deg, ${project.preview.from} 0%, ${project.preview.to} 100%)`,
            }}
          >
            <span className="font-display text-3xl font-semibold tracking-[-0.04em] text-white/90">
              {project.preview.monogram}
            </span>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.18),transparent_55%)]" />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="border-t border-white/10 px-3.5 py-2.5">
            <p className="font-display text-sm font-semibold tracking-[-0.02em] text-foreground">
              {project.title}
            </p>
            <p className="mt-0.5 font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              {project.subtitle}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
