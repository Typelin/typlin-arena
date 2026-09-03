import { useEffect, useState } from 'react';

interface Props {
  /** 0–1：圓相描繪進度 */
  progress?: number;
  /** 首屏自動描繪 */
  animateOnMount?: boolean;
  size?: number;
  className?: string;
}

const C = 2 * Math.PI * 140;

/**
 * 圓相 — LOGO 裡那道筆觸的回聲。
 * 首屏自動一筆畫圓；頁首小圓相則隨捲動描繪。
 */
export function Enso({ progress, animateOnMount = false, size = 320, className = '' }: Props) {
  const [auto, setAuto] = useState(animateOnMount ? 0 : 1);

  useEffect(() => {
    if (!animateOnMount) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAuto(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 1800);
      // 進三退一的筆意：easeOut + 尾段微頓
      const eased = 1 - Math.pow(1 - k, 3);
      setAuto(eased);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateOnMount]);

  const p = progress ?? auto;

  return (
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      className={`enso ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ensoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E3D8C" />
          <stop offset="55%" stopColor="#6B7AC8" />
          <stop offset="100%" stopColor="#EFA3BE" />
        </linearGradient>
      </defs>
      {/* 紙上淡影：未畫之處 */}
      <circle
        cx="160"
        cy="160"
        r="140"
        fill="none"
        stroke="#23264A"
        strokeOpacity="0.1"
        strokeWidth="13"
        strokeLinecap="round"
        transform="rotate(-72 160 160)"
      />
      {/* 筆觸：靛起櫻落 */}
      <circle
        cx="160"
        cy="160"
        r="140"
        fill="none"
        stroke="url(#ensoGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - p)}
        transform="rotate(-72 160 160)"
        className="enso__brush"
      />
      {/* 收筆飛白 */}
      <circle
        cx="160"
        cy="160"
        r="140"
        fill="none"
        stroke="#EFA3BE"
        strokeOpacity={0.5 * p}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`26 ${C}`}
        strokeDashoffset={26 - 40 * p}
        transform="rotate(38 160 160)"
      />
    </svg>
  );
}
