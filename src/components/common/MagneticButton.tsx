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
  /** Class for the outer magnetic motion wrapper */
  containerClassName?: string
  /**
   * Trailing glyph (e.g. →) that travels farther than the shell
   * for a layered depth effect.
   */
  depthGlyph?: ReactNode
  /** Play UI hover/click sounds (respects global mute) */
  sound?: boolean
}

const baseClass =
  'inline-flex items-center justify-center gap-2 will-change-transform'

/** Pull factor for the button shell toward the cursor */
const SHELL_PULL = 0.2
/** Icon travels farther than the shell for depth */
const GLYPH_PULL = 0.38

/**
 * Translate toward cursor: distance from center × pull factor.
 */
function magnetOffset(
  event: { clientX: number; clientY: number },
  node: HTMLElement,
  pull: number,
) {
  const rect = node.getBoundingClientRect()
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  return { x: dx * pull, y: dy * pull }
}

function useMagneticSpring() {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  const glyphX = useMotionValue(0)
  const glyphY = useMotionValue(0)
  const springX = useSpring(x, springSoft)
  const springY = useSpring(y, springSoft)
  const springScale = useSpring(scale, springSnappy)
  const springGlyphX = useSpring(glyphX, springSoft)
  const springGlyphY = useSpring(glyphY, springSoft)
  return {
    reduceMotion,
    x,
    y,
    scale,
    glyphX,
    glyphY,
    springX,
    springY,
    springScale,
    springGlyphX,
    springGlyphY,
  }
}

function MagneticChildren({
  children,
  depthGlyph,
  glyphX,
  glyphY,
  reduceMotion,
}: {
  children: ReactNode
  depthGlyph?: ReactNode
  glyphX: ReturnType<typeof useSpring>
  glyphY: ReturnType<typeof useSpring>
  reduceMotion: boolean | null
}) {
  if (!depthGlyph) return children
  return (
    <>
      <span className="relative z-[1]">{children}</span>
      <motion.span
        aria-hidden
        className="relative z-[2] inline-flex will-change-transform"
        style={
          reduceMotion
            ? undefined
            : { x: glyphX, y: glyphY }
        }
      >
        {depthGlyph}
      </motion.span>
    </>
  )
}

type MagneticLinkProps = MagneticCoreProps &
  Omit<LinkProps, 'className' | 'children'>

export function MagneticLink({
  children,
  className,
  containerClassName,
  depthGlyph,
  sound = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  onPointerDown,
  ...props
}: MagneticLinkProps) {
  const nodeRef = useRef<HTMLAnchorElement>(null)
  const {
    reduceMotion,
    x,
    y,
    scale,
    glyphX,
    glyphY,
    springX,
    springY,
    springScale,
    springGlyphX,
    springGlyphY,
  } = useMagneticSpring()

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : { x: springX, y: springY, scale: springScale }
      }
      className={cn('inline-flex', containerClassName)}
    >
      <Link
        {...props}
        ref={nodeRef}
        className={cn(baseClass, className)}
        onPointerEnter={(event) => {
          if (!reduceMotion) scale.set(1.05)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const shell = magnetOffset(event, nodeRef.current, SHELL_PULL)
            x.set(shell.x)
            y.set(shell.y)
            if (depthGlyph) {
              const glyph = magnetOffset(event, nodeRef.current, GLYPH_PULL)
              glyphX.set(glyph.x - shell.x)
              glyphY.set(glyph.y - shell.y)
            }
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          glyphX.set(0)
          glyphY.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onPointerDown={(event) => {
          if (sound) void playUiSound('pop')
          onPointerDown?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        <MagneticChildren
          depthGlyph={depthGlyph}
          glyphX={springGlyphX}
          glyphY={springGlyphY}
          reduceMotion={reduceMotion}
        >
          {children}
        </MagneticChildren>
      </Link>
    </motion.div>
  )
}

type MagneticAnchorProps = MagneticCoreProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>

export function MagneticAnchor({
  children,
  className,
  containerClassName,
  depthGlyph,
  sound = true,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  onPointerDown,
  ...props
}: MagneticAnchorProps) {
  const nodeRef = useRef<HTMLAnchorElement>(null)
  const {
    reduceMotion,
    x,
    y,
    scale,
    glyphX,
    glyphY,
    springX,
    springY,
    springScale,
    springGlyphX,
    springGlyphY,
  } = useMagneticSpring()

  return (
    <motion.div
      style={
        reduceMotion
          ? undefined
          : { x: springX, y: springY, scale: springScale }
      }
      className={cn('inline-flex', containerClassName)}
    >
      <a
        {...props}
        ref={nodeRef}
        className={cn(baseClass, className)}
        onPointerEnter={(event) => {
          if (!reduceMotion) scale.set(1.05)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const shell = magnetOffset(event, nodeRef.current, SHELL_PULL)
            x.set(shell.x)
            y.set(shell.y)
            if (depthGlyph) {
              const glyph = magnetOffset(event, nodeRef.current, GLYPH_PULL)
              glyphX.set(glyph.x - shell.x)
              glyphY.set(glyph.y - shell.y)
            }
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          glyphX.set(0)
          glyphY.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onPointerDown={(event) => {
          if (sound) void playUiSound('pop')
          onPointerDown?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        <MagneticChildren
          depthGlyph={depthGlyph}
          glyphX={springGlyphX}
          glyphY={springGlyphY}
          reduceMotion={reduceMotion}
        >
          {children}
        </MagneticChildren>
      </a>
    </motion.div>
  )
}

type MagneticNativeButtonProps = MagneticCoreProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

export function MagneticNativeButton({
  children,
  className,
  depthGlyph,
  sound = true,
  type = 'button',
  onClick,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  onPointerDown,
  ...props
}: MagneticNativeButtonProps) {
  const nodeRef = useRef<HTMLButtonElement>(null)
  const {
    reduceMotion,
    x,
    y,
    scale,
    glyphX,
    glyphY,
    springX,
    springY,
    springScale,
    springGlyphX,
    springGlyphY,
  } = useMagneticSpring()

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
          if (!reduceMotion) scale.set(1.05)
          if (sound) void playUiSound('hover')
          onPointerEnter?.(event)
        }}
        onPointerMove={(event) => {
          if (!reduceMotion && nodeRef.current) {
            const shell = magnetOffset(event, nodeRef.current, SHELL_PULL)
            x.set(shell.x)
            y.set(shell.y)
            if (depthGlyph) {
              const glyph = magnetOffset(event, nodeRef.current, GLYPH_PULL)
              glyphX.set(glyph.x - shell.x)
              glyphY.set(glyph.y - shell.y)
            }
          }
          onPointerMove?.(event)
        }}
        onPointerLeave={(event) => {
          x.set(0)
          y.set(0)
          glyphX.set(0)
          glyphY.set(0)
          scale.set(1)
          onPointerLeave?.(event)
        }}
        onPointerDown={(event) => {
          if (sound) void playUiSound('pop')
          onPointerDown?.(event)
        }}
        onClick={(event) => {
          if (sound) void playUiSound('click')
          onClick?.(event)
        }}
      >
        <MagneticChildren
          depthGlyph={depthGlyph}
          glyphX={springGlyphX}
          glyphY={springGlyphY}
          reduceMotion={reduceMotion}
        >
          {children}
        </MagneticChildren>
      </button>
    </motion.div>
  )
}
