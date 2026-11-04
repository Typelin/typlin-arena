import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  hue: number
  pulse: number
  pulseSpeed: number
}

interface UseNeuralCanvasOptions {
  density?: number
  connectionDistance?: number
  speed?: number
  accentHue?: number
}

export function useNeuralCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseNeuralCanvasOptions = {}
) {
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { density = 60, connectionDistance = 140, speed = 0.3, accentHue = 270 } = options

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const particles: Particle[] = []

    function createParticles() {
      particles.length = 0
      const count = Math.floor((w * h) / (1920 * 1080 / density))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          r: Math.random() * 2.5 + 0.5,
          alpha: Math.random() * 0.6 + 0.2,
          hue: accentHue + (Math.random() - 0.5) * 60,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02,
        })
      }
    }

    createParticles()

    let mouseX = -9999
    let mouseY = -9999

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    canvas.addEventListener('mousemove', onMouseMove)

    function draw(_time: number) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed

        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Mouse attraction
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.08
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
          const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
          if (spd > speed * 4) {
            p.vx = (p.vx / spd) * speed * 4
            p.vy = (p.vy / spd) * speed * 4
          }
        } else {
          p.vx *= 0.998
          p.vy *= 0.998
          if (Math.abs(p.vx) < speed * 0.3) p.vx += (Math.random() - 0.5) * 0.01
          if (Math.abs(p.vy) < speed * 0.3) p.vy += (Math.random() - 0.5) * 0.01
        }

        const pulseR = p.r * (1 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`
        ctx.fill()
      }

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.35
            const hue = (a.hue + b.hue) / 2
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    const onResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
      createParticles()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
    }
  }, [canvasRef, options.density, options.connectionDistance, options.speed, options.accentHue])
}
