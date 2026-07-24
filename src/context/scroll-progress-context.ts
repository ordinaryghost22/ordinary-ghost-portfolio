import { createContext } from 'react'

export type SectionKey =
  | 'hero'
  | 'about'
  | 'projects'
  | 'skills'
  | 'resume'
  | 'contact'

export type SectionProgress = Record<SectionKey, number>

export type ScrollProgressValue = {
  globalProgress: number
  sectionProgress: SectionProgress
}

export const SECTION_IDS: Record<SectionKey, string> = {
  hero: 'home',
  about: 'about',
  projects: 'projects',
  skills: 'skills',
  resume: 'resume',
  contact: 'contact',
}

export const emptySectionProgress = (): SectionProgress => ({
  hero: 0,
  about: 0,
  projects: 0,
  skills: 0,
  resume: 0,
  contact: 0,
})

export const ScrollProgressContext = createContext<ScrollProgressValue | null>(
  null,
)

/** Mutable snapshot for R3F useFrame — avoids stale React closures */
export const scrollProgressRef: { current: ScrollProgressValue } = {
  current: {
    globalProgress: 0,
    sectionProgress: emptySectionProgress(),
  },
}
