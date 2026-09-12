// 真實縮圖管線：用本機 Chrome 無頭截取 Arena 作品站內頁。
// 用法：先 npm run build，另開 preview，再 node scripts/shots.mjs。
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SHOTS_BASE || 'http://localhost:5176';
// SHOTS_IDS=gemini-3-8-flash-high,glm-5-3 只截指定模型；SHOTS_W/H 可改視窗。
const ALL = [
  ['claude-opus-4-6', '/works/claude-opus-4-6/'],
  ['muse-spark-1-3', '/works/muse-spark-1-3/'],
  ['gemini-3-8-flash-high', '/works/gemini-3-8-flash-high/'],
  ['qwen-3-8-flash', '/works/qwen-3-8-flash/'],
  ['glm-5-3-flash', '/works/glm-5-3-flash/'],
  ['qwen-3-8-27b-local', '/works/qwen-3-8-27b-local/'],
  ['gpt-5-6-sol', '/works/gpt-5-6-sol/'],
  ['deepseek-v4-1-flash', '/works/deepseek-v4-1-flash/'],
  ['grok-4-6', '/works/grok-4-6/'],
  ['glm-5-3', '/works/glm-5-3/'],
  ['opus-logo', '/logo/opus/'],
  ['spark-logo', '/logo/spark/'],
  ['gemini-logo', '/logo/gemini/'],
  ['qwen-logo', '/logo/qwen/'],
  ['glm-logo', '/logo/glm/'],
];
const only = (process.env.SHOTS_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);
const SHOTS = only.length ? ALL.filter(([id]) => only.includes(id)) : ALL;
const VW = Number(process.env.SHOTS_W || 960);
const VH = Number(process.env.SHOTS_H || 600);

mkdirSync('public/shots', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: VW, height: VH, deviceScaleFactor: 1 });
for (const [id, path] of SHOTS) {
  await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2800));
  await page.screenshot({ path: `public/shots/${id}.png` });
  console.log('shot ok:', id);
}
await browser.close();
console.log('done');
