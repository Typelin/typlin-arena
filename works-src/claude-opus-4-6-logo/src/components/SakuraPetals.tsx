import { useEffect, useRef } from 'react'

/*
 * SakuraPetals — lightweight cherry blossom petal animation
 * Uses SVG petals with CSS animation (no canvas, no heavy lib).
 * Spawns petals at random intervals with random drift/spin.
 */

interface Petal {
  id: number
  x: number       // start X position (%)
  size: number     // px
  duration: number // seconds
  delay: number    // seconds
  drift: number    // horizontal drift px
  spin: number     // rotation degrees
  opacity: number
}

const PETAL_SVG = (color: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
  <path d="M10 0 C6 4, 0 8, 2 14 C4 18, 8 18, 10 20 C12 18, 16 18, 18 14 C20 8, 14 4, 10 0Z" 
        fill="${color}" opacity="0.7"/>
</svg>`

const PETAL_COLORS = [
  '#f4a0b5',
  '#f8c0d0',
  '#fbd5e0',
  '#e8a0c0',
  '#f0b8c8',
]

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

export default function SakuraPetals() {
  const containerRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let running = true

    function spawnPetal() {
      if (!running || !container) return

      const petal: Petal = {
        id: idCounter.current++,
        x: randomBetween(-5, 105),
        size: randomBetween(8, 18),
        duration: randomBetween(8, 16),
        delay: 0,
        drift: randomBetween(-120, 120),
        spin: randomBetween(180, 720) * (Math.random() > 0.5 ? 1 : -1),
        opacity: randomBetween(0.3, 0.8),
      }

      const el = document.createElement('div')
      el.className = 'sakura-petal'
      el.style.left = `${petal.x}%`
      el.style.top = '-20px'
      el.style.width = `${petal.size}px`
      el.style.height = `${petal.size}px`
      el.style.setProperty('--drift', `${petal.drift}px`)
      el.style.setProperty('--spin', `${petal.spin}deg`)
      el.style.animation = `petalFall ${petal.duration}s ease-in forwards`

      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
      el.innerHTML = PETAL_SVG(color)

      container.appendChild(el)

      // Remove after animation
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el)
      }, petal.duration * 1000 + 500)
    }

    // Spawn petals at random intervals
    function scheduleNext() {
      if (!running) return
      const interval = randomBetween(600, 2200)
      setTimeout(() => {
        spawnPetal()
        scheduleNext()
      }, interval)
    }

    // Initial burst of a few petals
    for (let i = 0; i < 5; i++) {
      setTimeout(() => spawnPetal(), i * 400)
    }

    scheduleNext()

    return () => {
      running = false
    }
  }, [])

  return <div ref={containerRef} className="sakura-container" />
}
