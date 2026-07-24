import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

type DecryptTextProps = {
  text: string
  className?: string
  /** ms between character settles — hero is slower, section titles faster */
  tickMs?: number
  /** delay before decrypt starts */
  delayMs?: number
  /** When false, shows final text and does not run the effect */
  active?: boolean
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
  id?: string
}

export function DecryptText({
  text,
  className,
  tickMs = 28,
  delayMs = 0,
  active = true,
  as: Tag = 'span',
  id,
}: DecryptTextProps) {
  const reduceMotion = useReducedMotion()
  const [scrambled, setScrambled] = useState('')
  const skip = reduceMotion || !active
  const display = skip ? text : scrambled

  useEffect(() => {
    if (skip) return

    let frame = 0
    let intervalId: number | undefined
    const chars = text.split('')

    const run = () => {
      intervalId = window.setInterval(() => {
        frame += 1
        const progress = Math.floor(frame / 2)

        setScrambled(
          chars
            .map((char, index) => {
              if (char === ' ') return ' '
              if (index < progress) return text[index]
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            })
            .join(''),
        )

        if (progress >= chars.length) {
          setScrambled(text)
          if (intervalId) window.clearInterval(intervalId)
        }
      }, tickMs)
    }

    const timeoutId = window.setTimeout(run, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [text, tickMs, delayMs, skip])

  return (
    <Tag id={id} aria-label={text}>
      <span aria-hidden="true" className={cn(className)}>
        {display || '\u00A0'}
      </span>
    </Tag>
  )
}
