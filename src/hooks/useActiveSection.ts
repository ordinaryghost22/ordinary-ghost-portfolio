import { useEffect, useState } from 'react'

const DEFAULT_IDS = [
  'home',
  'about',
  'projects',
  'skills',
  'resume',
  'contact',
] as const

/**
 * Scroll-spy active section. Defaults to `home` near the top of the page
 * so Projects never steals the nav highlight on first paint.
 */
export function useActiveSection(
  sectionIds: readonly string[] = DEFAULT_IDS,
  offset = 96,
) {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? 'home')

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const update = () => {
      // Pin Home for the full first viewport so Projects never wins on load
      if (window.scrollY < Math.max(offset * 1.35, window.innerHeight * 0.45)) {
        setActiveId(sectionIds[0] ?? 'home')
        return
      }

      let current = sectionIds[0] ?? 'home'
      for (const el of elements) {
        const top = el.getBoundingClientRect().top
        if (top - offset <= 1) {
          current = el.id
        }
      }
      setActiveId(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [sectionIds, offset])

  return activeId
}
