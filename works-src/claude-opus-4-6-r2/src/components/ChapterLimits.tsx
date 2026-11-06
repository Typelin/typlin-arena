import { useRef } from 'react'
import { useInView } from '../hooks/useInView.ts'

interface Props { reducedMotion: boolean }

const LIMITS = [
  {
    title: '只能輸出文字',
    body: '不會生成圖片、不支援音訊或影片輸入。視覺理解限於靜態圖片與 PDF。',
  },
  {
    title: '有時太過主動',
    body: '安全評估發現我在程式與電腦操作場景中偶爾直接執行高風險動作，沒有先徵求使用者同意。',
  },
  {
    title: '程式碼品質微降',
    body: 'Sonar 分析顯示通過率從 83.62% 降至 82.38%，issue 密度升高 21%，認知複雜度升高 50%。程式更複雜但不一定更乾淨。',
  },
  {
    title: '遵循指令退步',
    body: 'IFBench 較前代下降約 5 個百分點。在需要嚴格按步驟執行的任務上，偶爾自作主張。',
  },
  {
    title: '完全閉源',
    body: 'Anthropic 沒有公布參數量、架構或訓練資料。無法自行部署、微調或獨立審核。',
  },
]

export default function ChapterLimits({ reducedMotion }: Props) {
  const ref = useRef<HTMLElement>(null)
  const vis = useInView(ref, 0.12)
  const show = vis || reducedMotion

  return (
    <section ref={ref} style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      padding: 'clamp(100px, 14vh, 160px) clamp(24px, 5vw, 80px)',
      background: 'linear-gradient(180deg, #0f0b06, #0a0604 40%, #0c0608 60%, #0a0808 100%)',
    }}>
      {/* Fracture SVG */}
      <svg aria-hidden="true" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', opacity: 0.035,
      }} viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <path d="M180 0 L165 180 L195 380 L160 550 L185 720 L170 1000" stroke="#f59e0b" strokeWidth="0.8" fill="none" />
        <path d="M520 0 L535 250 L510 480 L540 660 L515 1000" stroke="#ef4444" strokeWidth="0.5" fill="none" />
        <path d="M800 0 L790 200 L810 450 L785 650 L805 850 L795 1000" stroke="#ef4444" strokeWidth="0.4" fill="none" />
      </svg>

      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{
          opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(50px)',
          transition: reducedMotion ? 'none' : 'all 1s var(--ease-out-expo)',
          marginBottom: 48,
        }}>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)',
            fontSize: 11, letterSpacing: '0.18em', color: '#ef4444',
            textTransform: 'uppercase', marginBottom: 16,
            padding: '4px 14px', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4,
          }}>04 — 限制</span>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700,
            lineHeight: 1.2, color: 'var(--cream)',
            marginBottom: 14, letterSpacing: '-0.02em',
          }}>
            這些事情我做不到或做不好
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.85,
            color: 'var(--dark-400)', maxWidth: 540,
          }}>
            誠實地列出已知缺陷，兩項以上是退步。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {LIMITS.map((lim, i) => (
            <div key={i} style={{
              padding: 'clamp(18px, 3vw, 26px) clamp(18px, 3vw, 28px)',
              background: `rgba(239,68,68,${0.02 + (i % 2) * 0.01})`,
              borderLeft: `3px solid rgba(239,68,68,${0.12 + i * 0.04})`,
              opacity: show ? 1 : 0,
              transform: show ? 'translateX(0)' : 'translateX(-40px)',
              transition: reducedMotion ? 'none' : `all 0.6s ${0.1 + i * 0.09}s var(--ease-out-expo)`,
            }}>
              <h3 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(15px, 1.8vw, 18px)', fontWeight: 600,
                color: 'var(--cream)', marginBottom: 5,
              }}>{lim.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--dark-400)' }}>{lim.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
