import { useEffect, useRef, useState } from "react";

export interface SectionRef {
  id: string;
  /** 0 = section 頂對齊視口頂, 1 = section 底離開視口 */
  progress: number;
  /** 0..1 該 section 在視口中的可見比例 */
  visible: number;
}

/**
 * 全站唯一 scroll 心跳：單一 rAF，讀 scrollY 一次，
 * 給每個註冊的 section 算 progress / visible，並廣播給訂閱者。
 */
export function useScrollBus(onFrame: (t: number) => void) {
  const cbRef = useRef(onFrame);
  cbRef.current = onFrame;

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      cbRef.current(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}

export function useSectionProgress(
  ref: React.RefObject<HTMLElement | null>,
  onProgress: (p: number, visible: number) => void
) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height + vh;
        const p = total > 0 ? (vh - rect.top) / total : 0;
        const visible =
          rect.height > 0
            ? Math.max(
                0,
                Math.min(1, (Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / Math.min(rect.height, vh))
              )
            : 0;
        cb.current(p, visible);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ref]);
}

/** 進入視口即觸發一次 */
export function useInView(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.25
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setInView(true);
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}
