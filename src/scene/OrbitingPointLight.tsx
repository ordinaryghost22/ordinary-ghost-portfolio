import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/**
 * Slow orbiting gold accent light — highlights wireframe structure as it moves.
 */
export function OrbitingPointLight({
  radius = 3.4,
  speed = 0.35,
  intensity = 0.65,
  color = '#E4E4E7',
  enabled = true,
}: {
  radius?: number
  speed?: number
  intensity?: number
  color?: string
  enabled?: boolean
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const base = useRef(intensity)
  base.current = intensity

  useFrame(({ clock }) => {
    if (!enabled || !lightRef.current) return
    const t = clock.elapsedTime * speed
    lightRef.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 0.65) * 1.4 + 0.4,
      Math.sin(t) * radius * 0.75 + 1.2,
    )
    // Subtle intensity breathe — never harsh
    lightRef.current.intensity =
      base.current * (0.85 + 0.15 * Math.sin(t * 1.4))
  })

  if (!enabled) return null

  return (
    <pointLight
      ref={lightRef}
      color={color}
      intensity={intensity}
      distance={16}
      decay={2}
    />
  )
}
