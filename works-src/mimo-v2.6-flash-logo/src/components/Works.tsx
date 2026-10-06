import { useState } from 'react'

type Work = {
  title: string
  cat: '品牌' | '產品' | '視覺'
  year: string
  desc: string
  from: string
  to: string
  motif: 'ring' | 'petal' | 'cloud' | 'code'
}

const WORKS: Work[] = [
  {
    title: '花時鐘 · 品牌官網',
    cat: '品牌',
    year: '2025',
    desc: '以四季更迭為敘事主軸的 studio 首頁，捲動即換季。',
    from: '#ffd9e4',
    to: '#9fb2e8',
    motif: 'ring',
  },
  {
    title: '雲箋 · 閱讀器',
    cat: '產品',
    year: '2025',
    desc: '為長文而生的閱讀介面，留白即呼吸，排版即節奏。',
    from: '#e8ecff',
    to: '#f7a8c0',
    motif: 'cloud',
  },
  {
    title: '咲 · 設計系統',
    cat: '視覺',
    year: '2024',
    desc: '粉與藍的雙色體系，花瓣模數化的元件庫與規範文件。',
    from: '#ffeef4',
    to: '#c3d0f5',
    motif: 'petal',
  },
  {
    title: '夢碼 · 產生器',
    cat: '產品',
    year: '2024',
    desc: '把自然語言編譯成版面草稿的小工具，靈感即時成形。',
    from: '#dfe6ff',
    to: '#ffd9e4',
    motif: 'code',
  },
  {
    title: '晚櫻 · 活動主視覺',
    cat: '視覺',
    year: '2024',
    desc: '一場春夜講座的主視覺，燈下花影與印刷質感的平衡。',
    from: '#ffd2dd',
    to: '#8fa4dd',
    motif: 'petal',
  },
  {
    title: '環 · 工作室識別',
    cat: '品牌',
    year: '2023',
    desc: '未閉合的圓環象徵持續迭代，收攏所有接觸點的語氣。',
    from: '#eef1ff',
    to: '#f9c3d3',
    motif: 'ring',
  },
]

const CATS = ['全部', '品牌', '產品', '視覺'] as const

function Motif({ kind }: { kind: Work['motif'] }) {
  if (kind === 'ring') {
    return (
      <svg viewBox="0 0 200 200" className="motif" aria-hidden="true">
        <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="10" strokeDasharray="330 60" strokeLinecap="round" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="3" />
      </svg>
    )
  }
  if (kind === 'petal') {
    return (
      <svg viewBox="0 0 200 200" className="motif" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 72} 100 100)`}>
            <path
              d="M100 100 C 78 78, 82 44, 100 30 C 118 44, 122 78, 100 100 Z"
              fill="rgba(255,255,255,.8)"
            />
          </g>
        ))}
        <circle cx="100" cy="100" r="7" fill="rgba(255,255,255,.95)" />
      </svg>
    )
  }
  if (kind === 'cloud') {
    return (
      <svg viewBox="0 0 200 200" className="motif" aria-hidden="true">
        <path
          d="M56 128 a22 22 0 0 1 6-43 a30 30 0 0 1 57-12 a24 24 0 0 1 30 24 a20 20 0 0 1-6 31 Z"
          fill="rgba(255,255,255,.85)"
        />
        <path d="M70 146 h64" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 200" className="motif" aria-hidden="true">
      <text x="100" y="92" textAnchor="middle" fontSize="46" fill="rgba(255,255,255,.9)" fontFamily="ui-monospace, monospace">
        &lt;/&gt;
      </text>
      <path d="M64 118 h72 M64 134 h50" stroke="rgba(255,255,255,.65)" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export default function Works() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('全部')
  const list = WORKS.filter((w) => cat === '全部' || w.cat === cat)

  return (
    <div className="works-wrap">
      <div className="works-filter" role="tablist" aria-label="作品分類">
        {CATS.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            className={cat === c ? 'is-active' : ''}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="works-grid">
        {list.map((w) => (
          <article className="work-card" key={w.title}>
            <div className="work-visual" style={{ background: `linear-gradient(135deg, ${w.from}, ${w.to})` }}>
              <Motif kind={w.motif} />
              <span className="work-cat">{w.cat}</span>
            </div>
            <div className="work-meta">
              <h3>{w.title}</h3>
              <span className="work-year">{w.year}</span>
            </div>
            <p>{w.desc}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
