import { $, Spring, clamp, fitCanvas, isReduced, onFrame, onResize } from '../lib/util'

const SLICES = 14

export function initHero() {
  const hero = $('#top')
  const box = $('#heroWordBox')
  const word = $('#heroWord')
  const slicesEl = $('#heroSlices')
  const bg = $<HTMLCanvasElement>('#heroBg')
  const hint = $('#heroHint')

  let lines: string[] = ['Sonnet']
  let fs = 200
  let narrow = false

  const springs: Spring[] = []
  const delays: number[] = []
  const sliceEls: HTMLElement[] = []
  for (let i = 0; i < SLICES; i++) {
    const k = 70 + ((i * 37) % 14) * 7
    springs.push(new Spring(k, 2 * Math.sqrt(k) * 0.34, 0))
    delays.push(i * 0.05)
  }

  function markup(ls: string[]) {
    return ls.map((l) => `<span class="ln">${l}</span>`).join('')
  }

  function build() {
    narrow = window.innerHeight / window.innerWidth > 1.0
    lines = narrow ? ['Son', 'net'] : ['Sonnet']
    word.innerHTML = markup(lines)
    slicesEl.innerHTML = ''
    sliceEls.length = 0
    for (let i = 0; i < SLICES; i++) {
      const s = document.createElement('span')
      s.className = 'hero-slice'
      s.innerHTML = markup(lines)
      const a = (i / SLICES) * 100
      const b = (1 - (i + 1) / SLICES) * 100
      const top = i === 0 ? '-30%' : `${a}%`
      const bot = i === SLICES - 1 ? '-30%' : `calc(${b}% - 0.6px)`
      s.style.clipPath = `inset(${top} -20% ${bot} -20%)`
      slicesEl.appendChild(s)
      sliceEls.push(s)
    }
    fit()
  }

  function fit() {
    const stage = hero.querySelector<HTMLElement>('.hero-stage')!
    const cs = getComputedStyle(stage)
    const avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    const probe = document.createElement('span')
    probe.className = 'hero-word'
    probe.style.cssText = 'position:absolute;visibility:hidden;--hs:100px;font-size:100px;padding:0'
    probe.innerHTML = lines.map((l) => `<span style="display:inline-block">${l}</span>`).join('<br>')
    box.appendChild(probe)
    let w = 0
    probe.querySelectorAll('span').forEach((s) => {
      w = Math.max(w, (s as HTMLElement).getBoundingClientRect().width)
    })
    probe.remove()
    const target = narrow ? avail : Math.min(avail, stage.clientHeight * 1.55)
    fs = Math.min((target / (w || 300)) * 100, stage.clientHeight * (narrow ? 0.34 : 0.62))
    hero.style.setProperty('--hs', fs + 'px')
    drawLines()
  }

  function drawLines() {
    const { w, h, dpr } = fitCanvas(bg, 1.5)
    const g = bg.getContext('2d')!
    g.clearRect(0, 0, w, h)
    const hr = hero.getBoundingClientRect()
    const br = box.getBoundingClientRect()
    const y0 = (br.top - hr.top) * dpr
    const bh = br.height * dpr
    g.lineWidth = Math.max(1, dpr)
    for (let i = 0; i <= SLICES; i++) {
      const y = Math.round(y0 + (bh * i) / SLICES) + 0.5
      const edge = i === 0 || i === SLICES
      g.strokeStyle = edge ? 'rgba(60,14,4,0.5)' : 'rgba(60,14,4,0.2)'
      g.beginPath()
      g.moveTo(0, y)
      g.lineTo(w, y)
      g.stroke()
    }
    if (narrow) return
    g.fillStyle = 'rgba(60,14,4,0.55)'
    g.font = `500 ${Math.round(10 * dpr)}px "Plex Mono", monospace`
    g.textBaseline = 'bottom'
    for (let i = 0; i < SLICES; i++) {
      const y = y0 + (bh * (i + 1)) / SLICES - 3 * dpr
      g.fillText(String(i + 1).padStart(2, '0'), 14 * dpr, y)
    }
  }

  build()
  onResize(build)
  document.fonts.ready.then(() => fit())

  /* pointer light */
  let mx = 0.5
  let my = 0.4
  let tx = 0.5
  let ty = 0.4
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect()
    tx = (e.clientX - r.left) / r.width
    ty = (e.clientY - r.top) / r.height
  })

  /* drag */
  let dragging = false
  let grab = 7
  let startX = 0
  let dragX = 0
  let touched = false
  box.addEventListener('pointerdown', (e) => {
    const r = box.getBoundingClientRect()
    grab = clamp(Math.floor(((e.clientY - r.top) / r.height) * SLICES), 0, SLICES - 1)
    startX = e.clientX
    dragging = true
    box.classList.add('drag')
    box.setPointerCapture(e.pointerId)
    if (!touched) {
      touched = true
      hint.classList.add('gone')
    }
  })
  box.addEventListener('pointermove', (e) => {
    if (dragging) dragX = e.clientX - startX
  })
  const release = () => {
    dragging = false
    dragX = 0
    box.classList.remove('drag')
  }
  box.addEventListener('pointerup', release)
  box.addEventListener('pointercancel', release)

  /* intro: every line slides in from its own side */
  const reduced = isReduced()
  let introT = reduced ? 99 : 0
  const startOff = (i: number) => (i % 2 ? 1 : -1) * (window.innerWidth * (0.55 + (i % 5) * 0.12))
  if (!reduced) springs.forEach((s, i) => (s.x = startOff(i)))

  let visible = true
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting
  }).observe(hero)

  onFrame((_t, dt) => {
    if (!visible) return
    introT += dt
    mx += (tx - mx) * Math.min(1, dt * 3)
    my += (ty - my) * Math.min(1, dt * 3)
    hero.style.setProperty('--mx', (mx * 100).toFixed(1) + '%')
    hero.style.setProperty('--my', (my * 100).toFixed(1) + '%')

    const hr = hero.getBoundingClientRect()
    const out = clamp(-hr.top / (window.innerHeight * 0.85))
    const vw = window.innerWidth

    for (let i = 0; i < SLICES; i++) {
      const sp = springs[i]
      let target = 0
      if (introT < delays[i]) {
        sp.x = startOff(i)
        sp.v = 0
        sliceEls[i].style.transform = `translate3d(${sp.x.toFixed(1)}px,0,0)`
        continue
      }
      if (dragging) {
        const fall = Math.exp(-Math.abs(i - grab) / 3.2)
        target += dragX * fall * (reduced ? 0.4 : 1)
      }
      target += (i % 2 ? 1 : -1) * out * out * vw * (0.35 + (i / SLICES) * 0.9)
      const x = reduced && !dragging && out === 0 ? 0 : sp.step(target, dt)
      sliceEls[i].style.transform = `translate3d(${x.toFixed(2)}px,0,0)`
    }
  })
}
