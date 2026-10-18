import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("./", import.meta.url));
const downloadPath = fileURLToPath(
  new URL(`./downloads/run-${Date.now()}/`, import.meta.url),
);
await mkdir(downloadPath, { recursive: true });
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--disable-background-networking", "--no-first-run"],
});
const page = await browser.newPage();
const errors = [];
const external = [];
const checks = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4611/";
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("request", (request) => {
  if (
    !request.url().startsWith(new URL(base).origin) &&
    !request.url().startsWith("data:")
  )
    external.push(request.url());
});
const check = (name, condition, detail) => {
  assert.ok(condition, `${name}: ${JSON.stringify(detail)}`);
  checks.push({ name, passed: true, detail });
};
const canvasHash = () => page.$eval("canvas", (el) => el.toDataURL());
const shot = (name) => page.screenshot({ path: `${out}${name}.png` });
const load = async (viewport, reduced = false) => {
  await page.setViewport(viewport);
  await page.emulateMediaFeatures([
    {
      name: "prefers-reduced-motion",
      value: reduced ? "reduce" : "no-preference",
    },
  ]);
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await sleep(700);
};

try {
  await load({ width: 1440, height: 900 });
  await page.keyboard.press("Tab");
  check(
    "Keyboard skip link is first",
    await page.$eval(".skip-link", (el) => el === document.activeElement),
  );
  await page.keyboard.press("Enter");
  check(
    "Skip link focuses controls without changing chapter",
    (await page.$eval(
      ".direction-options button",
      (el) => el === document.activeElement,
    )) &&
      (await page.$eval(".experience", (el) =>
        el.classList.contains("stage-0"),
      )),
  );
  await page.click(".motion-toggle");
  await sleep(1400);
  const still = await canvasHash();
  await sleep(500);
  check("Pause stops ambient rendering", still === (await canvasHash()));
  await shot("desktop");

  await page.click(".direction-options button:nth-child(2)");
  await sleep(1400);
  check("Intention changes geometry", still !== (await canvasHash()));
  check(
    "Intention has selected state",
    await page.$eval(
      ".direction-options button:nth-child(2)",
      (el) => el.getAttribute("aria-pressed") === "true",
    ),
  );
  await page.focus("#tension");
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  check(
    "Native slider supports keyboard",
    await page.$eval("output", (el) => el.textContent === "01"),
  );
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  check(
    "Slider output and accessible value agree",
    await page.$eval(
      "#tension",
      (el) =>
        el.value === "99" && el.getAttribute("aria-valuetext").startsWith("99"),
    ),
  );
  await page.$eval("#tension", (el) => {
    el.value = "56";
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.focus("#tension");
  await page.keyboard.press("Home");
  for (let i = 0; i < 56; i++) await page.keyboard.press("ArrowRight");
  await sleep(1300);
  const beforeDrag = await canvasHash();
  const bounds = await page.$eval(".sculpture-touch", (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const x = bounds.x + bounds.width * 0.5,
    y = bounds.y + bounds.height * 0.5;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 80, y + 15, { steps: 12 });
  await page.mouse.up();
  await sleep(1300);
  check("Dragging changes the sculpture", beforeDrag !== (await canvasHash()));
  await page.mouse.move(x, y);
  await page.mouse.down();
  await sleep(1300);
  check(
    "Long press discovers unweaving",
    await page.$eval(".experience", (el) =>
      el.classList.contains("is-unwoven"),
    ),
  );
  await shot("unwoven");
  await page.mouse.up();
  await sleep(700);
  check(
    "Long press releases cleanly",
    await page.$eval(
      ".experience",
      (el) => !el.classList.contains("is-unwoven"),
    ),
  );
  await page.focus(".sculpture-touch");
  await page.keyboard.down("Space");
  await sleep(500);
  check(
    "Unweaving has a keyboard equivalent",
    await page.$eval(".experience", (el) =>
      el.classList.contains("is-unwoven"),
    ),
  );
  await page.keyboard.up("Space");
  await page.click(".inspect-button");
  check(
    "Persistent inspection has pressed state",
    await page.$eval(
      ".inspect-button",
      (el) => el.getAttribute("aria-pressed") === "true",
    ),
  );
  await page.click(".inspect-button");

  await page.click(".about-button");
  check(
    "About opens a modal dialog",
    await page.$eval("dialog", (el) => el.open && el.matches(":modal")),
  );
  await shot("about");
  await page.keyboard.press("Escape");
  check(
    "Escape closes dialog and restores focus",
    (await page.$eval("dialog", (el) => !el.open)) &&
      (await page.$eval(
        ".about-button",
        (el) => el === document.activeElement,
      )),
  );

  await page.click(".chapter-links button:nth-child(3)");
  await sleep(1400);
  check(
    "Chapter navigation preserves intention and tension",
    (await page.$eval(
      ".experience",
      (el) =>
        el.classList.contains("stage-2") && el.classList.contains("is-dark"),
    )) &&
      (await page.$eval(
        ".direction-options button:nth-child(2)",
        (el) => el.getAttribute("aria-pressed") === "true",
      )) &&
      (await page.$eval("#tension", (el) => el.value === "56")),
  );
  await shot("desktop-weave");
  await page.click(".chapter-links button:nth-child(4)");
  await sleep(1400);
  const cdp = await page.createCDPSession();
  await cdp.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
  });
  const downloadsBefore = new Set(await readdir(downloadPath));
  await page.click(".save-button");
  await sleep(800);
  const download = (await readdir(downloadPath)).find(
    (name) => name.endsWith(".svg") && !downloadsBefore.has(name),
  );
  check("Save creates an SVG file", Boolean(download));
  const svg = await readFile(`${downloadPath}/${download}`, "utf8");
  check(
    "Saved artwork contains geometry and chosen parameters",
    svg.includes("<svg") &&
      svg.includes("POSSIBILITY / T56") &&
      svg.length > 100000,
    { bytes: svg.length, file: download },
  );
  await shot("desktop-final");

  const printPage = await browser.newPage();
  await printPage.setViewport({
    width: 600,
    height: 700,
    deviceScaleFactor: 1,
  });
  await printPage.setContent(
    `<style>body{margin:0}img{display:block;width:100%}</style><img alt="Generated artwork" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}">`,
  );
  await sleep(300);
  check(
    "Saved SVG renders successfully",
    await printPage.$eval(
      "img",
      (el) => el.complete && el.naturalWidth === 1200,
    ),
  );
  await printPage.screenshot({ path: `${out}saved-artwork.png` });
  await printPage.close();

  await load({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const touchRect = await page.$eval(
    ".direction-options button:nth-child(3)",
    (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
  );
  await page.touchscreen.tap(touchRect.x, touchRect.y);
  check(
    "Mobile touch selects an intention",
    await page.$eval(
      ".direction-options button:nth-child(3)",
      (el) => el.getAttribute("aria-pressed") === "true",
    ),
  );
  await shot("mobile");

  const layouts = [];
  for (const viewport of [
    { width: 390, height: 844, isMobile: true, hasTouch: true },
    { width: 375, height: 667, isMobile: true, hasTouch: true },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1920, height: 1080 },
    { width: 844, height: 390, isMobile: true, hasTouch: true },
    { width: 667, height: 375, isMobile: true, hasTouch: true },
  ]) {
    await load(viewport);
    for (let stage = 0; stage < 4; stage++) {
      await page.evaluate((stage) => {
        const el = document.querySelector(".journey");
        window.scrollTo({
          top: ((el.offsetHeight - innerHeight) * stage) / 3,
          behavior: "instant",
        });
      }, stage);
      await sleep(450);
      const result = await page.evaluate(
        ({ viewport, stage }) => {
          const r = document
            .querySelector(".control-desk")
            .getBoundingClientRect();
          const n = document
            .querySelector(".chapter-nav")
            .getBoundingClientRect();
          const buttons = [
            ...document.querySelectorAll(
              ".direction-options button,.inspect-button,.chapter-links button",
            ),
          ].map((el) => {
            const r = el.getBoundingClientRect();
            const top = document.elementFromPoint(
              r.x + r.width / 2,
              r.y + r.height / 2,
            );
            return el === top || el.contains(top);
          });
          return {
            viewport,
            stage,
            overflow: document.documentElement.scrollWidth > innerWidth,
            controlsVisible: r.top >= 0 && r.bottom <= innerHeight,
            navVisible: n.bottom <= innerHeight,
            buttonsReachable: buttons.every(Boolean),
          };
        },
        { viewport, stage },
      );
      layouts.push(result);
      check(
        `Layout ${viewport.width}×${viewport.height}, chapter ${stage + 1}`,
        !result.overflow &&
          result.controlsVisible &&
          result.navVisible &&
          result.buttonsReachable,
        result,
      );
      if (stage === 3 && viewport.width === 375)
        await shot("mobile-compact-final");
      if (stage === 0 && viewport.width === 844) await shot("mobile-landscape");
    }
  }

  await load({ width: 390, height: 844 }, true);
  const reducedBefore = await canvasHash();
  await sleep(600);
  check(
    "Reduced motion has no ambient animation",
    reducedBefore === (await canvasHash()),
  );
  await page.focus("#tension");
  await page.keyboard.press("End");
  await sleep(150);
  check(
    "Reduced motion still responds to input",
    reducedBefore !== (await canvasHash()),
  );
  await page.click(".chapter-links button:nth-child(3)");
  await sleep(400);
  check(
    "Reduced motion chapter navigation is immediate",
    await page.$eval(".experience", (el) => el.classList.contains("stage-2")),
  );
  const reducedAfter = await canvasHash();
  await sleep(400);
  check(
    "Reduced motion settles to a static composition",
    reducedAfter === (await canvasHash()),
  );
  await shot("reduced-motion");

  await load({ width: 1440, height: 900 });
  const performanceResult = await page.evaluate(async () => {
    const frames = [];
    const longTasks = [];
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const original = context.clearRect;
    context.clearRect = function (...args) {
      frames.push(performance.now());
      return original.apply(this, args);
    };
    const observer = new PerformanceObserver((list) =>
      list.getEntries().forEach((e) => longTasks.push(e.duration)),
    );
    observer.observe({ type: "longtask", buffered: false });
    await new Promise((r) => setTimeout(r, 3000));
    observer.disconnect();
    context.clearRect = original;
    const intervals = frames
      .slice(1)
      .map((t, i) => t - frames[i])
      .sort((a, b) => a - b);
    return {
      renderedFrames: frames.length,
      approximateFPS: Math.round(frames.length / 3),
      medianFrameInterval:
        Math.round(intervals[Math.floor(intervals.length * 0.5)] * 10) / 10,
      p95FrameInterval:
        Math.round(intervals[Math.floor(intervals.length * 0.95)] * 10) / 10,
      longTasksOver50ms: longTasks.length,
    };
  });
  check(
    "Canvas renders continuously without long tasks",
    performanceResult.renderedFrames > 50 &&
      performanceResult.longTasksOver50ms === 0,
    performanceResult,
  );
  check("No browser runtime errors", errors.length === 0, errors);
  check("Runtime assets are entirely local", external.length === 0, external);
  const report = {
    timestamp: new Date().toISOString(),
    base,
    checks,
    layouts,
    performance: performanceResult,
    errors,
    external,
  };
  await writeFile(`${out}results.json`, JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        passed: checks.length,
        performance: performanceResult,
        errors,
        external,
        report: `${out}results.json`,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
