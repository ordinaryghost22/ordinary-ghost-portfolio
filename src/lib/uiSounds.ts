/**
 * Web Audio UI ticks + optional ambient sci-fi drone.
 * Ambient starts only after a user gesture (autoplay-safe).
 */

export type UiSoundId =
  | 'hover'
  | 'click'
  | 'pop'
  | 'open'
  | 'close'
  | 'success'
  | 'warp'
  | 'shutter'

type UiAudioEngine = {
  ctx: AudioContext
  master: GainNode
  ambientGain: GainNode
}

type AmbientNodes = {
  oscA: OscillatorNode
  oscB: OscillatorNode
  lfo: OscillatorNode
  lfoGain: GainNode
  filter: BiquadFilterNode
}

let engine: UiAudioEngine | null = null
let ambient: AmbientNodes | null = null
/** Master mute — UI ticks + ambient */
let muted = false
/** Ambient layer preference (still respects muted) */
let ambientDesired = true
let lastHoverAt = 0

const AMBIENT_VOL = 0.15

async function ensureEngine() {
  if (!engine) {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)

    const ambientGain = ctx.createGain()
    ambientGain.gain.value = 0
    ambientGain.connect(master)

    engine = { ctx, master, ambientGain }
  }
  if (engine.ctx.state === 'suspended') {
    await engine.ctx.resume()
  }
  return engine
}

function stopAmbientNodes() {
  if (!ambient) return
  try {
    ambient.oscA.stop()
    ambient.oscB.stop()
    ambient.lfo.stop()
  } catch {
    // already stopped
  }
  try {
    ambient.oscA.disconnect()
    ambient.oscB.disconnect()
    ambient.lfo.disconnect()
    ambient.lfoGain.disconnect()
    ambient.filter.disconnect()
  } catch {
    // ignore
  }
  ambient = null
}

async function syncAmbient() {
  const e = await ensureEngine()
  const shouldPlay = !muted && ambientDesired

  if (!shouldPlay) {
    const t = e.ctx.currentTime
    e.ambientGain.gain.cancelScheduledValues(t)
    e.ambientGain.gain.setTargetAtTime(0, t, 0.08)
    window.setTimeout(() => {
      if (muted || !ambientDesired) stopAmbientNodes()
    }, 400)
    return
  }

  if (!ambient) {
    const filter = e.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 140
    filter.Q.value = 0.7
    filter.connect(e.ambientGain)

    const oscA = e.ctx.createOscillator()
    oscA.type = 'sine'
    oscA.frequency.value = 55
    const oscB = e.ctx.createOscillator()
    oscB.type = 'triangle'
    oscB.frequency.value = 82.5

    const mix = e.ctx.createGain()
    mix.gain.value = 0.45
    oscA.connect(mix)
    oscB.connect(mix)
    mix.connect(filter)

    const lfo = e.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.07
    const lfoGain = e.ctx.createGain()
    lfoGain.gain.value = 28
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    oscA.start()
    oscB.start()
    lfo.start()
    ambient = { oscA, oscB, lfo, lfoGain, filter }
  }

  const t = e.ctx.currentTime
  e.ambientGain.gain.cancelScheduledValues(t)
  e.ambientGain.gain.setTargetAtTime(AMBIENT_VOL, t, 0.35)
}

/** Mute UI ticks + ambient drone. */
export function setUiSoundsMuted(next: boolean) {
  muted = next
  void syncAmbient().catch(() => {})
}

export function getUiSoundsMuted() {
  return muted
}

/** Prefer ambient on/off while unmuted (navbar SOUND toggle). */
export function setAmbientEnabled(next: boolean) {
  ambientDesired = next
  void syncAmbient().catch(() => {})
}

export function getAmbientEnabled() {
  return ambientDesired && !muted
}

/** Combined sound preference for the HUD toggle. */
export function setSoundEnabled(next: boolean) {
  muted = !next
  ambientDesired = next
  void syncAmbient().catch(() => {})
}

export function getSoundEnabled() {
  return !muted
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

/** Soft noise burst through a lowpass — mechanical pop / haptic click. */
function popClick(e: UiAudioEngine) {
  const t0 = e.ctx.currentTime
  const duration = 0.055
  const buffer = e.ctx.createBuffer(1, e.ctx.sampleRate * duration, e.ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.18))
  }
  const src = e.ctx.createBufferSource()
  src.buffer = buffer
  const filter = e.ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  const g = e.ctx.createGain()
  g.gain.setValueAtTime(0.12, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.connect(filter)
  filter.connect(g)
  g.connect(e.master)
  src.start(t0)
  src.stop(t0 + duration + 0.01)

  tone(e, {
    freq: 180,
    freqEnd: 70,
    duration: 0.06,
    gain: 0.05,
    type: 'sine',
  })
}

export async function playUiSound(id: UiSoundId) {
  if (muted) return
  try {
    const e = await ensureEngine()
    // First interaction can unlock ambient if desired
    if (ambientDesired && !ambient) {
      void syncAmbient()
    }
    switch (id) {
      case 'hover': {
        const now = performance.now()
        if (now - lastHoverAt < 55) return
        lastHoverAt = now
        // Soft mechanical tick
        tone(e, {
          freq: 980,
          freqEnd: 1320,
          duration: 0.038,
          gain: 0.022,
          type: 'triangle',
        })
        tone(e, {
          freq: 2100,
          freqEnd: 1600,
          duration: 0.022,
          gain: 0.01,
          type: 'sine',
          delay: 0.006,
        })
        break
      }
      case 'click':
        // Soft mechanical click
        tone(e, {
          freq: 480,
          freqEnd: 210,
          duration: 0.065,
          gain: 0.055,
          type: 'sine',
        })
        tone(e, {
          freq: 1180,
          freqEnd: 760,
          duration: 0.035,
          gain: 0.022,
          type: 'triangle',
          delay: 0.01,
        })
        break
      case 'pop':
        popClick(e)
        try {
          navigator.vibrate?.(10)
        } catch {
          // unsupported
        }
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
      case 'shutter':
        // Low-frequency hum + mechanical shutter click at 100%
        tone(e, {
          freq: 72,
          freqEnd: 48,
          duration: 0.28,
          gain: 0.07,
          type: 'sine',
        })
        tone(e, {
          freq: 160,
          freqEnd: 55,
          duration: 0.18,
          gain: 0.045,
          type: 'triangle',
          delay: 0.02,
        })
        popClick(e)
        break
    }
  } catch {
    // Autoplay / AudioContext failures are silent
  }
}

export function disposeUiSounds() {
  stopAmbientNodes()
  if (!engine) return
  try {
    void engine.ctx.close()
  } catch {
    // already closed
  }
  engine = null
}
