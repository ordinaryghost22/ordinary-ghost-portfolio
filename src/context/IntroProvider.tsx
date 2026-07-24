import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

import {
  INTRO_HERO_MS,
  INTRO_NAV_MS,
  INTRO_SETTLE_MS,
  IntroContext,
  type IntroContextValue,
  type IntroPhase,
  readIntroComplete,
  writeIntroComplete,
} from '@/context/intro-context'
import {
  resetCameraEntrance,
  startCameraEntrance,
  unlockOrbAnchor,
} from '@/scene/sceneRuntime'

export function IntroProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const alreadyPlayed = useMemo(() => readIntroComplete(), [])
  const skipCinema = alreadyPlayed || reduceMotion === true

  const [phase, setPhase] = useState<IntroPhase>(
    skipCinema ? 'ready' : 'boot',
  )
  const [bootProgress, setBootProgress] = useState(skipCinema ? 1 : 0)

  const playIntro = !alreadyPlayed && reduceMotion === false

  const completeBoot = useCallback(() => {
    setPhase((prev) => {
      if (prev !== 'boot') return prev
      startCameraEntrance()
      return 'flyin'
    })
    setBootProgress(1)
  }, [])

  const completeFlyin = useCallback(() => {
    setPhase((prev) => {
      if (prev !== 'flyin') return prev
      return 'nav'
    })
  }, [])

  // After fly-in: nav → hero → ready
  useEffect(() => {
    if (phase !== 'nav') return

    const toHero = window.setTimeout(() => setPhase('hero'), INTRO_NAV_MS)
    const toReady = window.setTimeout(() => {
      setPhase('ready')
      writeIntroComplete()
      unlockOrbAnchor()
      resetCameraEntrance()
    }, INTRO_SETTLE_MS)

    return () => {
      window.clearTimeout(toHero)
      window.clearTimeout(toReady)
    }
  }, [phase])

  // Honor reduced-motion after hydration
  useEffect(() => {
    if (reduceMotion !== true) return
    setPhase('ready')
    setBootProgress(1)
    unlockOrbAnchor()
    resetCameraEntrance()
  }, [reduceMotion])

  // Soft progress mirror while BootOverlay owns the counter (for consumers)
  useEffect(() => {
    if (phase !== 'boot' || !playIntro) return
    // BootOverlay drives precise %, this is a fallback ceiling
    const id = window.setInterval(() => {
      setBootProgress((p) => Math.min(0.97, p + 0.02))
    }, INTRO_HERO_MS / 20)
    return () => window.clearInterval(id)
  }, [phase, playIntro])

  const value = useMemo<IntroContextValue>(
    () => ({
      phase,
      playIntro,
      heroReady: phase === 'hero' || phase === 'ready',
      navReady:
        phase === 'nav' || phase === 'hero' || phase === 'ready',
      bootProgress,
      completeBoot,
      completeFlyin,
    }),
    [phase, playIntro, bootProgress, completeBoot, completeFlyin],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}
