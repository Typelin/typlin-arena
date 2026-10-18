import { useEffect, useRef } from 'react'
import { CHAPTERS } from '../content'
import type { Engine } from '../engine/engine'
import type { Snapshot } from '../engine/types'
import { Words } from './Overlay'

export function ReadDialog({ open, onClose, engine, s }: { open: boolean; onClose: () => void; engine: Engine; s: Snapshot }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const written = open ? engine.getWritten() : []

  return (
    <dialog ref={ref} className="read" onClose={onClose} aria-labelledby="read-title">
      <div className="read-inner">
        <header className="read-head">
          <h2 id="read-title">全文</h2>
          <button className="btn" onClick={onClose} autoFocus>
            關閉
          </button>
        </header>

        <section aria-label="目前寫下的文字">
          {written.every((t) => t.length === 0) && <p className="read-empty">河還沒有開始流。</p>}
          {written.map((tokens, c) =>
            tokens.length ? (
              <p key={c} className="read-p">
                <span className="end-num">{CHAPTERS[c].numeral}</span>
                <Words tokens={tokens} />
              </p>
            ) : null,
          )}
        </section>

        <section className="read-legend" aria-label="怎麼讀這件作品">
          <h3>怎麼讀</h3>
          <ul>
            <li>
              <i className="sw ink" aria-hidden="true" />
              墨黑：我自己最可能寫下的詞。線越粗，我越確定。
            </li>
            <li>
              <i className="sw red" aria-hidden="true" />
              朱紅：因為你而改變的詞——如果你沒有推它，那裡會是另一個詞。
            </li>
            <li>
              <i className="sw ghost" aria-hidden="true" />
              灰：沒走的岔路，旁邊的小數是它當時的機率。
            </li>
            <li>
              <i className="sw dash" aria-hidden="true" />
              虛線與重影：溫度過高時我編造的詞。
            </li>
          </ul>
          <h3>怎麼玩</h3>
          <ul className="plain">
            <li>捲動或按 →：河往前流。往回捲或按 ←：倒流，再往前時它可能選另一條路。</li>
            <li>滑鼠指向、點選，或按數字鍵 1–9：讓河往那個詞轉彎。</li>
            <li>長按畫面、按住「升溫」或空白鍵：溫度升高，機率被拉平。</li>
          </ul>
          <p className="read-about">
            這些數字是真實的取樣過程：每個岔口的機率經過溫度 softmax 後抽樣；朱紅與否，是拿同一個隨機數、在沒有你干預的情況下重算一次來判定。
            目前已寫 {s.written} 詞。
          </p>
        </section>
      </div>
    </dialog>
  )
}
