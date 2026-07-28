import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type TextBackdropProps = {
  children: ReactNode
  className?: string
  /** Extra classes for the soft wash layer */
  washClassName?: string
}

/**
 * Content-sized legibility wash — soft radial falloff only (no hard rectangular
 * boxes) so typography stays readable over the 3D canvas without clipped edges.
 */
export function TextBackdrop({
  children,
  className,
  washClassName,
}: TextBackdropProps) {
  return (
    <div className={cn('relative isolate', className)}>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute -inset-x-12 -inset-y-14 sm:-inset-x-20 sm:-inset-y-20',
          'bg-[radial-gradient(circle_at_center,rgb(9_9_9/0.85)_0%,rgb(9_9_9/0.45)_35%,rgb(9_9_9/0)_70%)]',
          washClassName,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-[120px]"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
