import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

mkdirSync('shots', { recursive: true })
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--disable-gpu'],
})

async function shoot(name, w, h, scroll) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const metrics = await page.evaluate((y) => {
    window.scrollTo(0, y)
    return {
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      y,
    }
  }, scroll)
  await page.waitForTimeout(250)
  await page.screenshot({ path: `shots/${name}.png` })
  await page.close()
  return { name, w, h, metrics, errors }
}

const out = []
out.push(await shoot('hero', 1440, 900, 0))
out.push(await shoot('hero-small', 480, 300, 0))
out.push(await shoot('mobile', 390, 844, 0))
out.push(await shoot('horizon', 1440, 900, 1000))
out.push(await shoot('endurance', 1440, 900, 1900))
out.push(await shoot('blind', 1440, 900, 2850))
out.push(await shoot('cant', 1440, 900, 4000))
out.push(await shoot('together', 1440, 900, 5600))
out.push(await shoot('coda', 1440, 900, 6400))
out.push(await shoot('cant2', 1440, 900, 4300))
out.push(await shoot('together2', 1440, 900, 5300))
out.push(await shoot('mobile-mid', 390, 844, 1600))
console.log(JSON.stringify(out, null, 2))
await browser.close()
