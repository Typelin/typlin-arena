import { useEffect, useRef, useState } from 'react';
import { CHAPTERS } from './opticalData';
import type { ChapterMeta } from './opticalData';

export interface OpticalBenchState {
  activeChapter: number;
  scrollProgress: number;
  focalLength: number;
  dispersion: number;
  aberration: number;
  wavelengthNm: number;
  humanCoFocus: number;
  spectralMode: boolean;
  reducedMotion: boolean;
}

export interface InterferometerCanvasProps {
  bench: OpticalBenchState;
  onLensImpulse: (xRatio: number, yRatio: number) => void;
}

interface ProbeNode {
  id: string;
  label: string;
  angle: number;
  radiusRatio: number;
  harmonic: number;
}

const PROBE_NODES: ProbeNode[] = [
  { id: 'N-01', label: 'INTENT_BEAM', angle: 0.42, radiusRatio: 0.28, harmonic: 1.0 },
  { id: 'N-02', label: 'PRISM_DISPERSION', angle: 1.68, radiusRatio: 0.34, harmonic: 1.38 },
  { id: 'N-03', label: 'PARALLAX_VERIFY', angle: 2.94, radiusRatio: 0.24, harmonic: 1.72 },
  { id: 'N-04', label: 'CO_FOCUS_LOCK', angle: 4.19, radiusRatio: 0.31, harmonic: 2.15 },
  { id: 'N-05', label: 'ARGON_COLLIMATOR', angle: 5.45, radiusRatio: 0.27, harmonic: 2.64 },
];

function wavelengthToRgb(nm: number): [number, number, number] {
  const w = Math.max(380, Math.min(700, nm));
  let r = 0;
  let g = 0;
  let b = 0;

  if (w >= 380 && w < 440) {
    r = -(w - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (w >= 440 && w < 490) {
    r = 0;
    g = (w - 440) / (490 - 440);
    b = 1;
  } else if (w >= 490 && w < 510) {
    r = 0;
    g = 1;
    b = -(w - 510) / (510 - 490);
  } else if (w >= 510 && w < 580) {
    r = (w - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (w >= 580 && w < 645) {
    r = 1;
    g = -(w - 645) / (645 - 580);
    b = 0;
  } else {
    r = 1;
    g = 0;
    b = 0;
  }

  return [
    Math.round(r * 235 + 20),
    Math.round(g * 235 + 20),
    Math.round(b * 235 + 20),
  ];
}

export function InterferometerCanvas({ bench, onLensImpulse }: InterferometerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const benchRef = useRef<OpticalBenchState>(bench);
  benchRef.current = bench;

  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    impulseStrength: 0,
    impulseX: 0.5,
    impulseY: 0.5,
  });

  const smoothRef = useRef({
    focal: bench.focalLength,
    dispersion: bench.dispersion,
    aberration: bench.aberration,
    coFocus: bench.humanCoFocus,
    wavelength: bench.wavelengthNm,
    phase: 0,
  });

  const [hoveredProbe, setHoveredProbe] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const currentBench = benchRef.current;
      const chapter: ChapterMeta =
        CHAPTERS[currentBench.activeChapter] ?? CHAPTERS[0];
      const sm = smoothRef.current;
      const ptr = pointerRef.current;

      const lerpFactor = currentBench.reducedMotion ? 0.35 : 0.08;
      const blendedFocalTarget =
        currentBench.focalLength * 0.72 + chapter.focalTarget * 0.28;
      const blendedDispersionTarget =
        currentBench.dispersion * 0.72 + chapter.dispersionTarget * 0.28;

      sm.focal += (blendedFocalTarget - sm.focal) * lerpFactor;
      sm.dispersion += (blendedDispersionTarget - sm.dispersion) * lerpFactor;
      sm.aberration += (currentBench.aberration - sm.aberration) * lerpFactor;
      sm.coFocus += (currentBench.humanCoFocus - sm.coFocus) * lerpFactor;
      sm.wavelength += (currentBench.wavelengthNm - sm.wavelength) * lerpFactor;

      ptr.x += (ptr.targetX - ptr.x) * 0.1;
      ptr.y += (ptr.targetY - ptr.y) * 0.1;
      ptr.impulseStrength *= 0.93;

      if (!currentBench.reducedMotion) {
        sm.phase += 0.014 + sm.dispersion * 0.012;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + (ptr.x - 0.5) * width * 0.08;
      const cy = height * 0.5 + (ptr.y - 0.5) * height * 0.08;
      const baseRadius = Math.min(width, height) * 0.34;

      const [rWave, gWave, bWave] = wavelengthToRgb(sm.wavelength);
      const isSpectral = currentBench.spectralMode;

      // 1. Background calibration reticule & axis hairlines
      ctx.save();
      ctx.strokeStyle = isSpectral
        ? 'rgba(130, 195, 255, 0.13)'
        : 'rgba(26, 25, 23, 0.08)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Tick marks along horizontal optical axis
      const tickStep = Math.max(28, Math.floor(width / 28));
      ctx.beginPath();
      for (let x = tickStep; x < width; x += tickStep) {
        const distFromCenter = Math.abs(x - cx) / (width * 0.5);
        const tickHalf = distFromCenter < 0.35 ? 6 : 3;
        ctx.moveTo(x, cy - tickHalf);
        ctx.lineTo(x, cy + tickHalf);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Dual-wavefront interferometer rings (Human source vs Model lens)
      const sepDistance = (1 - sm.coFocus) * baseRadius * 0.45 + sm.aberration * 24;
      const angleAxis =
        sm.phase * 0.25 + currentBench.scrollProgress * Math.PI * 1.5;

      const sourceA = {
        x: cx - Math.cos(angleAxis) * sepDistance,
        y: cy - Math.sin(angleAxis) * sepDistance * 0.65,
      };
      const sourceB = {
        x: cx + Math.cos(angleAxis) * sepDistance,
        y: cy + Math.sin(angleAxis) * sepDistance * 0.65,
      };

      const ringCount = isSpectral ? 14 : 11;
      for (let i = 1; i <= ringCount; i++) {
        const ratio = i / ringCount;
        const radius =
          baseRadius * (0.14 + ratio * (0.65 + sm.focal * 0.35));

        const waveDrift = currentBench.reducedMotion
          ? 0
          : Math.sin(sm.phase * 1.6 - i * 0.55) * 4 * (1 - sm.focal * 0.5);

        const rA = Math.max(4, radius + waveDrift);
        const rB = Math.max(4, radius - waveDrift);

        const alphaBase = (1 - ratio * 0.72) * (isSpectral ? 0.32 : 0.2);

        // Wavefront A (Human Intent beam)
        ctx.beginPath();
        ctx.arc(sourceA.x, sourceA.y, rA, 0, Math.PI * 2);
        ctx.strokeStyle = isSpectral
          ? `rgba(${rWave}, ${gWave}, ${bWave}, ${alphaBase})`
          : `rgba(29, 78, 137, ${alphaBase})`;
        ctx.lineWidth = i % 3 === 0 ? 1.35 : 0.85;
        ctx.stroke();

        // Wavefront B (Argon Optical Response)
        ctx.beginPath();
        ctx.arc(sourceB.x, sourceB.y, rB, 0, Math.PI * 2);
        ctx.strokeStyle = isSpectral
          ? `rgba(255, 168, 92, ${alphaBase * 0.9})`
          : `rgba(196, 77, 44, ${alphaBase * 0.88})`;
        ctx.lineWidth = i % 4 === 0 ? 1.25 : 0.75;
        ctx.stroke();
      }

      // 3. Spectral dispersion fan / caustic rays
      const rayCount = 24;
      const spreadAngle = (0.18 + sm.dispersion * 0.95) * Math.PI;
      ctx.save();
      for (let i = 0; i < rayCount; i++) {
        const t = i / (rayCount - 1) - 0.5;
        const rayAngle =
          t * spreadAngle +
          Math.sin(sm.phase * 0.5 + i * 0.3) * 0.04 * (1 - sm.focal);
        const rayNm = 390 + (i / (rayCount - 1)) * 300;
        const [rr, gg, bb] = wavelengthToRgb(rayNm);

        const innerR = baseRadius * 0.12;
        const outerR = baseRadius * (0.78 + sm.dispersion * 0.38);

        const x1 = cx + Math.cos(rayAngle) * innerR;
        const y1 = cy + Math.sin(rayAngle) * innerR;
        const x2 = cx + Math.cos(rayAngle) * outerR;
        const y2 = cy + Math.sin(rayAngle) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        const rayAlpha = isSpectral
          ? 0.22 + sm.dispersion * 0.25
          : 0.08 + sm.dispersion * 0.16;
        ctx.strokeStyle = `rgba(${rr}, ${gg}, ${bb}, ${rayAlpha})`;
        ctx.lineWidth = isSpectral ? 1.4 : 1.0;
        ctx.stroke();
      }
      ctx.restore();

      // 4. Central precision aperture & chromatic aberration shift
      const apertureR = baseRadius * (0.22 + sm.focal * 0.26);
      const chromaShift = sm.aberration * 14;

      if (chromaShift > 0.4) {
        ctx.beginPath();
        ctx.arc(cx - chromaShift, cy, apertureR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(215, 65, 45, 0.32)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + chromaShift, cy, apertureR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(40, 115, 210, 0.32)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Main diaphragm circle
      ctx.beginPath();
      ctx.arc(cx, cy, apertureR, 0, Math.PI * 2);
      ctx.strokeStyle = isSpectral
        ? `rgba(${rWave}, ${gWave}, ${bWave}, 0.78)`
        : 'rgba(24, 23, 21, 0.65)';
      ctx.lineWidth = 1.75;
      ctx.stroke();

      // Diaphragm blades (12-blade Leica/Zeiss style geometric segments)
      const bladeCount = 12;
      const bladeInnerR = apertureR * Math.max(0.18, 1 - sm.focal * 0.72);
      ctx.save();
      ctx.strokeStyle = isSpectral
        ? 'rgba(210, 230, 255, 0.28)'
        : 'rgba(24, 23, 21, 0.22)';
      ctx.lineWidth = 1;
      for (let b = 0; b < bladeCount; b++) {
        const a1 = (b / bladeCount) * Math.PI * 2 + sm.phase * 0.15;
        const a2 = a1 + 0.42;
        ctx.beginPath();
        ctx.moveTo(
          cx + Math.cos(a1) * apertureR,
          cy + Math.sin(a1) * apertureR
        );
        ctx.lineTo(
          cx + Math.cos(a2) * bladeInnerR,
          cy + Math.sin(a2) * bladeInnerR
        );
        ctx.stroke();
      }
      ctx.restore();

      // 5. Impulse ripple from user click / tap on the optical bench
      if (ptr.impulseStrength > 0.02) {
        const impX = ptr.impulseX * width;
        const impY = ptr.impulseY * height;
        const impR = (1 - ptr.impulseStrength) * baseRadius * 0.95 + 12;

        ctx.beginPath();
        ctx.arc(impX, impY, impR, 0, Math.PI * 2);
        ctx.strokeStyle = isSpectral
          ? `rgba(${rWave}, ${gWave}, ${bWave}, ${ptr.impulseStrength * 0.75})`
          : `rgba(196, 77, 44, ${ptr.impulseStrength * 0.65})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 6. Orbital telemetry nodes around the bench
      ctx.save();
      ctx.font = '10px "JetBrains Mono", "SFMono-Regular", Consolas, monospace';
      PROBE_NODES.forEach((node, idx) => {
        const orbitAngle =
          node.angle +
          sm.phase * 0.12 * node.harmonic +
          currentBench.activeChapter * 0.35;
        const orbitR =
          Math.min(width, height) *
          (node.radiusRatio + sm.dispersion * 0.05);

        const nx = cx + Math.cos(orbitAngle) * orbitR;
        const ny = cy + Math.sin(orbitAngle) * orbitR;

        const isActiveChapterNode = idx === currentBench.activeChapter;

        // Hairline connector to center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isActiveChapterNode
          ? isSpectral
            ? `rgba(${rWave}, ${gWave}, ${bWave}, 0.38)`
            : 'rgba(196, 77, 44, 0.32)'
          : isSpectral
          ? 'rgba(160, 195, 235, 0.12)'
          : 'rgba(26, 25, 23, 0.09)';
        ctx.lineWidth = isActiveChapterNode ? 1.2 : 0.75;
        ctx.stroke();

        // Node target marker
        ctx.beginPath();
        ctx.arc(nx, ny, isActiveChapterNode ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isActiveChapterNode
          ? isSpectral
            ? `rgb(${rWave}, ${gWave}, ${bWave})`
            : '#c44d2c'
          : isSpectral
          ? 'rgba(215, 230, 250, 0.65)'
          : 'rgba(26, 25, 23, 0.55)';
        ctx.fill();

        // Node telemetry label
        ctx.fillStyle = isSpectral
          ? 'rgba(215, 232, 255, 0.78)'
          : 'rgba(26, 25, 23, 0.68)';
        ctx.fillText(`${node.id} · ${node.label}`, nx + 8, ny + 3);
      });
      ctx.restore();

      // 7. Focal lock crosshair at center
      const lockError = Math.abs(1 - sm.coFocus) * 18 + sm.aberration * 12;
      ctx.save();
      ctx.strokeStyle =
        lockError < 3.5
          ? isSpectral
            ? '#6ee7b7'
            : '#1d6b48'
          : isSpectral
          ? '#f59e0b'
          : '#c44d2c';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + lockError * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / Math.max(1, rect.width);
    const yRatio = (e.clientY - rect.top) / Math.max(1, rect.height);
    pointerRef.current.targetX = Math.max(0, Math.min(1, xRatio));
    pointerRef.current.targetY = Math.max(0, Math.min(1, yRatio));

    const dx = xRatio - 0.5;
    const dy = yRatio - 0.5;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.16) {
      setHoveredProbe('CORE_APERTURE_LOCK');
    } else if (dist < 0.36) {
      setHoveredProbe('INTERFERENCE_FRINGE_ZONE');
    } else {
      setHoveredProbe(null);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))
    );
    const yRatio = Math.max(
      0,
      Math.min(1, (e.clientY - rect.top) / Math.max(1, rect.height))
    );
    pointerRef.current.impulseX = xRatio;
    pointerRef.current.impulseY = yRatio;
    pointerRef.current.impulseStrength = 1;
    onLensImpulse(xRatio, yRatio);
  };

  const activeMeta: ChapterMeta =
    CHAPTERS[bench.activeChapter] ?? CHAPTERS[0];

  return (
    <div className="interferometer-stage" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="interferometer-canvas"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
      />
      <div className="interferometer-hud">
        <div className="hud-corner hud-top-left">
          <span className="hud-tag">INSTRUMENT // GEMINI-4-ARGON</span>
          <span className="hud-value">
            CH.{activeMeta.roman} — {activeMeta.code}
          </span>
        </div>
        <div className="hud-corner hud-bottom-left">
          <span className="hud-tag">
            λ {Math.round(bench.wavelengthNm)}nm · f/
            {(1.2 + (1 - bench.focalLength) * 4.4).toFixed(2)}
          </span>
          <span className="hud-value">
            CO-FOCUS {(bench.humanCoFocus * 100).toFixed(0)}%
            {hoveredProbe ? ` · [${hoveredProbe}]` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}