import test from "node:test";
import assert from "node:assert/strict";
import { initialState, transition, restore, fingerprint } from "../src/state.js";
import { createFrame, pointAt, THREADS, SAMPLES } from "../src/geometry.js";
import { proposalFor, approachOf } from "../src/narrative.js";

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
test("scenario switch starts a new encounter", () => {
  let s = transition(initialState(), { type: "ANCHOR", x: .8, y: .5 });
  s = transition(s, { type: "SCENARIO", value: "write" });
  assert.equal(s.scenario, "write"); assert.equal(s.traces.length, 0); assert.equal(s.branch, -1);
});
test("branch selection locks a creative route", () => {
  const s = transition(initialState(), { type: "BRANCH", value: 2 });
  assert.equal(s.branch, 2); assert.equal(s.direction, "wonder"); assert.ok(s.anchor.x > .66);
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
  const hashes = new Set(Array.from({ length: 5 }, (_, stage) => JSON.stringify(createFrame(stage, { ...initialState(), scars: [{ x: .5, y: .5, angle: -.7, source: "example" }] })[10]))); assert.equal(hashes.size, 5);
});
test("hidden alternate affects the structure", () => {
  const state = { ...initialState(), stage: 3 }; assert.notDeepEqual(createFrame(3, state), createFrame(3, { ...state, alternate: true }));
});
test("scroll-only journey records an example and no imaginary hand trace", () => {
  const s = transition(initialState(), { type: "STORY_STAGE", stage: 4 });
  assert.equal(s.stage, 4); assert.equal(s.scars[0].source, "example"); assert.equal(s.traces.length, 0);
});
test("reading backwards keeps consequences", () => {
  const s = transition(initialState(), { type: "STORY_STAGE", stage: 4 });
  const back = transition(s, { type: "STORY_STAGE", stage: 0 });
  assert.equal(back.scars.length, 1); assert.equal(back.reached, 4);
});
test("manual fracture retains distinct provenance", () => {
  let s = transition(initialState(), { type: "STORY_STAGE", stage: 2 });
  s = transition(s, { type: "SCAR", x: .4, y: .5 });
  assert.equal(s.scars[0].source, "gesture");
  assert.equal(restore(JSON.stringify(s)).scars[0].source, "gesture");
});
test("left and right mean different proposals", () => {
  const left = transition(initialState(), { type: "ANCHOR", x: .1, y: .5 });
  const right = transition(initialState(), { type: "ANCHOR", x: .9, y: .5 });
  assert.equal(approachOf(left), "clear"); assert.equal(approachOf(right), "creative");
  assert.notEqual(proposalFor(left).title, proposalFor(right).title);
});
test("opening becomes one route or three branches, not camera rotation", () => {
  const left = { ...initialState(), anchor: { x: .1, y: .5 } };
  const right = { ...initialState(), anchor: { x: .9, y: .5 } };
  const span = state => Math.abs(pointAt(0, 80, .9, state)[1] - pointAt(0, 16, .9, state)[1]);
  assert.ok(span(right) > span(left) + 150);
});
test("three branches separate under creative direction", () => {
  const s = { ...initialState(), anchor: { x: 1, y: .5 } };
  const ys = [16, 48, 80].map(i => pointAt(1, i, 1, s)[1]);
  assert.ok(ys[1] - ys[0] > 150 && ys[2] - ys[1] > 150);
});
test("constraints rewrite every proposal", () => {
  for (const x of [.1, .5, .9]) {
    const base = { ...initialState(), scenario: "learn", anchor: { x, y: .5 } };
    const s = transition(base, { type: "STORY_STAGE", stage: 3 });
    const p = proposalFor(s);
    assert.ok(p.constrained); assert.notEqual(p.title, proposalFor(base).title);
    assert.ok((p.title + p.detail).includes("不錄音"));
    assert.ok((p.title + p.detail).includes("十分鐘"));
  }
});
test("automatic example state preserves fingerprint on reload", () => {
  const s = transition(initialState(), { type: "STORY_STAGE", stage: 4 });
  assert.equal(fingerprint(s), fingerprint(restore(JSON.stringify(s))));
});
