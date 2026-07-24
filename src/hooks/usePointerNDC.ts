import { useEffect, useRef } from 'react'

export type PointerNDC = {
  x: number
  y: number
  /** true when a pointer is over the document */
  active: boolean
}

/**
 * Window-level pointer NDC (-1…1). Canvas stays pointer-events:none —
 * we still drive mesh tilt from document pointer without blocking UI.
 */
export function usePointerNDC(enabled = true) {
  const pointer = useRef<PointerNDC>({ x: 0, y: 0, active: false })

  useEffect(() => {
    if (!enabled) {
      pointer.current = { x: 0, y: 0, active: false }
      return
    }

    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      pointer.current.x = (event.clientX / w) * 2 - 1
      pointer.current.y = -((event.clientY / h) * 2 - 1)
      pointer.current.active = true
    }

    const onLeave = () => {
      pointer.current.active = false
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
