import React, { useEffect, useRef, useState } from 'react';

interface ScaleAndVelocityProps {
  reducedMotion: boolean;
}

interface RaceModel {
  id: string;
  label: string;
  speed: number;
  color: string;
  isSelf?: boolean;
}

const RACE_MODELS: RaceModel[] = [
  { id: 'h-xhigh', label: 'Gemini 4 Hydrogen (Xhigh)', speed: 174.0, color: '#D62828', isSelf: true },
  { id: 'h-high', label: 'Gemini 4 Hydrogen (High)', speed: 169.3, color: '#0077B6', isSelf: true },
  { id: 'argon', label: 'Gemini 4 Argon (High)', speed: 62.7, color: '#52657A' },
  { id: 'sol', label: 'GPT-6.1 Sol (Xhigh)', speed: 50.2, color: '#7D8FA3' },
];

const TARGET_TOKENS = 600;

export const ScaleAndVelocity: React.FC<ScaleAndVelocityProps> = ({ reducedMotion }) => {
  const waferRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.62,
    y: 0.46,
    active: false,
  });

  const [racing, setRacing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const raceStartRef = useRef<number>(0);

  // Token velocity burst timer
  useEffect(() => {
    if (!racing) return;
    if (reducedMotion) {
      setElapsedSec(TARGET_TOKENS / 50.2);
      setRacing(false);
      return;
    }
    raceStartRef.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const sec = (now - raceStartRef.current) / 1000;
      // Run slightly accelerated? No — real-time! 600 tokens at 174 tok/s finishes in 3.45s!
      setElapsedSec(sec);
      if (sec * 50.2 < TARGET_TOKENS) {
        raf = requestAnimationFrame(tick);
      } else {
        setRacing(false);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [racing, reducedMotion]);

  // Extreme Scale Contrast Canvas: 1,000,000-unit micro wafer + Optical Loupe
  useEffect(() => {
    const canvas = waferRef.current;
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
    let lx = 0.62;
    let ly = 0.46;
    const start = performance.now();

    const draw = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 1.0 : Math.max(0, (now - start) * 0.001);

      lx += (pointerRef.current.x - lx) * (reducedMotion ? 1 : 0.14);
      ly += (pointerRef.current.y - ly) * (reducedMotion ? 1 : 0.14);

      // Laboratory cryo-paper ground
      ctx.fillStyle = '#E5EEF6';
      ctx.fillRect(0, 0, w, h);

      // Left strip: 1 single token in monumental void (scale contrast!)
      const splitX = w * 0.24;
      ctx.fillStyle = '#DAE6F1';
      ctx.fillRect(0, 0, splitX, h);

      ctx.strokeStyle = 'rgba(10, 20, 36, 0.16)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // The solitary 1-token proton square (4px physical unit)
      const p1x = splitX * 0.5;
      const p1y = h * 0.5;
      const unitPx = Math.max(3, 4 * dpr);
      ctx.strokeStyle = 'rgba(214, 40, 40, 0.42)';
      ctx.beginPath();
      ctx.moveTo(p1x - 28 * dpr, p1y);
      ctx.lineTo(p1x + 28 * dpr, p1y);
      ctx.moveTo(p1x, p1y - 28 * dpr);
      ctx.lineTo(p1x, p1y + 28 * dpr);
      ctx.stroke();

      ctx.fillStyle = '#D62828';
      ctx.fillRect(p1x - unitPx / 2, p1y - unitPx / 2, unitPx, unitPx);

      ctx.fillStyle = '#0A1424';
      ctx.font = `700 ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('1 TOKEN', p1x, p1y - 38 * dpr);
      ctx.fillStyle = '#43576E';
      ctx.font = `400 ${Math.round(9.5 * dpr)}px "JetBrains Mono", monospace`;
      ctx.fillText('10^0 單一原子刻度', p1x, p1y + 46 * dpr);

      // Right region: 1,000,000-token Wafer (1000x1000 logical density represented via crisp micro-matrix)
      const pad = 22 * dpr;
      const rx = splitX + pad;
      const ry = pad + 18 * dpr;
      const rw = w - splitX - pad * 2;
      const rh = h - pad * 2 - 22 * dpr;

      // 4 multimodal strata bands across the 1M matrix: Text, Image, Audio, Video
      const bands = [
        { name: 'TEXT', frac: 0.4, color: '#0A1424' },
        { name: 'IMAGE', frac: 0.25, color: '#0077B6' },
        { name: 'AUDIO', frac: 0.18, color: '#0284C7' },
        { name: 'VIDEO', frac: 0.17, color: '#D62828' },
      ];

      const cols = Math.max(48, Math.floor(rw / (4.5 * dpr)));
      const rows = Math.max(28, Math.floor(rh / (4.5 * dpr)));
      const cellW = rw / cols;
      const cellH = rh / rows;

      // Draw crisp dense grid points representing 1,000,000 context capacity
      for (let r = 0; r < rows; r++) {
        const ny = r / rows;
        let bandColor = bands[0].color;
        if (ny > 0.4 && ny <= 0.65) bandColor = bands[1].color;
        else if (ny > 0.65 && ny <= 0.83) bandColor = bands[2].color;
        else if (ny > 0.83) bandColor = bands[3].color;

        ctx.fillStyle = bandColor;
        for (let c = 0; c < cols; c++) {
          const x = rx + c * cellW;
          const y = ry + r * cellH;
          // Subtle wave shimmer
          const pulse = reducedMotion
            ? 0.55
            : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(c * 0.22 + r * 0.18 - t * 2.1));
          ctx.globalAlpha = pulse;
          ctx.fillRect(x, y, Math.max(1.2, cellW - 1.4 * dpr), Math.max(1.2, cellH - 1.4 * dpr));
        }
      }
      ctx.globalAlpha = 1;

      // Wafer header
      ctx.fillStyle = '#0A1424';
      ctx.font = `700 ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText('1,000,000 TOKENS · MULTIMODAL CONTEXT WAFER (10^6)', rx, ry - 8 * dpr);

      // Interactive Optical Loupe
      const loupeX = Math.max(rx + 36 * dpr, Math.min(rx + rw - 36 * dpr, lx * w));
      const loupeY = Math.max(ry + 36 * dpr, Math.min(ry + rh - 36 * dpr, ly * h));
      const loupeR = Math.min(rw, rh) * 0.24;

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.fillStyle = '#08101E';
      ctx.fill();
      ctx.clip();

      // Magnified sub-cells inside loupe
      const subStep = 11 * dpr;
      for (let gx = loupeX - loupeR; gx < loupeX + loupeR; gx += subStep) {
        for (let gy = loupeY - loupeR; gy < loupeY + loupeR; gy += subStep) {
          ctx.fillStyle =
            (Math.floor(gx / subStep) + Math.floor(gy / subStep)) % 5 === 0
              ? '#FB5A47'
              : '#22D3EE';
          ctx.globalAlpha = 0.72;
          ctx.fillRect(gx + 1.5 * dpr, gy + 1.5 * dpr, subStep - 3 * dpr, subStep - 3 * dpr);
        }
      }
      ctx.globalAlpha = 1;

      // Determine modality layer under loupe
      const relY = (loupeY - ry) / Math.max(1, rh);
      const layerName =
        relY <= 0.4
          ? 'STRATA: TEXT'
          : relY <= 0.65
          ? 'STRATA: IMAGE'
          : relY <= 0.83
          ? 'STRATA: SPEECH'
          : 'STRATA: VIDEO';

      ctx.fillStyle = 'rgba(5, 9, 17, 0.85)';
      ctx.fillRect(loupeX - loupeR, loupeY - 13 * dpr, loupeR * 2, 26 * dpr);
      ctx.fillStyle = '#EEF5FC';
      ctx.font = `700 ${Math.round(10 * dpr)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(layerName, loupeX, loupeY + 3.5 * dpr);
      ctx.restore();

      // Loupe Rim
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.strokeStyle = '#0077B6';
      ctx.lineWidth = 2.4 * dpr;
      ctx.stroke();

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

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerRef.current.x = (e.clientX - rect.left) / rect.width;
    pointerRef.current.y = (e.clientY - rect.top) / rect.height;
    pointerRef.current.active = true;
  };

  return (
    <section
      id="scale-velocity"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-paper)',
        color: 'var(--ink-dark)',
        paddingBlock: 'clamp(68px, 10vh, 120px)',
        borderBottom: '1px solid var(--hairline-light)',
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '20px',
            marginBottom: '28px',
          }}
        >
          <div>
            <div className="chapter-eyebrow" style={{ color: '#0077B6' }}>
              03 / SCALE &amp; VELOCITY CONTRAST
            </div>
            <h2 className="chapter-title" style={{ color: 'var(--ink-dark)' }}>
              百萬脈絡裡的高速流體
            </h2>
            <p className="chapter-lead" style={{ color: 'var(--ink-dark-muted)' }}>
              我能同時讀取文字、圖片、音訊與影片，在 100 萬 token 脈絡內以每秒約 170 token 輸出。
            </p>
          </div>

          <div
            className="font-mono"
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: '#DDE8F2',
              border: '1px solid var(--hairline-light)',
            }}
          >
            <span style={{ fontSize: '12px', color: '#43576E' }}>SCALE RATIO</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#0A1424' }}>
              1 : 1,000,000
            </span>
          </div>
        </div>

        {/* Extreme Scale Contrast Wafer + Optical Loupe */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(10, 20, 36, 0.16)',
            boxShadow: '0 18px 44px rgba(10, 20, 36, 0.08)',
          }}
        >
          <canvas
            ref={waferRef}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            aria-label="1 token 與 100 萬 token 統一多模態脈絡視窗對比儀"
            style={{
              width: '100%',
              height: 'clamp(280px, 38vh, 360px)',
              display: 'block',
              cursor: 'crosshair',
            }}
          />
          <div
            className="font-mono"
            style={{
              padding: '10px 16px',
              background: '#DDE8F2',
              borderTop: '1px solid rgba(10, 20, 36, 0.14)',
              fontSize: '11px',
              color: '#0A1424',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span>移動游標或觸控掃描左側→右側多模態脈絡層</span>
            <span>預設同步輸出上限：64K tokens ／ 背景長解碼最高：1M tokens</span>
          </div>
        </div>

        {/* Interactive Real-Time Token Velocity Race */}
        <div
          style={{
            marginTop: '28px',
            padding: 'clamp(18px, 3vw, 28px)',
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(10, 20, 36, 0.14)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: '12px', color: '#0077B6', fontWeight: 700 }}>
                REAL-TIME OUTPUT RACE · 600 TOKENS (AA VERIFIED TOK/S)
              </div>
              <div style={{ fontSize: '14px', color: '#43576E', marginTop: '2px' }}>
                按下發射鍵，用真實每秒輸出速度跑完 600 個 token：
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setElapsedSec(0);
                setRacing(true);
              }}
              className="font-mono"
              style={{
                cursor: 'pointer',
                padding: '10px 18px',
                borderRadius: '999px',
                border: '1.5px solid #0A1424',
                backgroundColor: racing ? '#0077B6' : '#0A1424',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {racing ? `串流生成中 ${elapsedSec.toFixed(1)}s…` : '▶ 發射 600-Token 速度實測'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {RACE_MODELS.map((m) => {
              const generated =
                elapsedSec === 0 && !racing
                  ? Math.min(TARGET_TOKENS, Math.round((m.speed / 174.0) * TARGET_TOKENS))
                  : Math.min(TARGET_TOKENS, Math.round(elapsedSec * m.speed));
              const pct = (generated / TARGET_TOKENS) * 100;
              const finishedTime = (TARGET_TOKENS / m.speed).toFixed(2);
              const done = elapsedSec > 0 && generated >= TARGET_TOKENS;

              return (
                <div key={m.id}>
                  <div
                    className="font-mono"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '10px',
                      fontSize: '13px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontWeight: m.isSelf ? 700 : 500, color: '#0A1424' }}>
                      {m.label}
                    </span>
                    <span style={{ color: m.isSelf ? m.color : '#43576E', fontWeight: 700 }}>
                      {m.speed.toFixed(1)} tok/s · {done ? `完成 (${finishedTime}s)` : `${generated} / ${TARGET_TOKENS}`}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '12px',
                      borderRadius: '999px',
                      backgroundColor: '#E5EEF6',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: m.color,
                        borderRadius: '999px',
                        transition: racing ? 'none' : 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
