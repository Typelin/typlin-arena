import { useRef, useState } from 'react'
import { burstAt } from './PetalCanvas'

type Line = { kind: 'comment' | 'code' | 'ok'; text: string }

const PRESETS = ['想做一個溫柔的官網', '想把想法變成產品', '想讓資料開出花來']

/** 心願編譯器：輸入一句話 → 生成一段「花語程式碼」＋花瓣迸發 */
export default function WishCompiler() {
  const [text, setText] = useState(PRESETS[0])
  const [lines, setLines] = useState<Line[]>([])
  const [busy, setBusy] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const compile = () => {
    const wish = text.trim() || '一個小小的夢'
    setBusy(true)
    setLines([])

    const seed = Array.from(wish).reduce((a, c) => a + c.charCodeAt(0), 0)
    const tone = seed % 2 === 0 ? 'sakura' : 'indigo'
    const recipe: Line[] = [
      { kind: 'comment', text: `// 心願：${wish}` },
      { kind: 'code', text: `import { bloom } from '@sakimu/garden'` },
      {
        kind: 'code',
        text: `const dream = bloom({ seed: ${seed}, tone: '${tone}', petals: ${5 + (seed % 9)} })`,
      },
      { kind: 'code', text: `dream.craft({ precision: 0.01, warmth: 0.99 })` },
      { kind: 'code', text: `export default dream.blossom()` },
      { kind: 'ok', text: '✓ 編譯完成 — 願望已開花' },
    ]

    recipe.forEach((line, i) => {
      window.setTimeout(() => {
        setLines((prev) => [...prev, line])
        if (i === recipe.length - 1) {
          setBusy(false)
          const rect = btnRef.current?.getBoundingClientRect()
          if (rect) burstAt(rect.left + rect.width / 2, rect.top)
        }
      }, 260 * (i + 1))
    })
  }

  return (
    <div className="wish card">
      <div className="wish-head">
        <span className="kicker">Interactive · 心願編譯器</span>
        <span className="wish-hint">寫下一句話，讓它開花</span>
      </div>

      <div className="wish-input-row">
        <input
          value={text}
          maxLength={40}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !busy && compile()}
          placeholder="例如：想做一個溫柔的官網"
          aria-label="心願內容"
        />
        <button ref={btnRef} className="btn primary" onClick={compile} disabled={busy}>
          {busy ? '編譯中…' : '編譯心願'}
        </button>
      </div>

      <div className="wish-presets">
        {PRESETS.map((p) => (
          <button key={p} className="chip" onClick={() => setText(p)}>
            {p}
          </button>
        ))}
      </div>

      <pre className="wish-output" aria-live="polite">
        {lines.length === 0 ? (
          <span className="wish-idle">// 輸出將顯示於此</span>
        ) : (
          lines.map((l, i) => (
            <code key={i} className={`ln-${l.kind}`}>
              {l.text}
            </code>
          ))
        )}
      </pre>
    </div>
  )
}
