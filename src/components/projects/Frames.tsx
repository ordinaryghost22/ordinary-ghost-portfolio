import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type BrowserFrameProps = {
  children: ReactNode
  url?: string
  className?: string
  /** Quiet product-page chrome — no elevation */
  variant?: 'default' | 'editorial' | 'cover'
  /** Stretch media area to fill parent (archive covers) */
  fill?: boolean
}

/**
 * Minimal browser chrome — product UI is the artwork.
 */
export function BrowserFrame({
  children,
  url = 'app.ordinaryghost.dev',
  className,
  variant = 'default',
  fill = false,
}: BrowserFrameProps) {
  const editorial = variant === 'editorial'
  const cover = variant === 'cover'

  return (
    <div
      className={cn(
        'overflow-hidden bg-[#111111]',
        cover &&
          'flex h-full flex-col rounded-[16px] border border-[rgba(255,255,255,0.1)] shadow-[0_8px_28px_-10px_rgb(0_0_0/0.55)]',
        editorial &&
          !cover &&
          'rounded-[2px] border border-[rgba(255,255,255,0.1)]',
        !editorial &&
          !cover &&
          'rounded-[20px] border border-[rgba(255,255,255,0.08)] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.08)]',
          cover ? 'px-4 py-3' : editorial ? 'px-5 py-3.5' : 'px-4 py-3',
        )}
      >
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 truncate text-center text-[12px] text-[#6B7280]',
            cover || editorial
              ? 'px-2'
              : 'rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#090909] px-3 py-1.5',
          )}
        >
          {url}
        </div>
      </div>
      <div
        className={cn(
          'relative overflow-hidden bg-[#090909]',
          cover && 'min-h-0 flex-1 rounded-b-[12px]',
          !cover && (fill ? 'h-full min-h-0' : 'aspect-[16/10]'),
        )}
      >
        {children}
      </div>
    </div>
  )
}

type DeviceFrameProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'editorial'
}

/**
 * Quiet phone frame — same border language as browser chrome.
 */
export function DeviceFrame({
  children,
  className,
  variant = 'default',
}: DeviceFrameProps) {
  const editorial = variant === 'editorial'

  return (
    <div
      className={cn(
        'mx-auto w-full overflow-hidden bg-[#111111]',
        editorial
          ? 'max-w-[280px] rounded-[28px] border border-[rgba(255,255,255,0.1)] p-2 sm:max-w-[300px]'
          : 'max-w-[280px] rounded-[28px] border border-[rgba(255,255,255,0.08)] p-2 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)] sm:max-w-[300px]',
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[20px] bg-[#090909]">
        <div
          aria-hidden
          className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-[14px] bg-[#111111]"
        />
        <div className="aspect-[9/19] overflow-hidden pt-6">{children}</div>
      </div>
    </div>
  )
}
