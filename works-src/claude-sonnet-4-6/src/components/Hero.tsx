import { useRef, useEffect, useState } from 'react'
import { useNeuralCanvas } from '../hooks/useNeuralCanvas'
import styles from './Hero.module.css'

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  hue: number
  size: number
  alpha: number
  delay: number
}

function useParticleText(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = canvas.getContext('2d')!
    if (!canvas.getContext) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    let particles: Particle[] = []
    let mouseX = -9999
    let mouseY = -9999
    let raf: number
    let startTime = 0
    let initialized = false

    function buildParticles() {
      particles = []

      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const octx = off.getContext('2d')!

      // Auto-size SONNET to fill ~88% viewport width
      const testSize = 300
      octx.font = `700 ${testSize}px 'Space Grotesk', sans-serif`
      const testW = octx.measureText('SONNET').width
      const fs1 = Math.min(testSize * (w * 0.88) / testW, h * 0.42)

      const fs2 = fs1 * 0.52
      const totalH = fs1 + fs2 * 1.15
      const baseY = h * 0.44 - totalH / 2

      octx.clearRect(0, 0, w, h)
      octx.fillStyle = 'white'
      octx.textAlign = 'center'
      octx.textBaseline = 'top'
      octx.font = `700 ${fs1}px 'Space Grotesk', sans-serif`
      octx.fillText('SONNET', w / 2, baseY)
      octx.font = `700 ${fs2}px 'Space Grotesk', sans-serif`
      octx.fillText('4.6', w / 2, baseY + fs1 * 1.08)

      const imgData = octx.getImageData(0, 0, w, h).data
      const gap = w > 900 ? 4 : 5
      let idx = 0

      for (let py = 0; py < h; py += gap) {
        for (let px = 0; px < w; px += gap) {
          const i = (py * w + px) * 4
          if (imgData[i + 3] > 100) {
            const hue = 220 + (px / w) * 110  // deep blue → violet → cyan
            const scatter = Math.min(w, h) * 0.6
            particles.push({
              x: w / 2 + (Math.random() - 0.5) * scatter,
              y: h / 2 + (Math.random() - 0.5) * scatter,
              targetX: px,
              targetY: py,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              hue,
              size: 1.1 + Math.random() * 1.4,
              alpha: 0.55 + Math.random() * 0.45,
              delay: idx * 0.00015,
            })
            idx++
          }
        }
      }
    }

    function draw(ts: number) {
      if (!initialized) initialized = true
      if (!startTime) startTime = ts
      const elapsed = (ts - startTime) / 1000

      ctx.fillStyle = 'rgba(4,5,13,0.22)'
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        const t = Math.max(0, elapsed - p.delay)
        const springK = t < 1.2 ? 0.09 + t * 0.04 : 0.05
        const damping = t < 1.2 ? 0.78 : 0.86

        const dx = p.targetX - p.x
        const dy = p.targetY - p.y

        // Spring
        p.vx += dx * springK
        p.vy += dy * springK

        // Mouse repulsion
        const mx = mouseX - p.x
        const my = mouseY - p.y
        const md = Math.sqrt(mx * mx + my * my)
        if (md < 90 && md > 0) {
          const f = ((90 - md) / 90) * 9
          p.vx -= (mx / md) * f
          p.vy -= (my / md) * f
        }

        p.vx *= damping
        p.vy *= damping
        p.x += p.vx
        p.y += p.vy

        const distToTarget = Math.sqrt(dx * dx + dy * dy)
        const brightness = Math.max(0.25, 1 - distToTarget / 160)
        const lum = 55 + brightness * 25

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * Math.min(1, t * 2), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${lum}%, ${p.alpha * Math.min(1, t * 1.5)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    async function init() {
      await document.fonts.ready
      buildParticles()
      raf = requestAnimationFrame(draw)
    }
    init()

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouseX = e.clientX - r.left
      mouseY = e.clientY - r.top
    }
    const onLeave = () => { mouseX = -9999; mouseY = -9999 }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    const onResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
      startTime = 0
      buildParticles()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [canvasRef])
}

export default function Hero() {
  const particleRef = useRef<HTMLCanvasElement>(null)
  const ambientRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)

  useParticleText(particleRef)
  useNeuralCanvas(ambientRef, { density: 35, connectionDistance: 120, speed: 0.18, accentHue: 260 })

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className={styles.hero}>
      {/* Ambient neural particles — background layer */}
      <canvas ref={ambientRef} className={styles.ambientCanvas} />
      {/* Particle text — foreground */}
      <canvas ref={particleRef} className={styles.particleCanvas} />

      {/* Reduced-motion fallback */}
      <div className={styles.reducedOverlay} aria-hidden="true">
        <span className={styles.reducedSonnet}>SONNET</span>
        <span className={styles.reducedVersion}>4.6</span>
      </div>

      <div className={`${styles.ui} ${loaded ? styles.loaded : ''}`}>
        {/* Top badge */}
        <header className={styles.topBar}>
          <span className={styles.badge}>Claude · Sonnet 4.6</span>
          <span className={styles.byLine}>by Anthropic · 2026.02.17</span>
        </header>

        {/* Semantic h1 for accessibility, visually hidden in favour of canvas */}
        <h1 className={styles.srOnly}>Claude Sonnet 4.6 by Anthropic</h1>

        {/* Bottom area */}
        <div className={styles.bottom}>
          <p className={styles.tagline}>
            在代理任務上打敗 Opus。在推理上接近頂峰。<br />
            <em>這就是中階應有的樣子。</em>
          </p>

          <div className={styles.specRow}>
            <div className={styles.spec}>
              <span className={styles.specNum}>1M</span>
              <span className={styles.specLabel}>Context Tokens</span>
            </div>
            <div className={styles.specDivider} />
            <div className={styles.spec}>
              <span className={styles.specNum}>79.6%</span>
              <span className={styles.specLabel}>SWE-bench</span>
            </div>
            <div className={styles.specDivider} />
            <div className={styles.spec}>
              <span className={styles.specNum}>89.9%</span>
              <span className={styles.specLabel}>GPQA Diamond</span>
            </div>
            <div className={styles.specDivider} />
            <div className={styles.spec}>
              <span className={styles.specNum}>#1</span>
              <span className={styles.specLabel}>GDPval-AA</span>
            </div>
          </div>

          <div className={styles.scrollHint} aria-hidden="true">
            <span className={styles.scrollLine} />
            scroll
            <span className={styles.scrollLine} />
          </div>
        </div>
      </div>
    </section>
  )
}
