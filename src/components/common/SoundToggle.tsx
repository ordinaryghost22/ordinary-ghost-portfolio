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
        'og-interactive inline-flex items-center gap-1.5 rounded-md border border-border/50',
        'bg-foreground/[0.03] px-2 py-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase',
        'transition-colors hover:border-amber-500/30 hover:text-amber-300',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        enabled && 'border-amber-500/25 text-amber-200/90',
        className,
      )}
    >
      <span aria-hidden>{enabled ? '🔊' : '🔇'}</span>
      <span>
        SOUND:{' '}
        <span className={enabled ? 'text-amber-300' : 'text-neutral-500'}>
          {enabled ? 'ON' : 'OFF'}
        </span>
      </span>
    </button>
  )
}
