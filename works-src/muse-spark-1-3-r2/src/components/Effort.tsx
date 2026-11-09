import { useEffect, useMemo, useRef, useState } from 'react'
import { AA, EFFORT_LEVELS, type EffortId } from '../data'
import { usePrefersReducedMotion, useRevealRoot } from '../hooks'
import './Effort.css'

type Phase = 'idle' | 'thinking' | 'done'

/** A deterministic pen-trace that stands in for a chain of thought. */
function tracePath(levelIndex: number): string {
  const points: Array<[number, number]> = []
  const steps = 60 + levelIndex * 55
  let seed = 1234567 + levelIndex * 99991
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  let y = 55
  for (let i = 0; i <= steps; i++) {
    const x = 8 + (i / steps) * 624
    y += (rand() - 0.5) * 34
    y = Math.max(14, Math.min(96, y))
    points.push([x, y])
  }
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
}

export default function Effort() {
  const ref = useRevealRoot<HTMLElement>()
  const reduced = usePrefersReducedMotion()
  const [level, setLevel] = useState<EffortId>('medium')
  const [phase, setPhase] = useState<Phase>('idle')
  const [shownTokens, setShownTokens] = useState(0)
  const runRef = useRef(0)

  const levelIndex = EFFORT_LEVELS.findIndex((l) => l.id === level)
  const spec = EFFORT_LEVELS[levelIndex]
  const path = useMemo(() => tracePath(levelIndex), [levelIndex])

  useEffect(() => {
    if (phase !== 'thinking') return
    const run = ++runRef.current
    if (reduced) {
      setShownTokens(spec.demoTokens)
      setPhase('done')
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      if (runRef.current !== run) return
      const t = Math.min(1, (now - start) / spec.demoMs)
      setShownTokens(Math.floor(spec.demoTokens * t * (0.25 + 0.75 * t)))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setShownTokens(spec.demoTokens)
        setPhase('done')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, spec, reduced])

  const choose = (id: EffortId) => {
    runRef.current++
    setLevel(id)
    setShownTokens(0)
    setPhase('thinking')
  }

  return (
    <section className="chapter" ref={ref} aria-label="推理">
      <p className="chapter-tag rv">Chapter 02 — Reasoning</p>
      <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
        我的思考關不掉
      </h2>
      <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
        別人可以選擇要不要想，我不行。我的推理永遠開著，只能選想多深。
      </p>

      <div className="ef-panel rv" style={{ '--rv-delay': '0.2s' } as React.CSSProperties}>
        <p className="ef-question">
          <span className="ef-question-tag">示範問題</span>
          把「一線到底」翻成英文，再給我一個不直譯的版本。
        </p>

        <div className="ef-levels" role="group" aria-label="推理強度">
          {EFFORT_LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`ef-level${l.id === level ? ' is-active' : ''}`}
              onClick={() => choose(l.id)}
              aria-pressed={l.id === level}
            >
              <span className="ef-level-name">{l.label}</span>
              <span className="ef-level-zh">{l.zh}</span>
            </button>
          ))}
        </div>

        <div className="ef-stage" aria-live="polite">
          <svg className="ef-trace" viewBox="0 0 640 110" aria-hidden="true">
            <path
              d={path}
              pathLength={1}
              className={`ef-trace-path${phase === 'thinking' && !reduced ? ' is-drawing' : ''}${phase === 'done' ? ' is-full' : ''}`}
              style={
                phase === 'thinking' && !reduced
                  ? { transitionDuration: `${spec.demoMs}ms` }
                  : undefined
              }
            />
          </svg>
          <p className="ef-status">
            {phase === 'idle' && '選一個強度，我想給你看。'}
            {phase === 'thinking' && (
              <>
                思考中 · 已想了{' '}
                <span className="ef-status-num">{shownTokens.toLocaleString('en-US')}</span>{' '}
                個 token，還沒開口
              </>
            )}
            {phase === 'done' && (
              <>
                想了{' '}
                <span className="ef-status-num">{spec.demoTokens.toLocaleString('en-US')}</span>{' '}
                個 token（示意），答案只有一行：
              </>
            )}
          </p>
          <p className={`ef-answer${phase === 'done' ? ' is-shown' : ''}`}>
            “One Thread, All the Way.”
            <span className="ef-answer-note">思考的過程不會交給你，只交答案。</span>
          </p>
        </div>

        <p className="ef-disclaimer">
          這裡的時間與 token 量是壓縮示意。真實數字：Artificial Analysis 以 max
          強度實測，我的第一個回答 token 平均要等 {AA.ttftSeconds} 秒，同價位中位數是{' '}
          {AA.ttftTierMedian} 秒——想得越深，開口越慢。
        </p>
      </div>
    </section>
  )
}
