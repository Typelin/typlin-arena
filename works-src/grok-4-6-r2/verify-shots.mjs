import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const OUT = join(root, 'verify')
mkdirSync(OUT, { recursive: true })
const URL = process.env.SHOT_URL || 'http://127.0.0.1:5199/'

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR', msg.text())
})
page.on('pageerror', (err) => console.log('PAGEERROR', err.message))

async function shot(name) {
  await new Promise((r) => setTimeout(r, 700))
  const metrics = await page.evaluate(() => ({
    inner: [window.innerWidth, window.innerHeight],
    scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    y: Math.round(window.scrollY),
  }))
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  console.log(name, JSON.stringify(metrics))
}

async function scrollToSel(sel) {
  await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (el) el.scrollIntoView({ block: 'start' })
  }, sel)
}

await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 45000 })
await new Promise((r) => setTimeout(r, 1200))
await shot('desktop-hero')
await scrollToSel('.chapter-chart')
await shot('desktop-chart')
await scrollToSel('.chapter-limit')
await shot('desktop-limit')
await scrollToSel('.chapter-scale')
await shot('desktop-scale')
await scrollToSel('.chapter-work')
await shot('desktop-work')

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 })
await new Promise((r) => setTimeout(r, 500))
await page.evaluate(() => window.scrollTo(0, 0))
await shot('mobile-hero')
await scrollToSel('.chapter-chart')
await shot('mobile-chart')
await scrollToSel('.chapter-limit')
await shot('mobile-limit')
await scrollToSel('.chapter-scale')
await shot('mobile-scale')

const err = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
console.log('mobile overflowX', err)

await browser.close()
console.log('done')
