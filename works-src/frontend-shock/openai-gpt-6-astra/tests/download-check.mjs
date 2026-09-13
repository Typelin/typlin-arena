import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile, copyFile } from "node:fs/promises";
const root = fileURLToPath(new URL("../", import.meta.url));
const binary = process.env.AGENT_BROWSER_BIN || "C:/Users/Typelin_Station/.workbuddy-ai/binaries/node/workspace/node_modules/agent-browser/bin/agent-browser-win32-x64.exe";
function cli(...args) {
  const r = spawnSync(binary, ["--session", "astra", ...args], { encoding: "utf8", timeout: 15000 });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout);
  return r.stdout.trim();
}
const ws = new WebSocket(cli("get", "cdp-url"));
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
let expectedFile;
let complete;
let fail;
const done = new Promise((resolve, reject) => { complete = resolve; fail = reject; });
const timer = setTimeout(() => fail(new Error("Download completion timeout")), 15000);
ws.addEventListener("message", event => {
  const data = JSON.parse(event.data);
  if (data.id) { const p = pending.get(data.id); pending.delete(data.id); if (data.error) p?.reject(new Error(JSON.stringify(data.error))); else p?.resolve(data.result); }
  if (data.method === "Browser.downloadWillBegin") { expectedFile = data.params.suggestedFilename; console.log("Download initiated:", expectedFile); }
  if (data.method === "Browser.downloadProgress") {
    if (data.params.state === "completed") complete();
    if (data.params.state === "canceled") fail(new Error("CDP reports download canceled"));
  }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const current = ++id; pending.set(current, { resolve, reject }); ws.send(JSON.stringify({ id: current, method, params, sessionId })); });
try {
  const { targetInfos } = await send("Target.getTargets");
  const target = targetInfos.find(t => t.type === "page" && t.url !== "about:blank");
  if (!target) throw new Error("No active page");
  const { sessionId } = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
  await send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: path.join(root, "outputs"), eventsEnabled: true });
  await send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: path.join(root, "outputs") }, sessionId);
  if (JSON.parse(cli("eval", "document.querySelector('#app').dataset.stage")) !== "4") cli("eval", "document.querySelector('#reset').click(); for(let i=0;i<5;i++) document.querySelector('#primary-action').click()");
  const fingerprint = cli("get", "text", "#form-id");
  await send("Runtime.evaluate", { expression: "document.querySelector('#primary-action').click()", userGesture: true }, sessionId);
  await done;
  const source = path.join(root, "outputs", expectedFile);
  const content = await readFile(source, "utf8");
  if (!content.includes(fingerprint) || !content.includes("<metadata>") || content.includes("NaN")) throw new Error("Invalid exported SVG");
  await copyFile(source, path.join(root, "outputs", "sample-weave.svg"));
  console.log(`PASS actual Chrome download: ${expectedFile}, ${content.length} characters, fingerprint ${fingerprint}`);
} finally { clearTimeout(timer); ws.close(); }
