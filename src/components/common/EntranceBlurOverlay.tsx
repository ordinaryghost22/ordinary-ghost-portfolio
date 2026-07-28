import { useEffect, useState } from 'react'

import { sceneRuntimeRef } from '@/scene/sceneRuntime'
import { cn } from '@/lib/utils'

/**
 * Directional streak / blur overlay driven by camera entrance fly-through.
 * Stands in for a GPU motion-blur pass (keeps the stack light).
 */
export function EntranceBlurOverlay() {
  const [blur, setBlur] = useState(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setBlur(sceneRuntimeRef.cameraEntrance.blur)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (blur < 0.02) return null

  const strength = Math.min(1, blur)

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-[55]')}
      style={{
        opacity: strength * 0.72,
        backdropFilter: `blur(${strength * 14}px) saturate(${1.1 + strength * 0.35})`,
        WebkitBackdropFilter: `blur(${strength * 14}px) saturate(${1.1 + strength * 0.35})`,
        background: `
          linear-gradient(
            90deg,
            rgb(9 9 9 / ${0.18 * strength}) 0%,
            transparent 28%,
            rgb(255 255 255 / ${0.03 * strength}) 50%,
            transparent 72%,
            rgb(9 9 9 / ${0.18 * strength}) 100%
          )
        `,
        transform: `scaleX(${1 + strength * 0.035}) scaleY(${1 + strength * 0.02})`,
        boxShadow: `inset 0 0 ${40 + strength * 80}px rgb(0 0 0 / ${0.35 * strength})`,
      }}
    />
  )
}
