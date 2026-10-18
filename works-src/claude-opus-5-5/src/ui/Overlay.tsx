import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { CHAPTERS } from '../content'
import { T0, TMAX } from '../engine/consts'
import type { Engine } from '../engine/engine'
import { clamp, easeOut, ramp } from '../engine/math'
import type { Snapshot, Token } from '../engine/types'
import { Ending } from './Ending'
import { ReadDialog as ReadDialogRaw } from './ReadDialog'

// A closed dialog never needs to re-render with the scroll.
const ReadDialog = memo(ReadDialogRaw, (a, b) => a.open === b.open && !b.open && a.onClose === b.onClose)

export function Overlay({ engine }: { engine: Engine }) {
  const s = useSyncExternalStore(engine.subscribe, engine.getSnapshot)
  const [reading, setReading] = useState(false)
  const finale = s.done
  // Stable callbacks so memoised children do not re-render on every scroll frame.
  const onRead = useCallback(() => setReading(true), [])
  const onClose = useCallback(() => setReading(false), [])
  const sound = s.sound
  const onSound = useCallback(() => engine.setSound(!sound), [engine, sound])

  return (
    <div className="overlay" data-finale={finale || undefined}>
      <div className="fade fade-top" aria-hidden="true" />
      <div className="fade fade-bottom" aria-hidden="true" />
      <div className="tone" data-chapter={s.finaleU > 0 ? 6 : s.chapter} aria-hidden="true" />
      <HeatGlow engine={engine} />
      {!s.ready && <Loading />}

      <header className="mast">
        <span className="mast-mark" aria-hidden="true">
          三角洲
        </span>
        <span className="mast-who">Claude Opus 5.5 · 自述</span>
      </header>

      <ChapterMark chapter={s.chapter} />
      {s.ready && <Hero h={s.hero} sound={s.sound} pending={s.soundPending} onSound={onSound} engine={engine} />}
      {s.titleChapter >= 1 && <TitleCard c={s.titleChapter} engine={engine} />}
      {s.ready && s.hero > 0.6 && s.finaleU === 0 && (
        // hidden (not unmounted) under a title card, so it is not laid out again afterwards
        <Transcript tokens={s.transcript} chapter={s.transcriptChapter} hidden={s.titleChapter >= 1 && s.titleU > 0.03 && s.titleU < 0.97} />
      )}
      {!finale && <Instruments s={s} engine={engine} onRead={onRead} />}
      {s.hover && <Tooltip h={s.hover} />}
      {s.ready && <Ending engine={engine} s={s} shown={finale} />}
      {s.ready && <Warmer />}
      <ReadDialog open={reading} onClose={onClose} engine={engine} s={s} />

      <button className="skip" onClick={onRead}>
        閱讀純文字版本
      </button>
      <div className="sr-only" aria-live="polite">
        {s.announce}
      </div>
    </div>
  )
}

/**
 * For the first moments after load, every chapter title is laid out and painted, invisibly, where
 * it will later appear. The first real title card then finds its glyphs (168px numerals, 600-weight
 * titles) already shaped and rasterised instead of paying for them mid-transition.
 */
function Warmer() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setOn(false), 1500)
    return () => window.clearTimeout(t)
  }, [])
  if (!on) return null
  return (
    <div className="warmer" aria-hidden="true">
      {CHAPTERS.slice(1).map((def, i) => (
        <section key={def.title} className="title-card" data-key={i + 1 === 4 || undefined}>
          <p className="tc-kicker">
            § {def.numeral} — {def.en}
          </p>
          <p className="tc-num">{def.numeral}</p>
          <h2 className="tc-title">
            {def.title}
            <small>{def.gloss}</small>
          </h2>
          <p className="tc-lede">{def.lede}</p>
        </section>
      ))}
    </div>
  )
}

function Loading() {
  return (
    <div className="loading" role="status">
      <span className="loading-line" aria-hidden="true" />
      <span>研墨中</span>
    </div>
  )
}

/* The heat glow follows the fork every frame — styled directly, outside React. */
function HeatGlow({ engine }: { engine: Engine }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(
    () =>
      engine.onFrame((f) => {
        const el = ref.current
        if (!el) return
        el.style.setProperty('--heat', f.heat.toFixed(3))
        el.style.setProperty('--fx', `${(f.forkX * 100).toFixed(1)}%`)
        el.style.setProperty('--fy', `${(f.forkY * 100).toFixed(1)}%`)
      }),
    [engine],
  )
  return <div className="heat" ref={ref} aria-hidden="true" />
}

/* The opening inscription. It is blotted away, character by character, as the river starts. */
const Hero = memo(function Hero({
  h,
  sound,
  pending,
  onSound,
  engine,
}: {
  h: number
  sound: boolean
  pending: boolean
  onSound: () => void
  engine: Engine
}) {
  const chars = ['三', '角', '洲']
  const spans = useRef<(HTMLSpanElement | null)[]>([])
  const sub = useRef<HTMLParagraphElement>(null)
  const legend = useRef<HTMLDListElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const gone = h >= 1
  // The blot follows the scroll every frame; React only decides whether the hero exists.
  useEffect(() => {
    if (gone) return
    return engine.onFrame((f) => {
      const hh = f.hero
      spans.current.forEach((el, i) => {
        if (el) el.style.clipPath = `inset(${(clamp(hh * 1.7 - i * 0.28) * 100).toFixed(1)}% 0 0 0)`
      })
      if (sub.current) sub.current.style.clipPath = `inset(0 0 ${(clamp(hh * 2) * 100).toFixed(1)}% 0)`
      const side = `inset(0 ${(clamp(hh * 1.8) * 100).toFixed(1)}% 0 0)`
      if (legend.current) legend.current.style.clipPath = side
      if (btn.current) btn.current.style.clipPath = side
    })
  }, [engine, gone])
  if (gone) return null
  return (
    <div className="hero" aria-hidden={h > 0.5}>
      <h1 className="hero-title" aria-label="三角洲">
        {chars.map((c, i) => (
          <span
            key={c}
            ref={(el) => {
              spans.current[i] = el
            }}
          >
            {c}
          </span>
        ))}
      </h1>
      <p className="hero-sub" ref={sub}>
        DELTA · A SELF-PORTRAIT
      </p>
      <dl className="legend" ref={legend}>
        <div>
          <dt>捲動</dt>
          <dd>河往前流；往回捲，它會倒流</dd>
        </div>
        <div>
          <dt className="fine">指向／點選</dt>
          <dd>讓河往那個詞轉彎</dd>
        </div>
        <div>
          <dt>按住</dt>
          <dd>升溫：讓不太可能的詞浮上來</dd>
        </div>
      </dl>
      <button
        ref={btn}
        className="hero-sound"
        aria-pressed={sound}
        data-pending={pending || undefined}
        onClick={pending ? undefined : onSound}
        tabIndex={h > 0.5 ? -1 : 0}
      >
        <span className="hs-wave" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        {pending ? '點一下畫面，聲音就會開始（建議戴耳機）' : sound ? '聲音開啟中 — 點此關閉' : '聲音已關閉 — 點此開啟'}
      </button>
    </div>
  )
})

const ChapterMark = memo(function ChapterMark({ chapter }: { chapter: number }) {
  const s = { chapter }
  const c = CHAPTERS[chapter]
  return (
    <nav className="chapter-mark" aria-label="章節">
      <div className="cm-now">
        <span className="cm-num">{c.numeral}</span>
        <span className="cm-title">{c.title}</span>
        <span className="cm-gloss">{c.gloss}</span>
      </div>
      <ol className="cm-track">
        {CHAPTERS.map((d, i) => (
          <li key={d.title} data-state={i < s.chapter ? 'past' : i === s.chapter ? 'now' : 'next'} title={`${d.numeral} ${d.title}`}>
            <span className="sr-only">
              {d.numeral} {d.title}
              {i === s.chapter ? '（目前）' : ''}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
})

/* Chapter titles are scrubbed by scroll: wiped in like a brush stroke, wiped out the same way. */
const TitleCard = memo(function TitleCard({ c, engine }: { c: number; engine: Engine }) {
  const def = CHAPTERS[c]
  const lines = useRef<(HTMLElement | null)[]>([])
  // Scrubbed by scroll every frame, written straight to the DOM.
  useEffect(
    () =>
      engine.onFrame((f) => {
        if (f.titleChapter !== c) return
        const u = f.titleU
        lines.current.forEach((el, j) => {
          if (!el) return
          const inK = easeOut(ramp(u, 0.04 + j * 0.045, 0.26 + j * 0.045))
          const outK = easeOut(ramp(u, 0.76 + j * 0.02, 0.93 + j * 0.015))
          el.style.clipPath = `inset(-0.2em ${((1 - inK) * 100).toFixed(1)}% -0.2em ${(outK * 100).toFixed(1)}%)`
        })
      }),
    [engine, c],
  )
  const line = (j: number) => (el: HTMLElement | null) => {
    lines.current[j] = el
  }
  return (
    <section className="title-card" data-key={c === 4 || undefined} aria-label={`第${def.numeral}章 ${def.title}`}>
      <p className="tc-kicker" ref={line(0)}>
        § {def.numeral} — {def.en}
      </p>
      <p className="tc-num" ref={line(1)} aria-hidden="true">
        {def.numeral}
      </p>
      <h2 className="tc-title" ref={line(2)}>
        {def.title}
        <small>{def.gloss}</small>
      </h2>
      <p className="tc-lede" ref={line(3)}>
        {def.lede}
      </p>
    </section>
  )
})

function Words({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.invented ? 'w invented' : t.mine ? 'w mine' : 'w'}>
          {t.w}
        </span>
      ))}
    </>
  )
}

const Transcript = memo(function Transcript({ tokens, chapter, hidden }: { tokens: Token[]; chapter: number; hidden: boolean }) {
  const def = CHAPTERS[chapter]
  const invented = tokens.some((t) => t.invented)
  return (
    <section className="transcript" data-hidden={hidden || undefined} aria-label="正在寫的句子">
      <p className="tr-label">
        § {def.numeral} {def.title} — 正在寫的句子
      </p>
      <p className="tr-text">
        <Words tokens={tokens} />
      </p>
      {invented && <p className="tr-note">※ 有一個詞是我編的。溫度太高時，我會說出聽起來合理、但不真實的話——所以我把它標了出來。</p>}
    </section>
  )
})

type InstrumentsProps = { s: Snapshot; engine: Engine; onRead: () => void }
const sameInstruments = (a: InstrumentsProps, b: InstrumentsProps) =>
  a.engine === b.engine &&
  a.onRead === b.onRead &&
  a.s.T === b.s.T &&
  a.s.heat === b.s.heat &&
  a.s.keyboard === b.s.keyboard &&
  a.s.revealInfluence === b.s.revealInfluence &&
  a.s.influence === b.s.influence &&
  a.s.invented === b.s.invented &&
  a.s.sound === b.s.sound &&
  a.s.soundPending === b.s.soundPending

const Instruments = memo(function Instruments({ s, engine, onRead }: InstrumentsProps) {
  const heatBtn = useRef<HTMLButtonElement>(null)
  const pos = clamp((s.T - 0.4) / (TMAX + 0.1 - 0.4))
  const invent = clamp((1.45 - 0.4) / (TMAX + 0.1 - 0.4))
  const base = clamp((T0 - 0.4) / (TMAX + 0.1 - 0.4))

  useEffect(() => {
    const b = heatBtn.current
    if (!b) return
    const down = (e: PointerEvent) => {
      e.preventDefault()
      b.setPointerCapture(e.pointerId)
      engine.setHeating(true)
    }
    const up = () => engine.setHeating(false)
    const kd = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        engine.setHeating(true)
      }
    }
    const ku = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') engine.setHeating(false)
    }
    b.addEventListener('pointerdown', down)
    b.addEventListener('pointerup', up)
    b.addEventListener('pointercancel', up)
    b.addEventListener('lostpointercapture', up)
    b.addEventListener('keydown', kd)
    b.addEventListener('keyup', ku)
    b.addEventListener('blur', up)
    b.addEventListener('contextmenu', (e) => e.preventDefault())
    return () => {
      b.removeEventListener('pointerdown', down)
      b.removeEventListener('pointerup', up)
      b.removeEventListener('pointercancel', up)
      b.removeEventListener('lostpointercapture', up)
      b.removeEventListener('keydown', kd)
      b.removeEventListener('keyup', ku)
      b.removeEventListener('blur', up)
    }
  }, [engine])

  return (
    <aside className="instruments" aria-label="儀表">
      <button
        ref={heatBtn}
        className="press"
        data-on={s.heat > 0.03 || undefined}
        style={{ '--fill': s.heat } as CSSProperties}
        aria-label="按住以升溫"
      >
        <span className="press-fill" aria-hidden="true" />
        <span className="press-char" aria-hidden="true">
          熱
        </span>
      </button>
      <div className="readout">
        <div className="scale" data-hot={s.T > 1.45 || undefined}>
          <span className="sc-head">
            <span>溫度</span>
            <span className="sc-val">T {s.T.toFixed(2)}</span>
          </span>
          <span className="sc-rule" aria-hidden="true">
            <span className="sc-zone" style={{ left: `${invent * 100}%` }} />
            <span className="sc-base" style={{ left: `${base * 100}%` }} />
            <span className="sc-needle" style={{ left: `${pos * 100}%` }} />
          </span>
          <span className="sc-legend" aria-hidden="true">
            <span style={{ left: `${base * 100}%` }}>平常</span>
            <span style={{ left: `${invent * 100}%` }}>編造區</span>
          </span>
        </div>
        <p className="counts">
          你改變的詞 <b className={s.revealInfluence ? 'mine' : 'unknown'}>{s.revealInfluence ? s.influence : '？'}</b>
          <span className="dot">·</span>編造 <b>{s.invented}</b>
        </p>
        <p className="links">
          <button className="link" aria-pressed={s.sound} onClick={() => !s.soundPending && engine.setSound(!s.sound)}>
            聲音：{s.soundPending ? '等待點擊' : s.sound ? '開' : '關'}
          </button>
          <button className="link" onClick={onRead}>
            全文與說明
          </button>
        </p>
        <p className="kbd-hint">{s.keyboard ? '1–9 選詞 · → 前進 · ← 倒流 · 按住 Space 升溫' : '按住「熱」或空白鍵升溫'}</p>
      </div>
    </aside>
  )
}, sameInstruments)

function Tooltip({ h }: { h: NonNullable<Snapshot['hover']> }) {
  const left = Math.min(Math.max(h.x, 16), window.innerWidth - 300)
  return (
    <div className="tooltip" style={{ left, top: Math.max(h.y - 10, 90) }} role="tooltip">
      <p className="tt-kicker">
        沒走的岔路 · p {h.invented ? '?' : h.p.toFixed(2)}
      </p>
      <p className="tt-text">
        {h.prefix}
        <b>{h.word}</b>……
      </p>
      <p className="tt-note">{h.invented ? '這條路是溫度太高時冒出來的，它不是真的。' : '這句話差一點就是這樣。'}</p>
    </div>
  )
}

export { Words }
