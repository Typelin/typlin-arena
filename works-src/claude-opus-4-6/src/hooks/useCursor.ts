import { useState, useEffect, useCallback, useRef } from 'react';

export interface CursorInfo {
  x: number;
  y: number;
  active: boolean;
  idle: boolean;       // true when cursor hasn't moved for > threshold
  idleDuration: number; // seconds of idleness
}

const IDLE_THRESHOLD = 3000; // ms

export function useCursor(): CursorInfo {
  const [cursor, setCursor] = useState<CursorInfo>({
    x: -9999, y: -9999, active: false, idle: false, idleDuration: 0,
  });

  const lastMoveRef = useRef(0);
  const timerRef = useRef(0);
  const posRef = useRef({ x: -9999, y: -9999 });

  const onMove = useCallback((e: MouseEvent | Touch) => {
    posRef.current = { x: e.clientX, y: e.clientY };
    lastMoveRef.current = performance.now();
    setCursor(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
      active: true,
      idle: false,
      idleDuration: 0,
    }));
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => onMove(e), [onMove]);
  const onTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) onMove(e.touches[0]);
  }, [onMove]);

  const onLeave = useCallback(() => {
    setCursor(prev => ({ ...prev, active: false, idle: false, idleDuration: 0 }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    // Idle checker
    timerRef.current = window.setInterval(() => {
      if (lastMoveRef.current > 0) {
        const elapsed = performance.now() - lastMoveRef.current;
        if (elapsed > IDLE_THRESHOLD) {
          setCursor(prev => ({
            ...prev,
            idle: true,
            idleDuration: (elapsed - IDLE_THRESHOLD) / 1000,
          }));
        }
      }
    }, 200);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseleave', onLeave);
      clearInterval(timerRef.current);
    };
  }, [onMouseMove, onTouchMove, onLeave]);

  return cursor;
}
