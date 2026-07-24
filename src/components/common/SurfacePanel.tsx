import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SurfacePanelProps = {
  children: ReactNode
  className?: string
  /** Soft gold edge light at top */
  edgeLight?: boolean
}

/**
 * Opaque frosted panel — kills orb mesh through content while keeping
 * a premium glass edge (not a flat cardboard card).
 */
export function SurfacePanel({
  children,
  className,
  edgeLight = true,
}: SurfacePanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/70',
        'bg-[rgb(11_11_10/0.92)] backdrop-blur-xl',
        'shadow-[0_24px_80px_-40px_rgb(0_0_0/0.9)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(198_161_91/0.06),transparent_55%)]"
      />
      {edgeLight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent"
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
