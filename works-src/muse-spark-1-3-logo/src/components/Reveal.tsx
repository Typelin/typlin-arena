import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

interface Props {
  children: ReactNode;
  /** wipe：筆觸掃入 ｜ rise：浮起 ｜ stamp：落印 */
  variant?: 'wipe' | 'rise' | 'stamp';
  delay?: number;
  className?: string;
  id?: string;
}

/**
 * 編舞式揭示：一次只用一種筆法，拒絕批量淡入。
 * wipe＝和紙揭開（clip-path），rise＝花瓣浮起，stamp＝印章落下。
 *
 * 結構注意：外層只負責被 IntersectionObserver 觀測（永不裁切），
 * 內層才做 clip-path 動畫。Chromium 會把目標自身的 clip-path
 * 計入 IO 相交率——零面積裁切會讓相交率恆為 0、永遠觸發不了。
 */
export function Reveal({ children, variant = 'wipe', delay = 0, className = '', id }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVis(true);
      return;
    }
    // 無 IntersectionObserver 的古董瀏覽器：直接顯示，絕不留白
    if (!('IntersectionObserver' in window)) {
      setVis(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className={`reveal ${className}`}>
      <div
        style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
        className={`reveal__inner reveal--${variant}${vis ? ' is-visible' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
