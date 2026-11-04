import { $, isReduced, watchVisible } from '../lib/util'

export function initDomains() {
  const rack = $('#domRack')
  const items = Array.from(rack.querySelectorAll<HTMLElement>('.dom'))
  const tabs = items.map((d) => $<HTMLButtonElement>('.dom-tab', d))
  const narrow = window.matchMedia('(max-width: 980px)')

  items.forEach((d, i) => d.style.setProperty('--i', String(i)))

  const setOpen = (idx: number, open: boolean) => {
    items[idx].classList.toggle('is-open', open)
    tabs[idx].setAttribute('aria-expanded', String(open))
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      const wasOpen = items[i].classList.contains('is-open')
      if (wasOpen && !narrow.matches) return
      items.forEach((_, j) => setOpen(j, j === i ? !wasOpen : false))
    })
    tab.addEventListener('keydown', (e) => {
      const k = e.key
      let to = -1
      if (k === 'ArrowRight') to = (i + 1) % tabs.length
      else if (k === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length
      if (to < 0) return
      e.preventDefault()
      tabs[to].focus()
    })
  })

  if (isReduced()) {
    items.forEach((d) => d.classList.add('in'))
    return
  }

  let done = false
  watchVisible(
    rack,
    (v) => {
      if (!v || done) return
      done = true
      items.forEach((d) => d.classList.add('in'))
    },
    '-12% 0px',
  )
}
