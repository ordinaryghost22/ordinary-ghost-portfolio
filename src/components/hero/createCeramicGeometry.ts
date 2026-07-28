import * as THREE from 'three'

import { craterNoise } from '@/components/hero/moonNoise'

/**
 * Icosphere with shallow procedural crater displacement.
 * Detail 5 ≈ 20k faces — smooth silhouette, carved-stone relief.
 */
export function createCeramicGeometry(radius = 1, detail = 5) {
  const geometry = new THREE.IcosahedronGeometry(radius, detail)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const vertex = new THREE.Vector3()

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    const nx = vertex.x / radius
    const ny = vertex.y / radius
    const nz = vertex.z / radius
    const noise = craterNoise(nx, ny, nz)
    /* Very shallow — noticed only after looking carefully */
    const displace = noise * radius * 0.01
    vertex.normalize().multiplyScalar(radius + displace)
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.normalizeNormals()
  return geometry
}
