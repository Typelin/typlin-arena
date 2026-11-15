import React, { useEffect, useRef, useState } from 'react';
import { EFFORT_LEVELS, EffortKey } from '../data/hydrogenData';

interface ThinkingGearsProps {
  activeEffort: EffortKey;
  onSelectEffort: (key: EffortKey) => void;
  reducedMotion: boolean;
}

const EFFORT_KEYS: EffortKey[] = ['low', 'medium', 'high', 'xhigh'];

export const ThinkingGears: React.FC<ThinkingGearsProps> = ({
  activeEffort,
  onSelectEffort,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeRef = useRef<EffortKey>(activeEffort);
  activeRef.current = activeEffort;

  const [displayVals, setDisplayVals] = useState(() => {
    const s = EFFORT_LEVELS[activeEffort];
    return {
      ii: s.intelligenceIndex,
      time: s.timePerTaskMin,
      cost: s.costPerTaskUsd,
      ttft: s.ttftSec,
    };
  });

  // Smooth spring interpolation for numeric readouts
  useEffect(() => {
    const target = EFFORT_LEVELS[activeEffort];
    if (reducedMotion) {
      setDisplayVals({
        ii: target.intelligenceIndex,
        time: target.timePerTaskMin,
        cost: target.costPerTaskUsd,
        ttft: target.ttftSec,
      });
      return;
    }
    let raf = 0;
    const step = () => {
      let done = true;
      setDisplayVals((prev) => {
        const lerp = (a: number, b: number) => {
          const d = b - a;
          if (Math.abs(d) < 0.015) return b;
          done = false;
          return a + d * 0.16;
        };
        return {
          ii: lerp(prev.ii, target.intelligenceIndex),
          time: lerp(prev.time, target.timePerTaskMin),
          cost: lerp(prev.cost, target.costPerTaskUsd),
          ttft: lerp(prev.ttft, target.ttftSec),
        };
      });
      if (!done) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [activeEffort, reducedMotion]);

  // Interactive Canvas2D 4-Shell Quantum Chamber & Balmer Waveform
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
    let smoothShell = EFFORT_LEVELS[activeRef.current].shellN;
    let smoothII = EFFORT_LEVELS[activeRef.current].intelligenceIndex;
    const start = performance.now();

    const draw = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 2.4 : Math.max(0, (now - start) * 0.001);
      const spec = EFFORT_LEVELS[activeRef.current];

      smoothShell += (spec.shellN - smoothShell) * (reducedMotion ? 1 : 0.1);
      smoothII += (spec.intelligenceIndex - smoothII) * (reducedMotion ? 1 : 0.1);

      // Background plate with subtle radial depth
      ctx.fillStyle = '#070D19';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.44;
      const maxR = Math.min(w * 0.4, h * 0.34);

      // Ambient glow for active shell
      const glow = ctx.createRadialGradient(cx, cy, 4 * dpr, cx, cy, maxR * 1.15);
      glow.addColorStop(0, 'rgba(255,255,255,0.22)');
      glow.addColorStop(0.25, spec.accentGlow);
      glow.addColorStop(1, 'rgba(7,13,25,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Draw 4 discrete Bohr energy shells (n = 1..4)
      EFFORT_KEYS.forEach((k, idx) => {
        const s = EFFORT_LEVELS[k];
        const r = maxR * (0.28 + idx * 0.22);
        const isActive = k === activeRef.current;
        const distFromSmooth = Math.abs(smoothShell - (idx + 1));
        const highlight = Math.max(0, 1 - distFromSmooth);

        ctx.save();
        ctx.beginPath();
        // Slight standing-wave orbital perturbation proportional to n
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          const wave =
            isActive || highlight > 0.2
              ? Math.sin(ang * (s.shellN * 3) - t * (1.8 + s.shellN * 0.6)) *
                (2.2 + highlight * 3.5) *
                dpr
              : 0;
          const rr = r + wave;
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = isActive ? s.accentHex : 'rgba(148, 197, 255, 0.16)';
        ctx.lineWidth = (isActive ? 2.4 : 1.0) * dpr;
        if (!isActive) ctx.setLineDash([4 * dpr, 6 * dpr]);
        ctx.stroke();
        ctx.restore();

        // Orbiting electron nodes on active shell
        const electrons = isActive ? s.shellN * 2 : 1;
        for (let e = 0; e < electrons; e++) {
          const theta =
            t * (0.9 + (4 - idx) * 0.25) * (idx % 2 === 0 ? 1 : -1) +
            (e / electrons) * Math.PI * 2;
          const ex = cx + Math.cos(theta) * r;
          const ey = cy + Math.sin(theta) * r;
          ctx.beginPath();
          ctx.arc(ex, ey, (isActive ? 4.2 : 2.1) * dpr, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(148, 197, 255, 0.35)';
          ctx.fill();
        }

        // Shell label on top axis
        ctx.fillStyle = isActive ? s.accentHex : 'rgba(141, 162, 186, 0.55)';
        ctx.font = `${isActive ? 700 : 500} ${Math.round(10.5 * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`n=${s.shellN} ${k.toUpperCase()}`, cx, cy - r - 8 * dpr);
      });

      // Proton center
      ctx.beginPath();
      ctx.arc(cx, cy, 6 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Bottom Oscilloscope: Reasoning Token Density Wave
      const waveTop = h * 0.84;
      const waveAmp = (10 + (smoothII / 60) * 20) * dpr;
      const freq = 0.012 + smoothShell * 0.008;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 197, 255, 0.14)';
      ctx.lineWidth = 1 * dpr;
      ctx.moveTo(24 * dpr, waveTop);
      ctx.lineTo(w - 24 * dpr, waveTop);
      ctx.stroke();

      ctx.beginPath();
      for (let x = 24 * dpr; x <= w - 24 * dpr; x += 3 * dpr) {
        const nx = (x - 24 * dpr) / (w - 48 * dpr);
        const env = Math.sin(nx * Math.PI);
        const y =
          waveTop +
          Math.sin(x * freq - t * 4.5) * waveAmp * env * 0.65 +
          Math.cos(x * freq * 2.3 + t * 3.1) * waveAmp * env * 0.35;
        if (x === 24 * dpr) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = spec.accentHex;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Oscilloscope caption
      ctx.fillStyle = 'rgba(191, 208, 226, 0.72)';
      ctx.font = `500 ${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(
        `REASONING DEPTH WAVE · ${spec.outputTokensM}M EVAL TOKENS`,
        24 * dpr,
        h - 14 * dpr
      );

      if (!reducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  const activeSpec = EFFORT_LEVELS[activeEffort];

  return (
    <section
      id="thinking-gears"
      style={{
        position: 'relative',
        backgroundColor: '#08101E',
        color: 'var(--ink-light)',
        paddingBlock: 'clamp(64px, 10vh, 118px)',
        borderBottom: '1px solid var(--hairline-dark)',
      }}
    >
      <div className="container-wide">
        <div style={{ marginBottom: 'clamp(28px, 4vh, 44px)' }}>
          <div className="chapter-eyebrow" style={{ color: activeSpec.accentHex }}>
            02 / VARIABLE THINKING ENGINE
          </div>
          <h2 className="chapter-title">一具模型，四種思考檔位</h2>
          <p className="chapter-lead" style={{ color: '#AFC2D6' }}>
            你可以切換 low、medium、high 與 xhigh，用等待時間與費用換取不同的推理深度。
          </p>
        </div>

        <div className="gears-layout">
          {/* Left: Live Quantum Shell Simulation */}
          <div
            style={{
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              border: `1px solid ${activeSpec.accentGlow}`,
              backgroundColor: '#070D19',
              minHeight: '390px',
              boxShadow: `0 24px 60px rgba(0, 0, 0, 0.45)`,
            }}
          >
            <canvas
              ref={canvasRef}
              aria-label="Gemini 4 Hydrogen 四層量子思考軌域模擬圖"
              style={{ width: '100%', height: '100%', minHeight: '390px', display: 'block' }}
            />
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                top: '16px',
                left: '18px',
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(5, 9, 17, 0.78)',
                border: '1px solid rgba(148,197,255,0.2)',
                fontSize: '11px',
                color: activeSpec.accentHex,
              }}
            >
              SHELL n={activeSpec.shellN} · {activeSpec.aaModelName}
            </div>
          </div>

          {/* Right: Physical 4-Gear Pressure Throttle + Live AA Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: 'rgba(13, 22, 39, 0.85)',
                border: '1px solid var(--hairline-dark)',
              }}
            >
              <div
                className="font-mono"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--ink-muted)',
                  marginBottom: '12px',
                  letterSpacing: '0.1em',
                }}
              >
                <span>思考深度切換桿（點選即改變右側數值與左側能階）</span>
                <span style={{ color: activeSpec.accentHex }}>INTERACTIVE</span>
              </div>

              <div
                role="radiogroup"
                aria-label="選擇思考強度檔位"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '8px',
                }}
                className="gear-buttons-grid"
              >
                {EFFORT_KEYS.map((k, idx) => {
                  const s = EFFORT_LEVELS[k];
                  const selected = k === activeEffort;
                  return (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => onSelectEffort(k)}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 10px',
                        borderRadius: '12px',
                        textAlign: 'left',
                        border: `1.5px solid ${selected ? s.accentHex : 'rgba(148,197,255,0.16)'}`,
                        background: selected
                          ? `linear-gradient(160deg, ${s.accentGlow}, rgba(9,16,29,0.9))`
                          : 'rgba(5,9,17,0.55)',
                        color: selected ? '#FFFFFF' : '#9EB3C9',
                        transition: 'transform 160ms ease, border-color 160ms ease',
                        transform: selected ? 'translateY(-2px)' : 'none',
                      }}
                    >
                      <div className="font-mono" style={{ fontSize: '10px', opacity: 0.72 }}>
                        0{idx + 1} · {s.wavelengthNm}nm
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '4px' }}>
                        {k.toUpperCase()}
                      </div>
                      <div className="font-mono" style={{ fontSize: '12px', color: s.accentHex, marginTop: '2px' }}>
                        II {s.intelligenceIndex}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: '14px',
                  color: '#CBD9E8',
                  lineHeight: 1.55,
                }}
              >
                {activeSpec.noteZh}
              </p>
            </div>

            {/* 4 Verified AA Telemetry Readouts */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <div className="metric-tile">
                <div className="metric-label">AA 智慧指數 v5.0.1</div>
                <div className="metric-value" style={{ color: activeSpec.accentHex }}>
                  {Math.round(displayVals.ii)}
                  <span className="metric-sub"> / 100（全榜 #{activeSpec.rankFull}）</span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${Math.min(100, (displayVals.ii / 65) * 100)}%`,
                      backgroundColor: activeSpec.accentHex,
                    }}
                  />
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-label">平均單題耗時</div>
                <div className="metric-value">
                  {displayVals.time.toFixed(1)}
                  <span className="metric-sub"> 分鐘 / 題</span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${Math.min(100, (displayVals.time / 16) * 100)}%`,
                      backgroundColor: '#F59E0B',
                    }}
                  />
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-label">單題評測成本</div>
                <div className="metric-value">
                  ${displayVals.cost.toFixed(2)}
                  <span className="metric-sub"> USD / 題</span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${Math.min(100, (displayVals.cost / 3.5) * 100)}%`,
                      backgroundColor: '#38BDF8',
                    }}
                  />
                </div>
              </div>

              <div className="metric-tile">
                <div className="metric-label">首個回答 Token 延遲</div>
                <div className="metric-value">
                  {displayVals.ttft.toFixed(1)}
                  <span className="metric-sub"> 秒等待</span>
                </div>
                <div className="metric-bar-bg">
                  <div
                    className="metric-bar-fill"
                    style={{
                      width: `${Math.min(100, (displayVals.ttft / 50) * 100)}%`,
                      backgroundColor: '#FB5A47',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gears-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 24px;
          align-items: stretch;
        }
        .metric-tile {
          padding: 16px;
          border-radius: 14px;
          background: rgba(11, 19, 34, 0.85);
          border: 1px solid var(--hairline-dark);
        }
        .metric-label {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--ink-muted);
          letter-spacing: 0.08em;
        }
        .metric-value {
          font-family: var(--font-mono);
          font-size: clamp(1.5rem, 2.4vw, 2.15rem);
          font-weight: 700;
          margin-top: 6px;
          color: #EEF5FC;
        }
        .metric-sub {
          font-size: 12px;
          font-weight: 400;
          color: var(--ink-muted);
        }
        .metric-bar-bg {
          margin-top: 10px;
          height: 4px;
          border-radius: 999px;
          background: rgba(148, 197, 255, 0.12);
          overflow: hidden;
        }
        .metric-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (max-width: 960px) {
          .gears-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 520px) {
          .gear-buttons-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </section>
  );
};
