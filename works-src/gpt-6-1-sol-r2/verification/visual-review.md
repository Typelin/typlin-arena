# Visual verification

Project: `D:/Antigravity_proj/projects/personal-web/typlin-arena/works-src/gpt-6-1-sol-r2`

The first folder inventory found `gpt-6-1-sol`, so the isolated submission uses `gpt-6-1-sol-r2`. No other Arena project source was opened. All generated source, dependencies, build output, research and screenshots remain within this folder.

## First render and revisions

Inspected `initial/01-desktop-hero.png`, `initial/02-full-climax.png` and `initial/06-mobile-hero.png`, then inspected the context, limits and expanded interaction.

1. The sculpture's highlights were washed out and its floor shadow was too hard. Rebuilt the rim with a turned edge and fasteners, increased the rib cross section, changed physical light levels and added a soft contact-shadow surface. The final sculpture has visible metal depth, edge reflections and an orange core.
2. The original score dial was flat. Replaced the CSS tick diagram with 100 individually extruded, bevelled WebGL blades, a recessed central plate and scroll-responsive depth. Exactly 55 blades use the active material. The score, model setting and index version remain DOM text.

Further observed corrections: increased mobile paragraph/table sizes; kept all three document illustrations inside the mobile frame; removed the decorative coordinate from the mobile hero; made the professional-data details open by default; added a native horizontal-scrolling hint for the comparison table; reset now clears pointer rotation as well as spread. Expanded geometry scales with its spread so that its lower rim stays above the control panel on both viewports; the final expanded desktop and mobile screenshots were inspected after this correction.

## Final verification

Command: `npm run build`, followed by `npm run verify`.

The verification runner serves the actual production `dist` at `/works/gpt-6-1-sol-r2/` using a temporary local HTTP server and local Chrome via Playwright. The server shuts down after the run.

- 1440 × 900: document width 1440; no horizontal overflow; headings and lead paragraphs inside viewport.
- 390 × 844: document width 390; no horizontal overflow; headings and lead paragraphs inside viewport.
- Three WebGL canvases render. The local Space Grotesk font loads. No broken images.
- No browser console errors or uncaught page errors.
- No external network requests for fonts, code or rendering assets.
- Phase controls update the spread and selection; reset works; the range accepts keyboard input.
- Pointer dragging changes the rendered image with reduced motion enabled.
- The mobile comparison table scrolls within its own region.
- Reduced-motion mode preserves all six chapters and the interactive controls.

Machine-readable result: `final/results.json`.

Final screenshots inspected: `final/01-desktop-hero.png`, `final/02-full-climax.png`, `final/03-interactive-expanded.png`, `final/06-mobile-hero.png`, `final/07-mobile-context.png`, `final/08-mobile-climax.png`, `final/09-mobile-interaction.png`, `final/09b-mobile-expanded.png`, `final/10-mobile-limits.png`, `final/11a-mobile-specifications.png`, `final/11b-mobile-comparison.png`.

## Data boundaries

Research date: 2026-11-04. The subject identity follows the user's requested GPT-6.1 Sol. Benchmarks use Artificial Analysis Intelligence Index v5.0.1, GPT-6.1 Sol (Max), rather than older search snippets. Missing independent benchmark versions and missing official reasoning settings are explicitly marked. Raw capability-index values are preserved without estimating chart values or rounding. The sculpture is an authored visual, not an assertion about the model's internal architecture.
