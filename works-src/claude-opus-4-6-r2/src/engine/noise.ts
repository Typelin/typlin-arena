// Hand-written 2D simplex noise — no library imports
// Based on Stefan Gustavson's algorithm

const F2 = 0.5 * (Math.sqrt(3) - 1)
const G2 = (3 - Math.sqrt(3)) / 6

const GRAD = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
] as const

export class SimplexNoise {
  private p: Uint8Array

  constructor(seed = 0) {
    const a = new Uint8Array(256)
    for (let i = 0; i < 256; i++) a[i] = i
    let s = seed | 0
    for (let i = 255; i > 0; i--) {
      s = (s * 1664525 + 1013904223) | 0
      const j = ((s >>> 0) % (i + 1)) | 0
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    this.p = new Uint8Array(512)
    for (let i = 0; i < 512; i++) this.p[i] = a[i & 255]
  }

  noise2d(x: number, y: number): number {
    const s = (x + y) * F2
    const i = Math.floor(x + s), j = Math.floor(y + s)
    const t = (i + j) * G2
    const x0 = x - (i - t), y0 = y - (j - t)

    const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2

    const ii = i & 255, jj = j & 255
    let n = 0

    let d = 0.5 - x0 * x0 - y0 * y0
    if (d > 0) { d *= d; const g = GRAD[this.p[ii + this.p[jj]] & 7]; n += d * d * (g[0] * x0 + g[1] * y0) }
    d = 0.5 - x1 * x1 - y1 * y1
    if (d > 0) { d *= d; const g = GRAD[this.p[ii + i1 + this.p[jj + j1]] & 7]; n += d * d * (g[0] * x1 + g[1] * y1) }
    d = 0.5 - x2 * x2 - y2 * y2
    if (d > 0) { d *= d; const g = GRAD[this.p[ii + 1 + this.p[jj + 1]] & 7]; n += d * d * (g[0] * x2 + g[1] * y2) }

    return 70 * n
  }

  fbm(x: number, y: number, octaves: number, lac = 2, gain = 0.5): number {
    let sum = 0, amp = 1, freq = 1, max = 0
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise2d(x * freq, y * freq)
      max += amp; amp *= gain; freq *= lac
    }
    return sum / max
  }
}
