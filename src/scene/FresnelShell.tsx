import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const GOLD = new THREE.Color('#E4E4E7')

/**
 * Soft Fresnel shell — edge glow only (no noise displacement).
 */
export function FresnelShell({
  radius = 1.62,
  visible = true,
}: {
  radius?: number
  visible?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      uniforms: {
        uColor: { value: GOLD.clone() },
        uIntensity: { value: 0.55 },
        uPower: { value: 2.8 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorldPos = world.xyz;
          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uPower;
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), uPower);
          float alpha = fresnel * uIntensity;
          gl_FragColor = vec4(uColor * fresnel, alpha);
        }
      `,
    })
  }, [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const pulse = 0.48 + Math.sin(clock.elapsedTime * 0.7) * 0.08
    ;(material.uniforms.uIntensity as { value: number }).value = pulse
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} material={material} scale={1.02} frustumCulled={false}>
      <sphereGeometry args={[radius, 48, 48]} />
    </mesh>
  )
}
