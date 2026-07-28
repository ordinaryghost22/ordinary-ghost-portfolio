import {
  useCallback,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type MagneticCardProps = {
  children: ReactNode
  className?: string
  /** Disable tilt / spotlight (reduced motion, touch) */
  disabled?: boolean
}

/** Quiet perspective — presence without spectacle */
const MAX_TILT = 4

/**
 * Case-study card shell: soft spotlight + restrained tilt.
 * Sets --mouse-x / --mouse-y for a monochrome wash.
 */
export function MagneticCard({
  children,
  className,
  disabled = false,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const nx = (px / rect.width) * 2 - 1
      const ny = (py / rect.height) * 2 - 1
      node.style.setProperty('--mouse-x', `${px}px`)
      node.style.setProperty('--mouse-y', `${py}px`)
      node.style.transform = `perspective(1000px) rotateX(${(-ny * MAX_TILT).toFixed(2)}deg) rotateY(${(nx * MAX_TILT).toFixed(2)}deg)`
    },
    [disabled],
  )

  const onPointerLeave = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    node.style.setProperty('--mouse-x', '50%')
    node.style.setProperty('--mouse-y', '50%')
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
          transformStyle: 'preserve-3d',
          transition: disabled
            ? undefined
            : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        } as CSSProperties
      }
      className={cn(
        'group/card relative will-change-transform',
        !disabled && 'hover:z-10',
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-[250ms]',
          'bg-[radial-gradient(500px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.04),transparent_42%)]',
          !disabled && 'group-hover/card:opacity-100',
        )}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
