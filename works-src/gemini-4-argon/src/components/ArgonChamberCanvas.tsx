import React, { useEffect, useRef } from 'react'
import { argonAudio } from '../audio'
import { FAKE_CLAIMS, HERO_CHARS, SCENARIO_QUESTION } from '../data/narrative'

export interface DischargeTrace {
  x: number
  y: number
  stage: number
}

export interface ArgonLabelEntry {
  text: string
  x: number
  y: number
  w: number
  h: number
  alpha: number
  stage: number
  inDwell: boolean
  bgLuma: number
  fgLuma: number
  contrast: number
}

export interface LineSample {
  x: number
  y: number
  r: number
}

export interface StageState {
  scrollProgress: number // 0..1 continuous
  modalities: [boolean, boolean, boolean]
  pinchRing: number // 1..3
  verifiedStamp: boolean // irreversible once Chapter 3 is reached
  shatteredFakes: [boolean, boolean, boolean] // irreversible once shattered
  chosenDecision: 'none' | 'umbrella' | 'handsfree'
  reducedMotion: boolean
}

interface ArgonChamberCanvasProps {
  state: StageState
  onRecordTrace: (tr: DischargeTrace) => void
  onToggleModality: (idx: 0 | 1 | 2) => void
  onSetPinchRing: (ring: number) => void
  onShatterFake: (idx: 0 | 1 | 2) => void
  onChooseDecision: (choice: 'umbrella' | 'handsfree') => void
}

interface Shard {
  x: number
  y: number
  vx: number
  vy: number
  ang: number
  vang: number
  size: number
  born: number
  color: string
}

interface BrokenHalf {
  text: string
  x: number
  y: number
  vx: number
  vy: number
  ang: number
  vang: number
  born: number
  fontSize: number
}

interface Shockwave {
  x: number
  y: number
  born: number
  color: string
}

interface QueuedLabel {
  text: string
  anchorX: number
  anchorY: number
  fgColor: string
  fgRgb: [number, number, number]
  accentColor: string
  haloRgb: [number, number, number]
  fontSize: number
  align: 'left' | 'center' | 'right'
  alpha: number
  stage: number
  inDwell: boolean
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / Math.max(0.0001, e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}

function srgbToLinear(c: number): number {
  const v = clamp(c / 255, 0, 1)
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function relativeLuminance(rgb: [number, number, number]): number {
  return (
    0.2126 * srgbToLinear(rgb[0]) +
    0.7152 * srgbToLinear(rgb[1]) +
    0.0722 * srgbToLinear(rgb[2])
  )
}

function wcagContrast(l1: number, l2: number): number {
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

/**
 * Maps raw scrollProgress p ∈ [0, 1] into continuous stageFloat ∈ [0, 4]
 * where each chapter has 45% Dwell (停留) and 55% Transition (轉變).
 */
export function mapScrollToStageFloat(p: number): {
  stageFloat: number
  chapterIdx: number
  inTransition: boolean
  transitionProgress: number
} {
  const u = clamp(p, 0, 1)
  if (u >= 0.88) {
    return { stageFloat: 4.0, chapterIdx: 4, inTransition: false, transitionProgress: 0 }
  }
  const segIdx = Math.min(3, Math.floor(u / 0.22))
  const localU = (u - segIdx * 0.22) / 0.22
  const dwellRatio = 0.45
  if (localU <= dwellRatio) {
    return {
      stageFloat: segIdx,
      chapterIdx: segIdx,
      inTransition: false,
      transitionProgress: 0,
    }
  }
  const transT = smoothstep(0, 1, (localU - dwellRatio) / (1 - dwellRatio))
  return {
    stageFloat: segIdx + transT,
    chapterIdx: transT < 0.5 ? segIdx : segIdx + 1,
    inTransition: true,
    transitionProgress: transT,
  }
}

function mixRgb(c1: [number, number, number], c2: [number, number, number], t: number): string {
  const u = clamp(t, 0, 1)
  const r = Math.round(lerp(c1[0], c2[0], u))
  const g = Math.round(lerp(c1[1], c2[1], u))
  const b = Math.round(lerp(c1[2], c2[2], u))
  return `rgb(${r}, ${g}, ${b})`
}

function safeArc(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sAngle = 0,
  eAngle = Math.PI * 2
) {
  const safeR = Math.max(0.001, Number.isFinite(r) ? r : 0.001)
  c.arc(x, y, safeR, sAngle, eAngle)
}

function safeEllipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot = 0,
  sAngle = 0,
  eAngle = Math.PI * 2
) {
  const safeRx = Math.max(0.001, Number.isFinite(rx) ? rx : 0.001)
  const safeRy = Math.max(0.001, Number.isFinite(ry) ? ry : 0.001)
  c.ellipse(x, y, safeRx, safeRy, rot, sAngle, eAngle)
}

function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad = 8
): boolean {
  return !(
    a.x + a.w + pad <= b.x ||
    b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y ||
    b.y + b.h + pad <= a.y
  )
}

function distPointToRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): number {
  const cx = clamp(px, rx, rx + rw)
  const cy = clamp(py, ry, ry + rh)
  return Math.hypot(px - cx, py - cy)
}

export const ArgonChamberCanvas: React.FC<ArgonChamberCanvasProps> = ({
  state,
  onRecordTrace,
  onToggleModality,
  onSetPinchRing,
  onShatterFake,
  onChooseDecision,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stateRef = useRef<StageState>(state)
  stateRef.current = state

  const pointerRef = useRef<{
    x: number
    y: number
    active: boolean
    isDown: boolean
  }>({
    x: 0.48,
    y: 0.45,
    active: false,
    isDown: false,
  })

  const smoothSRef = useRef<number>(mapScrollToStageFloat(state.scrollProgress).stageFloat)
  const simTimeRef = useRef<number>(1.5)
  const pulseRef = useRef<number>(0)
  const flashAlphaRef = useRef<number>(0)
  const slowMoUntilRef = useRef<number>(0)
  const shardsRef = useRef<Shard[]>([])
  const brokenHalvesRef = useRef<BrokenHalf[]>([])
  const shockwavesRef = useRef<Shockwave[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles = Array.from({ length: 260 }, (_, i) => ({
      u: ((i * 73) % 1000) / 1000,
      v: ((i * 137) % 1000) / 1000,
      speed: 0.032 + ((i * 19) % 10) * 0.006,
      size: 1.1 + (i % 3) * 0.7,
      seed: i * 0.71,
    }))

    let rafId = 0
    let lastPerfNow = performance.now()

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr))
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr))
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const render = () => {
      rafId = requestAnimationFrame(render)

      const now = performance.now()
      const rawDt = clamp((now - lastPerfNow) / 1000, 0.001, 0.05)
      lastPerfNow = now

      const isSlowMo = now < slowMoUntilRef.current
      const timeScale = isSlowMo ? 0.16 : 1.0
      const dt = rawDt * timeScale

      const st = stateRef.current
      if (!st.reducedMotion) {
        simTimeRef.current += dt
      }
      const time = simTimeRef.current

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = Math.max(1, canvas.width / dpr)
      const H = Math.max(1, canvas.height / dpr)
      const isCompact = W < 820

      // Per-frame collision & verification registries
      const argonLabels: ArgonLabelEntry[] = []
      const lineSamples: LineSample[] = []
      const labelQueue: QueuedLabel[] = []

      const recordNodeObstacle = (x: number, y: number, r: number) => {
        lineSamples.push({ x, y, r: r + 4 })
      }

      const drawSpline = (
        c: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        archOffset: number,
        amp: number,
        t: number,
        seed: number,
        pullX?: number,
        pullY?: number,
        pullWeight = 0,
        recordSamples = false,
        sampleOutY?: number[]
      ) => {
        c.lineCap = 'round'
        c.lineJoin = 'round'
        const nodes = 24
        const pts: { x: number; y: number }[] = [{ x: x1, y: y1 }]
        const dx = -(y2 - y1)
        const dy = x2 - x1
        const dist = Math.hypot(dx, dy) || 1
        const nx = dx / dist
        const ny = dy / dist

        for (let i = 1; i < nodes; i++) {
          const u = i / nodes
          const env = Math.sin(u * Math.PI)
          let bx = lerp(x1, x2, u) + nx * archOffset * env
          let by = lerp(y1, y2, u) + ny * archOffset * env

          if (pullX !== undefined && pullY !== undefined && pullWeight > 0) {
            const prox = Math.exp(-Math.pow((bx - pullX) / (dist * 0.36), 2))
            bx += (pullX - bx) * env * pullWeight * 0.32
            by += (pullY - by) * env * pullWeight * (0.45 + prox * 0.45)
          }

          const w1 = Math.sin(t * 4.6 + u * Math.PI * 3.0 + seed * 1.9)
          const w2 = Math.cos(t * 7.8 - u * Math.PI * 5.0 + seed * 3.1)
          const offset = (w1 * 0.65 + w2 * 0.35) * amp * env
          const px = bx + nx * offset
          const py = by + ny * offset
          pts.push({ x: px, y: py })
          if (recordSamples) {
            lineSamples.push({ x: px, y: py, r: 4 })
          }
        }
        pts.push({ x: x2, y: y2 })
        if (recordSamples) {
          lineSamples.push({ x: x1, y: y1, r: 4 })
          lineSamples.push({ x: x2, y: y2, r: 4 })
        }

        if (sampleOutY) {
          sampleOutY.length = 0
          for (const p of pts) sampleOutY.push(p.y)
        }

        c.beginPath()
        c.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) * 0.5
          const my = (pts[i].y + pts[i + 1].y) * 0.5
          c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my)
        }
        const last = pts[pts.length - 1]
        c.lineTo(last.x, last.y)
        c.stroke()
        return pts
      }

      const drawPlasmaCord = (
        c: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        archOffset: number,
        glowCol: string,
        mainCol: string,
        secCol: string,
        scale: number,
        amp: number,
        t: number,
        seed: number,
        pullX?: number,
        pullY?: number,
        pullWeight = 0,
        recordSamples = true,
        sampleOutY?: number[]
      ) => {
        c.save()
        // 1. Wide volumetric field aura (amplified for strong visual presence!)
        c.strokeStyle = glowCol
        c.lineWidth = Math.max(2, 44 * scale)
        drawSpline(
          c,
          x1,
          y1,
          x2,
          y2,
          archOffset,
          amp * 0.9,
          t * 0.8,
          seed,
          pullX,
          pullY,
          pullWeight,
          false
        )

        // 2. Outer harmonic counter-wave
        c.strokeStyle = secCol
        c.lineWidth = Math.max(1.2, 3.6 * scale)
        drawSpline(
          c,
          x1,
          y1,
          x2,
          y2,
          archOffset,
          amp * 1.45,
          t * 1.18 + 1.8,
          seed + 7,
          pullX,
          pullY,
          pullWeight,
          false
        )

        // 3. Second braided harmonic wave
        c.strokeStyle = mainCol
        c.lineWidth = Math.max(1.0, 2.4 * scale)
        drawSpline(
          c,
          x1,
          y1,
          x2,
          y2,
          archOffset,
          -amp * 1.15,
          t * 0.95 + 3.4,
          seed + 13,
          pullX,
          pullY,
          pullWeight,
          false
        )

        // 4. Primary plasma core channel (records spine samples into lineSamples)
        c.strokeStyle = mainCol
        c.lineWidth = Math.max(2, 8.5 * scale)
        drawSpline(
          c,
          x1,
          y1,
          x2,
          y2,
          archOffset,
          amp,
          t,
          seed + 3,
          pullX,
          pullY,
          pullWeight,
          recordSamples,
          sampleOutY
        )

        // 5. Incandescent white spine
        c.strokeStyle = '#FFFFFF'
        c.lineWidth = Math.max(1.2, 2.8 * Math.min(1.3, scale))
        drawSpline(
          c,
          x1,
          y1,
          x2,
          y2,
          archOffset,
          amp * 0.48,
          t,
          seed + 3,
          pullX,
          pullY,
          pullWeight,
          false
        )
        c.restore()
      }

      const flushQueuedLabels = (c: CanvasRenderingContext2D) => {
        const dxSteps = [0, -28, 28, -56, 56, -88, 88]

        for (const item of labelQueue) {
          const safeAlpha = item.inDwell ? 1.0 : clamp(item.alpha, 0, 1)
          if (safeAlpha < 0.18) continue

          c.save()
          let fitFontSize = item.fontSize
          c.font = `800 ${fitFontSize}px "Noto Serif TC", serif`
          let tw = c.measureText(item.text).width
          const availW = W - (isCompact ? 34 : 72)
          if (tw > availW && availW > 40) {
            fitFontSize = Math.max(11, Math.floor((fitFontSize * availW) / tw))
            c.font = `800 ${fitFontSize}px "Noto Serif TC", serif`
            tw = c.measureText(item.text).width
          }
          const th = fitFontSize * 1.32
          const minX = 16
          const maxX = Math.max(minX, W - (isCompact ? 26 : 56) - tw)
          const minY = 46
          const maxY = Math.max(minY, H * 0.755 - th)

          const rawBx =
            item.align === 'left'
              ? item.anchorX
              : item.align === 'right'
                ? item.anchorX - tw
                : item.anchorX - tw * 0.5
          const baseBx = clamp(rawBx, minX, maxX)
          const baseBy = clamp(item.anchorY - th * 0.5, minY, maxY)

          // Prefer moving away from mainAxisY (upward if above centerline, downward if below centerline)
          const dir = item.anchorY >= H * 0.44 ? 1 : -1
          const orderedDy = [
            0,
            dir * 16,
            dir * 32,
            -dir * 16,
            dir * 48,
            -dir * 32,
            dir * 66,
            -dir * 48,
            dir * 86,
            -dir * 66,
            dir * 108,
            -dir * 86,
          ]

          let chosen: { x: number; y: number; w: number; h: number } | null = null

          outerSearch: for (const dy of orderedDy) {
            for (const dx of dxSteps) {
              const cx = clamp(baseBx + dx, minX, maxX)
              const cy = clamp(baseBy + dy, minY, maxY)
              const cand = { x: cx, y: cy, w: tw, h: th }

              // 1. Check against all already-placed labels (must have 0 overlap!)
              let labelHit = false
              for (const ex of argonLabels) {
                if (boxesOverlap(cand, ex, 8)) {
                  labelHit = true
                  break
                }
              }
              if (labelHit) continue

              // 2. Check against all recorded arc/branch/circle samples (distance must be >= 8px!)
              let lineHit = false
              for (const ls of lineSamples) {
                const d = distPointToRect(ls.x, ls.y, cand.x, cand.y, cand.w, cand.h)
                if (d < 8 + ls.r) {
                  lineHit = true
                  break
                }
              }
              if (!lineHit) {
                chosen = cand
                break outerSearch
              }
            }
          }

          // If no spot in the spiral avoided both labels and lines, skip drawing as required ("找不到空位就不畫")
          if (!chosen) {
            c.restore()
            continue
          }

          const bgL = relativeLuminance(item.haloRgb)
          const fgL = relativeLuminance(item.fgRgb)
          const ratio = wcagContrast(bgL, fgL)

          argonLabels.push({
            text: item.text,
            x: Math.round(chosen.x),
            y: Math.round(chosen.y),
            w: Math.round(chosen.w),
            h: Math.round(chosen.h),
            alpha: Number(safeAlpha.toFixed(3)),
            stage: item.stage,
            inDwell: item.inDwell,
            bgLuma: Number(bgL.toFixed(4)),
            fgLuma: Number(fgL.toFixed(4)),
            contrast: Number(ratio.toFixed(2)),
          })

          const centerX = chosen.x + chosen.w * 0.5
          const centerY = chosen.y + chosen.h * 0.5

          c.globalAlpha = safeAlpha

          // Soft radial luminance cushion behind the text (no box, no border!)
          const rx = Math.max(28, chosen.w * 0.72)
          const ry = Math.max(18, chosen.h * 1.2)
          c.save()
          c.translate(centerX, centerY)
          c.scale(1, ry / rx)
          const grad = c.createRadialGradient(0, 0, 2, 0, 0, rx)
          grad.addColorStop(
            0,
            `rgba(${item.haloRgb[0]}, ${item.haloRgb[1]}, ${item.haloRgb[2]}, 0.96)`
          )
          grad.addColorStop(
            0.7,
            `rgba(${item.haloRgb[0]}, ${item.haloRgb[1]}, ${item.haloRgb[2]}, 0.78)`
          )
          grad.addColorStop(
            1,
            `rgba(${item.haloRgb[0]}, ${item.haloRgb[1]}, ${item.haloRgb[2]}, 0)`
          )
          c.fillStyle = grad
          c.beginPath()
          safeArc(c, 0, 0, rx)
          c.fill()
          c.restore()

          // Pure typography + short accent underline
          c.fillStyle = item.fgColor
          c.textAlign = 'left'
          c.textBaseline = 'middle'
          c.lineJoin = 'round'
          c.lineWidth = 5
          c.strokeStyle = `rgba(${item.haloRgb[0]}, ${item.haloRgb[1]}, ${item.haloRgb[2]}, 0.95)`
          c.strokeText(item.text, chosen.x, centerY)
          c.fillText(item.text, chosen.x, centerY)

          c.strokeStyle = item.accentColor
          c.lineWidth = 2.0
          c.beginPath()
          c.moveTo(chosen.x, chosen.y + chosen.h - 1)
          c.lineTo(chosen.x + Math.min(chosen.w, 42), chosen.y + chosen.h - 1)
          c.stroke()

          c.restore()
        }
      }

      ctx.save()
      try {
        ctx.scale(dpr, dpr)

        const mapped = mapScrollToStageFloat(st.scrollProgress)
        const targetS = mapped.stageFloat
        const inDwell = !mapped.inTransition
        const lerpRate =
          st.reducedMotion || inDwell || Math.abs(targetS - smoothSRef.current) > 0.85
            ? 1
            : Math.min(1, rawDt * 14.0)
        smoothSRef.current += (targetS - smoothSRef.current) * lerpRate
        pulseRef.current = Math.max(0, pulseRef.current - rawDt * 1.8)
        flashAlphaRef.current = Math.max(0, flashAlphaRef.current - rawDt * 2.6)

        const s = clamp(smoothSRef.current, 0, 4)
        const pulse = pulseRef.current

        const palettes: [number, number, number][] = [
          [236, 231, 220], // 0: Warm limestone daylight
          [214, 226, 240], // 1: Cool optical slate
          [9, 20, 36],     // 2: Deep Prussian night
          [24, 4, 10],     // 3: Breakdown crimson-obsidian
          [9, 15, 28],     // 4: Symbiosis deep indigo
        ]
        const idx0 = Math.min(3, Math.max(0, Math.floor(s)))
        const rawFrac = clamp(s - idx0, 0, 1)
        const frac = idx0 === 1 ? smoothstep(0.445, 0.56, rawFrac) : rawFrac
        const currentBgRgb: [number, number, number] = [
          Math.round(lerp(palettes[idx0][0], palettes[idx0 + 1][0], frac)),
          Math.round(lerp(palettes[idx0][1], palettes[idx0 + 1][1], frac)),
          Math.round(lerp(palettes[idx0][2], palettes[idx0 + 1][2], frac)),
        ]
        ctx.fillStyle = mixRgb(palettes[idx0], palettes[idx0 + 1], frac)
        ctx.fillRect(0, 0, W, H)

        const isLight = s < 1.5
        const primaryFg = isLight ? '#090C12' : '#FFFFFF'
        const primaryFgRgb: [number, number, number] = isLight ? [9, 12, 18] : [255, 255, 255]
        const goldFg = isLight ? '#7F1D1D' : '#FDE047'
        const goldFgRgb: [number, number, number] = isLight ? [127, 29, 29] : [253, 224, 71]
        const cyanFg = isLight ? '#0F2996' : '#7DD3FC'
        const cyanFgRgb: [number, number, number] = isLight ? [15, 41, 150] : [125, 211, 252]
        const redAlertFg = '#FFE4E6'
        const redAlertFgRgb: [number, number, number] = [255, 228, 230]

        const ptrX = pointerRef.current.active ? pointerRef.current.x * W : W * 0.45
        const ptrY = pointerRef.current.active ? pointerRef.current.y * H : H * 0.45
        const pullW = pointerRef.current.active ? (pointerRef.current.isDown ? 0.95 : 0.48) : 0

        const t0to1 = smoothstep(0.02, 0.98, s)
        const t1to2 = smoothstep(1.02, 1.98, s)
        // Instant morphological eruption when entering Chapter 4 (s > 2.02)!
        const t2to3 = smoothstep(2.02, 2.38, s)
        const t3to4 = smoothstep(3.02, 3.95, s)

        const wStage1 = t0to1 * (1 - t1to2)
        const wStage2 = t1to2 * (1 - t2to3)
        const wStage3 = t2to3 * (1 - t3to4)
        const wStage4 = t3to4

        // Strict disjoint envelopes: in Dwell (前 45%), alpha is strictly 1.0!
        const env0 =
          inDwell && mapped.chapterIdx === 0 ? 1.0 : clamp(1 - Math.abs(s - 0) * 2.4, 0, 1)
        const env1 =
          inDwell && mapped.chapterIdx === 1 ? 1.0 : clamp(1 - Math.abs(s - 1) * 2.4, 0, 1)
        const env2 =
          inDwell && mapped.chapterIdx === 2 ? 1.0 : clamp(1 - Math.abs(s - 2) * 2.4, 0, 1)
        const env3 =
          inDwell && mapped.chapterIdx === 3 ? 1.0 : clamp(1 - Math.abs(s - 3) * 2.4, 0, 1)
        const env4 =
          inDwell && mapped.chapterIdx === 4 ? 1.0 : clamp(1 - Math.abs(s - 4) * 2.4, 0, 1)

        // Main electric arc vertical center sits in [42%..48%] of viewport height!
        const mainAxisY = lerp(H * 0.47, H * 0.43, smoothstep(0.05, 0.9, s))
        const leftAnchorX = W * (isCompact ? 0.08 : 0.09)
        const rightAnchorX = lerp(
          W * (isCompact ? 0.86 : 0.83),
          W * (isCompact ? 0.8 : 0.64),
          t3to4
        )

        // Font sizes: Story Protagonist is the 2nd largest text on screen (~40% of hero title);
        // Fake Claims in Ch 4 are >= 0.8x of main sentence size!
        const protagonistSize = isCompact ? 17.5 : 27
        const fakeClaimSize = isCompact ? 15.5 : 24
        const subLabelSize = isCompact ? 13 : 16

        // ── 1. FULL-SCREEN EQUIPOTENTIAL FIELD LINES & ARGON PARTICLES ────────
        ctx.save()
        ctx.strokeStyle = isLight
          ? 'rgba(20, 24, 36, 0.075)'
          : wStage3 > 0.2
            ? 'rgba(255, 45, 75, 0.16)'
            : 'rgba(56, 189, 248, 0.09)'
        ctx.lineWidth = wStage3 > 0.2 ? 1.4 : 1.0
        for (let i = 0; i < 15; i++) {
          const norm = (i / 14) * 2 - 1
          ctx.beginPath()
          for (let step = 0; step <= 44; step++) {
            const u = step / 44
            const x = u * W
            const arch = Math.sin(u * Math.PI)
            const squeeze = wStage2 > 0.05 ? lerp(1, 0.28, wStage2 * Math.sin(u * Math.PI)) : 1
            // In Chapter 4 (wStage3), chaotic red waves fill 72% of the screen height!
            const chaos =
              wStage3 > 0.08
                ? Math.sin(u * 22 + time * 8 + i * 1.3) * 32 * wStage3 * arch
                : 0
            const y = mainAxisY + norm * H * 0.36 * Math.pow(arch, 0.58) * squeeze + chaos
            if (step === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          const u = (p.u + time * p.speed) % 1
          const arch = Math.sin(u * Math.PI)
          const px = u * W
          const py = mainAxisY + (p.v - 0.5) * H * (0.34 + 0.42 * arch)
          ctx.beginPath()
          safeArc(ctx, px, py, p.size)
          ctx.fillStyle = isLight
            ? 'rgba(20, 24, 36, 0.18)'
            : wStage3 > 0.25
              ? 'rgba(255, 70, 95, 0.48)'
              : 'rgba(56, 189, 248, 0.38)'
          ctx.fill()
        }
        ctx.restore()

        // ── 2. UNIFIED CONTINUOUSLY MORPHING 3-STRAND ARC SYSTEM ──────────────
        const strandMeta = [
          {
            glow: 'rgba(30, 47, 217, 0.24)',
            main: '#1E2FD9',
            sec: '#4F46E5',
            sourceLabel: '● 文字：下午三點出門',
          },
          {
            glow: 'rgba(13, 116, 144, 0.24)',
            main: '#0D7490',
            sec: '#06B6D4',
            sourceLabel: '● 圖片：衛星雲圖鋒面',
          },
          {
            glow: 'rgba(200, 55, 45, 0.24)',
            main: '#C8372D',
            sec: '#F59E0B',
            sourceLabel: '● 數據：午後雨量 80%',
          },
        ]

        const activeMods = st.modalities.filter(Boolean).length
        let stage1FocalY = mainAxisY
        if (wStage1 > 0.05 && activeMods > 0 && activeMods < 3) {
          let sum = 0
          const offsets = [-H * 0.21, 0, H * 0.21]
          for (let k = 0; k < 3; k++) {
            if (st.modalities[k]) sum += mainAxisY + offsets[k]
          }
          stage1FocalY = lerp(mainAxisY, sum / activeMods, wStage1 * 0.65)
        }

        const sampledMainY: number[] = []
        const unshatteredCount = st.shatteredFakes.filter((v) => !v).length

        for (let k = 0; k < 3; k++) {
          const kNorm = k - 1
          // In Stage 1, 3 streams spread widely across 44% of screen height!
          // In Stage 3 (Ch 4 breakdown), the 3 strands violentlybow apart to fill the center!
          const splitSpread = wStage1 * (isCompact ? H * 0.19 : H * 0.22)
          const sy = mainAxisY + kNorm * splitSpread
          const sx = leftAnchorX
          const ex = rightAnchorX
          const ey = lerp(mainAxisY, stage1FocalY, wStage1)

          const breakdownBow =
            wStage3 > 0.05 && unshatteredCount > 0 ? kNorm * wStage3 * H * 0.085 : 0
          const ringArch =
            (k === 0 ? -wStage4 * H * 0.21 : k === 2 ? wStage4 * H * 0.21 : 0) +
            breakdownBow

          const isMutedStage1 = wStage1 > 0.2 && !st.modalities[k]
          const isDimmedStage4 =
            wStage4 > 0.4 &&
            ((k === 0 && st.chosenDecision === 'handsfree') ||
              (k === 2 && st.chosenDecision === 'umbrella') ||
              k === 1)

          if (isMutedStage1 || isDimmedStage4) {
            ctx.save()
            ctx.setLineDash([5, 8])
            ctx.strokeStyle = isLight ? 'rgba(20, 24, 36, 0.25)' : 'rgba(245, 238, 221, 0.22)'
            ctx.lineWidth = 1.8
            drawSpline(ctx, sx, sy, ex, ey, ringArch, 5, time, k * 10, undefined, undefined, 0, true)
            ctx.restore()
          } else {
            const mainCol =
              wStage4 > 0.35
                ? k === 0
                  ? '#F5B041'
                  : '#38BDF8'
                : wStage3 > 0.15 && unshatteredCount > 0
                  ? k === 1
                    ? '#FF2947'
                    : '#FF6B4A'
                  : wStage2 + wStage3 > 0.35
                    ? '#38BDF8'
                    : strandMeta[k].main
            const secCol =
              wStage4 > 0.35
                ? '#FFFFFF'
                : wStage3 > 0.15 && unshatteredCount > 0
                  ? '#FDE047'
                  : strandMeta[k].sec
            const glowCol =
              wStage4 > 0.35
                ? k === 0
                  ? 'rgba(245, 176, 65, 0.26)'
                  : 'rgba(56, 189, 248, 0.26)'
                : wStage3 > 0.15 && unshatteredCount > 0
                  ? 'rgba(255, 41, 71, 0.32)'
                  : strandMeta[k].glow

            // Huge dynamic amplitude: Stage 0 has bold 42px wave; Stage 2 pinches to 14px; Stage 3 erupts to 78px!
            const baseAmp = lerp(42, 14, wStage2)
            const eruptMult = wStage3 > 0.1 && unshatteredCount > 0 ? 2.6 : 1.0
            const amp =
              baseAmp *
                eruptMult *
                (wStage4 > 0.3 ? (st.chosenDecision !== 'none' ? 0.38 : 0.65) : 1) +
              pulse * 32

            drawPlasmaCord(
              ctx,
              sx,
              sy,
              ex,
              ey,
              ringArch,
              glowCol,
              mainCol,
              secCol,
              k === 1 || wStage1 > 0.15 || wStage4 > 0.15 ? 1.25 : 0.95,
              amp,
              time * (wStage3 > 0.15 && unshatteredCount > 0 ? 1.65 : 1.0),
              k * 11 + 1,
              ptrX,
              ptrY,
              pullW,
              true,
              k === 1 ? sampledMainY : undefined
            )
          }

          if (env1 > 0.18) {
            const nodeR = isCompact ? 11 : 14
            ctx.save()
            ctx.globalAlpha = env1
            ctx.beginPath()
            safeArc(ctx, sx, sy, nodeR)
            ctx.fillStyle = st.modalities[k] ? strandMeta[k].main : '#94A3B8'
            ctx.fill()
            ctx.lineWidth = 2.5
            ctx.strokeStyle = '#090C12'
            ctx.stroke()
            ctx.restore()
            recordNodeObstacle(sx, sy, nodeR)

            const labelYOffset = k === 0 ? -36 : k === 1 ? -36 : 38
            labelQueue.push({
              text: st.modalities[k]
                ? strandMeta[k].sourceLabel
                : strandMeta[k].sourceLabel.replace('●', '○'),
              anchorX: sx + 22,
              anchorY: sy + labelYOffset,
              fgColor: primaryFg,
              fgRgb: primaryFgRgb,
              accentColor: strandMeta[k].main,
              haloRgb: currentBgRgb,
              fontSize: subLabelSize,
              align: 'left',
              alpha: env1,
              stage: 1,
              inDwell: inDwell && mapped.chapterIdx === 1,
            })
          }
        }

        // ── STAGE 0: HERO TITLE + SECOND-LARGEST PROTAGONIST QUESTION ─────────
        if (env0 > 0.18) {
          ctx.save()
          ctx.globalAlpha = env0

          const sigSize = isCompact ? Math.round(W * 0.12) : Math.min(82, Math.round(W * 0.056))
          const sigY = isCompact ? H * 0.12 : H * 0.125
          ctx.font = `400 italic ${sigSize}px "Instrument Serif", Georgia, serif`
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'left'
          const gText = 'Gemini 4 '
          const gWidth = ctx.measureText(gText).width
          ctx.fillStyle = '#090C12'
          ctx.fillText(gText, leftAnchorX, sigY)
          ctx.font = `400 ${sigSize}px "Instrument Serif", Georgia, serif`
          ctx.fillStyle = '#1E2FD9'
          ctx.fillText('Argon', leftAnchorX + gWidth, sigY)

          const nChars = HERO_CHARS.length
          const charSize = isCompact
            ? Math.max(21, Math.round((W * 0.76) / 9.2))
            : Math.min(76, Math.round((W * 0.72) / 9.5))
          const baseTitleY = isCompact ? H * 0.23 : H * 0.24
          const spanW = rightAnchorX - leftAnchorX

          ctx.font = `900 ${charSize}px "Noto Serif TC", serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          for (let i = 0; i < nChars; i++) {
            const cx = leftAnchorX + ((i + 0.5) / nChars) * spanW
            let dy = 0
            if (sampledMainY.length > 2) {
              const sIdx = Math.min(
                sampledMainY.length - 1,
                Math.max(0, Math.round(((i + 0.5) / nChars) * (sampledMainY.length - 1)))
              )
              dy = clamp((sampledMainY[sIdx] - mainAxisY) * 0.24 * env0, -12, 12)
            }
            ctx.strokeStyle = 'rgba(236, 231, 220, 0.95)'
            ctx.lineWidth = 8
            ctx.strokeText(HERO_CHARS[i], cx, baseTitleY + dy)
            ctx.fillStyle = '#090C12'
            ctx.fillText(HERO_CHARS[i], cx, baseTitleY + dy)
            recordNodeObstacle(cx, baseTitleY + dy, charSize * 0.52)
          }

          for (const [idx, px] of [leftAnchorX, rightAnchorX].entries()) {
            const r = isCompact ? 12 : 16
            ctx.beginPath()
            safeArc(ctx, px, mainAxisY, r)
            ctx.fillStyle = idx === 0 ? '#C8372D' : '#1E2FD9'
            ctx.fill()
            ctx.lineWidth = 2.5
            ctx.strokeStyle = '#090C12'
            ctx.stroke()
            recordNodeObstacle(px, mainAxisY, r)
          }
          ctx.restore()

          const qText = st.verifiedStamp
            ? `「${SCENARIO_QUESTION}」 → 午後有雨`
            : `「${SCENARIO_QUESTION}」`
          labelQueue.push({
            text: qText,
            anchorX: (leftAnchorX + rightAnchorX) * 0.5,
            anchorY: H * 0.6,
            fgColor: primaryFg,
            fgRgb: primaryFgRgb,
            accentColor: '#1E2FD9',
            haloRgb: currentBgRgb,
            fontSize: protagonistSize,
            align: 'center',
            alpha: env0,
            stage: 0,
            inDwell: inDwell && mapped.chapterIdx === 0,
          })
        }

        // ── STAGE 1: CONVERGENCE OF THE 3 STREAMS & PROTAGONIST FINDING ──────
        if (env1 > 0.18) {
          const focalR = isCompact ? 16 : 20
          ctx.save()
          ctx.globalAlpha = env1
          ctx.beginPath()
          safeArc(ctx, rightAnchorX, stage1FocalY, focalR)
          ctx.fillStyle = activeMods === 3 ? '#1E2FD9' : '#C8372D'
          ctx.fill()
          ctx.lineWidth = 2.5
          ctx.strokeStyle = '#FFFFFF'
          ctx.stroke()
          ctx.restore()
          recordNodeObstacle(rightAnchorX, stage1FocalY, focalR)

          // Protagonist Question transformed in Stage 1
          labelQueue.push({
            text:
              activeMods === 3
                ? `「${SCENARIO_QUESTION}」 → 午後三點有雷陣雨`
                : `「${SCENARIO_QUESTION}」 → 少看 ${3 - activeMods} 項而偏焦`,
            anchorX: rightAnchorX,
            anchorY: H * 0.12,
            fgColor: cyanFg,
            fgRgb: cyanFgRgb,
            accentColor: activeMods === 3 ? '#1E2FD9' : '#C8372D',
            haloRgb: currentBgRgb,
            fontSize: protagonistSize * 0.9,
            align: 'right',
            alpha: env1,
            stage: 1,
            inDwell: inDwell && mapped.chapterIdx === 1,
          })
        }

        // ── STAGE 2: 60% HEIGHT VERIFICATION RINGS & VERIFIED PROTAGONIST ────
        if (env2 > 0.18) {
          ctx.save()
          ctx.globalAlpha = env2

          const ringPositions = [0.24, 0.5, 0.76]
          const ringTitles = ['先猜：大太陽不用帶', '查證：午後鋒面過境', '改判：午後降雨 80%']
          // Largest ring diameter = 2 * 0.30H = 60% of viewport height!
          const ringRadii = [H * 0.29, H * 0.2, H * 0.11]

          // 20 wide candidate trajectories spanning 60% of screen height
          for (let b = 0; b < 20; b++) {
            const norm = (b / 19) * 2 - 1
            const passLevel = b % 5 === 0 ? 3 : b % 2 === 0 ? 2 : 1
            const cutoff = Math.min(passLevel, st.pinchRing)
            const endX =
              passLevel >= st.pinchRing
                ? rightAnchorX
                : lerp(leftAnchorX, rightAnchorX, ringPositions[cutoff - 1])
            const startY = mainAxisY + norm * H * 0.3 * env2
            const endY =
              passLevel >= st.pinchRing
                ? mainAxisY + norm * 5
                : mainAxisY + norm * ringRadii[cutoff - 1]

            ctx.strokeStyle =
              passLevel >= st.pinchRing
                ? 'rgba(56, 189, 248, 0.52)'
                : 'rgba(148, 163, 184, 0.22)'
            ctx.lineWidth = passLevel >= st.pinchRing ? 1.8 : 1.1
            drawSpline(ctx, leftAnchorX, startY, endX, endY, 0, 14, time, b + 60)
          }

          for (let r = 0; r < 3; r++) {
            const rx = lerp(leftAnchorX, rightAnchorX, ringPositions[r])
            const ry = Math.max(12, ringRadii[r] * env2)
            const rxHoriz = isCompact ? 16 : 24
            const active = r + 1 <= st.pinchRing

            ctx.beginPath()
            safeEllipse(ctx, rx, mainAxisY, rxHoriz, ry)
            ctx.strokeStyle = active ? (r === 0 ? '#FDE047' : '#38BDF8') : 'rgba(255, 255, 255, 0.45)'
            ctx.lineWidth = active ? 3.2 : 1.6
            ctx.stroke()

            // Register top & bottom apex of ellipse as obstacles
            recordNodeObstacle(rx, mainAxisY - ry, 8)
            recordNodeObstacle(rx, mainAxisY + ry, 8)

            const labelY = r === 0 ? mainAxisY - ry - 26 : r === 1 ? mainAxisY + ry + 28 : mainAxisY - ry - 26
            labelQueue.push({
              text: ringTitles[r],
              anchorX: rx,
              anchorY: labelY,
              fgColor: r === 0 ? goldFg : primaryFg,
              fgRgb: r === 0 ? goldFgRgb : primaryFgRgb,
              accentColor: r === 0 ? '#FDE047' : '#38BDF8',
              haloRgb: currentBgRgb,
              fontSize: subLabelSize,
              align: 'center',
              alpha: env2,
              stage: 2,
              inDwell: inDwell && mapped.chapterIdx === 2,
            })
          }
          ctx.restore()

          // Protagonist Question verified in Stage 2
          labelQueue.push({
            text: `「${SCENARIO_QUESTION}」 → 查證午後降雨 80% 必帶傘`,
            anchorX: W * 0.56,
            anchorY: H * 0.11,
            fgColor: cyanFg,
            fgRgb: cyanFgRgb,
            accentColor: '#38BDF8',
            haloRgb: currentBgRgb,
            fontSize: protagonistSize * 0.9,
            align: 'center',
            alpha: env2,
            stage: 2,
            inDwell: inDwell && mapped.chapterIdx === 2,
          })
        }

        // ── STAGE 3: FULL-SCREEN RED ERUPTION & 0.8x MAIN-SIZE FAKE CLAIMS ───
        if (env3 > 0.18 || wStage3 > 0.15) {
          // Background chaotic red lightning web filling the screen during eruption
          if (wStage3 > 0.15 && unshatteredCount > 0) {
            ctx.save()
            ctx.globalAlpha = clamp(wStage3 * 0.45, 0, 0.5)
            ctx.strokeStyle = '#FF2947'
            ctx.lineWidth = 1.4
            for (let w = 0; w < 8; w++) {
              const wy = H * (0.14 + (w / 7) * 0.56)
              drawSpline(
                ctx,
                leftAnchorX,
                mainAxisY,
                rightAnchorX,
                wy,
                (w % 2 === 0 ? 1 : -1) * 45,
                38 * wStage3,
                time * 1.9,
                w + 300,
                undefined,
                undefined,
                0,
                false
              )
            }
            ctx.restore()
          }

          FAKE_CLAIMS.forEach((fake, idx) => {
            const rootX = lerp(leftAnchorX, rightAnchorX, fake.branchT)
            const rootY = mainAxisY
            const tx = W * (isCompact ? (idx === 0 ? 0.28 : idx === 1 ? 0.68 : 0.52) : fake.targetX)
            const ty = H * (isCompact ? (idx === 0 ? 0.13 : idx === 1 ? 0.23 : 0.55) : fake.targetY)
            const isShattered = st.shatteredFakes[idx]

            if (!isShattered) {
              ctx.save()
              ctx.globalAlpha = clamp(wStage3, 0, 1)
              drawPlasmaCord(
                ctx,
                rootX,
                rootY,
                tx,
                ty,
                0,
                'rgba(255, 41, 71, 0.36)',
                '#FF2947',
                '#FDE047',
                1.18,
                28 * wStage3,
                time * 1.55,
                idx * 23 + 100,
                undefined,
                undefined,
                0,
                true
              )

              const pulseR = Math.max(6, (isCompact ? 13 : 17) + Math.sin(time * 7 + idx) * 2.5)
              ctx.beginPath()
              safeArc(ctx, tx, ty, pulseR)
              ctx.fillStyle = '#FF2947'
              ctx.fill()
              ctx.lineWidth = 2.5
              ctx.strokeStyle = '#FFFFFF'
              ctx.stroke()
              ctx.restore()
              recordNodeObstacle(tx, ty, pulseR + 6)

              if (env3 > 0.18) {
                const labelY = idx < 2 ? ty - 34 : ty + 36
                labelQueue.push({
                  text: fake.text,
                  anchorX: tx,
                  anchorY: labelY,
                  fgColor: redAlertFg,
                  fgRgb: redAlertFgRgb,
                  accentColor: '#FF2947',
                  haloRgb: currentBgRgb,
                  fontSize: fakeClaimSize,
                  align: 'center',
                  alpha: env3,
                  stage: 3,
                  inDwell: inDwell && mapped.chapterIdx === 3,
                })
              }
            } else {
              ctx.save()
              ctx.globalAlpha = clamp(wStage3, 0, 1)
              ctx.setLineDash([4, 8])
              ctx.strokeStyle = 'rgba(125, 211, 252, 0.38)'
              ctx.lineWidth = 1.6
              ctx.beginPath()
              ctx.moveTo(rootX, rootY)
              ctx.lineTo(tx, ty)
              ctx.stroke()
              ctx.restore()
              recordNodeObstacle(tx, ty, 12)

              if (env3 > 0.18) {
                const labelY = idx < 2 ? ty - 32 : ty + 34
                labelQueue.push({
                  text: `已擊碎：${fake.text}`,
                  anchorX: tx,
                  anchorY: labelY,
                  fgColor: cyanFg,
                  fgRgb: cyanFgRgb,
                  accentColor: '#38BDF8',
                  haloRgb: currentBgRgb,
                  fontSize: subLabelSize,
                  align: 'center',
                  alpha: env3,
                  stage: 3,
                  inDwell: inDwell && mapped.chapterIdx === 3,
                })
              }
            }
          })

          if (env3 > 0.18) {
            const allPurged = st.shatteredFakes.every(Boolean)
            labelQueue.push({
              text: allPurged
                ? `「${SCENARIO_QUESTION}」 → 假話已擊碎，還原午後降雨 80%`
                : '失去資料後，查證結論被改寫成：「降雨率 73.4% 且 14:07 停雨」',
              anchorX: W * 0.46,
              anchorY: H * 0.66,
              fgColor: allPurged ? cyanFg : goldFg,
              fgRgb: allPurged ? cyanFgRgb : goldFgRgb,
              accentColor: allPurged ? '#38BDF8' : '#FF2947',
              haloRgb: currentBgRgb,
              fontSize: protagonistSize * 0.85,
              align: 'center',
              alpha: env3,
              stage: 3,
              inDwell: inDwell && mapped.chapterIdx === 3,
            })
          }
        }

        // ── STAGE 4: CLOSED RING WITH TWO PROTAGONIST SUGGESTIONS ─────────────
        if (env4 > 0.18) {
          const midX = (leftAnchorX + rightAnchorX) * 0.5
          const topChoiceY = mainAxisY - H * 0.21 * env4
          const botChoiceY = mainAxisY + H * 0.21 * env4

          const nodes = [
            {
              key: 'umbrella' as const,
              x: midX,
              y: topChoiceY,
              label: '帶長傘：不怕午後淋濕',
              col: '#FDE047',
              rgb: goldFgRgb,
            },
            {
              key: 'handsfree' as const,
              x: midX,
              y: botChoiceY,
              label: '不帶傘：雙手輕鬆躲騎樓',
              col: '#7DD3FC',
              rgb: cyanFgRgb,
            },
          ]

          for (const nd of nodes) {
            const isChosen = st.chosenDecision === nd.key
            const r = isChosen ? 16 : 12
            ctx.save()
            ctx.globalAlpha = env4
            ctx.beginPath()
            safeArc(ctx, nd.x, nd.y, r)
            ctx.fillStyle = isChosen ? nd.col : '#1E293B'
            ctx.fill()
            ctx.lineWidth = 2.5
            ctx.strokeStyle = nd.col
            ctx.stroke()
            ctx.restore()
            recordNodeObstacle(nd.x, nd.y, r + 6)

            const labelY = nd.key === 'umbrella' ? nd.y - 36 : nd.y + 38
            labelQueue.push({
              text: `${isChosen ? '● ' : '○ '}${nd.label}`,
              anchorX: nd.x,
              anchorY: labelY,
              fgColor: nd.col,
              fgRgb: nd.rgb,
              accentColor: nd.col,
              haloRgb: currentBgRgb,
              fontSize: protagonistSize * 0.88,
              align: 'center',
              alpha: env4,
              stage: 4,
              inDwell: inDwell && mapped.chapterIdx === 4,
            })
          }
        }

        // ── 3. PLACE & DRAW ALL QUEUED LABELS WITH COLLISION AVOIDANCE ────────
        flushQueuedLabels(ctx)

        // ── 4. SHATTERED SHARDS, FALLING SPLIT TEXT HALVES & SHOCKWAVES ───────
        ctx.save()
        shardsRef.current = shardsRef.current.filter((sh) => {
          const age = (now - sh.born) / 950
          return age >= 0 && age < 1
        })
        for (const sh of shardsRef.current) {
          const age = clamp((now - sh.born) / 950, 0, 1)
          sh.x += sh.vx * dt
          sh.y += sh.vy * dt
          sh.vy += 260 * dt
          sh.ang += sh.vang * dt

          ctx.save()
          ctx.translate(sh.x, sh.y)
          ctx.rotate(sh.ang)
          ctx.globalAlpha = clamp(1 - age, 0, 1)
          ctx.fillStyle = sh.color
          ctx.beginPath()
          ctx.moveTo(0, -sh.size)
          ctx.lineTo(sh.size * 0.85, sh.size)
          ctx.lineTo(-sh.size * 0.85, sh.size * 0.6)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        }

        brokenHalvesRef.current = brokenHalvesRef.current.filter((bh) => {
          const age = (now - bh.born) / 1450
          return age >= 0 && age < 1
        })
        for (const bh of brokenHalvesRef.current) {
          const age = clamp((now - bh.born) / 1450, 0, 1)
          bh.x += bh.vx * dt
          bh.y += bh.vy * dt
          bh.vy += 420 * dt
          bh.ang += bh.vang * dt

          ctx.save()
          ctx.translate(bh.x, bh.y)
          ctx.rotate(bh.ang)
          ctx.globalAlpha = clamp(1 - age * 0.85, 0, 1)
          ctx.font = `800 ${bh.fontSize}px "Noto Serif TC", serif`
          ctx.fillStyle = '#FF4D6D'
          ctx.textAlign = 'center'
          ctx.fillText(bh.text, 0, 0)
          ctx.restore()
        }

        shockwavesRef.current = shockwavesRef.current.filter((sw) => {
          const age = (now - sw.born) / 800
          return age >= 0 && age < 1
        })
        for (const sw of shockwavesRef.current) {
          const age = clamp((now - sw.born) / 800, 0, 1)
          const radius = Math.max(0.1, age * Math.max(W, H) * 0.28)
          ctx.beginPath()
          safeArc(ctx, sw.x, sw.y, radius)
          ctx.strokeStyle = sw.color
          ctx.globalAlpha = clamp((1 - age) * 0.75, 0, 1)
          ctx.lineWidth = Math.max(0.5, 2.8 * (1 - age))
          ctx.stroke()
        }
        ctx.restore()

        // ── 5. DYNAMIC LUMINANCE-DRIVEN DOM TEXT COLOR ──────────────────────
        const rootStyle = document.documentElement.style
        if (isLight) {
          rootStyle.setProperty('--text-ivory', '#090C12')
          rootStyle.setProperty('--text-gold', '#7F1D1D')
        } else {
          rootStyle.setProperty('--text-ivory', '#FAF8F5')
          rootStyle.setProperty('--text-gold', '#FDE047')
        }

        if (flashAlphaRef.current > 0.01) {
          ctx.save()
          ctx.fillStyle = `rgba(186, 230, 253, ${clamp(flashAlphaRef.current, 0, 0.72).toFixed(3)})`
          ctx.fillRect(0, 0, W, H)
          ctx.restore()
        }

        // Expose window.__argonLabels and window.__argonLineSamples for Playwright verification
        const win = window as unknown as {
          __argonLabels?: ArgonLabelEntry[]
          __argonLineSamples?: LineSample[]
        }
        win.__argonLabels = argonLabels
        win.__argonLineSamples = lineSamples
      } catch {
        // Guard against single-frame exceptions
      } finally {
        ctx.restore()
      }
    }

    rafId = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const triggerShatterClimax = (idx: 0 | 1 | 2, clientX: number, clientY: number) => {
    const now = performance.now()
    slowMoUntilRef.current = now + 320
    flashAlphaRef.current = 0.72

    const isCompact = window.innerWidth < 820
    const fSize = isCompact ? 16 : 24
    const fakeText = FAKE_CLAIMS[idx].text
    const mid = Math.floor(fakeText.length / 2)
    brokenHalvesRef.current.push(
      {
        text: fakeText.slice(0, mid),
        x: clientX - 38,
        y: clientY,
        vx: -85,
        vy: -65,
        ang: -0.1,
        vang: -1.8,
        born: now,
        fontSize: fSize,
      },
      {
        text: fakeText.slice(mid),
        x: clientX + 38,
        y: clientY,
        vx: 85,
        vy: -55,
        ang: 0.1,
        vang: 2.0,
        born: now,
        fontSize: fSize,
      }
    )

    for (let i = 0; i < 22; i++) {
      const ang = (i / 22) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
      const spd = 120 + Math.random() * 220
      shardsRef.current.push({
        x: clientX,
        y: clientY,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 55,
        ang: Math.random() * Math.PI,
        vang: (Math.random() - 0.5) * 9,
        size: 4.5 + Math.random() * 6,
        born: now,
        color: i % 2 === 0 ? '#FF2947' : '#38BDF8',
      })
    }
    shockwavesRef.current.push({ x: clientX, y: clientY, born: now, color: '#38BDF8' })
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const W = Math.max(1, window.innerWidth)
    const H = Math.max(1, window.innerHeight)
    const nx = e.clientX / W
    const ny = e.clientY / H
    pointerRef.current.x = nx
    pointerRef.current.y = ny
    pointerRef.current.active = true

    const s = smoothSRef.current
    if (s >= 1.5 && s < 2.5) {
      const ring = nx < 0.38 ? 1 : nx < 0.58 ? 2 : 3
      if (ring !== stateRef.current.pinchRing) {
        onSetPinchRing(ring)
        argonAudio.playSpark(nx, 2)
      }
    }
    if (s >= 2.5 && s < 3.5) {
      FAKE_CLAIMS.forEach((fake, idx) => {
        if (!stateRef.current.shatteredFakes[idx]) {
          if (Math.hypot(nx - fake.targetX, ny - fake.targetY) < 0.08) {
            onShatterFake(idx as 0 | 1 | 2)
            argonAudio.playGroundChime()
            triggerShatterClimax(idx as 0 | 1 | 2, e.clientX, e.clientY)
          }
        }
      })
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const W = Math.max(1, window.innerWidth)
    const H = Math.max(1, window.innerHeight)
    const nx = e.clientX / W
    const ny = e.clientY / H
    pointerRef.current.x = nx
    pointerRef.current.y = ny
    pointerRef.current.active = true
    pointerRef.current.isDown = true
    pulseRef.current = 1.0

    const s = smoothSRef.current
    const stageIdx = Math.min(4, Math.max(0, Math.round(s)))
    argonAudio.playSpark(nx, stageIdx)
    onRecordTrace({ x: nx, y: ny, stage: stageIdx })

    shockwavesRef.current.push({
      x: e.clientX,
      y: e.clientY,
      born: performance.now(),
      color: s < 1.5 ? '#1E2FD9' : '#38BDF8',
    })

    if (s >= 0.55 && s < 1.55 && nx < 0.46) {
      const idx = ny < 0.32 ? 0 : ny < 0.55 ? 1 : 2
      onToggleModality(idx as 0 | 1 | 2)
    } else if (s >= 1.55 && s < 2.55) {
      const ring = nx < 0.38 ? 1 : nx < 0.58 ? 2 : 3
      onSetPinchRing(ring)
    } else if (s >= 2.55 && s < 3.55) {
      let hit = -1
      let bestDist = 0.26
      FAKE_CLAIMS.forEach((fake, idx) => {
        if (!stateRef.current.shatteredFakes[idx]) {
          const d = Math.hypot(nx - fake.targetX, ny - fake.targetY)
          if (d < bestDist) {
            bestDist = d
            hit = idx
          }
        }
      })
      if (hit === -1) {
        hit = stateRef.current.shatteredFakes.findIndex((v) => !v)
      }
      if (hit !== -1) {
        const fake = FAKE_CLAIMS[hit]
        onShatterFake(hit as 0 | 1 | 2)
        argonAudio.playGroundChime()
        triggerShatterClimax(hit as 0 | 1 | 2, fake.targetX * W, fake.targetY * H)
      }
    } else if (s >= 3.45) {
      const choice = ny < 0.44 ? 'umbrella' : 'handsfree'
      onChooseDecision(choice)
      argonAudio.playGroundChime()
    }
  }

  const handlePointerUp = () => {
    pointerRef.current.isDown = false
  }

  return (
    <canvas
      ref={canvasRef}
      className="argon-stage-canvas"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        pointerRef.current.active = false
        pointerRef.current.isDown = false
      }}
      aria-hidden="true"
    />
  )
}
