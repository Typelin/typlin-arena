// 捲動影帶：把每件作品從頭捲到尾，逐格截圖，再拼成一張格狀雪碧圖。
// 首頁滑過作品時用 CSS steps() 逐格播放，等於一段無聲的 GIF，但每次都從頭播、離開就停。
// 用法：arena dev server 跑在 4810，node scripts/reels.mjs [作品 id ...]
// 產出：public/reels/<id>.webp（需要 Python + Pillow，見 scripts/reels-sprite.py），
// 以及 src/reels.ts（有影帶的作品清單）。整頁不能捲的作品不錄，避免掛著「捲動中」卻是一張死圖。
import puppeteer from 'puppeteer-core';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { PLATES } from '../src/data.ts';

const BASE = process.env.REELS_BASE || 'http://localhost:4810';
const VIEW = { width: 960, height: 600 };
const HOLD = 6; // 頭尾各停留幾格
const MOVE = 60; // 捲動用幾格
const STEP_WAIT = 90; // 每格之間讓作品的捲動動畫跑一下

const only = process.argv.slice(2);
const list = PLATES.filter((p) => !only.length || only.includes(p.id));
const work = join(tmpdir(), 'arena-reels');
mkdirSync('public/reels', { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const pl of list) {
  const dir = join(work, pl.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage();
  await page.setViewport({ ...VIEW, deviceScaleFactor: 1 });
  try {
    // 明寫 index.html：Vite dev server 不會把三層以上的資料夾路徑對到 index.html，會退回首頁。
    const url = BASE + (pl.src.endsWith('/') ? `${pl.src}index.html` : pl.src);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch {
    console.warn('slow load, continuing:', pl.id);
  }
  await sleep(2600);
  await page.mouse.move(VIEW.width / 2, VIEW.height / 2);

  // 用滾輪事件而不是 scrollTo：作品自己接管捲動（平滑捲動、橫向劇場）時也會動。
  const total = await page.evaluate(() => {
    const se = document.scrollingElement || document.documentElement;
    let max = se.scrollHeight - innerHeight;
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight - el.clientHeight > max) max = el.scrollHeight - el.clientHeight;
    }
    return Math.max(0, max);
  });
  if (total < VIEW.height / 2) {
    await page.close();
    rmSync(`public/reels/${pl.id}.webp`, { force: true });
    console.log(`skip: ${pl.id} (scroll ${Math.round(total)}px, nothing to reel)`);
    continue;
  }
  const delta = total / MOVE;

  let n = 0;
  const shot = async () => {
    const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
    writeFileSync(join(dir, `${String(n++).padStart(3, '0')}.jpg`), buf);
  };
  for (let i = 0; i < HOLD; i++) { await shot(); await sleep(STEP_WAIT); }
  for (let i = 0; i < MOVE; i++) {
    await page.mouse.wheel({ deltaY: delta });
    await sleep(STEP_WAIT);
    await shot();
  }
  for (let i = 0; i < HOLD; i++) { await sleep(STEP_WAIT * 2); await shot(); }
  await page.close();

  execFileSync('python', ['scripts/reels-sprite.py', dir, `public/reels/${pl.id}.webp`], { stdio: 'inherit' });
  console.log(`reel ok: ${pl.id} (scroll ${Math.round(total)}px, ${n} frames)`);
}

await browser.close();
rmSync(work, { recursive: true, force: true });

const ids = readdirSync('public/reels').filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)).sort();
writeFileSync(
  'src/reels.ts',
  `// 由 scripts/reels.mjs 產生：有捲動影帶（public/reels/<id>.webp）的作品。\nexport const REELS = new Set<string>(${JSON.stringify(ids, null, 2)});\n`,
);
console.log(`src/reels.ts: ${ids.length} reels`);
console.log('done');
