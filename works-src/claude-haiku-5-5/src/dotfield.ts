export const SIDE = 1000

type Rgb = [number, number, number]

const pack = (r: number, g: number, b: number) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0

const CLAY_PX = pack(217, 119, 87)

export function makeGrid(canvas: HTMLCanvasElement) {
  canvas.width = SIDE
  canvas.height = SIDE
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(SIDE, SIDE)
  const px = new Uint32Array(img.data.buffer)
  return { ctx, img, px }
}

export type Grid = ReturnType<typeof makeGrid>

export function paintSpark(grid: Grid) {
  const { ctx, img, px } = grid
  const cx = SIDE * 0.7
  const cy = SIDE * 0.28
  for (let y = 0; y < SIDE; y++) {
    for (let x = 0; x < SIDE; x++) {
      const dx = x - cx
      const dy = y - cy
      const v = Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110))
      px[y * SIDE + x] = pack(30 + (242 - 30) * v, 27 + (234 - 27) * v, 24 + (218 - 24) * v)
    }
  }
  const mid = Math.round(cy) * SIDE + Math.round(cx)
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      if (dx * dx + dy * dy <= 16) px[mid + dy * SIDE + dx] = CLAY_PX
    }
  }
  ctx.putImageData(img, 0, 0)
}

// The 1M-token field is a 200 x 200 dot matrix, so each dot stands for 25 tokens.
// The 200K block is an 89 x 89 square in the top-left corner (about 1/5 of the area).
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
