import { useRef } from 'react'
import { useInView } from '../hooks/useInView.ts'

interface Props { reducedMotion: boolean }

const ITEMS = [
  {
    num: '65.4', pct: true,
    title: 'Terminal-Bench 2.0',
    body: '在終端環境中持續偵錯、跨檔修改，發布時業界最高分。',
    badge: '有數字佐證',
    accent: false,
  },
  {
    num: '76', pct: true,
    title: 'MRCR v2 · 百萬 token 八針',
    body: '在一百萬 token 文件堆裡精確定位八個埋藏的細節。前代 Sonnet 4.5 僅 18.5%。',
    badge: '有數字佐證',
    accent: false,
  },
  {
    num: '91.9', pct: true,
    title: 'τ²-bench Retail',
    body: '用工具完成零售業客服任務，領先 GPT-5.2 近 10 個百分點。',
    badge: '有數字佐證',
    accent: false,
  },
  {
    num: '84', pct: true,
    title: 'BrowseComp · 網路搜尋',
    body: '在真實網路中找到難以定位的資訊。多代理架構可達 86.8%。',
    badge: '有數字佐證',
    accent: true,
  },
]

export default function ChapterStrengths({ reducedMotion }: Props) {
  const ref = useRef<HTMLElement>(null)
  const vis = useInView(ref, 0.08)
  const show = vis || reducedMotion

  return (
    <section ref={ref} style={{
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(100px, 14vh, 160px) clamp(24px, 5vw, 80px)',
      background: 'linear-gradient(180deg, #0e0a05, #18120a 35%, #1a1308 55%, #0f0b06 100%)',
    }}>
      {/* Scale contrast: enormous circle vs tiny dot */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '-20vw', top: '5%',
        width: 'max(600px, 70vw)', height: 'max(600px, 70vw)',
        borderRadius: '50%', border: '1px solid rgba(251,191,36,0.02)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', right: '12%', top: '18%',
        width: 5, height: 5, borderRadius: '50%',
        background: 'var(--amber-400)', opacity: 0.5,
        boxShadow: '0 0 24px rgba(251,191,36,0.35)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(50px)',
          transition: reducedMotion ? 'none' : 'all 1s var(--ease-out-expo)',
          marginBottom: 60,
        }}>
          <Tag>03 — 擅長</Tag>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700,
            lineHeight: 1.2, color: 'var(--amber-100)',
            marginBottom: 14, letterSpacing: '-0.02em',
          }}>
            寫程式、讀長文、做研究
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.85,
            color: 'var(--dark-400)', maxWidth: 540,
          }}>
            發布時在編程、長上下文、科學推理和知識工作拿到多項業界最高。
          </p>
        </div>

        {/* Cards with alternating alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3.5vh, 40px)' }}>
          {ITEMS.map((item, i) => {
            const isEven = i % 2 === 0
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(80px, 18vw, 200px) 1fr',
                gap: 'clamp(12px, 3vw, 36px)',
                alignItems: 'center',
                padding: item.accent ? 'clamp(20px, 3vw, 32px)' : '0',
                background: item.accent ? 'rgba(251,191,36,0.04)' : 'transparent',
                border: item.accent ? '1px solid rgba(251,191,36,0.08)' : 'none',
                borderRadius: item.accent ? 12 : 0,
                opacity: show ? 1 : 0,
                transform: show ? 'none' : `translateX(${isEven ? '-50px' : '50px'})`,
                transition: reducedMotion ? 'none' : `all 0.9s ${0.15 + i * 0.13}s var(--ease-out-expo)`,
              }}>
                {/* BIG number */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: item.accent ? 'clamp(64px, 14vw, 150px)' : 'clamp(48px, 11vw, 120px)',
                  fontWeight: 700, fontStyle: 'italic',
                  lineHeight: 0.95, textAlign: 'right',
                  background: item.accent
                    ? 'linear-gradient(160deg, var(--amber-100), var(--amber-400))'
                    : 'linear-gradient(160deg, var(--amber-200), var(--amber-600))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  filter: item.accent
                    ? 'drop-shadow(0 0 40px rgba(251,191,36,0.18))'
                    : 'drop-shadow(0 0 20px rgba(251,191,36,0.08))',
                }}>
                  {item.num}
                  {item.pct && (
                    <span style={{
                      fontSize: '0.28em', fontStyle: 'normal', fontWeight: 400,
                      verticalAlign: 'super', opacity: 0.5,
                    }}>%</span>
                  )}
                </div>

                {/* Text */}
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 'clamp(15px, 1.8vw, 19px)',
                    fontWeight: 600, color: 'var(--amber-200)', marginBottom: 5,
                  }}>{item.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--dark-400)', maxWidth: 400 }}>
                    {item.body}
                  </p>
                  <span style={{
                    display: 'inline-block', marginTop: 8,
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'var(--amber-700)',
                    padding: '2px 8px', background: 'rgba(217,119,6,0.1)', borderRadius: 3,
                  }}>{item.badge}</span>
                </div>
              </div>
            )
          })}
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
