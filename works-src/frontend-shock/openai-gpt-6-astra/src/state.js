export const STORAGE_KEY = "astra-unfinished-form-v1";
export const STAGE_NAMES = ["未定", "牽引", "反證", "重組", "留痕"];
export const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
export function initialState() {
  return { version: 1, stage: 0, reached: 0, direction: "clarity", tension: 0.36, anchor: { x: 0.5, y: 0.5 }, traces: [], scars: [], alternate: false, reverseFound: false, revision: 0 };
}
export function transition(state, action) {
  switch (action.type) {
    case "DIRECTION":
      return { ...state, direction: action.value === "wonder" ? "wonder" : "clarity", revision: state.revision + 1 };
    case "TENSION":
      return { ...state, tension: clamp(action.value), revision: state.revision + 1 };
    case "ANCHOR": {
      const point = { x: clamp(action.x), y: clamp(action.y) };
      return { ...state, anchor: point, traces: [...state.traces, { ...point, stage: state.stage }].slice(-160), revision: state.revision + 1 };
    }
    case "SCAR":
      if (state.stage !== 2 || state.scars.length >= 7) return state;
      return { ...state, scars: [...state.scars, { x: clamp(action.x, 0.15, 0.85), y: clamp(action.y, 0.15, 0.85), angle: Number.isFinite(action.angle) ? action.angle : -0.7 }], revision: state.revision + 1 };
    case "NEXT": {
      if (state.stage === 2 && state.scars.length === 0) return state;
      const stage = Math.min(4, state.stage + 1);
      return { ...state, stage, reached: Math.max(stage, state.reached), revision: state.revision + 1 };
    }
    case "VISIT":
      if (!Number.isInteger(action.stage) || action.stage < 0 || action.stage > state.reached) return state;
      return { ...state, stage: action.stage, revision: state.revision + 1 };
    case "ALTERNATE":
      return { ...state, alternate: !state.alternate, reverseFound: true, revision: state.revision + 1 };
    case "DISCOVER":
      return { ...state, reverseFound: true };
    case "RESET":
      return initialState();
    default: return state;
  }
}
export function fingerprint(state) {
  const input = JSON.stringify([state.direction, state.tension, state.anchor, state.traces, state.scars, state.alternate]);
  let hash = 2166136261;
  for (const char of input) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16).slice(-4).toUpperCase();
}
export function restore(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return initialState();
    const state = initialState();
    const finite = (v) => typeof v === "number" && Number.isFinite(v);
    state.stage = Number.isInteger(data.stage) ? clamp(data.stage, 0, 4) : 0;
    state.reached = Math.max(state.stage, Number.isInteger(data.reached) ? clamp(data.reached, 0, 4) : 0);
    state.direction = data.direction === "wonder" ? "wonder" : "clarity";
    state.tension = finite(data.tension) ? clamp(data.tension) : 0.36;
    if (data.anchor && finite(data.anchor.x) && finite(data.anchor.y)) state.anchor = { x: clamp(data.anchor.x), y: clamp(data.anchor.y) };
    const points = (list, max) => Array.isArray(list) ? list.filter(p => p && finite(p.x) && finite(p.y)).slice(-max).map(p => ({ x: clamp(p.x), y: clamp(p.y), stage: Number.isInteger(p.stage) ? clamp(p.stage, 0, 4) : 0, angle: finite(p.angle) ? p.angle : -0.7 })) : [];
    state.traces = points(data.traces, 160).map(({ x, y, stage }) => ({ x, y, stage }));
    state.scars = points(data.scars, 7).map(({ x, y, angle }) => ({ x, y, angle }));
    state.alternate = data.alternate === true;
    state.reverseFound = data.reverseFound === true;
    if (state.reached >= 3 && !state.scars.length) return initialState();
    return state;
  } catch { return initialState(); }
}
