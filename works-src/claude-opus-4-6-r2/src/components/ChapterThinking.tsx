import { useRef, useState, useCallback, useEffect } from 'react'
import { useInView } from '../hooks/useInView.ts'

interface Props { reducedMotion: boolean }

const LEVELS = [
  { key: 'low', label: '低', desc: '直接回答，不額外推理', depth: 15, color: '#78716c', blocks: 2 },
  { key: 'medium', label: '中', desc: '適度推理，平衡速度與品質', depth: 40, color: '#d97706', blocks: 4 },
  { key: 'high', label: '高（預設）', desc: '需要時自動啟動深度推理', depth: 68, color: '#f59e0b', blocks: 7 },
  { key: 'max', label: '最大', desc: '全力推理，不惜 token 代價追求正確', depth: 100, color: '#fbbf24', blocks: 12 },
] as const

export default function ChapterThinking({ reducedMotion }: Props) {
  const ref = useRef<HTMLElement>(null)
  const vis = useInView(ref, 0.12)
  const show = vis || reducedMotion
  const [active, setActive] = useState(2)
  const cur = LEVELS[active]

  /* Animated block count */
  const [displayedBlocks, setDisplayedBlocks] = useState<number>(cur.blocks)
  useEffect(() => {
    if (reducedMotion) { setDisplayedBlocks(cur.blocks); return }
    setDisplayedBlocks(0)
    let n = 0
    const iv = setInterval(() => {
      n++
      setDisplayedBlocks(n)
      if (n >= cur.blocks) clearInterval(iv)
    }, 50)
    return () => clearInterval(iv)
  }, [cur.blocks, reducedMotion])

  const pick = useCallback((i: number) => setActive(i), [])

  return (
    <section ref={ref} style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(80px, 12vh, 140px) clamp(24px, 5vw, 80px)',
      background: 'linear-gradient(180deg, #150f07, #0c0a09 45%, #0e0a05 100%)',
    }}>
      <div style={{
        maxWidth: 880, width: '100%',
        opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(50px)',
        transition: reducedMotion ? 'none' : 'all 1s var(--ease-out-expo)',
      }}>
        <Tag>02 — 思考</Tag>

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(26px, 4.5vw, 44px)', fontWeight: 700,
          lineHeight: 1.2, color: 'var(--amber-100)',
          marginBottom: 14, letterSpacing: '-0.02em',
        }}>
          我會自己決定要想多深
        </h2>
        <p style={{
          fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.85,
          color: 'var(--dark-400)', maxWidth: 540, marginBottom: 40,
        }}>
          Adaptive Thinking：根據問題難度自動調整推理深度，不再一律燒固定的思考預算。
        </p>

        {/* Effort selector buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {LEVELS.map((lv, i) => (
            <button key={lv.key} onClick={() => pick(i)} style={{
              padding: '10px 22px', fontFamily: 'var(--font-mono)', fontSize: 13,
              fontWeight: active === i ? 700 : 400, letterSpacing: '0.04em',
              color: active === i ? 'var(--dark-950)' : lv.color,
              background: active === i ? lv.color : 'transparent',
              border: `1.5px solid ${active === i ? lv.color : lv.color + '66'}`,
              borderRadius: 6, cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: active === i ? `0 0 20px ${lv.color}33` : 'none',
            }}>
              {lv.label}
            </button>
          ))}
        </div>

        {/* Visualization panel */}
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(251,191,36,0.08)',
          borderRadius: 14, padding: 'clamp(24px, 4vw, 40px)',
          backdropFilter: 'blur(8px)',
        }}>
          {/* Depth meter */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
              color: 'var(--amber-600)', textTransform: 'uppercase', marginBottom: 10,
            }}>思考深度</div>
            <div style={{
              position: 'relative', width: '100%', height: 6,
              background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${cur.depth}%`,
                background: `linear-gradient(90deg, ${cur.color}55, ${cur.color})`,
                boxShadow: `0 0 16px ${cur.color}44`,
                transition: 'width 0.6s var(--ease-out-expo)',
              }} />
            </div>
          </div>

          {/* Thinking blocks — cascade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minHeight: 80 }}>
            {Array.from({ length: displayedBlocks }).map((_, i) => {
              const w = [100, 92, 78, 65, 85, 50, 70, 58, 90, 42, 68, 55][i % 12]
              return (
                <div key={`${active}-${i}`} style={{
                  height: 5, width: `${w}%`, borderRadius: 2.5,
                  background: `linear-gradient(90deg, ${cur.color}18, ${cur.color}08)`,
                  transformOrigin: 'left',
                  animation: reducedMotion ? 'none' : `blockIn 0.3s ${i * 0.04}s var(--ease-spring) both`,
                }} />
              )
            })}
          </div>

          {/* Current level descriptor */}
          <div style={{
            marginTop: 24, padding: '14px 18px',
            background: 'rgba(0,0,0,0.4)', borderRadius: 8,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, color: cur.color, fontWeight: 600,
            }}>effort: &quot;{cur.key}&quot;</span>
            <div style={{ fontSize: 13, color: 'var(--dark-400)', marginTop: 4 }}>{cur.desc}</div>
          </div>
        </div>

        <p style={{
          marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--dark-600)', letterSpacing: '0.02em',
        }}>
          ↑ 點擊按鈕切換推理深度
        </p>
      </div>

      <style>{`
        @keyframes blockIn {
          from { transform: scaleX(0); opacity: 0 }
          to { transform: scaleX(1); opacity: 1 }
        }
      `}</style>
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
