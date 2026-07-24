import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { useIntro } from '@/hooks/useIntro'
import {
  CAMERA_ENTRANCE_START,
  CAMERA_HOME,
  sceneRuntimeRef,
} from '@/scene/sceneRuntime'

/** Cinematic push toward the viewer after boot card exit */
const FLY_DURATION = 0.6

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const homeLook = new THREE.Vector3(...CAMERA_HOME.lookAt)

/**
 * Post-boot punch-in: camera rushes toward Z:5 with a motion-blur envelope.
 * Signals IntroProvider via completeFlyin when finished.
 */
export function CameraEntranceController({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const { camera } = useThree()
  const { phase, completeFlyin, playIntro } = useIntro()
  const fired = useRef(false)
  const look = useRef(new THREE.Vector3(...CAMERA_HOME.lookAt))

  // Park near home before the subtle fly (orb already in frame)
  useEffect(() => {
    if (!playIntro || reducedMotion) return
    if (phase !== 'boot' && phase !== 'flyin') return

    const cam = camera as THREE.PerspectiveCamera
    if (
      phase === 'boot' ||
      (phase === 'flyin' && sceneRuntimeRef.cameraEntrance.t < 0.01)
    ) {
      cam.position.set(...CAMERA_ENTRANCE_START.position)
      cam.fov = CAMERA_ENTRANCE_START.fov
      cam.lookAt(homeLook)
      cam.updateProjectionMatrix()
    }
  }, [phase, playIntro, reducedMotion, camera])

  useEffect(() => {
    if (phase === 'flyin') {
      fired.current = false
    }
  }, [phase])

  useFrame((_, delta) => {
    const entrance = sceneRuntimeRef.cameraEntrance
    const cam = camera as THREE.PerspectiveCamera
    const dt = Math.min(delta, 0.05)

    if (reducedMotion || !playIntro) {
      if (entrance.active) {
        entrance.active = false
        entrance.complete = true
        entrance.blur = 0
        if (!fired.current) {
          fired.current = true
          completeFlyin()
        }
      }
      return
    }

    if (!entrance.active) {
      entrance.blur += (0 - entrance.blur) * 0.15
      return
    }

    entrance.t = Math.min(1, entrance.t + dt / FLY_DURATION)
    const e = easeOutCubic(entrance.t)

    cam.position.set(
      lerp(CAMERA_ENTRANCE_START.position[0], CAMERA_HOME.position[0], e),
      lerp(CAMERA_ENTRANCE_START.position[1], CAMERA_HOME.position[1], e),
      lerp(CAMERA_ENTRANCE_START.position[2], CAMERA_HOME.position[2], e),
    )
    cam.fov = lerp(CAMERA_ENTRANCE_START.fov, CAMERA_HOME.fov, e)
    look.current.lerp(homeLook, 0.28)
    cam.lookAt(look.current)
    cam.updateProjectionMatrix()

    // Motion-blur envelope — strong early punch, settles as we hit Z:5
    entrance.blur = Math.sin(Math.PI * Math.min(1, entrance.t * 1.05)) * 1.15

    if (entrance.t >= 0.88 && !fired.current) {
      // Kick UI fade while the punch settles into Z:5
      fired.current = true
      completeFlyin()
    }

    if (entrance.t >= 1) {
      entrance.active = false
      entrance.complete = true
      entrance.blur = 0
      cam.position.set(...CAMERA_HOME.position)
      cam.fov = CAMERA_HOME.fov
      cam.lookAt(homeLook)
      cam.updateProjectionMatrix()
      if (!fired.current) {
        fired.current = true
        completeFlyin()
      }
    }
  })

  return null
}
