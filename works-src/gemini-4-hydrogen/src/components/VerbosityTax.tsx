import React, { useEffect, useRef, useState } from 'react';
import { EFFORT_LEVELS, EffortKey } from '../data/hydrogenData';

interface VerbosityTaxProps {
  reducedMotion: boolean;
}

const ORDER: EffortKey[] = ['low', 'medium', 'high', 'xhigh'];
const AA_MEDIAN_TOKENS_M = 77.3;

export const VerbosityTax: React.FC<VerbosityTaxProps> = ({ reducedMotion }) => {
  const [stepIdx, setStepIdx] = useState<number>(3); // Start at Xhigh to highlight the limitation directly
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stepRef = useRef<number>(stepIdx);
  stepRef.current = stepIdx;

  const current = EFFORT_LEVELS[ORDER[stepIdx]];

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

    // Pre-seed falling token grains for visual density
    const grains = Array.from({ length: 240 }, (_, i) => ({
      x: (i * 0.6180339887) % 1,
      y: ((i * 0.381966) % 1),
      speed: 0.14 + ((i * 17) % 10) * 0.035,
      size: 1.5 + (i % 3),
    }));

    let raf = 0;
    let lastNow = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      const w = canvas.width;
      const h = canvas.height;
      const spec = EFFORT_LEVELS[ORDER[stepRef.current]];

      ctx.fillStyle = '#110B08';
      ctx.fillRect(0, 0, w, h);

      // Ambient thermal gradient
      const fillFrac = Math.min(1, spec.outputTokensM / 315);
      const tGrad = ctx.createLinearGradient(0, h, 0, 0);
      tGrad.addColorStop(0, 'rgba(251, 90, 71, 0.24)');
      tGrad.addColorStop(fillFrac, 'rgba(245, 158, 11, 0.10)');
      tGrad.addColorStop(1, 'rgba(17, 11, 8, 0)');
      ctx.fillStyle = tGrad;
      ctx.fillRect(0, 0, w, h);

      // Falling token shower intensity proportional to outputTokensM
      const activeGrains = Math.round((spec.outputTokensM / 303.6) * grains.length);
      for (let i = 0; i < activeGrains; i++) {
        const g = grains[i];
        if (!reducedMotion) {
          g.y = (g.y + g.speed * dt * (0.6 + fillFrac * 1.4)) % 1;
        }
        const gx = g.x * w;
        const gy = g.y * h;
        ctx.fillStyle = i % 5 === 0 ? '#FB5A47' : '#F59E0B';
        ctx.globalAlpha = 0.22 + fillFrac * 0.45;
        ctx.fillRect(gx, gy, g.size * dpr, (g.size + 4) * dpr);
      }
      ctx.globalAlpha = 1;

      // Draw proportional horizontal bars for all 4 tiers + AA Median reference line
      const padL = 24 * dpr;
      const padR = 28 * dpr;
      const barAreaW = w - padL - padR;
      const maxVal = 315;

      const medianX = padL + (AA_MEDIAN_TOKENS_M / maxVal) * barAreaW;
      ctx.save();
      ctx.strokeStyle = 'rgba(238, 245, 252, 0.55)';
      ctx.lineWidth = 1.4 * dpr;
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.beginPath();
      ctx.moveTo(medianX, 26 * dpr);
      ctx.lineTo(medianX, h - 22 * dpr);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#EEF5FC';
      ctx.font = `600 ${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`AA 同級中位數 ${AA_MEDIAN_TOKENS_M}M`, medianX + 6 * dpr, 32 * dpr);

      const topY = 58 * dpr;
      const rowH = (h - topY - 26 * dpr) / 4;

      ORDER.forEach((k, idx) => {
        const item = EFFORT_LEVELS[k];
        const y = topY + idx * rowH;
        const isCurrent = idx === stepRef.current;
        const bw = (item.outputTokensM / maxVal) * barAreaW;

        // Label
        ctx.fillStyle = isCurrent ? '#FFFFFF' : 'rgba(222, 198, 178, 0.65)';
        ctx.font = `${isCurrent ? 700 : 500} ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'left';
        ctx.fillText(`${k.toUpperCase()} · ${item.outputTokensM.toFixed(1)}M tokens`, padL, y + 12 * dpr);

        // Bar track
        const trackY = y + 18 * dpr;
        const trackH = Math.max(12 * dpr, rowH * 0.34);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(padL, trackY, barAreaW, trackH);

        // Reasoning vs Answer split if available
        if (item.reasoningTokensM > 0) {
          const rw = (item.reasoningTokensM / maxVal) * barAreaW;
          const aw = (item.answerTokensM / maxVal) * barAreaW;
          ctx.fillStyle = isCurrent ? '#FB5A47' : 'rgba(251, 90, 71, 0.42)';
          ctx.fillRect(padL, trackY, rw, trackH);
          ctx.fillStyle = isCurrent ? '#F59E0B' : 'rgba(245, 158, 11, 0.45)';
          ctx.fillRect(padL + rw, trackY, aw, trackH);
        } else {
          ctx.fillStyle = isCurrent ? '#F59E0B' : 'rgba(245, 158, 11, 0.42)';
          ctx.fillRect(padL, trackY, bw, trackH);
        }

        if (isCurrent) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5 * dpr;
          ctx.strokeRect(padL, trackY, bw, trackH);
        }
      });

      if (!reducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion, stepIdx]);

  return (
    <section
      id="verbosity-tax"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-thermal)',
        color: '#FBF3EC',
        paddingBlock: 'clamp(68px, 10vh, 120px)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
      }}
    >
      <div className="container-wide">
        <div style={{ marginBottom: '26px' }}>
          <div className="chapter-eyebrow" style={{ color: '#F59E0B' }}>
            05 / LIMITATION 01 · VERBOSITY &amp; TIMEOUT TAX
          </div>
          <h2 className="chapter-title" style={{ color: '#FFF7F0' }}>
            想得越深，我越容易過度消耗篇幅
          </h2>
          <p className="chapter-lead" style={{ color: '#DFC9B8' }}>
            在 AA 的 xhigh 評測裡我產生了 3.04 億個輸出 token，冗長排名掉到倒數第二。
          </p>
        </div>

        <div className="verbosity-grid">
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(245, 158, 11, 0.32)',
              backgroundColor: '#110B08',
            }}
          >
            <canvas
              ref={canvasRef}
              aria-label="Gemini 4 Hydrogen 各思考檔位輸出 token 總量對比圖"
              style={{ width: '100%', height: '320px', display: 'block' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '22px',
              borderRadius: '16px',
              backgroundColor: 'rgba(28, 17, 11, 0.9)',
              border: '1px solid rgba(245, 158, 11, 0.26)',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: '11px', color: '#F59E0B', letterSpacing: '0.1em' }}>
                拖動或點選閥門：體驗「推論深度 vs 篇幅暴衝」的代價
              </div>
              <div style={{ marginTop: '14px' }}>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={stepIdx}
                  onChange={(e) => setStepIdx(Number(e.target.value))}
                  aria-label="思考預算閥門"
                  className="spectral-slider"
                />
                <div
                  className="font-mono"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#C7AE9B',
                  }}
                >
                  {ORDER.map((k, idx) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setStepIdx(idx)}
                      style={{
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: '4px 6px',
                        color: idx === stepIdx ? '#F59E0B' : '#9E8574',
                        fontWeight: idx === stepIdx ? 700 : 500,
                      }}
                    >
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="font-mono"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.32)' }}>
                <div style={{ fontSize: '10px', color: '#C7AE9B' }}>評測輸出總量</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#FB5A47', marginTop: '4px' }}>
                  {current.outputTokensM.toFixed(1)}M
                </div>
                <div style={{ fontSize: '11px', color: '#C7AE9B' }}>
                  中位數 {AA_MEDIAN_TOKENS_M}M 的 {(current.outputTokensM / AA_MEDIAN_TOKENS_M).toFixed(1)}×
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.32)' }}>
                <div style={{ fontSize: '10px', color: '#C7AE9B' }}>XHIGH 實測代價</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#F59E0B', marginTop: '4px' }}>
                  #78 / 79
                </div>
                <div style={{ fontSize: '11px', color: '#C7AE9B' }}>
                  AA 冗長榜（模型卡亦明載偶發逾時風險）
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#DFC9B8', lineHeight: 1.6 }}>
              {stepIdx === 3
                ? 'Xhigh 雖拿到 54 分，但 303.6M 輸出中有 261.0M 是內部思考鏈（86%），首字要等 46.64 秒。'
                : `目前檔位 ${current.aaModelName} 輸出 ${current.outputTokensM.toFixed(1)}M tokens，平均每題耗時 ${current.timePerTaskMin.toFixed(1)} 分鐘。`}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .verbosity-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 22px;
          align-items: stretch;
        }
        @media (max-width: 920px) {
          .verbosity-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
