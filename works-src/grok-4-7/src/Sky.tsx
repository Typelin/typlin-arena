import { useEffect, useRef } from 'react'

type Props = {
  /** 0 low … 1 xhigh. Drives how long the bright arc lingers. */
  effort: number
  /** 0..1 drag offset of the sun along the arc. */
  place: number
}

/**
 * A single late-day arc. The sun is the only moving mass;
 * effort stretches how far the light still reaches after it sets.
 */
export default function Sky({ effort, place }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const state = useRef({ effort, place, w: 0, h: 0, reduced: false })

  useEffect(() => {
    state.current.effort = effort
    state.current.place = place
  }, [effort, place])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    state.current.reduced = reduce.matches
    const onReduce = () => {
      state.current.reduced = reduce.matches
    }
    reduce.addEventListener('change', onReduce)

    let raf = 0
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      state.current.w = w
      state.current.h = h
    }
    resize()
    const ro = new ResizeObserver(resize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    const draw = (t: number) => {
      const { w, h, effort: e, place: p, reduced } = state.current
      const dpr = canvas.width / Math.max(1, w)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const ground = h * 0.86
      const breathe = reduced ? 0 : Math.sin(t / 2400) * 0.008
      const along = Math.min(1, Math.max(0, p + breathe))

      const x0 = w * 0.3
      const x1 = w * 0.97
      const peak = h * 0.1
      const sunX = x0 + (x1 - x0) * along
      const nx = (along - 0.5) * 2
      const sunY = ground - (ground - peak) * (1 - nx * nx)

      // afterglow length grows with effort
      const glow = 0.18 + e * 0.55

      const g = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, Math.max(w, h) * glow)
      g.addColorStop(0, 'rgba(255, 214, 150, 0.95)')
      g.addColorStop(0.18, 'rgba(231, 162, 58, 0.55)')
      g.addColorStop(0.45, 'rgba(194, 65, 12, 0.16)')
      g.addColorStop(1, 'rgba(194, 65, 12, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // horizon band
      const band = ctx.createLinearGradient(0, ground - 30, 0, h)
      band.addColorStop(0, 'rgba(141, 84, 18, 0)')
      band.addColorStop(0.35, 'rgba(141, 84, 18, 0.18)')
      band.addColorStop(1, 'rgba(26, 20, 12, 0.28)')
      ctx.fillStyle = band
      ctx.fillRect(0, ground - 30, w, h - ground + 30)

      ctx.beginPath()
      ctx.moveTo(0, ground)
      ctx.lineTo(w, ground)
      ctx.strokeStyle = 'rgba(26, 20, 12, 0.45)'
      ctx.lineWidth = 1.25
      ctx.stroke()

      // the arc itself, faint
      ctx.beginPath()
      ctx.moveTo(x0, ground)
      ctx.quadraticCurveTo((x0 + x1) / 2, peak - 20, x1, ground)
      ctx.strokeStyle = 'rgba(26, 20, 12, 0.18)'
      ctx.lineWidth = 1
      ctx.stroke()

      // sun disc with a soft limb
      const r = Math.max(18, Math.min(w, h) * 0.055)
      const disc = ctx.createRadialGradient(sunX - r * 0.25, sunY - r * 0.3, r * 0.1, sunX, sunY, r)
      disc.addColorStop(0, '#fff6e4')
      disc.addColorStop(0.55, '#f0b24a')
      disc.addColorStop(1, '#c45a14')
      ctx.beginPath()
      ctx.arc(sunX, sunY, r, 0, Math.PI * 2)
      ctx.fillStyle = disc
      ctx.fill()

      // long shadow on the ground, weight follows effort
      ctx.beginPath()
      ctx.ellipse(sunX, ground + 2, r * (1.4 + e * 2.4), 3.2, 0, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(26, 20, 12, ${0.18 + e * 0.25})`
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      reduce.removeEventListener('change', onReduce)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" />
}
