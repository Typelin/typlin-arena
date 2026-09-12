// Web Audio API Synthesizer for Latent Chamber Resonance

class HarmonicResonator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];

  constructor() {
    // Lazy init on user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      // Audio context unsupported or disabled
    }
  }

  public toggleMute(): boolean {
    this.init();
    if (!this.ctx || !this.masterGain) return true;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const targetGain = this.isMuted ? 0 : 0.08;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);

    if (!this.isMuted && this.activeOscillators.length === 0) {
      this.startDrone();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Harmonic chords (Root F# 46.25Hz, fifth 69.3Hz, octave 92.5Hz, modal 138.6Hz)
    const baseFreqs = [46.25, 69.3, 92.5, 138.6, 207.65];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const amp = (0.2 / (idx + 1)) * (idx === 0 ? 0.8 : 0.4);
      gain.gain.setValueAtTime(amp, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeOscillators.push({ osc, gain });
    });
  }

  public modulate(entropy: number, tension: number, phase: number) {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Modulate root frequency and harmonics based on entropy and phase
    this.activeOscillators.forEach((item, idx) => {
      const base = [46.25, 69.3, 92.5, 138.6, 207.65][idx];
      const pitchShift = 1 + (phase * 0.15) + (entropy * 0.08 * (idx + 1));
      const detune = Math.sin(t * (0.5 + entropy * 2) + idx) * (10 + tension * 25);

      item.osc.frequency.setTargetAtTime(base * pitchShift, t, 0.1);
      item.osc.detune.setTargetAtTime(detune, t, 0.08);

      const dynamicAmp = (0.15 / (idx + 1)) * (1 + tension * 0.5);
      item.gain.gain.setTargetAtTime(dynamicAmp, t, 0.1);
    });
  }

  public triggerChime(kind: 'phase' | 'crystallize' | 'probe' = 'phase') {
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freqs = {
      phase: 440 * (1 + Math.random() * 0.5),
      crystallize: 880 + Math.random() * 220,
      probe: 587.33
    };

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[kind], t);
    osc.frequency.exponentialRampToValueAtTime(freqs[kind] * 1.5, t + 0.35);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.65);
  }
}

export const soundEngine = new HarmonicResonator();
