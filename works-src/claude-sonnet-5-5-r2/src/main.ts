import './base.css'
import './hero.css'
import './who.css'
import './speed.css'
import './effort.css'
import './context.css'
import './domains.css'
import './versus.css'
import './aa.css'
import './limits.css'
import './sources.css'

import { startLoop } from './lib/util'
import { initHero } from './scenes/hero'
import { initWho } from './scenes/who'
import { initSpeed } from './scenes/speed'
import { initEffort } from './scenes/effort'
import { initContext } from './scenes/context'
import { initDomains } from './scenes/domains'
import { initVersus } from './scenes/versus'
import { initAA } from './scenes/aa'
import { initLimits } from './scenes/limits'

const chapters = ['top', 'who', 'speed', 'effort', 'context', 'domains', 'versus', 'aa', 'limits', 'sources']
const tones = ['#f6ead3', '#17110e', '#17110e', '#f6ead3', '#f6ead3', '#f6ead3', '#17110e', '#f6ead3', '#f6ead3', '#17110e']

function initStrip() {
  const strip = document.getElementById('strip')!
  const bars: HTMLElement[] = []
  for (let i = 0; i < chapters.length; i++) {
    const b = document.createElement('i')
    strip.appendChild(b)
    bars.push(b)
  }
  const els = chapters.map((id) => document.getElementById(id)!)
  let last = -1
  const update = () => {
    const mid = window.innerHeight * 0.45
    let cur = 0
    els.forEach((el, i) => {
      if (el.getBoundingClientRect().top <= mid) cur = i
    })
    if (cur === last) return
    last = cur
    bars.forEach((b, i) => {
      b.classList.toggle('on', i <= cur)
      b.classList.toggle('cur', i === cur)
    })
    strip.style.setProperty('--strip', tones[cur])
  }
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
}

initStrip()
initHero()
initWho()
initSpeed()
initEffort()
initContext()
initDomains()
initVersus()
initAA()
initLimits()

startLoop()
