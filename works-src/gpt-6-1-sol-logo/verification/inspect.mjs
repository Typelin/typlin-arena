import puppeteer from "puppeteer-core";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const out = fileURLToPath(new URL("./", import.meta.url));
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--no-first-run"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
const results = [];
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
    { width: 375, height: 667 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewport(viewport);
    await page.goto("http://127.0.0.1:4612/", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}${viewport.width}-hero.png` });
    for (const id of ["work", "services", "process", "questions", "start"]) {
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY - 110,
          behavior: "instant",
        });
      }, id);
      await new Promise((r) => setTimeout(r, 200));
      await page.screenshot({ path: `${out}${viewport.width}-${id}.png` });
    }
    results.push(
      await page.evaluate(
        (viewport) => ({
          viewport,
          overflow: document.documentElement.scrollWidth > innerWidth,
          images: [...document.images].map((i) => ({
            src: i.getAttribute("src"),
            loaded: i.complete && i.naturalWidth > 0,
            width: i.naturalWidth,
          })),
          fonts: [...document.fonts].map((f) => ({
            family: f.family,
            status: f.status,
          })),
          overflowing: [...document.querySelectorAll("main *")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.width > 0 &&
                (r.right > innerWidth + 2 || r.left < -2) &&
                getComputedStyle(el).position !== "absolute" &&
                getComputedStyle(el).position !== "fixed"
              );
            })
            .map((el) => el.className)
            .slice(0, 12),
        }),
        viewport,
      ),
    );
  }
  await writeFile(
    out + "inspection.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
}
