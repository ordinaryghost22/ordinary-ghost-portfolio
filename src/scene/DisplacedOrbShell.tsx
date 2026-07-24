import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'

import type { OrbHoverState } from '@/scene/orbHover'
import { ORB_SHELL_PARAMS } from '@/scene/orbVisualParams'

type DisplacedOrbShellProps = {
  visible?: boolean
  /** Shared hover state from NeuralOrb (proximity + NDC) */
  hoverRef?: MutableRefObject<OrbHoverState>
  params?: Partial<typeof ORB_SHELL_PARAMS>
}

/**
 * Noise-displaced shell with mouse ripples + Fresnel rim.
 * Sits under the neural wireframe; additive so the void stays dark.
 */
export function DisplacedOrbShell({
  visible = true,
  hoverRef,
  params: paramOverrides,
}: DisplacedOrbShellProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const p = { ...ORB_SHELL_PARAMS, ...paramOverrides }
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))
  const mouseActive = useRef(0)

  const material = useMemo(() => {
    const color = new THREE.Color(p.color)

    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uNoiseScale: { value: p.noiseScale },
        uNoiseSpeed: { value: p.noiseSpeed },
        uNoiseIntensity: { value: p.noiseIntensity },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseActive: { value: 0 },
        uRippleIntensity: { value: p.mouseRippleIntensity },
        uRippleFrequency: { value: p.mouseRippleFrequency },
        uRippleRadius: { value: p.mouseRippleRadius },
        uFresnelPower: { value: p.fresnelPower },
        uFresnelIntensity: { value: p.fresnelIntensity },
        uFillOpacity: { value: p.fillOpacity },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uNoiseScale;
        uniform float uNoiseSpeed;
        uniform float uNoiseIntensity;
        uniform vec2 uMouse;
        uniform float uMouseActive;
        uniform float uRippleIntensity;
        uniform float uRippleFrequency;
        uniform float uRippleRadius;

        varying vec3 vNormalW;
        varying vec3 vWorldPos;
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

          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        void main() {
          vec3 nrm = normalize(normal);
          float t = uTime * uNoiseSpeed;

          float n1 = snoise(nrm * uNoiseScale + vec3(t, t * 0.7, -t * 0.4));
          float n2 = snoise(nrm * (uNoiseScale * 2.1) - vec3(t * 0.5, -t, t * 0.3));
          float noise = n1 * 0.7 + n2 * 0.3;

          // Cursor-facing ripple — organic surface wave under the hover point
          vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 0.55));
          float facing = max(dot(nrm, mouseDir), 0.0);
          float falloff = pow(facing, 1.35) * uMouseActive;
          float envelope = smoothstep(0.0, uRippleRadius, facing);
          float ripple =
            sin(facing * uRippleFrequency - uTime * 5.0) *
            falloff *
            envelope *
            uRippleIntensity;
          // Soft secondary wave for richer deformation
          ripple +=
            sin(facing * (uRippleFrequency * 0.55) - uTime * 2.6) *
            falloff *
            uRippleIntensity *
            0.35;

          float displace = noise * uNoiseIntensity + ripple;
          vec3 displaced = position + nrm * displace;

          vec4 world = modelMatrix * vec4(displaced, 1.0);
          vWorldPos = world.xyz;
          vNormalW = normalize(mat3(modelMatrix) * nrm);
          vDisplace = displace;

          gl_Position = projectionMatrix * viewMatrix * world;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uFresnelPower;
        uniform float uFresnelIntensity;
        uniform float uFillOpacity;
        uniform float uMouseActive;

        varying vec3 vNormalW;
        varying vec3 vWorldPos;
        varying float vDisplace;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          vec3 n = normalize(vNormalW);
          float fresnel = pow(1.0 - max(dot(viewDir, n), 0.0), uFresnelPower);

          float crest = smoothstep(0.0, 0.12, vDisplace);

          float rim = fresnel * uFresnelIntensity * (1.0 + crest * 0.45);
          float fill = uFillOpacity * (0.55 + crest * 0.55);
          float mouseBoost = 1.0 + uMouseActive * 0.28;

          float alpha = (rim + fill) * mouseBoost;
          vec3 col = uColor * (rim * 1.2 + fill) * (1.0 + uMouseActive * 0.12);

          gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
        }
      `,
    })
  }, [
    p.color,
    p.noiseScale,
    p.noiseSpeed,
    p.noiseIntensity,
    p.mouseRippleIntensity,
    p.mouseRippleFrequency,
    p.mouseRippleRadius,
    p.fresnelPower,
    p.fresnelIntensity,
    p.fillOpacity,
  ])

  useEffect(() => {
    return () => {
      material.dispose()
    }
  }, [material])

  useFrame((_, delta) => {
    const u = material.uniforms
    u.uTime.value += delta

    const hover = hoverRef?.current
    const targetActive = hover?.amount ?? 0
    const dampIn = Math.min(1, delta * 7)
    const dampOut = Math.min(1, delta * 4)
    mouseActive.current +=
      (targetActive - mouseActive.current) *
      (targetActive > mouseActive.current ? dampIn : dampOut)

    if (hover && targetActive > 0.02) {
      mouseSmooth.current.x += (hover.x - mouseSmooth.current.x) * dampIn
      mouseSmooth.current.y += (hover.y - mouseSmooth.current.y) * dampIn
    } else {
      mouseSmooth.current.x += (0 - mouseSmooth.current.x) * dampOut
      mouseSmooth.current.y += (0 - mouseSmooth.current.y) * dampOut
    }

    ;(u.uMouse.value as THREE.Vector2).copy(mouseSmooth.current)
    u.uMouseActive.value = mouseActive.current
  })

  if (!visible) return null

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false}>
      <sphereGeometry args={[p.radius, 96, 96]} />
    </mesh>
  )
}
