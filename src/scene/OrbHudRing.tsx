import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

type OrbHudRingProps = {
  radius?: number
  visible?: boolean
}

/**
 * Ultra-thin HUD ring — single LineLoop draw call, counter-rotates on X.
 */
export function OrbHudRing({ radius = 2.05, visible = true }: OrbHudRingProps) {
  const lineRef = useRef<THREE.LineLoop>(null)

  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0)
    const pts = curve.getPoints(96)
    const geo = new THREE.BufferGeometry().setFromPoints(
      pts.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    )
    return geo
  }, [radius])

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#E4E4E7',
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useFrame((_, delta) => {
    const line = lineRef.current
    if (!line) return
    // Reverse X-axis spin relative to the orb's Y idle rotation
    line.rotation.x -= delta * 0.18
    line.rotation.z += delta * 0.05
  })

  if (!visible) return null

  return (
    <lineLoop
      ref={lineRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={1}
    />
  )
}
