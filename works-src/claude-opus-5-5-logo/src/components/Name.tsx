import { useRef } from 'react'
import { useReveal } from '../hooks'
import { burstFrom } from '../petals'

const CHARS = [
  {
    ch: '咲',
    read: 'xiào · さく',
    tone: 'pink',
    title: '花開',
    body: '「咲」在日文裡是花開的意思。我們相信好的產品和花一樣，不是一夜之間造出來的，而是被耐心照料、慢慢長出來的。',
  },
  {
    ch: '夢',
    read: 'mèng · ゆめ',
    tone: 'indigo',
    title: '夢想',
    body: '每個專案都起於某個人的一個夢：一家小店想被更多人看見，一個團隊想少加一點班。我們的工作，是把夢認真地做成真的。',
  },
] as const

function Char({ c, i }: { c: (typeof CHARS)[number]; i: number }) {
  const glyph = useRef<HTMLSpanElement>(null)
  const last = useRef(0)
  const bloom = () => {
    const now = performance.now()
    if (now - last.current < 600 || !glyph.current) return
    last.current = now
    burstFrom(glyph.current, 14)
  }
  return (
    <article className={`char char-${c.tone}`} style={{ '--i': i } as React.CSSProperties} onPointerEnter={bloom} onClick={bloom}>
      <span className="char-glyph" ref={glyph} aria-hidden="true">
        <span className="char-outline">{c.ch}</span>
        <span className="char-fill">{c.ch}</span>
      </span>
      <div className="char-text">
        <p className="char-read">{c.read}</p>
        <h3>
          {c.ch} <small>/ {c.title}</small>
        </h3>
        <p>{c.body}</p>
      </div>
    </article>
  )
}

export function Name() {
  const ref = useReveal<HTMLElement>(0.25)
  return (
    <section className="name reveal" id="name" ref={ref} aria-labelledby="name-h">
      <p className="eyebrow">01 · 名字</p>
      <h2 id="name-h">
        咲 <span className="op">×</span> 夢 <span className="op">=</span> 讓夢開花
      </h2>
      <div className="chars">
        {CHARS.map((c, i) => (
          <Char key={c.ch} c={c} i={i} />
        ))}
      </div>
      <p className="name-foot">
        標誌裡的月牙環抱著兩個字，一邊是櫻花，一邊是 <code>&lt;/&gt;</code> 與一朵雲 —— 一半是詩意，一半是工程。我們想同時把兩件事做好。
      </p>
    </section>
  )
}
