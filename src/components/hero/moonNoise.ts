/**
 * Compact 3D simplex noise — no external assets.
 * Used once at geometry build time for crater displacement.
 */

const F3 = 1 / 3
const G3 = 1 / 6

const grad3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
] as const

function buildPerm() {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let seed = 421
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647
    const j = seed % (i + 1)
    const tmp = p[i]!
    p[i] = p[j]!
    p[j] = tmp
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!
  return perm
}

const PERM = buildPerm()

function dot3(g: readonly number[], x: number, y: number, z: number) {
  return g[0]! * x + g[1]! * y + g[2]! * z
}

/** Classic simplex noise in 3D — returns roughly [-1, 1] */
export function simplex3(xin: number, yin: number, zin: number) {
  const s = (xin + yin + zin) * F3
  const i = Math.floor(xin + s)
  const j = Math.floor(yin + s)
  const k = Math.floor(zin + s)
  const t = (i + j + k) * G3
  const X0 = i - t
  const Y0 = j - t
  const Z0 = k - t
  const x0 = xin - X0
  const y0 = yin - Y0
  const z0 = zin - Z0

  let i1: number
  let j1: number
  let k1: number
  let i2: number
  let j2: number
  let k2: number

  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1
      j1 = 0
      k1 = 0
      i2 = 1
      j2 = 1
      k2 = 0
    } else if (x0 >= z0) {
      i1 = 1
      j1 = 0
      k1 = 0
      i2 = 1
      j2 = 0
      k2 = 1
    } else {
      i1 = 0
      j1 = 0
      k1 = 1
      i2 = 1
      j2 = 0
      k2 = 1
    }
  } else if (y0 < z0) {
    i1 = 0
    j1 = 0
    k1 = 1
    i2 = 0
    j2 = 1
    k2 = 1
  } else if (x0 < z0) {
    i1 = 0
    j1 = 1
    k1 = 0
    i2 = 0
    j2 = 1
    k2 = 1
  } else {
    i1 = 0
    j1 = 1
    k1 = 0
    i2 = 1
    j2 = 1
    k2 = 0
  }

  const x1 = x0 - i1 + G3
  const y1 = y0 - j1 + G3
  const z1 = z0 - k1 + G3
  const x2 = x0 - i2 + 2 * G3
  const y2 = y0 - j2 + 2 * G3
  const z2 = z0 - k2 + 2 * G3
  const x3 = x0 - 1 + 3 * G3
  const y3 = y0 - 1 + 3 * G3
  const z3 = z0 - 1 + 3 * G3

  const ii = i & 255
  const jj = j & 255
  const kk = k & 255

  const gi0 = PERM[ii + PERM[jj + PERM[kk]!]!]! % 12
  const gi1 = PERM[ii + i1 + PERM[jj + j1 + PERM[kk + k1]!]!]! % 12
  const gi2 = PERM[ii + i2 + PERM[jj + j2 + PERM[kk + k2]!]!]! % 12
  const gi3 = PERM[ii + 1 + PERM[jj + 1 + PERM[kk + 1]!]!]! % 12

  let n0 = 0
  let n1 = 0
  let n2 = 0
  let n3 = 0

  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
  if (t0 > 0) {
    t0 *= t0
    n0 = t0 * t0 * dot3(grad3[gi0]!, x0, y0, z0)
  }
  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
  if (t1 > 0) {
    t1 *= t1
    n1 = t1 * t1 * dot3(grad3[gi1]!, x1, y1, z1)
  }
  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
  if (t2 > 0) {
    t2 *= t2
    n2 = t2 * t2 * dot3(grad3[gi2]!, x2, y2, z2)
  }
  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
  if (t3 > 0) {
    t3 *= t3
    n3 = t3 * t3 * dot3(grad3[gi3]!, x3, y3, z3)
  }

  return 32 * (n0 + n1 + n2 + n3)
}

/**
 * Low-frequency crater field only — no high-frequency grit.
 * Calm basins; detail appears on second look.
 */
export function craterNoise(x: number, y: number, z: number) {
  const n1 = simplex3(x * 1.15, y * 1.15, z * 1.15)
  const n2 = simplex3(x * 2.2 + 12.7, y * 2.2 - 4.2, z * 2.2 + 2.1)
  const mixed = n1 * 0.72 + n2 * 0.28
  return mixed * 0.5 + Math.min(0, mixed) * 0.22
}
