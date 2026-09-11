import { useCallback, useEffect, useRef, useState } from 'react';
import { Sonar } from './engine';
import { draw } from './render';
import { PingAudio } from './audio';
import { SPECIMENS } from '../data/specimens';

export type UseSonar = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** 已發現的標本編號 */
  foundSigils: string[];
  /** 是否靜音 */
  muted: boolean;
  toggleMute: () => void;
  /** 手動脈衝 */
  pulse: () => void;
};

export function useSonar(): UseSonar {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sonarRef = useRef<Sonar | null>(null);
  const audioRef = useRef<PingAudio | null>(null);
  const [foundSigils, setFoundSigils] = useState<string[]>([]);
  const [muted, setMuted] = useState(true);
  const mutedRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sonar = new Sonar(SPECIMENS);
    sonarRef.current = sonar;
    const audio = new PingAudio();
    audioRef.current = audio;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // DPR 自適應
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // 指標 → 波束角度（先宣告，後掛監聽）
    let beamTarget = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const dx = e.clientX - r.left - r.width / 2;
      const dy = (e.clientY - r.top - r.height / 2) / 0.82;
      beamTarget = Math.atan2(dy, dx);
    };
    canvas.addEventListener('pointermove', onMove);

    // 點擊 → 脈衝
    const onDown = () => {
      if (sonar.emitPulse()) audio.ping(sonar.depthSmooth);
    };
    canvas.addEventListener('pointerdown', onDown);

    // 鍵盤空白 → 脈衝
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (sonar.emitPulse()) audio.ping(sonar.depthSmooth);
      }
    };
    window.addEventListener('keydown', onKey);

    // 滾動 → 深度
    let depthTarget = 0;
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      depthTarget = Math.min(1, window.scrollY / max);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 進場自動送出一次脈衝：讓訪客一進來就懂「這能動」
    const introTimer = window.setTimeout(() => {
      if (sonar.emitPulse()) audio.ping(0);
    }, 700);

    // 動畫迴圈
    let raf = 0;
    let last = performance.now();
    const foundRef = new Set<string>();
    let pushedCount = -1;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      sonar.update(dt, beamTarget, depthTarget);

      // 推進脈衝
      const rView = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.42;
      for (const p of sonar.pings) {
        p.life = Math.min(1, p.life + dt / 2.2);
        // 速度依深度變慢（深海波速慢）
        const speed = rView * (1.6 - sonar.depthSmooth * 0.7);
        p.r += speed * dt;
        if (p.maxR === 0) p.maxR = rView * 1.15;
        // 打到魚：把 sy 的 0.82 橢圓壓縮還原後，量真實橢圓空間距離
        const cx = canvas.clientWidth / 2;
        const cy = canvas.clientHeight / 2;
        for (const f of sonar.fish) {
          const dx = f.sx - cx;
          const dy = (f.sy - cy) / 0.82;
          const d = Math.hypot(dx, dy);
          if (Math.abs(d - p.r) < 18) {
            f.lit = Math.max(f.lit, 1 - p.life);
            if (!f.found) {
              f.found = true;
              foundRef.add(f.sigil);
            }
          }
        }
      }
      sonar.pings = sonar.pings.filter((p) => p.life < 1);

      // 只在數量真的變化時 setState（避免每幀 re-render）
      if (foundRef.size !== pushedCount) {
        pushedCount = foundRef.size;
        setFoundSigils([...foundRef]);
      }

      sonar.layout(canvas.clientWidth, canvas.clientHeight);
      draw(ctx, sonar, canvas.clientWidth, canvas.clientHeight, reduced);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(introTimer);
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      audioRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const pulse = useCallback(() => {
    const s = sonarRef.current;
    if (s?.emitPulse()) audioRef.current?.ping(s.depthSmooth);
  }, []);

  void mutedRef;
  return { canvasRef, foundSigils, muted, toggleMute, pulse };
}
