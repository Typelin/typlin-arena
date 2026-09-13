// 岔路「頂端自走進度條」的視覺截圖（驗收用，不參與建置）。
// 用法：作品 preview 跑在 4180，node scripts/shots-autobar.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const BASE =
  process.env.SHOTS_BASE || 'http://127.0.0.1:4180/works/deepseek-v4-1-flash/';
const OUT =
  process.env.SHOTS_OUT ||
  'C:/Users/Typelin_Station/WorkBuddy AI/2026-09-12-12-24-48/auto-check';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);

const topStrip = { x: 0, y: 0, width: 1440, height: 78 };

// 一定要用真實滑鼠事件：程式化的 el.click() 不會觸發 pointerdown，
// 閒置計時器就不會被重置，畫面會提早自己跑起來。
const clickFirstBranch = async () => {
  const el = await page.$('.branch');
  if (!el) throw new Error('找不到候選枝');
  const box = await el.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

// 訪客自己走五步——這五格的墨是黑的
for (let i = 0; i < 5; i += 1) {
  await clickFirstBranch();
  await sleep(1150);
}

// 停手：進度條開始充能（waiting），此時充能過半
await sleep(3400);
await page.screenshot({ path: `${OUT}/autobar-1-waiting.png` });
await page.screenshot({ path: `${OUT}/autobar-1-waiting-top.png`, clip: topStrip });

// 放手讓它接手，自己再走一段——這些格變成朱紅
await sleep(9000);
await page.screenshot({ path: `${OUT}/autobar-2-walking.png` });
await page.screenshot({ path: `${OUT}/autobar-2-walking-top.png`, clip: topStrip });

await browser.close();
console.log('shots-autobar done ->', OUT);
