// 本作品自用的驗收截圖（不動 Arena 根目錄 scripts/）
// 用法：node verify.mjs   （需本機 Chrome + 4178 preview 服務）
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(new URL("../../package.json", import.meta.url));
const puppeteer = require("puppeteer-core");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "verify");
const PAGE_URL = "http://localhost:4178/works/mimo-v2.6-flash/";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

async function open(viewport, reduced = false) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  if (reduced) {
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  }
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(PAGE_URL, { waitUntil: "networkidle0" });
  await sleep(1500);
  return page;
}

const maxScroll = (page) =>
  page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

async function toProgress(page, p) {
  // 結幕帳目展開會改變頁面高度，多捲幾次才會真正到位
  for (let i = 0; i < 3; i++) {
    const max = await maxScroll(page);
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * p));
    await sleep(i === 2 ? 1700 : 450);
  }
}

/** 把某一幕對齊視口中線（釘住段的穩定態） */
async function toAct(page, id) {
  for (let i = 0; i < 3; i++) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const y = window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
      window.scrollTo(0, y);
    }, id);
    await sleep(i === 2 ? 1700 : 450);
  }
}

async function shoot(page, name) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}

// ---- 桌機：靜態章節 ----
{
  const page = await open({ width: 1440, height: 900 });
  await shoot(page, "d-00-hero");
  await toAct(page, "think");
  await shoot(page, "d-01-think");
  await toAct(page, "make");
  await shoot(page, "d-02-make");
  await toAct(page, "you");
  await shoot(page, "d-03-night");
  await toAct(page, "end");
  await shoot(page, "d-04-finale");
  await toProgress(page, 1);
  await shoot(page, "d-05-end");

  // ---- 互動：點一下留痕 ----
  await toAct(page, "make");
  const c = { x: 1440 * 0.655, y: 450 };
  await page.mouse.click(c.x + 90, c.y - 140);
  await sleep(900);
  await shoot(page, "i1-pluck");

  // ---- 互動：按住收成一疊 ----
  await page.mouse.move(c.x, c.y + 60);
  await page.mouse.down();
  await sleep(950);
  await shoot(page, "i2-hold");
  await page.mouse.up();
  await sleep(900);
  await shoot(page, "i3-release");

  // ---- 互動：留一句話 ----
  await toProgress(page, 1);
  await page.click("#leave-input");
  await page.evaluate(() => {
    const el = document.querySelector("#leave-input");
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(el, "你其實可以更兇一點");
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.click(".leave__btn");
  await sleep(1400);
  await shoot(page, "i4-message");

  // ---- 鍵盤：Tab 到「碰一下核」並觸發 ----
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  await page.focus(".poke");
  await page.keyboard.press("Enter");
  await sleep(800);
  await shoot(page, "i5-keyboard");

  // ---- 概念驗證：捲回去，核不能縮 ----
  await toAct(page, "you");
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1900);
  await shoot(page, "i6-no-regress");
  await page.close();
}

// ---- 減少動態 ----
{
  const page = await open({ width: 1440, height: 900 }, true);
  await toAct(page, "you");
  await shoot(page, "r1-reduced-night");
  await page.close();
}

// ---- 手機 ----
{
  const page = await open({ width: 390, height: 844 });
  await shoot(page, "m-00-hero");
  await toAct(page, "think");
  await shoot(page, "m-01-think");
  await toAct(page, "you");
  await shoot(page, "m-03-night");
  await toAct(page, "end");
  await shoot(page, "m-04-finale");
  await toProgress(page, 1);
  await shoot(page, "m-05-end");
  await page.close();
}

await browser.close();

if (errors.length) {
  console.log("ERRORS:");
  for (const e of errors) console.log("  " + e);
} else {
  console.log("no page errors");
}
console.log("shots -> " + OUT);
