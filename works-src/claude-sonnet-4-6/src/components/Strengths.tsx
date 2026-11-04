import { useRef, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import styles from './Strengths.module.css'

const SKILLS = [
  { label: '程式碼\n（SWE-bench）', value: 0.796, note: '79.6%，官方系統卡' },
  { label: '電腦操作\n（OSWorld）', value: 0.725, note: '72.5%，官方系統卡' },
  { label: '科學推理\n（GPQA Diamond）', value: 0.899, note: '89.9%，官方系統卡' },
  { label: '長文脈絡\n（MRCR 256K）', value: 0.906, note: '90.6%，官方系統卡' },
  { label: '代理任務\n（GDPval-AA）', value: 0.95, note: 'ELO 1633，第一名，Artificial Analysis' },
  { label: '多模態\n（MMMU-Pro）', value: 0.745, note: '74.5%，官方系統卡' },
]

function RadarChart({ visible }: { visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight)
    canvas.width = size
    canvas.height = size
    const cx = size / 2
    const cy = size / 2
    const R = size * 0.38

    const n = SKILLS.length
    const angles = SKILLS.map((_, i) => (i / n) * Math.PI * 2 - Math.PI / 2)

    function getPoint(r: number, angle: number) {
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function draw(progress: number) {
      if (!ctx || !canvas) return
      const s = size
      ctx.clearRect(0, 0, s, s)

      // Grid
      for (let ring = 1; ring <= 4; ring++) {
        const r = R * ring / 4
        ctx.beginPath()
        angles.forEach((a, i) => {
          const p = getPoint(r, a)
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.closePath()
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.05 + ring * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Spokes
      angles.forEach(a => {
        const p = getPoint(R, a)
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Data fill
      const fillProgress = prefersReduced ? 1 : progress
      ctx.beginPath()
      SKILLS.forEach((skill, i) => {
        const r = R * skill.value * fillProgress
        const p = getPoint(r, angles[i])
        if (i === 0) ctx.moveTo(p.x, p.y)
        else ctx.lineTo(p.x, p.y)
      })
      ctx.closePath()
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)')
      grad.addColorStop(1, 'rgba(192, 132, 252, 0.15)')
      ctx.fillStyle = grad
      ctx.fill()
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.7)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Dots
      SKILLS.forEach((skill, i) => {
        const r = R * skill.value * fillProgress
        const p = getPoint(r, angles[i])
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#c084fc'
        ctx.fill()
      })
    }

    if (prefersReduced) {
      draw(1)
      return
    }

    if (!visible) return

    function animate() {
      progressRef.current = Math.min(1, progressRef.current + 0.025)
      draw(progressRef.current)
      if (progressRef.current < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible])

  return (
    <canvas
      ref={canvasRef}
      className={styles.radar}
      width={400}
      height={400}
      aria-label="能力雷達圖"
    />
  )
}

export default function Strengths() {
  const { ref, inView } = useInView(0.1)

  return (
    <section className={styles.section}>
      <div className={styles.bgRight} aria-hidden="true" />

      <div ref={ref} className={`${styles.container} ${inView ? styles.visible : ''}`}>
        <div className={styles.left}>
          <div className={styles.eyebrow}>Chapter 03 · 強項</div>
          <h2 className={styles.heading}>在代理任務上，<br />我比 Opus 還強。</h2>
          <div className={styles.skillList}>
            {SKILLS.map((s, i) => (
              <div key={i} className={styles.skillItem}>
                <div className={styles.skillLabel}>{s.label.replace('\n', ' ')}</div>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillFill}
                    style={{
                      width: inView ? `${s.value * 100}%` : '0%',
                      transitionDelay: `${i * 0.08}s`,
                    }}
                  />
                </div>
                <div className={styles.skillVal}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <RadarChart visible={inView} />
          <div className={styles.radarLabels} aria-hidden="true">
            <span style={{ top: '5%', left: '50%', transform: 'translate(-50%, 0)' }}>程式碼</span>
            <span style={{ top: '25%', right: '5%' }}>電腦操作</span>
            <span style={{ bottom: '20%', right: '8%' }}>科學推理</span>
            <span style={{ bottom: '5%', left: '50%', transform: 'translate(-50%, 0)' }}>長文脈絡</span>
            <span style={{ bottom: '20%', left: '8%' }}>代理任務</span>
            <span style={{ top: '25%', left: '5%' }}>多模態</span>
          </div>
          {/* #1 achievement badge */}
          <div className={styles.achieveBadge} aria-label="GDPval-AA 全模型第一名">
            <span className={styles.achieveNum}>#1</span>
            <span className={styles.achieveLabel}>GDPval-AA<br />全模型第一</span>
          </div>
        </div>
      </div>
    </section>
  )
}
