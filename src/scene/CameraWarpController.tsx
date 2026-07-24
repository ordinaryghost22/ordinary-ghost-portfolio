import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import { useIntro } from '@/hooks/useIntro'
import {
  CAMERA_HOME,
  CAMERA_WARP,
  sceneRuntimeRef,
} from '@/scene/sceneRuntime'

const ZOOM_DURATION = 0.72
const APEX_HOLD = 0.08
const RESET_DURATION = 0.95

function easeInCubic(t: number) {
  return t * t * t
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const homeLook = new THREE.Vector3(...CAMERA_HOME.lookAt)

/**
 * Hyperspace camera warp — zoom through the orb core, fade at apex,
 * then ease back to the ambient home pose after the section jump.
 */
export function CameraWarpController({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const { camera } = useThree()
  const { phase, playIntro } = useIntro()
  const look = useRef(new THREE.Vector3(...CAMERA_HOME.lookAt))
  const apexFired = useRef(false)

  useFrame((_, delta) => {
    const warp = sceneRuntimeRef.cameraWarp
    const cam = camera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.05)

    if (reducedMotion) {
      if (warp.phase !== 'idle') {
        warp.onApex?.()
        warp.onApex = null
        warp.phase = 'idle'
        warp.fade = 0
        warp.t = 0
        apexFired.current = false
      }
      cam.position.set(...CAMERA_HOME.position)
      cam.fov = CAMERA_HOME.fov
      cam.lookAt(homeLook)
      cam.updateProjectionMatrix()
      return
    }

    // Boot / fly-through owns the camera — do not lerp toward home early
    if (
      sceneRuntimeRef.cameraEntrance.active ||
      (playIntro && (phase === 'boot' || phase === 'flyin'))
    ) {
      return
    }

    if (warp.phase === 'idle') {
      cam.position.x += (CAMERA_HOME.position[0] - cam.position.x) * 0.06
      cam.position.y += (CAMERA_HOME.position[1] - cam.position.y) * 0.06
      cam.position.z += (CAMERA_HOME.position[2] - cam.position.z) * 0.06
      cam.fov += (CAMERA_HOME.fov - cam.fov) * 0.06
      look.current.lerp(homeLook, 0.08)
      cam.lookAt(look.current)
      cam.updateProjectionMatrix()
      warp.fade += (0 - warp.fade) * 0.12
      return
    }

    warp.t += dt

    if (warp.phase === 'zooming') {
      const u = Math.min(1, warp.t / ZOOM_DURATION)
      const e = easeInCubic(u)
      cam.position.set(
        lerp(CAMERA_HOME.position[0], CAMERA_WARP.position[0], e),
        lerp(CAMERA_HOME.position[1], CAMERA_WARP.position[1], e),
        lerp(CAMERA_HOME.position[2], CAMERA_WARP.position[2], e),
      )
      cam.fov = lerp(CAMERA_HOME.fov, CAMERA_WARP.fov, e)
      look.current.set(
        lerp(CAMERA_HOME.lookAt[0], 0, e),
        lerp(CAMERA_HOME.lookAt[1], 0, e),
        lerp(CAMERA_HOME.lookAt[2], 0, e),
      )
      cam.lookAt(look.current)
      cam.updateProjectionMatrix()
      // Fade ramps hard in the last third
      warp.fade = easeInCubic(Math.max(0, (u - 0.55) / 0.45))

      if (u >= 1) {
        warp.phase = 'apex'
        warp.t = 0
        apexFired.current = false
      }
      return
    }

    if (warp.phase === 'apex') {
      warp.fade = 1
      cam.position.set(...CAMERA_WARP.position)
      cam.fov = CAMERA_WARP.fov
      cam.lookAt(0, 0, 0)
      cam.updateProjectionMatrix()

      if (!apexFired.current) {
        apexFired.current = true
        const cb = warp.onApex
        warp.onApex = null
        cb?.()
      }

      if (warp.t >= APEX_HOLD) {
        warp.phase = 'resetting'
        warp.t = 0
      }
      return
    }

    if (warp.phase === 'resetting') {
      const u = Math.min(1, warp.t / RESET_DURATION)
      const e = easeOutCubic(u)
      cam.position.set(
        lerp(CAMERA_WARP.position[0], CAMERA_HOME.position[0], e),
        lerp(CAMERA_WARP.position[1], CAMERA_HOME.position[1], e),
        lerp(CAMERA_WARP.position[2], CAMERA_HOME.position[2], e),
      )
      cam.fov = lerp(CAMERA_WARP.fov, CAMERA_HOME.fov, e)
      look.current.set(
        lerp(0, CAMERA_HOME.lookAt[0], e),
        lerp(0, CAMERA_HOME.lookAt[1], e),
        lerp(0, CAMERA_HOME.lookAt[2], e),
      )
      cam.lookAt(look.current)
      cam.updateProjectionMatrix()
      warp.fade = 1 - easeOutCubic(Math.min(1, u / 0.45))

      if (u >= 1) {
        warp.phase = 'idle'
        warp.t = 0
        warp.targetSection = null
        warp.fade = 0
        apexFired.current = false
        cam.position.set(...CAMERA_HOME.position)
        cam.fov = CAMERA_HOME.fov
        cam.lookAt(...CAMERA_HOME.lookAt)
        cam.updateProjectionMatrix()
      }
    }
  })

  return null
}
