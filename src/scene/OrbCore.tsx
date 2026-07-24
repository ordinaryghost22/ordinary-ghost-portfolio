import { Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { sceneRuntimeRef } from '@/scene/sceneRuntime'

type OrbCoreProps = {
  radius?: number
  visible?: boolean
}

/**
 * Dark reflective inner core — chrome/glass sphere under the golden wireframe.
 * Soft warm env reflections for a premium bronze glow (no studio softbox hotspots).
 */
export function OrbCore({ radius = 1.42, visible = true }: OrbCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#0c0c0b',
        metalness: 0.92,
        roughness: 0.25,
        envMapIntensity: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        reflectivity: 1,
        // Slight transmission for glassy depth without washing the wireframe
        transmission: 0.08,
        thickness: 0.6,
        ior: 1.45,
        transparent: true,
        opacity: 0.96,
        depthWrite: true,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const audio = sceneRuntimeRef.audio
    const pulse = audio.enabled ? 1 + audio.bass * 0.025 : 1
    mesh.scale.setScalar(pulse)
  })

  if (!visible) return null

  return (
    <>
      <Environment preset="sunset" environmentIntensity={0.05} />
      <mesh
        ref={meshRef}
        material={material}
        renderOrder={0}
        frustumCulled={false}
      >
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>
    </>
  )
}
