import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react'
import { EFFORT_LEVELS } from './content'
import { effortStore } from './effort'
import type { Engine } from './scene'

type Props = { engine: React.RefObject<Engine | null> }

export default function EffortDial({ engine }: Props) {
  const level = useSyncExternalStore(effortStore.subscribe, effortStore.get)
  const setLevel = effortStore.set
  const [refused, setRefused] = useState(false)

  useEffect(() => effortStore.subscribe(() => engine.current?.setEffort(effortStore.get())), [engine])
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = useCallback(
    (i: number) => {
      const v = Math.max(0, Math.min(EFFORT_LEVELS.length - 1, i))
      setLevel(v)
      engine.current?.setEffort(v)
    },
    [engine, setLevel],
  )

  const fromX = (clientX: number) => {
    const el = track.current
    if (!el) return 0
    const b = el.getBoundingClientRect()
    return ((clientX - b.left) / Math.max(1, b.width)) * (EFFORT_LEVELS.length - 1)
  }

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const v = fromX(e.clientX)
    engine.current?.dragEffort(v)
    setLevel(Math.round(Math.max(0, Math.min(4, v))))
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const v = fromX(e.clientX)
    engine.current?.dragEffort(v)
    setLevel(Math.round(Math.max(0, Math.min(4, v))))
  }

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    engine.current?.dragEffort(null)
    choose(Math.round(fromX(e.clientX)))
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }
    if (e.key in map) {
      e.preventDefault()
      choose(level + map[e.key])
    } else if (e.key === 'Home') {
      e.preventDefault()
      choose(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      choose(EFFORT_LEVELS.length - 1)
    }
  }

  const tryOff = () => {
    engine.current?.tryOff()
    setRefused(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setRefused(false), 3200)
  }

  const cur = EFFORT_LEVELS[level]

  return (
    <div className="dial" data-hook="dial">
      <div
        className="dial-track"
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="effort 等級"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={level}
        aria-valuetext={cur.id}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <div className="dial-rail" />
        <div className="dial-fill" />
        {EFFORT_LEVELS.map((l, i) => (
          <span key={l.id} className="dial-stop" style={{ left: `${(i / 4) * 100}%` }} data-on={i <= level ? '' : undefined} />
        ))}
        <div className="dial-knob" />
      </div>
      <div className="dial-labels">
        {EFFORT_LEVELS.map((l, i) => (
          <button key={l.id} type="button" className="dial-label" aria-pressed={i === level} onClick={() => choose(i)} tabIndex={-1}>
            {l.id}
          </button>
        ))}
      </div>
      <p className="dial-note" aria-live="polite">
        <strong>{cur.id}</strong>
        <span>
          {cur.note}
          <span className="dial-aa">
            AA 智慧指數 {cur.aa} 分 · 每題 {cur.cost.toFixed(2)} 美元
          </span>
        </span>
      </p>
      <div className="dial-off">
        <button type="button" className="off-btn" onClick={tryOff}>
          試著關掉思考
        </button>
        <p className="off-msg" data-show={refused ? '' : undefined} aria-live="assertive">
          <code>400 invalid_request_error</code>
          <span>這個模型不支援關閉思考。</span>
        </p>
      </div>
    </div>
  )
}
