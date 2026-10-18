import puppeteer from "puppeteer-core";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("./", import.meta.url));
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--disable-background-networking", "--no-first-run"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = [];
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
]) {
  await page.setViewport(viewport);
  await page.goto("http://127.0.0.1:4611/", { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(450);
  for (let stage = 0; stage < 4; stage++) {
    await page.evaluate((index) => {
      const journey = document.querySelector(".journey");
      window.scrollTo({
        top: ((journey.offsetHeight - innerHeight) * index) / 3,
        behavior: "instant",
      });
    }, stage);
    await sleep(1000);
    await page.screenshot({
      path: `${out}${viewport.width}-stage-${stage}.png`,
    });
    report.push(
      await page.evaluate(
        ({ viewport, stage }) => {
          const rect = (selector) => {
            const { x, y, width, height, bottom, right } = document
              .querySelector(selector)
              .getBoundingClientRect();
            return { x, y, width, height, bottom, right };
          };
          return {
            viewport,
            stage,
            overflow: document.documentElement.scrollWidth > innerWidth,
            actualStage: document.querySelector(".experience").className,
            narrative: rect(".narrative.is-current"),
            controls: rect(".control-desk"),
            nav: rect(".chapter-nav"),
            fonts: [...document.fonts].map((f) => ({
              family: f.family,
              status: f.status,
            })),
          };
        },
        { viewport, stage },
      ),
    );
  }
}
await writeFile(
  `${out}first-pass.json`,
  JSON.stringify({ report, errors }, null, 2),
);
console.log(
  JSON.stringify(
    {
      screenshots: report.length,
      errors,
      overflow: report.filter((r) => r.overflow),
      out,
    },
    null,
    2,
  ),
);
await browser.close();
