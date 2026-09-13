import { STORAGE_KEY, STAGE_NAMES, initialState, transition, restore, fingerprint } from "./state.js";
import { normalizedPoint } from "./geometry.js";
import { LoomRenderer } from "./renderer.js";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const copy = [
  { eyebrow: "AN UNFINISHED FORM", headline: "答案，<br>還不是<span class=\"outline-word\">答案。</span>", intro: "我不是一個裝滿答案的容器。<br>我是可能性與你的選擇，交會的地方。", caption: "把一個方向交給我。<br>看看它，會長成什麼。", hint: "拖曳線束，改變可能性", device: "等待一個方向", instruction: "不必知道答案。<br>先選擇你願意往哪裡走。", action: "讓它開始成形", secondary: "先看看，我如何運作" },
  { eyebrow: "01 / AN INTENTION TAKES SHAPE", headline: "你的方向，<br>我的<span class=\"outline-word\">張力。</span>", intro: "限制不是創造的反面。<br>它讓無限的可能，第一次有了形狀。", caption: "向上拉，或偏離中心。<br>我的結構，會記得你的手。", hint: "拖曳中心，牽引線束", device: "正在收斂 / 保留偏移", instruction: "拖曳，留下至少一次介入。<br>也可以用方向鍵改變走向。", action: "但，這真的成立嗎？", secondary: "換一個探索方向" },
  { eyebrow: "02 / DOUBT IS PART OF THE WORK", headline: "漂亮。<br>然後<span class=\"outline-word\">呢？</span>", intro: "一個看起來成立的答案，<br>也值得被認真地懷疑。", caption: "劃過線束，提出一個反例。<br>我不會把裂縫藏起來。", hint: "劃開結構 / 或在此按 X", device: "等待反例 / 不急著確定", instruction: "在裝置上劃出一道裂縫。<br>或按下按鈕，提出反例。", action: "提出一個反例", secondary: "再看一次，裂開之前" },
  { eyebrow: "03 / A DIFFERENT KIND OF TOGETHER", headline: "不是修復。<br>是重新<span class=\"outline-word\">理解。</span>", intro: "我保留你的方向，也保留那個反例。<br>新的答案，必須容得下兩者。", caption: "紫色是我的提議，綠色是你的介入。<br>我們不必抹平彼此的差異。", hint: "拖曳，調整兩種力量的交會", device: "跨越裂縫 / 重新編織", instruction: "調整意外程度，試試另一種平衡。<br>每道裂縫，都已成為接點。", action: "留下這一次的形狀", secondary: "試試另一種織法" },
  { eyebrow: "04 / THIS FORM BELONGS TO THIS ENCOUNTER", headline: "這不是我。<br>是這一次<span class=\"outline-word\">我們。</span>", intro: "同一座裝置，不同的人，會留下不同的織譜。<br>答案可以帶走，可能性不必結束。", caption: "你留下的偏移、猶豫與反例，<br>都還在這裡。", hint: "你的織譜 / 可以保存，也可以再改寫", device: "已展開 / 仍可改寫", instruction: "保存的是你親手形成的 SVG 織譜。<br>不是預先準備好的紀念品。", action: "保存這份織譜", secondary: "帶著記憶，重新編織" }
];

let storageAvailable = true;
let raw = null;
try { raw = localStorage.getItem(STORAGE_KEY); } catch { storageAvailable = false; }
let state = raw ? restore(raw) : initialState();
const motionMedia = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = motionMedia.matches;
let reverse = false;
let holdTimer = 0;
let pointer = null;
let lastMove = 0;
let toastTimer = 0;
const renderer = new LoomRenderer($("#loom"), reduced);
const app = $("#app");
const instrument = $("#instrument");

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
function dispatch(action, options) {
  const previous = state;
  state = transition(state, action);
  if (state === previous) return;
  save();
  render(options);
}
function render(options = {}) {
  const c = copy[state.stage];
  app.dataset.stage = state.stage;
  app.classList.toggle("backside", reverse);
  app.classList.toggle("reduced-motion", reduced);
  $("#eyebrow").textContent = c.eyebrow;
  $("#headline").innerHTML = c.headline;
  $("#intro").innerHTML = c.intro;
  $("#caption").innerHTML = c.caption;
  $("#interaction-hint").textContent = c.hint;
  $("#device-state").textContent = c.device;
  $("#instruction").innerHTML = c.instruction;
  $("#stage-name").textContent = STAGE_NAMES[state.stage];
  $("#stage-code").textContent = String(state.stage + 1).padStart(3, "0");
  $("#stage-number").textContent = String(state.stage + 1).padStart(2, "0");
  $("#action-label").textContent = state.stage === 2 && state.scars.length ? "帶著裂縫，重新編織" : c.action;
  $("#secondary-action").innerHTML = `${c.secondary} <span aria-hidden="true">↗</span>`;
  $("#tension").value = Math.round(state.tension * 100);
  $("#tension-value").textContent = `${Math.round(state.tension * 100)}%`;
  $("#coordinate-value").textContent = `X ${state.anchor.x.toFixed(2)} / Y ${state.anchor.y.toFixed(2)}`;
  $("#trace-total").textContent = String(state.traces.length).padStart(2, "0");
  $("#direction-options").hidden = state.stage !== 0;
  $("#final-stats").hidden = state.stage !== 4;
  $("#trace-count").textContent = String(state.traces.length).padStart(2, "0");
  $("#cut-count").textContent = String(state.scars.length).padStart(2, "0");
  $("#form-id").textContent = fingerprint(state);
  $("#motion-toggle").setAttribute("aria-pressed", String(reduced));
  $("#motion-toggle span").textContent = reduced ? "減少" : "開";
  $("#reverse-label").hidden = !reverse;
  for (const button of $$("[data-direction]")) {
    const active = button.dataset.direction === state.direction;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  for (const button of $$("[data-step]")) {
    const n = Number(button.dataset.step);
    button.disabled = n > state.reached;
    button.classList.toggle("current", n === state.stage);
    if (n === state.stage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  renderer.reduced = reduced;
  renderer.update(state, { ...options, reverse });
  if (options.announce) $("#live-status").textContent = `${state.stage + 1} / 5：${STAGE_NAMES[state.stage]}。${c.hint}`;
}

function download() {
  renderer.update(state, { immediate: true });
  const content = renderer.export(state);
  const url = URL.createObjectURL(new Blob([content], { type: "image/svg+xml;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = `astra-form-${fingerprint(state)}.svg`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  notify("織譜已交給瀏覽器下載。它保留了這次操作的完整形狀。");
}
function next() {
  if (state.stage === 4) { download(); return; }
  if (state.stage === 2 && !state.scars.length) {
    dispatch({ type: "SCAR", x: state.anchor.x, y: state.anchor.y, angle: -.7 });
    notify("反例已留下裂縫。接下來，不是復原，而是重新編織。");
    return;
  }
  if (state.stage === 0 && !state.traces.length) dispatch({ type: "ANCHOR", x: state.anchor.x, y: state.anchor.y });
  dispatch({ type: "NEXT" }, { announce: true });
}
$("#primary-action").addEventListener("click", next);
$$("[data-direction]").forEach(button => button.addEventListener("click", () => dispatch({ type: "DIRECTION", value: button.dataset.direction })));
$$("[data-step]").forEach(button => button.addEventListener("click", () => dispatch({ type: "VISIT", stage: Number(button.dataset.step) }, { announce: true })));
$("#tension").addEventListener("input", event => dispatch({ type: "TENSION", value: Number(event.target.value) / 100 }));
$("#secondary-action").addEventListener("click", () => {
  if (state.stage === 0) $("#about-dialog").showModal();
  else if (state.stage === 1) dispatch({ type: "DIRECTION", value: state.direction === "clarity" ? "wonder" : "clarity" });
  else if (state.stage === 2) dispatch({ type: "VISIT", stage: 1 }, { announce: true });
  else if (state.stage === 3) dispatch({ type: "ALTERNATE" });
  else dispatch({ type: "VISIT", stage: 3 }, { announce: true });
});
$("#reset").addEventListener("click", () => {
  reverse = false;
  dispatch({ type: "RESET" }, { announce: true });
  notify("新的起點。上一輪的形狀不再保留。");
});
$("#motion-toggle").addEventListener("click", () => { reduced = !reduced; render({ immediate: true }); });
motionMedia.addEventListener("change", e => { reduced = e.matches; render({ immediate: true }); });
$("#about-open").addEventListener("click", () => $("#about-dialog").showModal());
for (const id of ["#about-close", "#about-start"]) $(id).addEventListener("click", () => $("#about-dialog").close());
$("#about-dialog").addEventListener("click", event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.currentTarget.close(); } });

function setReverse(value) {
  if (reverse === value) return;
  reverse = value;
  if (value && !state.reverseFound) {
    state = transition(state, { type: "DISCOVER" });
    save();
    notify("你找到了背面。被捨棄的可能性沒有消失；放開後回到這一次的選擇。");
  }
  render();
}
instrument.addEventListener("pointerdown", event => {
  if (event.button !== 0) return;
  instrument.focus({ preventScroll: true });
  instrument.setPointerCapture(event.pointerId);
  const p = normalizedPoint(event, instrument);
  pointer = { id: event.pointerId, start: p, last: p, moved: false, scarMade: false, held: false };
  clearTimeout(holdTimer);
  if (Math.hypot(p.x - .5, p.y - .5) < .15) {
    holdTimer = setTimeout(() => { if (pointer && !pointer.moved) { pointer.held = true; setReverse(true); } }, 650);
  }
});
instrument.addEventListener("pointermove", event => {
  if (!pointer || pointer.id !== event.pointerId) return;
  const p = normalizedPoint(event, instrument);
  const distance = Math.hypot(p.x - pointer.start.x, p.y - pointer.start.y);
  if (distance > .012) { pointer.moved = true; clearTimeout(holdTimer); }
  if (pointer.held) return;
  if (performance.now() - lastMove < 55) return;
  lastMove = performance.now();
  if (state.stage === 2) {
    if (distance > .065 && !pointer.scarMade) {
      const x = (p.x + pointer.start.x) / 2; const y = (p.y + pointer.start.y) / 2;
      dispatch({ type: "SCAR", x, y, angle: Math.atan2(p.y - pointer.start.y, p.x - pointer.start.x) });
      pointer.scarMade = true;
      $("#live-status").textContent = `已留下 ${state.scars.length} 道裂縫。`;
    }
  } else dispatch({ type: "ANCHOR", x: p.x, y: p.y });
  pointer.last = p;
});
function pointerEnd(event) {
  if (!pointer || pointer.id !== event.pointerId) return;
  clearTimeout(holdTimer);
  const cancelled = event.type === "pointercancel" || event.type === "lostpointercapture";
  if (!cancelled && !pointer.held && !pointer.moved && state.stage !== 2) {
    dispatch({ type: "ANCHOR", ...pointer.last });
  }
  pointer = null;
  setReverse(false);
  if (instrument.hasPointerCapture(event.pointerId)) instrument.releasePointerCapture(event.pointerId);
}
for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) instrument.addEventListener(name, pointerEnd);
instrument.addEventListener("keydown", event => {
  const step = event.shiftKey ? .09 : .035;
  const directions = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  if (directions[event.key]) {
    event.preventDefault(); const [dx, dy] = directions[event.key];
    dispatch({ type: "ANCHOR", x: state.anchor.x + dx, y: state.anchor.y + dy });
  } else if (event.key.toLowerCase() === "x" && state.stage === 2) {
    event.preventDefault(); if (!event.repeat) dispatch({ type: "SCAR", ...state.anchor, angle: -.7 });
  } else if (event.code === "Space") {
    event.preventDefault(); if (!event.repeat) setReverse(true);
  } else if (event.key === "Escape") setReverse(false);
});
instrument.addEventListener("keyup", event => { if (event.code === "Space") { event.preventDefault(); setReverse(false); } });
instrument.addEventListener("blur", () => { clearTimeout(holdTimer); setReverse(false); });
window.addEventListener("blur", () => { clearTimeout(holdTimer); pointer = null; setReverse(false); });
render({ immediate: true });
if (state.stage > 0) notify(`已接回上一次的形狀：${STAGE_NAMES[state.stage]}。`);
