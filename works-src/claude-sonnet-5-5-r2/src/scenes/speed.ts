import { $, fitCanvas, isReduced, onFrame, onResize, rng, watchVisible, easeOut, clamp } from '../lib/util'

const TOTAL = 132
const RATE_A = 15
const RATE_B = RATE_A * 1.3

interface Lane {
  cv: HTMLCanvasElement
  rate: number
  hot: boolean
  state: HTMLElement
  doneLabel: string
  doneAt: number
}

export function initSpeed() {
  const race = $('#race')
  const again = $<HTMLButtonElement>('#raceAgain')
  const numEl = $('.speed-num')

  const r = rng(55)
  const widths: number[] = []
  for (let i = 0; i < TOTAL; i++) widths.push(0.5 + Math.pow(r(), 1.6) * 2.2)

  const lanes: Lane[] = [
    { cv: $<HTMLCanvasElement>('#raceA'), rate: RATE_A, hot: false, state: $('#stateA'), doneLabel: '完成', doneAt: 0 },
    { cv: $<HTMLCanvasElement>('#raceB'), rate: RATE_B, hot: true, state: $('#stateB'), doneLabel: '完成', doneAt: 0 },
  ]

  let clock = 0
  let running = false
  let started = false
  const reduced = isReduced()

  function layout(cv: HTMLCanvasElement) {
    const cssW = cv.getBoundingClientRect().width || 600
    const cssPad = 8
    const cssRow = cssW < 520 ? 13 : 20
    const cssGap = cssW < 520 ? 2.5 : 3.5
    const cssUnit = Math.max(7, cssW / 62)
    const pos: { x: number; y: number; w: number }[] = []
    let x = cssPad
    let y = cssPad
    for (let i = 0; i < TOTAL; i++) {
      const bw = widths[i] * cssUnit
      if (x + bw > cssW - cssPad) {
        x = cssPad
        y += cssRow + cssGap * 1.7
      }
      pos.push({ x, y, w: bw })
      x += bw + cssGap
    }
    cv.style.height = Math.ceil(y + cssRow + cssPad) + 'px'
    const { w, h, dpr } = fitCanvas(cv, 2)
    const rects = pos.map((p) => ({ x: p.x * dpr, y: p.y * dpr, w: p.w * dpr }))
    return { w, h, dpr, rowH: cssRow * dpr, rects, gap: cssGap * dpr }
  }

  const cache = new Map<HTMLCanvasElement, ReturnType<typeof layout>>()
  function relayout() {
    lanes.forEach((l) => cache.set(l.cv, layout(l.cv)))
    paint()
  }

  function paint() {
    for (const lane of lanes) {
      const L = cache.get(lane.cv)
      if (!L) continue
      const g = lane.cv.getContext('2d')!
      g.clearRect(0, 0, L.w, L.h)
      const n = reduced ? TOTAL : clamp(clock * lane.rate, 0, TOTAL)
      const whole = Math.floor(n)
      for (let i = 0; i < TOTAL; i++) {
        const rc = L.rects[i]
        if (i < whole) {
          const age = n - i
          const fresh = clamp(1 - age / 6)
          g.fillStyle = lane.hot ? `rgba(246,234,211,${0.82 + fresh * 0.18})` : `rgba(246,234,211,${0.34 + fresh * 0.3})`
          g.fillRect(rc.x, rc.y, rc.w, L.rowH)
          if (fresh > 0 && lane.hot) {
            g.fillStyle = `rgba(232,100,58,${fresh * 0.9})`
            g.fillRect(rc.x, rc.y + L.rowH - 3 * L.dpr, rc.w, 3 * L.dpr)
          }
        } else if (i === whole && n < TOTAL) {
          const frac = n - whole
          g.fillStyle = lane.hot ? '#e8643a' : 'rgba(246,234,211,0.7)'
          g.fillRect(rc.x, rc.y, rc.w * easeOut(frac), L.rowH)
          if (lane.hot) {
            g.shadowColor = '#e8643a'
            g.shadowBlur = 18 * L.dpr
            g.fillRect(rc.x, rc.y, Math.max(2 * L.dpr, rc.w * easeOut(frac)), L.rowH)
            g.shadowBlur = 0
          }
        } else {
          g.fillStyle = 'rgba(246,234,211,0.07)'
          g.fillRect(rc.x, rc.y, rc.w, L.rowH)
        }
      }
    }
  }

  function reset() {
    clock = 0
    lanes.forEach((l) => {
      l.doneAt = 0
      l.state.textContent = l.hot ? '快 30% 以上' : '基準'
      l.state.classList.remove('done')
    })
    race.classList.remove('finished')
    running = true
    again.disabled = true
  }

  onResize(relayout)
  relayout()
  document.fonts.ready.then(relayout)

  if (reduced) {
    lanes.forEach((l) => (l.state.textContent = l.hot ? '快 30% 以上' : '基準'))
    again.hidden = true
    return
  }

  watchVisible(race, (v) => {
    if (v && !started) {
      started = true
      reset()
    }
  }, '-18% 0px')

  again.addEventListener('click', reset)

  let kick = 0
  onFrame((_t, dt) => {
    if (!running) {
      kick *= 0.9
      numEl.style.setProperty('--kick', kick.toFixed(3))
      return
    }
    clock += dt
    let allDone = true
    for (const l of lanes) {
      if (clock * l.rate >= TOTAL) {
        if (!l.doneAt) {
          l.doneAt = clock
          l.state.textContent = `${l.doneLabel} · ${clock.toFixed(1)} 秒`
          l.state.classList.add('done')
          if (l.hot) kick = 1
        }
      } else allDone = false
    }
    numEl.style.setProperty('--kick', kick.toFixed(3))
    kick *= 0.94
    paint()
    if (allDone) {
      running = false
      race.classList.add('finished')
      again.disabled = false
    }
  })
}
