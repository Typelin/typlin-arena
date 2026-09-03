/**
 * QC screenshot script — puppeteer-core + system Edge/Chrome.
 * Usage: node scripts/shots.mjs [exePath] [url] [outDir]
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const EXE = process.argv[2] || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.argv[3] || 'http://localhost:5178/';
const OUT = process.argv[4] || '.qc';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: 'new',
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
await mkdir(OUT, { recursive: true });

const errors = [];
function attach(page) {
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
}

const centerEl = async (page, sel) => {
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * 0.45 });
  }, sel);
};

/* ---------- desktop 1440x900 ---------- */
let page = await browser.newPage();
attach(page);
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await sleep(2800);

await page.screenshot({ path: `${OUT}/d-0-hero.png` });

// hidden layer: hold = gaze (chars become weight indices)
await page.mouse.move(760, 470);
await page.mouse.down();
await sleep(1200);
await page.screenshot({ path: `${OUT}/d-gaze.png` });
await page.mouse.up();
await sleep(300);

for (let i = 0; i < 4; i++) {
  await centerEl(page, `.chapter-text[data-ch="${i}"]`);
  await sleep(3000); // binding flight + lock + underline
  await page.screenshot({ path: `${OUT}/d-${i + 1}-ch${i + 1}.png` });
}

// ch3 flicker final state should be locked by now (triggered on entry)
await centerEl(page, '.flicker');
await sleep(2600);
await page.screenshot({ path: `${OUT}/d-flicker.png` });

// ending + breath impulse at click point
await centerEl(page, '#endCore');
await sleep(2400);
const bz = await page.$('.breath-zone');
if (bz) {
  const box = await bz.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(800); // mid-wave
}
await page.screenshot({ path: `${OUT}/d-6-ending.png` });

/* ---------- mobile 390x844 ---------- */
const m = await browser.newPage();
attach(m);
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await m.goto(URL, { waitUntil: 'networkidle0' });
await sleep(2600);
await m.screenshot({ path: `${OUT}/m-0-hero.png` });

for (const i of [0, 1]) {
  await centerEl(m, `.chapter-text[data-ch="${i}"]`);
  await sleep(3000);
  await m.screenshot({ path: `${OUT}/m-${i + 1}-ch${i + 1}.png` });
}

await centerEl(m, '#endCore');
await sleep(2400);
await m.screenshot({ path: `${OUT}/m-6-ending.png` });

if (errors.length) {
  console.log('ERRORS:\n' + errors.join('\n'));
} else {
  console.log('no page errors');
}
console.log(`shots -> ${OUT}`);
await browser.close();
