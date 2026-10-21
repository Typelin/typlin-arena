import { useUi } from '../engine/store'

const HINTS: Record<number, string> = {
  1: '撥一下。按住弦、左右滑動撥點，看哪些泛音醒著。',
  2: '先撥你的弦。然後調音，再撥一次。',
}

/** 兩條固定的文字通道：互動後的註解（readout）與演奏中的字幕（caption）。 */
export function Readouts() {
  const { readout, caption, stage, seq } = useUi()
  const showHint = !readout && HINTS[stage] && seq !== 'running'
  return (
    <>
      <div className="readout" data-stage={stage} aria-live="polite">
        {readout ? (
          <p key={readout.id} className="bow">
            <b>{readout.text}</b>
            {readout.sub ? <span>{readout.sub}</span> : null}
          </p>
        ) : showHint ? (
          <p key={`hint-${stage}`} className="bow hint">
            <span>{HINTS[stage]}</span>
          </p>
        ) : null}
      </div>
      <div className="caption" aria-live="polite">
        {caption && stage >= 3 ? (
          <p key={caption.id} className="bow">
            {caption.text}
          </p>
        ) : null}
      </div>
    </>
  )
}
