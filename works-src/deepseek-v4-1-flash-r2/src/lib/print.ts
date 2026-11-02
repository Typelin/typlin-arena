/**
 * 雙色網點印刷引擎。
 *
 * 原稿是灰階：亮的地方留白、暗的地方吃墨。
 * 印的時候拆成兩塊網版，各自一個網線角度，套印時偏一點點。
 * 遠看是連續的調子，近看全是點。
 *
 * 這頁的命題：連續的東西被取樣成一格一格的點，還是看得懂。
 */

const TAU = Math.PI * 2

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** 便宜的偽隨機：讓每一顆點長得不太一樣。 */
function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

export type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

export type Ink = {
  color: string
  /** 網線角度，度。 */
  angle: number
  /** 這個亮度要上多少墨：0 不上、1 滿版。 */
  coverage: (luma: number) => number
  /** 套印偏移，CSS px。 */
  offset?: [number, number]
  /** 疊在紙上的方式。淺色紙用 multiply，深色紙用 source-over。 */
  mode?: GlobalCompositeOperation
}

export type PrintOptions = {
  /** 網點格子的邊長，CSS px。越小越細。 */
  cell: number
  /** 紙色。 */
  paper: string
  inks: Ink[]
  paint: Painter
  /** 上限，避免高 DPI 手機爆記憶體。 */
  dprCap?: number
  /** 網點邊緣不規則的程度（0–1）。 */
  ragged?: number
  /** 印完壓一層很薄的紙色，讓墨不要太死。 */
  soften?: number
}

/** 深墨版：暗部吃墨。 */
export const darkPlate =
  (strength = 1) =>
  (l: number) =>
    Math.pow(clamp01(1 - l * 1.02), 1.04) * strength

/** 中間調版：亮部留白，只吃中間。 */
export const midPlate =
  (floor = 0.16, peak = 0.56, max = 0.9) =>
  (l: number) => {
    if (l <= floor) return 0
    if (l < peak) return ((l - floor) / (peak - floor)) * max
    return Math.max(0, 1 - (l - peak) / (1 - peak)) * max
  }

/** 亮墨版：暗紙上的光。 */
export const lightPlate =
  (floor = 0.04, strength = 1) =>
  (l: number) =>
    clamp01((l - floor) / (1 - floor)) * strength

function buildPlate(
  W: number,
  H: number,
  luma: Float32Array,
  cols: number,
  rows: number,
  cell: number,
  ink: Ink,
  dx: number,
  dy: number,
  ragged: number,
): HTMLCanvasElement {
  const plate = document.createElement('canvas')
  plate.width = W
  plate.height = H
  const p = plate.getContext('2d')
  if (!p) return plate

  const path = new Path2D()
  const a = (ink.angle * Math.PI) / 180
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  const diag = Math.hypot(W, H)
  const span = Math.ceil(diag / cell) + 2
  const ox = W / 2 + dx
  const oy = H / 2 + dy

  for (let j = -span; j <= span; j++) {
    const gy = j * cell
    for (let i = -span; i <= span; i++) {
      const gx = i * cell
      const x = ox + gx * ca - gy * sa
      const y = oy + gx * sa + gy * ca
      if (x < -cell || y < -cell || x > W + cell || y > H + cell) continue

      const sx = (x / W) * cols
      const sy = (y / H) * rows
      if (sx < 0 || sy < 0 || sx >= cols || sy >= rows) continue
      const cov = clamp01(ink.coverage(luma[(sy | 0) * cols + (sx | 0)]))
      if (cov < 0.03) continue

      if (cov > 0.95) {
        path.rect(x - cell * 0.52, y - cell * 0.52, cell * 1.04, cell * 1.04)
        continue
      }

      // 墨落在紙上不會那麼圓
      const wob = 1 - ragged * 0.5 + hash(i * 37.1 + j * 11.7) * ragged
      const r = cell * 0.5 * Math.sqrt(cov) * 1.2 * wob
      if (r < 0.16) continue
      const jx = (hash(i * 5.3 + j * 9.1) - 0.5) * cell * ragged * 0.24
      const jy = (hash(i * 8.9 + j * 3.7) - 0.5) * cell * ragged * 0.24
      path.moveTo(x + jx + r, y + jy)
      path.arc(x + jx, y + jy, r, 0, TAU)
    }
  }

  p.fillStyle = ink.color
  p.fill(path)
  return plate
}

function sampleLuma(src: HTMLCanvasElement, W: number, H: number, cell: number) {
  const cols = Math.max(4, Math.ceil(W / cell))
  const rows = Math.max(4, Math.ceil(H / cell))
  const small = document.createElement('canvas')
  small.width = cols
  small.height = rows
  const mctx = small.getContext('2d', { willReadFrequently: true })
  const luma = new Float32Array(cols * rows)
  if (!mctx) return { luma, cols, rows }

  mctx.imageSmoothingEnabled = true
  mctx.imageSmoothingQuality = 'high'
  mctx.drawImage(src, 0, 0, W, H, 0, 0, cols, rows)
  const px = mctx.getImageData(0, 0, cols, rows).data
  for (let i = 0; i < cols * rows; i++) {
    luma[i] = clamp01(
      0.2126 * (px[i * 4] / 255) + 0.7152 * (px[i * 4 + 1] / 255) + 0.0722 * (px[i * 4 + 2] / 255),
    )
  }
  return { luma, cols, rows }
}

function inkPlates(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  luma: Float32Array,
  cols: number,
  rows: number,
  cell: number,
  inks: Ink[],
  dpr: number,
  ragged: number,
) {
  for (const ink of inks) {
    const [dx, dy] = ink.offset ?? [0, 0]
    const plate = buildPlate(W, H, luma, cols, rows, cell, ink, dx * dpr, dy * dpr, ragged)
    ctx.globalCompositeOperation = ink.mode ?? 'multiply'
    ctx.drawImage(plate, 0, 0)
  }
  ctx.globalCompositeOperation = 'source-over'
}

/** 印一張。canvas 的尺寸取自它的 CSS 尺寸。 */
export function renderPrint(canvas: HTMLCanvasElement, o: PrintOptions) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width < 4 || rect.height < 4) return
  const dpr = Math.min(window.devicePixelRatio || 1, o.dprCap ?? 1.35)
  const W = Math.round(rect.width * dpr)
  const H = Math.round(rect.height * dpr)

  const src = document.createElement('canvas')
  src.width = W
  src.height = H
  const sctx = src.getContext('2d')
  if (!sctx) return
  sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  o.paint(sctx, rect.width, rect.height)

  const cell = Math.max(1.6, o.cell * dpr)
  const { luma, cols, rows } = sampleLuma(src, W, H, cell)

  if (canvas.width !== W) canvas.width = W
  if (canvas.height !== H) canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = o.paper
  ctx.fillRect(0, 0, W, H)

  inkPlates(ctx, W, H, luma, cols, rows, cell, o.inks, dpr, o.ragged ?? 0.2)

  if (o.soften) {
    ctx.globalAlpha = o.soften
    ctx.fillStyle = o.paper
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 1
  }
}

/** 直接畫連續調，用在不需要網點的地方（例如解像力測試圖）。 */
export function renderSharp(canvas: HTMLCanvasElement, paint: Painter, dprCap = 2) {
  const rect = canvas.getBoundingClientRect()
  if (rect.width < 4 || rect.height < 4) return
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
  const W = Math.round(rect.width * dpr)
  const H = Math.round(rect.height * dpr)
  if (canvas.width !== W) canvas.width = W
  if (canvas.height !== H) canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, rect.width, rect.height)
  paint(ctx, rect.width, rect.height)
}

export { TAU, clamp01 }
