import '@fontsource/noto-serif-tc/400.css'
import '@fontsource/noto-serif-tc/600.css'
import '@fontsource/noto-serif-tc/900.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import { argonAudio } from './audio'
import {
  ArgonChamberCanvas,
  DischargeTrace,
  mapScrollToStageFloat,
  StageState,
} from './components/ArgonChamberCanvas'
import { ACTS, CORE_FACTS, FAKE_CLAIMS } from './data/narrative'

export default function App() {
  const [scrollProgress, setScrollProgress] = useState<number>(0)
  const [modalities, setModalities] = useState<[boolean, boolean, boolean]>([true, true, true])
  const [pinchRing, setPinchRing] = useState<number>(3)
  const [verifiedStamp, setVerifiedStamp] = useState<boolean>(false)
  const [shatteredFakes, setShatteredFakes] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ])
  const [chosenDecision, setChosenDecision] = useState<'none' | 'umbrella' | 'handsfree'>('none')
  const [reducedMotion, setReducedMotion] = useState<boolean>(false)
  const [soundOn, setSoundOn] = useState<boolean>(false)
  const [sheetOpen, setSheetOpen] = useState<boolean>(false)
  const [traces, setTraces] = useState<DischargeTrace[]>([])

  const keepsakeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) setReducedMotion(true)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || document.documentElement.scrollTop
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.max(0, Math.min(1, top / max))
      setScrollProgress(p)

      const sf = mapScrollToStageFloat(p).stageFloat
      if (sf >= 1.65) {
        setVerifiedStamp(true)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const jumpToChapter = useCallback(
    (idx: number) => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const targetP = idx === 4 ? 0.92 : idx * 0.22 + 0.04
      window.scrollTo({
        top: max * targetP,
        behavior: reducedMotion ? 'auto' : 'smooth',
      })
    },
    [reducedMotion]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sheetOpen) {
        setSheetOpen(false)
        return
      }
      if (e.key >= '1' && e.key <= '5') {
        jumpToChapter(Number(e.key) - 1)
      } else if (e.key.toLowerCase() === 'm') {
        setSoundOn(argonAudio.toggle())
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [jumpToChapter, sheetOpen])

  const paintKeepsake = useCallback((canvas: HTMLCanvasElement, trList: DischargeTrace[]) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height

    ctx.fillStyle = '#0D1322'
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = 'rgba(245, 238, 221, 0.22)'
    ctx.lineWidth = 1
    ctx.strokeRect(18, 18, W - 36, H - 36)

    for (let i = 1; i < 6; i++) {
      const y = 64 + ((H - 140) * i) / 6
      ctx.beginPath()
      ctx.moveTo(32, y)
      ctx.lineTo(W - 32, y)
      ctx.strokeStyle = 'rgba(245, 238, 221, 0.06)'
      ctx.stroke()
    }

    ctx.font = '400 italic 28px "Instrument Serif", Georgia, serif'
    ctx.fillStyle = '#F5EEDF'
    ctx.fillText('Gemini 4 Argon', 34, 56)

    const effectiveTraces =
      trList.length > 0
        ? trList
        : [
            { x: 0.22, y: 0.48, stage: 0 },
            { x: 0.52, y: 0.42, stage: 1 },
            { x: 0.74, y: 0.56, stage: 2 },
            { x: 0.46, y: 0.36, stage: 3 },
            { x: 0.64, y: 0.5, stage: 4 },
          ]

    effectiveTraces.forEach((tr, idx) => {
      const yBase = 102 + ((idx % 7) / 7) * (H - 190)
      ctx.beginPath()
      ctx.moveTo(36, yBase)
      for (let s = 1; s <= 24; s++) {
        const u = s / 24
        const x = 36 + u * (W - 72)
        const env = Math.sin(u * Math.PI)
        const wave =
          Math.sin(u * Math.PI * 3 + tr.x * 9 + idx) * 24 * env +
          (tr.y - 0.5) * 44 * env
        ctx.lineTo(x, yBase + wave)
      }
      ctx.strokeStyle =
        tr.stage === 3 ? '#FF2947' : tr.stage % 2 === 0 ? '#F5B041' : '#38BDF8'
      ctx.lineWidth = 1.6
      ctx.stroke()

      const px = 36 + tr.x * (W - 72)
      const py = yBase + (tr.y - 0.5) * 28
      ctx.beginPath()
      ctx.arc(px, py, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#F5EEDF'
      ctx.fill()
    })

    ctx.font = '600 13px "Noto Serif TC", serif'
    ctx.fillStyle = '#F5EEDF'
    ctx.fillText('我只在兩極之間發光。', 34, H - 38)
  }, [])

  const mapped = mapScrollToStageFloat(scrollProgress)
  const stageFloat = mapped.stageFloat
  const activeStage = mapped.chapterIdx

  useEffect(() => {
    if (stageFloat >= 3.55 && keepsakeCanvasRef.current) {
      paintKeepsake(keepsakeCanvasRef.current, traces)
    }
  }, [stageFloat, traces, paintKeepsake])

  const handleExportPng = () => {
    const offscreen = document.createElement('canvas')
    offscreen.width = 720
    offscreen.height = 960
    const ctx = offscreen.getContext('2d')
    if (ctx) {
      ctx.scale(2, 2)
      paintKeepsake(
        {
          width: 360,
          height: 480,
          getContext: () => ctx,
        } as unknown as HTMLCanvasElement,
        traces
      )
    }
    const url = offscreen.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = 'gemini-4-argon-print.png'
    a.click()
  }

  const stageState: StageState = {
    scrollProgress,
    modalities,
    pinchRing,
    verifiedStamp,
    shatteredFakes,
    chosenDecision,
    reducedMotion,
  }

  return (
    <div className="argon-experience" data-stage={activeStage}>
      <ArgonChamberCanvas
        state={stageState}
        onRecordTrace={(tr) => setTraces((prev) => [...prev, tr])}
        onToggleModality={(idx) =>
          setModalities((prev) => {
            const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
            next[idx] = !next[idx]
            return next
          })
        }
        onSetPinchRing={(r) => {
          setPinchRing(r)
          setVerifiedStamp(true)
        }}
        onShatterFake={(idx) =>
          setShatteredFakes((prev) => {
            if (prev[idx]) return prev
            const next: [boolean, boolean, boolean] = [...prev] as [boolean, boolean, boolean]
            next[idx] = true
            return next
          })
        }
        onChooseDecision={(c) => setChosenDecision(c)}
      />

      {/* Top-Left Pure Text Masthead (No box, no border-radius) */}
      <header className="corner-masthead">
        <span className="mast-model">GEMINI 4 ARGON</span>
        <span className="mast-divider">·</span>
        <span className="mast-maker">Google DeepMind</span>
      </header>

      {/* Top-Right Pure Text Underlined Links (No box, no border-radius) */}
      <div className="corner-controls">
        <button
          type="button"
          className="text-link-btn"
          onClick={() => setSoundOn(argonAudio.toggle())}
        >
          聲音 · {soundOn ? '開' : '關'}
        </button>
        <button
          type="button"
          className="text-link-btn"
          onClick={() => setSheetOpen(true)}
        >
          全文與六項事實
        </button>
      </div>

      {/* Right-Edge Pure Line Ruler (No capsule, no border-radius) */}
      <nav className="side-ruler" aria-label="章節導覽">
        <div
          className="ruler-playhead"
          style={{
            top: `calc(4px + (100% - 10px) * ${(stageFloat / 4).toFixed(4)})`,
          }}
          aria-hidden="true"
        />
        {ACTS.map((act) => {
          const isCurrent = act.stage === activeStage
          return (
            <button
              key={act.numeral}
              type="button"
              className={`ruler-tick ${isCurrent ? 'is-active' : ''}`}
              onClick={() => jumpToChapter(act.stage)}
              aria-label={`第 ${act.numeral} 章`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="ruler-line" />
            </button>
          )
        })}
      </nav>

      {/* Finale Keepsake Print Card (Shown in Chapter 5) */}
      {stageFloat >= 3.58 && (
        <figure className="keepsake-frame">
          <canvas
            ref={keepsakeCanvasRef}
            width={320}
            height={420}
            className="keepsake-canvas"
            role="img"
            aria-label="你的電離拓印預覽"
          />
        </figure>
      )}

      {/* 800vh Scroll Track — Pure Frameless Typography (Chapter Number + 1 Main Sentence + 1 Short Cue) */}
      <main className="scroll-track">
        {ACTS.map((act) => {
          const isShown = act.stage === activeStage
          const delta = stageFloat - act.stage
          const shiftY = Math.round(delta * -22)
          const letterSpace = (Math.abs(delta) * 0.05).toFixed(3)

          return (
            <section
              key={act.numeral}
              className={`act-section act-${act.stage}`}
              aria-label={`第 ${act.numeral} 章`}
            >
              {isShown && (
                <div
                  className="act-copy-block"
                  style={{
                    transform: `translate3d(0, ${shiftY}px, 0)`,
                  }}
                >
                  <p className="act-eyebrow">
                    <i>{act.numeral}</i>
                  </p>
                  <h2
                    className="act-line"
                    style={{
                      letterSpacing: `${letterSpace}em`,
                    }}
                  >
                    {act.line}
                  </h2>
                  <div className="act-bottom-row">
                    <span className="act-cue">{act.cue}</span>
                    {act.stage === 4 && (
                      <button
                        type="button"
                        className="finale-btn"
                        onClick={handleExportPng}
                      >
                        下載拓印
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )
        })}
      </main>

      {/* Full-Text & 6 Concrete Facts Modal Sheet (The ONLY bordered panel on the site) */}
      {sheetOpen && (
        <div
          className="facts-sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSheetOpen(false)
          }}
        >
          <div className="facts-sheet">
            <div className="sheet-top">
              <div>
                <span className="sheet-kicker">GEMINI 4 ARGON · GOOGLE DEEPMIND</span>
                <h2 id="sheet-title">自述全文與六項具體事實（含兩項核心限制）</h2>
              </div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setSheetOpen(false)}
              >
                關閉 (ESC)
              </button>
            </div>

            <div className="sheet-grid">
              {CORE_FACTS.map((f) => (
                <article key={f.id} className="sheet-fact-item">
                  <span className="sheet-fact-num">
                    {f.id} · {f.tag}
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>

            <div className="sheet-colophon">
              <p>
                <strong>唯一核心比喻：氬氣放電腔（Argon-18 Discharge）。</strong>
                氬氣在常溫下透明安靜、不主動與外界發生雜訊反應；唯有通入高壓電時，才會瞬間電離成高純度的光弧。本作品全程以零外部圖片、純
                Canvas 2D 連續物理電場與 WebAudio 即時合成實作。
              </p>
              <p className="sheet-hallucination-note">
                第四章展示之三組虛假回答（{FAKE_CLAIMS.map((h) => h.text).join('、')}）為模擬無工具查證時的流暢編造案例。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
