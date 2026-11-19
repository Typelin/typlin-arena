// Pure procedural Web Audio synthesizer for tactile Neon-10 discharge & glass resonance.
// Always opt-in (starts muted) so there is zero intrusive autoplay.

class NeonAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private humOsc: OscillatorNode | null = null;
  private humSub: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.enabled) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      this.startHum();
      this.enabled = true;
      this.playGlassChime(640);
      return true;
    } else {
      this.stopHum();
      this.enabled = false;
      return false;
    }
  }

  private startHum() {
    if (!this.ctx || this.humOsc) return;
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.028, now + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, now);

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);

    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, now);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    sub.start(now);

    this.humOsc = osc;
    this.humSub = sub;
    this.humGain = gain;
  }

  private stopHum() {
    if (!this.ctx || !this.humGain || !this.humOsc || !this.humSub) return;
    const now = this.ctx.currentTime;
    this.humGain.gain.cancelScheduledValues(now);
    this.humGain.gain.setValueAtTime(Math.max(0.0001, this.humGain.gain.value), now);
    this.humGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    const osc = this.humOsc;
    const sub = this.humSub;
    window.setTimeout(() => {
      try {
        osc.stop();
        sub.stop();
        osc.disconnect();
        sub.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
    }, 280);
    this.humOsc = null;
    this.humSub = null;
    this.humGain = null;
  }

  public setExcitationEnergy(energy: number) {
    if (!this.enabled || !this.ctx || !this.humOsc || !this.humSub || !this.humGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0.2, Math.min(1, energy));
    this.humOsc.frequency.setTargetAtTime(55 + clamped * 45, now, 0.14);
    this.humSub.frequency.setTargetAtTime(110 + clamped * 130, now, 0.14);
    this.humGain.gain.setTargetAtTime(0.018 + clamped * 0.032, now, 0.14);
    this.playGlassChime(380 + clamped * 520);
  }

  public playGlassChime(freq: number) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + 0.35);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2.0, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    osc.connect(gain);
    harmonic.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + 0.45);
    harmonic.stop(now + 0.45);
  }
}

export const neonAudio = new NeonAudioEngine();
