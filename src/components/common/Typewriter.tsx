import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

type TypewriterProps = {
  text: string
  /** ms before typing begins */
  startDelay?: number
  /** ms per character */
  speed?: number
  /** When false, stay empty until ready (intro gate). Ignored if animation is skipped. */
  active?: boolean
  /** When false, show full text immediately (no typing). */
  enabled?: boolean
  className?: string
  as?: 'span' | 'p'
}

/**
 * Hero-only typewriter. Do not reuse elsewhere without an intentional decision —
 * site-wide copy stays on slide-up-fade / decrypt.
 */
export function Typewriter({
  text,
  startDelay = 0,
  speed = 18,
  active = true,
  enabled = true,
  className,
  as: Tag = 'span',
}: TypewriterProps) {
  const reduceMotion = useReducedMotion()
  const skipAnim = !!reduceMotion || !enabled
  const [display, setDisplay] = useState(() =>
    skipAnim || !enabled ? text : '',
  )
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (skipAnim) {
      setDisplay(text)
      setTyping(false)
      return
    }

    if (!active) {
      setDisplay('')
      setTyping(false)
      return
    }

    setDisplay('')
    setTyping(false)
    let i = 0
    let intervalId: number | undefined

    const startTimeout = window.setTimeout(() => {
      setTyping(true)
      intervalId = window.setInterval(() => {
        i += 1
        setDisplay(text.slice(0, i))
        if (i >= text.length) {
          if (intervalId !== undefined) window.clearInterval(intervalId)
          setTyping(false)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(startTimeout)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [text, startDelay, speed, skipAnim, active])

  return (
    <Tag className={cn('relative inline-block w-full', className)}>
      {/* Invisible full text locks layout — buttons below never jump */}
      <span className="invisible whitespace-pre-wrap" aria-hidden>
        {text}
      </span>
      <span
        className="absolute inset-0 whitespace-pre-wrap"
        aria-hidden={!skipAnim}
      >
        {display}
        {typing ? (
          <span className="ml-0.5 inline-block animate-pulse font-light text-primary">
            |
          </span>
        ) : null}
      </span>
      {skipAnim ? null : <span className="sr-only">{text}</span>}
    </Tag>
  )
}
