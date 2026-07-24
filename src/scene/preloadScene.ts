import { useEnvironment } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Warm HDRI + core geometry so the orb has zero texture/geo pop-in on first paint.
 * Safe to call from the app entry before React mounts the canvas.
 */
export function preloadScene() {
  try {
    useEnvironment.preload({ preset: 'sunset' })
  } catch {
    // ignore — canvas Suspense will still load the preset
  }

  // Force-compile common geometries used by OrbCore / shells
  const sphere = new THREE.SphereGeometry(1.4, 64, 64)
  const ico = new THREE.IcosahedronGeometry(1.6, 3)
  sphere.dispose()
  ico.dispose()
}

/** Eager dynamic import so the SceneCanvas chunk starts fetching ASAP */
export function prefetchSceneModule() {
  void import('@/scene/SceneCanvas')
}
