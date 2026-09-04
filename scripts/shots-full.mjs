// 全頁版縮圖：給部落格文章配圖用（整頁收進來，不只首屏）。
// 用法：arena preview 跑在 5176，node scripts/shots-full.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SHOTS_BASE || 'http://localhost:5176';
const SHOTS = [
  ['opus', '/works/opus/'],
  ['spark', '/works/spark/'],
  ['gemini', '/works/gemini/'],
  ['qwen', '/works/qwen/'],
  ['glm', '/works/glm/'],
  ['qw27', '/works/qw27/'],
  ['sakimu', '/logo/spark/'],
];

mkdirSync('public/shots-full', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
for (const [id, path] of SHOTS) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2800));
  await page.screenshot({ path: `public/shots-full/${id}.png`, fullPage: true });
  console.log('full shot ok:', id);
}
await browser.close();
console.log('done');
