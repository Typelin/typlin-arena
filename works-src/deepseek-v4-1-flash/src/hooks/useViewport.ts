import { useEffect, useState } from 'react';

/**
 * 視窗寬度。標籤排版要跟著視窗換形狀，所以需要一個會重算的來源。
 * 只在跨過斷點時才更新，避免拖動視窗時每像素重繪 React 樹。
 */
const BREAKPOINTS = [560, 900, 1200];

function bucket(w: number): number {
  let b = 0;
  for (let i = 0; i < BREAKPOINTS.length; i += 1) {
    if (w >= BREAKPOINTS[i]) b = i + 1;
  }
  return b;
}

export function useViewport(): number {
  const [w, setW] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );

  useEffect(() => {
    let raf = 0;
    let last = bucket(window.innerWidth);
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = window.innerWidth;
        const b = bucket(next);
        if (b !== last || Math.abs(next - w) > 240) {
          last = b;
          setW(next);
        }
      });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [w]);

  return w;
}
