import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

import type { OrbHoverState } from '@/scene/orbHover'
import { sceneRuntimeRef } from '@/scene/sceneRuntime'

type GeodesicWireShellProps = {
  radius?: number
  /** Icosahedron subdivisions — higher = denser geodesic */
  detail?: number
  visible?: boolean
  color?: string
  hoverRef?: MutableRefObject<OrbHoverState>
}

/**
 * Dense golden geodesic wireframe with organic noise displacement.
 * This is the primary “reference orb” silhouette — wavy triangulated shell.
 */
export function GeodesicWireShell({
  radius = 1.62,
  detail = 3,
  visible = true,
  color = '#C6A15B',
  hoverRef,
}: GeodesicWireShellProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const hoverSmooth = useRef(0)
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      wireframe: true,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uNoiseScale: { value: 1.65 },
        uNoiseSpeed: { value: 0.22 },
        uNoiseIntensity: { value: 0.11 },
        uAudioBass: { value: 0 },
        uOpacity: { value: 0.72 },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        /** Boot progress emissive lift — 1 at rest, up to ~2 during load */
        uEmissiveBoost: { value: 1 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uNoiseSpeed;
        uniform float uNoiseIntensity;
        uniform float uAudioBass;
        uniform float uHover;
        uniform vec2 uMouse;

        varying float vRim;
        varying float vDisplace;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 nrm = normalize(position);
          float t = uTime * uNoiseSpeed;
          float n1 = snoise(nrm * uNoiseScale + vec3(t, t * 0.6, -t * 0.35));
          float n2 = snoise(nrm * (uNoiseScale * 2.2) - vec3(t * 0.4, -t, t * 0.25));
          float noise = n1 * 0.72 + n2 * 0.28;

          vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 0.55));
          float facing = max(dot(nrm, mouseDir), 0.0);
          float ripple =
            sin(facing * 10.0 - uTime * 4.5) *
            pow(facing, 1.4) *
            uHover *
            0.085;

          float displace =
            noise * uNoiseIntensity + uAudioBass * 0.07 + ripple;
          vec3 displaced = nrm * (length(position) + displace);

          vec4 world = modelMatrix * vec4(displaced, 1.0);
          vec3 viewDir = normalize(cameraPosition - world.xyz);
          vec3 worldN = normalize(mat3(modelMatrix) * nrm);
          vRim = pow(1.0 - max(dot(viewDir, worldN), 0.0), 2.2);
          vDisplace = displace;

          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uHover;
        uniform float uEmissiveBoost;

        varying float vRim;
        varying float vDisplace;

        void main() {
          float crest = smoothstep(0.0, 0.1, abs(vDisplace));
          float glow = 0.35 + vRim * 1.15 + crest * 0.25;
          glow *= 1.0 + uHover * 0.55;
          glow *= uEmissiveBoost;
          vec3 col = uColor * glow;
          float alpha = clamp(
            uOpacity * (0.45 + vRim * 0.7) * (1.0 + uHover * 0.35),
            0.0,
            1.0
          );
          gl_FragColor = vec4(col, alpha);
        }
      `,
    })
  }, [color])

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame((_, delta) => {
    const u = material.uniforms
    u.uTime.value += delta
    const audio = sceneRuntimeRef.audio
    const hover = hoverRef?.current
    const targetHover = hover?.amount ?? 0
    const damp = Math.min(1, delta * (targetHover > hoverSmooth.current ? 7 : 4))
    hoverSmooth.current += (targetHover - hoverSmooth.current) * damp

    if (hover && targetHover > 0.02) {
      mouseSmooth.current.x += (hover.x - mouseSmooth.current.x) * damp
      mouseSmooth.current.y += (hover.y - mouseSmooth.current.y) * damp
    } else {
      mouseSmooth.current.x += (0 - mouseSmooth.current.x) * Math.min(1, delta * 4)
      mouseSmooth.current.y += (0 - mouseSmooth.current.y) * Math.min(1, delta * 4)
    }

    u.uHover.value = hoverSmooth.current
    ;(u.uMouse.value as THREE.Vector2).copy(mouseSmooth.current)

    const baseOpacity = 0.72 + hoverSmooth.current * 0.18
    const boot = sceneRuntimeRef.boot
    const bootT = boot.progress / 100
    // wireframeEmissiveIntensity ≈ 0.5 + (progress/100)*1.5 while booting
    const emissiveTarget = boot.active ? 0.5 + bootT * 1.5 : 1
    u.uEmissiveBoost.value += (emissiveTarget - u.uEmissiveBoost.value) * 0.12

    if (audio.enabled) {
      u.uAudioBass.value = audio.bass
      u.uOpacity.value = baseOpacity + audio.level * 0.12
    } else {
      u.uAudioBass.value += (0 - u.uAudioBass.value) * 0.08
      const opacityTarget = boot.active
        ? baseOpacity * (0.85 + bootT * 0.35)
        : baseOpacity
      u.uOpacity.value += (opacityTarget - u.uOpacity.value) * 0.1
    }
  })

  if (!visible) return null

  return (
    <mesh
      ref={meshRef}
      material={material}
      renderOrder={2}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[radius, detail]} />
    </mesh>
  )
}
