import { useCallback, useEffect, useMemo, type ReactNode } from 'react'

import {
  IntroContext,
  type IntroContextValue,
  writeIntroComplete,
} from '@/context/intro-context'
import {
  resetCameraEntrance,
  unlockOrbAnchor,
} from '@/scene/sceneRuntime'

/**
 * Intro is disabled — app lands on the hero immediately.
 * Context kept so existing consumers (Hero, Navbar, canvas) keep working.
 */
export function IntroProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    writeIntroComplete()
    unlockOrbAnchor()
    resetCameraEntrance()
  }, [])

  const completeBoot = useCallback(() => {}, [])
  const completeFlyin = useCallback(() => {}, [])

  const value = useMemo<IntroContextValue>(
    () => ({
      phase: 'ready',
      playIntro: false,
      heroReady: true,
      navReady: true,
      bootProgress: 1,
      completeBoot,
      completeFlyin,
    }),
    [completeBoot, completeFlyin],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}
