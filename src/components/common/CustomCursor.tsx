import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { useCanUseCustomCursor } from '@/hooks/useCanUseCustomCursor'
import { playUiSound } from '@/lib/uiSounds'
import { springSoft, springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'

type CursorMode = 'default' | 'hover' | 'view' | 'magnetic'

const MAGNET_SELECTOR =
  '.og-btn, [data-magnetic], [data-cursor="magnetic"], a.og-glass-cta, a.og-glass-cta-fallback'
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"], [data-cursor="view"], .og-interactive'

const MAGNET_RADIUS = 88
const MAGNET_STRENGTH = 0.55

function readMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return 'default'
  if (target.closest('[data-cursor="view"]')) return 'view'
  if (target.closest(MAGNET_SELECTOR)) return 'magnetic'
  if (target.closest(INTERACTIVE_SELECTOR)) return 'hover'
  return 'default'
}

function nearestMagnetic(
  x: number,
  y: number,
): { cx: number; cy: number; dist: number } | null {
  const nodes = document.querySelectorAll<HTMLElement>(MAGNET_SELECTOR)
  let best: { cx: number; cy: number; dist: number } | null = null

  for (const el of nodes) {
    const rect = el.getBoundingClientRect()
    if (rect.width < 4 || rect.height < 4) continue
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.hypot(x - cx, y - cy)
    if (dist > MAGNET_RADIUS) continue
    if (!best || dist < best.dist) best = { cx, cy, dist }
  }

  return best
}

/**
 * Smooth lerped cursor for fine pointers.
 * Touch / coarse / reduced-motion → null (system cursor restored).
 */
export function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const enabled = useCanUseCustomCursor(reduceMotion)
  const [mode, setMode] = useState<CursorMode>('default')
  const [visible, setVisible] = useState(false)
  const lastHoverTarget = useRef<Element | null>(null)
  const raw = useRef({ x: 0, y: 0 })

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  // Dot leads; ring lags slightly for depth against the 3D canvas
  const dotX = useSpring(mouseX, springSnappy)
  const dotY = useSpring(mouseY, springSnappy)
  const ringX = useSpring(mouseX, springSoft)
  const ringY = useSpring(mouseY, springSoft)

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('og-cursor-active')
      return
    }

    document.documentElement.classList.add('og-cursor-active')

    const applyPointer = (clientX: number, clientY: number, target: EventTarget | null) => {
      raw.current.x = clientX
      raw.current.y = clientY

      const magnet = nearestMagnetic(clientX, clientY)
      let nextMode = readMode(target)

      if (magnet) {
        const t =
          (1 - magnet.dist / MAGNET_RADIUS) * MAGNET_STRENGTH
        const mx = clientX + (magnet.cx - clientX) * t
        const my = clientY + (magnet.cy - clientY) * t
        mouseX.set(mx)
        mouseY.set(my)
        nextMode = nextMode === 'view' ? 'view' : 'magnetic'
      } else {
        mouseX.set(clientX)
        mouseY.set(clientY)
      }

      setVisible(true)
      setMode(nextMode)

      // Opt-in UI hover tick when entering a new interactive host
      if (target instanceof Element) {
        const host = target.closest(INTERACTIVE_SELECTOR)
        if (host && host !== lastHoverTarget.current) {
          lastHoverTarget.current = host
          if (
            host.matches(
              'a, button, [role="button"], .og-btn, [data-cursor="hover"], [data-cursor="view"]',
            )
          ) {
            void playUiSound('hover')
          }
        } else if (!host) {
          lastHoverTarget.current = null
        }
      }
    }

    const onMove = (event: MouseEvent) => {
      applyPointer(event.clientX, event.clientY, event.target)
    }

    const onLeave = () => {
      setVisible(false)
      lastHoverTarget.current = null
    }

    const onDown = () => {
      void playUiSound('click')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    window.addEventListener('mousedown', onDown, { passive: true })

    return () => {
      document.documentElement.classList.remove('og-cursor-active')
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('mousedown', onDown)
    }
  }, [enabled, mouseX, mouseY])

  if (!enabled) return null

  const ringScale =
    mode === 'view' ? 0 : mode === 'magnetic' ? 2.35 : mode === 'hover' ? 1.85 : 1
  const dotScale = mode === 'view' ? 0 : mode === 'magnetic' ? 0.7 : mode === 'hover' ? 0.55 : 1

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {/* Lagging ring */}
      <motion.div
        className="absolute top-0 left-0 mix-blend-difference"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          className={cn(
            '-translate-x-1/2 -translate-y-1/2 rounded-full border',
            mode === 'magnetic'
              ? 'border-primary/90'
              : mode === 'hover'
                ? 'border-primary/70'
                : 'border-primary/45',
          )}
          animate={{
            opacity: visible && mode !== 'view' ? 1 : 0,
            scale: ringScale,
            width: mode === 'magnetic' ? 36 : 28,
            height: mode === 'magnetic' ? 36 : 28,
          }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>

      {/* Leading dot / view label */}
      <motion.div
        className="absolute top-0 left-0 mix-blend-difference"
        style={{ x: dotX, y: dotY }}
      >
        <AnimatePresence mode="wait">
          {mode === 'view' ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: visible ? 1 : 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-primary/15 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-primary uppercase backdrop-blur-sm"
            >
              View →
            </motion.div>
          ) : (
            <motion.div
              key="dot"
              initial={false}
              animate={{
                opacity: visible ? 1 : 0,
                scale: dotScale,
              }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="-translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
