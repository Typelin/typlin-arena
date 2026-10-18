import puppeteer from "puppeteer-core";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const output = fileURLToPath(new URL("./readability/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
try {
  for (const viewport of [
    { width: 2560, height: 1270 },
    { width: 2032, height: 1016 },
    { width: 1920, height: 960 },
    { width: 1536, height: 814 },
    { width: 1536, height: 734 },
    { width: 1440, height: 900 },
    { width: 1366, height: 620 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 700, height: 800 },
    { width: 390, height: 844 },
    { width: 375, height: 667 },
    { width: 844, height: 390 },
    { width: 667, height: 375 },
  ]) {
    await page.setViewport(viewport);
    await page.goto("http://127.0.0.1:4611/", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    for (let stage = 0; stage < 4; stage++) {
      await page.evaluate((stage) => {
        const el = document.querySelector(".journey");
        window.scrollTo({
          top: ((el.offsetHeight - innerHeight) * stage) / 3,
          behavior: "instant",
        });
      }, stage);
      await new Promise((r) => setTimeout(r, 550));
      const result = await page.evaluate(
        ({ viewport, stage }) => {
          const box = (selector) => {
            const el = document.querySelector(selector),
              r = el.getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              right: r.right,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
              visible: getComputedStyle(el).display !== "none",
            };
          };
          const copy = box(".narrative.is-current .narrative-copy"),
            note = box(".narrative.is-current .margin-note"),
            hint = box(".discovery"),
            controls = box(".control-desk"),
            field = box(".sculpture-frame"),
            nav = box(".chapter-nav"),
            column = box(".instrument-column");
          const portrait = innerWidth < 760 && innerHeight >= 600;
          const body = document.querySelector(
            ".narrative.is-current .narrative-body",
          );
          return {
            viewport,
            stage,
            copy,
            note,
            hint,
            controls,
            field,
            nav,
            column,
            copyNoteClear: !note.visible || copy.bottom + 12 <= note.y,
            copyNavClear: copy.bottom + 8 <= nav.y,
            noteNavClear: !note.visible || note.bottom + 8 <= nav.y,
            copyFigureClear: !portrait || copy.bottom + 10 <= column.y,
            hintClear: !hint.visible || hint.bottom + 8 <= controls.y,
            controlsClear: controls.bottom + 8 <= nav.y,
            bodyFont: parseFloat(getComputedStyle(body).fontSize),
            overflow: document.documentElement.scrollWidth > innerWidth,
            buttonOverflow: [
              ...document.querySelectorAll(".direction-options button"),
            ].some((el) => el.scrollWidth > el.clientWidth + 1),
          };
        },
        { viewport, stage },
      );
      results.push(result);
      if ([2560, 1536, 390, 375].includes(viewport.width))
        await page.screenshot({
          path:
            output +
            viewport.width +
            "x" +
            viewport.height +
            "-stage-" +
            stage +
            ".png",
        });
    }
  }
  await writeFile(
    output + "results.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  const failed = results.filter(
    (r) =>
      !r.copyNoteClear ||
      !r.copyNavClear ||
      !r.noteNavClear ||
      !r.copyFigureClear ||
      !r.hintClear ||
      !r.controlsClear ||
      r.bodyFont < 12 ||
      r.overflow ||
      r.buttonOverflow ||
      r.field.height < 50,
  );
  console.log(
    JSON.stringify(
      { checked: results.length, errors, failed, output },
      null,
      2,
    ),
  );
  assert.equal(errors.length, 0);
  assert.equal(failed.length, 0, "Text spacing or readability regression");
} finally {
  await browser.close();
}
