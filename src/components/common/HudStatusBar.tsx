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
 * Ultra-faint technical HUD — local PKT clock, hire status, WebGL FPS.
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
    const id = window.setInterval(() => {
      const ms = Math.max(1, adaptivePerformanceRef.frameMs)
      setFps(Math.round(1000 / ms))
      setWebglOk(!adaptivePerformanceRef.fpsLow)
    }, 250)
    return () => window.clearInterval(id)
  }, [])

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
          'pointer-events-none justify-between opacity-80 max-md:text-[10px] max-md:normal-case max-md:tracking-normal max-md:text-neutral-500 md:justify-start',
        className,
      )}
    >
      <span className="pointer-events-none inline-flex items-center gap-2">
        <span className="text-primary/50" aria-hidden>
          ◆
        </span>
        <span className="text-white/40">PKT</span>
        <span className="tabular-nums text-foreground/55">{time}</span>
        <span className="text-white/20">UTC+5</span>
      </span>

      <span className="hidden h-3 w-px bg-border/50 sm:block" aria-hidden />

      <span className="pointer-events-none inline-flex items-center gap-2">
        <span
          className="size-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgb(52_211_153/0.55)]"
          aria-hidden
        />
        <span className="text-foreground/50 max-md:hidden">
          Online / Available for hire
        </span>
        <span className="text-foreground/50 md:hidden">ONLINE</span>
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
        </>
      ) : null}

      <span className="hidden h-3 w-px bg-border/50 sm:block" aria-hidden />

      <span className="pointer-events-none inline-flex items-center gap-2 tabular-nums">
        <span className={webglOk ? 'text-primary/60' : 'text-amber-400/70'}>
          {webglOk ? 'WEBGL OK' : 'WEBGL LOW'}
        </span>
        <span className="text-white/20">·</span>
        <span className="text-foreground/45">{fps} FPS</span>
      </span>
    </div>
  )
}
