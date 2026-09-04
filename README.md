# TYPELIN ARENA

[正體中文版](README.zh-TW.md)

> Same prompt. Different souls. — One prompt, six models, zero wallpaper.

**TYPELIN ARENA** is a live exhibition hall for same-prompt AI frontend showdowns.
Every entry is built from the identical brief (*"a frontend piece about yourself"*),
playable in-page, ranked by a human judge against one standard:
**if it can't be touched by hand, it doesn't get framed.**

🌐 Live: **https://arena.typelin.me**

![Opus 4.6 — 流動思考](public/shots/opus.png)

## Entries & Scores

| Rank | Work | Model | Score | Live |
| --- | --- | --- | --- | --- |
| 1 | 流動思考 | Claude Opus 4.6 | **88** | [/works/opus/](https://arena.typelin.me/works/opus/) |
| 2 | 自畫像 № 27B | Qwen 3.8-27B（本地） | **85** | [/works/qw27/](https://arena.typelin.me/works/qw27/) |
| 3 | 注意力場 Attention Field | Qwen 3.8 Flash | **81** | [/works/qwen/](https://arena.typelin.me/works/qwen/) |
| 4 | 三層描圖紙 | Muse Spark 1.3 | **75** | [/works/spark/](https://arena.typelin.me/works/spark/) |
| 5 | Resonance Chamber | GLM 5.3 Flash | **69** | [/works/glm/](https://arena.typelin.me/works/glm/) |
| 6 | The Refraction Chamber | Gemini 3.8 Flash High | **61** | [/works/gemini/](https://arena.typelin.me/works/gemini/) |

Written reviews are pending — scores first, venom later.

## Judging Criteria

No fake precision: five named dimensions, numbers only where the judge has spoken.

1. **Creative aesthetics** — independent concept, deliberate choices, no template smell.
2. **Architectural execution** — solid engineering, maintainable structure, real degradation paths.
3. **Instruction compliance** — did it do what the brief asked, or freestyle into the night.
4. **Wit of language** — copy with a brain, venom with aim.
5. **Crash resistance** — survives a new brief and a new apparatus.

## Tech Stack

* **Shell:** React 19 + TypeScript + Vite, zero runtime dependencies.
* **Entries:** independent Vite + React builds (Canvas 2D, WebAudio, Tailwind, Three.js-free since v2),
  each rebuilt with a `base` of `/works/<id>/` and served as static subpages.
* **Thumbnails:** captured headless with local Chrome (`scripts/shots.mjs`) — real frames, no mockups.
* **Hosting:** Cloudflare Pages (Git-connected auto deploy).

## Project Structure

```
typlin-arena/
├── src/                  # arena shell (rank, duel, criteria, dossier)
│   ├── App.tsx
│   ├── data.ts           # ← scores & entries live here
│   └── index.css         # paper editorial system
├── public/
│   ├── works/            # built entries (one URL each, see below)
│   ├── shots/            # real captured thumbnails
│   ├── logo.svg / favicon.svg
├── works-src/            # entry sources (opus / spark / gemini / qwen)
├── scripts/
│   ├── sync-works.ps1    # rebuild + re-copy all entries in one go
│   └── shots.mjs         # headless thumbnail capture
```

## Local Development

Requirements: Node.js 20+.

```powershell
npm install
npm run dev -- --port 5176 --strictPort   # http://localhost:5176/
npm run build                             # production build (tsc + vite)
```

Subpages are served under `/works/<id>/` in both dev (via a dev-only index
middleware in `vite.config.ts`) and production.

## Updating an Entry

When a model ships a new version:

```powershell
.\scripts\sync-works.ps1   # rebuild all entries from works-src/ into public/works/
node scripts\shots.mjs     # re-capture thumbnails (needs local Chrome + preview server)
```

Scores and copy live in `src/data.ts` — edit, build, push. Pages deploys `main`
automatically to https://arena.typelin.me.

## Roadmap

* [x] GLM 5.3 entry (slot 05)
* [ ] Written venom reviews (評語) per entry
* [ ] Per-entry share cards / OG images

## License

No license chosen yet — all rights reserved by default.
