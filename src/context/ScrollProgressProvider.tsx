import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  SECTION_IDS,
  ScrollProgressContext,
  emptySectionProgress,
  scrollProgressRef,
  type ScrollProgressValue,
  type SectionKey,
  type SectionProgress,
} from '@/context/scroll-progress-context'

function measureSectionProgress(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return 0

  const rect = el.getBoundingClientRect()
  const viewH = window.innerHeight || 1
  const start = viewH * 0.85
  const end = viewH * 0.15
  const center = rect.top + rect.height / 2

  if (center >= start) return 0
  if (center <= end) return 1
  return 1 - (center - end) / (start - end)
}

function measureGlobalProgress() {
  const doc = document.documentElement
  const max = doc.scrollHeight - window.innerHeight
  if (max <= 0) return 0
  return Math.min(1, Math.max(0, window.scrollY / max))
}

function measureAll(): ScrollProgressValue {
  const globalProgress = measureGlobalProgress()
  const sectionProgress = emptySectionProgress()

  ;(Object.keys(SECTION_IDS) as SectionKey[]).forEach((key) => {
    sectionProgress[key] = measureSectionProgress(SECTION_IDS[key])
  })

  if (!document.getElementById(SECTION_IDS.contact)) {
    const footer = document.querySelector('footer')
    if (footer) {
      const rect = footer.getBoundingClientRect()
      const viewH = window.innerHeight || 1
      const start = viewH * 0.9
      const end = viewH * 0.2
      const center = rect.top + rect.height / 2
      if (center >= start) sectionProgress.contact = 0
      else if (center <= end) sectionProgress.contact = 1
      else sectionProgress.contact = 1 - (center - end) / (start - end)
    }
  }

  const heroEl = document.getElementById(SECTION_IDS.hero)
  if (!heroEl) {
    sectionProgress.hero = 1
  } else {
    const heroMeas = measureSectionProgress(SECTION_IDS.hero)
    if (window.scrollY < window.innerHeight * 0.5) {
      sectionProgress.hero = Math.max(
        heroMeas,
        1 - window.scrollY / (window.innerHeight * 0.6),
      )
    } else {
      sectionProgress.hero = heroMeas
    }
  }

  return { globalProgress, sectionProgress }
}

export function ScrollProgressProvider({ children }: { children: ReactNode }) {
  const [globalProgress, setGlobalProgress] = useState(0)
  const [sectionProgress, setSectionProgress] = useState<SectionProgress>(
    emptySectionProgress,
  )

  useEffect(() => {
    let frame = 0
    let scheduled = false

    const update = () => {
      scheduled = false
      const next = measureAll()
      scrollProgressRef.current = next
      setGlobalProgress(next.globalProgress)
      setSectionProgress(next.sectionProgress)
    }

    const onScroll = () => {
      if (scheduled) return
      scheduled = true
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const value = useMemo<ScrollProgressValue>(
    () => ({ globalProgress, sectionProgress }),
    [globalProgress, sectionProgress],
  )

  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  )
}
