import React, { useEffect, useRef, useState } from 'react';
import { CONSTELLATION_POINTS, EFFORT_LEVELS } from '../data/hydrogenData';

interface ClimaxConstellationProps {
  reducedMotion: boolean;
}

type ChartZoom = 'full' | 'frontier';

export const ClimaxConstellation: React.FC<ClimaxConstellationProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<ChartZoom>('frontier');
  const [selectedId, setSelectedId] = useState<string>('Gemini 4 Hydrogen (High)');
  const [orchestratorMode, setOrchestratorMode] = useState<'solo' | 'orchestrator'>('orchestrator');

  const zoomRef = useRef<ChartZoom>(zoom);
  zoomRef.current = zoom;
  const selectedRef = useRef<string>(selectedId);
  selectedRef.current = selectedId;
  const orchModeRef = useRef<'solo' | 'orchestrator'>(orchestratorMode);
  orchModeRef.current = orchestratorMode;

  const hitBoxesRef = useRef<{ id: string; cx: number; cy: number; r: number }[]>([]);

  // 1. Kinetic Pareto Frontier & Velocity Wake Constellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 1.2 : Math.max(0, (now - start) * 0.001);
      const isFrontier = zoomRef.current === 'frontier';

      // Deep photometric cosmic chamber with Balmer glow anchored around Hydrogen frontier
      const bgGrad = ctx.createRadialGradient(
        w * 0.84,
        h * 0.56,
        12,
        w * 0.68,
        h * 0.5,
        Math.max(w, h) * 0.9
      );
      bgGrad.addColorStop(0, '#102442');
      bgGrad.addColorStop(0.45, '#071021');
      bgGrad.addColorStop(1, '#03060C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const padL = (w < 540 * dpr ? 36 : 56) * dpr;
      const padR = (w < 540 * dpr ? 18 : 32) * dpr;
      const padT = 38 * dpr;
      const padB = 48 * dpr;
      const plotW = Math.max(40, w - padL - padR);
      const plotH = Math.max(40, h - padT - padB);
      const isNarrow = w < 540 * dpr;

      const minX = 35;
      const maxX = 192;
      const minY = isFrontier ? 48 : 22;
      const maxY = 63;

      const toX = (speed: number) => padL + ((speed - minX) / (maxX - minX)) * plotW;
      const toY = (ii: number) => padT + plotH - ((ii - minY) / (maxY - minY)) * plotH;

      // Subtle calibration grid
      ctx.strokeStyle = 'rgba(148, 197, 255, 0.09)';
      ctx.lineWidth = 1 * dpr;
      const yTicks = isFrontier ? [50, 52, 54, 56, 58, 60, 62] : [25, 35, 45, 55, 60];
      yTicks.forEach((yv) => {
        const py = toY(yv);
        ctx.beginPath();
        ctx.moveTo(padL, py);
        ctx.lineTo(w - padR, py);
        ctx.stroke();

        ctx.fillStyle = 'rgba(141, 162, 186, 0.78)';
        ctx.font = `500 ${Math.round((isNarrow ? 9 : 10) * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'right';
        ctx.fillText(`${yv}`, padL - 8 * dpr, py + 3.5 * dpr);
      });

      const xTicks = isNarrow ? [50, 100, 150, 175] : [50, 75, 100, 125, 150, 175];
      xTicks.forEach((xv) => {
        const px = toX(xv);
        ctx.beginPath();
        ctx.moveTo(px, padT);
        ctx.lineTo(px, padT + plotH);
        ctx.stroke();

        ctx.fillStyle = 'rgba(141, 162, 186, 0.78)';
        ctx.font = `500 ${Math.round((isNarrow ? 9 : 10) * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(isNarrow ? `${xv}` : `${xv} tok/s`, px, padT + plotH + 18 * dpr);
      });

      // Pareto Frontier Envelope Zone (Carbon -> Opus -> Sonnet -> Hydrogen Xhigh)
      const frontierNodes = [
        { s: 60.6, ii: 60.03 },
        { s: 113.5, ii: 59.11 },
        { s: 143.0, ii: 54.54 },
        { s: 174.0, ii: 53.92 },
      ];
      ctx.save();
      ctx.beginPath();
      frontierNodes.forEach((fn, idx) => {
        const x = toX(fn.s);
        const y = toY(fn.ii);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = 'rgba(251, 90, 71, 0.35)';
      ctx.lineWidth = 1.6 * dpr;
      ctx.setLineDash([4 * dpr, 5 * dpr]);
      ctx.stroke();

      // Label the Pareto Frontier cleanly clear of Carbon (High)
      ctx.fillStyle = 'rgba(251, 90, 71, 0.88)';
      ctx.font = `700 ${Math.round((isNarrow ? 8.5 : 9.5) * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(
        isNarrow ? 'PARETO FRONTIER' : 'PARETO FRONTIER (INTELLIGENCE × SPEED)',
        toX(isNarrow ? 92 : 82),
        toY(61.2)
      );
      ctx.restore();

      // Axis captions
      ctx.fillStyle = 'rgba(191, 208, 226, 0.78)';
      ctx.font = `600 ${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('AA INTELLIGENCE INDEX v5.0.1 ↑', padL, padT - 14 * dpr);
      ctx.textAlign = 'right';
      ctx.fillText('OUTPUT SPEED (TOKENS / SEC) →', w - padR, padT + plotH + 36 * dpr);

      // Hydrogen 4-Gear Trajectory Spine
      const hSpine = isFrontier
        ? [EFFORT_LEVELS.high, EFFORT_LEVELS.xhigh]
        : [EFFORT_LEVELS.low, EFFORT_LEVELS.medium, EFFORT_LEVELS.high, EFFORT_LEVELS.xhigh];

      ctx.save();
      ctx.beginPath();
      hSpine.forEach((e, idx) => {
        const px = toX(e.outputSpeedTokS);
        const py = toY(e.intelligenceExact);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 2.4 * dpr;
      ctx.stroke();
      ctx.restore();

      const extraGears = isFrontier
        ? []
        : [
            {
              id: 'Gemini 4 Hydrogen (Medium)',
              shortLabel: 'Hydrogen (Med)',
              ii: EFFORT_LEVELS.medium.intelligenceExact,
              speed: EFFORT_LEVELS.medium.outputSpeedTokS,
              priceOut: 7.5,
              creator: 'Google',
              isSelf: true,
              rank: 35,
            },
            {
              id: 'Gemini 4 Hydrogen (Low)',
              shortLabel: 'Hydrogen (Low)',
              ii: EFFORT_LEVELS.low.intelligenceExact,
              speed: EFFORT_LEVELS.low.outputSpeedTokS,
              priceOut: 7.5,
              creator: 'Google',
              isSelf: true,
              rank: 66,
            },
          ];

      const points = [...CONSTELLATION_POINTS, ...extraGears].filter(
        (p) => p.ii >= minY - 1 && p.ii <= maxY + 1
      );

      // Argon -> Hydrogen horizontal velocity leap vector (visible in frontier view!)
      if (isFrontier) {
        const ax = toX(62.7);
        const ay = toY(50.41);
        const hx = toX(169.3);
        const hy = toY(50.79);

        const arrowGrad = ctx.createLinearGradient(ax, ay, hx, hy);
        arrowGrad.addColorStop(0, 'rgba(96, 165, 250, 0.25)');
        arrowGrad.addColorStop(1, 'rgba(34, 211, 238, 0.85)');
        ctx.strokeStyle = arrowGrad;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Moving energy pulse along Argon->Hydrogen leap
        if (!reducedMotion) {
          const pFrac = (t * 0.45) % 1;
          const px = ax + (hx - ax) * pFrac;
          const py = ay + (hy - ay) * pFrac;
          ctx.beginPath();
          ctx.arc(px, py, 3 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = '#22D3EE';
          ctx.fill();
        }

        ctx.fillStyle = '#22D3EE';
        ctx.font = `700 ${Math.round((isNarrow ? 8.5 : 9.5) * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(
          isNarrow ? '2.7× FASTER' : '2.7× SPEED LEAP OVER ARGON (+0.38 II)',
          (ax + hx) * 0.5,
          hy - 12 * dpr
        );
      }

      const newHits: { id: string; cx: number; cy: number; r: number }[] = [];

      // Draw each star + kinetic velocity wake tail proportional to tok/s
      points.forEach((pt) => {
        const cx = toX(pt.speed);
        const cy = toY(pt.ii);
        const isSelected = pt.id === selectedRef.current;
        const baseRadius = (5.5 + Math.sqrt(pt.priceOut) * 1.4) * dpr;
        const radius = baseRadius + (isSelected ? 2.5 * dpr : 0);

        newHits.push({ id: pt.id, cx, cy, r: Math.max(22 * dpr, radius + 10 * dpr) });

        let fill = '#7C93AD';
        if (pt.id.includes('Hydrogen (Xhigh)')) fill = '#FB5A47';
        else if (pt.isSelf) fill = '#22D3EE';
        else if (pt.creator === 'Google') fill = '#60A5FA';
        else if (pt.creator === 'Anthropic') fill = '#FBBF24';
        else if (pt.creator === 'OpenAI') fill = '#A78BFA';

        // Velocity wake trail streaming leftward (length scales with tok/s)
        const wakeLen = (pt.speed / 175) * 68 * dpr;
        const wakeGrad = ctx.createLinearGradient(cx - wakeLen, cy, cx, cy);
        wakeGrad.addColorStop(0, 'rgba(0,0,0,0)');
        wakeGrad.addColorStop(1, fill);
        ctx.save();
        ctx.globalAlpha = pt.isSelf ? 0.52 : 0.25;
        ctx.strokeStyle = wakeGrad;
        ctx.lineWidth = radius * 0.9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - wakeLen, cy);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.restore();

        // Shockwave rings for Hydrogen nodes
        if (pt.isSelf) {
          const phase = reducedMotion ? 0.45 : Math.abs((t * 0.9 + (pt.id.includes('Xhigh') ? 0.5 : 0)) % 1);
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(1, radius + phase * 26 * dpr), 0, Math.PI * 2);
          ctx.strokeStyle = fill;
          ctx.globalAlpha = (1 - phase) * 0.55;
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Reticle if selected
        if (isSelected) {
          ctx.save();
          ctx.strokeStyle = 'rgba(238, 245, 252, 0.35)';
          ctx.lineWidth = 1 * dpr;
          ctx.setLineDash([3 * dpr, 4 * dpr]);
          ctx.beginPath();
          ctx.moveTo(padL, cy);
          ctx.lineTo(w - padR, cy);
          ctx.moveTo(cx, padT);
          ctx.lineTo(cx, padT + plotH);
          ctx.stroke();
          ctx.restore();

          ctx.beginPath();
          ctx.arc(cx, cy, radius + 6 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.6 * dpr;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.globalAlpha = pt.isSelf || isSelected ? 0.98 : 0.78;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#040812';
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();

        // Smart label placement
        ctx.font = `${pt.isSelf || isSelected ? 700 : 500} ${Math.round((isNarrow ? 8.5 : 10.5) * dpr)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = pt.isSelf || isSelected ? '#FFFFFF' : 'rgba(214, 228, 242, 0.88)';

        const labelText = isNarrow
          ? pt.shortLabel
              .replace('Hydrogen (Xhigh)', 'H-Xhigh')
              .replace('Hydrogen (High)', 'H-High')
              .replace('GPT-6.1 ', '')
              .replace(' (Max)', '')
              .replace(' (Xhigh)', '')
              .replace(' (High)', '')
              .replace(' (Low)', '')
          : pt.shortLabel;

        let lx = cx + radius + 8 * dpr;
        let ly = cy + 3.5 * dpr;
        let align: CanvasTextAlign = 'left';

        if (pt.speed > 146) {
          lx = cx - radius - 10 * dpr;
          align = 'right';
        }
        if (pt.id.includes('Argon')) ly = cy + 16 * dpr;
        if (isNarrow && pt.id.includes('Hydrogen (High)')) ly = cy + 16 * dpr;
        if (pt.id.includes('Terra')) ly = cy - 10 * dpr;
        if (pt.id.includes('Sonnet')) ly = cy - 10 * dpr;
        if (pt.id.includes('Fable')) {
          ly = isNarrow ? cy - 12 * dpr : cy - 11 * dpr;
          if (isNarrow) {
            align = 'center';
            lx = cx;
          }
        }

        ctx.textAlign = align;
        ctx.fillText(labelText, lx, ly);
      });

      hitBoxesRef.current = newHits;
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, zoom, selectedId]);

  // 2. Live Packet-Routing Orchestrator Visualizer (Canvas2D)
  useEffect(() => {
    const canvas = orchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const start = performance.now();

    const drawOrch = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 0.75 : Math.max(0, (now - start) * 0.001);
      const isOrch = orchModeRef.current === 'orchestrator';

      ctx.fillStyle = '#060C18';
      ctx.fillRect(0, 0, w, h);

      const leftX = 28 * dpr;
      const midX = w * 0.34;
      const rightX = w - 28 * dpr;

      // Coordinator Node (Carbon)
      const cy = h * 0.5;
      ctx.fillStyle = 'rgba(96, 165, 250, 0.16)';
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 1.6 * dpr;
      ctx.beginPath();
      ctx.roundRect(leftX, cy - 26 * dpr, Math.max(110 * dpr, midX - leftX - 24 * dpr), 52 * dpr, 10 * dpr);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#EEF5FC';
      ctx.font = `700 ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('CARBON (PLAN)', leftX + 12 * dpr, cy - 4 * dpr);
      ctx.fillStyle = '#9FB5CD';
      ctx.font = `400 ${Math.round(9.5 * dpr)}px "JetBrains Mono", monospace`;
      ctx.fillText('60.6 tok/s · II 60', leftX + 12 * dpr, cy + 13 * dpr);

      const srcX = Math.max(leftX + 110 * dpr, midX - 24 * dpr);

      if (isOrch) {
        // 3 Parallel Hydrogen Worker Conduits
        const lanes = [0.22, 0.5, 0.78];
        const laneNames = ['HYDROGEN WORKER #1 (EDIT)', 'HYDROGEN WORKER #2 (TEST)', 'HYDROGEN VERIFIER #3 (AUDIT)'];
        lanes.forEach((lyFrac, idx) => {
          const ly = h * lyFrac;
          ctx.beginPath();
          ctx.moveTo(srcX, cy);
          ctx.bezierCurveTo(srcX + 40 * dpr, cy, midX + 10 * dpr, ly, midX + 54 * dpr, ly);
          ctx.lineTo(rightX - 18 * dpr, ly);
          ctx.strokeStyle = idx === 2 ? 'rgba(251, 90, 71, 0.48)' : 'rgba(34, 211, 238, 0.48)';
          ctx.lineWidth = 2 * dpr;
          ctx.stroke();

          // Flowing high-speed packets (169.3 tok/s)
          for (let p = 0; p < 3; p++) {
            const prog = (t * 0.72 + idx * 0.23 + p * 0.33) % 1;
            const px = midX + 54 * dpr + prog * (rightX - 18 * dpr - (midX + 54 * dpr));
            ctx.beginPath();
            ctx.arc(px, ly, 3.6 * dpr, 0, Math.PI * 2);
            ctx.fillStyle = idx === 2 ? '#FB5A47' : '#22D3EE';
            ctx.fill();
          }

          ctx.fillStyle = '#DCE8F5';
          ctx.font = `600 ${Math.round(9.5 * dpr)}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'left';
          ctx.fillText(laneNames[idx], midX + 56 * dpr, ly - 8 * dpr);
        });
      } else {
        // Single slow Carbon conduit
        ctx.beginPath();
        ctx.moveTo(srcX, cy);
        ctx.lineTo(rightX - 18 * dpr, cy);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)';
        ctx.lineWidth = 2.5 * dpr;
        ctx.stroke();

        const prog = (t * 0.25) % 1;
        const px = srcX + prog * (rightX - 18 * dpr - srcX);
        ctx.beginPath();
        ctx.arc(px, cy, 4.5 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = '#60A5FA';
        ctx.fill();

        ctx.fillStyle = '#9FB5CD';
        ctx.font = `500 ${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('SINGLE SERIAL EXECUTION LANE (60.6 tok/s)', srcX + 24 * dpr, cy - 12 * dpr);
      }

      if (!reducedMotion) raf = requestAnimationFrame(drawOrch);
    };

    raf = requestAnimationFrame(drawOrch);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, orchestratorMode]);

  const handleCanvasInteract = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    let best: { id: string; dist: number } | null = null;
    for (const box of hitBoxesRef.current) {
      const dist = Math.hypot(x - box.cx, y - box.cy);
      if (dist <= box.r && (!best || dist < best.dist)) {
        best = { id: box.id, dist };
      }
    }
    if (best) setSelectedId(best.id);
  };

  const selectedPoint =
    CONSTELLATION_POINTS.find((p) => p.id === selectedId) ??
    CONSTELLATION_POINTS.find((p) => p.id === 'Gemini 4 Hydrogen (High)')!;

  return (
    <section
      id="climax"
      style={{
        position: 'relative',
        backgroundColor: '#040812',
        color: 'var(--ink-light)',
        paddingBlock: 'clamp(72px, 11vh, 130px)',
        borderBottom: '1px solid var(--hairline-dark)',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '18px',
            marginBottom: '26px',
          }}
        >
          <div>
            <div className="chapter-eyebrow" style={{ color: '#FB5A47' }}>
              04 / PARETO FRONTIER &amp; ORCHESTRATOR CLIMAX
            </div>
            <h2 className="chapter-title">比同門快三倍，也懂得找 Carbon 接手</h2>
            <p className="chapter-lead" style={{ color: '#AFC2D6' }}>
              預設 high 檔位在 AA 智慧指數拿到 51 分、微幅超車 Argon 的 50 分，也能當平行工作引擎。
            </p>
          </div>

          <div
            role="group"
            aria-label="切換圖表視野"
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '999px',
              background: 'rgba(13, 22, 39, 0.9)',
              border: '1px solid var(--hairline-dark)',
            }}
          >
            <button
              type="button"
              onClick={() => setZoom('frontier')}
              className="font-mono"
              style={{
                cursor: 'pointer',
                padding: '7px 14px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: zoom === 'frontier' ? '#22D3EE' : 'transparent',
                color: zoom === 'frontier' ? '#040812' : '#9EB3C9',
              }}
            >
              高分區放大 (48–63)
            </button>
            <button
              type="button"
              onClick={() => setZoom('full')}
              className="font-mono"
              style={{
                cursor: 'pointer',
                padding: '7px 14px',
                borderRadius: '999px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: zoom === 'full' ? '#22D3EE' : 'transparent',
                color: zoom === 'full' ? '#040812' : '#9EB3C9',
              }}
            >
              全四檔爬升線 (22–63)
            </button>
          </div>
        </div>

        {/* Interactive Kinetic Pareto Constellation Canvas */}
        <div
          style={{
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            boxShadow: '0 26px 70px rgba(0, 0, 0, 0.55)',
            backgroundColor: '#040812',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerMove={handleCanvasInteract}
            onClick={handleCanvasInteract}
            aria-label="Artificial Analysis v5.0.1 速度與智慧指數前沿散佈圖"
            style={{
              width: '100%',
              height: 'clamp(340px, 46vh, 440px)',
              display: 'block',
              cursor: 'pointer',
            }}
          />

          <div
            className="font-mono"
            style={{
              padding: '14px 20px',
              backgroundColor: 'rgba(8, 15, 29, 0.96)',
              borderTop: '1px solid var(--hairline-dark)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px 24px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--ink-muted)' }}>SELECTED NODE:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '13px' }}>
                {selectedPoint.id}
              </span>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(34, 211, 238, 0.14)',
                  color: '#22D3EE',
                }}
              >
                全榜 #{selectedPoint.rank}/113
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', color: '#CBD9E8' }}>
              <span>
                II v5.0.1: <strong style={{ color: '#FFFFFF' }}>{selectedPoint.ii.toFixed(2)}</strong>
              </span>
              <span>
                速度: <strong style={{ color: '#22D3EE' }}>{selectedPoint.speed.toFixed(1)} tok/s</strong>
              </span>
              <span>
                輸出單價: <strong style={{ color: '#FB5A47' }}>${selectedPoint.priceOut.toFixed(2)}/1M</strong>
              </span>
              <span style={{ color: 'var(--ink-muted)' }}>尾流長度 = 輸出速度</span>
            </div>
          </div>
        </div>

        {/* Multi-Agent Orchestrator Live Conduit Panel */}
        <div
          style={{
            marginTop: '24px',
            padding: 'clamp(18px, 3vw, 26px)',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(11, 20, 38, 0.95), rgba(6, 11, 21, 0.95))',
            border: '1px solid var(--hairline-dark)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '16px',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: '11px', color: '#22D3EE', letterSpacing: '0.12em' }}>
                GOOGLE ANTIGRAVITY ORCHESTRATOR · TERMINAL-BENCH 4.0
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                {orchestratorMode === 'orchestrator'
                  ? '協作模式：Carbon 規劃 + 3 路 Hydrogen 平行推進（配額 -24% · 耗時 -19%）'
                  : '單線模式：由 Gemini 4 Carbon 獨力從頭執行到尾（基準 100% 配額與時間）'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setOrchestratorMode('solo')}
                className="font-mono"
                style={{
                  cursor: 'pointer',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: `1px solid ${orchestratorMode === 'solo' ? '#60A5FA' : 'var(--hairline-dark)'}`,
                  backgroundColor: orchestratorMode === 'solo' ? 'rgba(96,165,250,0.18)' : 'transparent',
                  color: orchestratorMode === 'solo' ? '#FFFFFF' : '#9EB3C9',
                }}
              >
                純 Carbon 單路
              </button>
              <button
                type="button"
                onClick={() => setOrchestratorMode('orchestrator')}
                className="font-mono"
                style={{
                  cursor: 'pointer',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: `1px solid ${orchestratorMode === 'orchestrator' ? '#FB5A47' : 'var(--hairline-dark)'}`,
                  backgroundColor: orchestratorMode === 'orchestrator' ? 'rgba(251,90,71,0.22)' : 'transparent',
                  color: orchestratorMode === 'orchestrator' ? '#FFFFFF' : '#9EB3C9',
                }}
              >
                Carbon + Hydrogen 協作
              </button>
            </div>
          </div>

          <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(148,197,255,0.14)' }}>
            <canvas
              ref={orchCanvasRef}
              aria-label="Carbon 主腦與 Hydrogen 平行工作流即時管線圖"
              style={{ width: '100%', height: '148px', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
