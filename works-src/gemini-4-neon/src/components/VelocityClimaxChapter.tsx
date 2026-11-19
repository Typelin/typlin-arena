import { useEffect, useRef, useState } from 'react';
import { COMPETITORS, DOMAIN_SUB_INDICES, QUERY_DATE } from '../data/facts';
import { neonAudio } from '../utils/neonAudio';

interface VelocityClimaxChapterProps {
  reducedMotion: boolean;
}

type ClimaxMode = 'jets' | 'gravity' | 'prism';

interface Particle {
  group: number; // 0..3 for models, 0..5 for domains
  x: number;
  y: number;
  vx: number;
  vy: number;
  u: number;
  spread: number;
  speedMul: number;
  size: number;
  angle: number;
}

// Order vertically by Intelligence Index hierarchy: #2 Astra -> #3 Neon -> #4 Carbon -> Hydrogen
const MODELS_ORDERED = [
  COMPETITORS[0], // #2 GPT-6.2 Astra (max)  | AA 62 | 50 tok/s  | $40
  COMPETITORS[1], // #3 Gemini 4 Neon (xhigh)| AA 61 | 110 tok/s | $15 (PROTAGONIST)
  COMPETITORS[2], // #4 Gemini 4 Carbon (high)| AA 60 | 55 tok/s | $20
  COMPETITORS[3], // Hydrogen (xhigh)        | AA 54 | 169 tok/s | $7.5
];

export function VelocityClimaxChapter({ reducedMotion }: VelocityClimaxChapterProps) {
  const [mode, setMode] = useState<ClimaxMode>('jets');
  const [focusedId, setFocusedId] = useState<string>('gemini-4-neon');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ mode, focusedId });
  stateRef.current = { mode, focusedId };

  const switchMode = (next: ClimaxMode) => {
    setMode(next);
    neonAudio.playGlassChime(next === 'jets' ? 585 : next === 'gravity' ? 440 : 720);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    const t0 = performance.now();

    // 1,600 persistent physics particles that seamlessly swarm & re-choreograph across all 3 modes!
    const COUNT = 1600;
    const particles: Particle[] = Array.from({ length: COUNT }, (_, i) => {
      const r1 = ((i * 7919 + 104729) % 100000) / 100000;
      const r2 = ((i * 3571 + 49157) % 100000) / 100000;
      const r3 = ((i * 1993 + 98317) % 100000) / 100000;
      // Bias extra particle density into Gemini 4 Neon (group 1) for dramatic luminous core
      const group = i < 640 ? 1 : i < 960 ? 0 : i < 1280 ? 2 : 3;
      return {
        group,
        x: r1,
        y: r2,
        vx: 0,
        vy: 0,
        u: r1,
        spread: (r2 - 0.5) * 2,
        speedMul: 0.72 + r3 * 0.56,
        size: r3 > 0.85 ? 2.4 : 1.35,
        angle: r1 * Math.PI * 2,
      };
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let prevNow = t0;

    const draw = (now: number) => {
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const dt = Math.min(0.05, Math.max(0.004, (now - prevNow) * 0.001));
      prevNow = now;
      const t = reducedMotion ? 2.4 : (now - t0) * 0.001;
      const { mode: activeMode, focusedId: activeFocus } = stateRef.current;
      const compact = w < 680 * dpr;

      // Deep darkroom obsidian void
      ctx.fillStyle = '#040508';
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural optical horizon glow centered on Neon's dominant zone
      const glowY = activeMode === 'jets' ? h * 0.42 : h * 0.5;
      const glowX = activeMode === 'prism' ? w * 0.34 : w * 0.48;
      const amb = ctx.createRadialGradient(glowX, glowY, 12 * dpr, glowX, glowY, w * 0.62);
      amb.addColorStop(0, 'rgba(255, 46, 18, 0.22)');
      amb.addColorStop(0.45, 'rgba(255, 118, 26, 0.07)');
      amb.addColorStop(1, 'rgba(4, 5, 8, 0)');
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, w, h);

      // Ultra-subtle calibrated vertical interferometer hairlines
      ctx.strokeStyle = 'rgba(255, 248, 240, 0.04)';
      ctx.lineWidth = dpr;
      const vCols = compact ? 6 : 12;
      for (let c = 1; c < vCols; c++) {
        const gx = (w / vCols) * c;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      if (activeMode === 'jets') {
        // =====================================================================
        // MODE 1: KINETIC PHOTON JET CATHEDRAL (TRUE PROPORTIONAL VELOCITIES)
        // =====================================================================
        const padLeft = (compact ? 16 : 64) * dpr;
        const padRight = (compact ? 16 : 64) * dpr;
        const trackStartX = compact ? padLeft : w * 0.25;
        const trackEndX = compact ? w - padRight : w * 0.85;
        const trackW = Math.max(80 * dpr, trackEndX - trackStartX);

        const topPad = (compact ? 36 : 44) * dpr;
        const botPad = (compact ? 26 : 36) * dpr;
        const laneH = (h - topPad - botPad) / MODELS_ORDERED.length;

        // Subtle giant ghosted background watermark "2.2×" in obsidian depth
        if (!compact) {
          ctx.save();
          ctx.font = `700 ${Math.min(w * 0.24, 290 * dpr)}px "Space Grotesk", sans-serif`;
          ctx.fillStyle = 'rgba(255, 46, 18, 0.045)';
          ctx.textAlign = 'right';
          ctx.fillText('2.2×', w - 42 * dpr, h * 0.78);
          ctx.restore();
        }

        // Draw structural beam cores & shock cones per model lane
        MODELS_ORDERED.forEach((m, idx) => {
          const cy = topPad + laneH * (idx + 0.5) + (compact ? 14 * dpr : 0);
          const isNeon = Boolean(m.isSelf);
          const isFocused = m.id === activeFocus;
          const speedRatio = m.outputSpeed / 172;
          const beamLen = trackW * speedRatio;

          // Hairline lane separator
          if (idx > 0) {
            ctx.strokeStyle = 'rgba(255, 248, 240, 0.06)';
            ctx.lineWidth = dpr;
            ctx.beginPath();
            ctx.moveTo(padLeft, topPad + laneH * idx);
            ctx.lineTo(w - padRight, topPad + laneH * idx);
            ctx.stroke();
          }

          // Volumetric glowing jet core
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          const coreH = (isNeon ? 10 : isFocused ? 5 : 3) * dpr;
          const auraH = (isNeon ? 52 : isFocused ? 22 : 12) * dpr;

          const auraGrad = ctx.createLinearGradient(trackStartX, cy - auraH, trackStartX, cy + auraH);
          if (isNeon) {
            auraGrad.addColorStop(0, 'rgba(255, 46, 18, 0)');
            auraGrad.addColorStop(0.5, 'rgba(255, 52, 18, 0.34)');
            auraGrad.addColorStop(1, 'rgba(255, 46, 18, 0)');
          } else {
            auraGrad.addColorStop(0, 'rgba(180, 196, 224, 0)');
            auraGrad.addColorStop(0.5, isFocused ? 'rgba(210, 224, 248, 0.20)' : 'rgba(150, 165, 190, 0.09)');
            auraGrad.addColorStop(1, 'rgba(180, 196, 224, 0)');
          }
          ctx.fillStyle = auraGrad;
          ctx.fillRect(trackStartX, cy - auraH, beamLen, auraH * 2);

          const beamGrad = ctx.createLinearGradient(trackStartX, cy, trackStartX + beamLen, cy);
          if (isNeon) {
            beamGrad.addColorStop(0, 'rgba(255, 46, 18, 0.25)');
            beamGrad.addColorStop(0.55, 'rgba(255, 92, 24, 0.85)');
            beamGrad.addColorStop(0.92, 'rgba(255, 210, 130, 0.98)');
            beamGrad.addColorStop(1, '#FFF9F2');
          } else {
            beamGrad.addColorStop(0, 'rgba(160, 172, 194, 0.08)');
            beamGrad.addColorStop(0.85, isFocused ? 'rgba(220, 232, 250, 0.52)' : 'rgba(180, 192, 212, 0.32)');
            beamGrad.addColorStop(1, isFocused ? '#FFFFFF' : 'rgba(225, 234, 248, 0.72)');
          }
          ctx.fillStyle = beamGrad;
          ctx.fillRect(trackStartX, cy - coreH * 0.5, beamLen, coreH);

          // Mach shock-cone flare at leading edge of Gemini 4 Neon's jet!
          const headX = trackStartX + beamLen;
          if (isNeon) {
            const shock = ctx.createRadialGradient(headX, cy, 0, headX, cy, 44 * dpr);
            shock.addColorStop(0, 'rgba(255, 250, 242, 0.98)');
            shock.addColorStop(0.22, 'rgba(255, 148, 36, 0.75)');
            shock.addColorStop(0.55, 'rgba(255, 46, 18, 0.28)');
            shock.addColorStop(1, 'rgba(255, 46, 18, 0)');
            ctx.fillStyle = shock;
            ctx.beginPath();
            ctx.arc(headX, cy, 44 * dpr, 0, Math.PI * 2);
            ctx.fill();

            // Delicate acoustic Mach shock arcs trailing back from the glowing tip
            ctx.strokeStyle = 'rgba(255, 212, 150, 0.34)';
            ctx.lineWidth = 1.2 * dpr;
            ctx.beginPath();
            ctx.moveTo(headX - 38 * dpr, cy - 26 * dpr);
            ctx.quadraticCurveTo(headX + 4 * dpr, cy, headX - 38 * dpr, cy + 26 * dpr);
            ctx.stroke();
          } else {
            ctx.fillStyle = isFocused ? '#FFFFFF' : '#C8D2E4';
            ctx.beginPath();
            ctx.arc(headX, cy, (isFocused ? 4.2 : 3) * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // Clean non-overlapping labels (Dedicated left & right margins on desktop, crisp top-bar above beam on mobile!)
          if (compact) {
            const labelY = topPad + laneH * idx + 18 * dpr;
            ctx.textAlign = 'left';
            ctx.font = `700 ${10.5 * dpr}px "JetBrains Mono", monospace`;
            ctx.fillStyle = isNeon ? '#FFF8F0' : '#CFD6E4';
            ctx.fillText(`${m.aaRank} ${m.modelName}`, padLeft, labelY);

            ctx.textAlign = 'right';
            ctx.fillStyle = isNeon ? '#FF8C1A' : '#A3ABB9';
            ctx.fillText(`AA ${m.aaIndexV5} · ${m.outputSpeed} t/s`, w - padRight, labelY);
          } else {
            ctx.textAlign = 'left';
            ctx.font = `700 ${11 * dpr}px "JetBrains Mono", monospace`;
            ctx.fillStyle = isNeon ? '#FF2E12' : '#8A93A4';
            ctx.fillText(`${m.aaRank}  ·  AA v5: ${m.aaIndexV5}`, padLeft, cy - 8 * dpr);

            ctx.font = `${isNeon ? '700' : '500'} ${14.5 * dpr}px "Space Grotesk", monospace`;
            ctx.fillStyle = isNeon ? '#FFF8F0' : isFocused ? '#FFFFFF' : '#C2CAD8';
            ctx.fillText(m.recordedName, padLeft, cy + 12 * dpr);

            ctx.textAlign = 'right';
            ctx.font = `700 ${(isNeon ? 20 : 15) * dpr}px "JetBrains Mono", monospace`;
            ctx.fillStyle = isNeon ? '#FF8C1A' : isFocused ? '#FFF8F0' : '#B4BCCB';
            ctx.fillText(`${m.outputSpeed} tok/s`, w - padRight, cy + 5 * dpr);
          }
        });

        // Swarm all 1,600 particles along their exact proportional speed jets!
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const m = MODELS_ORDERED[p.group];
          const isNeon = Boolean(m.isSelf);
          const cy = topPad + laneH * (p.group + 0.5) + (compact ? 14 * dpr : 0);

          // Advance particle horizontally proportional to model's true verified tok/s!
          const vel = (m.outputSpeed / 110) * 0.34 * p.speedMul;
          if (!reducedMotion) {
            p.u = (p.u + dt * vel) % 1;
          }
          const tx = trackStartX + p.u * trackW;
          const turbulence = Math.sin(p.u * 14 - t * 6 + i) * (isNeon ? 14 : 5.5) * dpr;
          const ty = cy + p.spread * (isNeon ? 22 : 9) * dpr + turbulence * p.u;

          // Smooth spring blend so mode-switching visibly swarms particles into formation!
          p.x += (tx - p.x) * (reducedMotion ? 1 : 0.22);
          p.y += (ty - p.y) * (reducedMotion ? 1 : 0.16);

          const streak = (isNeon ? 14 + p.speedMul * 18 : 6 + vel * 12) * dpr;
          const alpha = isNeon ? 0.55 * (1 - Math.abs(p.spread) * 0.55) : 0.26 * (1 - Math.abs(p.spread) * 0.5);
          ctx.fillStyle = isNeon
            ? p.size > 2
              ? `rgba(255, 245, 232, ${alpha})`
              : `rgba(255, 92, 24, ${alpha})`
            : `rgba(195, 210, 235, ${alpha})`;
          ctx.fillRect(p.x - streak, p.y - p.size * 0.45 * dpr, streak, p.size * 0.9 * dpr);
        }
        ctx.restore();
      } else if (activeMode === 'gravity') {
        // =====================================================================
        // MODE 2: PRICE GRAVITY WELLS ($7.5 / $15 / $20 / $40 ORBITING RINGS)
        // =====================================================================
        const priceOrdered = [
          COMPETITORS[3], // Hydrogen $7.5
          COMPETITORS[1], // Neon $15 (PROTAGONIST)
          COMPETITORS[2], // Carbon $20
          COMPETITORS[0], // Astra $40
        ];

        const centers = priceOrdered.map((m, idx) => {
          if (compact) {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return {
              x: w * (col === 0 ? 0.28 : 0.72),
              y: h * (row === 0 ? 0.30 : 0.73),
              r: Math.max(20, Math.sqrt(m.outputPrice / 40) * Math.min(w, h) * 0.185),
            };
          }
          const slot = (w - 120 * dpr) / 4;
          return {
            x: 60 * dpr + slot * (idx + 0.5),
            y: h * 0.49,
            r: Math.max(26 * dpr, Math.sqrt(m.outputPrice / 40) * Math.min(slot * 0.44, h * 0.34)),
          };
        });

        // Draw sculpted orbital well rings & labels
        priceOrdered.forEach((m, idx) => {
          const c = centers[idx];
          const isNeon = Boolean(m.isSelf);
          const isAstra = m.outputPrice >= 35;

          const halo = ctx.createRadialGradient(c.x, c.y, c.r * 0.35, c.x, c.y, c.r * 1.45);
          if (isNeon) {
            halo.addColorStop(0, 'rgba(255, 46, 18, 0.24)');
            halo.addColorStop(0.65, 'rgba(255, 140, 26, 0.14)');
            halo.addColorStop(1, 'rgba(4, 5, 8, 0)');
          } else if (isAstra) {
            halo.addColorStop(0, 'rgba(245, 222, 180, 0.14)');
            halo.addColorStop(1, 'rgba(4, 5, 8, 0)');
          } else {
            halo.addColorStop(0, 'rgba(165, 180, 210, 0.10)');
            halo.addColorStop(1, 'rgba(4, 5, 8, 0)');
          }
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r * 1.45, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.strokeStyle = isNeon
            ? 'rgba(255, 118, 28, 0.88)'
            : isAstra
              ? 'rgba(245, 224, 186, 0.62)'
              : 'rgba(175, 188, 210, 0.36)';
          ctx.lineWidth = (isNeon ? 2.4 : 1.4) * dpr;
          ctx.stroke();

          // Price center readout
          ctx.textAlign = 'center';
          ctx.font = `700 ${(compact ? 14 : isNeon ? 24 : 20) * dpr}px "JetBrains Mono", monospace`;
          ctx.fillStyle = isNeon ? '#FF8C1A' : '#FFF8F0';
          ctx.fillText(`$${m.outputPrice.toFixed(1)}`, c.x, c.y + 4 * dpr);

          ctx.font = `${(compact ? 8.5 : 10.5) * dpr}px "JetBrains Mono", monospace`;
          ctx.fillStyle = isNeon ? '#FFF8F0' : '#9AA2B2';
          const shortName = m.modelName.replace('Gemini 4 ', 'G4 ');
          ctx.fillText(`${shortName} · AA ${m.aaIndexV5}`, c.x, c.y + c.r + (compact ? 16 : 22) * dpr);
        });

        // Swarm all 1,600 particles into orbital rings around each cost well!
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const slot = i % 4;
          const m = priceOrdered[slot];
          const isNeon = Boolean(m.isSelf);
          const c = centers[slot];

          if (!reducedMotion) {
            p.angle += dt * (isNeon ? 1.35 : 0.72) * p.speedMul;
          }
          const radialJitter = 1 + p.spread * 0.14;
          const tx = c.x + Math.cos(p.angle) * c.r * radialJitter;
          const ty = c.y + Math.sin(p.angle) * c.r * radialJitter;

          p.x += (tx - p.x) * (reducedMotion ? 1 : 0.14);
          p.y += (ty - p.y) * (reducedMotion ? 1 : 0.14);

          ctx.fillStyle = isNeon
            ? 'rgba(255, 130, 38, 0.65)'
            : slot === 3
              ? 'rgba(245, 224, 186, 0.42)'
              : 'rgba(180, 196, 222, 0.34)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * dpr * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else {
        // =====================================================================
        // MODE 3: OPTICAL GLASS PRISM DISPERSION (6 DOMAIN SUB-INDICES AA v5)
        // =====================================================================
        const prismX = compact ? w * 0.22 : w * 0.27;
        const prismY = h * 0.5;
        const prismSize = compact ? 52 * dpr : 92 * dpr;

        // Blazing incident white-hot beam entering prism from left
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const incGrad = ctx.createLinearGradient(0, prismY, prismX - prismSize * 0.25, prismY);
        incGrad.addColorStop(0, 'rgba(255, 248, 240, 0.15)');
        incGrad.addColorStop(1, 'rgba(255, 248, 240, 0.96)');
        ctx.strokeStyle = incGrad;
        ctx.lineWidth = (compact ? 6 : 10) * dpr;
        ctx.beginPath();
        ctx.moveTo(0, prismY + 18 * dpr);
        ctx.lineTo(prismX - prismSize * 0.22, prismY);
        ctx.stroke();

        // 6 Refracted Spectral Rays fanning across the cathedral!
        const endX = compact ? w - 16 * dpr : w * 0.82;
        const fanTop = h * 0.13;
        const fanBot = h * 0.87;
        const colors = ['#FFF2E2', '#FFC15E', '#FF8C1A', '#FF5618', '#FF2E12', '#FF6830'];

        DOMAIN_SUB_INDICES.forEach((d, idx) => {
          const frac = idx / (DOMAIN_SUB_INDICES.length - 1);
          const ty = fanTop + frac * (fanBot - fanTop);
          const normScore = (d.score - 45) / 25; // maps 58.6..66.8 cleanly
          const rayLen = (endX - prismX) * Math.max(0.56, Math.min(1, normScore));
          const rx = prismX + rayLen;

          const rGrad = ctx.createLinearGradient(prismX, prismY, rx, ty);
          rGrad.addColorStop(0, 'rgba(255, 248, 240, 0.85)');
          rGrad.addColorStop(0.28, colors[idx]);
          rGrad.addColorStop(1, 'rgba(255, 46, 18, 0.18)');

          ctx.strokeStyle = rGrad;
          ctx.lineWidth = (idx === 0 || idx === 5 ? 9 : 5.5) * dpr;
          ctx.beginPath();
          ctx.moveTo(prismX + prismSize * 0.18, prismY);
          ctx.lineTo(rx, ty);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 250, 242, 0.82)';
          ctx.lineWidth = 1.6 * dpr;
          ctx.stroke();

          // Label cleanly on the right rail
          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.textAlign = compact ? 'right' : 'left';
          const lx = compact ? w - 14 * dpr : rx + 16 * dpr;
          ctx.font = `700 ${(compact ? 10 : 12.5) * dpr}px "JetBrains Mono", monospace`;
          ctx.fillStyle = idx === 0 || idx === 5 ? '#FFF8F0' : '#FFAD66';
          const labelTxt = compact
            ? `${d.labelEn.split(' ')[0]} ${d.score}`
            : `${d.score}  ${d.labelZh}`;
          ctx.fillText(labelTxt, lx, ty + 4 * dpr);
          ctx.restore();
        });

        // Swarm all 1,600 particles cleanly along the 6 refracted spectral beams (stopping before labels)
        for (let i = 0; i < COUNT; i++) {
          const p = particles[i];
          const rayIdx = i % DOMAIN_SUB_INDICES.length;
          const frac = rayIdx / (DOMAIN_SUB_INDICES.length - 1);
          const tyEnd = fanTop + frac * (fanBot - fanTop);
          const normScore = (DOMAIN_SUB_INDICES[rayIdx].score - 45) / 25;
          const rayLen = (endX - prismX) * Math.max(0.56, Math.min(1, normScore));
          const safeLen = Math.max(24 * dpr, rayLen - (compact ? 110 : 28) * dpr);

          if (!reducedMotion) {
            p.u = (p.u + dt * 0.36 * p.speedMul) % 1;
          }
          const rayFrac = (p.u * safeLen) / Math.max(rayLen, 1);
          const tx = prismX + prismSize * 0.16 + p.u * safeLen;
          const ty = prismY + rayFrac * (tyEnd - prismY) + p.spread * 5 * dpr * rayFrac;

          p.x += (tx - p.x) * (reducedMotion ? 1 : 0.16);
          p.y += (ty - p.y) * (reducedMotion ? 1 : 0.16);

          ctx.fillStyle = colors[rayIdx];
          ctx.globalAlpha = 0.58 * (1 - p.u * 0.55);
          ctx.fillRect(p.x - 5 * dpr, p.y - 1 * dpr, 8 * dpr, 2 * dpr);
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        // Sculpted Refractive Equilateral Glass Prism Overlay
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(prismX, prismY - prismSize);
        ctx.lineTo(prismX + prismSize * 0.92, prismY + prismSize * 0.68);
        ctx.lineTo(prismX - prismSize * 0.92, prismY + prismSize * 0.68);
        ctx.closePath();

        const pFill = ctx.createLinearGradient(
          prismX - prismSize,
          prismY - prismSize,
          prismX + prismSize,
          prismY + prismSize,
        );
        pFill.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        pFill.addColorStop(0.5, 'rgba(90, 145, 255, 0.08)');
        pFill.addColorStop(1, 'rgba(255, 92, 24, 0.16)');
        ctx.fillStyle = pFill;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 248, 240, 0.72)';
        ctx.lineWidth = 1.6 * dpr;
        ctx.stroke();
        ctx.restore();
      }

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  const deckOrder = [
    COMPETITORS[1], // Neon (#3)
    COMPETITORS[0], // Astra (#2)
    COMPETITORS[2], // Carbon (#4)
    COMPETITORS[3], // Hydrogen
  ];

  return (
    <section
      id="chapter-04"
      className="chapter-climax"
      aria-labelledby="ch4-title"
    >
      <div className="chapter-inner">
        <div className="chapter-meta-row">
          <span className="chapter-index">CHAPTER 04 · VISUAL CLIMAX</span>
          <span className="chapter-specimen-note">
            ARTIFICIAL ANALYSIS v5 · QUERIED {QUERY_DATE}
          </span>
        </div>

        <div className="climax-header-grid">
          <div className="climax-headline-block">
            <h2 id="ch4-title" className="chapter-title chapter-title--climax">
              緊追榜首，速度翻倍
            </h2>
            <p className="chapter-lead">
              我在 Artificial Analysis 智慧指數排第 3、程式代理排第 1，每秒約 110 詞元的輸出速度是前後名對手的兩倍以上。
            </p>
          </div>

          <div className="climax-monument-ratios">
            <div className="monument-ratio-item">
              <span className="ratio-kicker">VS #2 GPT-6.2 ASTRA</span>
              <strong className="ratio-giant">2.2×</strong>
              <span className="ratio-sub">輸出速度（110 vs 50 tok/s）</span>
            </div>
            <div className="monument-ratio-divider" aria-hidden="true" />
            <div className="monument-ratio-item">
              <span className="ratio-kicker">CODING AGENT INDEX</span>
              <strong className="ratio-giant ratio-giant--vermilion">#1</strong>
              <span className="ratio-sub">58.6 分（AA 2026-11 版）</span>
            </div>
          </div>
        </div>

        {/* Sculpted Hairline Mode Switcher */}
        <div className="climax-mode-bar" role="tablist" aria-label="粒子光場觀測模式切換">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'jets'}
            className={`climax-tab ${mode === 'jets' ? 'climax-tab--active' : ''}`}
            onClick={() => switchMode('jets')}
          >
            01 · 速度光瀑（110 vs 50 tok/s）
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'gravity'}
            className={`climax-tab ${mode === 'gravity' ? 'climax-tab--active' : ''}`}
            onClick={() => switchMode('gravity')}
          >
            02 · 價格重力井（$15 vs $40）
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'prism'}
            className={`climax-tab ${mode === 'prism' ? 'climax-tab--active' : ''}`}
            onClick={() => switchMode('prism')}
          >
            03 · 光譜稜鏡（AA v5 六大指標）
          </button>
        </div>
      </div>

      {/* FULL-BLEED 100vw 1,600-PARTICLE KINETIC CATHEDRAL */}
      <div className="climax-cathedral-bleed">
        <canvas
          ref={canvasRef}
          className="climax-cathedral-canvas"
          aria-label="Gemini 4 Neon 與對手之輸出速度光瀑、價格重力井與專業光譜稜鏡互動粒子視覺"
        />
      </div>

      {/* Borderless Hairline Synchronized Comparison Strip */}
      <div className="chapter-inner">
        <div className="climax-hairline-deck" role="list" aria-label="各模型實測數據對照">
          {deckOrder.map((m) => {
            const isFocused = focusedId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="listitem"
                className={`hairline-deck-cell ${m.isSelf ? 'hairline-deck-cell--self' : ''} ${
                  isFocused ? 'hairline-deck-cell--focused' : ''
                }`}
                onMouseEnter={() => setFocusedId(m.id)}
                onFocus={() => setFocusedId(m.id)}
                onClick={() => setFocusedId(m.id)}
              >
                <div className="deck-card-top">
                  <span className="climax-lane-rank">{m.aaRank}</span>
                  <span className="deck-card-dev">{m.developer}</span>
                </div>
                <div className="deck-card-name">{m.recordedName}</div>
                <div className="deck-card-stats">
                  <div>
                    <span className="deck-stat-label">AA v5</span>
                    <strong>{m.aaIndexV5}</strong>
                  </div>
                  <div>
                    <span className="deck-stat-label">速度</span>
                    <strong>{m.outputSpeed} t/s</strong>
                  </div>
                  <div>
                    <span className="deck-stat-label">輸出價</span>
                    <strong>${m.outputPrice.toFixed(1)}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Supporting Official Science Scores Hairline Bar */}
        <div className="climax-science-rail">
          <div className="science-rail-item">
            <span>RiemannBench（官方報告）</span>
            <strong>84.0%</strong>
          </div>
          <div className="science-rail-item">
            <span>HLE-Diamond（AA &amp; 官方）</span>
            <strong>71.3%</strong>
          </div>
          <div className="science-rail-item">
            <span>Terminal-Bench-Science 0.1</span>
            <strong>70.5%</strong>
          </div>
          <div className="science-rail-item">
            <span>Terminal-Bench 4.1（官方）</span>
            <strong>65.2%</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
