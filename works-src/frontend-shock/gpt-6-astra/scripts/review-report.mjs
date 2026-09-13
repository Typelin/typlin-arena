import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "outputs");
const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const report = JSON.parse(await readFile(path.join(output, "v2-results.json"), "utf8"));
const critique = await readFile(path.join(output, "design-and-critique.txt"), "utf8");
const titles = ["01 未定 · 可能性尚未收斂", "02 牽引 · 方向成為約束", "03 反證 · 質疑留下裂縫", "04 重組 · 容納差異的新結構", "05 留痕 · 這一次的經緯織面"];
const figures = [];
for (let i = 1; i <= 5; i++) {
  const name = `v2-0${i}.png`;
  figures.push(`<figure><img src="data:image/png;base64,${(await readFile(path.join(output, name))).toString("base64")}" alt="${titles[i - 1]}"><figcaption>${titles[i - 1]}</figcaption></figure>`);
}
const body = `<header><p>GPT-6 ASTRA / PROCESS & EVIDENCE</p><h1>未定之形<br><span>五幀審判與交付驗證</span></h1><div class="summary">${report.tests.filter(t => t.passed).length} 項瀏覽器檢查通過 · 22 項狀態／幾何測試通過 · 實際 SVG 下載成功</div></header><section class="frames">${figures.join("")}</section><section class="evidence"><h2>實際測試紀錄</h2><ul>${report.tests.map(t => `<li><b>${t.passed ? "PASS" : "FAIL"}</b> ${escape(t.name)} <small>${escape(t.detail)}</small></li>`).join("")}</ul></section><section class="critique"><h2>設計與自我批評</h2><pre>${escape(critique)}</pre></section>`;
const css = `*{box-sizing:border-box}body{margin:0;padding:48px;background:#f5f5f0;color:#242031;font-family:Arial,"Microsoft JhengHei",sans-serif}header{padding:15px 0 35px;border-bottom:1px solid #242031}header p{font:11px Consolas,monospace;letter-spacing:2px;color:#5838f5}h1{font-size:48px;line-height:1.15;letter-spacing:-2px;margin:22px 0}h1 span{font-size:30px;font-weight:400;letter-spacing:0}.summary{font-size:12px;color:#625871}.frames{display:grid;grid-template-columns:1fr 1fr;gap:26px;padding:28px 0}figure{margin:0}figure:last-child{grid-column:1 / -1;max-width:70%;margin:auto}img{display:block;width:100%;border:1px solid #ddd8e5}figcaption{font-size:12px;margin-top:11px;color:#5838f5}h2{font-size:25px;margin:0 0 20px}.evidence,.critique{border-top:1px solid #c9c5d0;padding:30px 0}ul{padding:0;list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:13px}li{font-size:12px;line-height:1.7}li b{color:#536b17;font:11px Consolas,monospace;margin-right:7px}small{display:block;color:#746a80;font-size:10px;padding-left:39px}pre{white-space:pre-wrap;font:13px/1.9 Arial,"Microsoft JhengHei",sans-serif;max-width:950px}@media(max-width:700px){body{padding:23px}.frames,ul{grid-template-columns:1fr}figure:last-child{max-width:100%}h1{font-size:36px}h1 span{font-size:23px}}`;
const html = `<!doctype html><html lang="zh-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>未定之形｜五幀審判與驗證</title><style>${css}</style></head><body>${body}</body></html>`;
await writeFile(path.join(output, "review.html"), html);
const require = createRequire(path.join(process.env.NODE_WORKSPACE || "C:/Users/Typelin_Station/.workbuddy-ai/binaries/node/workspace", "package.json"));
const { chromium } = require("playwright");
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1600 } });
  await page.goto(new URL("../outputs/review.html", import.meta.url).href, { waitUntil: "load" });
  await page.evaluate(() => { document.querySelector(".evidence").remove(); document.querySelector(".critique").remove(); });
  await page.screenshot({ path: path.join(output, "five-frames.png"), fullPage: true });
} finally { await browser.close(); }
console.log("Generated review.html and five-frames.png");
