import { useRef, useEffect } from 'react';
import { SimplexNoise2D } from '../engine';

interface Props {
  seed: number;
  reducedMotion: boolean;
}

/**
 * FlowDivider — a small canvas element between sections that draws
 * a few flowing lines as a visual transition. Each instance has a
 * unique seed so they look different. The lines animate slowly.
 */
export function FlowDivider({ seed, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const noise = new SimplexNoise2D(seed * 73);
    const dpr = Math.min(window.devicePixelRatio, 2);
    const width = Math.min(640, window.innerWidth - 48);
    const height = 60;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 0.8 * dpr;
      ctx.lineCap = 'round';

      const lineCount = 5;
      for (let i = 0; i < lineCount; i++) {
        const baseY = (height / (lineCount + 1)) * (i + 1);
        ctx.beginPath();
        ctx.strokeStyle = i === Math.floor(lineCount / 2)
          ? 'rgba(196, 125, 59, 0.25)'
          : `rgba(26, 26, 26, ${0.06 + i * 0.02})`;

        for (let x = 0; x < width; x += 2) {
          const ny = noise.fbm(x * 0.008 + seed * 10, i * 0.5, 2) * 12;
          const py = (baseY + ny) * dpr;
          const px = x * dpr;
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    };

    if (reducedMotion) {
      drawStatic();
      return;
    }

    let time = 0;
    const animate = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 0.8 * dpr;
      ctx.lineCap = 'round';

      const lineCount = 5;
      for (let i = 0; i < lineCount; i++) {
        const baseY = (height / (lineCount + 1)) * (i + 1);
        ctx.beginPath();
        ctx.strokeStyle = i === Math.floor(lineCount / 2)
          ? 'rgba(196, 125, 59, 0.25)'
          : `rgba(26, 26, 26, ${0.06 + i * 0.02})`;

        for (let x = 0; x < width; x += 2) {
          const ny = noise.fbm(x * 0.008 + seed * 10 + time, i * 0.5 + time * 0.5, 2) * 12;
          const py = (baseY + ny) * dpr;
          const px = x * dpr;
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    // Only animate when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0 }
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [seed, reducedMotion]);

  return (
    <div className="flow-divider" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
