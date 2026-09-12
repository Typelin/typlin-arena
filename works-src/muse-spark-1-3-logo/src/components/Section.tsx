import { useRef, useEffect, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  padding?: number;
  reducedMotion: boolean;
}

/**
 * Section — handles scroll-triggered content reveal.
 *
 * V2: Uses clip-path polygon wipe (diagonal, like a current sweeping across)
 * on .reveal-wipe children. The wipe direction is from bottom-left to top-right,
 * echoing the flow field's diagonal drift.
 *
 * In reduced motion mode, content is immediately visible.
 */
export function Section({ children, className = '', id, padding = 20, reducedMotion }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(reducedMotion);
  const [progressed, setProgressed] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    // Two observers: one at lower threshold for initial visibility,
    // one deeper for full reveal progression
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Delay "progressed" to create temporal sequence
          setTimeout(() => setProgressed(true), 400);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`section ${visible ? 'section--visible' : ''} ${progressed ? 'section--progressed' : ''} ${className}`}
      style={{
        paddingTop: `${padding}vh`,
        paddingBottom: `${padding}vh`,
      }}
    >
      {children}
    </section>
  );
}
