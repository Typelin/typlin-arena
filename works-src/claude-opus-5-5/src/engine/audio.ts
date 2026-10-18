/**
 * Sound, off until the visitor asks for it. Every sound answers to a state of the river:
 *
 *   river bed   — brown noise whose level and brightness follow how fast the river is flowing
 *   glance      — a soft pencil tap each time the ink tip weighs another word
 *   commit      — a mallet note; likely words sit low on a pentatonic scale, unlikely ones ring higher,
 *                 so every sentence becomes its own melody. Words you changed carry an extra fifth.
 *   invented    — the same note, detuned and wavering
 *   heat        — a hiss that opens up with temperature; past the invention line, a beating shimmer
 *   chapter     — a struck bowl (inharmonic partials) when a chapter's title arrives
 *   stamp/seal  — a dull wooden press
 *   erosion     — a low wash that sinks as the upstream silts up
 *   rewind      — a short reversed brush
 */

// D major pentatonic, D3 → B5
const SCALE = [146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99, 880.0, 987.77]

type Ctx = AudioContext

export class Sound {
  private ctx: Ctx | null = null
  private master: GainNode | null = null
  private dry: GainNode | null = null
  private wet: GainNode | null = null
  private white: AudioBuffer | null = null
  private brown: AudioBuffer | null = null
  private bed: { gain: GainNode; filter: BiquadFilterNode } | null = null
  private hiss: { gain: GainNode; filter: BiquadFilterNode } | null = null
  private shimmer: GainNode | null = null
  private wash: { gain: GainNode; filter: BiquadFilterNode } | null = null
  private lastGlance = 0
  private lastRewind = 0
  private lastCommit = 0
  private lastBrush = 0
  enabled = false

  enable(on: boolean) {
    this.enabled = on
    if (on && !this.ctx) this.init()
    const ctx = this.ctx
    if (!ctx || !this.master) return
    this.master.gain.cancelScheduledValues(ctx.currentTime)
    this.master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, on ? 0.4 : 0.08)
    if (on) this.unlock()
  }

  /** Browsers start audio suspended until a gesture; true while sound is wanted but not yet audible. */
  get pending() {
    return this.enabled && (!this.ctx || this.ctx.state !== 'running')
  }

  /** Call from a user gesture. Greets with a bowl once the context is running. */
  unlock() {
    const ctx = this.ctx
    if (!ctx || !this.enabled) return
    if (ctx.state === 'running') {
      this.bowl(146.83, 0.5, 0.8)
      return
    }
    void ctx.resume().then(() => {
      if (this.enabled && ctx.state === 'running') this.bowl(146.83, 0.6, 1)
    })
  }

  onState(fn: () => void) {
    this.ctx?.addEventListener('statechange', fn)
  }

  private now() {
    return this.ctx!.currentTime
  }

  private live() {
    return this.enabled && this.ctx && this.master && this.ctx.state === 'running'
  }

  private init() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    this.ctx = ctx

    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    comp.attack.value = 0.005
    comp.release.value = 0.25
    comp.connect(ctx.destination)

    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp)

    // A small room: generated impulse, stereo, ~2.6 s.
    const rev = ctx.createConvolver()
    const len = Math.floor(ctx.sampleRate * 2.6)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    rev.buffer = ir
    this.dry = ctx.createGain()
    this.dry.gain.value = 0.85
    this.wet = ctx.createGain()
    this.wet.gain.value = 0.32
    this.dry.connect(this.master)
    this.wet.connect(rev).connect(this.master)

    // Noise sources
    const n = ctx.sampleRate * 3
    this.white = ctx.createBuffer(1, n, ctx.sampleRate)
    this.brown = ctx.createBuffer(1, n, ctx.sampleRate)
    const w = this.white.getChannelData(0)
    const b = this.brown.getChannelData(0)
    let last = 0
    for (let i = 0; i < n; i++) {
      w[i] = Math.random() * 2 - 1
      last = (last + 0.02 * w[i]) / 1.02
      b[i] = last * 3.5
    }

    // River bed: brown noise, gently moving filter.
    this.bed = this.loop(this.brown, 'lowpass', 380, 0.6)
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.13
    const lfoAmt = ctx.createGain()
    lfoAmt.gain.value = 90
    lfo.connect(lfoAmt).connect(this.bed.filter.frequency)
    lfo.start()

    // Heat hiss and the over-heat shimmer.
    this.hiss = this.loop(this.white, 'bandpass', 900, 0.8)
    this.shimmer = ctx.createGain()
    this.shimmer.gain.value = 0
    for (const f of [1318.5, 1325.5]) {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(this.shimmer)
      o.start()
    }
    this.shimmer.connect(this.wet)
    this.shimmer.connect(this.dry)

    // Erosion wash.
    this.wash = this.loop(this.brown, 'lowpass', 200, 0.9)
  }

  private loop(buf: AudioBuffer, type: BiquadFilterType, freq: number, q: number) {
    const ctx = this.ctx!
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    filter.Q.value = q
    const gain = ctx.createGain()
    gain.gain.value = 0
    src.connect(filter).connect(gain)
    gain.connect(this.dry!)
    gain.connect(this.wet!)
    src.start(0, Math.random() * 2)
    return { gain, filter }
  }

  private env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(peak, t + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  }

  private noiseBurst(t: number, type: BiquadFilterType, freq: number, peak: number, decay: number, wet = false) {
    const ctx = this.ctx!
    const s = ctx.createBufferSource()
    s.buffer = this.white
    const f = ctx.createBiquadFilter()
    f.type = type
    f.frequency.value = freq
    const g = ctx.createGain()
    this.env(g, t, peak, 0.004, decay)
    s.connect(f).connect(g).connect(wet ? this.wet! : this.dry!)
    if (!wet) g.connect(this.wet!)
    s.start(t, Math.random() * 2)
    s.stop(t + decay + 0.05)
  }

  private note(freq: number, t: number, peak: number, decay: number, opts: { detune?: number; wobble?: boolean } = {}) {
    const ctx = this.ctx!
    const out = ctx.createGain()
    this.env(out, t, peak, 0.006, decay)
    out.connect(this.dry!)
    out.connect(this.wet!)
    // body
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, t)
    if (opts.detune) o.detune.setValueAtTime(opts.detune, t)
    if (opts.wobble) {
      const l = ctx.createOscillator()
      l.frequency.value = 7
      const a = ctx.createGain()
      a.gain.value = 18
      l.connect(a).connect(o.detune)
      l.start(t)
      l.stop(t + decay + 0.1)
    }
    o.connect(out)
    o.start(t)
    o.stop(t + decay + 0.1)
    // mallet click: a short high partial
    const m = ctx.createOscillator()
    m.type = 'sine'
    m.frequency.setValueAtTime(freq * 4.01, t)
    const mg = ctx.createGain()
    this.env(mg, t, peak * 0.35, 0.002, 0.07)
    m.connect(mg).connect(this.dry!)
    m.start(t)
    m.stop(t + 0.12)
  }

  private bowl(f: number, peak: number, length: number) {
    if (!this.ctx || !this.wet) return
    const t = this.now() + 0.01
    const partials: [number, number][] = [
      [1, 1],
      [2.76, 0.45],
      [5.4, 0.22],
      [8.93, 0.1],
    ]
    for (const [r, a] of partials) {
      const o = this.ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = f * r * (1 + (Math.random() - 0.5) * 0.004)
      const g = this.ctx.createGain()
      this.env(g, t, 0.05 * peak * a, 0.01, 3.2 * length / Math.sqrt(r))
      o.connect(g)
      g.connect(this.wet)
      g.connect(this.dry!)
      o.start(t)
      o.stop(t + 4 * length)
    }
  }

  /* ───────── events ───────── */

  /** p: probability of the chosen word; step: position in the sentence (melodic walk). */
  commit(p: number, step: number, mine: boolean, invented: boolean) {
    if (!this.live()) return
    const ms = performance.now()
    if (ms - this.lastCommit < 45) return
    this.lastCommit = ms
    const t = this.now() + 0.005
    // brush on paper
    this.noiseBurst(t, 'highpass', 2600, 0.05, 0.08)
    // A gentle melodic walk, lifted by how unlikely the word was.
    const walk = [0, 2, 1, 3, 2, 4, 3, 1][step % 8]
    const idx = Math.min(SCALE.length - 1, 2 + walk + Math.round((1 - p) * 6))
    const f = SCALE[idx]
    if (invented) {
      this.note(f, t, 0.08, 0.9, { detune: -38, wobble: true })
      this.note(f * 1.06, t + 0.03, 0.04, 0.8, { wobble: true })
      return
    }
    this.note(f, t, mine ? 0.11 : 0.075, mine ? 1.1 : 0.7)
    if (mine) this.note(f * 1.5, t + 0.045, 0.05, 0.9)
  }

  /** A fixed word (no choice): only the brush. */
  brush() {
    if (!this.live()) return
    const ms = performance.now()
    if (ms - this.lastBrush < 45) return
    this.lastBrush = ms
    this.noiseBurst(this.now() + 0.005, 'highpass', 3200, 0.025, 0.05)
  }

  /** The ink tip moves to weigh another word. */
  glance(p: number) {
    if (!this.live()) return
    const ms = performance.now()
    if (ms - this.lastGlance < 90) return
    this.lastGlance = ms
    this.noiseBurst(this.now() + 0.003, 'bandpass', 1800 + (1 - p) * 2200, 0.018, 0.03)
  }

  /** flow 0..1 (scroll speed), heat 0..1, over: past the invention line. */
  update(flow: number, heat: number, over: number, erode: number) {
    if (!this.ctx || !this.bed || !this.hiss || !this.shimmer || !this.wash) return
    const t = this.now()
    const on = this.enabled ? 1 : 0
    this.bed.gain.gain.setTargetAtTime(on * (0.05 + flow * 0.16), t, 0.25)
    this.bed.filter.frequency.setTargetAtTime(320 + flow * 900, t, 0.3)
    this.hiss.gain.gain.setTargetAtTime(on * heat * 0.035, t, 0.12)
    this.hiss.filter.frequency.setTargetAtTime(700 + heat * 2600, t, 0.15)
    this.shimmer.gain.setTargetAtTime(on * over * 0.012, t, 0.2)
    this.wash.gain.gain.setTargetAtTime(on * erode * 0.22, t, 0.3)
    this.wash.filter.frequency.setTargetAtTime(160 + erode * 500, t, 0.4)
  }

  chapter(c: number) {
    if (!this.live()) return
    // Each chapter a step lower; forgetting (V) the deepest.
    const roots = [146.83, 196.0, 174.61, 164.81, 110.0, 146.83]
    this.bowl(roots[c] ?? 146.83, c === 4 ? 1.3 : 0.9, c === 4 ? 1.6 : 1.1)
  }

  stamp(strong = false) {
    if (!this.live() || !this.ctx) return
    const t = this.now() + 0.005
    const o = this.ctx.createOscillator()
    o.type = 'sine'
    o.frequency.setValueAtTime(strong ? 150 : 210, t)
    o.frequency.exponentialRampToValueAtTime(strong ? 55 : 90, t + 0.12)
    const g = this.ctx.createGain()
    this.env(g, t, strong ? 0.35 : 0.16, 0.003, strong ? 0.35 : 0.16)
    o.connect(g)
    g.connect(this.dry!)
    g.connect(this.wet!)
    o.start(t)
    o.stop(t + 0.5)
    this.noiseBurst(t, 'lowpass', strong ? 700 : 1100, strong ? 0.2 : 0.08, strong ? 0.12 : 0.06)
  }

  seal() {
    this.stamp(true)
    this.bowl(146.83, 1, 1.5)
    this.bowl(220.0, 0.5, 1.4)
  }

  rewind() {
    if (!this.live() || !this.ctx) return
    const ms = performance.now()
    if (ms - this.lastRewind < 70) return
    this.lastRewind = ms
    const t = this.now() + 0.005
    const s = this.ctx.createBufferSource()
    s.buffer = this.white
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 2
    f.frequency.setValueAtTime(1200, t)
    f.frequency.exponentialRampToValueAtTime(4200, t + 0.12)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.11)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
    s.connect(f).connect(g).connect(this.dry!)
    s.start(t, Math.random())
    s.stop(t + 0.2)
  }

  washAway() {
    if (!this.live() || !this.ctx) return
    const t = this.now() + 0.01
    const s = this.ctx.createBufferSource()
    s.buffer = this.white
    const f = this.ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(300, t)
    f.frequency.exponentialRampToValueAtTime(3000, t + 0.5)
    f.frequency.exponentialRampToValueAtTime(200, t + 1.2)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.5)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)
    s.connect(f).connect(g)
    g.connect(this.dry!)
    g.connect(this.wet!)
    s.start(t)
    s.stop(t + 1.3)
  }
}
