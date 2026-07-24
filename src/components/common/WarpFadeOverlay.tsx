import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { sceneRuntimeRef } from '@/scene/sceneRuntime'
import { cn } from '@/lib/utils'

/**
 * Fullscreen dark blur fade driven by camera warp apex.
 * Mounted in the DOM layer above content, below command palette.
 */
export function WarpFadeOverlay() {
  const reduceMotion = useReducedMotion()
  const [fade, setFade] = useState(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setFade(sceneRuntimeRef.cameraWarp.fade)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const visible = fade > 0.01

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="warp-fade"
          aria-hidden
          className={cn(
            'pointer-events-none fixed inset-0 z-[60]',
            'bg-[rgb(6_6_6)]',
          )}
          style={{
            opacity: fade,
            backdropFilter: reduceMotion
              ? undefined
              : `blur(${fade * 18}px)`,
            WebkitBackdropFilter: reduceMotion
              ? undefined
              : `blur(${fade * 18}px)`,
          }}
          initial={false}
        />
      ) : null}
    </AnimatePresence>
  )
}
