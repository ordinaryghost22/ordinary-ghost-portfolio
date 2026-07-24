import { useMemo, useState, type ReactNode } from 'react'

import {
  SkillHighlightContext,
  type SkillHighlightContextValue,
} from '@/context/skill-highlight-context'

export function SkillHighlightProvider({ children }: { children: ReactNode }) {
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null)

  const value = useMemo<SkillHighlightContextValue>(
    () => ({ highlightedSkill, setHighlightedSkill }),
    [highlightedSkill],
  )

  return (
    <SkillHighlightContext.Provider value={value}>
      {children}
    </SkillHighlightContext.Provider>
  )
}
