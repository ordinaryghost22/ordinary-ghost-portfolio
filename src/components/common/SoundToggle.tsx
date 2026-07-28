import { useCallback, useEffect, useState } from 'react'

import {
  getSoundEnabled,
  playUiSound,
  setSoundEnabled,
} from '@/lib/uiSounds'
import { cn } from '@/lib/utils'
import { sceneRuntimeRef } from '@/scene/sceneRuntime'

/**
 * Low-profile HUD audio toggle — ambient drone + UI ticks.
 */
export function SoundToggle({ className }: { className?: string }) {
  const [enabled, setEnabled] = useState(() => getSoundEnabled())

  useEffect(() => {
    sceneRuntimeRef.audio.enabled = enabled
  }, [enabled])

  const toggle = useCallback(() => {
    const next = !getSoundEnabled()
    if (next) {
      setSoundEnabled(true)
      setEnabled(true)
      sceneRuntimeRef.audio.enabled = true
      void playUiSound('success')
    } else {
      void playUiSound('close')
      setSoundEnabled(false)
      setEnabled(false)
      sceneRuntimeRef.audio.enabled = false
    }
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      onPointerEnter={() => {
        if (enabled) void playUiSound('hover')
      }}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute sound' : 'Enable sound'}
      className={cn(
        'og-interactive inline-flex items-center gap-1.5 rounded-[14px] border border-[rgba(255,255,255,0.08)]',
        'bg-[#111111] px-3 py-2 text-[12px] font-medium tracking-[-0.01em] text-[#A1A1AA] uppercase',
        'transition-[border-color,color,background-color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:border-[rgba(255,255,255,0.16)] hover:bg-[#171717] hover:text-[#FAFAFA]',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        enabled && 'border-[rgba(255,255,255,0.16)] text-[#FAFAFA]',
        className,
      )}
    >
      <span aria-hidden className="text-[10px] tracking-widest">
        {enabled ? '●' : '○'}
      </span>
      <span>
        SOUND:{' '}
        <span className={enabled ? 'text-[#FAFAFA]' : 'text-[#6B7280]'}>
          {enabled ? 'ON' : 'OFF'}
        </span>
      </span>
    </button>
  )
}
