import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--enable-unsafe-webgl']
  });

  // 1. Hero Desktop 1440x900
  const page1 = await browser.newPage();
  await page1.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page1.goto('http://localhost:5211/', { waitUntil: 'networkidle0' });
  await sleep(2200);
  await page1.screenshot({ path: 'screenshot-hero.png' });
  console.log('screenshot-hero.png captured');

  // 2. Climax Desktop 1440x900 (#thinking)
  await page1.evaluate(() => {
    const el = document.getElementById('thinking');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await sleep(1200);
  await page1.screenshot({ path: 'screenshot-climax.png' });
  console.log('screenshot-climax.png captured');

  // 3. Mobile 390x844
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page2.goto('http://localhost:5211/', { waitUntil: 'networkidle0' });
  await sleep(2200);
  await page2.screenshot({ path: 'screenshot-mobile.png' });
  console.log('screenshot-mobile.png captured');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
