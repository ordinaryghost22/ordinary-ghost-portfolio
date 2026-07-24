import { useEffect, useState } from 'react'

import { adaptivePerformanceRef } from '@/scene/adaptivePerformance'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_WHATSAPP_HREF,
} from '@/data/contact'
import { cn } from '@/lib/utils'

type HudStatusBarProps = {
  className?: string
  /** Compact strip for hero; fuller row for footer */
  variant?: 'hero' | 'footer'
}

function formatPktTime(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Status strip — availability + PKT clock (hero), plus contact / FPS (footer).
 */
export function HudStatusBar({
  className,
  variant = 'footer',
}: HudStatusBarProps) {
  const [time, setTime] = useState(() => formatPktTime(new Date()))
  const [fps, setFps] = useState(60)
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTime(formatPktTime(new Date()))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (variant !== 'footer') return
    const id = window.setInterval(() => {
      const ms = Math.max(1, adaptivePerformanceRef.frameMs)
      setFps(Math.round(1000 / ms))
      setWebglOk(!adaptivePerformanceRef.fpsLow)
    }, 250)
    return () => window.clearInterval(id)
  }, [variant])

  return (
    <div
      role="status"
      aria-label="System status"
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-1.5',
        'font-mono text-[9px] tracking-[0.16em] text-white/30 uppercase sm:text-[10px]',
        variant === 'footer' &&
          'justify-between border border-border/40 bg-foreground/[0.02] px-3 py-2 sm:px-4',
        variant === 'hero' &&
          'pointer-events-none justify-start gap-x-3 gap-y-1 opacity-90 max-sm:text-[8px] max-sm:tracking-[0.12em] sm:gap-x-6',
        className,
      )}
    >
      <span className="pointer-events-none inline-flex items-center gap-1.5 sm:gap-2">
        <span
          className="size-1.5 shrink-0 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgb(52_211_153/0.55)]"
          aria-hidden
        />
        <span className="text-foreground/55 max-sm:truncate">
          <span className="sm:hidden">Available</span>
          <span className="hidden sm:inline">Available for hire</span>
        </span>
      </span>

      <span className="hidden h-3 w-px bg-border/50 sm:block" aria-hidden />

      <span className="pointer-events-none inline-flex shrink-0 items-center gap-1.5 sm:gap-2">
        <span className="text-white/40">PKT</span>
        <span className="tabular-nums text-foreground/55">{time}</span>
        <span className="hidden text-white/25 sm:inline">(UTC+5)</span>
      </span>

      {variant === 'footer' ? (
        <>
          <span className="hidden h-3 w-px bg-border/50 sm:block" aria-hidden />
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 normal-case tracking-normal">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground/45 transition-colors hover:text-amber-400"
            >
              {CONTACT_EMAIL}
            </a>
            <span className="text-white/20" aria-hidden>
              ·
            </span>
            <a
              href={CONTACT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/45 transition-colors hover:text-amber-400"
            >
              {CONTACT_PHONE}
            </a>
          </span>

          <span className="hidden h-3 w-px bg-border/50 sm:block" aria-hidden />

          <span className="pointer-events-none inline-flex items-center gap-2 tabular-nums">
            <span className={webglOk ? 'text-primary/60' : 'text-amber-400/70'}>
              {webglOk ? 'WEBGL OK' : 'WEBGL LOW'}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-foreground/45">{fps} FPS</span>
          </span>
        </>
      ) : null}
    </div>
  )
}
