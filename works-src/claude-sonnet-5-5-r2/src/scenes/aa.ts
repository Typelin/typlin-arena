import { $, Spring, clamp, isReduced, onFrame, watchVisible } from '../lib/util'

export function initAA() {
  const sec = $('#aa')
  const printer = $('#aaPrinter')
  const slot = $('.aa-slot', printer)
  if (isReduced()) {
    printer.style.setProperty('--p', '1')
    printer.style.setProperty('--bar', '1')
    return
  }

  const paper = new Spring(70, 15, 0)
  const bar = new Spring(60, 11, 0)
  let visible = false
  watchVisible(sec, (v) => (visible = v), '20% 0px')

  onFrame((t, dt) => {
    if (!visible) return
    const r = printer.getBoundingClientRect()
    const vh = window.innerHeight
    const span = Math.min(r.height, vh * 0.8)
    const target = clamp((vh * 0.88 - r.top) / span)
    const p = clamp(paper.step(target, dt))
    const moving = Math.abs(paper.v) > 0.01 && p > 0.003 && p < 0.997

    printer.style.setProperty('--p', p.toFixed(4))
    if (moving) printer.setAttribute('data-printing', '')
    else printer.removeAttribute('data-printing')

    const b = clamp(bar.step(p > 0.96 ? 1 : 0, dt), 0, 1.04)
    printer.style.setProperty('--bar', b.toFixed(3))

    const shake = moving ? Math.sin(t * 90) * Math.min(1, Math.abs(paper.v) * 4) * 0.9 : 0
    slot.style.transform = shake ? `translateY(${shake.toFixed(2)}px)` : ''
  })
}
