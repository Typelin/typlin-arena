/**
 * Procedural WebAudio synthesizer for Gemini 4 Argon.
 * Zero external audio assets — synthesizes electrostatic sparks,
 * Argon-18 harmonic chords, magnetic pinch sweeps, and grounding chimes.
 */
export class ArgonAudio {
  private ctx: AudioContext | null = null
  public enabled = false

  private ensureContext(): AudioContext | null {
    if (!this.enabled) return null
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined)
    }
    return this.ctx
  }

  public toggle(): boolean {
    this.enabled = !this.enabled
    if (this.enabled) {
      this.ensureContext()
      this.playSpark(0.5, 0)
    }
    return this.enabled
  }

  /** Electrostatic arc pluck / discharge harmonic */
  public playSpark(normX = 0.5, stage = 0): void {
    const ctx = this.ensureContext()
    if (!ctx) return

    const now = ctx.currentTime
    const baseFreqs = [110, 146.83, 164.81, 196.0, 220.0, 293.66, 329.63]
    const idx = Math.min(baseFreqs.length - 1, Math.max(0, Math.floor(normX * baseFreqs.length)))
    const freq = baseFreqs[idx] * (stage === 3 ? 0.84 : stage === 4 ? 1.25 : 1.0)

    // 1. Harmonic sine + triangle body
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = stage === 3 ? 'sawtooth' : 'sine'
    osc2.type = 'triangle'
    osc1.frequency.setValueAtTime(freq, now)
    osc2.frequency.setValueAtTime(freq * 1.498, now) // fifth harmonic

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(stage === 3 ? 920 : 1450, now)
    filter.frequency.exponentialRampToValueAtTime(240, now + 0.65)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.75)
    osc2.stop(now + 0.75)
  }

  /** Crisp grounding chime when shattering a hallucination branch or locking a fork */
  public playGroundChime(): void {
    const ctx = this.ensureContext()
    if (!ctx) return

    const now = ctx.currentTime
    for (const [i, f] of [528, 792, 1056].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + i * 0.04)

      gain.gain.setValueAtTime(0.0001, now + i * 0.04)
      gain.gain.linearRampToValueAtTime(0.06 / (i + 1), now + i * 0.04 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.9)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.04)
      osc.stop(now + i * 0.04 + 0.95)
    }
  }
}

export const argonAudio = new ArgonAudio()
