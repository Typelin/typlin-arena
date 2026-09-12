import { useRef, useState, type PointerEvent } from 'react'
import { NAME } from '../data/content'
import { Logo } from './Logo'
import { Reveal } from './Reveal'

export function Etymology() {
  const [split, setSplit] = useState(50)
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromEvent = (clientX: number) => {
    const el = track.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const next = ((clientX - r.left) / r.width) * 100
    setSplit(Math.min(78, Math.max(22, next)))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromEvent(e.clientX)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    setFromEvent(e.clientX)
  }
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const koan =
    split > 62 ? NAME.koans.bloom : split < 38 ? NAME.koans.dream : NAME.koans.seam

  return (
    <Reveal as="section" className="section name-sec" id="name">
      <p className="kicker">
        <span>{NAME.kicker}</span>
        <i />
        NAME
      </p>
      <h2>{NAME.title}</h2>
      <p className="lead">{NAME.lead}</p>

      <div
        ref={track}
        className="seam"
        style={{ ['--split' as string]: `${split}%` }}
      >
        <article className="seam-pane seam-bloom">
          <p className="ruby">{NAME.bloom.ruby}</p>
          <h3>{NAME.bloom.glyph}</h3>
          <p>{NAME.bloom.body}</p>
        </article>
        <article className="seam-pane seam-dream">
          <p className="ruby">{NAME.dream.ruby}</p>
          <h3>{NAME.dream.glyph}</h3>
          <p>{NAME.dream.body}</p>
        </article>
        <div
          className="seam-handle"
          role="slider"
          aria-valuemin={22}
          aria-valuemax={78}
          aria-valuenow={Math.round(split)}
          aria-label="拖动接缝，看咲与梦谁多一点"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplit((s) => Math.max(22, s - 4))
            if (e.key === 'ArrowRight') setSplit((s) => Math.min(78, s + 4))
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <Logo variant="mark" alt="" className="seam-seal" />
        </div>
      </div>

      <p className="seam-koan" aria-live="polite">
        {koan}
      </p>
      <p className="hint">拖动中间的标志。粉多一点是花，蓝多一点是梦。</p>
    </Reveal>
  )
}
