import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import {
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'

import { springSnappy, springSoft } from '@/lib/motion'
import { playUiSound } from '@/lib/uiSounds'
import { cn } from '@/lib/utils'

type MagneticCoreProps = {
  children: ReactNode
  className?: string
  /** Max pull strength in px when cursor is at the element center */
  strength?: number
  /** Activation radius from element center (px) */
  radius?: number
  /** Play UI hover/click sounds (respects global mute) */
  sound?: boolean
}

const baseClass =
  'inline-flex items-center justify-center will-change-transform'

const MAGNET_RADIUS = 50

/**
 * Pull toward cursor only while within `radius` of the element center.
 * Falloff is linear so the button eases back as the pointer leaves.
 */
function pullWithinRadius(
  event: { clientX: number; clientY: number },
  node: HTMLElement,
  strength: number,
  radius: number,
) {
  const rect = node.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = event.clientX - cx
  const dy = event.clientY - cy
  const dist = Math.hypot(dx, dy)
  if (dist > radius || dist < 0.001) {
    return { x: 0, y: 0, active: dist <= radius }
  }
  const t = 1 - dist / radius
  const eased = t * t
  return {
    x: dx * eased * (strength / radius),
    y: dy * eased * (strength / radius),
    active: true,
  }
}

type MagneticLinkProps = MagneticCoreProps &
  Omit<LinkProps, 'className' | 'children'>

export function MagneticLink({
  children,
  className,
  strength = 28,
  radius = MAGNET_RADIUS,
  sound = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: MagneticLinkProps) {
  const reduceMotion = useReducedMotion()
  const nodeRef = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springScale = useSpring(scale, springSnappy)

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : { x: springX, y: springY, scale: springScale }
      }
      className="inline-flex"
    >
      <Link
        {...props}
        ref={nodeRef}
        className={cn(baseClass, className)}
        onPointerEnter={(event) => {
          if (!reduceMotion) scale.set(1.06)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const next = pullWithinRadius(
              event,
              nodeRef.current,
              strength,
              radius,
            )
            x.set(next.x)
            y.set(next.y)
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        {children}
      </Link>
    </motion.div>
  )
}

type MagneticAnchorProps = MagneticCoreProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>

export function MagneticAnchor({
  children,
  className,
  strength = 28,
  radius = MAGNET_RADIUS,
  sound = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: MagneticAnchorProps) {
  const reduceMotion = useReducedMotion()
  const nodeRef = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springScale = useSpring(scale, springSnappy)

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : { x: springX, y: springY, scale: springScale }
      }
      className="inline-flex"
    >
      <a
        {...props}
        ref={nodeRef}
        className={cn(baseClass, className)}
        onPointerEnter={(event) => {
          if (!reduceMotion) scale.set(1.06)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const next = pullWithinRadius(
              event,
              nodeRef.current,
              strength,
              radius,
            )
            x.set(next.x)
            y.set(next.y)
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        {children}
      </a>
    </motion.div>
  )
}

type MagneticNativeButtonProps = MagneticCoreProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export function MagneticNativeButton({
  children,
  className,
  strength = 28,
  radius = MAGNET_RADIUS,
  sound = true,
  type = 'button',
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  ...props
}: MagneticNativeButtonProps) {
  const reduceMotion = useReducedMotion()
  const nodeRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springScale = useSpring(scale, springSnappy)

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : { x: springX, y: springY, scale: springScale }
      }
      className="inline-flex"
    >
      <button
        {...props}
        type={type}
        ref={nodeRef}
        className={cn(baseClass, className)}
        onPointerEnter={(event) => {
          if (!reduceMotion) scale.set(1.06)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const next = pullWithinRadius(
              event,
              nodeRef.current,
              strength,
              radius,
            )
            x.set(next.x)
            y.set(next.y)
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        {children}
      </button>
    </motion.div>
  )
}
