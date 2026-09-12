import React, { useEffect, useRef } from 'react';

export interface ChamberParams {
  entropy: number;     // 0 = ordered lattice, 1 = chaotic plasma
  tension: number;     // 0 = relaxed manifold, 1 = hyper-compressed geodesic
  phaseIndex: number;  // 0 to 3 (corresponding to the 4 phases)
  mouseX: number;      // -1 to 1 normalized
  mouseY: number;      // -1 to 1 normalized
  scrollProgress: number; // 0 to 1
}

interface LatentChamberCanvasProps {
  params: ChamberParams;
  interactive?: boolean;
}

export const LatentChamberCanvas: React.FC<LatentChamberCanvasProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Topological Point Cloud definition
    const POINT_COUNT = 380;
    const points: {
      u: number; // Ring angle (0 to 2PI)
      v: number; // Ring elevation (-PI to PI)
      radBase: number;
      speed: number;
      phaseOffset: number;
      hueShift: number;
    }[] = [];

    for (let i = 0; i < POINT_COUNT; i++) {
      points.push({
        u: (i / POINT_COUNT) * Math.PI * 2 * 3,
        v: (i / POINT_COUNT) * Math.PI - Math.PI / 2,
        radBase: 140 + Math.random() * 80,
        speed: 0.2 + Math.random() * 0.4,
        phaseOffset: Math.random() * Math.PI * 2,
        hueShift: Math.random() * 40 - 20
      });
    }

    let time = 0;
    const render = () => {
      time += 0.016;

      // Dark obsidian space background with subtle trail decay
      ctx.fillStyle = '#08090c';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const { entropy, tension, phaseIndex, mouseX, mouseY, scrollProgress } = params;

      // Camera / Perspective calculations
      const rotX = time * 0.25 + mouseY * 0.6 + scrollProgress * Math.PI * 1.5;
      const rotY = time * 0.35 + mouseX * 0.8 + scrollProgress * Math.PI * 2;
      const fov = 400 + tension * 200;

      // Phase colors: 
      // 0: Quantum Violet/Blue (#818cf8 / #a78bfa)
      // 1: Amber/Gold Tension (#e28a2b / #fbbf24)
      // 2: Refraction Teal/Cyan (#2dd4bf / #38bdf8)
      // 3: Crystalline White/Prism (#f8fafc / #e0e7ff)
      const colorSchemes = [
        { r: 167, g: 139, b: 250 }, // Violet
        { r: 226, g: 138, b: 43 },  // Amber
        { r: 45, g: 212, b: 191 },  // Teal
        { r: 248, g: 250, b: 252 }, // Crystalline
      ];

      const currentPhaseColor = colorSchemes[phaseIndex % colorSchemes.length];

      // Draw subtle background radial gradient that follows mouse tension
      const bgGrad = ctx.createRadialGradient(
        cx + mouseX * 80,
        cy + mouseY * 80,
        30,
        cx,
        cy,
        Math.max(width, height) * 0.65
      );
      bgGrad.addColorStop(0, `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, ${0.08 + entropy * 0.05})`);
      bgGrad.addColorStop(0.5, 'rgba(15, 17, 23, 0.4)');
      bgGrad.addColorStop(1, 'rgba(8, 9, 12, 1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Project 3D topological manifold onto 2D canvas
      const projectedPoints: { x: number; y: number; z: number; scale: number; alpha: number; u: number; v: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Harmonic Torus Knot & Strange Attractor Hybrid equation
        // Dynamic deformation based on entropy (chaotic noise) and tension (crystallization into geodesic)
        const t = time * p.speed + p.phaseOffset;
        
        // Torus knot harmonic equations
        const pMod = 2 + Math.floor(phaseIndex);
        
        // Latent manifold parametric equations
        const knotR = (1 - tension * 0.5) * 80;
        const knotFreq = pMod * p.u + tension * 3;
        
        // Noise injection proportional to entropy
        const noiseX = Math.sin(t * 3 + p.u) * (entropy * 80);
        const noiseY = Math.cos(t * 2.5 + p.v) * (entropy * 80);
        const noiseZ = Math.sin(t * 4 + p.u * 2) * (entropy * 80);

        // Parametric 3D coords
        let x0 = (p.radBase + knotR * Math.cos(knotFreq)) * Math.cos(p.u) + noiseX;
        let y0 = (p.radBase + knotR * Math.cos(knotFreq)) * Math.sin(p.u) + noiseY;
        let z0 = knotR * Math.sin(knotFreq) + p.v * 30 * (1 - tension) + noiseZ;

        // Apply 3D Rotation Matrix
        // Y-axis rotation
        let x1 = x0 * Math.cos(rotY) - z0 * Math.sin(rotY);
        let z1 = x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

        // X-axis rotation
        let y2 = y0 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y0 * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Distance from camera
        const distance = 480 + z2;
        if (distance <= 10) continue;

        const scale = fov / distance;
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const alpha = Math.max(0.1, Math.min(1, (z2 + 200) / 400));

        projectedPoints.push({
          x: px,
          y: py,
          z: z2,
          scale,
          alpha,
          u: p.u,
          v: p.v
        });
      }

      // Sort points by depth (Z-buffer painter's algorithm)
      projectedPoints.sort((a, b) => a.z - b.z);

      // Phase-specific drawing mode:
      // In Phase 0 (Entropy): Dispersion clouds & fluid trails
      // In Phase 1 (Manifold): Coherent lines & geodesic tension cables
      // In Phase 2 (Refraction): Geometric prisms & chromatic offsets
      // In Phase 3 (Synthesis): Crystalline polygon faces & razor-sharp edges

      // Draw connective resonant geodesic lines
      ctx.lineWidth = 1;
      const maxConnectDist = 65 + tension * 40;
      const step = phaseIndex === 3 ? 2 : 3;

      for (let i = 0; i < projectedPoints.length; i += step) {
        const pA = projectedPoints[i];
        for (let j = i + 1; j < Math.min(i + 8, projectedPoints.length); j++) {
          const pB = projectedPoints[j];
          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.35 * Math.min(pA.alpha, pB.alpha);
            
            // Chromatic dispersion effect on connective fibers
            if (phaseIndex === 2) {
              // Red-Cyan offset
              ctx.strokeStyle = `rgba(226, 138, 43, ${lineAlpha * 0.7})`;
              ctx.beginPath();
              ctx.moveTo(pA.x - 1.5, pA.y);
              ctx.lineTo(pB.x - 1.5, pB.y);
              ctx.stroke();

              ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha * 0.8})`;
              ctx.beginPath();
              ctx.moveTo(pA.x + 1.5, pA.y);
              ctx.lineTo(pB.x + 1.5, pB.y);
              ctx.stroke();
            } else {
              ctx.strokeStyle = `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(pA.x, pA.y);
              ctx.lineTo(pB.x, pB.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw nodal particle points
      for (let i = 0; i < projectedPoints.length; i++) {
        const pt = projectedPoints[i];
        const radius = Math.max(1, pt.scale * (1.8 + (1 - tension) * 1.5));

        ctx.fillStyle = `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, ${pt.alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // High tension halo around key nodal anchors
        if (i % 7 === 0) {
          ctx.strokeStyle = `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, ${pt.alpha * 0.3})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius * 3.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Center Core Singularity Focus (Lens Aperture & Rings)
      const corePulse = Math.sin(time * 2) * 6 + 18;
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, corePulse * 4);
      coreGrad.addColorStop(0, `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, 0.6)`);
      coreGrad.addColorStop(0.4, `rgba(${currentPhaseColor.r}, ${currentPhaseColor.g}, ${currentPhaseColor.b}, 0.15)`);
      coreGrad.addColorStop(1, 'rgba(8, 9, 12, 0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, corePulse * 4, 0, Math.PI * 2);
      ctx.fill();

      // Precision Reticle & Caliper Overlay
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, 180 + tension * 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 260 - entropy * 30, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle crosshairs
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.moveTo(cx - 320, cy);
      ctx.lineTo(cx + 320, cy);
      ctx.moveTo(cx, cy - 320);
      ctx.lineTo(cx, cy + 320);
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [params]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-label="超維拓撲共振儀畫布"
      />
    </div>
  );
};
