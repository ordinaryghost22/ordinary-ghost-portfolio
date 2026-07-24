import { createContext } from 'react'

export const INTRO_KEY = 'og-intro-complete'

/** HUD boot counter duration */
export const INTRO_BOOT_MS = 2400
/** Nav chrome as camera settles at Z:5 */
export const INTRO_NAV_MS = 40
/** Hero copy stagger window after nav */
export const INTRO_HERO_MS = 720
/** Total post-flyin settle before marking complete */
export const INTRO_SETTLE_MS = 1400

export type IntroPhase =
  | 'boot'
  | 'flyin'
  | 'nav'
  | 'hero'
  | 'ready'

export type IntroContextValue = {
  phase: IntroPhase
  playIntro: boolean
  heroReady: boolean
  navReady: boolean
  /** Progress 0–1 while boot overlay is visible (coarse; canvas reads sceneRuntime) */
  bootProgress: number
  /** Called by BootOverlay when the counter hits 100% */
  completeBoot: () => void
  /** Called when camera fly-through finishes */
  completeFlyin: () => void
}

export const IntroContext = createContext<IntroContextValue | null>(null)

export function readIntroComplete() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}

export function writeIntroComplete() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}
