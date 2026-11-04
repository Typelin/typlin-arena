export const SIDE = 1000

type Rgb = [number, number, number]

const N = 200
const CELL = SIDE / N
const SQ = 89
const BUCKETS = 12
const DIM: Rgb = [40, 36, 32]
const CREAM: Rgb = [242, 234, 218]
const CLAY: Rgb = [217, 119, 87]

const clamp = (v: number) => Math.min(1, Math.max(0, v))

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

const mix = (from: Rgb, to: Rgb, t: number) =>
  `rgb(${from.map((c, i) => Math.round(c + (to[i] - c) * t)).join(',')})`

export function makeDots(canvas: HTMLCanvasElement) {
  canvas.width = SIDE
  canvas.height = SIDE
  return canvas.getContext('2d')!
}

// One clay point sits in a field of dots that brighten toward it, the hero's picture of one small model.
export function paintSpark(ctx: CanvasRenderingContext2D) {
  const cx = SIDE * 0.7
  const cy = SIDE * 0.3
  const paths = Array.from({ length: BUCKETS }, () => new Path2D())
  ctx.fillStyle = '#121110'
  ctx.fillRect(0, 0, SIDE, SIDE)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const px = x * CELL + CELL / 2
      const py = y * CELL + CELL / 2
      const d2 = (px - cx) ** 2 + (py - cy) ** 2
      const v = Math.exp(-d2 / (2 * 85 * 85))
      const b = Math.round(v * (BUCKETS - 1))
      const r = CELL * (0.14 + 0.2 * v)
      paths[b].moveTo(px + r, py)
      paths[b].arc(px, py, r, 0, Math.PI * 2)
    }
  }
  for (let b = 0; b < BUCKETS; b++) {
    ctx.fillStyle = mix(DIM, CREAM, b / (BUCKETS - 1))
    ctx.fill(paths[b])
  }
  ctx.strokeStyle = 'rgba(217, 119, 87, 0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, CELL * 5, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = 'rgb(217, 119, 87)'
  ctx.beginPath()
  ctx.arc(cx, cy, CELL * 2.4, 0, Math.PI * 2)
  ctx.fill()
}

// p runs 0 to 1. The first half lights the 200K block diagonally, the second half lights the rest.
export function paintWindow(ctx: CanvasRenderingContext2D, p: number) {
  const s1 = Math.min(1, p * 2)
  const s2 = Math.max(0, p * 2 - 1)
  const paths = Array.from({ length: BUCKETS * 2 }, () => new Path2D())

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const inside = x < SQ && y < SQ
      const u = inside ? (x + y) / (2 * SQ) : (x + y) / (2 * N)
      const front = inside ? s1 : s2
      const a = clamp((front * 1.12 - u + (hash(x, y) - 0.5) * 0.06) * 9)
      const b = Math.round(a * (BUCKETS - 1))
      const r = CELL * (0.14 + 0.32 * (b / (BUCKETS - 1)))
      const cx = x * CELL + CELL / 2
      const cy = y * CELL + CELL / 2
      const path = paths[(inside ? 0 : BUCKETS) + b]
      path.moveTo(cx + r, cy)
      path.arc(cx, cy, r, 0, Math.PI * 2)
    }
  }

  ctx.fillStyle = '#15120f'
  ctx.fillRect(0, 0, SIDE, SIDE)
  for (let i = 0; i < paths.length; i++) {
    const inside = i < BUCKETS
    const t = (i % BUCKETS) / (BUCKETS - 1)
    ctx.fillStyle = mix(DIM, inside ? CLAY : CREAM, t)
    ctx.fill(paths[i])
  }
  ctx.strokeStyle = mix(DIM, CLAY, 0.9)
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, SQ * CELL - 2, SQ * CELL - 2)
}
