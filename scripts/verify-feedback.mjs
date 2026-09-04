// 客戶反饋三條的自動化驗收（跑完即刪亦可留）。
// 用法：arena preview 跑在 5176（本腳本不負責起服務），node scripts/verify-feedback.mjs
import puppeteer from 'puppeteer-core';

const BASE = process.env.SHOTS_BASE || 'http://localhost:5176';
const SHOT_DIR = 'C:\\Users\\TYPELI~1\\AppData\\Local\\Temp\\opencode';
let failures = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
  if (!cond) failures += 1;
};

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

// 1) GLM 共鳴腔：互動後中央截圖留檔（人工驗色），另斷言畫面確實在動
await page.goto(`${BASE}/works/glm/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 2500));
const canvas = await page.$('canvas');
const box = await canvas.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
await page.mouse.move(cx - 120, cy);
await page.mouse.down();
for (let i = 0; i <= 24; i++) {
  const a = (i / 24) * Math.PI * 2;
  await page.mouse.move(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, { steps: 2 });
}
await page.mouse.up();
await new Promise((r) => setTimeout(r, 900));
const clip = { x: cx - 160, y: cy - 160, width: 320, height: 320 };
const hotBuf = await page.screenshot({ clip });
await new Promise((r) => setTimeout(r, 6000)); // 放到殘響散盡
const coldBuf = await page.screenshot({ clip });
let diff = 0;
const n = Math.min(hotBuf.length, coldBuf.length);
for (let i = 0; i < n; i += 7) diff += Math.abs(hotBuf[i] - coldBuf[i]);
const ratio = diff / (n / 7) / 255;
ok('GLM 互動後中央與靜止態明顯不同（中間會變色）', ratio > 0.02, `diff=${ratio.toFixed(4)}`);

// 2) Spark 印契：清空後必須保持空，不能彈回 VISITOR
await page.goto(`${BASE}/works/spark/`, { waitUntil: 'networkidle2', timeout: 45000 });
await page.evaluate(() => document.getElementById('seal-identifier')?.scrollIntoView({ block: 'center' }));
await new Promise((r) => setTimeout(r, 800));
await page.click('#seal-identifier');
await page.keyboard.down('Control');
await page.keyboard.press('KeyA');
await page.keyboard.up('Control');
await page.keyboard.press('Backspace');
await new Promise((r) => setTimeout(r, 300));
const cleared = await page.$eval('#seal-identifier', (el) => el.value);
ok('Spark 清空後保持空字串', cleared === '', JSON.stringify(cleared));
await page.type('#seal-identifier', 'ab');
await new Promise((r) => setTimeout(r, 300));
const typed = await page.$eval('#seal-identifier', (el) => el.value);
ok('Spark 可正常輸入（轉大寫）', typed === 'AB', JSON.stringify(typed));

// 3) QW27：二百七十億在，二十七億亡
await page.goto(`${BASE}/works/qw27/`, { waitUntil: 'networkidle2', timeout: 45000 });
await new Promise((r) => setTimeout(r, 1500));
const html = await page.content();
ok('QW27 含二百七十億', html.includes('二百七十億'));
ok('QW27 無二十七億', !html.includes('二十七億'));

await browser.close();
console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
