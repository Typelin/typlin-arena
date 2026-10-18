import { CHAPTERS, CONFABULATIONS, SLOT_COUNTS, chapterSlots, isForkSlot, type Slot } from '../content'
import { Sound } from './audio'
import { Backdrop } from './backdrop'
import { Flora } from './flora'
import { Wordscape } from './wordscape'
import { approach, clamp, easeInOut, hash01, lerp, pick, ramp, smooth, softmax } from './math'
import { F, PITCH, SERIF, T0, TMAX, UL } from './consts'
import { createTextCache, renderScene, renderExport, type Scene } from './render'
import { TextSprites } from './textsprites'
import { Timeline, type TimelineQuery } from './timeline'
import type { Camera, CandState, DeltaSeg, Fossil, FrameInfo, Hover, OpenSlot, RiverNode, Silt, Snapshot, Token, TrailPoint } from './types'

const GAP_FIXED = 0.28 * F
const GAP_FORK = 1.45 * F
const ROW_WIDTH = 2150
const S_BASE = 1.5 * F
const T_INVENT = 1.45
const WINDOW = 14

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const ringOffset = (ord: number) => (ord === 0 ? 0 : ord % 2 === 1 ? -(ord + 1) / 2 : ord / 2)

export class Engine {
  readonly timeline = new Timeline(SLOT_COUNTS, isForkSlot)
  readonly totalSlots = SLOT_COUNTS.reduce((a, b) => a + b, 0)
  private slotChapter: number[] = []
  private slotIndex: number[] = []
  private variants: (number | undefined)[] = []

  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private W = 0
  private H = 0
  private dpr = 1
  private raf = 0
  private last = 0
  private running = false

  ready = false
  rm = false
  private seed = Math.floor(Math.random() * 1e9)
  private attempts = new Map<number, number>()
  private widths = new Map<string, number>()

  nodes: RiverNode[] = []
  open: OpenSlot | null = null
  fossils: Fossil[] = []
  private cam: Camera = { fx: 0, fy: 0, s: 1, ax: 0, ay: 0 }
  private camInit = false

  T = T0
  private heating = false
  private pointer = { sx: -1, sy: -1, over: false, lastMove: 0, act: 0, down: false, type: 'mouse' as string }
  private press: { id: number; x: number; y: number; t: number; timer: number; heated: boolean } | null = null
  private keyboard = false
  private rewinds = 0
  private sumT = 0
  private hover: Hover | null = null
  private wash: { at: number; reset: boolean } | null = null
  private announce = ''
  private lastChapterDone = -1
  private q: TimelineQuery
  /** Bumped on every commit or rewind. */
  private version = 0
  private windowAlpha = 0
  private windowFrom = -1
  /* Layers that accumulate chapter by chapter. */
  private banks = 0
  private trail: TrailPoint[] = []
  private silt: Silt[] = []
  private delta: { key: string; segs: DeltaSeg[] } = { key: '', segs: [] }
  /* Sound bookkeeping. */
  private lastScrollY = 0
  private flow = 0
  private heardTitle = 0
  private heardFinale = false

  readonly sound = new Sound()
  private listeners = new Set<() => void>()
  private snap: Snapshot
  private snapKey = ''

  private backdrop: Backdrop | null
  private scape: Wordscape | null
  private scapeZoom = 1
  private occluder: { x: number; y: number; w: number; h: number } | null = null
  private lensA = 0
  private lensScrollY = 0
  private lastScrollAt = 0
  private textCache = createTextCache()
  private tsKey = ''
  private tsCache: Token[] = []
  private sprites = new TextSprites()
  private lensAt = { x: 0, y: 0 }
  private flora = new Flora()
  /** 0..6: how much of the landscape the paper has gathered (chapter + finale), smoothed. */
  private rich = 0
  private lastDt = 0.016

  constructor(canvas: HTMLCanvasElement, backdrop?: HTMLCanvasElement, scape?: HTMLCanvasElement) {
    this.canvas = canvas
    this.backdrop = backdrop ? new Backdrop(backdrop) : null
    this.scape = scape ? new Wordscape(scape) : null
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D unavailable')
    this.ctx = ctx
    SLOT_COUNTS.forEach((n, c) => {
      for (let i = 0; i < n; i++) {
        this.slotChapter.push(c)
        this.slotIndex.push(i)
      }
    })
    this.q = this.timeline.query(0)
    this.snap = this.buildSnapshot()
  }

  /* ───────────────────────── lifecycle ───────────────────────── */

  start() {
    this.running = true
    this.resize()
    window.addEventListener('resize', this.resize)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.onBlur)
    document.addEventListener('visibilitychange', this.onVisibility)
    const c = this.canvas
    c.addEventListener('pointermove', this.onPointerMove)
    c.addEventListener('pointerdown', this.onPointerDown)
    c.addEventListener('pointerup', this.onPointerUp)
    c.addEventListener('pointercancel', this.onPointerCancel)
    c.addEventListener('pointerleave', this.onPointerLeave)
    c.addEventListener('contextmenu', this.onContextMenu)
    this.initSound()
    window.addEventListener('pointerdown', this.unlockSound)
    window.addEventListener('keydown', this.unlockSound)
    window.addEventListener('touchend', this.unlockSound)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    window.removeEventListener('pointerdown', this.unlockSound)
    window.removeEventListener('keydown', this.unlockSound)
    window.removeEventListener('touchend', this.unlockSound)
    this.sound.enable(false)
    this.running = false
    cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.onBlur)
    document.removeEventListener('visibilitychange', this.onVisibility)
    const c = this.canvas
    c.removeEventListener('pointermove', this.onPointerMove)
    c.removeEventListener('pointerdown', this.onPointerDown)
    c.removeEventListener('pointerup', this.onPointerUp)
    c.removeEventListener('pointercancel', this.onPointerCancel)
    c.removeEventListener('pointerleave', this.onPointerLeave)
    c.removeEventListener('contextmenu', this.onContextMenu)
  }

  private onContextMenu = (e: Event) => e.preventDefault()

  /** Called once fonts are available: widths measured from here on are final. */
  setReady() {
    this.widths.clear()
    this.ready = true
  }

  setReducedMotion(rm: boolean) {
    this.rm = rm
  }

  private resize = () => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.W = window.innerWidth
    this.H = window.innerHeight
    this.canvas.width = Math.round(this.W * this.dpr)
    this.canvas.height = Math.round(this.H * this.dpr)
    this.canvas.style.width = `${this.W}px`
    this.canvas.style.height = `${this.H}px`
    this.backdrop?.resize(this.W, this.H)
    this.scape?.resize(this.W, this.H)
  }

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf)
    } else if (this.running) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  /* ───────────────────────── store ───────────────────────── */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  getSnapshot = () => this.snap

  /* Per-frame values for direct DOM styling (title wipes, opening blot, heat glow). */
  readonly frameInfo: FrameInfo = { hero: 0, titleChapter: -1, titleU: 0, finaleU: 0, heat: 0, forkX: 0.6, forkY: 0.45 }
  private frameListeners = new Set<(f: FrameInfo) => void>()

  onFrame = (fn: (f: FrameInfo) => void) => {
    this.frameListeners.add(fn)
    fn(this.frameInfo)
    return () => {
      this.frameListeners.delete(fn)
    }
  }

  private publishFrame() {
    const f = this.frameInfo
    const fs = this.forkScreen()
    f.hero = this.ready ? clamp(window.scrollY / 260) : 0
    f.titleChapter = this.q.titleChapter
    f.titleU = this.q.titleU
    f.finaleU = this.q.finaleU
    f.heat = this.heat01()
    f.forkX = fs.x
    f.forkY = fs.y
    this.frameListeners.forEach((fn) => fn(f))
  }

  /** Where the open fork sits on screen, as viewport fractions (coarse, for CSS). */
  private forkScreen() {
    const o = this.open
    const last = this.nodes[this.nodes.length - 1]
    const x = o ? o.x : last ? last.x + last.width : 0
    const y = o ? o.yc : last ? last.y : 0
    const p = this.toScreen(x, y)
    return { x: Math.round((p.x / (this.W || 1)) * 50) / 50, y: Math.round((p.y / (this.H || 1)) * 50) / 50 }
  }

  private emit() {
    // A cheap key: the snapshot (and its transcript) is rebuilt only when something visible changed.
    const q = this.q
    const h = this.hover
    const parts = [
      this.ready,
      this.heroPhase(),
      q.chapter,
      q.titleChapter,
      this.titlePhase(),
      this.finalePhase(),
      Math.round(this.T * 100),
      this.version,
      this.rewinds,
      h ? `${h.word}${Math.round(h.x)},${Math.round(h.y)}` : '',
      this.keyboard,
      this.sound.enabled,
      this.sound.pending,
      Math.round(this.rich * 10),
      this.announce,
    ]
    const key = parts.join('|')
    if (key === this.snapKey) return
    // While racing through words (several commits a frame), only the word count changes: coalesce
    // those updates to ~30 Hz so React is not asked to render every frame. Anything else is immediate.
    const now = performance.now()
    const racing = this.q.target - this.nodes.length > 2
    // everything except the word count (version, index 7) and rewinds (index 8)
    const coarse = parts.filter((_, i) => i !== 7 && i !== 8).join('|')
    if (racing && coarse === this.snapCoarse && now - this.snapAt < 33) return
    this.snapCoarse = coarse
    this.snapAt = now
    this.snapKey = key
    this.snap = this.buildSnapshot()
    this.listeners.forEach((fn) => fn())
  }

  private snapCoarse = ''
  private snapAt = 0

  private buildSnapshot(): Snapshot {
    const q = this.q
    const last = this.nodes[this.nodes.length - 1]
    let tc = this.open ? this.open.c : last ? last.chapter : 0
    if (this.open && this.open.i === 0 && last) tc = last.chapter
    // Same words, same array: lets the transcript skip re-rendering while only the scroll moves.
    if (this.tsKey !== `${this.version}:${tc}`) {
      this.tsKey = `${this.version}:${tc}`
      this.tsCache = this.nodes.filter((n) => n.chapter === tc).map((n) => ({ w: n.word, mine: n.mine, invented: n.invented }))
    }
    const transcript = this.tsCache
    const lead = this.timeline.leadCount
    return {
      forkX: 0,
      forkY: 0,
      ready: this.ready,
      hero: this.heroPhase(),
      chapter: q.chapter,
      titleChapter: q.titleChapter,
      titleU: this.titlePhase(),
      finaleU: this.finalePhase(),
      T: Math.round(this.T * 100) / 100,
      heat: Math.round(this.heat01() * 100) / 100,
      influence: this.nodes.filter((n) => n.mine).length,
      invented: this.nodes.filter((n) => n.invented).length,
      rewinds: this.rewinds,
      written: this.nodes.length,
      forks: this.nodes.filter((n) => n.fork).length,
      revealInfluence: q.passedTitle(3) || (q.titleChapter === 3 && q.titleU > 0.16) || q.chapter > 3,
      transcriptChapter: tc,
      transcript,
      hover: this.hover,
      keyboard: this.keyboard,
      sound: this.sound.enabled,
      soundPending: this.sound.pending,
      done: this.nodes.length >= this.totalSlots && q.finaleU > 0.5,
      progress: Math.round((this.nodes.length - lead) / (this.totalSlots - lead) * 200) / 200,
      announce: this.announce,
    }
  }

  /* Coarse phases: the only scroll-derived values React needs (what to show, not how far). */
  private heroPhase() {
    if (!this.ready) return 0
    const h = clamp(window.scrollY / 260)
    return h >= 1 ? 1 : h > 0.6 ? 0.7 : h > 0.5 ? 0.55 : 0
  }

  private titlePhase() {
    const u = this.q.titleU
    return this.q.titleChapter < 1 ? 0 : u <= 0.03 ? 0 : u >= 0.97 ? 1 : 0.5
  }

  private finalePhase() {
    const u = this.q.finaleU
    return u <= 0 ? 0 : u > 0.62 ? 0.7 : 0.3
  }

  /** The full text written so far, by chapter. */
  getWritten(): Token[][] {
    const out: Token[][] = CHAPTERS.map(() => [])
    for (const n of this.nodes) out[n.chapter].push({ w: n.word, mine: n.mine, invented: n.invented })
    return out
  }

  meanT() {
    const forks = this.nodes.filter((n) => n.fork)
    return forks.length ? forks.reduce((a, n) => a + n.T, 0) / forks.length : T0
  }

  /* ───────────────────────── controls ───────────────────────── */

  /** An opaque panel now covers this screen rect (or nothing). */
  setOccluder(r: { x: number; y: number; w: number; h: number } | null) {
    this.occluder = r
  }

  setHeating(on: boolean) {
    this.heating = on
  }

  setSound(on: boolean) {
    this.sound.enable(on)
    try {
      localStorage.setItem('delta-sound', on ? '1' : '0')
    } catch {
      /* storage unavailable: preference simply isn't remembered */
    }
    this.emit()
  }

  /** Sound is on by default; browsers only let it start at the visitor's first gesture. */
  private unlockSound = () => {
    if (!this.sound.enabled) return
    this.sound.unlock()
  }

  private initSound() {
    let want = true
    try {
      want = localStorage.getItem('delta-sound') !== '0'
    } catch {
      want = true
    }
    if (!want) return
    this.sound.enable(true)
    this.sound.onState(() => this.emit())
  }

  heat01() {
    return clamp((this.T - T0) / (TMAX - T0))
  }

  /** Scroll so that the river may commit one more (or one fewer) word. */
  step(dir: 1 | -1) {
    const h = this.nodes.length
    const g = dir > 0 ? h : h - 1
    if (g < this.timeline.leadCount && dir < 0) return
    if (g >= this.totalSlots) {
      if (dir > 0) window.scrollTo({ top: this.timeline.total, behavior: this.rm ? 'auto' : 'smooth' })
      return
    }
    const pos = this.timeline.commitPos[g]
    window.scrollTo({ top: dir > 0 ? pos + 2 : pos - 2, behavior: 'auto' })
  }

  restart() {
    this.sound.washAway()
    if (this.rm) {
      this.reset()
      return
    }
    this.wash = { at: performance.now(), reset: false }
  }

  private reset() {
    this.nodes = []
    this.open = null
    this.fossils = []
    this.variants = []
    this.attempts.clear()
    this.seed = Math.floor(Math.random() * 1e9)
    this.rewinds = 0
    this.sumT = 0
    this.T = T0
    this.camInit = false
    this.lastChapterDone = -1
    this.announce = ''
    this.trail = []
    this.silt = []
    this.heardTitle = 0
    this.heardFinale = false
    this.rich = 0
    this.backdrop?.reset()
    this.scape?.reset()
    this.flora.reset()
    this.version++
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  async exportPNG(): Promise<Blob | null> {
    const stats = {
      words: this.nodes.length,
      forks: this.nodes.filter((n) => n.fork).length,
      mine: this.nodes.filter((n) => n.mine).length,
      invented: this.nodes.filter((n) => n.invented).length,
      meanT: this.meanT(),
    }
    const canvas = renderExport(this.nodes, this.bounds(this.nodes, true), stats, this.delta.segs, this.flora)
    return new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'))
  }

  /* ───────────────────────── input ───────────────────────── */

  private isTypingTarget(t: EventTarget | null) {
    if (!(t instanceof HTMLElement)) return false
    return !!t.closest('button, a, input, textarea, select, dialog, [contenteditable]')
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (e.code === 'Space') {
      if (this.isTypingTarget(e.target)) return
      e.preventDefault()
      this.keyboard = true
      this.heating = true
      return
    }
    if (this.isTypingTarget(e.target) && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    if (/^[1-9]$/.test(e.key) && this.open && this.open.fork) {
      const order = this.displayOrder(this.open)
      const idx = order[Number(e.key) - 1]
      if (idx !== undefined) {
        this.keyboard = true
        this.choose(idx)
        e.preventDefault()
      }
    } else if (e.key === 'ArrowRight' || (e.key === 'Enter' && !this.isTypingTarget(e.target))) {
      this.keyboard = true
      this.step(1)
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      this.keyboard = true
      this.step(-1)
      e.preventDefault()
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') this.heating = false
  }

  private onBlur = () => {
    this.heating = false
  }

  private onPointerMove = (e: PointerEvent) => {
    this.pointer.sx = e.clientX
    this.pointer.sy = e.clientY
    this.pointer.over = true
    this.pointer.type = e.pointerType
    this.pointer.lastMove = performance.now()
    if (e.pointerType === 'mouse') this.keyboard = false
    this.backdrop?.touched(e.clientX, e.clientY, this.rich)
    const wx = (e.clientX - this.cam.ax) / this.cam.s + this.cam.fx
    const wy = (e.clientY - this.cam.ay) / this.cam.s + this.cam.fy
    const tl = this.trail[this.trail.length - 1]
    if (!tl || Math.hypot(tl.x - wx, tl.y - wy) > 6 / this.cam.s) {
      this.trail.push({ x: wx, y: wy, t: performance.now() })
      if (this.trail.length > 180) this.trail.shift()
    }
    if (this.press && Math.hypot(e.clientX - this.press.x, e.clientY - this.press.y) > 10) {
      window.clearTimeout(this.press.timer)
      if (this.press.heated) this.heating = false
      this.press = null
    }
    const overCand = this.hitOpen(e.clientX, e.clientY) >= 0
    this.hover = overCand ? null : this.hitGhost(e.clientX, e.clientY)
    this.canvas.style.cursor = overCand ? 'pointer' : this.hover ? 'help' : ''
  }

  private onPointerDown = (e: PointerEvent) => {
    this.pointer.down = true
    this.pointer.type = e.pointerType
    this.pointer.sx = e.clientX
    this.pointer.sy = e.clientY
    this.pointer.lastMove = performance.now()
    const press = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      heated: false,
      timer: 0,
    }
    press.timer = window.setTimeout(() => {
      press.heated = true
      this.heating = true
    }, 300)
    this.press = press
  }

  private onPointerUp = (e: PointerEvent) => {
    this.pointer.down = false
    const press = this.press
    this.press = null
    if (!press) return
    window.clearTimeout(press.timer)
    if (press.heated) {
      this.heating = false
      return
    }
    // A short press: choose a candidate, or reveal a ghost.
    const idx = this.hitOpen(e.clientX, e.clientY)
    if (idx >= 0) {
      this.choose(idx)
      return
    }
    if (e.pointerType !== 'mouse') this.hover = this.hitGhost(e.clientX, e.clientY)
  }

  private onPointerCancel = () => {
    this.pointer.down = false
    if (this.press) {
      window.clearTimeout(this.press.timer)
      if (this.press.heated) this.heating = false
    }
    this.press = null
  }

  private onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      this.pointer.over = false
      this.hover = null
    }
  }

  /** Pin a candidate at the open fork and let the river reach it. */
  private choose(idx: number) {
    const o = this.open
    if (!o || o.decided !== null) return
    if (!o.fork) {
      this.step(1)
      return
    }
    o.pinned = idx
    o.glance = idx
    if (this.timeline.query(window.scrollY).target <= o.g) this.step(1)
  }

  private toScreen(x: number, y: number) {
    const c = this.cam
    return { x: (x - c.fx) * c.s + c.ax, y: (y - c.fy) * c.s + c.ay }
  }

  private hitOpen(sx: number, sy: number): number {
    const o = this.open
    if (!o || !o.fork || o.decided !== null) return -1
    const s = this.cam.s
    let best = -1
    let bestD = Infinity
    o.cands.forEach((c, i) => {
      if (c.a < 0.3) return
      const p = this.toScreen(c.x, c.y)
      const w = c.width * c.s * s
      const top = p.y - F * 0.95 * c.s * s
      const bottom = p.y + F * 0.35 * s
      if (sx >= p.x - 10 && sx <= p.x + w + 36 && sy >= top - 4 && sy <= bottom + 4) {
        const d = Math.abs(sy - (top + bottom) / 2)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
    })
    return best
  }

  private hitGhost(sx: number, sy: number): Hover | null {
    if (this.cam.s < 0.28) return null
    const s = this.cam.s
    for (let k = this.nodes.length - 1; k >= 0; k--) {
      const n = this.nodes[k]
      if (!n.fork) continue
      for (let i = 0; i < n.cands.length; i++) {
        if (i === n.chosen) continue
        const c = n.cands[i]
        if (c.a < 0.1) continue
        const p = this.toScreen(c.x, c.y)
        const w = c.width * 0.74 * s
        if (sx >= p.x && sx <= p.x + w && sy >= p.y - F * 0.8 * s && sy <= p.y + F * 0.25 * s) {
          const prefix = this.nodes
            .filter((m) => m.chapter === n.chapter && m.index < n.index)
            .map((m) => m.word)
            .join('')
          return { x: p.x, y: p.y - F * 0.8 * s, word: c.w, p: c.p, prefix, invented: c.invented }
        }
      }
    }
    return null
  }

  /** Candidate indices sorted top-to-bottom. */
  displayOrder(o: OpenSlot): number[] {
    return o.cands
      .map((c, i) => ({ i, y: c.ty, a: c.a }))
      .filter((c) => c.a > 0.3)
      .sort((a, b) => a.y - b.y)
      .map((c) => c.i)
  }

  /* ───────────────────────── river model ───────────────────────── */

  private variant(c: number) {
    if (this.variants[c] === undefined) {
      const def = CHAPTERS[c]
      this.variants[c] = def.pick ? def.pick({ influence: this.nodes.filter((n) => n.mine).length }) : 0
    }
    return this.variants[c]!
  }

  private slot(g: number): Slot {
    const c = this.slotChapter[g]
    return chapterSlots(c, this.variant(c))[this.slotIndex[g]]
  }

  private measure(word: string) {
    let w = this.widths.get(word)
    if (w === undefined) {
      this.ctx.font = `500 ${F}px ${SERIF}`
      w = this.ctx.measureText(word).width
      this.widths.set(word, w)
    }
    return w
  }

  private openSlot(g: number, now: number): OpenSlot {
    const c = this.slotChapter[g]
    const i = this.slotIndex[g]
    const slot = this.slot(g)
    const fork = slot.length > 1
    const ranked = slot.map((cand, k) => ({ cand, k })).sort((a, b) => b.cand.weight - a.cand.weight)
    const cands: CandState[] = ranked.map(({ cand }, ord) => this.cand(cand.w, cand.weight, ord, false))
    if (fork) cands.push(this.cand(CONFABULATIONS[g % CONFABULATIONS.length], 0, cands.length, true))
    const maxW = Math.max(...cands.map((c) => c.width))

    const last = this.nodes[this.nodes.length - 1]
    let x = 0
    let row = 0
    let newRow = false
    let yc = 0
    let prevEnd = { x: -GAP_FORK, y: 0 }
    if (last) {
      prevEnd = { x: last.x + last.width + 3, y: last.y }
      const gap = fork ? GAP_FORK : GAP_FIXED
      x = last.x + last.width + gap
      row = last.row
      if (last.chapter !== c || x + maxW > ROW_WIDTH) {
        row = last.row + 1
        x = 0
        newRow = true
        yc = row * PITCH
      } else {
        const base = row * PITCH
        yc = base + (last.y - base) * 0.72
      }
    }
    for (const cd of cands) {
      cd.x = x
      cd.y = yc
      cd.ty = yc
    }
    return {
      g,
      c,
      i,
      fork,
      x,
      yc,
      row,
      newRow,
      prevEnd,
      cands,
      needleY: prevEnd.y,
      needleV: 0,
      glance: 0,
      nextGlance: now + 380,
      commitAt: null,
      decideAt: null,
      decided: null,
      mine: false,
      pinned: null,
      born: now,
    }
  }

  private cand(w: string, weight: number, ord: number, invented: boolean): CandState {
    return {
      w,
      weight,
      invented,
      width: this.measure(w),
      ord,
      x: 0,
      y: 0,
      ty: 0,
      p: 0,
      pt: 0,
      s: 0.6,
      a: 0,
      bias: 0,
      votes: 0,
    }
  }

  private inventWeight() {
    return this.T > T_INVENT ? 0.15 + (this.T - T_INVENT) * 1.3 : 0
  }

  private logits(o: OpenSlot, withInvented: boolean) {
    const iw = this.inventWeight()
    return o.cands.map((c) => {
      const w = c.invented ? (withInvented ? iw : 0) : c.weight
      return w > 0 ? Math.log(w) : -Infinity
    })
  }

  private pointerWorldX() {
    return (this.pointer.sx - this.cam.ax) / this.cam.s + this.cam.fx
  }

  private pointerWorldY() {
    return (this.pointer.sy - this.cam.ay) / this.cam.s + this.cam.fy
  }

  /** Live probabilities at the open fork, given heat and the visitor's pull. */
  private probs(o: OpenSlot) {
    const L = this.logits(o, true)
    if (!o.fork) return { p: [1], bias: [0] }
    const S = this.spacing()
    // The pointer is projected onto the fan, so pointing anywhere above pulls toward the top word.
    const present = o.cands.filter((c) => !c.invented || this.inventWeight() > 0)
    const top = Math.min(...present.map((c) => c.ty)) - S * 0.25
    const bottom = Math.max(...present.map((c) => c.ty)) + S * 0.25
    const wy = clamp(this.pointerWorldY(), top, bottom)
    const act = this.pointer.act
    const bias = o.cands.map((c) => (act > 0.01 ? act * 2.6 * Math.exp(-(((c.ty - wy) / (S * 0.85)) ** 2)) : 0))
    const p = softmax(
      L.map((l, i) => l + bias[i]),
      this.T,
    )
    return { p, bias }
  }

  private spacing() {
    return S_BASE * (1 + 0.6 * this.heat01())
  }

  private updateOpen(o: OpenSlot, dt: number, now: number) {
    const S = this.spacing()
    const { p, bias } = this.probs(o)
    const iw = this.inventWeight()
    const rate = this.rm ? 1000 : 1
    o.cands.forEach((c, i) => {
      c.ty = o.yc + ringOffset(c.ord) * S
      c.y = approach(c.y, c.ty, 13 * rate, dt)
      c.pt = p[i]
      c.p = approach(c.p, p[i], 12 * rate, dt)
      const present = c.invented ? (iw > 0 ? 1 : 0) : 1
      c.a = approach(c.a, present, (c.invented ? 5 : 9) * rate, dt)
      c.s = approach(c.s, o.fork ? 0.66 + 0.6 * Math.sqrt(c.p) : 1, 10 * rate, dt)
      c.bias = approach(c.bias, Math.min(1, bias[i] / 2.6), 10 * rate, dt)
    })

    // Glances: the ink tip visits candidates in proportion to their probability.
    if (o.decided === null && now >= o.nextGlance) {
      o.glance = o.pinned ?? (this.rm ? p.indexOf(Math.max(...p)) : pick(p, Math.random()))
      if (o.fork) {
        o.cands[o.glance].votes++
        this.sound.glance(p[o.glance])
      }
      const busy = o.commitAt !== null
      o.nextGlance = now + (busy ? 130 + Math.random() * 110 : 480 + Math.random() * 640)
    }
    const ty = o.cands[o.glance]?.y ?? o.yc
    if (this.rm) {
      o.needleY = ty
      o.needleV = 0
    } else {
      const k = 120
      const damp = 2 * Math.sqrt(k) * 0.42
      o.needleV += (k * (ty - o.needleY) - damp * o.needleV) * dt
      o.needleY += o.needleV * dt
    }
  }

  private decide(o: OpenSlot) {
    const u = hash01(this.seed, o.g, this.attempts.get(o.g) ?? 0)
    const { p } = this.probs(o)
    const p0 = softmax(this.logits(o, false), T0)
    const chosen = o.pinned ?? pick(p, u)
    const cf = pick(p0, u)
    o.decided = chosen
    o.glance = chosen
    o.mine = o.fork && chosen !== cf
  }

  private commit(o: OpenSlot, now: number) {
    if (o.decided === null) this.decide(o)
    const chosen = o.decided!
    const ch = o.cands[chosen]
    const cands = o.fork
      ? o.cands
          .filter((c, i) => i === chosen || c.a > 0.08)
          .map((c) => ({ ...c, y: c.ty, x: o.x }))
      : []
    const chosenIdx = o.fork ? cands.findIndex((c) => c.w === ch.w && c.invented === ch.invented) : 0
    const node: RiverNode = {
      index: this.nodes.length,
      chapter: o.c,
      slotInChapter: o.i,
      word: ch.w,
      width: ch.width,
      x: o.x,
      y: ch.ty,
      row: o.row,
      newRow: o.newRow,
      prevEnd: o.prevEnd,
      fork: o.fork,
      cands,
      chosen: chosenIdx,
      p: o.fork ? ch.pt : 1,
      mine: o.mine,
      invented: ch.invented,
      T: this.T,
      bornAt: now,
      s0: o.fork ? ch.s : 0.92,
      e: 0,
      stampAt: -1,
      tilt: (hash01(o.g, 7) - 0.5) * 0.22,
    }
    this.nodes.push(node)
    this.version++
    this.open = null
    this.sumT += this.T
    const sp = this.toScreen(node.x + node.width / 2, node.y)
    this.backdrop?.written(sp.x, sp.y, node.mine, this.rich)
    if (node.fork && this.scape) {
      // The roads not taken lift off the river and settle into the mountains.
      const ghosts = node.cands
        .filter((c, i) => i !== node.chosen && c.a > 0.1)
        .map((c) => {
          const p = this.toScreen(node.x + c.width * 0.37, c.y - F * 0.35)
          return { w: c.w, x: p.x, y: p.y }
        })
      this.scape.release(ghosts, this.rich, this.q.target - this.nodes.length > 2)
    }
    if (node.fork) this.sound.commit(node.p, node.index, node.mine, node.invented)
    else this.sound.brush()
    if (node.mine && this.pointer.type === 'touch' && 'vibrate' in navigator) navigator.vibrate?.(node.invented ? [6, 30, 6] : 8)

    // Announce a finished chapter for screen readers.
    const count = SLOT_COUNTS[o.c]
    if (o.i === count - 1 && this.lastChapterDone < o.c) {
      this.lastChapterDone = o.c
      const text = this.nodes.filter((n) => n.chapter === o.c).map((n) => n.word).join('')
      this.announce = `第${CHAPTERS[o.c].numeral}章 ${CHAPTERS[o.c].title}：${text}`
    }
  }

  private pop(now: number) {
    const n = this.nodes.pop()
    if (!n) return
    this.version++
    this.open = null
    const pts = [n.prevEnd.x, n.prevEnd.y + UL, n.x, n.y + UL, n.x + n.width, n.y + UL]
    this.fossils.push({ pts, word: n.word, x: n.x, y: n.y, mine: n.mine, at: now })
    if (this.fossils.length > 160) this.fossils.shift()
    if (n.fork) {
      this.attempts.set(n.index, (this.attempts.get(n.index) ?? 0) + 1)
      this.rewinds++
    }
    this.sound.rewind()
    if (n.slotInChapter === 0) this.variants[n.chapter] = undefined
    if (this.lastChapterDone >= n.chapter) this.lastChapterDone = n.chapter - 1
  }

  /** Bring the river to the number of words the scroll position allows. */
  private reconcile(target: number, now: number) {
    let guard = 0
    while (this.nodes.length > target && guard++ < 400) {
      this.pop(now)
      if (!this.rm && this.nodes.length - target < 3) break
    }
    const h = this.nodes.length
    if (h >= this.totalSlots) {
      this.open = null
      return
    }
    if (!this.open || this.open.g !== h) this.open = this.openSlot(h, now)
    const o = this.open
    if (h < target) {
      const n = target - h
      const lead = h < this.timeline.leadCount
      let D: number
      if (this.rm) D = 0
      else if (o.pinned !== null) D = 260
      else if (!o.fork) D = lead ? 210 : Math.max(26, 110 / (1 + 0.5 * (n - 1)))
      else D = Math.max(n > 12 ? 36 : 150, 940 / (1 + 0.55 * (n - 1)))
      const at = Math.max(o.born, now) + D
      if (o.commitAt === null || at < o.commitAt) {
        o.commitAt = at
        o.decideAt = at - D * 0.4
      }
    } else if (o.decided === null) {
      o.commitAt = null
      o.decideAt = null
    }
  }

  /* ───────────────────────── frame ───────────────────────── */

  private frame = () => {
    if (!this.running) return
    // One clock for everything (input handlers also read performance.now()).
    const now = performance.now()
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000))
    this.last = now
    this.lastDt = dt
    this.update(dt, now)
    this.draw(now)
    this.publishFrame()
    this.emit()
    this.raf = requestAnimationFrame(this.frame)
  }

  private update(dt: number, now: number) {
    if (!this.ready) return

    if (this.wash && !this.wash.reset && now - this.wash.at > 520) {
      this.wash.reset = true
      this.reset()
    }
    if (this.wash && now - this.wash.at > 1150) this.wash = null

    this.q = this.timeline.query(window.scrollY)
    const q = this.q

    // Temperature: heats while held, cools on release.
    const Tt = this.heating ? TMAX : T0
    this.T = approach(this.T, Tt, this.heating ? 1.15 : 2.2, dt)

    // Sound follows the river: flow from scroll speed, heat, erosion, chapter bells.
    const sy = window.scrollY
    this.flow = approach(this.flow, clamp(Math.abs(sy - this.lastScrollY) / dt / 1600), 3, dt)
    this.lastScrollY = sy
    const wave = q.titleChapter === 4 ? ramp(q.titleU, 0.3, 0.74) : -1
    const erode = wave > 0 && wave < 1 ? 1 : q.passedTitle(4) && q.finaleU === 0 ? 0.1 : 0
    this.sound.update(this.flow, this.heat01(), ramp(this.T, 1.45, 2.1), erode)
    if (q.titleChapter >= 1 && q.titleChapter > this.heardTitle) {
      this.heardTitle = q.titleChapter
      this.sound.chapter(q.titleChapter)
    } else if (q.titleChapter < 0 && q.chapter < this.heardTitle) {
      this.heardTitle = q.chapter
    }
    if (q.finaleU > 0.02 && !this.heardFinale) {
      this.heardFinale = true
      this.sound.chapter(5)
    } else if (q.finaleU === 0) this.heardFinale = false

    // The visitor's pull fades when the pointer rests.
    const p = this.pointer
    const live = (p.over || p.down) && now - p.lastMove < 3500 && p.sx >= 0
    p.act = approach(p.act, live ? 1 : 0, live ? 8 : 1.4, dt)

    // Commit loop (several per frame only when far behind).
    let iter = 0
    do {
      this.reconcile(q.target, now)
      const o = this.open
      if (!o) break
      this.updateOpen(o, iter === 0 ? dt : 0, now)
      if (o.decideAt !== null && o.decided === null && now >= o.decideAt) this.decide(o)
      if (o.commitAt !== null && now >= o.commitAt) this.commit(o, now)
      else break
    } while (++iter < (this.rm ? 400 : this.q.target - this.nodes.length > 30 ? 12 : 4))

    this.updateNodes(dt, now, q)
    this.updateCamera(dt, q)
  }

  private updateNodes(dt: number, now: number, q: TimelineQuery) {
    const h = this.nodes.length
    // Erosion: the context window. Older words silt up after chapter V begins.
    let limit = 0
    if (q.titleChapter === 4) {
      const wave = easeInOut(ramp(q.titleU, 0.3, 0.74))
      limit = Math.min(Math.floor(wave * h), h - WINDOW)
    } else if (q.passedTitle(4)) {
      limit = h - WINDOW
    }
    const restore = q.finaleU > 0 ? Math.floor(easeInOut(ramp(q.finaleU, 0.04, 0.42)) * (h + 1)) : 0

    // Influence stamps, revealed in order during chapter IV's title.
    const mine = this.nodes.filter((n) => n.mine)
    const passed3 = q.passedTitle(3)
    let pressed = false
    mine.forEach((n, k) => {
      let visible = n.chapter >= 3 || passed3
      if (!visible && q.titleChapter === 3) visible = q.titleU > 0.2 + 0.5 * (k / Math.max(1, mine.length))
      if (visible && n.stampAt < 0) {
        n.stampAt = now
        pressed = true
      }
      if (!visible) n.stampAt = -1
    })
    if (pressed) this.sound.stamp()

    // The paper gathers a landscape chapter by chapter; it changes slowly, like weather.
    const richTarget = q.finaleU > 0 ? 5 + q.finaleU : q.chapter
    this.rich = approach(this.rich, richTarget, this.rm ? 1000 : 0.7, dt)

    // Riverbanks: one more contour line per chapter, from chapter III on.
    const bankTarget = q.finaleU > 0 ? 3 : clamp(q.chapter - 1, 0, 3)
    this.banks = approach(this.banks, bankTarget, this.rm ? 1000 : 1.6, dt)

    // The visitor's trail fades after a few seconds.
    while (this.trail.length && now - this.trail[0].t > 4200) this.trail.shift()

    // Silt drifts off words that have been forgotten.
    if (!this.rm) {
      for (const n of this.nodes) {
        if (n.e < 0.55 || this.silt.length > 260) continue
        if (Math.random() < dt * 1.1 * n.e) {
          this.silt.push({
            x: n.x + Math.random() * n.width,
            y: n.y - Math.random() * F * 0.8,
            vx: 2 + Math.random() * 5,
            vy: 4 + Math.random() * 9,
            born: now,
            life: 2600 + Math.random() * 3200,
            r: 0.8 + Math.random() * 1.6,
          })
        }
      }
    }
    this.silt = this.silt.filter((p) => now - p.born < p.life)
    for (const p of this.silt) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vx += Math.sin(now * 0.001 + p.born) * 3 * dt
    }

    // The delta at the river's mouth, grown once the river is complete.
    if (q.finaleU > 0 && h > 0) {
      const key = `${this.seed}:${h}:${mine.length}`
      if (this.delta.key !== key) this.delta = { key, segs: this.buildDelta(mine.length / Math.max(1, this.nodes.filter((n) => n.fork).length)) }
    }

    // The context window: a visible boundary that travels with the river's head.
    const showWindow = limit > 0 && q.finaleU === 0
    if (showWindow) this.windowFrom = Math.max(0, h - WINDOW)
    this.windowAlpha = approach(this.windowAlpha, showWindow ? 1 : 0, this.rm ? 1000 : 3, dt)

    const rate = this.rm ? 1000 : 4.5
    for (const n of this.nodes) {
      const target = n.index < limit && n.index >= restore ? 1 : 0
      n.e = approach(n.e, target, rate, dt)
      if (Math.abs(n.e - target) < 0.002) n.e = target
    }
  }

  /** Distributaries fanning out from the river's mouth; share = fraction of forks the visitor turned. */
  private buildDelta(share: number): DeltaSeg[] {
    const last = this.nodes[this.nodes.length - 1]
    const segs: DeltaSeg[] = []
    let k = 0
    const grow = (x: number, y: number, ang: number, len: number, depth: number, w: number) => {
      const r = hash01(this.seed, depth, k++)
      const a = ang + (r - 0.5) * 0.35
      const x1 = x + Math.cos(a) * len
      const y1 = y + Math.sin(a) * len
      segs.push({
        x0: x,
        y0: y,
        c1x: x + Math.cos(ang) * len * 0.45,
        c1y: y + Math.sin(ang) * len * 0.45,
        c2x: x1 - Math.cos(a) * len * 0.35,
        c2y: y1 - Math.sin(a) * len * 0.35,
        x1,
        y1,
        depth,
        at: depth / 6 + r * 0.08,
        w,
        mine: hash01(this.seed, 99, k) < share,
      })
      if (depth >= 5) return
      const n = depth < 3 ? 2 : r < 0.45 ? 2 : 3
      for (let i = 0; i < n; i++) {
        const spread = (i - (n - 1) / 2) * (0.66 - depth * 0.06)
        grow(x1, y1, a + spread, len * (0.68 + hash01(this.seed, k, i) * 0.12), depth + 1, w * 0.68)
      }
    }
    grow(last.x + last.width + 4, last.y + UL, 0.32, 175, 0, 4.5)
    return segs
  }

  /** World bounds of a set of nodes (optionally including their ghosts). */
  bounds(nodes: RiverNode[], ghosts: boolean) {
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    for (const n of nodes) {
      x0 = Math.min(x0, n.x)
      x1 = Math.max(x1, n.x + n.width)
      y0 = Math.min(y0, n.y - F)
      y1 = Math.max(y1, n.y + (ghosts ? 260 : F * 0.6))
      if (ghosts) {
        for (const c of n.cands) {
          x1 = Math.max(x1, n.x + c.width * 0.74 + 30)
          y0 = Math.min(y0, c.y - F)
          y1 = Math.max(y1, c.y + F * 0.5)
        }
      }
    }
    if (!isFinite(x0)) return { x0: 0, y0: -F, x1: 400, y1: F }
    if (ghosts && this.q.finaleU > 0 && nodes === this.nodes) {
      for (const d of this.delta.segs) {
        x1 = Math.max(x1, d.x1 + 10)
        y0 = Math.min(y0, d.y1 - 10)
        y1 = Math.max(y1, d.y1 + 10)
      }
    }
    return { x0: x0 - 60, y0: y0 - 50, x1, y1 }
  }

  private fitCam(b: { x0: number; y0: number; x1: number; y1: number }, r: Rect, maxS: number): Camera {
    const s = Math.min(r.w / (b.x1 - b.x0), r.h / (b.y1 - b.y0), maxS)
    return { fx: (b.x0 + b.x1) / 2, fy: (b.y0 + b.y1) / 2, s, ax: r.x + r.w / 2, ay: r.y + r.h / 2 }
  }

  private updateCamera(dt: number, q: TimelineQuery) {
    const { W, H } = this
    const mobile = W < 720
    const base = mobile ? 0.78 : W < 1100 ? 0.9 : 1
    const last = this.nodes[this.nodes.length - 1]
    const o = this.open
    const hero = clamp(1 - window.scrollY / 420)

    // Follow the river's head.
    let fx = 0
    let fy = 0
    if (o) {
      fx = o.x
      fy = o.yc
    } else if (last) {
      fx = last.x + last.width
      fy = last.y
    }
    // In the opening, the first fork is the protagonist: the sentence so far and its fan are framed whole.
    const first = this.nodes[0]
    const span = first ? fx - first.x : 0
    const fan = 330
    const heroS = mobile
      ? base * 0.86
      : Math.min(base * 1.32, (W * 0.84) / Math.max(1, span + fan))
    const heroAx = mobile ? W - heroS * fan - 12 : W * 0.08 + heroS * span
    const k = smooth(hero)
    const follow: Camera = {
      fx,
      fy,
      s: lerp(base, heroS, k),
      ax: lerp(W * (mobile ? 0.3 : 0.44), heroAx, k),
      // Keep the opening fan clear of the instruments on short screens.
      ay: lerp(H * (mobile ? 0.42 : 0.44), mobile ? H * 0.53 : Math.min(H * 0.64, H - 250), k),
    }

    let target = follow
    let f = 0
    let fit: Camera | null = null
    this.scapeZoom = 1
    if (q.finaleU > 0) {
      // The climax: lean in on the last word, then pull far back — the river becomes one stream
      // in a landscape written with everything it did not say.
      const inK = easeInOut(ramp(q.finaleU, 0, 0.12))
      const outK = easeInOut(ramp(q.finaleU, 0.14, 0.58))
      const r: Rect = mobile
        ? { x: W * 0.05, y: H * 0.08, w: W * 0.9, h: H * 0.38 }
        : { x: W * 0.04, y: H * 0.1, w: W * 0.5, h: H * 0.8 }
      const far = this.fitCam(this.bounds(this.nodes, true), r, 0.9)
      const close: Camera = { fx, fy, s: base * 1.9, ax: W * 0.5, ay: H * 0.5 }
      const mix = (a: Camera, b: Camera, t: number): Camera => ({
        fx: lerp(a.fx, b.fx, t),
        fy: lerp(a.fy, b.fy, t),
        s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)),
        ax: lerp(a.ax, b.ax, t),
        ay: lerp(a.ay, b.ay, t),
      })
      fit = mix(mix(follow, close, inK), far, outK)
      f = 1
      this.scapeZoom = lerp(lerp(1, 1.45, inK), 1, outK)
    } else if (q.titleChapter >= 1) {
      const u = q.titleU
      const key = q.titleChapter === 3 || q.titleChapter === 4
      f = easeInOut(ramp(u, 0.02, 0.28)) * (1 - easeInOut(ramp(u, 0.8, 0.98)))
      if (key) {
        // Frame the whole river so far, clear of the title card and the instruments.
        const r: Rect = mobile
          ? { x: W * 0.05, y: H * 0.4, w: W * 0.9, h: Math.max(120, H * 0.6 - 175) }
          : { x: W * 0.38, y: H * 0.13, w: W * 0.58, h: Math.max(160, H * 0.87 - 240) }
        fit = this.fitCam(this.bounds(this.nodes, true), r, 0.75)
      } else {
        // A breath between chapters: pull back a little.
        fit = { ...follow, s: base * 0.7, ax: W * (mobile ? 0.42 : 0.58) }
        f *= 0.9
      }
    }
    if (fit) {
      target = {
        fx: lerp(follow.fx, fit.fx, f),
        fy: lerp(follow.fy, fit.fy, f),
        s: Math.exp(lerp(Math.log(follow.s), Math.log(fit.s), f)),
        ax: lerp(follow.ax, fit.ax, f),
        ay: lerp(follow.ay, fit.ay, f),
      }
    }

    const c = this.cam
    if (!this.camInit || this.rm) {
      Object.assign(c, target)
      this.camInit = true
      return
    }
    // Scale and anchor move faster than position, so zooms feel deliberate rather than floaty.
    c.fx = approach(c.fx, target.fx, 3.4, dt)
    c.fy = approach(c.fy, target.fy, 3.4, dt)
    c.s = approach(c.s, target.s, 4.2, dt)
    c.ax = approach(c.ax, target.ax, 4.2, dt)
    c.ay = approach(c.ay, target.ay, 4.2, dt)
    // Settle exactly once imperceptibly close, so static frames can reuse cached layers.
    if (
      Math.abs(c.fx - target.fx) < 0.02 &&
      Math.abs(c.fy - target.fy) < 0.02 &&
      Math.abs(c.s - target.s) < 0.00002 &&
      Math.abs(c.ax - target.ax) < 0.02 &&
      Math.abs(c.ay - target.ay) < 0.02
    ) {
      Object.assign(c, target)
    }
  }

  private draw(now: number) {
    const ctx = this.ctx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (!this.ready) return
    this.sprites.frame()
    this.backdrop?.frame(now, this.lastDt, { rich: this.rich, cam: this.cam, flow: this.flow, rm: this.rm })
    if (this.scape) {
      // The lens shows only away from the river's head, so it never fights the fork.
      const p = this.pointer
      const head = this.open ? this.toScreen(this.open.x, this.open.yc) : null
      const nearHead = head && Math.abs(p.sy - head.y) < 120 && p.sx > head.x - 260
      // A hidden layer: the lens only surfaces when the pointer rests on the landscape.
      if (Math.abs(window.scrollY - this.lensScrollY) > 0.5) this.lastScrollAt = now
      this.lensScrollY = window.scrollY
      const still = now - this.lastScrollAt > 700
      const resting = still && p.over && p.type === 'mouse' && now - p.lastMove > 450 && !nearHead && !this.hover
      this.lensA = approach(this.lensA, resting ? 1 : 0, resting ? 5 : 9, this.lastDt)
      if (resting) this.lensAt = { x: p.sx, y: p.sy }
      const lens = this.lensA > 0.02 ? { ...this.lensAt, a: this.lensA } : null
      const forks = this.nodes.filter((n) => n.fork).length
      const mine = this.nodes.filter((n) => n.mine).length
      this.scape.frame(now, this.lastDt, {
        rich: this.rich,
        cam: this.cam,
        rm: this.rm,
        flow: this.flow,
        pointer: lens,
        share: forks ? mine / forks : 0,
        mineCount: mine,
        zoom: this.scapeZoom,
        occluder: this.occluder,
      })
    }
    const scene: Scene = {
      nodes: this.nodes,
      open: this.open,
      fossils: this.fossils,
      cam: this.cam,
      W: this.W,
      H: this.H,
      dpr: this.dpr,
      now,
      rm: this.rm,
      heat: this.heat01(),
      keyboard: this.keyboard,
      order: this.open ? this.displayOrder(this.open) : [],
      wash: this.wash ? (now - this.wash.at) / 1150 : -1,
      windowFrom: this.windowFrom,
      stage: this.q.chapter,
      banks: this.banks,
      trail: this.q.passedTitle(3) || this.q.chapter > 3 ? this.trail : [],
      silt: this.silt,
      delta: this.delta.segs,
      deltaGrowth: this.rm ? (this.q.finaleU > 0 ? 1 : 0) : easeInOut(ramp(this.q.finaleU, 0.25, 0.85)),
      flora: this.flora,
      rich: this.rich,
      pointer: this.pointer.act > 0.2 ? { x: this.pointerWorldX(), y: this.pointerWorldY() } : null,
      wind: this.flow,
      textCache: this.textCache,
      sprites: this.sprites,
      version: this.version,
      windowAlpha: this.windowAlpha,
      hint: this.ready && this.open && this.open.g === this.timeline.leadCount && this.open.decided === null ? clamp(1 - window.scrollY / 120) : 0,
      finaleU: this.q.finaleU,
      bias: this.pointer.act,
    }
    renderScene(ctx, scene)
  }
}
