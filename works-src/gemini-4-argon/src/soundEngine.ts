// Pure Web Audio API harmonic resonator — zero external assets or keys required.
class ArgonSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = false;

  public toggle(): boolean {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.triggerHarmonic(435, 0.12);
    }
    return this.enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public triggerHarmonic(wavelengthNm: number, duration = 0.18): void {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Map optical wavelength (400-700nm) to a calm acoustic harmonic (220Hz - 528Hz)
      const normalized = Math.max(0, Math.min(1, (700 - wavelengthNm) / 300));
      const freq = 220 + normalized * 308;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.008, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Ignore audio errors if blocked by browser autoplay policy
    }
  }
}

export const soundEngine = new ArgonSoundEngine();