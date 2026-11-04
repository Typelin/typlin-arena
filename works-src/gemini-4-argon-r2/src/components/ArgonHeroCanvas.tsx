import React, { useEffect, useRef } from 'react';

export type ExcitationMode = 'INERT_18V' | 'IONIZED_420V' | 'SUPERCRITICAL_1048V';

interface ArgonHeroCanvasProps {
  mode: ExcitationMode;
  reducedMotion: boolean;
}

interface Filament {
  baseAngle: number;
  speed: number;
  phase: number;
  freq: number;
  amp: number;
  secondaryPhase: number;
}

const FILAMENT_COUNT = 18; // Argon Atomic Number Z = 18
const SPECTRAL_LINES = [
  { label: '415.8nm Ar-I', angle: -Math.PI * 0.32 },
  { label: '420.0nm Ar-I', angle: Math.PI * 0.16 },
  { label: '451.1nm Ar-II', angle: Math.PI * 0.34 },
  { label: '488.0nm Ar-II', angle: Math.PI * 0.66 },
  { label: '750.3nm Ar-I', angle: Math.PI * 0.84 },
  { label: '811.5nm Ar-I', angle: -Math.PI * 0.68 },
];

export const ArgonHeroCanvas: React.FC<ArgonHeroCanvasProps> = ({ mode, reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean; smoothX: number; smoothY: number }>({
    x: 0,
    y: 0,
    active: false,
    smoothX: 0,
    smoothY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const filaments: Filament[] = Array.from({ length: FILAMENT_COUNT }, (_, i) => ({
      baseAngle: (i / FILAMENT_COUNT) * Math.PI * 2,
      speed: 0.55 + (i % 5) * 0.14,
      phase: i * 1.17,
      freq: 2.2 + (i % 3) * 0.65,
      amp: 0.16 + (i % 4) * 0.045,
      secondaryPhase: i * 0.73,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 280);
      height = Math.max(rect.height, 260);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
      pointerRef.current.active = Math.abs(nx) <= 1.2 && Math.abs(ny) <= 1.2;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = reducedMotion ? 2.4 : (now - startTime) * 0.001;

      const ptr = pointerRef.current;
      const targetX = ptr.active ? ptr.x : Math.cos(elapsed * 0.35) * 0.18;
      const targetY = ptr.active ? ptr.y : Math.sin(elapsed * 0.28) * 0.18;
      ptr.smoothX += (targetX - ptr.smoothX) * 0.07;
      ptr.smoothY += (targetY - ptr.smoothY) * 0.07;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const minDim = Math.min(width, height);
      const chamberRadius = minDim * 0.33;
      const outerRingRadius = minDim * 0.405;

      const modeConfig =
        mode === 'INERT_18V'
          ? {
              activeCount: 9,
              turbulence: 0.55,
              coreScale: 0.88,
              primaryRgb: '99, 102, 241',
              secondaryRgb: '56, 189, 248',
              accentRgb: '129, 140, 248',
              coreHex: '#E0E7FF',
              outerGlowRgb: '79, 70, 229',
              ringSpeed: 0.12,
            }
          : mode === 'SUPERCRITICAL_1048V'
            ? {
                activeCount: 18,
                turbulence: 1.45,
                coreScale: 1.22,
                primaryRgb: '245, 158, 11',
                secondaryRgb: '236, 72, 153',
                accentRgb: '56, 232, 255',
                coreHex: '#FFFBEB',
                outerGlowRgb: '217, 70, 239',
                ringSpeed: 0.42,
              }
            : {
                activeCount: 18,
                turbulence: 1.0,
                coreScale: 1.05,
                primaryRgb: '139, 92, 246',
                secondaryRgb: '56, 232, 255',
                accentRgb: '244, 114, 182',
                coreHex: '#F8FAFC',
                outerGlowRgb: '124, 58, 237',
                ringSpeed: 0.24,
              };

      // 1. Deep Atmospheric Back-Glow & Chromatic Caustic Halo
      const bgRadial = ctx.createRadialGradient(
        cx + ptr.smoothX * 28,
        cy + ptr.smoothY * 28,
        chamberRadius * 0.05,
        cx,
        cy,
        outerRingRadius * 1.38
      );
      bgRadial.addColorStop(0, `rgba(${modeConfig.primaryRgb}, 0.38)`);
      bgRadial.addColorStop(0.36, `rgba(${modeConfig.outerGlowRgb}, 0.20)`);
      bgRadial.addColorStop(0.68, `rgba(${modeConfig.secondaryRgb}, 0.08)`);
      bgRadial.addColorStop(1, 'rgba(5, 6, 11, 0)');
      ctx.fillStyle = bgRadial;
      ctx.fillRect(0, 0, width, height);

      // 2. Precision Optical Bezel & Graduated Vernier Ring
      ctx.save();
      ctx.translate(cx, cy);

      // Equatorial crosshair axes
      ctx.beginPath();
      ctx.moveTo(-outerRingRadius * 1.12, 0);
      ctx.lineTo(-chamberRadius * 1.04, 0);
      ctx.moveTo(chamberRadius * 1.04, 0);
      ctx.lineTo(outerRingRadius * 1.12, 0);
      ctx.moveTo(0, -outerRingRadius * 1.12);
      ctx.lineTo(0, -chamberRadius * 1.04);
      ctx.moveTo(0, chamberRadius * 1.04);
      ctx.lineTo(0, outerRingRadius * 1.12);
      ctx.strokeStyle = `rgba(${modeConfig.secondaryRgb}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer brushed metallic track
      ctx.beginPath();
      ctx.arc(0, 0, outerRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.24)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, outerRingRadius * 1.06, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${modeConfig.primaryRgb}, 0.22)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graduated ticks (180 ticks around perimeter, 18 major Argon shell markers)
      const tickRotation = elapsed * modeConfig.ringSpeed * 0.35;
      for (let i = 0; i < 180; i++) {
        const angle = (i / 180) * Math.PI * 2 + tickRotation;
        const isShell = i % 10 === 0;
        const isMid = i % 5 === 0;
        const innerR = outerRingRadius - (isShell ? 11 : isMid ? 6 : 3);
        const outerR = outerRingRadius + (isShell ? 4 : 0);

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(cosA * innerR, sinA * innerR);
        ctx.lineTo(cosA * outerR, sinA * outerR);
        ctx.strokeStyle = isShell
          ? `rgba(${modeConfig.secondaryRgb}, 0.85)`
          : isMid
            ? 'rgba(203, 213, 225, 0.36)'
            : 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = isShell ? 1.8 : 0.8;
        ctx.stroke();
      }

      // Spectral wavelength callouts positioned safely within canvas bounds
      if (minDim >= 360) {
        ctx.font = '600 9.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.78)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        SPECTRAL_LINES.forEach((item) => {
          const lx = Math.cos(item.angle) * (outerRingRadius * 1.115);
          const ly = Math.sin(item.angle) * (outerRingRadius * 1.115);
          ctx.fillText(item.label, lx, ly);
        });
      }

      // 3. Electron Shell Orbital Rings (2 - 8 - 8 Argon Configuration: [Ne] 3s2 3p6)
      const shellRadii = [chamberRadius * 0.28, chamberRadius * 0.62, chamberRadius * 1.0];
      const shellCounts = [2, 8, 8];
      shellRadii.forEach((r, sIdx) => {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle =
          sIdx === 2
            ? `rgba(${modeConfig.secondaryRgb}, 0.55)`
            : `rgba(${modeConfig.primaryRgb}, ${0.22 + sIdx * 0.08})`;
        ctx.lineWidth = sIdx === 2 ? 2.2 : 1.1;
        if (sIdx === 1) {
          ctx.setLineDash([4, 6]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        const count = shellCounts[sIdx];
        const dir = sIdx % 2 === 0 ? 1 : -1;
        for (let eIdx = 0; eIdx < count; eIdx++) {
          const eAngle =
            (eIdx / count) * Math.PI * 2 + elapsed * modeConfig.ringSpeed * dir * (1.5 - sIdx * 0.3);
          const ex = Math.cos(eAngle) * r;
          const ey = Math.sin(eAngle) * r;

          ctx.beginPath();
          ctx.arc(ex, ey, sIdx === 2 ? 3.0 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = sIdx === 2 ? '#38E8FF' : '#C4B5FD';
          ctx.fill();
        }
      });

      ctx.restore();

      // 4. Quartz Containment Vessel Shadow & Inner Caustic Base
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, chamberRadius, 0, Math.PI * 2);
      const vesselGrad = ctx.createRadialGradient(
        cx - chamberRadius * 0.25,
        cy - chamberRadius * 0.25,
        chamberRadius * 0.05,
        cx,
        cy,
        chamberRadius
      );
      vesselGrad.addColorStop(0, 'rgba(17, 20, 38, 0.32)');
      vesselGrad.addColorStop(0.68, 'rgba(7, 9, 19, 0.72)');
      vesselGrad.addColorStop(0.92, `rgba(${modeConfig.primaryRgb}, 0.28)`);
      vesselGrad.addColorStop(1, `rgba(${modeConfig.secondaryRgb}, 0.58)`);
      ctx.fillStyle = vesselGrad;
      ctx.fill();
      ctx.restore();

      // 5. High-Voltage Plasma Discharge Filaments (Additive Blending)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pointerWorldX = cx + ptr.smoothX * chamberRadius * 0.78;
      const pointerWorldY = cy + ptr.smoothY * chamberRadius * 0.78;

      for (let i = 0; i < modeConfig.activeCount; i++) {
        const f = filaments[i];
        const baseA =
          f.baseAngle +
          elapsed * 0.16 * (i % 2 === 0 ? 1 : -1) +
          Math.sin(elapsed * 0.7 + f.phase) * 0.14;

        const rawEndX = cx + Math.cos(baseA) * chamberRadius * 0.985;
        const rawEndY = cy + Math.sin(baseA) * chamberRadius * 0.985;

        const dxPtr = pointerWorldX - rawEndX;
        const dyPtr = pointerWorldY - rawEndY;
        const distPtr = Math.hypot(dxPtr, dyPtr);
        const pullFactor = Math.max(0, 1 - distPtr / (chamberRadius * 1.45)) * (ptr.active ? 0.48 : 0.2);

        const targetAngle = Math.atan2(
          rawEndY + dyPtr * pullFactor - cy,
          rawEndX + dxPtr * pullFactor - cx
        );

        const endX = cx + Math.cos(targetAngle) * (chamberRadius - 2);
        const endY = cy + Math.sin(targetAngle) * (chamberRadius - 2);

        const perpX = -Math.sin(targetAngle);
        const perpY = Math.cos(targetAngle);

        const wave1 =
          Math.sin(elapsed * f.speed * 3.2 + f.phase) *
          chamberRadius *
          f.amp *
          modeConfig.turbulence;
        const wave2 =
          Math.cos(elapsed * f.speed * 2.5 - f.secondaryPhase) *
          chamberRadius *
          (f.amp * 0.85) *
          modeConfig.turbulence;

        const cp1x = cx + Math.cos(targetAngle) * chamberRadius * 0.33 + perpX * wave1;
        const cp1y = cy + Math.sin(targetAngle) * chamberRadius * 0.33 + perpY * wave1;
        const cp2x = cx + Math.cos(targetAngle) * chamberRadius * 0.68 - perpX * wave2;
        const cp2y = cy + Math.sin(targetAngle) * chamberRadius * 0.68 - perpY * wave2;

        // Outer ionized violet sheath
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.strokeStyle = `rgba(${modeConfig.primaryRgb}, 0.28)`;
        ctx.lineWidth = 9.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Mid spectral cyan/magenta stream
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.strokeStyle =
          i % 3 === 0
            ? `rgba(${modeConfig.secondaryRgb}, 0.58)`
            : i % 3 === 1
              ? `rgba(${modeConfig.primaryRgb}, 0.62)`
              : `rgba(${modeConfig.accentRgb}, 0.52)`;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Incandescent white-gold filament core
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        ctx.strokeStyle = 'rgba(255, 252, 245, 0.92)';
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Anode contact flare on the inner quartz glass wall
        const spotGlow = ctx.createRadialGradient(endX, endY, 0.5, endX, endY, 16);
        spotGlow.addColorStop(0, '#FFFFFF');
        spotGlow.addColorStop(0.38, `rgba(${modeConfig.secondaryRgb}, 0.9)`);
        spotGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGlow;
        ctx.beginPath();
        ctx.arc(endX, endY, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Central High-Pressure Argon-18 Core Sphere
      const coreR = chamberRadius * 0.20 * modeConfig.coreScale;
      const coreGlow = ctx.createRadialGradient(cx, cy, coreR * 0.1, cx, cy, coreR * 2.8);
      coreGlow.addColorStop(0, modeConfig.coreHex);
      coreGlow.addColorStop(0.3, `rgba(${modeConfig.secondaryRgb}, 0.92)`);
      coreGlow.addColorStop(0.65, `rgba(${modeConfig.primaryRgb}, 0.48)`);
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 7. Optical Lens Specular Reflection Arcs (Glass Surface Realism)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, chamberRadius * 0.93, -Math.PI * 0.78, -Math.PI * 0.28);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, chamberRadius * 0.93, Math.PI * 0.22, Math.PI * 0.62);
      ctx.strokeStyle = `rgba(${modeConfig.secondaryRgb}, 0.32)`;
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Central crisp Ar-18 Core Emblem Badge (Sized with generous padding on all viewports)
      const badgeR = Math.max(19, chamberRadius * 0.145);
      ctx.beginPath();
      ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 8, 17, 0.9)';
      ctx.fill();
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = `rgba(${modeConfig.secondaryRgb}, 0.92)`;
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      const fontPx = Math.max(11, Math.round(badgeR * 0.62));
      ctx.font = `800 ${fontPx}px "Syne", "Space Grotesk", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ar¹⁸', cx, cy);
      ctx.restore();

      if (!reducedMotion) {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [mode, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="argon-hero-canvas"
      aria-label="Gemini 4 Argon 高壓氬氣電離光譜球體互動視覺"
    />
  );
};
