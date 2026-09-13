import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const browser = process.env.AGENT_BROWSER_BIN || "C:/Users/Typelin_Station/.workbuddy-ai/binaries/node/workspace/node_modules/agent-browser/bin/agent-browser-win32-x64.exe";
const env = { ...process.env, PORT: "4177", PREVIEW_URL: "http://127.0.0.1:4177", AGENT_BROWSER_DOWNLOAD_PATH: path.join(root, "outputs"), PATH: path.dirname(process.execPath) + path.delimiter + process.env.PATH };
const log = createWriteStream(path.join(root, "outputs", "final-test.log"));
let server;
try {
  server = spawn(process.execPath, [path.join(root, "scripts", "serve.mjs"), "--production"], { env, stdio: ["ignore", "pipe", "pipe"] });
  await new Promise((resolve, reject) => {
    server.stdout.once("data", data => { process.stdout.write(data); resolve(); });
    server.once("error", reject);
    server.once("exit", code => reject(new Error(`Preview exited ${code}`)));
    server.stderr.on("data", data => process.stderr.write(data));
  });
  const child = spawn(process.execPath, [path.join(root, "tests", "browser-review.mjs"), "--final"], { env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", data => { process.stdout.write(data); log.write(data); });
  child.stderr.on("data", data => { process.stderr.write(data); log.write(data); });
  const code = await new Promise((resolve, reject) => { child.once("exit", resolve); child.once("error", reject); });
  if (code !== 0) process.exitCode = code || 1;
} finally {
  spawnSync(browser, ["--session", "astra", "close"], { encoding: "utf8", timeout: 15000, env });
  server?.kill();
  log.end();
}
