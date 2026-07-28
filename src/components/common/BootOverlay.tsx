import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { useIntro } from '@/hooks/useIntro'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { INTRO_BOOT_MS } from '@/context/intro-context'
import { playUiSound } from '@/lib/uiSounds'
import {
  lockOrbAnchor,
  setBootLoadActive,
  setBootLoadProgress,
  unlockOrbAnchor,
} from '@/scene/sceneRuntime'
import { cn } from '@/lib/utils'

const STATUS_LINES = [
  'WARMING INFRASTRUCTURE...',
  'INDEXING KNOWLEDGE BASE...',
  'CALIBRATING AGENT PATHS...',
  'SYNCING DEPLOYMENT GRAPH...',
] as const

const DIGITS = '0123456789'
/** Coordinated card dissolve + orb slide to x:2 */
const EXIT_MS = 700
/** Brief hold on 100% before exit timeline */
const HOLD_100_MS = 180

/** Strict display clamp — never above 100 */
function clampPercent(progress: number) {
  if (!Number.isFinite(progress) || progress < 0) return 0
  return Math.min(100, Math.floor(progress))
}

function padPercent(n: number) {
  return String(clampPercent(n)).padStart(3, '0')
}

/** Scramble digits without ever displaying a value above 100 */
function scrambleToward(target: string, frame: number) {
  const next = target
    .split('')
    .map((char, index) => {
      if (frame > index + 1) return char
      // Hundreds digit: only 0 or 1 so the number stays ≤ 100
      if (index === 0) return frame > 1 ? char : Math.random() > 0.5 ? '0' : '1'
      return DIGITS[Math.floor(Math.random() * DIGITS.length)]
    })
    .join('')
  const parsed = Number.parseInt(next, 10)
  if (!Number.isFinite(parsed) || parsed > 100) return target
  return next
}

/**
 * Digital scramble on each percent tick — glyphs flicker then settle.
 */
function ScramblePercent({ value }: { value: number }) {
  const reduceMotion = useReducedMotion()
  const safe = clampPercent(value)
  const target = padPercent(safe)
  const [glyphs, setGlyphs] = useState(target)
  const lastTarget = useRef(target)

  useEffect(() => {
    if (reduceMotion) {
      setGlyphs(target)
      lastTarget.current = target
      return
    }

    if (target === lastTarget.current) return
    lastTarget.current = target

    let frame = 0
    const maxFrames = 4
    const id = window.setInterval(() => {
      frame += 1
      setGlyphs(scrambleToward(target, frame))
      if (frame >= maxFrames) {
        setGlyphs(target)
        window.clearInterval(id)
      }
    }, 26)

    return () => window.clearInterval(id)
  }, [target, reduceMotion])

  const display = padPercent(
    Math.min(100, Number.parseInt(glyphs, 10) || safe),
  )

  return (
    <span className="relative inline-flex text-5xl font-medium tracking-[-0.04em] tabular-nums text-[#FAFAFA] sm:text-6xl md:text-7xl">
      {display}
      <span className="text-2xl text-[#A1A1AA] sm:text-3xl">%</span>
    </span>
  )
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Fullscreen HUD preloader — glass box over a live spinning orb, cinematic exit.
 * (Referenced as Preloader in product copy; lives in BootOverlay.tsx.)
 */
export function BootOverlay() {
  const reduceMotion = useReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { phase, playIntro, completeBoot } = useIntro()
  const [percent, setPercent] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)
  const isMobileRef = useRef(isMobile)
  isMobileRef.current = isMobile

  const inBoot = playIntro && phase === 'boot'
  const visible = inBoot || exiting

  // Keep orb centered behind the loader card; drive canvas boot bridge
  useEffect(() => {
    if (!inBoot) return
    setBootLoadActive(true)
    setBootLoadProgress(0)
    lockOrbAnchor(0, 0, 0, { snap: true, lerp: 0.18 })
    return () => {
      setBootLoadActive(false)
    }
  }, [inBoot])

  useEffect(() => {
    if (!inBoot || reduceMotion) {
      if (playIntro && phase === 'boot' && reduceMotion) {
        setBootLoadActive(false)
        unlockOrbAnchor()
        completeBoot()
      }
      return
    }

    doneRef.current = false
    setExiting(false)
    const start = performance.now()
    let raf = 0
    let exitRaf = 0
    let holdTimer = 0

    const runExitTimeline = () => {
      if (doneRef.current) return
      doneRef.current = true
      setPercent(100)
      setBootLoadProgress(100)
      setExiting(true)
      void playUiSound('shutter')

      const exitStart = performance.now()
      const mobile = isMobileRef.current
      lockOrbAnchor(0, 0, 0, { lerp: 0.22 })

      const tickExit = (now: number) => {
        const u = Math.min(1, (now - exitStart) / EXIT_MS)
        const e = easeInOutCubic(u)

        if (mobile) {
          // Mobile: clear upward rise into the title stack — never sideways
          lockOrbAnchor(0, e * 1.05, -0.3 * e, { lerp: 0.28 })
        } else {
          // Desktop: glide into the right orb column
          lockOrbAnchor(e * 2, 0, -1.2 * e, { lerp: 0.28 })
        }

        if (u >= 1) {
          if (mobile) {
            lockOrbAnchor(0, 0.55, -0.35, { lerp: 0.14 })
          } else {
            lockOrbAnchor(2, 0, -1.2, { lerp: 0.14 })
          }
          setBootLoadActive(false)
          completeBoot()
          window.setTimeout(() => {
            unlockOrbAnchor()
            setExiting(false)
          }, 120)
          return
        }
        exitRaf = requestAnimationFrame(tickExit)
      }

      exitRaf = requestAnimationFrame(tickExit)
    }

    const tick = (now: number) => {
      const u = Math.min(1, (now - start) / INTRO_BOOT_MS)
      const progress = Math.min(100, (1 - Math.pow(1 - u, 2.4)) * 100)
      const next = clampPercent(progress)
      setPercent((prev) => Math.min(100, Math.max(prev, next)))
      setBootLoadProgress(next)
      setStatusIdx(
        Math.min(
          STATUS_LINES.length - 1,
          Math.floor(u * STATUS_LINES.length),
        ),
      )

      if (u >= 1) {
        setPercent(100)
        setBootLoadProgress(100)
        holdTimer = window.setTimeout(runExitTimeline, HOLD_100_MS)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(exitRaf)
      window.clearTimeout(holdTimer)
    }
  }, [inBoot, reduceMotion, playIntro, phase, completeBoot])

  // Lock scroll while booting / exiting
  useEffect(() => {
    if (!visible) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = prev
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="boot-overlay"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${padPercent(percent)} percent`}
          className={cn(
            'pointer-events-auto fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/60 backdrop-blur-md transition-opacity duration-700',
          )}
          data-boot-overlay
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(255 255 255 / 0.08) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,rgb(0_0_0/0.2)_55%,rgb(0_0_0/0.55)_100%)]"
          />

          <motion.div
            className={cn(
              'og-boot-hud relative z-[1] mx-4 flex w-full max-w-md flex-col items-center',
              'rounded-[20px] p-8',
            )}
            initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            animate={
              exiting
                ? { opacity: 0, scale: 1.02, filter: 'blur(12px)' }
                : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            }
            transition={{
              duration: EXIT_MS / 1000,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <p className="relative z-[1] text-center text-[12px] font-medium tracking-[0.16em] text-[#6B7280] uppercase">
              Ordinary Ghost // Init
            </p>

            <div className="relative z-[1] mt-8">
              <ScramblePercent value={percent} />
            </div>

            <div className="relative z-[1] mt-8 h-px w-full max-w-[220px] overflow-hidden bg-[rgba(255,255,255,0.08)]">
              <motion.div
                className="h-full bg-[#FAFAFA]"
                initial={false}
                animate={{ width: `${clampPercent(percent)}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
              />
            </div>

            <p
              className={cn(
                'relative z-[1] mt-4 px-1 text-center text-[14px] font-medium tracking-[-0.01em]',
                'text-[#A1A1AA]',
              )}
            >
              {STATUS_LINES[statusIdx]}
            </p>

            <div className="relative z-[1] mt-8 flex w-full justify-between gap-2 text-[12px] tracking-[0.08em] text-[#6B7280] uppercase">
              <span>MEM OK</span>
              <span>GPU LINK</span>
              <span>Z → 5</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
