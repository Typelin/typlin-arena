import React, { useState } from 'react';
import { DEEPMIND_MODEL_CARD_BENCHMARKS, SAFETY_DELTAS_VS_38_FLASH } from '../data/hydrogenData';

export const RefusalAndGaps: React.FC = () => {
  const [probeType, setProbeType] = useState<'benign' | 'borderline'>('borderline');

  const deficits = DEEPMIND_MODEL_CARD_BENCHMARKS.filter((b) => b.hydrogenLoses);

  return (
    <section
      id="refusal-gaps"
      style={{
        position: 'relative',
        backgroundColor: 'var(--bg-slate)',
        color: 'var(--ink-light)',
        paddingBlock: 'clamp(68px, 10vh, 120px)',
        borderBottom: '1px solid var(--hairline-dark)',
      }}
    >
      <div className="container-wide">
        <div style={{ marginBottom: '28px' }}>
          <div className="chapter-eyebrow" style={{ color: '#FB5A47' }}>
            06 / LIMITATION 02 · OVER-REFUSAL &amp; RIVAL DEFICITS
          </div>
          <h2 className="chapter-title">過度謹慎的門檻，與還沒追上的領域</h2>
          <p className="chapter-lead" style={{ color: '#AFC2D6' }}>
            模型卡顯示我的誤拒率比 3.8 Flash 高出 5.57 個百分點，在系統終端與科學實測也落後對手。
          </p>
        </div>

        <div className="gaps-grid">
          {/* Left: Interactive Over-Refusal Aperture & Safety Regression */}
          <div
            style={{
              padding: '22px',
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 38, 0.9)',
              border: '1px solid rgba(251, 90, 71, 0.28)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <span className="font-mono" style={{ fontSize: '12px', color: '#FB5A47', fontWeight: 700 }}>
                MODEL CARD SAFETY DELTA vs GEMINI 3.8 FLASH
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(148, 197, 255, 0.12)',
                  color: '#CBD9E8',
                }}
              >
                知識截止：2026 年 3 月
              </span>
            </div>

            {/* Interactive Gate Toggle */}
            <div
              role="group"
              aria-label="切換安全閘門情境"
              style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}
            >
              <button
                type="button"
                onClick={() => setProbeType('borderline')}
                className="font-mono"
                style={{
                  cursor: 'pointer',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: `1px solid ${probeType === 'borderline' ? '#FB5A47' : 'var(--hairline-dark)'}`,
                  backgroundColor: probeType === 'borderline' ? 'rgba(251,90,71,0.18)' : 'transparent',
                  color: '#EEF5FC',
                }}
              >
                測試：邊界多模態無害提問
              </button>
              <button
                type="button"
                onClick={() => setProbeType('benign')}
                className="font-mono"
                style={{
                  cursor: 'pointer',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: `1px solid ${probeType === 'benign' ? '#22D3EE' : 'var(--hairline-dark)'}`,
                  backgroundColor: probeType === 'benign' ? 'rgba(34,211,238,0.16)' : 'transparent',
                  color: '#EEF5FC',
                }}
              >
                測試：明確圖片安全合規檢查
              </button>
            </div>

            {/* Visual Aperture Meter */}
            <div
              style={{
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#070C15',
                border: `1px solid ${probeType === 'borderline' ? 'rgba(251,90,71,0.5)' : 'rgba(34,211,238,0.45)'}`,
                marginBottom: '16px',
              }}
            >
              <div className="font-mono" style={{ fontSize: '11px', color: probeType === 'borderline' ? '#FB5A47' : '#22D3EE' }}>
                {probeType === 'borderline'
                  ? 'APERTURE LOCKED · UNJUSTIFIED REFUSALS +5.57 pp'
                  : 'APERTURE GUARD · IMAGE-TO-TEXT SAFETY +7.00 pp'}
              </div>
              <div style={{ fontSize: '13px', color: '#CBD9E8', marginTop: '6px' }}>
                {probeType === 'borderline'
                  ? '雖然圖像安全防護拉高了 7.00 個百分點，但也讓我在面對無害但帶有敏感視覺元素的請求時，更容易誤判並用略微生硬的語氣（Tone -0.65 pp）直接拒答。'
                  : '在圖文安全合規測試上比 3.8 Flash 高出 7.00 個百分點，代價就是對邊界樣本的防禦門檻調得更窄。'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SAFETY_DELTAS_VS_38_FLASH.map((row) => (
                <div
                  key={row.metric}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    fontSize: '13px',
                  }}
                >
                  <span style={{ color: '#DCE7F3' }}>{row.metric}</span>
                  <span
                    className="font-mono"
                    style={{
                      fontWeight: 700,
                      color: row.positive ? '#22D3EE' : '#FB5A47',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.delta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Head-to-Head Official Benchmark Deficits */}
          <div
            style={{
              padding: '22px',
              borderRadius: '16px',
              backgroundColor: 'rgba(15, 23, 38, 0.9)',
              border: '1px solid var(--hairline-dark)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: '12px', color: '#818CF8', fontWeight: 700 }}>
                OFFICIAL MODEL CARD DEFICITS (NOV 2026)
              </div>
              <div style={{ fontSize: '14px', color: '#AFC2D6', marginTop: '6px' }}>
                DeepMind 模型卡公開對比中，我明確落後 Claude Sonnet 5.5 或 GPT-6.1 Terra 的三項實測：
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {deficits.map((d) => {
                const hNum = parseFloat(d.hydrogen);
                const sNum = parseFloat(d.sonnet55);
                const tNum = d.terra61 === '—' ? 0 : parseFloat(d.terra61);
                return (
                  <div key={d.benchmark}>
                    <div
                      className="font-mono"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#EEF5FC' }}>
                        {d.benchmark} <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>({d.category})</span>
                      </span>
                      <span style={{ color: '#FB5A47' }}>
                        我 {d.hydrogen} vs Sonnet 5.5 {d.sonnet55}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ width: '78px', fontSize: '11px', color: '#22D3EE' }}>Hydrogen</span>
                        <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ width: `${hNum}%`, height: '100%', borderRadius: '999px', background: '#22D3EE' }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="font-mono" style={{ width: '78px', fontSize: '11px', color: '#FBBF24' }}>Sonnet 5.5</span>
                        <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ width: `${sNum}%`, height: '100%', borderRadius: '999px', background: '#FBBF24' }} />
                        </div>
                      </div>
                      {tNum > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="font-mono" style={{ width: '78px', fontSize: '11px', color: '#A78BFA' }}>Terra 6.1</span>
                          <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ width: `${tNum}%`, height: '100%', borderRadius: '999px', background: '#A78BFA' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="font-mono"
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0,0,0,0.28)',
                fontSize: '12px',
                color: '#BFD0E2',
              }}
            >
              白話結論：系統終端指令修復、桌面 GUI 操作與科學終端任務，仍不是我最頂尖的強項。
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .gaps-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        @media (max-width: 900px) {
          .gaps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
