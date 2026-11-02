import { useCanvas, useFontsReady, useScrollProgress } from '../hooks'
import { paintBigNumber } from '../lib/paint'
import { lightPlate, renderPrint } from '../lib/print'
import { SCALE_FACTS } from '../content'

const CREAM = '#f0ead9'
const DARK = '#0a0a0a'
const ORANGE = '#e2571f'
const FAMILY = '"Bodoni Moda", "Ink Serif", serif'

const TOTAL_DOTS = 552
const ACTIVE_DOTS = 8

/**
 * 01 尺度：552B 撐滿畫面；下面把同一個比例攤成 552 個點，
 * 其中只有 8 個會亮起來——巨大與微小放在同一頁。
 */
export default function Scale() {
  const { ref, progress } = useScrollProgress<HTMLElement>(true)
  const fontsReady = useFontsReady()
  const cell = 7.4 - progress * 2.6

  const glyphRef = useCanvas(
    (canvas) => {
      renderPrint(canvas, {
        cell,
        paper: DARK,
        dprCap: 1.35,
        ragged: 0.3,
        inks: [
          { color: CREAM, angle: 15, coverage: lightPlate(0.02, 1), mode: 'source-over' },
          {
            color: ORANGE,
            angle: 75,
            coverage: lightPlate(0.94, 1),
            mode: 'lighter',
            offset: [2.6, -2],
          },
        ],
        paint: (ctx, w, h) => paintBigNumber(ctx, w, h, '552', 'B', FAMILY, '#ffffff', '#000000', 0.46),
      })
    },
    [Math.round(cell * 10), fontsReady],
  )

  const dotsRef = useCanvas(
    (canvas) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = Math.max(8, Math.round(rect.width * dpr))
      const H = Math.max(8, Math.round(rect.height * dpr))
      if (canvas.width !== W) canvas.width = W
      if (canvas.height !== H) canvas.height = H
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const cols = 69
      const rows = Math.ceil(TOTAL_DOTS / cols)
      const gapX = rect.width / cols
      const gapY = Math.min(gapX, rect.height / rows)
      const r = Math.min(gapX, gapY) * 0.3
      const ox = (rect.width - gapX * (cols - 1)) / 2
      const oy = (rect.height - gapY * (rows - 1)) / 2

      // 8 個亮點散在整個點陣裡，要靠近才找得到
      const lit = new Set<number>()
      let s = 17
      const rnd = () => {
        s = (s * 16807) % 2147483647
        return s / 2147483647
      }
      while (lit.size < ACTIVE_DOTS) {
        lit.add(Math.floor(rnd() * TOTAL_DOTS))
      }

      for (let i = 0; i < TOTAL_DOTS; i++) {
        const cx = ox + (i % cols) * gapX
        const cy = oy + Math.floor(i / cols) * gapY
        const active = lit.has(i)
        ctx.fillStyle = active ? ORANGE : 'rgba(236,231,219,0.22)'
        ctx.beginPath()
        ctx.arc(cx, cy, active ? r * 1.85 : r, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    [],
  )

  return (
    <section className="chapter scale" id="ch-scale" ref={ref}>
      <div className="scale-head pad">
        <span className="ch-no mono-sm">01</span>
        <span className="ch-tag mono-sm">尺度 / SCALE</span>
      </div>

      <div className="scale-copy pad">
        <div className="scale-left">
          <h2 className="ch-title">
            <span className="ln">我很大，</span>
            <span className="ln">但一次只用一點點。</span>
          </h2>
          <p className="ch-first">552B 個參數，動手時只啟動 8B。</p>
        </div>
        <div className="sd-right">
          <p className="ch-body prose">
            讀入 8B、寫出 16B；另有 196B 記憶按需取用。
          </p>
        </div>
      </div>

      <div className="scale-stage">
        <canvas ref={glyphRef} className="scale-glyph" aria-hidden="true" />
        <p className="scale-dim mono-sm" aria-hidden="true">
          總參數 552B · 單一 highlight = 8B
        </p>
      </div>

      <div className="scale-dots pad">
        <div className="sd-left">
          <p className="sd-label mono-sm">552 點 · 1 點 = 1B</p>
          <canvas ref={dotsRef} className="sd-canvas" aria-hidden="true" />
          <p className="sd-note mono-sm">亮起的 8 點，就是真正參與計算的部分</p>
        </div>

        <dl className="scale-facts">
          {SCALE_FACTS.map((s) => (
            <div key={s.label}>
              <dt className="mono-sm">{s.label}</dt>
              <dd>
                <b className="num-lg">{s.big}</b>
                <span>{s.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
