import { useRef } from 'react'
import { useInView } from '../hooks/useInView.ts'

interface Props { reducedMotion: boolean }

const SPECS = [
  { k: '上下文窗口', v: '1M', u: 'tokens' },
  { k: '最大輸出', v: '128K', u: 'tokens' },
  { k: '發布日期', v: '2026.02.05', u: '' },
  { k: '知識截止', v: '2025 年 5 月', u: '' },
  { k: '輸入價格', v: '$5', u: '/ MTok' },
  { k: '輸出價格', v: '$25', u: '/ MTok' },
]

export default function ChapterIdentity({ reducedMotion }: Props) {
  const ref = useRef<HTMLElement>(null)
  const vis = useInView(ref, 0.15)
  const show = vis || reducedMotion

  return (
    <section ref={ref} style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
      padding: 'clamp(80px, 12vh, 140px) clamp(24px, 5vw, 80px)',
      background: 'linear-gradient(180deg, #050302, #110d08 40%, #150f07 100%)',
      clipPath: 'inset(0)',
    }}>
      {/* Massive background numeral — scale contrast element */}
      <div aria-hidden="true" style={{
        position: 'absolute', right: 'clamp(-60px, -3vw, -20px)', top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(180px, 35vw, 600px)',
        fontWeight: 900, fontStyle: 'italic', lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '1px rgba(251,191,36,0.04)',
        userSelect: 'none', pointerEvents: 'none', overflow: 'hidden',
      }}>4.6</div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, width: '100%' }}>
        <div style={{
          opacity: show ? 1 : 0,
          transform: show ? 'none' : 'translateY(50px)',
          transition: reducedMotion ? 'none' : 'all 1s var(--ease-out-expo)',
        }}>
          <Tag>01 — 身份</Tag>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700,
            lineHeight: 1.2, color: 'var(--amber-100)',
            marginBottom: 20, letterSpacing: '-0.02em',
          }}>
            我是 Anthropic 做的旗艦語言模型
          </h2>

          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.85,
            color: 'var(--dark-400)', maxWidth: 560,
          }}>
            2026 年 2 月 5 日發布。Opus 級第一個百萬 token 上下文窗口。
            架構與參數量未公開，輸入文字與圖片，輸出純文字。
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12, marginTop: 44,
        }}>
          {SPECS.map((s, i) => (
            <div key={i} style={{
              padding: '18px 16px',
              background: 'rgba(251,191,36,0.03)',
              border: '1px solid rgba(251,191,36,0.07)',
              borderRadius: 8,
              opacity: show ? 1 : 0,
              transform: show ? 'none' : 'translateY(24px) scale(0.97)',
              transition: reducedMotion ? 'none' : `all 0.7s ${0.15 + i * 0.07}s var(--ease-out-expo)`,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                letterSpacing: '0.12em', color: 'var(--amber-600)',
                textTransform: 'uppercase', marginBottom: 6,
              }}>{s.k}</div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 700,
                color: 'var(--amber-200)', lineHeight: 1.2,
              }}>
                {s.v}
                {s.u && <span style={{ fontSize: '0.45em', fontWeight: 400, opacity: 0.5, marginLeft: 4 }}>{s.u}</span>}
              </div>
            </div>
          ))}
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
