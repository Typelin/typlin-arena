// Interactive Web Audio synthesizer for tactile feedback and serene ambient aesthetic
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.playWaterDrop(520, 0.2);
    }
    return this.enabled;
  }

  // Pure pentatonic koto / water droplet chime
  public playDrop(tone: 'high' | 'mid' | 'low' = 'mid') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const freqs = {
      high: 880, // A5
      mid: 659.25, // E5
      low: 440 // A4
    };
    this.playWaterDrop(freqs[tone], 0.15);
  }

  public playChord() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    // Japanese Insen pentatonic scale: D4, Eb4, G4, A4, C5
    const notes = [293.66, 392.00, 440.00, 587.33];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playWaterDrop(freq, 0.12 - idx * 0.02);
      }, idx * 60);
    });
  }

  private playWaterDrop(frequency: number, duration: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      // Pitch bend down slightly for droplet feel
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.95, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const sound = new SoundSynthesizer();
