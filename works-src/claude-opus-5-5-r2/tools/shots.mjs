// Local QA: screenshots at chapter positions, console errors, horizontal overflow.
// Usage: node tools/shots.mjs [outDir]   (needs `vite preview --port 4317`)
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4317/'
const OUT = process.argv[2] || 'shots'
mkdirSync(OUT, { recursive: true })

const views = [
  { name: 'd', width: 1440, height: 900, mobile: false },
  { name: 'm', width: 390, height: 844, mobile: true },
]
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
})

for (const v of views) {
  const page = await browser.newPage()
  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  await page.setViewport({ width: v.width, height: v.height, deviceScaleFactor: v.mobile ? 2 : 1, isMobile: v.mobile, hasTouch: v.mobile })
  // REDUCED=1 emulates prefers-reduced-motion: reduce.
  if (process.env.REDUCED) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(BASE, { waitUntil: 'networkidle0' })
  await wait(2600)
  await page.screenshot({ path: `${OUT}/${v.name}-00-hero.png` })

  const marks = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-scene]')).map((el) => ({
      key: el.dataset.scene,
      top: el.getBoundingClientRect().top + scrollY,
      h: el.offsetHeight,
    })),
  )
  let i = 1
  for (const m of marks.slice(1)) {
    const stops = m.key === 'tokens' ? [0.02, 0.2, 0.4, 0.55, 0.8] : [0.08]
    for (const s of stops) {
      const y = m.key === 'tokens' ? m.top + (m.h - v.height) * s : m.top + v.height * s
      await page.evaluate((yy) => scrollTo(0, yy), y)
      await wait(1500)
      await page.screenshot({ path: `${OUT}/${v.name}-${String(i).padStart(2, '0')}-${m.key}${stops.length > 1 ? '-' + Math.round(s * 100) : ''}.png` })
      i++
    }
  }
  const dims = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
    sh: document.documentElement.scrollHeight,
    headings: Array.from(document.querySelectorAll('h1, h2')).filter((h) => h.getBoundingClientRect().height > 0 && getComputedStyle(h).visibility !== 'hidden').length,
    facts: document.querySelectorAll('.fact').length,
  }))
  console.log(v.name, JSON.stringify(dims), errors.length ? errors : 'no console errors')
  await page.close()
}
await browser.close()
