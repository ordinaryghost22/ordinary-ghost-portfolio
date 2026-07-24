import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { useIntro } from '@/hooks/useIntro'
import { INTRO_BOOT_MS } from '@/context/intro-context'
import {
  lockOrbAnchor,
  unlockOrbAnchor,
} from '@/scene/sceneRuntime'
import { cn } from '@/lib/utils'

const STATUS_LINES = [
  'BOOTING_SYSTEM_CORE...',
  'LINKING_NEURAL_MESH...',
  'CALIBRATING_HDRI_MAP...',
  'SYNC_GEOMETRY_BUFFER...',
] as const

const DIGITS = '0123456789'
/** Coordinated card scale-out + orb slide to x:2 */
const EXIT_MS = 550
/** Brief hold on 100% before exit timeline */
const HOLD_100_MS = 160

/** Strict display clamp — never above 100, always zero-padded */
function clampPercent(progress: number) {
  return Math.min(100, Math.floor(progress))
}

function padPercent(n: number) {
  return String(clampPercent(n)).padStart(3, '0')
}

/**
 * Digital scramble on each percent tick — glyphs flicker then settle.
 */
function ScramblePercent({ value }: { value: number }) {
  const reduceMotion = useReducedMotion()
  const target = padPercent(value)
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
      setGlyphs(
        target
          .split('')
          .map((char, index) => {
            if (frame > index + 1) return char
            return DIGITS[Math.floor(Math.random() * DIGITS.length)]
          })
          .join(''),
      )
      if (frame >= maxFrames) {
        setGlyphs(target)
        window.clearInterval(id)
      }
    }, 26)

    return () => window.clearInterval(id)
  }, [target, reduceMotion])

  return (
    <span className="relative inline-flex font-mono text-6xl font-medium tracking-[-0.04em] tabular-nums sm:text-7xl">
      {/* Centered radial glow — transparent fill so only the even halo shows */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none text-transparent"
        style={{ textShadow: '0px 0px 25px rgba(245, 158, 11, 0.75)' }}
      >
        {glyphs}
        <span className="text-2xl sm:text-3xl">%</span>
      </span>
      <span
        className={cn(
          'relative bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700',
          'bg-clip-text text-transparent',
        )}
      >
        {glyphs}
        <span className="bg-gradient-to-b from-amber-200/90 via-amber-400 to-amber-600 bg-clip-text text-2xl text-transparent sm:text-3xl">
          %
        </span>
      </span>
    </span>
  )
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Fullscreen HUD preloader — metallic % counter, centered orb, cinematic exit.
 * (Referenced as Preloader in product copy; lives in BootOverlay.tsx.)
 */
export function BootOverlay() {
  const reduceMotion = useReducedMotion()
  const { phase, playIntro, completeBoot } = useIntro()
  const [percent, setPercent] = useState(0)
  const [statusIdx, setStatusIdx] = useState(0)
  const [exiting, setExiting] = useState(false)
  const doneRef = useRef(false)

  const inBoot = playIntro && phase === 'boot'
  const visible = inBoot || exiting

  // Keep orb centered behind the loader card for the whole boot phase
  useEffect(() => {
    if (!inBoot) return
    lockOrbAnchor(0, 0, 0, { snap: true, lerp: 0.18 })
    return () => {
      // Exit timeline / reduced-motion path owns unlock
    }
  }, [inBoot])

  useEffect(() => {
    if (!inBoot || reduceMotion) {
      if (playIntro && phase === 'boot' && reduceMotion) {
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
      setExiting(true)

      const exitStart = performance.now()
      // Faster lerp so the orb tracks the timeline toward x:2
      lockOrbAnchor(0, 0, 0, { lerp: 0.22 })

      const tickExit = (now: number) => {
        const u = Math.min(1, (now - exitStart) / EXIT_MS)
        const e = easeInOutCubic(u)
        // Orb → right column (x: 2) while card scales to 0
        lockOrbAnchor(e * 2, 0, -1.2 * e, { lerp: 0.28 })

        if (u >= 1) {
          lockOrbAnchor(2, 0, -1.2, { lerp: 0.14 })
          completeBoot()
          // Hand off to NeuralOrb scroll staging after a beat
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
      const progress = (1 - Math.pow(1 - u, 2.4)) * 100
      const next = clampPercent(progress)
      setPercent(next)
      setStatusIdx(
        Math.min(
          STATUS_LINES.length - 1,
          Math.floor(u * STATUS_LINES.length),
        ),
      )

      if (u >= 1) {
        setPercent(100)
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
            'pointer-events-auto fixed inset-0 z-[70] flex flex-col items-center justify-center',
            'bg-[rgb(9_9_11/0.55)] backdrop-blur-[2px]',
          )}
          data-boot-overlay
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(to right, rgb(255 255 255 / 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(255 255 255 / 0.08) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,rgb(9_9_11/0.28)_50%,rgb(9_9_11/0.7)_100%)]"
          />

          <motion.div
            className="og-boot-hud relative z-[1] flex w-full max-w-md flex-col items-center px-6 py-10"
            initial={{ opacity: 1, scale: 1 }}
            animate={
              exiting
                ? { opacity: 0, scale: 0 }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              duration: EXIT_MS / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <p className="relative z-[1] font-mono text-[10px] tracking-[0.28em] text-amber-400/70 uppercase">
              Ordinary Ghost // Init
            </p>

            <div className="relative z-[1] mt-8">
              <ScramblePercent value={percent} />
            </div>

            <div className="relative z-[1] mt-8 h-px w-full max-w-[220px] overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500/40 via-amber-300 to-amber-500/40"
                initial={false}
                animate={{ width: `${clampPercent(percent)}%` }}
                transition={{ duration: 0.08, ease: 'linear' }}
              />
            </div>

            <p className="relative z-[1] mt-5 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              {STATUS_LINES[statusIdx]}
            </p>

            <div className="relative z-[1] mt-10 flex w-full justify-between font-mono text-[9px] tracking-[0.16em] text-white/25 uppercase">
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
