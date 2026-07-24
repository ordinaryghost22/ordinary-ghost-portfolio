/**
 * In-page section scroll — React Router hash Links update the URL but do not
 * reliably scroll when already on `/`.
 */
import { playUiSound } from '@/lib/uiSounds'
import { requestCameraWarp } from '@/scene/sceneRuntime'

export function scrollToSection(
  id: string,
  behavior: ScrollBehavior = 'smooth',
): boolean {
  const prefersReduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const scrollBehavior: ScrollBehavior = prefersReduce ? 'auto' : behavior

  if (!id || id === 'home') {
    window.scrollTo({ top: 0, behavior: scrollBehavior })
    return true
  }

  const el = document.getElementById(id)
  if (!el) return false

  el.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
  return true
}

/**
 * Camera warp → dark fade at apex → scroll jump → camera reset.
 * Falls back to immediate scroll if a warp is already running or motion is reduced.
 */
export function navigateWithCameraWarp(
  sectionId: string,
  options?: { skipWarp?: boolean },
): boolean {
  const prefersReduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (options?.skipWarp || prefersReduce || sectionId === 'home') {
    return scrollToSection(sectionId, prefersReduce ? 'auto' : 'smooth')
  }

  const started = requestCameraWarp(sectionId, () => {
    scrollToSection(sectionId, 'auto')
  })

  if (!started) {
    return scrollToSection(sectionId)
  }

  void playUiSound('warp')
  return true
}

/** Normalize nav hrefs like `/#about` or `#about` → `about` */
export function sectionIdFromHref(href: string): string {
  if (href === '/' || href === '') return 'home'
  const hash = href.includes('#') ? href.slice(href.indexOf('#') + 1) : ''
  return hash || 'home'
}
