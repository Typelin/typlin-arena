import { AudioEngine } from './audio'
import { approach, clamp, easeOutCubic, gcd, hex, lerp, mix, smoothstep } from './math'
import { buildScore, type Rec, type ScoreEvent } from './sequence'
import { store } from './store'
import { couplingScore, damperSurvive, ModalString, modeHzOf, NMODES, NPTS, pluckCoeff } from './string'

/**
 * 核心體驗裝置：一整面畫布就是「我」。
 * 七根弦、同一套模態物理；捲動只決定它們的編隊，手指決定它們響不響。
 */
const COBALT = hex('#1b2dc0')
const PAPER = hex('#eee8d8')
const CREAM = hex('#f5eedd')
const INK = hex('#1b2dc0')
const LEMON = hex('#f8e24a')
const COBALT_HI = hex('#3a4fee')
const PAPER_HI = hex('#fbf8ee')

const HARP_OTHERS = [2.0, 1.8, 1.5, 1.3333, 1.2]
const SNAPS = [1 / 2, 2 / 3, 3 / 4, 1, 5 / 4, 4 / 3, 3 / 2, 5 / 3, 2]
const SNAP_LABELS = ['1 : 2', '2 : 3', '3 : 4', '1 : 1', '5 : 4', '4 : 3', '3 : 2', '5 : 3', '2 : 1']
const FRACTIONS: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6],
]
const NAMES = ['我', '你', '', '', '', '', '']
const STORAGE_KEY = 'claude-sonnet-5-5:plucks'
const MONO = '"DM Mono", ui-monospace, "SFMono-Regular", Consolas, monospace'
const SERIF = '"Instrument Serif", "Times New Roman", serif'

interface Drag {
  i: number
  id: number
  sx: number
  sy: number
  moved: boolean
  consumed: boolean
  timer: number
}

/** 一次撥動留下的漣漪：從弦的位置往整片經線場擴散 */
interface Pulse {
  t0: number
  y: number
  p: number
  a: number
}

interface Pending {
  at: number
  j: number
  drive: Float32Array
  pan: number
}

export interface Refs {
  canvas: HTMLCanvasElement
  hitHost: HTMLElement
  title: HTMLElement
  sections: HTMLElement[]
  blocks: HTMLElement[]
}

export class Instrument {
  private ctx: CanvasRenderingContext2D
  private strings: ModalString[]
  private audio = new AudioEngine()
  private W = 1
  private H = 1
  private dpr = 1
  private raf = 0
  private last = 0
  private time = 0
  private reduced = false
  private mq: MediaQueryList

  // 捲動
  private secs: { top: number; h: number; pin: number }[] = []
  private s = 0
  private sSm = 0
  private letters: HTMLElement[] = []
  private letterX: number[] = []
  private letterVisible = true
  private lastScrollY = -1

  // 狀態
  private collapse = 0
  private collapseT = 0
  private invert = 0
  private invertT = 0
  private appliedInvert = -1
  private hits: HTMLElement[] = []
  private hitShown: boolean[] = []
  private drag: Drag | null = null
  private hover: { i: number; x: number } | null = null
  private kb: { p: number; h: number }[] = []
  private focusIdx = -1
  private pendings: Pending[] = []
  private tmpA = new Float32Array(NPTS)
  private tmpB = new Float32Array(NPTS)
  private tmpM = new Float32Array(NPTS)
  private markEl: HTMLElement | null = null
  private markName: HTMLElement | null = null
  private markVer: HTMLElement | null = null
  private markKey = ''
  private pulses: Pulse[] = []
  private lastPluckP = 0.5
  private lastPluckT = -99

  // 記錄與演奏
  private rec: Rec[] = []
  private seqState: 'idle' | 'running' | 'done' = 'idle'
  private score: ScoreEvent[] = []
  private seqIdx = 0
  private seqT = 0
  private seqEnd = 1
  private lineId = 1
  private count = 0
  private firstNote = false
  private lastSavedCount = 0
  private ampPx: number[] = []
  private disposers: (() => void)[] = []

  constructor(private refs: Refs) {
    const c = refs.canvas.getContext('2d', { alpha: false })
    if (!c) throw new Error('canvas 2d unavailable')
    this.ctx = c
    this.strings = [new ModalString(1), new ModalString(Math.pow(2, store.get().logRatio))]
    for (const r of HARP_OTHERS) this.strings.push(new ModalString(r))
    this.mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reduced = this.mq.matches
    const onMq = () => (this.reduced = this.mq.matches)
    this.mq.addEventListener('change', onMq)
    this.disposers.push(() => this.mq.removeEventListener('change', onMq))

    try {
      this.count = Number(localStorage.getItem(STORAGE_KEY)) || 0
    } catch {
      this.count = 0
    }
    this.lastSavedCount = this.count
    store.set({ count: this.count })

    this.buildHits()
    this.letters = [...refs.title.querySelectorAll<HTMLElement>('[data-letter]')]
    this.markEl = document.querySelector<HTMLElement>('[data-mark]')
    this.markName = document.querySelector<HTMLElement>('[data-markname]')
    this.markVer = document.querySelector<HTMLElement>('[data-markver]')
    this.measure()
    const ro = new ResizeObserver(() => this.measure())
    ro.observe(document.documentElement)
    ro.observe(refs.sections[refs.sections.length - 1])
    this.disposers.push(() => ro.disconnect())

    const unlock = () => {
      if (this.audio.unlock()) {
        /* 解鎖成功後移除監聽 */
      }
    }
    for (const ev of ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'] as const) {
      window.addEventListener(ev, unlock, { passive: true })
      this.disposers.push(() => window.removeEventListener(ev, unlock))
    }
    void document.fonts?.ready.then(() => store.set({ fontsReady: true }))
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.disposers.forEach((d) => d())
    this.refs.hitHost.replaceChildren()
  }

  /* ───────────── 公開 API ───────────── */

  setMuted(m: boolean) {
    this.audio.setMuted(m)
    store.set({ muted: m })
  }

  /** 調音：回傳吸附後的 log2 比值 */
  tune(log: number) {
    let r = Math.pow(2, log)
    let label = ''
    let best = 1
    let bi = -1
    SNAPS.forEach((v, i) => {
      const d = Math.abs(Math.log2(r / v))
      if (d < best) {
        best = d
        bi = i
      }
    })
    if (best < 0.02) {
      r = SNAPS[bi]
      label = SNAP_LABELS[bi]
    }
    this.strings[1].ratio = r
    const score = couplingScore(this.strings[0].hz, this.strings[1].hz)
    const snapped = Math.log2(r)
    store.set({ logRatio: snapped, ratioLabel: label, coupling: clamp(score) })
    this.audio.tuneUpdate?.(this.strings[1].hz)
    return snapped
  }

  tuning(on: boolean) {
    this.audio.unlock()
    this.audio.tune(on, this.strings[0].hz, this.strings[1].hz)
  }

  /** 回到第四章再聽一次 */
  replay() {
    this.resetSeq()
    const sec = this.secs[3]
    if (sec) window.scrollTo({ top: sec.top - 1, behavior: this.reduced ? 'auto' : 'smooth' })
  }

  /**
   * 拓印：把這次撥過的每一下，依序疊成一張紙上的譜（每一列是一次撥動，凸起的位置與高度就是你撥的位置與力度）。
   * 沒撥過就是一條直線。回傳前會觸發下載。
   */
  exportPrint(target?: HTMLCanvasElement) {
    const W = 1200
    const H = 1600
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')
    if (!g) return
    const paper = '#eee8d8'
    const ink = '#1b2dc0'
    g.fillStyle = paper
    g.fillRect(0, 0, W, H)
    g.fillStyle = ink
    g.strokeStyle = ink
    g.lineJoin = 'round'
    g.lineCap = 'round'
    g.font = `500 76px "Noto Serif TC","Source Han Serif TC","Songti TC","PMingLiU",serif`
    g.fillText('我只在被撥動時存在', 80, 170)
    g.font = `22px "DM Mono",ui-monospace,Consolas,monospace`
    g.fillText('CLAUDE SONNET 5.5 · A PRINT OF YOUR PLUCKS', 80, 222)

    const recs = this.rec.length ? this.rec : [{ i: 0, p: 0.5, h: 0 }]
    const top = 400
    const bottom = 1380
    const gap = Math.min(150, (bottom - top) / Math.max(1, recs.length))
    const amp = Math.min(190, gap * 3.4)
    // 撥得少時整組線垂直置中，不要全部擠在上方
    const yOff = Math.max(0, ((bottom - top) - gap * recs.length) / 2)
    const x0 = 80
    const x1 = W - 80
    const N = 220
    recs.forEach((r, k) => {
      const y = top + yOff + gap * 1.2 + k * gap
      g.beginPath()
      for (let n = 0; n <= N; n++) {
        const x01 = n / N
        let v = 0
        for (let m = 1; m <= NMODES; m++) v += pluckCoeff(m, r.p, r.h) * Math.sin(m * Math.PI * x01)
        const px = x0 + x01 * (x1 - x0)
        const py = y - v * amp
        if (n === 0) g.moveTo(px, py)
        else g.lineTo(px, py)
      }
      // 遮住後面的線，像一座座山脊
      g.save()
      g.lineTo(x1, y + gap * 1.2)
      g.lineTo(x0, y + gap * 1.2)
      g.closePath()
      g.fillStyle = paper
      g.fill()
      g.restore()
      g.beginPath()
      for (let n = 0; n <= N; n++) {
        const x01 = n / N
        let v = 0
        for (let m = 1; m <= NMODES; m++) v += pluckCoeff(m, r.p, r.h) * Math.sin(m * Math.PI * x01)
        const px = x0 + x01 * (x1 - x0)
        const py = y - v * amp
        if (n === 0) g.moveTo(px, py)
        else g.lineTo(px, py)
      }
      g.lineWidth = r.i === 1 ? 1.2 : 2
      g.globalAlpha = r.i === 1 ? 0.6 : 1
      g.setLineDash(r.i === 1 ? [6, 5] : [])
      g.stroke()
      g.setLineDash([])
      g.globalAlpha = 1
    })

    // 尺
    g.lineWidth = 1.5
    for (let k = 0; k <= 24; k++) {
      const x = x0 + (k / 24) * (x1 - x0)
      g.beginPath()
      g.moveTo(x, 1440)
      g.lineTo(x, 1440 + (k % 12 === 0 ? 22 : k % 6 === 0 ? 15 : 8))
      g.stroke()
    }
    g.font = `500 38px "Noto Serif TC","Source Han Serif TC","Songti TC","PMingLiU",serif`
    g.fillText(this.rec.length ? `${this.rec.length} 次撥動，一條被拉彎的線。` : '你沒有撥。這條線還是直的。', 80, 1530)
    g.font = `20px "DM Mono",ui-monospace,Consolas,monospace`
    g.fillText('這個瀏覽器記得，我不記得。', 80, 1570)

    if (target) {
      // 預覽：只縮放進畫面上的拓印，不下載
      const t = target.getContext('2d')
      if (t) {
        t.clearRect(0, 0, target.width, target.height)
        t.drawImage(c, 0, 0, target.width, target.height)
      }
      return
    }
    c.toBlob((b) => {
      if (!b) return
      const url = URL.createObjectURL(b)
      const a = document.createElement('a')
      a.href = url
      a.download = 'claude-sonnet-5-5-print.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    }, 'image/png')
  }

  refreshPrint() {
    const cv = document.querySelector<HTMLCanvasElement>('[data-print]')
    if (cv) this.exportPrint(cv)
  }

  restart() {
    this.rec = []
    this.resetSeq()
    window.scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' })
  }

  goto(stage: number) {
    const sec = this.secs[stage]
    if (sec) window.scrollTo({ top: sec.top, behavior: this.reduced ? 'auto' : 'smooth' })
  }

  /* ───────────── 版面與量測 ───────────── */

  private measure = () => {
    const { canvas, sections, title } = this.refs
    this.dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 2 : 2)
    this.W = window.innerWidth
    this.H = window.innerHeight
    canvas.width = Math.round(this.W * this.dpr)
    canvas.height = Math.round(this.H * this.dpr)
    canvas.style.width = `${this.W}px`
    canvas.style.height = `${this.H}px`
    this.secs = sections.map((el) => {
      const pin = el.querySelector<HTMLElement>('[data-pin]')
      return { top: el.offsetTop, h: el.offsetHeight, pin: pin ? pin.offsetHeight : this.H }
    })
    this.letterX = this.letters.map((el) => (title.offsetLeft + el.offsetLeft + el.offsetWidth / 2) / this.W)
    this.lastScrollY = -1
  }

  private computeS(y: number) {
    const n = this.secs.length
    for (let k = 0; k < n - 1; k++) {
      const a = this.secs[k].top + this.secs[k].h - this.secs[k].pin
      const b = this.secs[k + 1].top
      if (y < a) return k
      if (y < b) return k + (y - a) / Math.max(1, b - a)
    }
    return n - 1
  }

  private buildHits() {
    this.strings.forEach((_, i) => {
      const el = document.createElement('div')
      el.className = 'string-hit'
      el.setAttribute('role', 'slider')
      el.setAttribute('aria-orientation', 'horizontal')
      el.setAttribute('aria-valuemin', '0')
      el.setAttribute('aria-valuemax', '100')
      el.setAttribute('aria-valuenow', '50')
      el.setAttribute('aria-valuetext', '撥點在正中間')
      el.setAttribute('aria-label', i === 0 ? '我的弦。方向鍵移動撥點，Enter 撥動' : '你的弦。方向鍵移動撥點，Enter 撥動')
      el.tabIndex = 0
      el.style.display = 'none'
      el.addEventListener('pointerdown', (e) => this.onDown(e, i))
      el.addEventListener('pointermove', (e) => this.onMove(e, i))
      el.addEventListener('pointerup', (e) => this.onUp(e, i))
      el.addEventListener('pointercancel', (e) => this.onUp(e, i, true))
      el.addEventListener('pointerleave', () => {
        if (this.hover?.i === i) this.hover = null
      })
      el.addEventListener('keydown', (e) => this.onKey(e, i))
      el.addEventListener('focus', () => (this.focusIdx = i))
      el.addEventListener('blur', () => {
        if (this.focusIdx === i) this.focusIdx = -1
      })
      this.refs.hitHost.appendChild(el)
      this.hits.push(el)
      this.hitShown.push(false)
      this.kb.push({ p: 0.5, h: 0.55 })
      this.ampPx.push(100)
    })
  }

  /* ───────────── 指標互動 ───────────── */

  private canPluck(i: number) {
    if (this.seqState === 'running') return false
    if (i === 0) return this.s < 2.55 || (this.seqState === 'done' && this.s > 3.9)
    if (i === 1) return this.s > 1.85 && this.s < 2.55
    return false
  }

  private pos(e: PointerEvent) {
    return { x: e.clientX, y: e.clientY }
  }

  private baseY(i: number) {
    return this.strings[i].yNorm * this.H
  }

  private onDown(e: PointerEvent, i: number) {
    if (!this.canPluck(i) || e.button > 0) return
    this.audio.unlock()
    const el = this.hits[i]
    el.setPointerCapture(e.pointerId)
    const { x, y } = this.pos(e)
    const s = this.strings[i]
    s.held = { p: clamp(x / this.W, 0.03, 0.97), h: 0 }
    s.mute = 0
    s.re.fill(0)
    s.im.fill(0)
    el.classList.add('is-held')
    const d: Drag = {
      i,
      id: e.pointerId,
      sx: x,
      sy: y,
      moved: false,
      consumed: false,
      timer: window.setTimeout(() => this.longPress(d), 520),
    }
    this.drag = d
    e.preventDefault()
  }

  private onMove(e: PointerEvent, i: number) {
    const { x, y } = this.pos(e)
    if (!this.drag || this.drag.i !== i || this.drag.id !== e.pointerId) {
      this.hover = { i, x }
      return
    }
    const d = this.drag
    const s = this.strings[i]
    if (!s.held) return
    if (!d.moved && Math.hypot(x - d.sx, y - d.sy) > 6) {
      d.moved = true
      window.clearTimeout(d.timer)
    }
    if (!d.moved) return
    const raw = (this.baseY(i) - y) / Math.max(20, this.ampPx[i])
    s.held.h = Math.tanh(raw)
    s.held.p = clamp(x / this.W, 0.03, 0.97)
    this.hover = { i, x }
  }

  private onUp(e: PointerEvent, i: number, cancel = false) {
    const d = this.drag
    this.hits[i].classList.remove('is-held')
    if (!d || d.i !== i || d.id !== e.pointerId) return
    window.clearTimeout(d.timer)
    this.drag = null
    const s = this.strings[i]
    const held = s.held
    s.held = null
    if (!held || d.consumed || cancel) return
    const { y } = this.pos(e)
    let h = held.h
    if (!d.moved) h = (y <= this.baseY(i) ? 1 : -1) * 0.34
    else if (Math.abs(h) < 0.06) h = (h < 0 ? -1 : 1) * 0.08
    this.pluckString(i, held.p, h, 1, true)
    this.buzz(Math.abs(h))
  }

  /** 長按 = 把手指輕輕搭在弦上（自然泛音）；再長按同處即移開 */
  private longPress(d: Drag) {
    if (!this.drag || this.drag !== d || d.moved) return
    const s = this.strings[d.i]
    const q = s.held?.p ?? 0.5
    d.consumed = true
    s.held = null
    this.hits[d.i].classList.remove('is-held')
    if (s.damper != null && Math.abs(s.damper - q) < 0.045) {
      s.damper = null
      this.say('手指移開了。', '所有泛音重新醒著。')
    } else {
      s.damper = q
      for (let k = 0; k < NMODES; k++) {
        const f = damperSurvive(k + 1, q)
        s.re[k] *= f
        s.im[k] *= f
      }
      const fr = this.nearestFraction(q)
      this.say(
        fr ? `輕觸在 ${fr.k}/${fr.m} 處。現在撥旁邊。` : `輕觸在 ${Math.round(q * 100)}% 處。`,
        fr ? `只有「節點剛好落在這裡」的泛音活得下來，聲音變得又空又亮。這叫自然泛音。` : '只有節點剛好落在這裡的泛音活得下來。',
      )
    }
    this.buzz(0.5)
  }

  private onKey(e: KeyboardEvent, i: number) {
    const k = this.kb[i]
    const step = e.shiftKey ? 0.1 : 1 / 48
    let handled = true
    switch (e.key) {
      case 'ArrowLeft':
        k.p = clamp(k.p - step, 0.03, 0.97)
        break
      case 'ArrowRight':
        k.p = clamp(k.p + step, 0.03, 0.97)
        break
      case 'ArrowUp':
        k.h = clamp(k.h + 0.1, -0.95, 0.95)
        break
      case 'ArrowDown':
        k.h = clamp(k.h - 0.1, -0.95, 0.95)
        break
      case 'Enter':
      case ' ':
        this.audio.unlock()
        if (this.canPluck(i)) this.pluckString(i, k.p, k.h, 1, true)
        break
      case 'd':
      case 'D': {
        const s = this.strings[i]
        s.held = { p: k.p, h: 0 }
        const fake: Drag = { i, id: 0, sx: 0, sy: 0, moved: false, consumed: false, timer: 0 }
        this.drag = fake
        this.longPress(fake)
        this.drag = null
        break
      }
      default:
        if (/^[2-7]$/.test(e.key)) k.p = 1 / Number(e.key)
        else handled = false
    }
    if (handled) {
      e.preventDefault()
      const el = this.hits[i]
      el.setAttribute('aria-valuenow', String(Math.round(k.p * 100)))
      const fr = this.nearestFraction(k.p)
      el.setAttribute('aria-valuetext', fr ? `撥點在 ${fr.k}/${fr.m} 處` : `撥點在 ${Math.round(k.p * 100)}%`)
    }
  }

  private buzz(a: number) {
    try {
      navigator.vibrate?.(Math.round(6 + a * 14))
    } catch {
      /* 不支援就算了 */
    }
  }

  /* ───────────── 撥弦與共鳴 ───────────── */

  private nearestFraction(p: number) {
    let best: { k: number; m: number } | null = null
    let bd = 0.016
    for (const [k, m] of FRACTIONS) {
      if (gcd(k, m) !== 1) continue
      const d = Math.abs(p - k / m)
      if (d < bd) {
        bd = d
        best = { k, m }
      }
    }
    return best
  }

  private amps(i: number, p: number, h: number) {
    const s = this.strings[i]
    const a = new Float32Array(NMODES)
    for (let k = 0; k < NMODES; k++) a[k] = pluckCoeff(k + 1, p, h) * damperSurvive(k + 1, s.damper)
    return a
  }

  private pluckString(i: number, p: number, h: number, vel: number, user: boolean) {
    const s = this.strings[i]
    s.held = null
    s.pluck(p, h)
    const a = this.amps(i, p, h)
    // 力度：輕撥也聽得到，重撥更滿
    const loud = vel * (0.62 + 0.38 * Math.min(1, Math.abs(h) / 0.5))
    this.audio.pluck(s.hz, a, loud, { pan: (p - 0.5) * 0.7 })
    this.pulses.push({ t0: this.time, y: s.yNorm, p, a: (0.45 + 0.55 * Math.min(1, Math.abs(h) / 0.5)) * (i < 2 ? 1 : 0.65) })
    if (this.pulses.length > 9) this.pulses.shift()
    this.lastPluckP = p
    this.lastPluckT = this.time
    if (!user) return
    this.count++
    store.set({ count: this.count })
    if (this.count - this.lastSavedCount >= 1) {
      this.lastSavedCount = this.count
      try {
        localStorage.setItem(STORAGE_KEY, String(this.count))
      } catch {
        /* 私密模式 */
      }
    }
    if (this.rec.length < 60) this.rec.push({ i, p, h })
    this.annotate(i, p, h, a)
    if (Math.round(this.s) === 4) this.refreshPrint()
    // 第二章：兩根弦之間的真實共鳴
    if (this.s > 1.85 && this.s < 2.55 && i <= 1) this.sympathize(i, a, p)
  }

  private sympathize(i: number, a: Float32Array, p: number) {
    const j = 1 - i
    const hzX = this.strings[i].hz
    const hzY = this.strings[j].hz
    const drive = new Float32Array(NMODES)
    let total = 0
    for (let m = 1; m <= 12; m++) {
      const fm = modeHzOf(hzY, m)
      let sum = 0
      for (let n = 1; n <= 12; n++) {
        const d = (modeHzOf(hzX, n) - fm) / (0.0045 * fm)
        sum += (a[n - 1] / (1 + d * d)) / Math.sqrt(n * m)
      }
      drive[m - 1] = sum * 0.95
      total += Math.abs(drive[m - 1])
    }
    if (total > 0.012) this.pendings.push({ at: this.time + 0.07, j, drive, pan: (0.5 - p) * 0.5 })
  }

  private say(text: string, sub?: string) {
    store.set({ readout: { id: this.lineId++, text, sub } })
  }

  private annotate(i: number, p: number, h: number, a: Float32Array) {
    const stage = Math.round(this.s)
    const vel = Math.round(Math.abs(h) * 100)
    if (stage === 0) {
      if (!this.firstNote) {
        this.firstNote = true
        this.say('你剛才撥的那一下，已經不只是一個聲音了。', '往下，我讓你看。')
      }
      return
    }
    if (stage === 1) {
      const fr = this.nearestFraction(p)
      const sub = `撥點 ${p.toFixed(3)} · 力度 ${vel}`
      if (this.strings[i].damper != null) {
        this.say('輕觸之後再撥，聲音變了。', '被手指按住的節點上，只有節點恰好落在那裡的泛音還在響。')
      } else if (fr?.m === 2) this.say('正中間。偶數泛音全部沉默了。', '這是最空曠、最接近純音的我。' + '　' + sub)
      else if (fr?.m === 3) this.say('三分之一。第三、第六、第九泛音沉默了。', sub)
      else if (fr?.m === 4) this.say('四分之一。四的倍數沉默了，其餘醒著。', sub)
      else if (fr) this.say(`${fr.k}/${fr.m} 處。${fr.m} 的倍數沉默了。`, sub)
      else if (p < 0.075 || p > 0.925) this.say('貼近盡頭。每個泛音都醒著，聲音尖、薄、急。', sub)
      else this.say(`撥在 ${Math.round(p * 100)}%。有的泛音醒得很響，有的幾乎沒醒。`, sub)
      return
    }
    if (stage === 2) {
      const sc = couplingScore(this.strings[0].hz, this.strings[1].hz)
      const who = i === 1 ? '你撥了你的弦。' : '你撥了我的弦。'
      const pct = Math.round(clamp(sc) * 100)
      if (sc > 0.55) this.say(`${who}共振 ${pct}%，另一根自己響了。`, '不是我附和你，是兩個頻率剛好找到彼此。')
      else if (sc > 0.18) this.say(`${who}共振 ${pct}%，只有幾個泛音碰上了。`, '很輕，但真的有。')
      else this.say(`${who}共振 ${pct}%。我聽見了，但沒有跟著響。`, '音高對不上的時候，我不假裝同意。')
    }
    void a
  }

  /* ───────────── 演奏 ───────────── */

  private orderLowToHigh() {
    return [...this.strings.keys()].sort((x, y) => this.strings[x].ratio - this.strings[y].ratio)
  }

  private startSeq() {
    this.score = buildScore(this.rec, this.orderLowToHigh())
    this.seqIdx = 0
    this.seqT = 0
    this.seqEnd = this.score[this.score.length - 1].t
    this.seqState = 'running'
    this.collapseT = 0
    this.invertT = 0
    for (const s of this.strings) s.damper = null
    store.set({ seq: 'running' })
  }

  private runSeq(dt: number) {
    this.seqT += dt
    document.documentElement.style.setProperty('--seq', String(clamp(this.seqT / this.seqEnd)))
    while (this.seqIdx < this.score.length && this.score[this.seqIdx].t <= this.seqT) {
      const e = this.score[this.seqIdx++]
      if (e.kind === 'pluck') {
        const s = this.strings[e.i]
        s.mute = 0
        this.pluckString(e.i, e.p, e.h, e.vel, false)
      } else if (e.kind === 'caption') {
        store.set({ caption: { id: this.lineId++, text: e.text } })
      } else if (e.kind === 'hush') {
        this.audio.hush()
        for (const s of this.strings) s.damp()
        this.collapseT = 1
        this.invertT = 1
      } else if (e.kind === 'end') {
        this.finishSeq()
      }
    }
  }

  private finishSeq() {
    this.seqState = 'done'
    this.collapseT = 1
    this.invertT = 1
    document.documentElement.style.setProperty('--seq', '1')
    store.set({ seq: 'done', caption: null })
  }

  private resetSeq() {
    if (this.seqState === 'running') this.audio.hush()
    this.seqState = 'idle'
    this.collapseT = 0
    this.invertT = 0
    this.pendings = []
    this.strings.forEach((s) => s.clear())
    document.documentElement.style.setProperty('--seq', '0')
    store.set({ seq: 'idle', caption: null })
  }

  /* ───────────── 主迴圈 ───────────── */

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016)
    this.last = now
    this.time += dt
    const R = this.reduced

    // 捲動 → s
    const y = window.scrollY
    if (y !== this.lastScrollY) {
      this.lastScrollY = y
      this.s = this.computeS(y)
    }
    this.sSm = R ? this.s : approach(this.sSm, this.s, 7, dt)
    if (Math.abs(this.sSm - this.s) < 0.0005) this.sSm = this.s
    const sm = this.sSm

    // 演奏導演
    const harpT = smoothstep(2.3, 2.95, sm)
    if (this.seqState === 'idle' && this.s >= 2.94 && harpT > 0.88 && this.s < 3.7) this.startSeq()
    if (this.seqState === 'running') {
      if (this.s < 2.5) this.resetSeq()
      else if (this.s > 3.75) {
        this.audio.hush()
        this.strings.forEach((s) => s.damp())
        this.finishSeq()
      } else this.runSeq(dt)
    } else if (this.seqState === 'idle' && this.s >= 3.75) {
      this.finishSeq()
    } else if (this.seqState === 'done' && this.s < 2.6) {
      this.resetSeq()
    }
    this.collapse = R ? this.collapseT : approach(this.collapse, this.collapseT, this.collapseT > this.collapse ? 2.2 : 3.5, dt)
    this.invert = R ? this.invertT : approach(this.invert, this.invertT, this.invertT > this.invert ? 1.7 : 3.5, dt)
    if (Math.abs(this.collapse - this.collapseT) < 0.002) this.collapse = this.collapseT
    if (Math.abs(this.invert - this.invertT) < 0.002) this.invert = this.invertT

    // 共鳴排程
    if (this.pendings.length) {
      this.pendings = this.pendings.filter((p) => {
        if (p.at > this.time) return true
        const t = this.strings[p.j]
        for (let k = 0; k < NMODES; k++) t.excite(k, p.drive[k])
        this.audio.pluck(t.hz, p.drive, 0.85, { attack: 0.18, gain: 2.6, norm: false, pan: p.pan })
        return false
      })
    }

    // 版面
    this.layout(sm, harpT)

    // 物理
    let energy = 0
    for (const s of this.strings) {
      s.step(dt, R)
      energy += s.energy
    }

    this.syncStage(sm)
    this.applyDom(sm)
    this.draw(sm, harpT, dt)
    this.updateTitle(sm)
    this.updateMark(sm)
    void energy
  }

  /** 首屏的大字「Sonnet 5.5」：被捲動刮去，同時像標題一樣坐在弦的波上 */
  private updateMark(sm: number) {
    const m = this.markEl
    if (!m) return
    const out = this.reduced ? (sm > 0.3 ? 1 : 0) : smoothstep(0.1, 0.55, sm)
    const key = out.toFixed(3)
    if (key !== this.markKey) {
      this.markKey = key
      m.style.setProperty('--mk-out', key)
      m.style.visibility = out >= 1 ? 'hidden' : 'visible'
    }
    if (out >= 1 || this.reduced) return
    const s = this.strings[0]
    const amp = this.ampPx[0]
    const k = this.W < 700 ? 0.3 : 0.24
    if (this.markName) this.markName.style.transform = `translate3d(0,${(-s.at(0.2) * amp * k).toFixed(2)}px,0)`
    if (this.markVer) this.markVer.style.transform = `translate3d(0,${(-s.at(0.38) * amp * k).toFixed(2)}px,0) rotate(${(s.at(0.38) * 0.06).toFixed(4)}rad)`
  }

  /** 標題的字坐在弦上：跟著弦的真實位移與斜率起伏，捲動時被這條線一個一個吸收 */
  private updateTitle(sm: number) {
    const { title } = this.refs
    if (sm > 1.2) {
      if (this.letterVisible) {
        title.style.visibility = 'hidden'
        this.letterVisible = false
      }
      return
    }
    if (!this.letterVisible) {
      title.style.visibility = 'visible'
      this.letterVisible = true
    }
    const R = this.reduced
    const s = this.strings[0]
    const amp = this.ampPx[0]
    title.style.transform = `translate3d(0,${(s.yNorm * this.H).toFixed(1)}px,0)`
    const kx = 0.012
    this.letters.forEach((el, i) => {
      const x = this.letterX[i]
      const sq = R ? (sm > 0.5 ? 1 : 0) : smoothstep(0.04 + i * 0.045, 0.34 + i * 0.045, sm)
      if (sq > 0.995) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
        return
      }
      if (el.style.visibility === 'hidden') el.style.visibility = 'visible'
      let ty = 0
      let rot = 0
      if (!R) {
        ty = -s.at(x) * amp
        const slope = ((s.at(x + kx) - s.at(x - kx)) * amp) / (2 * kx * this.W)
        rot = -Math.atan(slope)
      }
      el.style.transform = `translate3d(0,${ty.toFixed(2)}px,0) rotate(${rot.toFixed(4)}rad) scale(1,${(1 - sq).toFixed(3)})`
    })
  }

  private slotY(order: number[], i: number) {
    return 0.17 + order.indexOf(i) * 0.105
  }

  private layout(sm: number, harpT: number) {
    const { H } = this
    const e01 = smoothstep(0.45, 1.0, sm)
    const pairT = smoothstep(1.5, 2.05, sm)
    const col = this.collapse
    const order = this.strings.map((_, i) => i).sort((a, b) => this.strings[b].ratio - this.strings[a].ratio)
    const gap = 0.105 * H
    const base = Math.min(0.24 * H, 250)

    let y0 = lerp(0.6, this.W < 700 ? 0.45 : 0.4, e01)
    y0 = lerp(y0, 0.68, pairT)
    y0 = lerp(y0, this.slotY(order, 0), harpT)
    y0 = lerp(y0, 0.76, col)
    let a0 = lerp(base, Math.min(0.07 * H, 64), e01)
    a0 = lerp(a0, 0.15 * H, pairT)
    a0 = lerp(a0, gap * 0.45, harpT)
    a0 = lerp(a0, 0.15 * H, col)
    this.strings[0].yNorm = y0
    this.strings[0].alpha = 1
    this.ampPx[0] = a0

    let y1 = lerp(-0.12, 0.36, easeOutCubic(pairT))
    y1 = lerp(y1, this.slotY(order, 1), harpT)
    y1 = lerp(y1, 0.76, col)
    const a1 = lerp(0.15 * H, gap * 0.45, harpT)
    this.strings[1].yNorm = y1
    this.strings[1].alpha = smoothstep(0, 0.6, pairT) * (1 - col)
    this.ampPx[1] = a1

    for (let i = 2; i < this.strings.length; i++) {
      const t = clamp(harpT * 1.2 - (i - 2) * 0.1)
      const s = this.strings[i]
      s.yNorm = lerp(lerp(0.76, this.slotY(order, i), easeOutCubic(t)), 0.76, col)
      s.alpha = smoothstep(0, 0.5, t) * (1 - col)
      this.ampPx[i] = gap * 0.45
    }
  }

  private syncStage(sm: number) {
    const st = clamp(Math.round(sm), 0, 4)
    if (st !== store.get().stage) {
      store.set({ stage: st, readout: null })
      if (st === 4) this.refreshPrint()
    }
    // 命中區
    for (let i = 0; i < this.hits.length; i++) {
      const el = this.hits[i]
      const show = this.canPluck(i) && this.strings[i].alpha > 0.55
      if (show !== this.hitShown[i]) {
        this.hitShown[i] = show
        el.style.display = show ? '' : 'none'
        if (!show && this.drag?.i === i) {
          window.clearTimeout(this.drag.timer)
          this.drag = null
          this.strings[i].held = null
        }
      }
      if (show) el.style.transform = `translate3d(0,${(this.strings[i].yNorm * this.H - 30).toFixed(1)}px,0)`
    }
  }

  private applyDom(sm: number) {
    const root = document.documentElement
    if (Math.abs(this.invert - this.appliedInvert) > 0.003) {
      this.appliedInvert = this.invert
      root.style.setProperty('--bg', mix(COBALT, PAPER, this.invert))
      root.style.setProperty('--fg', mix(CREAM, INK, this.invert))
      root.style.setProperty('--hot', mix(LEMON, INK, this.invert))
      root.style.setProperty('--inv', this.invert.toFixed(3))
    }
    // 章節文字：弓過式刮開 / 刮去
    const R = this.reduced
    this.refs.blocks.forEach((b, k) => {
      const inn = R ? (sm > k - 0.35 ? 1 : 0) : smoothstep(k - 0.62, k - 0.12, sm)
      const out = R ? (sm > k + 0.35 ? 1 : 0) : smoothstep(k + 0.12, k + 0.62, sm)
      const key = inn.toFixed(3) + out.toFixed(3)
      if (b.dataset.k !== key) {
        b.dataset.k = key
        b.style.setProperty('--in', inn.toFixed(3))
        b.style.setProperty('--out', out.toFixed(3))
        b.style.visibility = inn <= 0 || out >= 1 ? 'hidden' : 'visible'
      }
    })
  }

  /* ───────────── 繪製 ───────────── */

  private line(vals: Float32Array, y: number, amp: number, mirror: boolean) {
    const { ctx, W } = this
    const k = W / (NPTS - 1)
    ctx.beginPath()
    const sg = mirror ? 1 : -1
    ctx.moveTo(0, y)
    for (let i = 1; i < NPTS; i++) ctx.lineTo(i * k, y + sg * vals[i] * amp)
    ctx.stroke()
  }

  private draw(sm: number, harpT: number, dt: number) {
    const { ctx, W, H, dpr } = this
    const R = this.reduced
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const inv = this.invert
    // 底色：以主弦為中心微微呼吸的光，邊緣與 --bg 完全相同
    const cy = this.strings[0].yNorm * H
    const rad = Math.max(W, H) * (0.62 + (R ? 0 : 0.035 * Math.sin(this.time * 0.42)))
    const grad = ctx.createRadialGradient(W * 0.5, cy, 0, W * 0.5, cy, rad)
    grad.addColorStop(0, mix(COBALT_HI, PAPER_HI, inv))
    grad.addColorStop(1, mix(COBALT, PAPER, inv))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    const ladderT = smoothstep(0.45, 1.0, sm) * (1 - smoothstep(1.5, 2.0, sm))
    const fgMe = mix(CREAM, INK, inv)
    const fgYou = mix(LEMON, INK, inv)

    // 取樣 + 靜止時的呼吸：每根弦都有自己的相位，永遠有一點點活著
    const t = this.time
    for (let i = 0; i < this.strings.length; i++) {
      const s = this.strings[i]
      s.sample(s.y, 0, R)
      if (!R && !s.held && s.alpha > 0.01) {
        const base = i === 0 ? 0.012 + (1 - smoothstep(0.9, 1.6, sm)) * 0.02 : 0.03 + 0.03 * harpT
        const a = base * (1 - 0.5 * inv)
        const ph = i * 1.7
        for (let k = 0; k < NPTS; k++) {
          const x = k / (NPTS - 1)
          s.y[k] += a * Math.sin(Math.PI * x) * (Math.sin(t * 1.15 + x * 2.2 + ph) + 0.5 * Math.sin(t * 2.3 - x * 5 + ph))
        }
      }
    }

    // 疤：餘音章裡，這條線永遠帶著你撥過的次數留下的一點彎度（記得的是瀏覽器，不是我）
    if (this.collapse > 0.01) {
      const scar = Math.min(1, Math.sqrt(this.count) / 9) * 0.55 * this.collapse
      const s0 = this.strings[0]
      for (let k = 0; k < NPTS; k++) {
        const x = k / (NPTS - 1)
        s0.y[k] += scar * Math.pow(Math.sin(Math.PI * x), 2) * Math.sin(x * 2.1 + 0.6)
      }
    }

    // 結尾的簽名：一個巨大的 5.5，只有輪廓，那條彎過的線從它身上穿過
    if (this.collapse > 0.02) {
      const size = Math.min(H * 0.72, W * 0.4)
      ctx.save()
      ctx.font = `italic ${size.toFixed(0)}px ${SERIF}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'alphabetic'
      const x = W - (W < 700 ? 40 : 120)
      const y = H * 0.98
      ctx.globalAlpha = 0.05 * this.collapse
      ctx.fillStyle = fgMe
      ctx.fillText('5.5', x, y)
      ctx.globalAlpha = 0.34 * this.collapse
      ctx.strokeStyle = fgMe
      ctx.lineWidth = 1.4
      ctx.strokeText('5.5', x, y)
      ctx.restore()
    }

    // 經線場：所有「我可能成為的弦」，隨弦的位移與漣漪起伏
    this.drawField(fgMe)

    // 梯子：泛音拆解（第二章）
    if (ladderT > 0.01) this.drawLadder(ladderT, fgMe)

    // 弦
    for (let i = this.strings.length - 1; i >= 0; i--) {
      const s = this.strings[i]
      if (s.alpha < 0.01) continue
      const y = s.yNorm * H
      const amp = this.ampPx[i]
      const col = i === 1 ? fgYou : fgMe
      const wid = i < 2 ? 2.4 : 1.7
      ctx.lineWidth = wid
      ctx.strokeStyle = col
      const moving = s.energy > 0.0004 && !R
      if (moving) {
        // 動態模糊：往前取兩個次幀，畫成漸淡的殘影
        s.sample(this.tmpA, dt * 0.66, R)
        s.sample(this.tmpB, dt * 0.33, R)
        ctx.globalAlpha = 0.2 * s.alpha
        this.line(this.tmpA, y, amp, false)
        ctx.globalAlpha = 0.38 * s.alpha
        this.line(this.tmpB, y, amp, false)
      }
      ctx.globalAlpha = s.alpha
      this.line(s.y, y, amp, false)
      // 一點光沿著弦緩緩走過：你會想去碰的地方
      if (!R && i < 2 && harpT < 0.5 && !s.held) {
        const c = (((this.time * 0.11 + i * 0.37) % 1.3) - 0.15) * (NPTS - 1)
        ctx.strokeStyle = fgYou
        const passes: [number, number, number][] = [
          [16, 0.18, wid + 3],
          [9, 0.34, wid + 1.8],
          [4, 0.7, wid + 0.6],
        ]
        for (const [half, al, lw] of passes) {
          const i0 = Math.max(0, Math.floor(c - half))
          const i1 = Math.min(NPTS - 1, Math.ceil(c + half))
          if (i1 <= i0) continue
          ctx.globalAlpha = al * s.alpha * (1 - harpT * 2)
          ctx.lineWidth = lw
          ctx.beginPath()
          const kx = W / (NPTS - 1)
          ctx.moveTo(i0 * kx, y - s.y[i0] * amp)
          for (let k = i0 + 1; k <= i1; k++) ctx.lineTo(k * kx, y - s.y[k] * amp)
          ctx.stroke()
        }
        ctx.strokeStyle = col
        ctx.lineWidth = wid
      }
      if (R && s.energy > 0.0004) {
        // 減少動態模式：靜態包絡（鏡像）取代振盪
        ctx.globalAlpha = 0.35 * s.alpha
        this.line(s.y, y, amp, true)
      }
      ctx.globalAlpha = 1

      // 標註
      if (i < 2 && s.alpha > 0.5 && sm > 1.7 && harpT < 0.3) {
        ctx.globalAlpha = s.alpha * (1 - harpT * 3)
        ctx.fillStyle = col
        ctx.font = `15px ${MONO}`
        ctx.fillText(NAMES[i], 22, y - 14)
        ctx.globalAlpha = 1
      }
      // 手指（自然泛音）
      if (s.damper != null) {
        const x = s.damper * W
        ctx.strokeStyle = fgYou
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = fgYou
        ctx.font = `11px ${MONO}`
        const fr = this.nearestFraction(s.damper)
        ctx.fillText(fr ? `${fr.k}/${fr.m}` : `${Math.round(s.damper * 100)}%`, x + 12, y - 12)
      }
      // 撥點：你的手指
      if (s.held) {
        const x = s.held.p * W
        const hy = y - s.held.h * amp
        ctx.fillStyle = fgYou
        ctx.beginPath()
        ctx.arc(x, hy, 6.5, 0, Math.PI * 2)
        ctx.fill()
        const fr = this.nearestFraction(s.held.p)
        ctx.font = `12px ${MONO}`
        ctx.fillText(fr ? `${fr.k}/${fr.m}` : `${(s.held.p * 100).toFixed(0)}%`, x + 14, hy - (s.held.h >= 0 ? 10 : -20))
      }
    }

    // 漣漪環與指板尺
    this.drawRings(fgYou)
    this.drawRuler(fgMe, fgYou)

    // 懸停提示與鍵盤焦點
    this.drawHover(fgYou, fgMe)
  }

  /**
   * 經線場：整片畫面是一束兩端固定的細弦。
   * 靜止時各自以不同相位緩慢起伏（像風吹過布）；靠近活動中的弦會變亮並被它拉動；撥動時漣漪由弦向外傳。
   */
  private drawField(fg: string) {
    const { ctx, W, H } = this
    const R = this.reduced
    const t = this.time
    const L = H < 560 ? 30 : W < 700 ? 36 : 54
    const N = 81
    const sig = 0.13 * H
    const ambA = Math.min(9, H * 0.011) * (1 - 0.65 * this.invert)
    this.pulses = this.pulses.filter((p) => t - p.t0 < 3.4)
    const act = this.strings.map((s, i) => ({ s, i })).filter((o) => o.s.alpha > 0.01)
    const ws = new Float32Array(act.length)
    const pe = new Float32Array(this.pulses.length)
    ctx.lineWidth = 1
    ctx.strokeStyle = fg
    for (let j = 0; j < L; j++) {
      const yj = ((j + 0.5) / L) * H
      let prox = 0
      for (let a = 0; a < act.length; a++) {
        const d = (yj - act[a].s.yNorm * H) / sig
        const w = Math.exp(-d * d) * act[a].s.alpha
        ws[a] = w
        if (w > prox) prox = w
      }
      for (let q = 0; q < this.pulses.length; q++) {
        const p = this.pulses[q]
        const dy = Math.abs(yj - p.y * H)
        const tau = t - p.t0 - dy / (0.95 * H)
        pe[q] = tau > 0 && !R ? p.a * 15 * Math.exp(-tau * 1.5) * Math.sin(tau * 13) * Math.exp(-dy / (0.55 * H)) : 0
      }
      ctx.globalAlpha = 0.07 + 0.14 * prox
      ctx.beginPath()
      for (let ii = 0; ii < N; ii++) {
        const x01 = ii / (N - 1)
        const env = Math.sin(Math.PI * x01)
        let d = 0
        if (!R) d += env * ambA * (0.6 * Math.sin(t * 0.55 + j * 0.23 + x01 * 3.1) + 0.4 * Math.sin(t * 0.33 - j * 0.11 + x01 * 6.4))
        const idx = Math.round(x01 * (NPTS - 1))
        for (let a = 0; a < act.length; a++) {
          if (ws[a] < 0.01) continue
          d -= act[a].s.y[idx] * this.ampPx[act[a].i] * ws[a] * 0.55
        }
        for (let q = 0; q < pe.length; q++) {
          if (pe[q] === 0) continue
          d += pe[q] * env * (0.55 + 0.45 * Math.cos(2 * Math.PI * (x01 - this.pulses[q].p)))
        }
        if (ii === 0) ctx.moveTo(0, yj + d)
        else ctx.lineTo(x01 * W, yj + d)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /** 撥點處向外擴散的細環 */
  private drawRings(fg: string) {
    if (this.reduced) return
    const { ctx, W, H } = this
    ctx.strokeStyle = fg
    ctx.lineWidth = 1.2
    for (const p of this.pulses) {
      const age = this.time - p.t0
      if (age > 1.1) continue
      const k = age / 1.1
      ctx.globalAlpha = 0.5 * (1 - k) * (1 - k) * p.a
      ctx.beginPath()
      ctx.arc(p.p * W, p.y * H, 8 + 130 * (1 - Math.pow(1 - k, 3)), 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /** 琴頸刻度：最近一次撥動的位置會在尺上亮起並漸漸退去 */
  private drawRuler(fg: string, hot: string) {
    const { ctx, W, H } = this
    const age = this.time - this.lastPluckT
    const decay = this.reduced ? 0 : Math.exp(-age * 1.1)
    ctx.lineWidth = 1.2
    for (let k = 0; k <= 24; k++) {
      const x01 = k / 24
      const base = k % 12 === 0 ? 10 : k % 8 === 0 ? 8 : k % 6 === 0 ? 7 : 4
      const dx = (x01 - this.lastPluckP) / 0.055
      const fl = Math.exp(-dx * dx) * decay
      ctx.strokeStyle = fl > 0.06 ? hot : fg
      ctx.globalAlpha = 0.28 + 0.72 * fl
      const x = Math.min(W - 1, Math.max(1, x01 * W))
      ctx.beginPath()
      ctx.moveTo(x, H)
      ctx.lineTo(x, H - base - 24 * fl)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  private drawHover(fgYou: string, fgMe: string) {
    const { ctx, W } = this
    const fi = this.focusIdx
    if (fi >= 0 && this.hitShown[fi]) {
      const k = this.kb[fi]
      const y = this.baseY(fi)
      const x = k.p * W
      ctx.strokeStyle = fgYou
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y - 16)
      ctx.lineTo(x, y + 16)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y - k.h * this.ampPx[fi], 5, 0, Math.PI * 2)
      ctx.fillStyle = fgYou
      ctx.fill()
      const fr = this.nearestFraction(k.p)
      ctx.font = `12px ${MONO}`
      ctx.fillText(fr ? `${fr.k}/${fr.m}` : `${Math.round(k.p * 100)}%`, x + 10, y - 22)
    }
    const h = this.hover
    if (h && this.hitShown[h.i] && !this.strings[h.i].held) {
      const y = this.baseY(h.i)
      ctx.strokeStyle = fgYou
      ctx.globalAlpha = 0.85
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(h.x, y - 9)
      ctx.lineTo(h.x, y + 9)
      ctx.stroke()
      const fr = this.nearestFraction(h.x / W)
      if (fr) {
        ctx.fillStyle = fgYou
        ctx.font = `12px ${MONO}`
        ctx.fillText(`${fr.k}/${fr.m}`, h.x + 8, y - 14)
      }
      ctx.globalAlpha = 1
    }
    void fgMe
  }

  private drawLadder(t: number, fg: string) {
    const { ctx, W, H } = this
    const R = this.reduced
    const s = this.strings[0]
    const n = W < 640 ? 5 : 6
    const gap = Math.min(H * 0.07, 62)
    const y0 = s.yNorm * H
    const cap = gap * 0.46
    const rx = W < 700 ? 46 : 108 // 讓出右側章節尺的位置
    ctx.lineWidth = 1.2
    ctx.strokeStyle = fg
    ctx.fillStyle = fg
    // 節點刻度：可以撥的位置
    ctx.globalAlpha = 0.5 * t
    ctx.lineWidth = 1
    const ticks = W < 700 ? FRACTIONS.filter(([k, m]) => (k === 1 && m <= 3) || (k === 2 && m === 3) || (k === 3 && m === 4)) : FRACTIONS.slice(0, 6)
    for (const [k, m] of ticks) {
      const x = (k / m) * W
      ctx.beginPath()
      ctx.moveTo(x, y0 - 7)
      ctx.lineTo(x, y0 + 7)
      ctx.stroke()
      ctx.font = `10px ${MONO}`
      ctx.fillText(`${k}/${m}`, x - 7, y0 + 21)
    }
    for (let k = 0; k < n; k++) {
      const y = y0 + gap * (k + 1.25)
      const disp = Math.min(Math.pow(k + 1, 1.5), 12)
      s.modeSample(k, this.tmpM, R)
      const amp = s.modeAmp(k)
      const live = clamp(amp / 0.1)
      const a = t * (0.3 + 0.7 * live)
      ctx.globalAlpha = a
      ctx.lineWidth = 1.2 + live * 0.8
      ctx.strokeStyle = fg
      const kx = W / (NPTS - 1)
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let i = 1; i < NPTS; i++) {
        const raw = this.tmpM[i] * this.ampPx[0] * disp
        ctx.lineTo(i * kx, y - cap * Math.tanh(raw / cap))
      }
      ctx.stroke()
      // 標籤與振幅條
      ctx.globalAlpha = t * 0.9
      ctx.font = `italic 22px ${SERIF}`
      ctx.fillText(String(k + 1), 22, y - 9)
      ctx.font = `10px ${MONO}`
      ctx.globalAlpha = t * 0.55
      ctx.fillText(`×${disp.toFixed(1)}`, 44, y - 10)
      ctx.globalAlpha = t * (0.25 + 0.75 * live)
      const bl = clamp(amp / 0.82) * 64
      ctx.fillRect(W - rx - 64, y - 1.5, 64, 3)
      ctx.globalAlpha = t
      ctx.fillRect(W - rx - bl, y - 3, Math.max(bl, 1.5), 6)
    }
    ctx.globalAlpha = 1
  }
}
