import { $, Spring, clamp, fitCanvas, isReduced, lerp, onFrame, onResize, rng, smooth, watchVisible } from '../lib/util'

const NAMES = ['LOW', 'MEDIUM', 'HIGH', 'XHIGH', 'MAX']
const NOTES = [
  '回得最快、用的 token 最少，適合例行工作。',
  'Claude app 的預設檔位。',
  'Claude API 的預設檔位。',
  '想得更久，檢查得更細。',
  '想得最久。官方提醒：有項評測裡，Max 反而不如 Xhigh。',
]
const A0 = (-135 * Math.PI) / 180
const A1 = (135 * Math.PI) / 180

export function initEffort() {
  const draft = $<HTMLCanvasElement>('#draft')
  const knob = $<HTMLCanvasElement>('#knob')
  const wrap = $('#knobWrap')
  const range = $<HTMLInputElement>('#effortRange')
  const nameEl = $('#effortName')
  const noteEl = $('#effortNote')
  const rig = $('#rig')
  const hint = $('.hint-turn')
  const btns = Array.from(document.querySelectorAll<HTMLButtonElement>('.detents button'))

  const reduced = isReduced()
  let level = 1
  let live = 1
  const sp = new Spring(150, 17, 1)
  let dragging = false
  let touched = false
  let visible = false
  let dirty = true
  let lastPaint = -1

  const r = rng(7)
  const N = 12
  const jx: number[] = []
  const jw: number[] = []
  const jy: number[] = []
  const bad: boolean[] = []
  for (let i = 0; i < N; i++) {
    jx.push((r() - 0.5) * 2)
    jw.push(0.55 + r() * 0.4)
    jy.push((r() - 0.5) * 2)
    bad.push(i === 2 || i === 5 || i === 8 || i === 10)
  }

  function setLevel(v: number, user = true) {
    level = clamp(Math.round(v), 0, 4)
    range.value = String(level)
    nameEl.textContent = NAMES[level]
    noteEl.textContent = NOTES[level]
    btns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === level)))
    if (user && !touched) {
      touched = true
      hint.classList.add('gone')
    }
    dirty = true
  }
  setLevel(1, false)
  range.addEventListener('input', () => setLevel(Number(range.value)))
  btns.forEach((b, i) => b.addEventListener('click', () => setLevel(i)))

  function angleToValue(clientX: number, clientY: number) {
    const rc = knob.getBoundingClientRect()
    const cx = rc.left + rc.width / 2
    const cy = rc.top + rc.height / 2
    let a = Math.atan2(clientX - cx, -(clientY - cy))
    a = clamp(a, A0, A1)
    return ((a - A0) / (A1 - A0)) * 4
  }
  knob.addEventListener('pointerdown', (e) => {
    dragging = true
    knob.setPointerCapture(e.pointerId)
    live = angleToValue(e.clientX, e.clientY)
    setLevel(live)
    wrap.classList.add('grab')
  })
  knob.addEventListener('pointermove', (e) => {
    if (!dragging) return
    live = angleToValue(e.clientX, e.clientY)
    setLevel(live)
  })
  const up = () => {
    dragging = false
    wrap.classList.remove('grab')
  }
  knob.addEventListener('pointerup', up)
  knob.addEventListener('pointercancel', up)

  function drawKnob(q: number) {
    const { w, h, dpr } = fitCanvas(knob, 2)
    const g = knob.getContext('2d')!
    g.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w, h) / 2
    const ang = lerp(A0, A1, q / 4) - Math.PI / 2

    for (let i = 0; i < 5; i++) {
      const a = lerp(A0, A1, i / 4) - Math.PI / 2
      const on = Math.abs(q - i) < 0.5
      g.strokeStyle = on ? '#c4532b' : '#17110e'
      g.lineWidth = (on ? 3.4 : 2) * dpr
      g.beginPath()
      g.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86)
      g.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98)
      g.stroke()
    }
    for (let i = 0; i < 4; i++) {
      for (let k = 1; k < 4; k++) {
        const a = lerp(A0, A1, (i + k / 4) / 4) - Math.PI / 2
        g.strokeStyle = 'rgba(23,17,14,0.4)'
        g.lineWidth = dpr
        g.beginPath()
        g.moveTo(cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92)
        g.lineTo(cx + Math.cos(a) * R * 0.98, cy + Math.sin(a) * R * 0.98)
        g.stroke()
      }
    }
    g.strokeStyle = 'rgba(196,83,43,0.9)'
    g.lineWidth = 4 * dpr
    g.lineCap = 'round'
    g.beginPath()
    g.arc(cx, cy, R * 0.8, A0 - Math.PI / 2, ang)
    g.stroke()

    const Rb = R * 0.68
    g.save()
    g.shadowColor = 'rgba(23,17,14,0.5)'
    g.shadowBlur = 26 * dpr
    g.shadowOffsetY = 12 * dpr
    const body = g.createRadialGradient(cx - Rb * 0.35, cy - Rb * 0.45, Rb * 0.1, cx, cy, Rb)
    body.addColorStop(0, '#4a3a30')
    body.addColorStop(0.55, '#241a14')
    body.addColorStop(1, '#0f0a07')
    g.fillStyle = body
    g.beginPath()
    g.arc(cx, cy, Rb, 0, Math.PI * 2)
    g.fill()
    g.restore()

    g.save()
    g.translate(cx, cy)
    g.rotate(ang + Math.PI / 2)
    for (let i = 0; i < 36; i++) {
      g.rotate((Math.PI * 2) / 36)
      g.fillStyle = 'rgba(246,234,211,0.09)'
      g.fillRect(-1 * dpr, -Rb * 0.97, 2 * dpr, Rb * 0.1)
    }
    g.restore()

    const face = g.createRadialGradient(cx - Rb * 0.25, cy - Rb * 0.3, 0, cx, cy, Rb * 0.78)
    face.addColorStop(0, '#3a2c23')
    face.addColorStop(1, '#1a120d')
    g.fillStyle = face
    g.beginPath()
    g.arc(cx, cy, Rb * 0.78, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = 'rgba(246,234,211,0.16)'
    g.lineWidth = dpr
    g.stroke()

    g.save()
    g.translate(cx, cy)
    g.rotate(ang + Math.PI / 2)
    g.fillStyle = '#e8643a'
    g.shadowColor = 'rgba(232,100,58,0.8)'
    g.shadowBlur = 12 * dpr
    const iw = 5 * dpr
    g.beginPath()
    g.roundRect(-iw / 2, -Rb * 0.7, iw, Rb * 0.34, iw / 2)
    g.fill()
    g.restore()
  }

  function drawDraft(q: number, t: number) {
    const { w, h, dpr } = fitCanvas(draft, 2)
    const g = draft.getContext('2d')!
    g.clearRect(0, 0, w, h)
    const sloppy = 1 - q / 4
    g.save()
    g.translate(w / 2, h / 2)
    g.rotate(sloppy * 0.035 * Math.sin(t * 0.7))
    g.translate(-w / 2, -h / 2)

    const pw = w * 0.9
    const ph = h * 0.94
    const px = (w - pw) / 2
    const py = (h - ph) / 2
    g.save()
    g.shadowColor = 'rgba(23,17,14,0.45)'
    g.shadowBlur = 30 * dpr
    g.shadowOffsetY = 14 * dpr
    g.fillStyle = '#f6ead3'
    g.fillRect(px, py, pw, ph)
    g.restore()
    g.fillStyle = 'rgba(23,17,14,0.04)'
    for (let y = py + 3 * dpr; y < py + ph; y += 3 * dpr) g.fillRect(px, y, pw, dpr)

    const m = pw * 0.08
    const top = py + ph * 0.19
    const rowH = (ph * 0.74) / N
    g.fillStyle = '#17110e'
    g.fillRect(px + m, py + ph * 0.07, pw * 0.34 * (1 - sloppy * 0.25 * Math.sin(t * 1.3)), ph * 0.035)

    const checked = Math.floor((q / 4) * N + 0.0001)
    for (let i = 0; i < N; i++) {
      const y = top + i * rowH + jy[i] * sloppy * rowH * 0.3
      const x = px + m + jx[i] * sloppy * pw * 0.05
      const full = pw - m * 2 - pw * 0.1
      const wd = full * lerp(jw[i], 0.78 + (i % 3) * 0.08, 1 - sloppy)
      const bh = rowH * 0.34
      const isBad = bad[i] && q < 2.6
      g.fillStyle = isBad ? 'rgba(23,17,14,0.62)' : '#17110e'
      g.fillRect(x, y, wd, bh)
      if (isBad) {
        g.strokeStyle = '#c4532b'
        g.lineWidth = 2 * dpr
        g.beginPath()
        const y2 = y + bh + 3 * dpr
        for (let k = 0; k <= 22; k++) {
          const xx = x + (wd * k) / 22
          const yy = y2 + (k % 2 ? 2.4 : -2.4) * dpr
          if (k) g.lineTo(xx, yy)
          else g.moveTo(xx, yy)
        }
        g.stroke()
      }
      if (i < checked) {
        const k = clamp((q / 4) * N - i)
        const tx = px + pw - m * 0.9
        const ty = y + bh / 2
        g.strokeStyle = '#2f6b3f'
        g.lineWidth = 2.6 * dpr
        g.lineCap = 'round'
        g.lineJoin = 'round'
        g.beginPath()
        g.moveTo(tx - 7 * dpr, ty)
        g.lineTo(tx - 7 * dpr + 5 * dpr * Math.min(1, k * 2), ty + 6 * dpr * Math.min(1, k * 2))
        if (k > 0.5) g.lineTo(tx - 2 * dpr + 12 * dpr * ((k - 0.5) * 2), ty + 6 * dpr - 15 * dpr * ((k - 0.5) * 2))
        g.stroke()
      }
    }

    const tl = py + ph * 0.93
    const segW = (pw - m * 2) / 5
    for (let i = 0; i < 5; i++) {
      const f = clamp(q - i + 1)
      g.fillStyle = 'rgba(23,17,14,0.14)'
      g.fillRect(px + m + i * segW + 2 * dpr, tl, segW - 4 * dpr, 5 * dpr)
      g.fillStyle = '#c4532b'
      g.fillRect(px + m + i * segW + 2 * dpr, tl, (segW - 4 * dpr) * f, 5 * dpr)
    }

    if (q > 3.6) {
      const k = smooth((q - 3.6) / 0.4)
      g.save()
      g.translate(px + pw * 0.74, py + ph * 0.09)
      g.rotate(-0.16)
      g.globalAlpha = k * 0.9
      g.strokeStyle = '#2f6b3f'
      g.lineWidth = 2.5 * dpr
      const sw = pw * 0.2
      const sh = ph * 0.065
      g.strokeRect(-sw / 2, -sh / 2, sw, sh)
      g.fillStyle = '#2f6b3f'
      g.font = `500 ${Math.round(Math.min(sh * 0.55, 12 * dpr))}px "Plex Mono", monospace`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText('CHECKED', 0, 1 * dpr)
      g.restore()
    }
    g.restore()
  }

  watchVisible(rig, (v) => (visible = v))
  onResize(() => (dirty = true))
  document.fonts.ready.then(() => (dirty = true))

  const gold = reduced ? 0 : 1
  onFrame((t, dt) => {
    if (!visible) return
    const target = dragging ? live : level
    const q = reduced ? target : sp.step(target, dt)
    const moving = dragging || !sp.settled || Math.abs(q - target) > 0.001
    const wobble = gold && q < 3.9 ? 1 : 0
    if (!dirty && !moving && !wobble && Math.abs(lastPaint - q) < 1e-4) return
    lastPaint = q
    dirty = false
    drawKnob(q)
    drawDraft(q, t)
  })
}
