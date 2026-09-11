/** 聲納 ping：極短、極低的合成音。可被靜音；永不自動播放。 */
export class PingAudio {
  private ctx: AudioContext | null = null;
  muted = true;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m && this.ctx?.state === 'running') void this.ctx.suspend();
    else if (!m) void this.ensure()?.resume();
  }

  ping(depth: number) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // 越深頻率越低
    osc.frequency.setValueAtTime(420 - depth * 220, now);
    osc.frequency.exponentialRampToValueAtTime(120 - depth * 60, now + 0.5);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  }
}
