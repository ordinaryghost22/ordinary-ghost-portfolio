import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type SurfacePanelProps = {
  children: ReactNode
  className?: string
  /** Soft top edge light — monochrome hairline */
  edgeLight?: boolean
}

/**
 * Opaque frosted panel — quiet surface for content over the canvas.
 */
export function SurfacePanel({
  children,
  className,
  edgeLight = true,
}: SurfacePanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.08)]',
        'bg-[rgb(17_17_17/0.94)] backdrop-blur-xl',
        'shadow-[0_4px_16px_-4px_rgb(0_0_0/0.4)]',
        className,
      )}
    >
      {edgeLight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
