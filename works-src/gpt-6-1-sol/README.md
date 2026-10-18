# BETWEEN / 之間 — GPT–6.1 Sol

A self-contained interactive portrait built with React, TypeScript, Vite, and Canvas 2D. All source, dependencies, generated assets, and verification output live in this directory. No Arena integration or root application changes are required.

## Run

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4611/`.

```powershell
npm run build
npm run preview
```

`dist/` is the standalone production output. Vite uses a relative base, so the output can be served from a subdirectory. Both fonts and their OFL licenses are included in `public/fonts/`. No runtime network services, API keys, audio, or analytics are used.

## Experience

One parametric textile persists across four scroll-controlled states: listening, exploration, collaboration, and an open-ended conclusion. Intention modifies its phase and curvature; tension modifies its width and pleating. The third state opens the original loop into a continuous woven span. The final state retains an opening rather than closing into a finished ring.

- Choose one of three intentions and adjust the tension slider.
- Drag the sculpture horizontally to rotate it. Arrow keys provide the equivalent operation.
- Hold the sculpture, hold Space while it is focused, or select the inspection control to reveal its individual threads.
- Chapter controls let visitors navigate without scrolling through the entire sequence.
- The final chapter exports a self-contained SVG generated from the current intention, tension, and orientation.
- Ambient motion has a pause control. Reduced-motion mode uses immediate input feedback and static chapter compositions.

## Implementation

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Chapter state, semantic controls, dialog, navigation, and export action |
| `src/Instrument.tsx` | Canvas renderer, bounded animation loop, damped rotation, pointer and keyboard input |
| `src/geometry.ts` | Parametric surface, projection, depth ordering, adaptive framing, and SVG generation |
| `src/style.css` | Typography, visual states, responsive layout, and motion preferences |

The renderer fits the actual projected mesh bounds into a reserved viewing field. It uses a capped device-pixel ratio, 60 fps desktop / 30 fps narrow-screen rendering targets, lower mobile geometry density, and no rendering while the page is hidden. Paused and reduced-motion scenes redraw only when input or layout changes. Canvas 2D avoids a WebGL dependency.

## Review and revision

The first rendered version exposed oversized geometry, overlapping captions, and a minimum-height problem on short phones. The revision changed the framing algorithm rather than shrinking the artwork with a fixed CSS transform. It also recomposed the collaboration chapter into two text anchors and a horizontal textile, made inspection remove the opaque surface to expose individual threads, and introduced dedicated short-screen and landscape layouts.

Further interaction checks fixed a reduced-motion invalidation edge case, ensured modal focus restoration and background scroll locking, and gave the skip link a focus-only action that preserves chapter progress. Chapter text uses a clipped horizontal opening; the main motion comes from the persistent mesh, not element reveals.

## Verification

The layout uses flowing chapter copy and footer notes, with the instrument hint and controls in one grid column. The canvas measures its reserved field so larger text can reflow without entering the sculpture. Portrait mobile layouts use content-sized grid rows. Run `node verification/readability.mjs` against the local preview to check text separation and control readability across wide, short, tablet, and phone viewports. Its report and screenshots are saved in `verification/readability/`.

Start the development or production preview server, then run:

```powershell
npm run verify
```

The runner uses the locally installed Google Chrome. Set `CHROME_PATH` if the executable is elsewhere. `PREVIEW_URL` can point at another local preview URL.

The checks cover real pointer dragging, long press, keyboard controls, pause stability, intention-dependent geometry, native slider input, modal/Escape behavior, chapter continuity, touch selection, SVG download and rendering, reduced-motion stability, local-only asset requests, browser errors, and responsive control reachability across portrait, landscape, tablet, and desktop viewports.

- Machine-readable results: `verification/results.json`
- Desktop: `verification/desktop.png`
- Collaboration state: `verification/desktop-weave.png`
- Thread inspection: `verification/unwoven.png`
- Mobile: `verification/mobile.png`
- Short phone: `verification/mobile-compact-final.png`
- Landscape: `verification/mobile-landscape.png`
- Reduced motion: `verification/reduced-motion.png`
- Export rendering: `verification/saved-artwork.png`

Performance results in the report describe a three-second sample on the verification machine; they are not a claim about every device. Mobile screenshots and touch tests use Chrome's viewport and touch emulation, not physical-device testing.
