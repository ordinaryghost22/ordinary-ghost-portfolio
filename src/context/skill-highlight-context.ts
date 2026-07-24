import { createContext, useContext } from 'react'

export type SkillHighlightContextValue = {
  highlightedSkill: string | null
  setHighlightedSkill: (skill: string | null) => void
}

export const SkillHighlightContext =
  createContext<SkillHighlightContextValue | null>(null)

export function useSkillHighlight() {
  const ctx = useContext(SkillHighlightContext)
  if (!ctx) {
    throw new Error(
      'useSkillHighlight must be used within SkillHighlightProvider',
    )
  }
  return ctx
}

/** Optional — Projects can render without a provider during tests */
export function useSkillHighlightOptional() {
  return useContext(SkillHighlightContext)
}
