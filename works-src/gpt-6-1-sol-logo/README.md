# SAKIMU / 咲夢 — logo landing page

An independent React + TypeScript + Vite project. The original supplied logo is copied byte for byte to `public/logo.png` and used in the header, hero, footer, and favicon. The benchmark source is read only.

## Local development

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4612/`.

```powershell
npm run build
npm run preview
```

The standalone production output is in `dist/`; its relative asset base supports hosting from a subdirectory. Fonts and licenses are included locally. The site uses no external runtime services or API keys.

## Main interactions

- Service selection changes the brand scene, miniature interface, and service details.
- Pointer movement tilts the original-logo stage. Reduced-motion mode removes the tilt and animation.
- Concept projects support filtering, a native modal, next-project navigation, Escape/focus restoration, and contextual project-brief actions.
- The process selector updates a project-notes panel and its progress indicator.
- FAQ disclosure controls expose their accessible expanded states.
- The brief form validates the idea, preserves edits, generates a text download, and copies its generated content. It does not submit or collect user information.
- Mobile navigation supports section selection, keyboard focus, and Escape.

The portfolio entries are explicitly labeled concept studies. Each project preview is constructed from HTML, CSS, and SVG rather than external screenshots.

## Structure

| File | Responsibility |
| --- | --- |
| `src/App.tsx` | Sections, navigation, filtering, modal, process, and FAQ |
| `src/HeroGarden.tsx` | Logo scene and service selection |
| `src/Graphics.tsx` | Icons and three native project illustrations |
| `src/BriefForm.tsx` | Local brief validation, export, and clipboard action |
| `src/data.ts` | Service, project, and FAQ content |
| `src/style.css` | Responsive layout, typography, visual states, and motion preferences |

## Verification

With the development or production preview running:

```powershell
npm run verify
```

The verification runner uses local Google Chrome. Override `CHROME_PATH` or `PREVIEW_URL` if needed. It checks the original/copy/build PNG hashes, logo rendering, locally loaded fonts, actual interactions, form validation, download content, clipboard content, responsive layouts, reduced motion, console errors, and external requests.

Machine-readable results and screenshots are saved in `verification/`. Mobile checks use Chrome viewport/touch emulation, not physical devices. All project files, generated assets, dependencies, build output, and verification files stay inside this directory.
