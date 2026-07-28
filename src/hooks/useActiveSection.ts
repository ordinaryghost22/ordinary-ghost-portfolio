import { useCallback, useEffect, useRef, useState } from 'react'

export const SECTION_NAV_IDS = [
  'home',
  'about',
  'work',
  'method',
  'resume',
  'contact',
] as const

export type SectionNavId = (typeof SECTION_NAV_IDS)[number]

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '-20% 0px -40% 0px',
  threshold: [0, 0.2, 0.5],
}

const DEFAULT_LOCK_MS = 900

type UseActiveSectionResult = {
  activeSectionId: string
  /** Pin active id during programmatic scroll to avoid spy jitter */
  setActiveSection: (id: string, lockMs?: number) => void
}

/**
 * Scroll-spy via IntersectionObserver — marks the section occupying the
 * top-to-middle viewport band (`rootMargin: -20% / -40%`).
 */
export function useActiveSection(
  sectionIds: readonly string[] = SECTION_NAV_IDS,
): UseActiveSectionResult {
  const [activeSectionId, setActiveSectionId] = useState<string>(
    sectionIds[0] ?? 'home',
  )
  const lockIdRef = useRef<string | null>(null)
  const lockTimerRef = useRef<number | null>(null)
  const ratiosRef = useRef<Map<string, number>>(new Map())

  const setActiveSection = useCallback((id: string, lockMs = DEFAULT_LOCK_MS) => {
    setActiveSectionId(id)
    lockIdRef.current = id
    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current)
    }
    lockTimerRef.current = window.setTimeout(() => {
      lockIdRef.current = null
      lockTimerRef.current = null
    }, lockMs)
  }, [])

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const pickActive = () => {
      if (lockIdRef.current) return

      let bestId = sectionIds[0] ?? 'home'
      let bestRatio = -1

      for (const id of sectionIds) {
        const ratio = ratiosRef.current.get(id) ?? 0
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = id
        }
      }

      // Near page top, prefer home even if about peeks into the band
      if (
        window.scrollY < window.innerHeight * 0.35 &&
        (ratiosRef.current.get('home') ?? 0) > 0
      ) {
        bestId = 'home'
      }

      setActiveSectionId((prev) => (prev === bestId ? prev : bestId))
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        ratiosRef.current.set(
          entry.target.id,
          entry.isIntersecting ? entry.intersectionRatio : 0,
        )
      }
      pickActive()
    }, OBSERVER_OPTIONS)

    for (const el of elements) {
      ratiosRef.current.set(el.id, 0)
      observer.observe(el)
    }

    pickActive()

    return () => {
      observer.disconnect()
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current)
      }
    }
  }, [sectionIds])

  return { activeSectionId, setActiveSection }
}
