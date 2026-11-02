import { $, Spring, clamp, isReduced, onFrame, passProgress, rng, smooth } from '../lib/util'

/* Shakespearean sonnet: ABAB CDCD EFEF GG */
const RHYME = 'ABABCDCDEFEFGG'.split('')

export function initWho() {
  const sec = $('#who')
  const gutter = $('#whoGutter')
  const strips = $('#whoStrips')
  const r = rng(1609)
  const bars: HTMLElement[] = []
  const letters: HTMLElement[] = []
  const lens: number[] = []
  const springs: Spring[] = []

  RHYME.forEach((ch, i) => {
    const l = document.createElement('span')
    l.textContent = ch
    if (i === 4 || i === 8 || i === 12) l.classList.add('gap')
    gutter.appendChild(l)
    letters.push(l)

    const b = document.createElement('i')
    if (i === 4 || i === 8 || i === 12) b.classList.add('gap')
    if (i >= 12) b.classList.add('couplet')
    const inner = document.createElement('u')
    b.appendChild(inner)
    strips.appendChild(b)
    bars.push(b)
    lens.push(i >= 12 ? 0.62 + r() * 0.2 : 0.8 + r() * 0.2)
    springs.push(new Spring(70 + r() * 60, 11 + r() * 5, 0))
  })

  const mark = (ch: string | null) => {
    RHYME.forEach((c, i) => {
      const on = ch !== null && c === ch
      bars[i].classList.toggle('lit', on)
      letters[i].classList.toggle('lit', on)
    })
  }
  RHYME.forEach((c, i) => {
    const hot = () => mark(c)
    bars[i].addEventListener('pointerenter', hot)
    letters[i].addEventListener('pointerenter', hot)
    bars[i].addEventListener('pointerdown', hot)
  })
  strips.parentElement!.addEventListener('pointerleave', () => mark(null))

  const reduced = isReduced()
  let visible = false
  new IntersectionObserver((es) => (visible = es[0].isIntersecting), { rootMargin: '10% 0px' }).observe(sec)

  const paint = (xs: number[]) => {
    for (let i = 0; i < 14; i++) bars[i].style.transform = `scaleX(${clamp(xs[i], 0, 1.04)})`
  }
  if (reduced) {
    paint(lens)
    return
  }
  onFrame((_t, dt) => {
    if (!visible) return
    const p = passProgress(sec)
    const out: number[] = []
    for (let i = 0; i < 14; i++) {
      const start = 0.2 + i * 0.014
      const on = smooth((p - start) / 0.1)
      out.push(springs[i].step(on * lens[i], dt))
    }
    paint(out)
  })
}
