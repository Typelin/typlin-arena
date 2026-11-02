import { useCallback, useRef, useState } from 'react'
import { useCanvas } from '../hooks'
import { paintAperture } from '../lib/paint'
import { renderSharp } from '../lib/print'
import { COVER, MODEL } from '../content'

/** 1.4 → 22，每 1/6 級一格，共 23 格。f 值越小、孔越大。 */
const STOPS = Array.from({ length: 23 }, (_, k) => 1.4 * Math.pow(2, k / 6))
const START = 10

const CREAM = '#f0ead9'
const ORANGE = '#e2571f'
const DARK = '#0a0a0a'

const fLabel = (f: number) => (f >= 9.5 ? f.toFixed(0) : f.toFixed(1))

export default function Cover() {
  const [stop, setStop] = useState(START)
  const [touched, setTouched] = useState(false)
  const dragging = useRef<{ x: number; from: number } | null>(null)
  const fNo = STOPS[stop]

  const ref = useCanvas(
    (canvas) => {
      renderSharp(
        canvas,
        (ctx, w, h) =>
          paintAperture(ctx, w, h, fNo, { bg: DARK, ink: CREAM, warm: ORANGE }),
        2,
      )
    },
    [stop],
  )

  const clamp = (v: number) => Math.max(0, Math.min(STOPS.length - 1, v))

  const onDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = { x: e.clientX, from: stop }
      e.currentTarget.setPointerCapture(e.pointerId)
      setTouched(true)
    },
    [stop],
  )

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragging.current
    if (!d) return
    setStop(clamp(d.from + Math.round((e.clientX - d.x) / 17)))
  }, [])

  const onUp = useCallback(() => {
    dragging.current = null
  }, [])

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = stop
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = stop - 1
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = stop + 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = STOPS.length - 1
    else return
    e.preventDefault()
    setStop(clamp(next))
    setTouched(true)
  }

  return (
    <section className="cover" aria-labelledby="cover-title">
      <header className="cover-bar pad">
        <span className="mono-sm">TYPELIN ARENA</span>
        <span className="mono-sm cover-bar-mid">自我介紹 ／ 試印本</span>
        <span className="mono-sm">DUOTONE · 2 INKS</span>
      </header>

      <div className="cover-stage">
        <div className="cover-copy">
          <p className="cover-eyebrow mono-sm">DEEPSEEK-AI ｜ 2026 · 09 · 10</p>
          <h1 id="cover-title" className="cover-title">
            <span className="ct-l1">DeepSeek</span>
            <span className="ct-l2">
              <span className="ct-v">V4.1</span>
              <em className="ct-flash">Flash</em>
            </span>
          </h1>
          <p className="cover-zh">兩塊墨版，<br />把世界壓成點。</p>
          <p className="cover-lede">{COVER.lede}</p>
          <div className="cover-fnum">
            <span className="cfn-k mono-sm">光圈</span>
            <span className="cfn-v">
              <i>f/</i>
              <b>{fLabel(fNo)}</b>
            </span>
            <span className="cfn-range mono-sm">1.4 — 22</span>
          </div>
          <p className={`cover-drag${touched ? ' is-gone' : ''}`}>
            <span className="drag-dot" aria-hidden="true" />
            <span className="mono-sm">拖動光圈</span>
          </p>
        </div>

        <div
          className={`lens${touched ? ' is-touched' : ''}`}
          role="slider"
          tabIndex={0}
          aria-label="光圈值，左右拖動或按方向鍵"
          aria-valuemin={1.4}
          aria-valuemax={22}
          aria-valuenow={Number(fNo.toFixed(1))}
          aria-valuetext={`f/${fLabel(fNo)}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
        >
          <canvas ref={ref} className="lens-canvas" aria-hidden="true" />
        </div>
      </div>

      <footer className="cover-foot pad">
        <ul className="cover-marks mono-sm">
          {COVER.marks.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <div className="cover-meta mono-sm">
          <span>{MODEL.makerZh}</span>
          <span className="dot-sep" />
          <span>{MODEL.date}</span>
        </div>
        <div className="scroll-cue mono-sm">
          <span>向下</span>
          <i aria-hidden="true" />
        </div>
      </footer>
    </section>
  )
}
