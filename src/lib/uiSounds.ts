/**
 * Lightweight Web Audio micro-interaction sounds (hover / click / UI).
 * No ambient music — interaction ticks only. Enabled by default.
 */

export type UiSoundId =
  | 'hover'
  | 'click'
  | 'open'
  | 'close'
  | 'success'
  | 'warp'

type UiAudioEngine = {
  ctx: AudioContext
  master: GainNode
}

let engine: UiAudioEngine | null = null
let muted = false
let lastHoverAt = 0

async function ensureEngine() {
  if (!engine) {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    engine = { ctx, master }
  }
  if (engine.ctx.state === 'suspended') {
    await engine.ctx.resume()
  }
  return engine
}

/** Optional mute for UI ticks only (no ambient music on this site). */
export function setUiSoundsMuted(next: boolean) {
  muted = next
}

function tone(
  e: UiAudioEngine,
  {
    freq,
    freqEnd,
    duration,
    type = 'sine',
    gain = 0.08,
    delay = 0,
  }: {
    freq: number
    freqEnd?: number
    duration: number
    type?: OscillatorType
    gain?: number
    delay?: number
  },
) {
  const t0 = e.ctx.currentTime + delay
  const osc = e.ctx.createOscillator()
  const g = e.ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, freqEnd),
      t0 + duration,
    )
  }
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(e.master)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export async function playUiSound(id: UiSoundId) {
  if (muted) return
  try {
    const e = await ensureEngine()
    switch (id) {
      case 'hover': {
        const now = performance.now()
        if (now - lastHoverAt < 55) return
        lastHoverAt = now
        // Soft high-tech chirp
        tone(e, {
          freq: 1240,
          freqEnd: 1860,
          duration: 0.042,
          gain: 0.028,
          type: 'triangle',
        })
        tone(e, {
          freq: 2480,
          freqEnd: 2100,
          duration: 0.028,
          gain: 0.012,
          type: 'sine',
          delay: 0.008,
        })
        break
      }
      case 'click':
        // Crisp futuristic tick
        tone(e, {
          freq: 520,
          freqEnd: 240,
          duration: 0.07,
          gain: 0.065,
          type: 'sine',
        })
        tone(e, {
          freq: 1400,
          freqEnd: 900,
          duration: 0.04,
          gain: 0.028,
          type: 'triangle',
          delay: 0.012,
        })
        tone(e, {
          freq: 3200,
          freqEnd: 1800,
          duration: 0.025,
          gain: 0.01,
          type: 'square',
          delay: 0.004,
        })
        break
      case 'open':
        tone(e, { freq: 320, freqEnd: 640, duration: 0.14, gain: 0.06, type: 'sine' })
        tone(e, {
          freq: 640,
          freqEnd: 960,
          duration: 0.12,
          gain: 0.035,
          type: 'triangle',
          delay: 0.04,
        })
        break
      case 'close':
        tone(e, { freq: 520, freqEnd: 220, duration: 0.11, gain: 0.05, type: 'sine' })
        break
      case 'success':
        tone(e, { freq: 523, duration: 0.07, gain: 0.05, type: 'triangle' })
        tone(e, {
          freq: 784,
          duration: 0.1,
          gain: 0.045,
          type: 'triangle',
          delay: 0.06,
        })
        break
      case 'warp':
        tone(e, { freq: 110, freqEnd: 880, duration: 0.35, gain: 0.06, type: 'sawtooth' })
        tone(e, {
          freq: 220,
          freqEnd: 60,
          duration: 0.4,
          gain: 0.04,
          type: 'sine',
          delay: 0.08,
        })
        break
    }
  } catch {
    // Autoplay / AudioContext failures are silent
  }
}

export function disposeUiSounds() {
  if (!engine) return
  try {
    void engine.ctx.close()
  } catch {
    // already closed
  }
  engine = null
}
