import { mkdir, readdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "outputs", "site");
await mkdir(path.join(output, "src"), { recursive: true });
const files = ["index.html", ...(await readdir(path.join(root, "src"))).map(f => `src/${f}`)];
const manifest = {};
for (const relative of files) {
  const source = path.join(root, relative);
  if (relative.endsWith(".js")) {
    const result = spawnSync(process.execPath, ["--check", source], { encoding: "utf8" });
    if (result.status !== 0) throw new Error(result.stderr || `Syntax error: ${relative}`);
  }
  const data = await readFile(source);
  if (/\.(html|js|css)$/.test(relative) && /https?:\/\//.test(data.toString().replaceAll("http://www.w3.org/2000/svg", ""))) throw new Error(`Unexpected remote dependency in ${relative}`);
  await copyFile(source, path.join(output, relative));
  manifest[relative] = { bytes: data.length, sha256: createHash("sha256").update(data).digest("hex") };
}
await writeFile(path.join(output, "build-manifest.json"), JSON.stringify(manifest, null, 2));
const sources = await Promise.all(["state.js", "geometry.js", "renderer.js", "app.js"].map(name => readFile(path.join(root, "src", name), "utf8")));
const bundle = sources.map(source => source.replace(/^import .+;\r?\n/gm, "").replace(/^export /gm, "")).join("\n\n");
const css = await readFile(path.join(root, "src", "style.css"), "utf8");
const icon = await readFile(path.join(root, "src", "icon.svg"), "utf8");
const html = (await readFile(path.join(root, "index.html"), "utf8"))
  .replace('<link rel="stylesheet" href="./src/style.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="./src/app.js"></script>', () => `<script type="module">${bundle}</script>`)
  .replace('href="./src/icon.svg"', () => `href="data:image/svg+xml,${encodeURIComponent(icon)}"`);
await writeFile(path.join(root, "outputs", "unfinished-form.html"), html);
console.log(`Portable HTML complete: ${Buffer.byteLength(html)} bytes; no server or dependencies required.`);
console.log(`Production build complete: ${files.length} files / ${Object.values(manifest).reduce((s, f) => s + f.bytes, 0)} bytes`);
console.log(output);
