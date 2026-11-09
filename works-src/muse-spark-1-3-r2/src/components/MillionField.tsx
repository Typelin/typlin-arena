import { useCallback, useEffect, useRef, useState } from 'react'
import { MODEL } from '../data'
import { usePrefersReducedMotion, useSectionProgress } from '../hooks'
import './MillionField.css'

const TOTAL = MODEL.contextTokens
const NEEDLE_AT = 0.62

type Engine = {
  ctx: CanvasRenderingContext2D
  img: ImageData
  order: Uint32Array
  shade: Uint8Array
  lit: number
  needleSlot: number
  needlePos: number
  w: number
  h: number
}

/**
 * The climax: one pixel per token. Scrolling fills a dark wall with
 * 1,048,576 points of light — the whole context window, made visible.
 * One vermilion point is the sentence that has to be found again.
 */
export default function MillionField() {
  const reduced = usePrefersReducedMotion()
  const { ref, progress } = useSectionProgress<HTMLElement>(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<Engine | null>(null)
  const [needleFound, setNeedleFound] = useState(false)

  const shown = reduced ? 1 : progress
  const shownRef = useRef(shown)
  shownRef.current = shown

  const paint = useCallback((eng: Engine, value: number) => {
    const { ctx, img, order, shade, w } = eng
    const data = img.data
    const target = Math.floor(value * order.length)
    if (target === eng.lit) return
    if (target < eng.lit) {
      // scrolled back up: repaint the dark base, then relight from zero
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 19
        data[i + 1] = 16
        data[i + 2] = 9
      }
      eng.lit = 0
    }
    for (let i = eng.lit; i < target; i++) {
      const idx = order[i]
      const v = shade[idx]
      data[idx * 4] = v
      data[idx * 4 + 1] = Math.floor(v * 0.92)
      data[idx * 4 + 2] = Math.floor(v * 0.76)
    }
    eng.lit = target
    if (target > eng.needleSlot) {
      const nx = eng.needlePos % w
      const ny = Math.floor(eng.needlePos / w)
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const x = nx + dx
          const y = ny + dy
          if (x < 0 || y < 0 || x >= w || y >= eng.h) continue
          const idx = y * w + x
          data[idx * 4] = 224
          data[idx * 4 + 1] = 62
          data[idx * 4 + 2] = 26
        }
      }
    }
    setNeedleFound(target > eng.needleSlot)
    ctx.putImageData(img, 0, 0)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const build = () => {
      // Cap the backing store near 2.6M px: always at least one pixel per
      // token on realistic screens, never heavy enough to jank the scroll.
      const cssArea = Math.max(1, canvas.clientWidth * canvas.clientHeight)
      const scale = Math.max(
        0.75,
        Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2_600_000 / cssArea)),
      )
      const w = Math.floor(canvas.clientWidth * scale)
      const h = Math.floor(canvas.clientHeight * scale)
      if (w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h
      const n = w * h
      const img = ctx.createImageData(w, h)
      const data = img.data
      for (let i = 0; i < n; i++) {
        data[i * 4] = 19
        data[i * 4 + 1] = 16
        data[i * 4 + 2] = 9
        data[i * 4 + 3] = 255
      }
      const order = new Uint32Array(n)
      for (let i = 0; i < n; i++) order[i] = i
      // Fisher-Yates with a fast LCG
      let s = 987654321
      const rand = () => {
        s = (s * 1103515245 + 12345) % 2147483648
        return s / 2147483648
      }
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        const tmp = order[i]
        order[i] = order[j]
        order[j] = tmp
      }
      const shade = new Uint8Array(n)
      for (let i = 0; i < n; i++) {
        // per-token randomness over a slow topographic wave, so the filled
        // wall has terrain and depth instead of flat television static
        const x = i % w
        const y = Math.floor(i / w)
        const wave = Math.sin(x * 0.011 + y * 0.004) * 27 + Math.sin(y * 0.017 + x * 0.002) * 20
        shade[i] = Math.max(136, Math.min(250, Math.floor(184 + wave + rand() * 58)))
      }
      // the needle: one chosen pixel, moved to the NEEDLE_AT slot of the order
      const nx = Math.floor(w * 0.64)
      const ny = Math.floor(h * 0.42)
      const needlePos = ny * w + nx
      const needleSlot = Math.floor(NEEDLE_AT * n)
      const currentSlot = order.indexOf(needlePos)
      order[currentSlot] = order[needleSlot]
      order[needleSlot] = needlePos
      const eng: Engine = { ctx, img, order, shade, lit: 0, needleSlot, needlePos, w, h }
      engineRef.current = eng
      // a rebuild (mount, resize) must restore the current fill immediately,
      // not wait for the next scroll tick
      ctx.putImageData(img, 0, 0)
      paint(eng, shownRef.current)
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [paint])

  useEffect(() => {
    const eng = engineRef.current
    if (eng) paint(eng, shown)
  }, [shown, paint])

  const tokens = Math.floor(shown * TOTAL)

  return (
    <section className="million" ref={ref} aria-label="一百萬個 token">
      <div className="million-stage">
        <canvas ref={canvasRef} className="million-canvas" aria-hidden="true" />
        <div
          className="million-glyph"
          aria-hidden="true"
          style={{ opacity: 0.12 + shown * 0.88 }}
        >
          字
        </div>
        <div
          className={`million-needle-ring${needleFound ? ' is-found' : ''}`}
          aria-hidden="true"
        />
        <div className="million-head">
          <p className="chapter-tag">Chapter 03 — Memory</p>
          <h2 className="million-title">一百萬的記性</h2>
          <p className="million-lede">
            一次對話，我能同時記住 {MODEL.contextLabel} 個 token。
            寫滿了，還找得回最前面那一句。
          </p>
        </div>
        <div className="million-foot">
          <p className="million-count">
            {tokens.toLocaleString('en-US')}
            <span className="million-count-total"> / {MODEL.contextLabel} TOKENS</span>
          </p>
          <p className={`million-needle${needleFound ? ' is-found' : ''}`}>
            紅色那一格，是寫到六成時埋下的一句話——我把它找回來了。
            <span className="million-needle-sub">
              長文檢索 MRCR（512K–1M）98.1 分，Meta 自測，數字出處在最後一章。
            </span>
          </p>
        </div>
        <div className="million-progress" aria-hidden="true">
          <div
            className="million-progress-fill"
            style={{ transform: `scaleX(${shown})` }}
          />
        </div>
      </div>
    </section>
  )
}
