const SPRING = { type: "spring", stiffness: 290, damping: 30, mass: 0.82 };
const SOFT_SPRING = { type: "spring", stiffness: 190, damping: 25, mass: 0.92 };
const EASE = [0.16, 1, 0.3, 1];
const running = new WeakMap();

function motionApi() {
  return globalThis.Motion || null;
}

function motionOff() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.querySelector(".app")?.classList.contains("reduced-motion");
}

function stopPrevious(el) {
  const previous = running.get(el);
  previous?.stop?.();
}

function run(el, keyframes, options = {}) {
  if (!el || motionOff()) return null;
  stopPrevious(el);
  const api = motionApi();
  if (api?.animate) {
    const controls = api.animate(el, keyframes, options);
    running.set(el, controls);
    return controls;
  }

  // Progressive fallback for direct file use if the vendored Motion runtime fails to load.
  const frames = [];
  const keys = Object.keys(keyframes);
  const length = Math.max(...keys.map(key => Array.isArray(keyframes[key]) ? keyframes[key].length : 1));
  for (let i = 0; i < length; i++) {
    const frame = {};
    for (const key of keys) {
      const value = keyframes[key];
      frame[key] = Array.isArray(value) ? value[Math.min(i, value.length - 1)] : value;
    }
    frames.push(frame);
  }
  return el.animate(frames, {
    duration: (options.duration ?? 0.5) * 1000,
    easing: "cubic-bezier(.16,1,.3,1)",
    fill: "both"
  });
}

export function swapText(el, next) {
  if (!el || el.textContent === next) return;
  el.textContent = next;
  run(el, {
    opacity: [0.12, 1],
    y: [-7, 0],
    filter: ["blur(2.5px)", "blur(0px)"]
  }, { duration: 0.42, ease: EASE });
}

export function pulse(el) {
  run(el, {
    scale: [0.993, 1.006, 1],
    boxShadow: [
      "0 0 0 rgba(68,43,139,0)",
      "0 18px 46px rgba(68,43,139,.10)",
      "0 8px 24px rgba(68,43,139,.045)"
    ]
  }, { duration: 0.58, ease: EASE });
}

export function enterChapter(chapter, device) {
  if (!chapter || motionOff()) return;
  const api = motionApi();
  const items = [...chapter.querySelectorAll(
    ".chapter-marker, .eyebrow, h1, h2, .lead, .body-copy, .scenario-picker, .question-seed, .meaning-control, .counterexample, .revision-map, .takeaway, .closing-note, .large-action, .inline-action"
  )].filter(el => !el.hidden);

  if (api?.animate && items.length) {
    api.animate(items, {
      opacity: [0, 1],
      y: [22, 0]
    }, {
      duration: 0.72,
      delay: api.stagger?.(0.038, { startDelay: 0.035 }) ?? 0,
      ease: EASE
    });
  }

  const instrument = device?.querySelector(".instrument");
  const panel = device?.querySelector(".answer-panel");
  if (instrument) run(instrument, { scale: [0.986, 1], opacity: [0.78, 1] }, SOFT_SPRING);
  if (panel) run(panel, { x: [10, 0], opacity: [0.65, 1] }, { duration: 0.62, ease: EASE });
}

export function revealChoice(el) {
  if (!el || motionOff()) return;
  run(el, { scale: [0.965, 1.015, 1], y: [4, 0] }, SPRING);
}

export function enterDialog(dialog) {
  if (!dialog || motionOff()) return;
  run(dialog, {
    opacity: [0, 1],
    scale: [0.975, 1],
    y: [14, 0]
  }, { duration: 0.5, ease: EASE });
}

export { SPRING };
