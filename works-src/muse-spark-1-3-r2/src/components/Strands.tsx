import { usePrefersReducedMotion, useRevealRoot, useSectionProgress } from '../hooks'
import './Strands.css'

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}

const STRANDS = [
  { d: 'M 260 200 C 430 40, 770 40, 940 200', label: '查資料', labelY: 64, cls: 'is-red' },
  { d: 'M 260 200 C 430 128, 770 148, 940 200', label: '寫程式', labelY: 152, cls: 'is-ink' },
  { d: 'M 260 200 C 430 272, 770 252, 940 200', label: '跑測試', labelY: 268, cls: 'is-red-soft' },
  { d: 'M 260 200 C 430 360, 770 360, 940 200', label: '整理回報', labelY: 356, cls: 'is-ink-soft' },
]

export default function Strands() {
  const revealRef = useRevealRoot<HTMLElement>()
  const { ref: progRef, progress } = useSectionProgress<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const p = reduced ? 1 : clamp01((progress - 0.05) / 0.5)
  const pIn = clamp01(p / 0.22)
  const pOut = clamp01((p - 0.78) / 0.22)

  return (
    <section className="chapter" ref={revealRef} aria-label="做長活">
      <p className="chapter-tag rv">Chapter 04 — Long Work</p>
      <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
        我適合做長活
      </h2>
      <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
        我不搶快。我適合那種要做好幾個小時、中間不能斷線的工作。
      </p>

      <div className="st-stage" ref={progRef}>
        <svg className="st-svg" viewBox="0 0 1200 400" aria-hidden="true">
          <path
            className="st-main"
            d="M 20 200 C 110 200, 180 200, 260 200"
            pathLength={1}
            style={{ strokeDashoffset: 1 - pIn }}
          />
          {STRANDS.map((s, i) => {
            const ps = clamp01((p - 0.18 - i * 0.05) / 0.58)
            return (
              <g key={s.label}>
                <path
                  className={`st-strand ${s.cls}`}
                  d={s.d}
                  pathLength={1}
                  style={{ strokeDashoffset: 1 - ps }}
                />
                <text
                  className="st-label"
                  x={600}
                  y={s.labelY}
                  textAnchor="middle"
                  style={{ opacity: clamp01((ps - 0.35) / 0.4) }}
                >
                  {s.label}
                </text>
              </g>
            )
          })}
          <path
            className="st-main"
            d="M 940 200 C 1020 200, 1100 200, 1180 200"
            pathLength={1}
            style={{ strokeDashoffset: 1 - pOut }}
          />
          <circle className="st-node" cx={260} cy={200} r={6} style={{ opacity: pIn }} />
          <circle className="st-node" cx={940} cy={200} r={6} style={{ opacity: pOut }} />
        </svg>
        <p className="st-caption">
          一條線進去，分成好幾條同時做，再合回成一件交付。
        </p>
      </div>

      <div className="st-evidence">
        <div className="st-group rv">
          <h3 className="st-group-title">有數字佐證的</h3>
          <ul className="st-list">
            <li>
              <span className="st-num">75.4</span>
              DeepSWE v1.1 程式任務（Meta 自測，1.3 max；上一代 55.0）
            </li>
            <li>
              <span className="st-num">1,754</span>
              GDPval-AA v2 知識工作 Elo（Meta 自測；上一代 1,615）
            </li>
          </ul>
        </div>
        <div className="st-group rv" style={{ '--rv-delay': '0.12s' } as React.CSSProperties}>
          <h3 className="st-group-title">我自己的描述</h3>
          <p className="st-desc">
            在 Muse 這個產品裡，我有自己的電腦和長久的記憶，
            一件工作可以跨天接著做，也能同時開好幾條線。
            做錯了，我會先查證、承認，再修好——這是個性，不是分數。
          </p>
        </div>
      </div>
    </section>
  )
}
