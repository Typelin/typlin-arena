import { useRef, useEffect } from 'react'
import { useInView } from '../hooks/useInView'
import styles from './Thinking.module.css'

interface Branch {
  x1: number
  y1: number
  angle: number
  len: number
  depth: number
  progress: number  // 0→1 growth
  opacity: number
  dying: boolean
  hue: number
  children: Branch[]
  childrenSpawned: boolean
  speed: number
}

function createBranch(x1: number, y1: number, angle: number, len: number, depth: number, hue: number): Branch {
  return {
    x1, y1, angle, len, depth,
    progress: 0,
    opacity: 1,
    dying: false,
    hue,
    children: [],
    childrenSpawned: false,
    speed: 0.012 + Math.random() * 0.01,
  }
}

function branchEnd(b: Branch) {
  return {
    x: b.x1 + Math.cos(b.angle) * b.len * b.progress,
    y: b.y1 + Math.sin(b.angle) * b.len * b.progress,
  }
}

function tickBranch(b: Branch, maxDepth: number, dt: number): void {
  if (b.dying) {
    b.opacity = Math.max(0, b.opacity - dt * 0.6)
    for (const c of b.children) tickBranch(c, maxDepth, dt)
    return
  }

  b.progress = Math.min(1, b.progress + b.speed)

  if (b.progress >= 0.98 && !b.childrenSpawned && b.depth < maxDepth) {
    b.childrenSpawned = true
    const end = branchEnd(b)
    const spread = (0.28 + Math.random() * 0.22) * Math.PI
    const childLen = b.len * (0.6 + Math.random() * 0.15)
    const childHue = b.hue + 15 + Math.random() * 20
    b.children.push(
      createBranch(end.x, end.y, b.angle - spread, childLen, b.depth + 1, childHue),
      createBranch(end.x, end.y, b.angle + spread, childLen, b.depth + 1, childHue + 10),
    )
    // Occasionally add a 3rd branch
    if (Math.random() < 0.3 && b.depth < maxDepth - 1) {
      b.children.push(
        createBranch(end.x, end.y, b.angle + (Math.random() - 0.5) * 0.4, childLen * 0.8, b.depth + 1, childHue + 5)
      )
    }
  }

  for (const c of b.children) tickBranch(c, maxDepth, dt)
}

function drawBranch(ctx: CanvasRenderingContext2D, b: Branch): void {
  if (b.opacity < 0.01) return

  const end = branchEnd(b)
  const lum = 55 + (1 - b.depth / 8) * 30
  const lineW = Math.max(0.4, (1 - b.depth / 8) * 2.5)

  ctx.beginPath()
  ctx.moveTo(b.x1, b.y1)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = `hsla(${b.hue}, 85%, ${lum}%, ${b.opacity * 0.85})`
  ctx.lineWidth = lineW
  ctx.stroke()

  // Node at end (only when branch fully grown)
  if (b.progress > 0.95 && b.children.length === 0) {
    ctx.beginPath()
    ctx.arc(end.x, end.y, lineW * 1.8, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${b.hue + 30}, 90%, 75%, ${b.opacity})`
    ctx.fill()
  }

  for (const c of b.children) drawBranch(ctx, c)
}

function countBranches(b: Branch): number {
  return 1 + b.children.reduce((s, c) => s + countBranches(c), 0)
}

export default function Thinking() {
  const { ref, inView } = useInView(0.1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const ctx = canvas.getContext('2d')!
    if (!canvas.getContext) return

    let w = canvas.offsetWidth
    let h = canvas.offsetHeight
    canvas.width = w
    canvas.height = h

    const roots: Branch[] = []
    const MAX_DEPTH = 7
    const MAX_ROOTS = 4

    function spawnRoot() {
      if (roots.length >= MAX_ROOTS) {
        // Start killing oldest
        roots[0].dying = true
        roots.splice(0, 1)
      }
      const cx = w * (0.3 + Math.random() * 0.4)
      const cy = h * (0.4 + Math.random() * 0.2)
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8
      const len = Math.min(w, h) * (0.08 + Math.random() * 0.06)
      const hue = 170 + Math.random() * 100  // teal → blue → purple
      roots.push(createBranch(cx, cy, angle, len, 0, hue))
    }

    spawnRoot()

    let raf: number
    let lastTs = 0
    let spawnTimer = 0
    const SPAWN_INTERVAL = 2.8  // seconds

    // Click spawns new tree at cursor
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      if (roots.length >= MAX_ROOTS) {
        roots[0].dying = true
        roots.splice(0, 1)
      }
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2
      const len = Math.min(w, h) * (0.09 + Math.random() * 0.05)
      const hue = 170 + Math.random() * 110
      roots.push(createBranch(mx, my, angle, len, 0, hue))
      spawnTimer = 0
    }
    canvas.addEventListener('click', handleClick)

    function draw(ts: number) {
      if (!lastTs) lastTs = ts
      const dt = Math.min((ts - lastTs) / 1000, 0.05)
      lastTs = ts

      ctx.fillStyle = 'rgba(4,5,13,0.12)'
      ctx.fillRect(0, 0, w, h)

      // Tick & draw all roots
      for (const root of roots) {
        tickBranch(root, MAX_DEPTH, dt)
        drawBranch(ctx!, root)
      }

      // Remove fully dead roots
      for (let i = roots.length - 1; i >= 0; i--) {
        if (roots[i].opacity < 0.01 && roots[i].dying) roots.splice(i, 1)
      }

      // Auto-spawn
      spawnTimer += dt
      if (spawnTimer > SPAWN_INTERVAL) {
        spawnTimer = 0
        spawnRoot()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const onResize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('resize', onResize)
    }
  }, [inView])

  return (
    <section className={styles.section}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="神經分支生長視覺化，可點擊互動"
        role="img"
      />

      <div ref={ref} className={`${styles.content} ${inView ? styles.visible : ''}`}>
        <div className={styles.eyebrow}>Chapter 05 · 思考方式</div>
        <h2 className={styles.heading}>
          思考，不是靜止的。
        </h2>
        <p className={styles.sub}>
          它分叉、試探、推翻、再生長。
        </p>

        <div className={styles.desc}>
          <p>
            Adaptive Thinking 模式根據問題難度自動分配推理算力。
            預設 effort 為 <strong>high</strong>——不浪費力氣，也不省略關鍵步驟。
          </p>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <div className={styles.statNum}>High</div>
            <div className={styles.statLabel}>預設 Effort</div>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <div className={styles.statNum}>Adaptive</div>
            <div className={styles.statLabel}>Thinking 模式</div>
          </div>
          <div className={styles.statDiv} />
          <div className={styles.stat}>
            <div className={styles.statNum}>~56K</div>
            <div className={styles.statLabel}>avg Reasoning Tokens</div>
          </div>
        </div>

        <button
          className={styles.interactHint}
          onClick={() => {
            const canvas = canvasRef.current
            if (!canvas) return
            const r = canvas.getBoundingClientRect()
            canvas.dispatchEvent(new MouseEvent('click', {
              clientX: r.left + r.width * (0.3 + Math.random() * 0.4),
              clientY: r.top + r.height * (0.4 + Math.random() * 0.2),
            }))
          }}
        >
          點擊 canvas 生長新樹
        </button>
      </div>
    </section>
  )
}
