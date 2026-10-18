export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Normalised position of v inside [a, b], clamped. */
export const ramp = (v: number, a: number, b: number) => clamp((v - a) / (b - a))
export const smooth = (t: number) => t * t * (3 - 2 * t)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutBack = (t: number) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/** Frame-rate independent exponential approach. */
export const approach = (cur: number, target: number, rate: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-rate * dt))

/** Deterministic hash → [0, 1). */
export function hash01(...n: number[]): number {
  let h = 2166136261
  for (const v of n) {
    h ^= Math.floor(v * 2654435761) >>> 0
    h = Math.imul(h, 16777619)
    h ^= h >>> 13
    h = Math.imul(h, 0x5bd1e995)
    h ^= h >>> 15
  }
  return (h >>> 0) / 4294967296
}

/** Softmax over logits at temperature T. -Infinity logits get probability 0. */
export function softmax(logits: number[], T: number): number[] {
  let m = -Infinity
  for (const l of logits) if (l > m) m = l
  const e = logits.map((l) => (l === -Infinity ? 0 : Math.exp((l - m) / T)))
  const s = e.reduce((a, b) => a + b, 0) || 1
  return e.map((v) => v / s)
}

/** Inverse CDF sample: index i such that u falls in the i-th probability interval. */
export function pick(p: number[], u: number): number {
  let acc = 0
  let last = 0
  for (let i = 0; i < p.length; i++) {
    if (p[i] <= 0) continue
    last = i
    acc += p[i]
    if (u < acc) return i
  }
  return last
}

export function mixColor(a: [number, number, number], b: [number, number, number], t: number, alpha = 1): string {
  const r = Math.round(lerp(a[0], b[0], t))
  const g = Math.round(lerp(a[1], b[1], t))
  const bl = Math.round(lerp(a[2], b[2], t))
  return `rgba(${r},${g},${bl},${alpha.toFixed(3)})`
}
