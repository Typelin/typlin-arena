// 岔路 Forking Path —— 頂端自走進度條與彩蛋的自動化驗收。
//
// 用法：作品 preview 跑在 4180（本腳本不負責起服務）
//   node scripts/deepseek-verify.mjs
//
// 重點原則：能量到的就不要用眼睛看。
// 進度條這種「有出現」跟「看得出來」是兩回事的東西，一律量它的狀態屬性與幾何。
import puppeteer from 'puppeteer-core';

const BASE =
  process.env.SHOTS_BASE || 'http://127.0.0.1:4180/works/deepseek-v4-1-flash/';

const CHROME =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let failures = 0;
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
  if (!cond) failures += 1;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--autoplay-policy=no-user-gesture-required',
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

const toastText = () => page.$eval('.toast', (el) => el.textContent.trim());
const barState = () =>
  page.$eval('.autobar', (el) => el.dataset.state).catch(() => null);
const clickBranch = () =>
  page.evaluate(() => {
    const b = document.querySelector('.branch');
    if (!b) throw new Error('找不到候選枝');
    b.click();
  });

await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1400);

// 1) 還沒落筆，紙的最上緣不該有任何東西
ok('開場無進度條（還沒開始走）', (await page.$('.autobar')) === null);

// 2) 落筆一步：中途評語應該立刻出聲（不等走完才給判詞）
await clickBranch();
await sleep(500);
const firstNote = await toastText();
ok('落筆即時評語', firstNote.includes('第一個字'), firstNote);

// 3) 停手超過 IDLE_SHOW_MS：進度條出現並開始充能
await sleep(2200);
ok('停手後進度條現身（waiting）', (await barState()) === 'waiting', await barState());

// 4) 等到接手：進度條轉為 walking，表示筆已經被拿走
await sleep(7200);
const walked = await barState();
ok('接手後進度條跑起來（walking）', walked === 'walking', walked);

// 5) 我抽的每一格都該是朱紅——換手在最上面也看得見
const ink = await page
  .$eval('.autobar__ink', (el) => getComputedStyle(el).backgroundImage)
  .catch(() => '');
ok('進度條染上朱紅（我走過的步）', ink.includes('180, 52, 31'), ink.slice(0, 96));

// 6) 進度條確實隨步數推進，而不是一條靜止的裝飾線
const clipOf = () =>
  page.$eval('.autobar__ink', (el) => getComputedStyle(el).clipPath).catch(() => null);
const clip1 = await clipOf();
await sleep(3600);
const clip2 = await clipOf();
ok('進度條隨步數推進', clip1 !== null && clip2 !== null && clip1 !== clip2, `${clip1} → ${clip2}`);

// 7) 訪客出聲：筆立刻還回去，進度條退回 off
await page.mouse.move(200, 500);
await page.mouse.move(400, 620);
await sleep(700);
const afterWake = await barState();
ok('出聲後進度條退回 off', afterWake === 'off', afterWake);
const resumeNote = await toastText();
ok('交還主導權時有話說', resumeNote.includes('筆給你'), resumeNote);

// 8) 互動彩蛋：同一件小事做夠多次才會理你（落款三次）
const doubleTapTitle = async () => {
  await page.click('.hud__title');
  await sleep(80);
  await page.click('.hud__title');
  await sleep(620);
};
await doubleTapTitle();
await doubleTapTitle();
await doubleTapTitle();
await sleep(400);
const stampEgg = await toastText();
ok('互動彩蛋：反覆落款', stampEgg.includes('簽名'), stampEgg);

// 9) 殘頁從五枚長到七枚，而且蓋得開
const leafCount = await page.$$eval('.leaf', (els) => els.length);
ok('殘頁共七枚', leafCount === 7, String(leafCount));
await page.click('.leaf');
await sleep(400);
const leafNote = await toastText();
ok('殘頁可掀開', /第[一二三四五六七]頁/.test(leafNote), leafNote);

// 10) 換一張全新的紙，從頭到尾不碰：判詞該是「沒有人替我選」。
//     上面那張紙訪客走過一步，mineCount 不是 30，不算全自動——這條得用新頁面才測得準。
await page.reload({ waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1200);
await sleep(54000);
const finished = await page.$('.epilogue');
ok('放手可走完全程', finished !== null);
ok('收束頁不再顯示進度條', (await page.$('.autobar')) === null);

const aloneText = await page
  .$eval('.epilogue__inscription--lead', (el) => el.textContent.trim())
  .catch(() => '');
ok('全程自走有專屬判詞', aloneText.includes('沒有人替我選'), aloneText.slice(0, 40));

ok('無 JS 執行期錯誤', errors.length === 0, errors.slice(0, 3).join(' | '));

await browser.close();
console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
