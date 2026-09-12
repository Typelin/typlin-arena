import { useState, useEffect, useCallback, useRef } from 'react';

export interface ScrollInfo {
  scrollY: number;
  progress: number;      // 0–1 over full document
  viewportHeight: number;
  docHeight: number;
}

export function useScrollProgress(): ScrollInfo {
  const [info, setInfo] = useState<ScrollInfo>({
    scrollY: 0,
    progress: 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
    docHeight: typeof document !== 'undefined' ? document.documentElement.scrollHeight : 800,
  });

  const rafRef = useRef(0);
  const pendingRef = useRef(false);

  const update = useCallback(() => {
    const vh = window.innerHeight;
    const dh = document.documentElement.scrollHeight;
    const sy = window.scrollY;
    const progress = dh <= vh ? 0 : sy / (dh - vh);
    setInfo({ scrollY: sy, progress, viewportHeight: vh, docHeight: dh });
    pendingRef.current = false;
  }, []);

  const onScroll = useCallback(() => {
    if (!pendingRef.current) {
      pendingRef.current = true;
      rafRef.current = requestAnimationFrame(update);
    }
  }, [update]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll, update]);

  return info;
}
