import { useRef } from 'react'
import { useInView } from '../hooks/useInView.ts'

interface Props { reducedMotion: boolean }

/* Benchmarks with all three models having public scores */
const AXES = [
  { name: 'SWE-bench', me: 80.8, prev: 80.9, rival: 80.0 },
  { name: 'Terminal-Bench', me: 65.4, prev: 59.8, rival: 64.7 },
  { name: 'τ²-Retail', me: 91.9, prev: 88.9, rival: 82.0 },
  { name: 'ARC-AGI-2', me: 68.8, prev: 37.6, rival: 54.2 },
  { name: 'GPQA Diamond', me: 91.3, prev: 87.0, rival: 93.2 },
  { name: 'MMMLU', me: 91.1, prev: 90.8, rival: 89.6 },
]

const CX = 250, CY = 250, R = 180

function polarXY(index: number, total: number, value: number, maxVal = 100): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = (value / maxVal) * R
  return [CX + Math.cos(angle) * r, CY + Math.sin(angle) * r]
}

function polygonPoints(values: number[], max = 100): string {
  return values.map((v, i) => polarXY(i, values.length, v, max).join(',')).join(' ')
}

export default function ChapterBenchmarks({ reducedMotion }: Props) {
  const ref = useRef<HTMLElement>(null)
  const vis = useInView(ref, 0.1)
  const show = vis || reducedMotion

  return (
    <section ref={ref} style={{
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(100px, 14vh, 160px) clamp(16px, 4vw, 80px)',
      background: 'linear-gradient(180deg, #0a0808, #0c0a09 20%, #120e08 60%, #0d0b06 100%)',
    }}>
      {/* Ambient glow behind chart */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '50%', top: '40%',
        width: 'min(600px, 70vw)', height: 'min(600px, 70vw)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(50px)',
          transition: reducedMotion ? 'none' : 'all 1s var(--ease-out-expo)',
          marginBottom: 48,
        }}>
          <Tag>05 — 成績</Tag>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700,
            lineHeight: 1.2, color: 'var(--amber-100)',
            marginBottom: 14, letterSpacing: '-0.02em',
          }}>
            用數字跟對手比一次
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.85,
            color: 'var(--dark-400)', maxWidth: 560,
          }}>
            六項三方都有公開分數的評測。所有成績取自 Anthropic 官方系統卡，
            Adaptive Thinking + Max Effort，5 次重複平均。
          </p>
        </div>

        {/* Layout: Chart + Legend side by side on desktop, stacked on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(24px, 4vw, 60px)',
          alignItems: 'center',
        }}>
          {/* SVG Radar Chart */}
          <div style={{
            width: '100%', maxWidth: 500,
            opacity: show ? 1 : 0,
            transform: show ? 'scale(1)' : 'scale(0.85)',
            transition: reducedMotion ? 'none' : 'all 1.2s 0.2s var(--ease-out-expo)',
          }}>
            <svg viewBox="0 0 500 500" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <style>{`
                  .radar-draw {
                    animation: ${reducedMotion ? 'none' : 'radarReveal 1.5s 0.5s var(--ease-out-expo) both'};
                  }
                  @keyframes radarReveal {
                    from { opacity: 0; transform: scale(0.3); transform-origin: ${CX}px ${CY}px; }
                    to { opacity: 1; transform: scale(1); transform-origin: ${CX}px ${CY}px; }
                  }
                `}</style>
              </defs>

              {/* Grid rings */}
              {[20, 40, 60, 80, 100].map(pct => (
                <polygon key={pct}
                  points={AXES.map((_, i) => polarXY(i, AXES.length, pct).join(',')).join(' ')}
                  fill="none" stroke="rgba(251,191,36,0.06)" strokeWidth={pct === 100 ? 0.8 : 0.5}
                />
              ))}

              {/* Axis lines */}
              {AXES.map((_, i) => {
                const [ex, ey] = polarXY(i, AXES.length, 100)
                return <line key={i} x1={CX} y1={CY} x2={ex} y2={ey} stroke="rgba(251,191,36,0.06)" strokeWidth="0.5" />
              })}

              {/* GPT-5.2 polygon (behind) */}
              <polygon className={show ? 'radar-draw' : ''}
                points={polygonPoints(AXES.map(a => a.rival))}
                fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.4)"
                strokeWidth="1.5" strokeLinejoin="round"
                style={{ animationDelay: '0.9s' }}
              />

              {/* Opus 4.5 polygon (middle) */}
              <polygon className={show ? 'radar-draw' : ''}
                points={polygonPoints(AXES.map(a => a.prev))}
                fill="rgba(120,113,108,0.06)" stroke="rgba(120,113,108,0.35)"
                strokeWidth="1.5" strokeLinejoin="round"
                style={{ animationDelay: '0.7s' }}
              />

              {/* Opus 4.6 polygon (front) — the star */}
              <polygon className={show ? 'radar-draw' : ''}
                points={polygonPoints(AXES.map(a => a.me))}
                fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.7)"
                strokeWidth="2" strokeLinejoin="round"
                style={{ animationDelay: '0.5s', filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.2))' }}
              />

              {/* Data points for Opus 4.6 */}
              {AXES.map((a, i) => {
                const [px, py] = polarXY(i, AXES.length, a.me)
                return <circle key={i} cx={px} cy={py} r="3.5" fill="var(--amber-400)"
                  className={show ? 'radar-draw' : ''}
                  style={{ animationDelay: `${0.6 + i * 0.06}s` }}
                />
              })}

              {/* Axis labels */}
              {AXES.map((a, i) => {
                const [lx, ly] = polarXY(i, AXES.length, 118)
                const isBottom = ly > CY + 20
                const isTop = ly < CY - 20
                return (
                  <text key={i} x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline={isBottom ? 'hanging' : isTop ? 'auto' : 'central'}
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      fill: 'var(--amber-500)', letterSpacing: '0.03em',
                    }}
                  >
                    {a.name}
                  </text>
                )
              })}
            </svg>
          </div>

          {/* Legend + per-benchmark scores */}
          <div style={{
            opacity: show ? 1 : 0,
            transform: show ? 'none' : 'translateX(30px)',
            transition: reducedMotion ? 'none' : 'all 0.8s 0.4s var(--ease-out-expo)',
          }}>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                { color: 'var(--amber-400)', label: 'Claude Opus 4.6', sub: '本機型' },
                { color: 'var(--dark-500)', label: 'Claude Opus 4.5', sub: '前代' },
                { color: '#818cf8', label: 'GPT-5.2', sub: '同期競品' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 3, borderRadius: 1.5, background: l.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: l.color }}>{l.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--dark-600)' }}>({l.sub})</span>
                </div>
              ))}
            </div>

            {/* Score table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowX: 'auto' }}>
              {AXES.map((a, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 44px 44px 44px',
                  gap: 2, padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.3vw, 12px)',
                  minWidth: 0,
                }}>
                  <span style={{ color: 'var(--dark-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  <span style={{ color: 'var(--amber-300)', textAlign: 'right', fontWeight: 600 }}>{a.me}%</span>
                  <span style={{ color: 'var(--dark-500)', textAlign: 'right' }}>{a.prev}%</span>
                  <span style={{ color: '#818cf8', textAlign: 'right', opacity: 0.7 }}>{a.rival}%</span>
                </div>
              ))}
            </div>

            <p style={{
              marginTop: 20, fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'var(--dark-600)', lineHeight: 1.6,
            }}>
              系統卡發布日 2026-02-05<br />
              Claude: Adaptive, Max Effort, 5 次平均<br />
              GPT-5.2 成績引自同一系統卡
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: 'var(--font-mono)',
      fontSize: 11, letterSpacing: '0.18em', color: 'var(--amber-500)',
      textTransform: 'uppercase', marginBottom: 16,
      padding: '4px 14px', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 4,
    }}>{children}</span>
  )
}
