import { lazy, Suspense, useEffect, useState } from 'react'

import { MoonFlat } from '@/components/hero/MoonFlat'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const MoonCanvas = lazy(() => import('@/components/hero/MoonCanvas'))

type MoonNightProps = {
  className?: string
  /** Gate entrance until hero sequence reaches the artwork step */
  ready?: boolean
}

/**
 * Hero moon orchestrator.
 * - Mobile (<768px): flat CSS disc only — Three.js never loaded.
 * - Desktop: flat placeholder immediately, R3F canvas lazy-mounted ~400ms later.
 */
export function MoonNight({ className, ready = true }: MoonNightProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [mount3d, setMount3d] = useState(false)

  useEffect(() => {
    if (!isDesktop) {
      setMount3d(false)
      return
    }
    const timer = window.setTimeout(() => setMount3d(true), 400)
    return () => window.clearTimeout(timer)
  }, [isDesktop])

  if (!isDesktop) {
    return <MoonFlat className={className} ready={ready} />
  }

  return (
    <div className={cn('absolute inset-0', className)} aria-hidden>
      {/* Flat placeholder until chunk loads — headline paints immediately */}
      {!mount3d ? (
        <MoonFlat ready={ready} oversized />
      ) : (
        <Suspense fallback={<MoonFlat ready={ready} oversized />}>
          <MoonCanvas ready={ready} />
        </Suspense>
      )}
    </div>
  )
}
