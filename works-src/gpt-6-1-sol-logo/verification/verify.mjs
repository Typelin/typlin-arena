import puppeteer from "puppeteer-core";
import assert from "node:assert/strict";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const out = fileURLToPath(new URL("./", import.meta.url));
const downloads = fileURLToPath(
  new URL(`./downloads/run-${Date.now()}/`, import.meta.url),
);
await mkdir(downloads, { recursive: true });
const source =
  "D:/Antigravity_proj/projects/personal-web/typlin-arena/benchmark-assets/logo-landing/logo.png";
const hash = async (path) =>
  createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
const sourceHash = await hash(source);
const browser = await puppeteer.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run"],
});
const page = await browser.newPage();
const errors = [],
  external = [],
  checks = [],
  layouts = [];
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4612/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("request", (r) => {
  if (
    !r.url().startsWith(new URL(base).origin) &&
    !r.url().startsWith("blob:") &&
    !r.url().startsWith("data:")
  )
    external.push(r.url());
});
const check = (name, condition, detail) => {
  assert.ok(condition, `${name}: ${JSON.stringify(detail)}`);
  checks.push({ name, passed: true, detail });
};
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
};
try {
  check(
    "Original PNG is copied byte for byte",
    sourceHash === (await hash(new URL("../public/logo.png", import.meta.url))),
    { sha256: sourceHash },
  );
  check(
    "Production includes the identical PNG",
    sourceHash === (await hash(new URL("../dist/logo.png", import.meta.url))),
  );
  await load({ width: 1440, height: 1000 });
  check(
    "Original logo loads in header, hero, and footer",
    await page.evaluate(
      () =>
        [...document.images].length === 3 &&
        [...document.images].every(
          (img) => img.complete && img.naturalWidth === 800,
        ),
    ),
  );
  check(
    "Local display and body fonts load",
    await page.evaluate(
      () =>
        document.fonts.check('600 48px "Sakimu Display"') &&
        document.fonts.check('400 16px "Sakimu Text"'),
    ),
  );
  await shot("desktop-hero");
  await page.click(".hero-service-switch button:nth-child(2)");
  check(
    "Hero selection updates the live preview",
    (await page.$eval(".garden", (el) => el.dataset.service === "1")) &&
      (await page.$(".garden-preview .flow")) !== null,
  );
  check(
    "Hero selection synchronizes the service details",
    await page.$eval("#service-panel-1", (el) => !el.hidden),
  );
  await page.click(".orbit-tag.tag-2");
  check(
    "Satellite controls update the brand scene",
    (await page.$eval(".garden", (el) => el.dataset.service === "2")) &&
      (await page.$(".garden-preview .sora")) !== null,
  );
  const garden = await page.$eval(".garden", (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  await page.mouse.move(
    garden.x + garden.width * 0.8,
    garden.y + garden.height * 0.4,
  );
  check(
    "Pointer motion tilts the logo stage",
    await page.$eval(
      ".garden",
      (el) => parseFloat(el.style.getPropertyValue("--ry")) > 0,
    ),
  );
  await page.click(".hero-service-switch button:first-child");
  await sleep(350);
  await shot("desktop-hero-selected");

  await page.click(".work-filters button:nth-child(3)");
  check(
    "Project filtering shows the matching study",
    await page.$$eval(
      ".project-card",
      (els) => els.length === 1 && els[0].classList.contains("project-flow"),
    ),
  );
  await page.click(".project-flow .project-open");
  check(
    "Project opens an accessible modal",
    (await page.$eval("dialog", (el) => el.open && el.matches(":modal"))) &&
      (await page.$eval(".dialog-project-grid h2", (el) =>
        el.textContent.includes("FLOW"),
      )),
  );
  await shot("project-dialog");
  await page.click(".dialog-bottom button");
  check(
    "Project carousel changes the study",
    await page.$eval(".dialog-project-grid h2", (el) =>
      el.textContent.includes("SORA"),
    ),
  );
  await page.keyboard.press("Escape");
  check(
    "Escape closes the modal and restores focus",
    (await page.$eval("dialog", (el) => !el.open)) &&
      (await page.$eval(
        ".project-flow .project-open",
        (el) => el === document.activeElement,
      )),
  );
  await page.click(".work-filters button:first-child");
  check(
    "All projects can be restored",
    await page.$$eval(".project-card", (els) => els.length === 3),
  );
  await page.click(".project-mori .project-open");
  await page.click(".dialog-project-grid .button");
  await sleep(900);
  check(
    "Case CTA starts the matching project brief",
    (await page.$eval("dialog", (el) => !el.open)) &&
      (await page.$eval(".brief-kind label.selected", (el) =>
        el.textContent.includes("品牌網站"),
      )),
  );

  await page.click(".service-row:nth-child(2) .service-toggle");
  check(
    "Service accordion exposes the selected details",
    (await page.$eval("#service-panel-1", (el) => !el.hidden)) &&
      (await page.$eval("#service-panel-0", (el) => el.hidden)),
  );
  await page.click(".service-row:nth-child(2) .service-panel .text-link");
  await sleep(700);
  check(
    "Service CTA carries its intention into the brief",
    await page.$eval(".brief-kind label.selected", (el) =>
      el.textContent.includes("數位工具"),
    ),
  );
  await page.click(".process-step:nth-child(4) > button");
  check(
    "Process selection updates the project notes",
    (await page.$eval(".board-title h3", (el) =>
      el.textContent.includes("交到你手上"),
    )) &&
      (await page.$eval(".board-progress", (el) => el.style.width === "100%")),
  );
  await page.focus(".process-step:first-child > button");
  await page.keyboard.press("Enter");
  check(
    "Process controls work from the keyboard",
    await page.$eval(".board-title > span", (el) => el.textContent === "01"),
  );
  await page.click(".faq-item:nth-child(2) button");
  check(
    "FAQ opens with the correct accessible state",
    (await page.$eval(
      ".faq-item:nth-child(2) button",
      (el) => el.getAttribute("aria-expanded") === "true",
    )) && (await page.$eval("#faq-answer-1", (el) => !el.hidden)),
  );
  await page.click(".faq-item:nth-child(2) button");
  check(
    "FAQ can close again",
    await page.$eval("#faq-answer-1", (el) => el.hidden),
  );

  await page.click('.brief-form button[type="submit"]');
  check(
    "Empty brief uses native validation",
    (await page.$eval("#project-idea", (el) => el.validity.valueMissing)) &&
      (await page.$(".brief-result")) === null,
  );
  await page.type('input[autocomplete="name"]', "Lin");
  await page.select(".form-pair select", "兩至三個月內");
  const idea =
    "希望建立一個讓團隊整理專案進度與內容的網站工具，讓日常協作更清楚。";
  await page.type("#project-idea", idea);
  await page.click('.brief-form button[type="submit"]');
  check(
    "A valid brief creates an on-page result",
    (await page.$(".brief-result")) !== null &&
      (await page.$eval(
        ".brief-summary",
        (el) =>
          el.textContent.includes("數位工具") &&
          el.textContent.includes("兩至三個月內"),
      )),
  );
  const cdp = await page.createCDPSession();
  await cdp.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: downloads,
  });
  await page.click(".brief-result .button.primary");
  await sleep(500);
  const file = (await readdir(downloads)).find((name) => name.endsWith(".txt"));
  check("Project brief downloads a real file", Boolean(file));
  const downloaded = await readFile(`${downloads}/${file}`, "utf8");
  check(
    "Downloaded brief preserves the entered information",
    downloaded.includes(idea) &&
      downloaded.includes("Lin") &&
      downloaded.includes("數位工具") &&
      downloaded.includes("兩至三個月內"),
  );
  await browser
    .defaultBrowserContext()
    .overridePermissions(new URL(base).origin, [
      "clipboard-read",
      "clipboard-sanitized-write",
    ]);
  await page.bringToFront();
  await page.click(".result-actions button:first-child");
  await sleep(100);
  check(
    "Brief copy writes the generated content",
    await page
      .evaluate(() => navigator.clipboard.readText())
      .then((text) => text.includes(idea)),
    { status: await page.$eval(".copy-status", (el) => el.textContent) },
  );
  await shot("brief-result");
  await page.click(".result-actions button:last-child");
  check(
    "Brief editing preserves the draft",
    await page.$eval("#project-idea", (el, idea) => el.value === idea, idea),
  );

  await load({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.click(".menu-toggle");
  check(
    "Mobile navigation opens with focus in the menu",
    (await page.$eval(
      ".menu-toggle",
      (el) => el.getAttribute("aria-expanded") === "true",
    )) &&
      (await page.$eval(".site-nav a", (el) => el === document.activeElement)),
  );
  await page.keyboard.press("Escape");
  check(
    "Mobile Escape restores the menu button focus",
    await page.$eval(
      ".menu-toggle",
      (el) =>
        el.getAttribute("aria-expanded") === "false" &&
        el === document.activeElement,
    ),
  );
  await page.click(".menu-toggle");
  await page.click('.site-nav a[href="#process"]');
  await sleep(600);
  check(
    "Mobile navigation closes after selecting a section",
    await page.$eval(".site-nav", (el) => !el.classList.contains("open")),
  );

  for (const viewport of [
    { width: 320, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 844, height: 390 },
  ]) {
    await load(viewport);
    for (const id of [
      "top",
      "work",
      "services",
      "process",
      "questions",
      "start",
    ]) {
      await page.evaluate((id) => {
        const r = document.getElementById(id).getBoundingClientRect();
        window.scrollTo({ top: r.top + scrollY - 110, behavior: "instant" });
      }, id);
      const layout = await page.evaluate(
        ({ viewport, id }) => {
          const header = document
            .querySelector(".site-header")
            .getBoundingClientRect();
          const main = document.getElementById(id).getBoundingClientRect();
          const tabs = [
            ...document.querySelectorAll(".hero-service-switch button"),
          ].every((el) => el.scrollWidth <= el.clientWidth + 1);
          return {
            viewport,
            id,
            overflow: document.documentElement.scrollWidth > innerWidth,
            sectionInside: main.left >= -1 && main.right <= innerWidth + 1,
            headerInside: header.right <= innerWidth + 1,
            tabsFit: tabs,
            satelliteButtonsInside: [
              ...document.querySelectorAll(".orbit-tag"),
            ].every((el) => {
              const button = el.getBoundingClientRect(),
                scene = document
                  .querySelector(".garden")
                  .getBoundingClientRect();
              return (
                button.left >= scene.left - 1 &&
                button.right <= scene.right + 1 &&
                button.top >= scene.top - 1 &&
                button.bottom <= scene.bottom + 1
              );
            }),
          };
        },
        { viewport, id },
      );
      layouts.push(layout);
      check(
        `Layout ${viewport.width}×${viewport.height}, ${id}`,
        !layout.overflow &&
          layout.sectionInside &&
          layout.headerInside &&
          layout.tabsFit &&
          layout.satelliteButtonsInside,
        layout,
      );
    }
    if (viewport.width === 390) {
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await shot("mobile-hero");
      await page.screenshot({ path: `${out}mobile-full.png`, fullPage: true });
    }
  }
  await load({ width: 390, height: 844 }, true);
  const stage = await page.$eval(
    ".logo-platform",
    (el) => getComputedStyle(el).transform,
  );
  check("Reduced motion removes the pointer tilt", stage === "none");
  await page.click(".hero-service-switch button:nth-child(2)");
  check(
    "Reduced motion keeps the service switch usable",
    await page.$eval(".garden", (el) => el.dataset.service === "1"),
  );
  await shot("reduced-motion");
  check(
    "Original source file is unchanged",
    sourceHash === (await hash(source)),
  );
  check("Browser has no runtime errors", errors.length === 0, errors);
  check("Runtime resources stay local", external.length === 0, external);
  const report = {
    time: new Date().toISOString(),
    base,
    checks,
    layouts,
    sourceHash,
    errors,
    external,
  };
  await writeFile(out + "results.json", JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      {
        passed: checks.length,
        errors,
        external,
        sourceHash,
        report: out + "results.json",
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
