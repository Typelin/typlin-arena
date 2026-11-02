/**
 * 全部圖形都用 Canvas 2D 現算，沒有外部圖檔。
 *
 * 兩套畫法，刻意分開：
 *   1. 網點構成——用一點一點的墨排出形狀（首屏的光圈就是這樣疊出來的）。
 *   2. 連續調——交給網點引擎（print.ts）拆成墨版。
 *   3. 線稿——刻度、量測圖。這些是「量出來的線」，維持銳利。
 */

const TAU = Math.PI * 2

type C = CanvasRenderingContext2D

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/** 點在多邊形內？光圈開口的形狀判定。 */
function inPolygon(px: number, py: number, pts: Array<[number, number]>) {
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/* ═══════════════════════════════════════════════════════════
   首屏：光圈
   整張圖由墨點疊出來——遠看是一顆鏡頭，近看全是點。
   七片葉收成一個多邊形開口；開口是全張唯一留白的地方。
   ═══════════════════════════════════════════════════════════ */

export function paintAperture(
  ctx: C,
  W: number,
  H: number,
  fNo: number,
  opts: { bg: string; ink: string; warm: string },
) {
  const S = Math.min(W, H)
  const open = clamp01(1.4 / fNo)
  const cx = W / 2
  const cy = H / 2
  const R = S * 0.462
  const blades = 7
  const step = TAU / blades
  const rot = -Math.PI / 2 + 0.2 + (1 - open) * 0.5
  const outerR = R * 0.79
  // 孔洞最大只開到 0.58：全開時葉片仍留得住，不會變成一大片白
  const holeR = outerR * (0.06 + 0.52 * Math.pow(open, 0.9))
  const dot = Math.max(2.6, S * 0.0058)

  // 開口：七邊形，頂點在葉片的切點
  const verts: Array<[number, number]> = []
  for (let i = 0; i < blades; i++) {
    const a = rot + i * step + step / 2
    verts.push([cx + Math.cos(a) * holeR, cy + Math.sin(a) * holeR])
  }
  const seams: number[] = []
  for (let i = 0; i < blades; i++) seams.push(rot + i * step)

  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = opts.bg
  ctx.fillRect(0, 0, W, H)

  // 開口透進來的光：先鋪一層暖光，點再疊上去
  if (holeR > 2) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeR * 1.22)
    g.addColorStop(0, '#fffdf6')
    g.addColorStop(0.55, '#ffeccd')
    g.addColorStop(0.86, opts.warm)
    g.addColorStop(1, 'rgba(226,87,31,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, holeR * 1.22, 0, TAU)
    ctx.fill()
  }

  // 開口外的一圈極薄的暗，讓洞和葉片分得開
  if (holeR > 2) {
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = Math.max(2, S * 0.004)
    ctx.beginPath()
    ctx.arc(cx, cy, holeR * 1.19, 0, TAU)
    ctx.stroke()
  }

  // 外圈：滾花的點，掃過兩道斜光
  ctx.beginPath()
  for (let r = outerR + dot * 0.8; r <= R; r += dot * 1.45) {
    const t = (r - outerR) / Math.max(1, R - outerR)
    const count = Math.max(12, Math.round((TAU * r) / (dot * 1.4)))
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU
      const lit =
        0.26 +
        0.52 * Math.pow(Math.abs(Math.cos(a + 2.15)), 3.2) +
        0.36 * Math.pow(Math.abs(Math.cos(a - 1.1)), 6)
      const conv = 0.7 + 0.3 * Math.sin(t * Math.PI)
      const rr = dot * 0.5 * clamp01(lit * conv) * (0.9 + hash(i * 2.7 + r) * 0.2)
      if (rr < 0.35) continue
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      ctx.moveTo(x + rr, y)
      ctx.arc(x, y, rr, 0, TAU)
    }
  }
  ctx.fillStyle = opts.ink
  ctx.fill()

  // 刻字環：一圈細點排成帶狀，字蝕在裡面
  {
    const rIn = R * 0.842
    const rOut = R * 0.916
    ctx.beginPath()
    for (let r = rIn; r <= rOut; r += dot * 1.32) {
      const count = Math.max(12, Math.round((TAU * r) / (dot * 1.28)))
      for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU
        const rr = dot * 0.34 * (0.82 + hash(i * 3.1 + r) * 0.3)
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        ctx.moveTo(x + rr, y)
        ctx.arc(x, y, rr, 0, TAU)
      }
    }
    ctx.globalAlpha = 0.42
    ctx.fillStyle = opts.ink
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // 葉片：開口之外、外圈之內，用點排出金屬的斜光
  ctx.beginPath()
  for (let r = Math.max(holeR, dot); r < outerR; r += dot * 1.45) {
    const t = (r - holeR) / Math.max(1, outerR - holeR)
    const count = Math.max(10, Math.round((TAU * r) / (dot * 1.42)))
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + r * 0.004
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      if (inPolygon(x, y, verts)) continue

      // 接縫：靠近葉片邊界時留黑，形成輻射的刻痕
      let nearSeam = 9
      for (const s of seams) {
        const d = Math.abs(((((a - s + Math.PI) % TAU) + TAU) % TAU) - Math.PI)
        if (d < nearSeam) nearSeam = d
      }
      if (nearSeam < 0.028) continue

      // 金屬的斜光：開口附近亮、外緣暗，加上一片斜掃的高光
      const edge = 1 - Math.pow(1 - t, 3)
      const sweep = Math.pow(Math.abs(Math.cos(a + 0.9)), 3.4)
      const dens = clamp01(0.12 + edge * 0.5 + sweep * 0.42)
      const rr = dot * 0.5 * Math.sqrt(dens) * (0.88 + hash(i * 4.1 + r) * 0.24)
      if (rr < 0.35) continue
      ctx.moveTo(x + rr, y)
      ctx.arc(x, y, rr, 0, TAU)
    }
  }
  ctx.fillStyle = opts.ink
  ctx.fill()

  // 開口邊緣：一圈暖色的點，勾出光圈收束的位置
  if (holeR > 2) {
    ctx.beginPath()
    for (let i = 0; i < blades; i++) {
      const a0 = rot + i * step + step / 2
      const a1 = rot + (i + 1) * step + step / 2
      const p0x = cx + Math.cos(a0) * holeR
      const p0y = cy + Math.sin(a0) * holeR
      const p1x = cx + Math.cos(a1) * holeR
      const p1y = cy + Math.sin(a1) * holeR
      const segs = Math.max(4, Math.round(holeR / (dot * 0.55)))
      for (let k = 0; k < segs; k++) {
        const u = k / segs
        const x = p0x + (p1x - p0x) * u
        const y = p0y + (p1y - p0y) * u
        const rr = dot * (0.16 + hash(i * 7.7 + k) * 0.1)
        ctx.moveTo(x + rr, y)
        ctx.arc(x, y, rr, 0, TAU)
      }
    }
    ctx.fillStyle = opts.warm
    ctx.globalAlpha = 0.85
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // 最外緣：一圈刻度
  {
    const r0 = R * 1.028
    for (let i = 0; i < 108; i++) {
      const a = (i / 108) * TAU
      const major = i % 9 === 0
      const len = major ? S * 0.015 : S * 0.006
      ctx.strokeStyle = opts.ink
      ctx.globalAlpha = major ? 0.46 : 0.18
      ctx.lineWidth = major ? 1.4 : 1
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
      ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len))
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════
   01：巨大的數字
   ═══════════════════════════════════════════════════════════ */

export function paintBigNumber(
  ctx: C,
  W: number,
  H: number,
  digits: string,
  unit: string,
  family: string,
  ink: string,
  bg: string,
  unitScale = 0.34,
) {
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const pad = W * 0.05
  const maxW = W - pad * 2
  const maxH = H * 0.74
  const gapRatio = 0.035

  const measure = (size: number) => {
    ctx.font = `500 ${size}px ${family}`
    const m = ctx.measureText(digits)
    const asc = m.actualBoundingBoxAscent || size * 0.7
    const desc = Math.abs(m.actualBoundingBoxDescent || size * 0.02)
    ctx.font = `500 ${size * unitScale}px ${family}`
    const uw = ctx.measureText(unit).width
    const gap = size * gapRatio
    return { dw: m.width, dh: asc + desc, asc, desc, uw, gap, total: m.width + gap + uw }
  }

  let lo = 8
  let hi = H * 4
  for (let k = 0; k < 32; k++) {
    const mid = (lo + hi) / 2
    const m = measure(mid)
    if (m.total > maxW || m.dh > maxH) hi = mid
    else lo = mid
  }
  const size = (lo + hi) / 2
  const m = measure(size)

  const x0 = (W - m.total) / 2
  const by = H / 2 + (m.asc - m.desc) / 2

  ctx.fillStyle = ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `500 ${size}px ${family}`
  ctx.fillText(digits, x0, by)
  ctx.font = `500 ${size * unitScale}px ${family}`
  ctx.fillText(unit, x0 + m.dw + m.gap, by)

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════
   02：一百萬個 token 的尺
   ═══════════════════════════════════════════════════════════ */

const TOTAL = 1048576

function tickLabel(n: number) {
  if (n <= 0) return '0'
  if (n >= TOTAL) return '1M'
  const k = n / 1024
  return `${k >= 100 ? Math.round(k) : k.toFixed(1)}K`
}

export function paintTape(
  ctx: C,
  W: number,
  H: number,
  offset: number,
  opts: { bg: string; ink: string; accent: string },
) {
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = opts.bg
  ctx.fillRect(0, 0, W, H)

  const shift = ((offset % 1) + 1) % 1
  const base = H * 0.86
  const tall = H * 0.52
  const span = Math.max(148, W / 7.4)
  const first = -shift * span - span
  const count = Math.ceil(W / span) + 4

  // 尺面：一整份文本，用短槓排成六行
  for (let band = 0; band < 6; band++) {
    const y = H * 0.07 + band * (H * 0.052)
    const density = 0.22 + band * 0.02
    const maxLen = band === 5 ? 0.55 : 1
    for (let x = -6; x < W + 6; x += 5) {
      const seed = Math.floor((x + shift * span * 3.6) / 5)
      if (hash(seed * 1.37 + band * 5.1) < density) continue
      if (hash(seed * 9.1 + band * 2.2) > maxLen) continue
      const h = 2.4 + hash(seed * 2.71 + band) * 2.2
      ctx.globalAlpha = 0.1 + hash(seed * 4.3 + band) * 0.2
      ctx.fillStyle = opts.ink
      ctx.fillRect(x, y, 2.8, h)
    }
  }
  ctx.globalAlpha = 1

  for (let k = 0; k < count; k++) {
    const x = first + k * span
    if (x < -span || x > W + span) continue

    ctx.strokeStyle = opts.ink
    ctx.globalAlpha = 0.9
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(Math.round(x) + 0.5, base)
    ctx.lineTo(Math.round(x) + 0.5, base - tall)
    ctx.stroke()

    for (let i = 1; i < 10; i++) {
      const xx = x + (span / 10) * i
      const mid = i === 5
      ctx.globalAlpha = mid ? 0.4 : 0.16
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.round(xx) + 0.5, base)
      ctx.lineTo(Math.round(xx) + 0.5, base - tall * (mid ? 0.38 : 0.13))
      ctx.stroke()
    }

    const t = (x + shift * span) / Math.max(1, W)
    const label = tickLabel(Math.round(clamp01(t) * TOTAL))
    ctx.font = '500 11px "Plex Mono", monospace'
    const lw = ctx.measureText(label).width
    if (x + 6 < 12 || x + 6 + lw > W - 8) continue
    ctx.globalAlpha = 0.94
    ctx.fillStyle = opts.ink
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(label, x + 6, base - tall - 10)
  }

  ctx.globalAlpha = 0.5
  ctx.strokeStyle = opts.ink
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, base)
  ctx.lineTo(W, base)
  ctx.stroke()

  // 游標
  const cx = W * 0.5
  ctx.globalAlpha = 1
  ctx.strokeStyle = opts.accent
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(cx, base - tall - 26)
  ctx.lineTo(cx, base + 12)
  ctx.stroke()
  ctx.fillStyle = opts.accent
  ctx.beginPath()
  ctx.moveTo(cx - 6.5, base + 12)
  ctx.lineTo(cx + 6.5, base + 12)
  ctx.lineTo(cx, base + 2)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════
   04：解像力測試圖
   ═══════════════════════════════════════════════════════════ */

export function paintStar(
  ctx: C,
  W: number,
  H: number,
  effort: number,
  opts: { bg: string; ink: string; accent: string },
) {
  const t = clamp01(effort / 100)
  const S = Math.min(W, H)
  const cx = W / 2
  const cy = H * 0.535
  const R = S * 0.365
  const spokes = 64

  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = opts.bg
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = opts.ink
  ctx.globalAlpha = 0.12
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(W, cy)
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, H)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.save()
  ctx.translate(cx, cy)
  for (let i = 0; i < spokes; i++) {
    const a0 = (i / spokes) * TAU
    const a1 = ((i + 1) / spokes) * TAU
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, R, a0, a1, false)
    ctx.closePath()
    ctx.fillStyle = i % 2 === 0 ? opts.ink : opts.bg
    ctx.fill()
  }
  ctx.restore()

  // 中央的糊：不是挖一個洞，是讓扇葉在中心融成一片灰
  {
    const core = R * (0.22 + (1 - t) * 0.3)
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, core)
    g.addColorStop(0, 'rgba(10,10,10,0.94)')
    g.addColorStop(0.32, 'rgba(10,10,10,0.8)')
    g.addColorStop(0.62, 'rgba(10,10,10,0.4)')
    g.addColorStop(1, 'rgba(10,10,10,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, core, 0, TAU)
    ctx.fill()

    // 對焦環：量出「還在對」的邊界
    ctx.strokeStyle = opts.accent
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(cx, cy, Math.max(2, core * 0.52), 0, TAU)
    ctx.stroke()
  }

  ctx.strokeStyle = opts.ink
  ctx.globalAlpha = 0.09
  for (let k = 1; k <= 3; k++) {
    ctx.beginPath()
    ctx.arc(cx, cy, (R * k) / 3.1, 0, TAU)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const m = S * 0.045
  const arm = S * 0.022
  ctx.strokeStyle = opts.ink
  ctx.globalAlpha = 0.3
  ctx.lineWidth = 1
  for (const [x, y, dx, dy] of [
    [m, m, 1, 1],
    [W - m, m, -1, 1],
    [m, H - m, 1, -1],
    [W - m, H - m, -1, -1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(x + dx * arm, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * arm)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = opts.ink
  ctx.globalAlpha = 0.56
  ctx.font = '500 10px "Plex Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('FOCUS CHART · 64 SPOKES', m + 8, m + arm + 14)
  ctx.textAlign = 'right'
  ctx.fillText(`REASONING ${String(Math.round(effort)).padStart(3, '0')}`, W - m - 8, m + arm + 14)
  ctx.textAlign = 'left'
  ctx.fillText(`BLUR ${(0.2 + (1 - t) * 3.4).toFixed(1)}`, m + 8, H - m - 10)
  ctx.globalAlpha = 1

  ctx.restore()
}

/* ═══════════════════════════════════════════════════════════
   05：五塊版，印同一個字
   ═══════════════════════════════════════════════════════════ */

export function paintSame(ctx: C, W: number, H: number, text: string, family: string, ink: string, bg: string) {
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const target = Math.min(W, H) * 0.84
  const measureAt = (size: number) => {
    ctx.font = `500 ${size}px ${family}`
    return ctx.measureText(text)
  }

  let lo = 10
  let hi = Math.min(W, H) * 2.2
  for (let k = 0; k < 28; k++) {
    const mid = (lo + hi) / 2
    if (measureAt(mid).width > target) hi = mid
    else lo = mid
  }
  const size = (lo + hi) / 2
  const m = measureAt(size)
  const asc = m.actualBoundingBoxAscent || size * 0.72
  const desc = Math.abs(m.actualBoundingBoxDescent || size * 0.05)
  const by = H / 2 + (asc - desc) / 2

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const S = Math.min(W, H)
  const offs: Array<[number, number, number]> = [
    [0, 0, 1],
    [-S * 0.007, S * 0.005, 0.52],
    [S * 0.007, -S * 0.004, 0.46],
    [S * 0.003, S * 0.008, 0.3],
    [-S * 0.008, -S * 0.003, 0.26],
  ]
  for (const [dx, dy, alpha] of offs) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = ink
    ctx.fillText(text, W / 2 + dx, by + dy)
    ctx.restore()
  }

  ctx.restore()
}
