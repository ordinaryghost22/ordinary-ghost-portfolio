import { Canvas } from '@react-three/fiber'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { Suspense, useEffect, useRef } from 'react'

import { CeramicMoonScene } from '@/components/hero/CeramicMoonScene'
import { cn } from '@/lib/utils'

/* Max 4px parallax — felt before noticed */
const PARALLAX_MAX = 4
const PARALLAX_LERP = 0.05
const FLOAT_PX = 1.2
const FLOAT_DURATION = 28
const EASE_EXPO = [0.16, 1, 0.3, 1] as const

type MoonCanvasProps = {
  className?: string
  ready?: boolean
}

/**
 * Hero ceramic moon — anchored lower-right, ~30–40% cropped off-frame.
 */
export default function MoonCanvas({
  className,
  ready = true,
}: MoonCanvasProps) {
  const reduceMotion = !!useReducedMotion()
  const targetX = useRef(0)
  const targetY = useRef(0)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const floatPhase = useRef(0)
  const scale = useSpring(ready ? 1 : 0.978, {
    stiffness: 42,
    damping: 24,
    mass: 1.15,
  })

  useEffect(() => {
    scale.set(ready ? 1 : 0.978)
  }, [ready, scale])

  useEffect(() => {
    if (reduceMotion) {
      targetX.current = 0
      targetY.current = 0
      x.set(0)
      y.set(0)
      return
    }

    const onMove = (event: PointerEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      if (cx <= 0 || cy <= 0) return
      const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / cx))
      const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / cy))
      targetX.current = nx * PARALLAX_MAX
      targetY.current = ny * PARALLAX_MAX
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion, x, y])

  useAnimationFrame((_, delta) => {
    if (reduceMotion) {
      x.set(0)
      y.set(0)
      return
    }
    floatPhase.current += delta / 1000
    const float =
      -FLOAT_PX *
      Math.sin((floatPhase.current * Math.PI * 2) / FLOAT_DURATION)
    x.set(x.get() + (targetX.current - x.get()) * PARALLAX_LERP)
    y.set(
      y.get() + (targetY.current + float - y.get()) * PARALLAX_LERP,
    )
  })

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
      aria-hidden
    >
      <motion.div
        className={cn(
          'absolute right-0 bottom-0',
          /* Larger mass, harder crop — ~35% exits lower-right */
          'h-[min(175vw,2100px)] w-[min(175vw,2100px)]',
          'translate-x-[30%] translate-y-[38%]',
          'origin-[40%_45%]',
        )}
        style={{
          ...(reduceMotion ? {} : { x, y, scale }),
          /* Soft radial falloff — silhouette dissolves into the field */
          WebkitMaskImage:
            'radial-gradient(circle at 38% 42%, #000 36%, rgba(0,0,0,0.55) 58%, transparent 74%)',
          maskImage:
            'radial-gradient(circle at 38% 42%, #000 36%, rgba(0,0,0,0.55) 58%, transparent 74%)',
        }}
        initial={false}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{
          opacity: {
            duration: reduceMotion ? 0 : 1.2,
            ease: EASE_EXPO,
          },
        }}
      >
        <Canvas
          className="h-full w-full"
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          camera={{ position: [0.08, -0.36, 4.05], fov: 28, near: 0.1, far: 20 }}
          frameloop={reduceMotion ? 'demand' : 'always'}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <CeramicMoonScene reduceMotion={reduceMotion} />
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  )
}
