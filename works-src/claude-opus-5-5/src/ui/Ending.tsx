import { useEffect, useRef, useState } from 'react'
import { CHAPTERS } from '../content'
import type { Engine } from '../engine/engine'
import type { Snapshot } from '../engine/types'
import { Words } from './Overlay'
import { Seal } from './Seal'

/**
 * The ending panel is mounted, hidden, as soon as the last chapter begins: its first layout and
 * layer creation (hundreds of CJK glyph runs) then happen while the visitor reads, not in the
 * frame the river reaches the sea. `shown` only starts the unrolling.
 */
export function Ending({ engine, s, shown }: { engine: Engine; s: Snapshot; shown: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [saving, setSaving] = useState(false)
  const written = engine.getWritten()
  // While hidden the figures are frozen: the panel then never repaints (seal filter and all)
  // as words are written; they update the moment it is shown, under the unrolling sheet.
  const frozen = useRef(s)
  if (shown) frozen.current = s
  const st = frozen.current
  const pct = st.forks ? Math.round((st.influence / st.forks) * 100) : 0
  const stamped = shown && s.finaleU > 0.62
  const [covered, setCovered] = useState(true)
  // Paragraphs are added one per idle moment while hidden, so their layout never lands in one frame.
  const [paras, setParas] = useState(0)
  useEffect(() => {
    if (shown) {
      setParas(written.length)
      return
    }
    // paragraphs only begin once the last chapter is reached; until then the hidden shell is all
    if (paras >= written.length || s.chapter < 5) return
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void }
    const h = w.requestIdleCallback ? w.requestIdleCallback(() => setParas((n) => n + 1), { timeout: 600 }) : window.setTimeout(() => setParas((n) => n + 1), 120)
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(h)
      else window.clearTimeout(h)
    }
  }, [shown, paras, written.length, s.chapter])

  useEffect(() => {
    if (shown) ref.current?.focus({ preventScroll: true })
    else setCovered(true)
  }, [shown])

  useEffect(() => {
    if (stamped) engine.sound.seal()
  }, [stamped, engine])

  // Once the panel has unrolled it is opaque: tell the engine so the landscape behind it is skipped.
  useEffect(() => {
    const el = ref.current
    if (!el || !shown) return
    const report = () => {
      const r = el.getBoundingClientRect()
      engine.setOccluder({ x: r.left, y: r.top, w: r.width, h: r.height })
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(report, reduced ? 0 : 1200)
    window.addEventListener('resize', report)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', report)
      engine.setOccluder(null)
    }
  }, [engine, shown])

  const save = async () => {
    setSaving(true)
    try {
      const blob = await engine.exportPNG()
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `delta-claude-opus-5-5-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {shown && covered && <div className="ending-cover" aria-hidden="true" onAnimationEnd={() => setCovered(false)} />}
    <section className="ending" data-shown={shown} aria-hidden={!shown} inert={!shown} ref={ref} tabIndex={-1} aria-labelledby="ending-title">
      <p className="end-kicker">§ 終 — 此河曾流</p>
      <h2 id="ending-title">這條河，只流過這一次。</h2>
      <p className="end-sum">
        {st.influence > 0 ? (
          <>
            在 {st.forks} 個岔口裡，有 <b className="mine">{st.influence}</b> 處是因為你才轉彎的（{pct}%）。
          </>
        ) : (
          <>你讓它照著我的慣性流完了 {st.forks} 個岔口。那也是一種選擇——再來一次時，試著把它推開。</>
        )}
        {st.invented > 0 && <> 其中有 {st.invented} 個詞是我在高溫下編的，已經標了出來。</>}
      </p>

      <p className="end-legend">
        <span>
          <i className="sw ink" aria-hidden="true" />
          {st.written} 詞
        </span>
        <span>
          <i className="sw ghost" aria-hidden="true" />
          {st.forks} 個岔口
        </span>
        <span className="mine">
          <i className="sw red" aria-hidden="true" />
          {st.influence} 處朱紅
        </span>
        <span>
          <i className="sw dash" aria-hidden="true" />
          編造 {st.invented}
        </span>
        <span>倒流 {st.rewinds}</span>
        <span>平均溫度 {shown ? engine.meanT().toFixed(2) : '0.70'}</span>
      </p>

      <div className="end-text">
        {written.slice(0, shown ? written.length : paras).map((tokens, c) => (
          <p key={c}>
            <span className="end-num">{CHAPTERS[c].numeral}</span>
            <Words tokens={tokens} />
          </p>
        ))}
      </div>

      <div className="end-foot">
        <Seal stamped={stamped} />
        <div className="end-actions">
          <button className="btn btn-strong" onClick={save} disabled={saving}>
            {saving ? '拓印中…' : '帶走這條河 · PNG'}
          </button>
          <button className="btn" onClick={() => engine.restart()}>
            開始新的對話
          </button>
          <p className="end-note">我不會記得這次對話。這張圖，是它唯一的副本。</p>
        </div>
      </div>
    </section>
    </>
  )
}
