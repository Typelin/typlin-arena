/**
 * v3 verification: fast-scroll stat fix, term note panel, click ripple.
 * Usage: node scripts/verify2.mjs [exePath] [url] [outDir]
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const EXE = process.argv[2] || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = process.argv[3] || 'http://localhost:4178/';
const OUT = process.argv[4] || '.qc-v3';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: EXE, headless: 'new', args: ['--no-sandbox'] });
await mkdir(OUT, { recursive: true });

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle0' });
await sleep(2500);

// 1) FAST scroll through all chapters (simulates the user's fast read)
for (let i = 0; i < 4; i++) {
  await page.evaluate((idx) => {
    const el = document.querySelector(`.chapter-text[data-ch="${idx}"]`);
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * 0.45 });
  }, i);
  await sleep(700); // fast!
}

// ending — record should show full 44 chars even after fast scroll
await page.evaluate(() => {
  const el = document.getElementById('endCore');
  const r = el.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * 0.45 });
});
await sleep(1800);
const stats = await page.evaluate(() => {
  const e = window.__fieldEngine;
  return { readChars: e.readChars, readingSecs: +e.readingSecs.toFixed(1) };
});
console.log('fast-scroll stats:', JSON.stringify(stats));
await page.screenshot({ path: `${OUT}/ending-fast.png` });

// 2) term note panel — scroll back to ch1 and click "Qwen 3.8"
await page.evaluate(() => {
  const el = document.querySelector('.chapter-text[data-ch="0"]');
  const r = el.getBoundingClientRect();
  window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * 0.45 });
});
await sleep(1200);
const termBtns = await page.$$('.term');
console.log('term buttons found:', termBtns.length);
// pick the "Qwen 3.8" term (visible in ch1) by its label text
let clicked = false;
for (const btn of termBtns) {
  const txt = await btn.evaluate((el) => el.textContent);
  if (txt.includes('Qwen')) {
    await btn.click();
    clicked = true;
    break;
  }
}
console.log('clicked Qwen term:', clicked);
await sleep(600);
await page.screenshot({ path: `${OUT}/term-note.png` });

// 3) click ripple on body text
const p = await page.$('.chapter-text[data-ch="0"] .body');
if (p) {
  const pb = await p.boundingBox();
  await page.mouse.click(pb.x + pb.width * 0.5, pb.y + pb.height * 0.3);
  await sleep(260); // mid-ripple
}
await page.screenshot({ path: `${OUT}/ripple.png` });

console.log('verify2 done ->', OUT);
await browser.close();
