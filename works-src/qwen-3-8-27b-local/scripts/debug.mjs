import puppeteer from 'puppeteer-core';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: 'new',
});
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message));
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5178/', { waitUntil: 'networkidle0' });
await sleep(2500);

for (const ch of [0, 1]) {
  await page.evaluate((i) => {
    const el = document.querySelector(`.chapter-text[data-ch="${i}"]`);
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight * 0.45 });
  }, ch);
  await sleep(3000);
  const info = await page.evaluate((i) => {
    const e = window.__fieldEngine;
    if (!e) return 'no engine';
    const el = document.querySelector(`.chapter-text[data-ch="${i}"]`);
    const r = el.getBoundingClientRect();
    const bound = e.toks.filter((t) => t.bound);
    return {
      boundIdx: e.boundIdx, t: +e.t.toFixed(3), prog: +e.prog.toFixed(3),
      locked: e.lockedFlags, readChars: e.readChars,
      elTopPct: (r.top / innerHeight * 100).toFixed(1) + '%',
      elBottomPct: (r.bottom / innerHeight * 100).toFixed(1) + '%',
      boundCount: bound.length,
      sample: bound.slice(0, 3).map((t) => ({ x: Math.round(t.x), y: Math.round(t.y), tx: Math.round(t.tx), ty: Math.round(t.ty) })),
    };
  }, ch);
  console.log(`ch${ch}:`, JSON.stringify(info));
}
await browser.close();
