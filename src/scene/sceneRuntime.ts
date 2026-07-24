/**
 * Mutable runtime bridge between DOM (nav, audio UI) and the R3F canvas.
 * Read/write from useFrame without React re-renders.
 */

export type AudioBands = {
  /** 0–1 smoothed bass energy */
  bass: number
  /** 0–1 mid energy */
  mid: number
  /** 0–1 high / treble energy */
  treble: number
  /** Combined loudness 0–1 */
  level: number
  enabled: boolean
}

export type WarpPhase = 'idle' | 'zooming' | 'apex' | 'resetting'

export type CameraWarpState = {
  phase: WarpPhase
  /** 0–1 within the current phase */
  t: number
  targetSection: string | null
  /** Invoked once at apex (scroll / route jump) */
  onApex: (() => void) | null
  /** Screen fade 0–1 driven by the warp controller */
  fade: number
}

export type CameraEntranceState = {
  /** Fly-through from far Z → home is running */
  active: boolean
  /** 0–1 progress */
  t: number
  /** Motion-blur strength 0–1 for DOM / post FX */
  blur: number
  /** Set true when fly-through finishes */
  complete: boolean
}

/**
 * DOM-driven orb placement during preloader.
 * When locked, NeuralOrb ignores scroll section staging.
 */
export type OrbAnchorState = {
  locked: boolean
  /** One-shot snap of live position to targets */
  snap: boolean
  x: number
  y: number
  z: number
  /** Position lerp while locked (higher = snappier exit) */
  lerp: number
}

/** Cursor-driven FX — bloom / dust speed pulses from mouse velocity */
export type OrbFxState = {
  /** Extra bloom intensity 0–1 (settles to 0) */
  bloomBoost: number
  /** Multiplier on ambient dust / particle drift (1 = rest) */
  particleSpeed: number
}

/** Preloader → canvas bridge (read in useFrame, no React re-renders) */
export type BootLoadState = {
  /** True while BootOverlay owns the screen (including exit dissolve) */
  active: boolean
  /** 0–100 load percentage */
  progress: number
}

export type SceneRuntime = {
  audio: AudioBands
  cameraWarp: CameraWarpState
  cameraEntrance: CameraEntranceState
  orbAnchor: OrbAnchorState
  orbFx: OrbFxState
  boot: BootLoadState
}

export const sceneRuntimeRef: SceneRuntime = {
  audio: {
    bass: 0,
    mid: 0,
    treble: 0,
    level: 0,
    enabled: false,
  },
  cameraWarp: {
    phase: 'idle',
    t: 0,
    targetSection: null,
    onApex: null,
    fade: 0,
  },
  cameraEntrance: {
    active: false,
    t: 0,
    blur: 0,
    complete: false,
  },
  orbAnchor: {
    locked: false,
    snap: false,
    x: 0,
    y: 0,
    z: 0,
    lerp: 0.12,
  },
  orbFx: {
    bloomBoost: 0,
    particleSpeed: 1,
  },
  boot: {
    active: false,
    progress: 0,
  },
}

/** Pre-punch start — enough depth for a readable 0.6s rush into Z:5 */
export const CAMERA_ENTRANCE_START = {
  position: [0, 0.06, 8.6] as [number, number, number],
  fov: 46,
}

/** Default camera pose — keep in sync with SceneCanvas camera props */
export const CAMERA_HOME = {
  position: [0, 0, 5] as [number, number, number],
  fov: 40,
  lookAt: [0, 0, 0] as [number, number, number],
}

/** Deep zoom target — through the orb core */
export const CAMERA_WARP = {
  position: [0, 0.05, 0.35] as [number, number, number],
  fov: 95,
}

export function requestCameraWarp(
  targetSection: string,
  onApex: () => void,
) {
  const warp = sceneRuntimeRef.cameraWarp
  if (warp.phase !== 'idle') return false
  if (sceneRuntimeRef.cameraEntrance.active) return false

  warp.phase = 'zooming'
  warp.t = 0
  warp.targetSection = targetSection
  warp.onApex = onApex
  warp.fade = 0
  return true
}

export function resetCameraWarp() {
  const warp = sceneRuntimeRef.cameraWarp
  warp.phase = 'idle'
  warp.t = 0
  warp.targetSection = null
  warp.onApex = null
  warp.fade = 0
}

export function startCameraEntrance() {
  const entrance = sceneRuntimeRef.cameraEntrance
  entrance.active = true
  entrance.t = 0
  entrance.blur = 0
  entrance.complete = false
}

export function resetCameraEntrance() {
  const entrance = sceneRuntimeRef.cameraEntrance
  entrance.active = false
  entrance.t = 0
  entrance.blur = 0
  entrance.complete = false
}

/** Center / stage the orb behind the preloader (or slide to hero column). */
export function lockOrbAnchor(
  x: number,
  y: number,
  z: number,
  opts?: { snap?: boolean; lerp?: number },
) {
  const anchor = sceneRuntimeRef.orbAnchor
  anchor.locked = true
  anchor.x = x
  anchor.y = y
  anchor.z = z
  if (opts?.snap) anchor.snap = true
  if (opts?.lerp != null) anchor.lerp = opts.lerp
}

export function unlockOrbAnchor() {
  const anchor = sceneRuntimeRef.orbAnchor
  anchor.locked = false
  anchor.snap = false
  anchor.lerp = 0.12
}

export function setBootLoadActive(active: boolean) {
  sceneRuntimeRef.boot.active = active
  if (!active) sceneRuntimeRef.boot.progress = 100
}

/** Drive orb scale / emissive from the HUD counter (0–100). */
export function setBootLoadProgress(progress: number) {
  sceneRuntimeRef.boot.progress = Math.min(100, Math.max(0, progress))
}
