import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import { createCeramicGeometry } from '@/components/hero/createCeramicGeometry'

type CeramicMoonSceneProps = {
  reduceMotion: boolean
}

/**
 * Product-camera setup — ~55mm equivalent, slightly below eye line.
 */
function ProductCamera() {
  const camera = useThree((state) => state.camera)

  useLayoutEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 28
      camera.near = 0.1
      camera.far = 20
      camera.position.set(0.08, -0.36, 4.05)
      camera.lookAt(0.32, 0.08, 0)
      camera.updateProjectionMatrix()
    }
  }, [camera])

  return null
}

/**
 * Matte carved-stone sphere — soft key / fill / rim / ambient.
 * No bloom. No colour. Smooth silhouette, no hard shadow cuts.
 */
export function CeramicMoonScene({ reduceMotion }: CeramicMoonSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  /* Detail 5 ≈ 20k faces — calm carved relief without faceted edges */
  const geometry = useMemo(() => createCeramicGeometry(1.1, 5), [])
  const invalidate = useThree((state) => state.invalidate)
  const phase = useRef(0)

  useEffect(() => {
    invalidate()
    return () => {
      geometry.dispose()
    }
  }, [invalidate, geometry])

  useFrame((_, delta) => {
    if (reduceMotion || !groupRef.current) return
    phase.current += delta
    /* One revolution ~7 minutes */
    groupRef.current.rotation.y += delta * ((Math.PI * 2) / 420)
    groupRef.current.rotation.x =
      Math.sin(phase.current * ((Math.PI * 2) / 32)) * 0.01
    groupRef.current.rotation.z =
      Math.cos(phase.current * ((Math.PI * 2) / 40)) * 0.006
  })

  return (
    <>
      <ProductCamera />

      {/* Soft wrap lighting — no hard shadow wedges */}
      <hemisphereLight args={['#c8c8cc', '#0a0b0e', 0.42]} />
      <ambientLight intensity={0.22} color="#ffffff" />
      <directionalLight
        position={[-2.4, 2.8, 3.4]}
        intensity={0.48}
        color="#f5f5f4"
      />
      <directionalLight
        position={[3.2, 0.6, 2.4]}
        intensity={0.22}
        color="#e4e4e7"
      />
      <directionalLight
        position={[0.2, 0.4, -3.2]}
        intensity={0.12}
        color="#d4d4d8"
      />

      <group ref={groupRef} position={[0.38, -0.42, 0]}>
        <mesh geometry={geometry} castShadow={false} receiveShadow={false}>
          <meshStandardMaterial
            color="#5c5c5e"
            roughness={0.92}
            metalness={0}
            envMapIntensity={0}
            flatShading={false}
          />
        </mesh>

        {/* Hairline orbital ring — barely there */}
        <mesh
          rotation={[Math.PI / 2.45, 0.1, 0.26]}
          position={[-0.02, 0.03, 0.01]}
        >
          <torusGeometry args={[1.28, 0.0025, 12, 160]} />
          <meshBasicMaterial
            color="#d8d6d2"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  )
}
