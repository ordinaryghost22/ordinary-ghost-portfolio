import { useMemo } from 'react'
import * as THREE from 'three'

export type OrbLayout =
  | 'scatter'
  | 'sphere'
  | 'clusters'
  | 'grid'
  | 'helix'
  | 'ring'

/** Fibonacci sphere — even distribution for network nodes */
export function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    positions[i * 3] = Math.cos(theta) * r * radius
    positions[i * 3 + 1] = y * radius
    positions[i * 3 + 2] = Math.sin(theta) * r * radius
  }

  return positions
}

/**
 * Radial bloom scatter — each start pos is the final pos pushed outward
 * along the same ray from center (no crossing paths during converge).
 * scatterFactor per node: 2.5–5× radius length.
 */
export function radialScatterFromFinal(
  finalPositions: Float32Array,
  seed = 42,
) {
  const count = finalPositions.length / 3
  const positions = new Float32Array(finalPositions.length)
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  for (let i = 0; i < count; i++) {
    const fx = finalPositions[i * 3]
    const fy = finalPositions[i * 3 + 1]
    const fz = finalPositions[i * 3 + 2]
    const scatterFactor = 2.5 + rand() * 2.5
    positions[i * 3] = fx * scatterFactor
    positions[i * 3 + 1] = fy * scatterFactor
    positions[i * 3 + 2] = fz * scatterFactor
  }

  return positions
}

/** Staggered start delays (seconds) so assembly reads as a wave, not a snap */
export function createConvergeDelays(
  count: number,
  maxDelay = 0.3,
  seed = 99,
) {
  const delays = new Float32Array(count)
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  for (let i = 0; i < count; i++) {
    delays[i] = rand() * maxDelay
  }
  return delays
}

export function clusterPositions(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const centers = [
    new THREE.Vector3(radius * 0.85, radius * 0.2, 0),
    new THREE.Vector3(-radius * 0.7, radius * 0.35, radius * 0.3),
    new THREE.Vector3(-radius * 0.15, -radius * 0.75, -radius * 0.2),
    new THREE.Vector3(radius * 0.25, -radius * 0.15, radius * 0.85),
  ]

  for (let i = 0; i < count; i++) {
    const c = centers[i % centers.length]
    const t = i / count
    const jitter = radius * 0.22
    const a = t * Math.PI * 8
    positions[i * 3] = c.x + Math.cos(a) * jitter * (0.3 + (i % 7) * 0.1)
    positions[i * 3 + 1] = c.y + Math.sin(a * 0.9) * jitter * (0.3 + (i % 5) * 0.1)
    positions[i * 3 + 2] = c.z + Math.sin(a * 1.1) * jitter * 0.45
  }

  return positions
}

export function gridPositions(count: number, extent: number) {
  const positions = new Float32Array(count * 3)
  const side = Math.ceil(Math.cbrt(count))
  const step = (extent * 2) / Math.max(1, side - 1)
  let i = 0

  for (let z = 0; z < side && i < count; z++) {
    for (let y = 0; y < side && i < count; y++) {
      for (let x = 0; x < side && i < count; x++) {
        positions[i * 3] = -extent + x * step
        positions[i * 3 + 1] = -extent + y * step
        positions[i * 3 + 2] = -extent + z * step
        i++
      }
    }
  }

  return positions
}

/** Vertical helix — Resume beat: ordered ascent, distinct from grid/clusters */
export function helixPositions(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const turns = 2.4
  const height = radius * 2.1
  const tube = radius * 0.55

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1)
    const angle = t * Math.PI * 2 * turns
    positions[i * 3] = Math.cos(angle) * tube
    positions[i * 3 + 1] = -height / 2 + t * height
    positions[i * 3 + 2] = Math.sin(angle) * tube
  }

  return positions
}

/** Sparse equatorial ring — Contact beat: quiet dissolve toward footer */
export function ringPositions(count: number, radius: number) {
  const positions = new Float32Array(count * 3)
  const r = radius * 1.05

  for (let i = 0; i < count; i++) {
    const t = i / count
    const angle = t * Math.PI * 2
    const wobble = ((i % 5) - 2) * 0.04
    positions[i * 3] = Math.cos(angle) * r
    positions[i * 3 + 1] = wobble * radius
    positions[i * 3 + 2] = Math.sin(angle) * r
  }

  return positions
}

/** Build unique undirected edges to k nearest neighbors — returns index pairs */
export function buildNeighborEdgeIndices(positions: Float32Array, k = 4) {
  const count = positions.length / 3
  const edgeSet = new Set<string>()
  const pairs: number[] = []

  for (let i = 0; i < count; i++) {
    const ix = positions[i * 3]
    const iy = positions[i * 3 + 1]
    const iz = positions[i * 3 + 2]
    const dists: { j: number; d: number }[] = []

    for (let j = 0; j < count; j++) {
      if (i === j) continue
      const dx = ix - positions[j * 3]
      const dy = iy - positions[j * 3 + 1]
      const dz = iz - positions[j * 3 + 2]
      dists.push({ j, d: dx * dx + dy * dy + dz * dz })
    }

    dists.sort((a, b) => a.d - b.d)
    const take = Math.min(k, dists.length)
    for (let n = 0; n < take; n++) {
      const j = dists[n].j
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)
      pairs.push(i, j)
    }
  }

  return new Uint16Array(pairs)
}

const GOLD_RGB = [198 / 255, 161 / 255, 91 / 255] as const

/**
 * Write edge positions + per-vertex RGB (opacity baked into brightness for void bg).
 * Closer edges read stronger; farther ones stay quiet — depth without clutter.
 */
export function writeEdgePositionsAndColors(
  pairs: Uint16Array,
  nodePositions: Float32Array,
  posOut: Float32Array,
  colorOut: Float32Array,
  /** 0–1 depth modulation from camera angle — nearer edges slightly brighter */
  depthBoost = 0,
) {
  const edgeCount = pairs.length / 2
  if (edgeCount === 0) return { posOut, colorOut }

  let minDist = Infinity
  let maxDist = 0
  const dists = new Float32Array(edgeCount)

  for (let e = 0; e < edgeCount; e++) {
    const i = pairs[e * 2]
    const j = pairs[e * 2 + 1]
    const dx = nodePositions[i * 3] - nodePositions[j * 3]
    const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1]
    const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2]
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
    dists[e] = d
    if (d < minDist) minDist = d
    if (d > maxDist) maxDist = d
  }

  if (!Number.isFinite(minDist) || maxDist <= minDist) {
    maxDist = minDist + 1e-4
  }

  const boost = 1 + depthBoost * 0.22

  let o = 0
  let c = 0
  for (let e = 0; e < edgeCount; e++) {
    const i = pairs[e * 2]
    const j = pairs[e * 2 + 1]
    // Stronger near links → denser geodesic read; far links stay faint
    const midZ =
      (nodePositions[i * 3 + 2] + nodePositions[j * 3 + 2]) * 0.5
    const facing = THREE.MathUtils.clamp(0.55 + midZ * 0.18, 0.35, 1)
    const strength =
      THREE.MathUtils.mapLinear(dists[e], minDist, maxDist, 0.62, 0.1) *
      facing *
      boost
    const r = GOLD_RGB[0] * strength
    const g = GOLD_RGB[1] * strength
    const b = GOLD_RGB[2] * strength

    posOut[o++] = nodePositions[i * 3]
    posOut[o++] = nodePositions[i * 3 + 1]
    posOut[o++] = nodePositions[i * 3 + 2]
    posOut[o++] = nodePositions[j * 3]
    posOut[o++] = nodePositions[j * 3 + 1]
    posOut[o++] = nodePositions[j * 3 + 2]

    colorOut[c++] = r
    colorOut[c++] = g
    colorOut[c++] = b
    colorOut[c++] = r
    colorOut[c++] = g
    colorOut[c++] = b
  }

  return { posOut, colorOut }
}

export function writeEdgePositions(
  pairs: Uint16Array,
  nodePositions: Float32Array,
  out: Float32Array,
) {
  let o = 0
  for (let p = 0; p < pairs.length; p += 2) {
    const i = pairs[p]
    const j = pairs[p + 1]
    out[o++] = nodePositions[i * 3]
    out[o++] = nodePositions[i * 3 + 1]
    out[o++] = nodePositions[i * 3 + 2]
    out[o++] = nodePositions[j * 3]
    out[o++] = nodePositions[j * 3 + 1]
    out[o++] = nodePositions[j * 3 + 2]
  }
  return out
}

export function useOrbLayouts(count: number, radius: number) {
  return useMemo(() => {
    const sphere = fibonacciSphere(count, radius)
    return {
      sphere,
      scatter: radialScatterFromFinal(sphere),
      clusters: clusterPositions(count, radius),
      grid: gridPositions(count, radius * 0.95),
      helix: helixPositions(count, radius),
      ring: ringPositions(count, radius),
      delays: createConvergeDelays(count),
    }
  }, [count, radius])
}

export function pickDominantSection(progress: Record<string, number>) {
  let bestKey = 'hero'
  let bestVal = -1
  for (const [key, val] of Object.entries(progress)) {
    if (val > bestVal) {
      bestVal = val
      bestKey = key
    }
  }
  return { key: bestKey, amount: bestVal }
}
