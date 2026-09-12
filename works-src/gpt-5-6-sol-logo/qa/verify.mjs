import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const artifacts = path.join(root, "qa-artifacts");
const url = process.env.PREVIEW_URL ?? "http://127.0.0.1:4178/";
const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

async function firstAvailableBrowser() {
  for (const candidate of browserCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Continue to the next installed browser candidate.
    }
  }
  throw new Error("No supported Chromium browser executable was found.");
}

function attachRuntimeCapture(page) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  return { pageErrors, consoleErrors };
}

async function inspectPage(browser, viewport, name, probeSource) {
  const page = await browser.newPage({ viewport });
  const runtime = attachRuntimeCapture(page);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate((captured) => {
    window.__frontendCraftRuntime = captured;
  }, runtime);

  const initial = await page.evaluate(() => ({
    title: document.title,
    viewport: { width: innerWidth, height: innerHeight },
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    logo: [...document.images].map((image) => ({
      alt: image.alt,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })),
  }));

  const beforeTitle = await page.locator("h1").innerText();
  await page.getByRole("button", { name: "換一種靈感" }).click();
  const afterTitle = await page.locator("h1").innerText();

  let menu = null;
  if (name === "mobile") {
    await page.getByRole("button", { name: "選單" }).click();
    await page.waitForTimeout(350);
    menu = await page.locator("#primary-navigation").evaluate((element) => ({
      className: element.className,
      height: Math.round(element.getBoundingClientRect().height),
      visibleLinks: [...element.querySelectorAll("a")].filter((link) => {
        const rect = link.getBoundingClientRect();
        return rect.width > 0 && rect.height >= 44;
      }).length,
    }));
    await page.getByRole("button", { name: "關閉" }).click();
  }

  const probe = await page.evaluate(`${probeSource}; __frontendCraftProbe()`);
  await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: false });
  await page.close();

  return {
    ...initial,
    beforeTitle,
    afterTitle,
    interactionChanged: beforeTitle !== afterTitle,
    menu,
    runtime,
    probe,
  };
}

await mkdir(artifacts, { recursive: true });
const executablePath = await firstAvailableBrowser();
const probeSource = await readFile(path.join(root, "qa", "frontend-craft-probe.js"), "utf8");
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const desktop = await inspectPage(browser, { width: 1440, height: 1000 }, "desktop", probeSource);
  const mobile = await inspectPage(browser, { width: 360, height: 800 }, "mobile", probeSource);
  const report = {
    checkedAt: new Date().toISOString(),
    url,
    browser: path.basename(executablePath),
    desktop,
    mobile,
  };

  await writeFile(path.join(artifacts, "verification.json"), JSON.stringify(report, null, 2), "utf8");

  const failures = [];
  for (const [name, result] of Object.entries({ desktop, mobile })) {
    if (result.scrollWidth > result.clientWidth) failures.push(`${name}: horizontal overflow`);
    if (!result.logo.every((image) => image.complete && image.naturalWidth === 800)) failures.push(`${name}: logo failed`);
    if (!result.interactionChanged) failures.push(`${name}: season interaction did not update`);
    if (result.runtime.pageErrors.length || result.runtime.consoleErrors.length) failures.push(`${name}: runtime errors`);
    if (result.probe.failures.length) failures.push(`${name}: frontend-craft probe failures`);
  }
  if (!mobile.menu?.className.includes("nav--open") || mobile.menu.visibleLinks !== 4) {
    failures.push("mobile: menu interaction failed");
  }

  const summary = {
    pass: failures.length === 0,
    failures,
    desktop: {
      viewport: desktop.viewport,
      overflowPx: desktop.scrollWidth - desktop.clientWidth,
      logoLoaded: desktop.logo.every((image) => image.naturalWidth === 800),
      consoleErrors: desktop.runtime.consoleErrors.length,
      pageErrors: desktop.runtime.pageErrors.length,
      probeFailures: desktop.probe.failures.length,
      probeWarnings: desktop.probe.warnings.length,
      probeQuality: desktop.probe.quality,
    },
    mobile: {
      viewport: mobile.viewport,
      overflowPx: mobile.scrollWidth - mobile.clientWidth,
      logoLoaded: mobile.logo.every((image) => image.naturalWidth === 800),
      menuLinks: mobile.menu?.visibleLinks,
      consoleErrors: mobile.runtime.consoleErrors.length,
      pageErrors: mobile.runtime.pageErrors.length,
      probeFailures: mobile.probe.failures.length,
      probeWarnings: mobile.probe.warnings.length,
      probeQuality: mobile.probe.quality,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
