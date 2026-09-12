import type { ScaleMode } from "../components/Dome";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

/** 必須由用戶手勢觸發（click / keydown） */
export function initAudio(): void {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
  }
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master && ctx) {
    master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.05);
  }
}

export function isMuted(): boolean {
  return muted;
}

const LYDIAN = [
  164.81, 185.0, 207.65, 233.08, 246.94, 277.18, 311.13, 329.63, 369.99, 415.3,
  466.16, 493.88,
];
const DORIAN = [
  146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23,
  392.0, 440.0,
];

function pick(mode: ScaleMode, idx: number): number {
  const scale = mode === "dorian" ? DORIAN : LYDIAN;
  return scale[Math.abs(Math.round(idx)) % scale.length];
}

/** 一次撥弦：正弦基音 + 微弱泛音，指數衰減 */
export function chime(
  mode: ScaleMode,
  idx: number,
  amp = 0.1,
  dur = 1.6
): void {
  if (!ctx || !master || muted) return;
  const freq = pick(mode, idx);
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2.001;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(amp * 0.32, t + 0.008);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.55);

  osc.connect(g);
  osc2.connect(g2);
  g.connect(master);
  g2.connect(master);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + dur + 0.05);
  osc2.stop(t + dur * 0.6 + 0.05);
}

/** 蘇醒掃音：三音上行 */
export function arpeggio(mode: ScaleMode): void {
  if (!ctx || muted) return;
  const base = mode === "dorian" ? 0 : 4;
  [0, 2, 4, 7].forEach((step, i) => {
    window.setTimeout(() => chime(mode, base + step, 0.07, 2.2), i * 170);
  });
}
