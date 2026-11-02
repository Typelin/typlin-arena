import { $, clamp, isReduced, onFrame, passProgress, smooth, watchVisible } from '../lib/util'

export function initLimits() {
  const sec = $('#limits')
  const tl = $('#tl')
  const count = $('#tlCount')
  const nowEl = $('#tlNow')
  const reduced = isReduced()

  const cut = new Date(2026, 5, 30)
  const now = new Date()
  const months = Math.max(0, Math.round((now.getTime() - cut.getTime()) / (30.44 * 86400000)))
  nowEl.textContent = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
  count.textContent = months > 0 ? `從我的知識截止到你打開這頁，已過了約 ${months} 個月。` : '你現在打開這頁，離我的知識截止還不到一個月。'

  const marks = Array.from(document.querySelectorAll<SVGPathElement>('.x-out path'))
  marks.forEach((p) => {
    const len = p.getTotalLength()
    p.style.strokeDasharray = String(len)
    p.style.strokeDashoffset = reduced ? '0' : String(len)
    p.dataset.len = String(len)
  })

  let fired = false
  let t0 = 0
  watchVisible(sec.querySelector('.fig-text')!, (v) => {
    if (v && !fired && !reduced) {
      fired = true
      t0 = performance.now()
    }
  }, '-20% 0px')

  const gap = $('.tl-gap')
  const known = $('.tl-known')
  const cutEl = $('.tl-cut')
  let visible = false
  watchVisible(sec, (v) => (visible = v))

  const apply = (cutPct: number) => {
    known.style.width = cutPct + '%'
    gap.style.left = cutPct + '%'
    cutEl.style.left = cutPct + '%'
  }
  if (reduced) {
    apply(62)
    return
  }

  onFrame(() => {
    if (!visible) return
    const p = passProgress(tl)
    apply(62 - smooth((p - 0.35) / 0.35) * 24)

    if (fired) {
      const el = (performance.now() - t0) / 1000
      marks.forEach((m, i) => {
        const k = clamp((el - i * 0.22) / 0.45)
        const len = Number(m.dataset.len)
        m.style.strokeDashoffset = String(len * (1 - k))
      })
    }
  })
}
