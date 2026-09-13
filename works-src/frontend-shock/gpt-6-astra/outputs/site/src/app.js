import { STORAGE_KEY, STAGE_NAMES, initialState, transition, restore, fingerprint, clamp } from "./state.js";
import { normalizedPoint } from "./geometry.js";
import { LoomRenderer } from "./renderer.js";
import { proposalFor, approachOf, phaseDescriptions, scenarioFor } from "./narrative.js";
import { swapText, pulse, enterChapter, enterDialog, revealChoice } from "./flourish.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let storageAvailable = true;
let raw = null;
try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
let state = raw ? restore(raw) : initialState();
const motionMedia = matchMedia("(prefers-reduced-motion: reduce)");
const mobileMedia = matchMedia("(max-width: 820px)");
let reduced = motionMedia.matches;
let reverse = false;
let holdTimer = 0;
let pointer = null;
let lastMove = 0;
let toastTimer = 0;
let scrollFrame = 0;
let navigationTarget = null;
let navigationTimer = 0;
let renderedStage = -1;
const renderer = new LoomRenderer($("#loom"), reduced);
const app = $("#app");
const instrument = $("#instrument");
const chapters = $$("[data-chapter]");
const device = $(".device-column");

function notify(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => { $("#toast").hidden = true; }, 3800);
}
function save() {
  if (!storageAvailable) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
}
function dispatch(action, options = {}) {
  const previous = state;
  state = transition(state, action);
  if (state === previous) return;
  save(); render(options);
}
function setHtml(el, html) { if (el) el.innerHTML = html; }
function setText(el, text) { if (el) el.textContent = text; }
function syncStoryCopy() {
  const scenario = scenarioFor(state);
  const seed = $("#scenario-seed");
  if (seed) seed.innerHTML = scenario.seed.replace(/\n/g, "<br>");
  setText($("#scenario-choice"), scenario.choice);
  setText($("#scenario-doubt"), scenario.doubt);
  const quote = $("#scenario-quote");
  if (quote) quote.innerHTML = scenario.quote.replace(/\n/g, "<br>");
  setText($("#scenario-rethink"), scenario.rethink);
  const map = $("#revision-map");
  if (map) map.innerHTML = scenario.changes.map(([from, to]) => `<div><s>${from}</s><span>→</span><strong>${to}</strong></div>`).join("");
  setText($("#constraint-a"), scenario.constraints[0]);
  setText($("#constraint-b"), scenario.constraints[1]);
  for (const button of $$("[data-scenario]")) button.setAttribute("aria-pressed", String(button.dataset.scenario === state.scenario));
  const picker = $("#branch-picker");
  const options = $("#branch-options");
  const creative = approachOf(state) === "creative";
  if (picker) picker.hidden = !creative;
  if (options && creative) {
    options.innerHTML = scenario.routeNames.map((name, index) => `<button type="button" data-branch="${index}" aria-pressed="${state.branch === index}">${name}</button>`).join("");
    options.querySelectorAll("[data-branch]").forEach(button => button.addEventListener("click", () => {
      dispatch({ type: "BRANCH", value: Number(button.dataset.branch) });
      revealChoice(button);
    }));
  }
}
function render(options = {}) {
  const scenario = scenarioFor(state);
  const proposal = proposalFor(state, reverse);
  const currentApproach = approachOf(state);
  const mode = { clear: "清楚可行", balanced: "兼顧兩者", creative: "大膽新意" }[currentApproach];
  app.dataset.stage = state.stage;
  app.dataset.approach = currentApproach;
  app.dataset.scenario = state.scenario;
  syncStoryCopy();
  app.classList.toggle("backside", reverse);
  app.classList.toggle("reduced-motion", reduced);
  swapText($("#phase-description"), phaseDescriptions[state.stage]);
  swapText($("#stage-name"), STAGE_NAMES[state.stage]);
  $("#stage-code").textContent = String(state.stage + 1).padStart(2, "0");
  swapText($("#answer-label"), proposal.label);
  if ($("#answer-title").textContent !== proposal.title) pulse($(".answer-panel"));
  swapText($("#answer-title"), proposal.title);
  swapText($("#answer-detail"), proposal.detail);
  swapText($("#proposal-badge"), proposal.mode);
  $("#constraint-memory").hidden = !proposal.constrained;
  $("#scar-origin").textContent = state.scars.some(s => s.source === "gesture") ? "含你的介入" : "案例演示";
  $("#interaction-hint").textContent = state.stage === 2 ? (state.scars.length ? "裂縫已留下 · 往下看它如何改變答案" : "橫向劃開線束，把限制放進來") : state.stage >= 3 ? "← 改變提案方向 · 裂縫與條件仍然保留 →" : "← 收斂成一條路　／　展開三種提案 →";
  $("#route-status").textContent = state.stage >= 3 ? `${mode} · ${state.scars.length} 個條件已進入結構` : `${mode} · ${currentApproach === "creative" ? "三個不同提案" : currentApproach === "clear" ? "一條具體路徑" : "還可以再往左右探索"}`;
  $("#approach").value = Math.round(state.anchor.x * 100);
  $("#story-approach").value = Math.round(state.anchor.x * 100);
  $("#approach-value").textContent = mode;
  $("#trace-total").textContent = String(state.traces.length).padStart(2, "0");
  $("#trace-count").textContent = String(state.traces.length).padStart(2, "0");
  $("#cut-count").textContent = String(state.scars.length).padStart(2, "0");
  $("#form-id").textContent = fingerprint(state);
  $("#journey-summary").textContent = `這份織譜偏向「${mode}」。${state.branch >= 0 ? `你選了「${scenario.routeNames[state.branch]}」。` : ""}${state.scars.some(s => s.source === "gesture") ? "你親手帶入的反例" : `故事中的「${scenario.constraints.join("、")}」案例`}，改變了最後的提案與線束。`;
  $("#primary-action").innerHTML = state.stage === 4 ? "保存織譜 <span>↓</span>" : "繼續往下 <span>↓</span>";
  $("#counterexample-action").innerHTML = state.scars.length ? "再留下一個接點 <span>↗</span>" : "把這個限制放進答案 <span>↗</span>";
  $("#secondary-action").textContent = state.stage < 2 ? "換一個提案方向 ↔" : state.stage === 2 ? "親手加入這個反例 ↗" : state.alternate ? "回到原本的織法 ↺" : "看看另一種織法 ↗";
  $("#motion-toggle").setAttribute("aria-pressed", String(reduced));
  $("#motion-toggle span").textContent = reduced ? "減少" : "開";
  $("#reverse-label").hidden = !reverse;
  for (const button of $$("[data-direction]")) button.setAttribute("aria-pressed", String(button.dataset.direction === "wonder" ? currentApproach === "creative" : currentApproach === "clear"));
  for (const button of $$("[data-step]")) {
    if (Number(button.dataset.step) === state.stage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  renderer.reduced = reduced;
  renderer.update(state, { ...options, reverse });
  if (renderedStage !== state.stage) {
    enterChapter(chapters[state.stage], device);
    renderedStage = state.stage;
  }
  if (options.announce) $("#live-status").textContent = `第 ${state.stage + 1} 章，${STAGE_NAMES[state.stage]}。${proposal.title}`;
}
function focusOffset() {
  const header = $(".masthead").getBoundingClientRect().height;
  return mobileMedia.matches ? header + device.getBoundingClientRect().height + 30 : header + Math.min(170, innerHeight * .18);
}
function sectionTop(index) { return chapters[index].getBoundingClientRect().top + scrollY; }
function syncScroll() {
  scrollFrame = 0;
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  $("#reading-progress").style.transform = `scaleX(${clamp(scrollY / Math.max(1, scrollable))})`;
  if (navigationTarget !== null) return;
  const scan = scrollY + focusOffset();
  let stage = 0;
  for (let i = 0; i < chapters.length; i++) if (sectionTop(i) <= scan) stage = i;
  if (stage !== state.stage) {
    reverse = false;
    dispatch({ type: "STORY_STAGE", stage }, { announce: true });
  }
  if (stage === 2 && !state.scars.length && $("#counterexample-action").getBoundingClientRect().top < focusOffset() + 110) {
    dispatch({ type: "SCAR", x: .5, y: .5, angle: -.7, source: "example" });
  }
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll); }
function endNavigation() { navigationTarget = null; clearTimeout(navigationTimer); queueScroll(); }
function goTo(stage, instant = false) {
  clearTimeout(navigationTimer);
  navigationTarget = stage;
  reverse = false;
  dispatch({ type: "STORY_STAGE", stage }, { announce: true, immediate: instant });
  const landingOffset = mobileMedia.matches ? focusOffset() - 3 : $(".masthead").getBoundingClientRect().height + 18;
  const target = stage === 0 ? 0 : Math.max(0, sectionTop(stage) - landingOffset);
  window.scrollTo({ top: target, behavior: instant || reduced ? "instant" : "smooth" });
  navigationTimer = setTimeout(endNavigation, instant || reduced ? 80 : 1100);
}
window.addEventListener("scroll", queueScroll, { passive: true });
window.addEventListener("scrollend", () => { if (navigationTarget !== null) endNavigation(); }, { passive: true });
window.addEventListener("wheel", () => { if (navigationTarget !== null) endNavigation(); }, { passive: true });
window.addEventListener("touchstart", () => { if (navigationTarget !== null) endNavigation(); }, { passive: true });
window.addEventListener("resize", queueScroll, { passive: true });
new ResizeObserver(queueScroll).observe(device);
$$("[data-step]").forEach(button => button.addEventListener("click", () => goTo(Number(button.dataset.step))));
$$("a[href^='#story-']").forEach(link => link.addEventListener("click", event => { event.preventDefault(); goTo(Number(link.getAttribute("href").split("-")[1])); }));
$$("[data-direction]").forEach(button => button.addEventListener("click", () => {
  dispatch({ type: "DIRECTION", value: button.dataset.direction });
  revealChoice(button);
}));
$$("[data-scenario]").forEach(button => button.addEventListener("click", () => { reverse = false; dispatch({ type: "SCENARIO", value: button.dataset.scenario }, { immediate: true }); goTo(0, true); notify(`改為「${scenarioFor({ scenario: button.dataset.scenario }).name}」。一輪新的故事已開始。`); }));
$("#focus-read").addEventListener("click", () => {
  const on = !app.classList.contains("focus-read");
  app.classList.toggle("focus-read", on);
  $("#focus-read").setAttribute("aria-pressed", String(on));
  queueScroll();
});
for (const id of ["#approach", "#story-approach"]) $(id).addEventListener("input", event => dispatch({ type: "ANCHOR", x: Number(event.target.value) / 100, y: .5 }));
function addCounterexample() {
  if (state.stage !== 2) goTo(2);
  dispatch({ type: "SCAR", x: state.anchor.x, y: .5, angle: -.7, source: "gesture" });
  const scenario = scenarioFor(state);
  $("#live-status").textContent = `你的反例已進入結構。${scenario.constraints.join("、")}，會保留在接下來的提案裡。`;
}
$("#counterexample-action").addEventListener("click", addCounterexample);
$("#alternate-action").addEventListener("click", () => dispatch({ type: "ALTERNATE" }));
$("#secondary-action").addEventListener("click", () => {
  if (state.stage === 2) addCounterexample();
  else if (state.stage < 2) dispatch({ type: "DIRECTION", value: state.anchor.x > .5 ? "clarity" : "wonder" });
  else dispatch({ type: "ALTERNATE" });
});
function download() {
  renderer.update(state, { immediate: true });
  const content = renderer.export(state);
  const url = URL.createObjectURL(new Blob([content], { type: "image/svg+xml;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = `astra-encounter-${fingerprint(state)}.svg`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  notify("這次的織譜與提案，已交給瀏覽器下載。");
}
$("#primary-action").addEventListener("click", () => state.stage === 4 ? download() : goTo(state.stage + 1));
$("#save-final").addEventListener("click", download);
$("#reset").addEventListener("click", () => { reverse = false; dispatch({ type: "RESET" }, { immediate: true }); goTo(0, true); notify("從新的方向開始。上一輪的手勢不再保留。"); });
$("#motion-toggle").addEventListener("click", () => { reduced = !reduced; render({ immediate: true }); });
motionMedia.addEventListener("change", event => { reduced = event.matches; render({ immediate: true }); });
$("#about-open").addEventListener("click", () => {
  const dialog = $("#about-dialog");
  dialog.showModal();
  enterDialog(dialog);
});
for (const id of ["#about-close", "#about-start"]) $(id).addEventListener("click", () => $("#about-dialog").close());
function setReverse(value) {
  if (reverse === value) return;
  reverse = value;
  if (value && !state.reverseFound) { state = transition(state, { type: "DISCOVER" }); save(); }
  render();
}
instrument.addEventListener("pointerdown", event => {
  if (event.button !== 0 || pointer) return;
  instrument.focus({ preventScroll: true });
  const p = normalizedPoint(event, instrument);
  pointer = { id: event.pointerId, type: event.pointerType, start: p, last: p, moved: false, scarMade: false, held: false };
  if (event.pointerType !== "touch") instrument.setPointerCapture(event.pointerId);
  clearTimeout(holdTimer);
  if (Math.abs(p.x - .5) < .14 && Math.abs(p.y - .5) < .18) holdTimer = setTimeout(() => { if (pointer && !pointer.moved) { pointer.held = true; setReverse(true); } }, 650);
});
instrument.addEventListener("pointermove", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const p = normalizedPoint(event, instrument);
  const dx = p.x - pointer.start.x, dy = p.y - pointer.start.y;
  const distance = Math.hypot(dx, dy);
  if (distance > .012) { pointer.moved = true; clearTimeout(holdTimer); }
  if (pointer.held) return;
  if (pointer.type === "touch" && Math.abs(dy) > Math.abs(dx) * 1.3) return;
  if (performance.now() - lastMove < 42) return;
  lastMove = performance.now();
  if (state.stage === 2) {
    if (Math.abs(dx) > .06 && !pointer.scarMade) {
      dispatch({ type: "SCAR", x: (p.x + pointer.start.x) / 2, y: (p.y + pointer.start.y) / 2, angle: Math.atan2(dy, dx), source: "gesture" });
      pointer.scarMade = true;
    }
  } else dispatch({ type: "ANCHOR", x: p.x, y: .5 });
  pointer.last = p;
});
function pointerEnd(event) {
  if (!pointer || pointer.id !== event.pointerId) return;
  clearTimeout(holdTimer);
  const cancelled = event.type !== "pointerup";
  if (!cancelled && !pointer.held && state.stage !== 2) {
    const point = normalizedPoint(event, instrument);
    dispatch({ type: "ANCHOR", x: point.x, y: .5 });
  }
  pointer = null; setReverse(false);
  if (instrument.hasPointerCapture(event.pointerId)) instrument.releasePointerCapture(event.pointerId);
}
for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) instrument.addEventListener(name, pointerEnd);
instrument.addEventListener("keydown", event => {
  const step = event.shiftKey ? .18 : .08;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); dispatch({ type: "ANCHOR", x: state.anchor.x + (event.key === "ArrowRight" ? step : -step), y: .5 }); }
  else if (event.key.toLowerCase() === "x" && state.stage === 2) { event.preventDefault(); if (!event.repeat) addCounterexample(); }
  else if (event.code === "Space") { event.preventDefault(); if (!event.repeat) setReverse(true); }
  else if (event.key === "Escape") setReverse(false);
});
instrument.addEventListener("keyup", event => { if (event.code === "Space") { event.preventDefault(); setReverse(false); } });
instrument.addEventListener("blur", () => { clearTimeout(holdTimer); setReverse(false); });
window.addEventListener("blur", () => { clearTimeout(holdTimer); pointer = null; setReverse(false); });
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
render({ immediate: true });
requestAnimationFrame(() => {
  const hashIndex = /^#story-[0-4]$/.test(location.hash) ? Number(location.hash.slice(-1)) : null;
  goTo(hashIndex ?? state.stage, true);
});
