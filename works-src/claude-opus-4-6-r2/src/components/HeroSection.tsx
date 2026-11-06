import { useEffect, useRef, useCallback } from 'react'

interface Props {
  scrollY: number
  reducedMotion: boolean
}

interface Mote {
  x: number; y: number; vx: number; vy: number
  r: number; hue: number; sat: number
  alpha: number; targetAlpha: number
  life: number; maxLife: number; layer: number
}

export default function HeroSection({ scrollY, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const motesRef = useRef<Mote[]>([])
  const frameRef = useRef(0)
  const mouseRef = useRef({ x: -1, y: -1, active: false })
  const tRef = useRef(0)

  const spawn = useCallback((w: number, h: number, fromMouse = false): Mote => {
    const cx = w / 2, cy = h * 0.42
    const big = Math.random() < 0.12

    let x: number, y: number
    if (fromMouse && mouseRef.current.active) {
      x = mouseRef.current.x + (Math.random() - 0.5) * 90
      y = mouseRef.current.y + (Math.random() - 0.5) * 90
    } else {
      const a = Math.random() * Math.PI * 2
      const d = Math.random() ** 0.6 * Math.min(w, h) * 0.42
      x = cx + Math.cos(a) * d
      y = cy + Math.sin(a) * d * 0.6
    }
    return {
      x, y,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.4 + 0.05),
      r: big ? 3.5 + Math.random() * 4 : 0.5 + Math.random() * 2,
      hue: 18 + Math.random() * 32,
      sat: 75 + Math.random() * 20,
      alpha: 0, targetAlpha: big ? 0.75 : 0.25 + Math.random() * 0.25,
      life: 0, maxLife: 180 + Math.random() * 280,
      layer: big ? 0 : Math.random() < 0.5 ? 1 : 2,
    }
  }, [])

  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return
    const ctx = cvs.getContext('2d'); if (!ctx) return
    let w = 0, h = 0

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      w = cvs.parentElement!.clientWidth
      h = cvs.parentElement!.clientHeight
      cvs.width = w * dpr; cvs.height = h * dpr
      cvs.style.width = `${w}px`; cvs.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize(); window.addEventListener('resize', resize)

    const N = reducedMotion ? 50 : 220
    motesRef.current = Array.from({ length: N }, () => {
      const m = spawn(w, h)
      m.life = Math.random() * m.maxLife
      m.alpha = m.targetAlpha * Math.random()
      return m
    })

    let spawnTimer = 0

    const draw = () => {
      tRef.current += 0.016
      const t = tRef.current
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h * 0.42
      const pulse = 1 + Math.sin(t * 0.35) * 0.05

      /* ── Volumetric amber orb ── */
      /* Core: white-hot center */
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.06 * pulse)
      g0.addColorStop(0, 'rgba(255,251,235,0.12)')
      g0.addColorStop(1, 'transparent')
      ctx.fillStyle = g0; ctx.fillRect(0, 0, w, h)

      /* Layer 1: bright amber */
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.15 * pulse)
      g1.addColorStop(0, 'rgba(253,224,71,0.14)')
      g1.addColorStop(0.7, 'rgba(251,191,36,0.06)')
      g1.addColorStop(1, 'transparent')
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h)

      /* Layer 2: warm mid */
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.28)
      g2.addColorStop(0, 'rgba(217,119,6,0.07)')
      g2.addColorStop(0.6, 'rgba(180,83,9,0.03)')
      g2.addColorStop(1, 'transparent')
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h)

      /* Layer 3: deep halo */
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5)
      g3.addColorStop(0, 'rgba(120,53,15,0.04)')
      g3.addColorStop(0.5, 'rgba(78,35,15,0.02)')
      g3.addColorStop(1, 'transparent')
      ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h)

      /* Concentric ring system */
      const rings = [0.1, 0.18, 0.28, 0.4]
      rings.forEach((s, ri) => {
        const phase = t * (0.15 + ri * 0.05) + ri * 1.2
        ctx.beginPath()
        ctx.arc(cx, cy, Math.min(w, h) * s, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(251,191,36,${0.035 - ri * 0.007 + Math.sin(phase) * 0.01})`
        ctx.lineWidth = ri === 0 ? 1 : 0.5
        ctx.stroke()
      })

      /* Subtle cross-hairs at center for structure */
      ctx.globalAlpha = 0.015
      ctx.beginPath()
      ctx.moveTo(cx - Math.min(w, h) * 0.12, cy)
      ctx.lineTo(cx + Math.min(w, h) * 0.12, cy)
      ctx.moveTo(cx, cy - Math.min(w, h) * 0.12)
      ctx.lineTo(cx, cy + Math.min(w, h) * 0.12)
      ctx.strokeStyle = 'var(--amber-400)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.globalAlpha = 1

      /* ── Particles ── */
      const ms = motesRef.current
      if (mouseRef.current.active && !reducedMotion) {
        spawnTimer++
        if (spawnTimer % 2 === 0 && ms.length < 400) ms.push(spawn(w, h, true))
      }

      for (let i = ms.length - 1; i >= 0; i--) {
        const m = ms[i]
        m.life++
        const p = m.life / m.maxLife

        if (p < 0.1) m.alpha += (m.targetAlpha - m.alpha) * 0.08
        else if (p > 0.8) m.alpha *= 0.97
        if (m.alpha < 0.004) m.alpha = 0

        const dx = cx - m.x, dy = cy - m.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 1
        m.vx += dx / dist * 0.003 + Math.sin(t * 1.2 + m.y * 0.004) * 0.004
        m.vy += dy / dist * 0.001
        m.vx *= 0.997; m.vy *= 0.997
        m.x += m.vx; m.y += m.vy

        if (m.life >= m.maxLife || m.y < -60) { ms[i] = spawn(w, h); continue }

        const L = 52 + m.r * 3
        /* Outer glow for large motes */
        if (m.layer === 0) {
          const gr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6)
          gr.addColorStop(0, `hsla(${m.hue},${m.sat - 15}%,${L}%,${m.alpha * 0.07})`)
          gr.addColorStop(1, 'transparent')
          ctx.fillStyle = gr
          ctx.fillRect(m.x - m.r * 6, m.y - m.r * 6, m.r * 12, m.r * 12)
        }
        if (m.r > 1.3) {
          ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 2.2, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(${m.hue},${m.sat - 10}%,${L}%,${m.alpha * 0.12})`
          ctx.fill()
        }
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${m.hue},${m.sat}%,${L}%,${m.alpha})`
        ctx.fill()
      }

      /* Connection filaments */
      if (!reducedMotion) {
        ctx.lineWidth = 0.3
        for (let i = 0; i < ms.length; i++) {
          if (ms[i].r < 2 || ms[i].alpha < 0.08) continue
          for (let j = i + 1; j < ms.length; j++) {
            if (ms[j].r < 2 || ms[j].alpha < 0.08) continue
            const ddx = ms[i].x - ms[j].x, ddy = ms[i].y - ms[j].y
            const d2 = ddx * ddx + ddy * ddy
            if (d2 < 9000) {
              ctx.beginPath()
              ctx.moveTo(ms[i].x, ms[i].y); ctx.lineTo(ms[j].x, ms[j].y)
              ctx.strokeStyle = `rgba(251,191,36,${(1 - d2 / 9000) * 0.05 * Math.min(ms[i].alpha, ms[j].alpha)})`
              ctx.stroke()
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }
    if (!reducedMotion) frameRef.current = requestAnimationFrame(draw)
    else draw()

    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener('resize', resize) }
  }, [reducedMotion, spawn])

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true }
  }, [])
  const onLeave = useCallback(() => { mouseRef.current.active = false }, [])

  const py = reducedMotion ? 0 : scrollY * 0.2
  const fade = reducedMotion ? 1 : Math.max(0, 1 - scrollY / 500)

  return (
    <section
      style={{
        position: 'relative', width: '100%', height: '100vh', minHeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 70% 55% at 50% 42%, #1a1005 0%, #0c0a09 50%, #050302 100%)',
      }}
      onMouseMove={onMove} onMouseLeave={onLeave}
    >
      <canvas ref={canvasRef} aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `translateY(${py}px)` }} />

      <div style={{
        position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px',
        transform: `translateY(${reducedMotion ? 0 : -scrollY * 0.06}px)`, opacity: fade,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.1vw, 13px)',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          color: 'var(--amber-500)', opacity: 0.75, marginBottom: 24,
        }}>Anthropic</div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 11vw, 140px)',
          fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          <span style={{
            display: 'block',
            background: 'linear-gradient(160deg, #fef3c7 0%, #fcd34d 30%, #d97706 65%, #92400e 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            filter: 'drop-shadow(0 0 60px rgba(251,191,36,0.2))',
          }}>Claude</span>
          <span style={{
            display: 'block',
            background: 'linear-gradient(160deg, #fde68a 0%, #fbbf24 40%, #b45309 80%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            fontStyle: 'italic', fontWeight: 400,
            filter: 'drop-shadow(0 0 50px rgba(251,191,36,0.15))',
          }}>Opus 4.6</span>
        </h1>

        <div style={{
          width: 48, height: 1, margin: '18px auto',
          background: 'linear-gradient(90deg, transparent, var(--amber-600), transparent)',
        }} />

        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(13px, 1.6vw, 17px)', fontWeight: 400,
          color: 'var(--amber-300)', opacity: 0.5,
          maxWidth: 380, margin: '0 auto', lineHeight: 1.6, letterSpacing: '0.06em',
        }}>深度思考的前線模型</p>

        <div style={{
          marginTop: 'clamp(48px, 8vh, 80px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.3,
          animation: reducedMotion ? 'none' : 'drift 2.8s ease-in-out infinite',
        }}>
          <div style={{
            width: 1, height: 32,
            background: 'linear-gradient(180deg, var(--amber-500), transparent)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--amber-500)',
          }}>SCROLL</span>
        </div>
      </div>

      <style>{`@keyframes drift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
    </section>
  )
}
