import { useEffect, useState, type RefObject } from 'react';

export function useStageSize(el: RefObject<HTMLElement | null>): { w: number; h: number } {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const read = () => {
      const r = node.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(node);
    return () => ro.disconnect();
  }, [el]);

  return size;
}
