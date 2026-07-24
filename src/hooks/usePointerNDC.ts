import { useEffect, useRef } from 'react'

export type PointerNDC = {
  x: number
  y: number
  /** true when a pointer is over the document */
  active: boolean
  /** Instantaneous pointer speed in NDC units / ms (smoothed) */
  speed: number
}

/**
 * Window-level pointer NDC (-1…1). Canvas stays pointer-events:none —
 * we still drive mesh tilt from document pointer without blocking UI.
 */
export function usePointerNDC(enabled = true) {
  const pointer = useRef<PointerNDC>({
    x: 0,
    y: 0,
    active: false,
    speed: 0,
  })
  const prev = useRef({ x: 0, y: 0, t: 0 })

  useEffect(() => {
    if (!enabled) {
      pointer.current = { x: 0, y: 0, active: false, speed: 0 }
      return
    }

    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      const x = (event.clientX / w) * 2 - 1
      const y = -((event.clientY / h) * 2 - 1)
      const now = performance.now()
      const dt = Math.max(1, now - (prev.current.t || now))
      const dx = x - prev.current.x
      const dy = y - prev.current.y
      const instant = Math.hypot(dx, dy) / dt
      // Smooth speed — bursty peaks settle quickly
      pointer.current.speed += (instant - pointer.current.speed) * 0.35
      pointer.current.x = x
      pointer.current.y = y
      pointer.current.active = true
      prev.current = { x, y, t: now }
    }

    const onLeave = () => {
      pointer.current.active = false
      pointer.current.speed *= 0.5
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  return pointer
}
