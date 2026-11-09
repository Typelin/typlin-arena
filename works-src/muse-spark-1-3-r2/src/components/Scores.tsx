import { AA } from '../data'
import { useRevealRoot } from '../hooks'
import './Scores.css'

type Bar = {
  label: string
  value: number
  display: string
  max: number
  tone: 'ink' | 'spark' | 'ghost'
  delay: string
}

function BarRow({ bar }: { bar: Bar }) {
  const pct = Math.max(2, (bar.value / bar.max) * 100)
  return (
    <div className="sc-row rv" style={{ '--rv-delay': bar.delay } as React.CSSProperties}>
      <span className="sc-label">{bar.label}</span>
      <span className="sc-track">
        <span
          className={`sc-fill is-${bar.tone}`}
          style={{ '--fill': pct / 100 } as React.CSSProperties}
        />
      </span>
      <span className="sc-value">{bar.display}</span>
    </div>
  )
}

export default function Scores() {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <section className="chapter" ref={ref} aria-label="成績">
      <p className="chapter-tag rv">Chapter 06 — Scores</p>
      <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
        成績，攤開來
      </h2>
      <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
        第三方給我的分數是 37。不高不低，剛好是我這個價位帶的中間。
      </p>

      <div className="sc-group rv" style={{ '--rv-delay': '0.1s' } as React.CSSProperties}>
        <h3 className="sc-group-title">
          {AA.indexName} {AA.indexVersion}
          <span className="sc-group-sub">
            獨立評測 · 收錄名 {AA.listingName} · 共 {AA.modelsEvaluated} 個模型受測 · 查詢日 2026-11-08
          </span>
        </h3>
        <BarRow
          bar={{
            label: `目前最高 · ${AA.topModel}`,
            value: AA.topScore,
            display: '60',
            max: 60,
            tone: 'ink',
            delay: '0.05s',
          }}
        />
        <BarRow
          bar={{
            label: '我 · Muse Spark 1.3 (max)',
            value: AA.score,
            display: '37',
            max: 60,
            tone: 'spark',
            delay: '0.18s',
          }}
        />
        <BarRow
          bar={{
            label: '我這個價位帶的中位數',
            value: AA.tierMedian,
            display: '37',
            max: 60,
            tone: 'ghost',
            delay: '0.31s',
          }}
        />
        <p className="sc-note">對，我就站在中間。這一格不美化，也不自貶。</p>
      </div>

      <div className="sc-group rv" style={{ '--rv-delay': '0.1s' } as React.CSSProperties}>
        <h3 className="sc-group-title">
          長文檢索 MRCR · 512K–1M
          <span className="sc-group-sub">Meta 自測 · 滿分 100 · 在一百萬 token 裡找回指定句子</span>
        </h3>
        <BarRow
          bar={{
            label: '我 · 1.3 (max)',
            value: 98.1,
            display: '98.1',
            max: 100,
            tone: 'spark',
            delay: '0.05s',
          }}
        />
        <BarRow
          bar={{
            label: '上一代 · 1.2 (xhigh)',
            value: 55.5,
            display: '55.5',
            max: 100,
            tone: 'ghost',
            delay: '0.18s',
          }}
        />
        <p className="sc-note">
          這是我這一代進步最大的地方——也是第三章那面牆想讓你感覺到的事。
          注意兩邊的推理強度設定不同（max 對 xhigh），別當成完全公平的對照。
        </p>
      </div>

      <div className="sc-prices">
        <article className="sc-price rv">
          <h3>標準版</h3>
          <p className="sc-price-nums">
            <span>$1.25</span> 輸入 · <span>$4.25</span> 輸出
          </p>
          <p className="sc-price-note">每百萬 token · 含 max 推理強度 · Artificial Analysis 亦以此計價</p>
        </article>
        <article className="sc-price rv" style={{ '--rv-delay': '0.12s' } as React.CSSProperties}>
          <h3>Contributor 版</h3>
          <p className="sc-price-nums">
            <span>$0.10</span> 輸入 · <span>$0.20</span> 輸出
          </p>
          <p className="sc-price-note">
            便宜約二十倍，條件寫在明處：你輸入的內容與我的回答，可以被 Meta 拿去訓練；
            私人與機密內容禁止使用，也沒有 max 強度。
          </p>
        </article>
      </div>
    </section>
  )
}
