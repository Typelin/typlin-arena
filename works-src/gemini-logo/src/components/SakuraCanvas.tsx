import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  flip: number;
  flipSpeed: number;
  colorType: 'pink' | 'lavender' | 'deep';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export const SakuraCanvas: React.FC<{ interactive?: boolean }> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; prevX: number; prevY: number; speed: number }>({
    x: -999,
    y: -999,
    prevX: -999,
    prevY: -999,
    speed: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petals: Petal[] = [];
    const ripples: Ripple[] = [];
    const petalCount = Math.min(65, Math.floor(width / 22));

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 7,
        speedX: Math.random() * 1.5 - 0.2,
        speedY: Math.random() * 1.2 + 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.55 + 0.35,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.01,
        colorType: Math.random() > 0.85 ? 'lavender' : Math.random() > 0.15 ? 'pink' : 'deep'
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      const dx = newX - mouseRef.current.prevX;
      const dy = newY - mouseRef.current.prevY;
      mouseRef.current.speed = Math.sqrt(dx * dx + dy * dy);
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;

      // Spawn soft ripples when mouse moves
      if (interactive && Math.random() > 0.65 && mouseRef.current.speed > 5) {
        ripples.push({
          x: newX,
          y: newY,
          radius: 2,
          maxRadius: Math.random() * 45 + 30,
          opacity: 0.35
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Burst ripples
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          ripples.push({
            x: cx + (Math.random() - 0.5) * 15,
            y: cy + (Math.random() - 0.5) * 15,
            radius: 4,
            maxRadius: 75 + i * 25,
            opacity: 0.45 - i * 0.1
          });
        }, i * 120);
      }

      // Wind gust on petals
      petals.forEach((p) => {
        const dist = Math.hypot(p.x - cx, p.y - cy);
        if (dist < 220) {
          const angle = Math.atan2(p.y - cy, p.x - cx);
          const force = (220 - dist) / 18;
          p.speedX += Math.cos(angle) * force;
          p.speedY += Math.sin(angle) * force;
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Draw single stylized cherry petal
    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flip), 1);

      ctx.beginPath();
      // Organic teardrop petal curve
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.8, -s * 0.5, s * 0.9, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.9, s * 0.6, -s * 0.8, -s * 0.5, 0, -s);

      let colorGrad: CanvasGradient;
      if (p.colorType === 'lavender') {
        colorGrad = ctx.createLinearGradient(0, -s, 0, s);
        colorGrad.addColorStop(0, `rgba(200, 206, 235, ${p.opacity})`);
        colorGrad.addColorStop(1, `rgba(139, 151, 198, ${p.opacity})`);
      } else if (p.colorType === 'deep') {
        colorGrad = ctx.createLinearGradient(0, -s, 0, s);
        colorGrad.addColorStop(0, `rgba(240, 168, 192, ${p.opacity})`);
        colorGrad.addColorStop(1, `rgba(80, 97, 148, ${p.opacity * 0.8})`);
      } else {
        colorGrad = ctx.createLinearGradient(0, -s, 0, s);
        colorGrad.addColorStop(0, `rgba(255, 235, 242, ${p.opacity})`);
        colorGrad.addColorStop(0.6, `rgba(241, 165, 186, ${p.opacity})`);
        colorGrad.addColorStop(1, `rgba(229, 83, 131, ${p.opacity * 0.9})`);
      }

      ctx.fillStyle = colorGrad;
      ctx.fill();

      // Delicate petal central vein
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(0, s * 0.5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.6})`;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      ctx.restore();
    };

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Render ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.2;
        r.opacity *= 0.965;

        if (r.opacity < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(153, 163, 210, ${r.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner harmonic ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(241, 165, 186, ${r.opacity * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      // Render flowing petals
      petals.forEach((p) => {
        // Natural gentle wind sway
        const sway = Math.sin(frame * 0.02 + p.size) * 0.45;
        p.x += p.speedX + sway;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        // Interactive mouse gentle repulsion
        if (mouseRef.current.x > 0) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 1) {
            const push = (120 - dist) / 120;
            p.x += (dx / dist) * push * 3.5;
            p.y += (dy / dist) * push * 3.5;
          }
        }

        // Bound resets with smooth continuous loop
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
          p.speedX = Math.random() * 1.5 - 0.2;
          p.speedY = Math.random() * 1.2 + 0.6;
        }
        if (p.x > width + 20) {
          p.x = -20;
        } else if (p.x < -20) {
          p.x = width + 20;
        }

        drawPetal(p);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
      style={{ opacity: 0.92 }}
    />
  );
};
