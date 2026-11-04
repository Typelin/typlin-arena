import { useRef, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import styles from './ContextViz.module.css'

function DotSea({ canvasRef, inView }: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  inView: boolean
}) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const PITCH = 7
    const DOT_R = 2.2
    const cols = Math.floor(w / PITCH)
    const rows = Math.floor(h / PITCH)
    const total = cols * rows
    // Sonnet 4.5 = 20% (200K / 1M)
    const s45Count = Math.floor(total * 0.20)

    const state = new Uint8Array(total)   // 1 = amber, 2 = blue
    const bright = new Float32Array(total)

    for (let i = 0; i < s45Count; i++) state[i] = 1
    for (let i = s45Count; i < total; i++) state[i] = 2

    if (prefersReduced) {
      // Static render
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col
          const cx = col * PITCH + PITCH / 2
          const cy = row * PITCH + PITCH / 2
          ctx.beginPath()
          ctx.arc(cx, cy, DOT_R, 0, Math.PI * 2)
          ctx.fillStyle = state[idx] === 1
            ? 'rgba(251,146,60,0.75)' : 'rgba(129,140,248,0.5)'
          ctx.fill()
        }
      }
      return
    }

    if (!inView) return

    let raf: number
    let startTime = 0

    function draw(ts: number) {
      if (!startTime) startTime = ts
      const elapsed = (ts - startTime) / 1000

      ctx!.fillStyle = 'rgba(4,5,13,0.55)'
      ctx!.fillRect(0, 0, w, h)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col
          const s = state[idx]
          const cx = col * PITCH + PITCH / 2
          const cy = row * PITCH + PITCH / 2

          let target = 0
          if (s === 1) {
            // Amber reveal: 0→1.8s
            const revealAt = (idx / s45Count)
            if (revealAt < elapsed / 1.8) target = 1
          } else {
            // Blue reveal: starts 2.3s, takes 4s
            if (elapsed > 2.3) {
              const relIdx = idx - s45Count
              const revealAt = relIdx / (total - s45Count)
              if (revealAt < (elapsed - 2.3) / 4.0) target = 1
            }
          }

          bright[idx] += (target - bright[idx]) * 0.14

          const b = bright[idx]

          if (b < 0.015) {
            ctx!.beginPath()
            ctx!.arc(cx, cy, DOT_R * 0.55, 0, Math.PI * 2)
            ctx!.fillStyle = 'rgba(255,255,255,0.025)'
            ctx!.fill()
          } else {
            ctx!.beginPath()
            ctx!.arc(cx, cy, DOT_R * (0.6 + b * 0.5), 0, Math.PI * 2)
            if (s === 1) {
              ctx!.fillStyle = `rgba(251,146,60,${b * 0.9})`
            } else {
              const hue = 230 + (idx % 17) * 2
              ctx!.fillStyle = `hsla(${hue},80%,65%,${b * 0.75})`
            }
            ctx!.fill()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    const onResize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight
      canvas.width = w; canvas.height = h
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [canvasRef, inView])

  return null
}

export default function ContextViz() {
  const { ref, inView } = useInView(0.1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <section className={styles.section}>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <DotSea canvasRef={canvasRef} inView={inView} />

      <div ref={ref} className={`${styles.inner} ${inView ? styles.visible : ''}`}>
        <div className={styles.eyebrow}>Chapter 02 · 記憶空間</div>

        <div className={styles.megaWrap} aria-label="一百萬個 token 上下文視窗">
          <span className={styles.mega}>1,000,000</span>
          <span className={styles.megaUnit}>tokens</span>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'rgba(251,146,60,0.9)' }} />
            <div>
              <div className={styles.legendLabel}>Claude Sonnet 4.5（前代）</div>
              <div className={styles.legendVal}>200,000 tokens — 畫面左上角那一小塊橘點</div>
            </div>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: 'rgba(129,140,248,0.9)' }} />
            <div>
              <div className={styles.legendLabel}>Claude Sonnet 4.6（本模型）</div>
              <div className={styles.legendVal}>1,000,000 tokens — 整個畫面的全部光點</div>
            </div>
          </div>
        </div>

        <p className={styles.note}>
          每個光點代表相同數量的 tokens。<br />
          <span>來源：Anthropic 官方文件，查詢日期 2026-11-04</span>
        </p>
      </div>
    </section>
  )
}
