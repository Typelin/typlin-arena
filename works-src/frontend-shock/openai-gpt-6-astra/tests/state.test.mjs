import test from "node:test";
import assert from "node:assert/strict";
import { initialState, transition, restore, fingerprint } from "../src/state.js";
import { createFrame, THREADS, SAMPLES } from "../src/geometry.js";

test("fresh entry starts at the unformed state", () => {
  const s = initialState(); assert.equal(s.stage, 0); assert.equal(s.reached, 0); assert.equal(s.scars.length, 0);
});
test("stages cannot be skipped", () => { assert.equal(transition(initialState(), { type: "VISIT", stage: 4 }).stage, 0); });
test("recomposition requires a counterexample", () => {
  let s = transition(transition(initialState(), { type: "NEXT" }), { type: "NEXT" });
  assert.equal(s.stage, 2); assert.equal(transition(s, { type: "NEXT" }).stage, 2);
  s = transition(s, { type: "SCAR", x: .5, y: .4, angle: .3 });
  assert.equal(transition(s, { type: "NEXT" }).stage, 3);
});
test("scars are only allowed in the counterexample stage", () => { assert.equal(transition(initialState(), { type: "SCAR", x: .5, y: .5 }).scars.length, 0); });
test("history is bounded and anchor is clamped", () => {
  let s = initialState(); for (let i = 0; i < 200; i++) s = transition(s, { type: "ANCHOR", x: -1, y: 3 });
  assert.equal(s.traces.length, 160); assert.deepEqual(s.anchor, { x: 0, y: 1 });
});
test("different choices create different fingerprints", () => {
  const a = initialState(); const b = transition(a, { type: "DIRECTION", value: "wonder" }); assert.notEqual(fingerprint(a), fingerprint(b));
});
test("reset and replay are distinct", () => {
  let s = transition(initialState(), { type: "NEXT" }); s = transition(s, { type: "ANCHOR", x: .2, y: .8 });
  assert.equal(transition(s, { type: "VISIT", stage: 0 }).traces.length, 1);
  assert.equal(transition(s, { type: "RESET" }).traces.length, 0);
});
test("stored state is validated", () => {
  assert.deepEqual(restore("invalid"), initialState());
  const state = restore(JSON.stringify({ version: 1, stage: 99, tension: "bad", anchor: { x: null, y: 9 }, traces: [null, { x: "bad", y: 0 }] }));
  assert.deepEqual(state, initialState());
});
test("valid state round trips", () => {
  let s = transition(initialState(), { type: "ANCHOR", x: .4, y: .7 });
  const restored = restore(JSON.stringify(s)); assert.deepEqual(restored.anchor, s.anchor); assert.equal(restored.traces.length, 1);
  assert.equal(fingerprint(restored), fingerprint(s));
  s = { ...s, stage: 2, reached: 2 };
  s = transition(s, { type: "SCAR", x: .4, y: .6, angle: .2 });
  assert.equal(fingerprint(restore(JSON.stringify(s))), fingerprint(s));
});
test("all geometry states remain finite", () => {
  for (let stage = 0; stage < 5; stage++) for (const direction of ["clarity", "wonder"]) for (const tension of [0, .5, 1]) {
    const frame = createFrame(stage, { ...initialState(), direction, tension, stage });
    assert.equal(frame.length, THREADS); assert.equal(frame[0].length, SAMPLES + 1);
    for (const line of frame) for (const point of line) for (const n of point) assert.ok(Number.isFinite(n));
  }
});
test("stages change structure rather than only copy", () => {
  const hashes = new Set(Array.from({ length: 5 }, (_, stage) => JSON.stringify(createFrame(stage, initialState())[10]))); assert.equal(hashes.size, 5);
});
test("hidden alternate affects the structure", () => {
  const state = { ...initialState(), stage: 3 }; assert.notDeepEqual(createFrame(3, state), createFrame(3, { ...state, alternate: true }));
});
