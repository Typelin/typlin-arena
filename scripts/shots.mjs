// 真實縮圖管線：用本機 Chrome 無頭截取四件作品站內頁。
// 用法：先 npm run build，然後另開一個終端跑 preview，最後 node scripts/shots.mjs
// （或直接跑 .\scripts\shots.ps1，一條龍）
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
  ['opus-logo', '/logo/opus/'],
  ['spark-logo', '/logo/spark/'],
  ['gemini-logo', '/logo/gemini/'],
  ['qwen-logo', '/logo/qwen/'],
  ['glm-logo', '/logo/glm/'],
];

mkdirSync('public/shots', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 600, deviceScaleFactor: 1 });
for (const [id, path] of SHOTS) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2800));
  await page.screenshot({ path: `public/shots/${id}.png` });
  console.log('shot ok:', id);
}
await browser.close();
console.log('done');
