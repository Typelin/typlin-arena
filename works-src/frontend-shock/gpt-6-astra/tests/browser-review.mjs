import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFileSync, readFileSync } from "node:fs";

const root = fileURLToPath(new URL("../", import.meta.url));
const browser = process.env.AGENT_BROWSER_BIN || "C:/Users/Typelin_Station/.workbuddy-ai/binaries/node/workspace/node_modules/agent-browser/bin/agent-browser-win32-x64.exe";
const prefix = process.argv.includes("--final") ? "final" : "v1";
const results = [];
function run(...args) {
  const result = spawnSync(browser, ["--session", "astra", ...args], { encoding: "utf8", timeout: 40000, env: { ...process.env, PATH: path.dirname(process.execPath) + path.delimiter + process.env.PATH } });
  if (result.status !== 0) throw new Error(`${args.join(" ")}: ${result.stderr || result.stdout || result.error}`);
  return result.stdout.trim();
}
function check(label, expression) {
  const output = run("eval", `JSON.stringify(${expression})`);
  if (output === "false" || output === '"false"' || output.includes("Error")) throw new Error(`${label}: ${output}`);
  results.push({ label, result: output });
  console.log(`PASS ${label}: ${output.slice(0, 220)}`);
}
const wait = () => run("wait", "2500");
const shot = (name, full = false) => run("screenshot", path.join(root, "outputs", `${prefix}-${name}.png`), ...(full ? ["--full"] : []));
run("--download-path", path.join(root, "outputs"), "--executable-path", "C:/Program Files/Google/Chrome/Application/chrome.exe", "open", process.env.PREVIEW_URL || "http://127.0.0.1:4173");
run("set", "viewport", "1440", "1000");
run("click", "#reset");
run("wait", "3900");
check("entry", "document.querySelector('#app').dataset.stage === '0'");
shot("01");
run("click", "#primary-action");
run("focus", "#instrument");
run("press", "ArrowUp"); run("press", "ArrowRight");
wait(); check("keyboard leaves a trace", "JSON.parse(localStorage.getItem('astra-unfinished-form-v1')).traces.length >= 3");
shot("02");
run("click", "#primary-action"); wait();
check("fracture waits for deliberate input", "JSON.parse(localStorage.getItem('astra-unfinished-form-v1')).scars.length === 0");
run("focus", "#instrument"); run("press", "x"); wait();
run("focus", "#primary-action"); shot("03");
check("counterexample changes state", "JSON.parse(localStorage.getItem('astra-unfinished-form-v1')).scars.length === 1");
run("click", "#primary-action"); wait(); shot("04");
run("click", "#primary-action"); wait(); shot("05");
check("complete journey", "document.querySelector('#app').dataset.stage === '4'");
const id = run("get", "text", "#form-id");
run("reload");
check("refresh restores completion", "document.querySelector('#app').dataset.stage === '4'");
if (run("get", "text", "#form-id") !== id) throw new Error("Fingerprint changed after refresh");
results.push({ label: "refresh retains fingerprint", result: id });
try {
  run("download", "#primary-action", path.join(root, "outputs", "sample-weave.svg"));
  const downloaded = readFileSync(path.join(root, "outputs", "sample-weave.svg"), "utf8");
  if (!downloaded.includes("<metadata>") || !downloaded.includes(id) || downloaded.includes("NaN")) throw new Error("Invalid exported weave");
  results.push({ label: "SVG download preserves fingerprint and state", result: id, passed: true });
  console.log(`PASS SVG download: ${id}`);
} catch (error) {
  results.push({ label: "SVG download", result: error.message, passed: false });
  console.error(`FAIL SVG download: ${error.message}`);
}
run("focus", "#instrument"); run("press", "Space");
check("hidden layer discoverable by keyboard", "JSON.parse(localStorage.getItem('astra-unfinished-form-v1')).reverseFound === true");
run("set", "viewport", "390", "844"); run("click", "#reset"); run("wait", "3900"); shot("mobile", true);
check("mobile no horizontal overflow", "document.documentElement.scrollWidth <= innerWidth");
run("set", "viewport", "1280", "600"); shot("short", true);
check("short viewport controls accessible", "document.querySelector('#primary-action').getBoundingClientRect().height >= 44");
run("set", "media", "light", "reduced-motion");
run("reload");
check("reduced motion uses complete static states", "document.querySelector('#app').classList.contains('reduced-motion')");
for (let i = 0; i < 5; i++) run("click", "#primary-action");
check("reduced motion journey reaches completion", "document.querySelector('#app').dataset.stage === '4'");
shot("reduced", true);
run("set", "viewport", "360", "740");
check("narrow completion layout fits", "document.documentElement.scrollWidth <= innerWidth");
shot("mobile-final", true);
run("set", "media", "light");
run("open", new URL("../outputs/unfinished-form.html", import.meta.url).href);
check("portable HTML runs without a server", "document.querySelectorAll('#threads path').length === 96");
run("click", "#reset");
run("focus", "#instrument"); run("press", "ArrowLeft");
check("portable HTML interaction", "Number(document.querySelector('#trace-total').textContent) === 1");
run("click", "#about-open");
check("help dialog works", "document.querySelector('#about-dialog').open === true");
run("press", "Escape");
check("dialog closes with Escape", "document.querySelector('#about-dialog').open === false");
const pageErrors = run("errors");
if (pageErrors && !pageErrors.includes("No errors")) throw new Error(`Browser errors: ${pageErrors}`);
results.push({ label: "console", result: run("console") });
results.push({ label: "page errors", result: pageErrors || "none" });
writeFileSync(path.join(root, "outputs", `${prefix}-browser-results.json`), JSON.stringify(results, null, 2));
console.log(`Saved ${prefix} review frames and results.`);
if (results.some(result => result.passed === false)) process.exitCode = 1;
