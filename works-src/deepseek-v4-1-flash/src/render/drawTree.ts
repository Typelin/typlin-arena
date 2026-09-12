import { ALL_FORKS, BRANCHES, TOTAL_STEPS } from '../data/script';
import type { Choice } from '../engine/path';
import { lerpVec, nodeAt, stepTo } from '../engine/layout';
import type { Vec } from '../engine/layout';
import { hashString } from '../engine/rng';
import { inkBlob, inkDot, inkStroke, setStroke } from './ink';

const INK = '#1B1815';
/** 我自己抽的那幾段——墨比較淡。訪客的手是外力，留下最濃的墨。 */
const INK_MINE = 'rgba(27,24,21,0.42)';
/** 當前岔路的候選枝——看得見，但還沒被墨認領。 */
const ROAD_OPEN = 'rgba(27,24,21,0.30)';
/** 已經放棄的旁枝——留在紙上，越久越淡。 */
const ROAD_PAST = 'rgba(27,24,21,0.12)';
/** 幽靈森林：別條路徑會長成的樣子。 */
const GHOST = 'rgba(27,24,21,0.05)';
/** 朱紅：回放時，向你指出你放棄了什麼。 */
const SEAL = '#B4341F';
const SEAL_DIM = 'rgba(180,52,31,0.55)';
const PAPER = '#F3EFE6';

export type Scene = {
  choices: Choice[];
  /** 指標停在第幾條候選枝上 */
  hover: number | null;
  /** 已完全揭示的岔路數（主線畫到這裡） */
  reveal: number;
  /** 第 reveal 段主線的生長進度 0..1 */
  growProgress: number;
  /** 回放時，正在被指出「你放棄了什麼」的岔路 */
  highlight: number | null;
  highlightAlpha: number;
  ghosts: Choice[][] | null;
  cam: Vec;
  /** 收束時拉遠，讓訪客看見整棵樹 */
  zoom: number;
  w: number;
  h: number;
  time: number;
  shake: number;
};

export function drawTree(ctx: CanvasRenderingContext2D, s: Scene): void {
  ctx.clearRect(0, 0, s.w, s.h);

  // 筆觸補償：拉遠時線不跟著消失，只是結構變小。
  const comp = Math.min(5, 1 / s.zoom);

  ctx.save();
  ctx.scale(s.zoom, s.zoom);
  if (s.shake > 0) {
    ctx.translate(
      -s.cam.x + Math.sin(s.time * 47) * s.shake * 3.2,
      -s.cam.y + Math.cos(s.time * 61) * s.shake * 3.2
    );
  } else {
    ctx.translate(-s.cam.x, -s.cam.y);
  }

  const total = s.choices.length;
  const reveal = Math.min(s.reveal, total);
  const atTip = reveal >= total && total < TOTAL_STEPS;

  // ── 1. 幽靈森林（最底層，一閃即逝） ──────────────────────────
  if (s.ghosts && s.ghosts.length > 0) {
    setStroke(ctx, GHOST, 1.2 * comp);
    for (let g = 0; g < s.ghosts.length; g += 1) {
      const gc = s.ghosts[g];
      for (let i = 0; i < gc.length; i += 1) {
        const a = nodeAt(gc, i);
        const b = nodeAt(gc, i + 1);
        inkStroke(ctx, a.x, a.y, b.x, b.y, hashString(`ghost:${g}:${i}`), 3.4, 1);
      }
    }
  }

  // ── 2. 已放棄的旁枝 ──────────────────────────────────────────
  // 拉遠看總覽時，這些「沒走的路」才是主角，所以讓它們清楚一點。
  const pastInk = s.zoom < 0.6 ? 'rgba(27,24,21,0.22)' : ROAD_PAST;
  for (let i = 0; i < reveal; i += 1) {
    const parent = nodeAt(s.choices, i);
    const chosen = s.choices[i].option;
    const lit = s.highlight === i;
    for (let opt = 0; opt < BRANCHES; opt += 1) {
      if (opt === chosen) continue;
      const to = stepTo(parent, opt);
      const seed = hashString(`past:${i}:${opt}`);
      if (lit) {
        setStroke(ctx, SEAL, (1.7 + s.highlightAlpha) * comp, [5, 5]);
        ctx.globalAlpha = 0.25 + s.highlightAlpha * 0.75;
        inkStroke(ctx, parent.x, parent.y, to.x, to.y, seed, 3.2, 1);
        ctx.globalAlpha = 1;
      } else {
        const age = reveal - i;
        const fade = Math.max(0.35, 1 - age * 0.055);
        setStroke(ctx, pastInk, 1.1 * comp);
        ctx.globalAlpha = fade;
        inkStroke(ctx, parent.x, parent.y, to.x, to.y, seed, 3.2, 1);
        ctx.globalAlpha = 1;
      }
    }
  }

  // ── 3. 當前岔路的三條候選枝 ──────────────────────────────────
  if (atTip) {
    const parent = nodeAt(s.choices, total);
    const fork = ALL_FORKS[total];
    // 窄螢幕：候選標籤改用直列，枝就只留一小截，別伸進文字裡
    const stub = s.w < 560 ? 0.16 : 1;
    // 虛線緩緩流向枝尖——路在等你走
    ctx.lineDashOffset = -s.time * 15;
    for (let opt = 0; opt < BRANCHES; opt += 1) {
      const to = stub < 1 ? lerpVec(parent, stepTo(parent, opt), stub) : stepTo(parent, opt);
      const on = s.hover === opt;
      // 枝的粗細就是它的機率：越可能被選中的路，越粗
      const prob = fork?.options[opt]?.p ?? 33;
      const base = 1.1 + (prob / 100) * 1.7;
      setStroke(ctx, on ? SEAL : ROAD_OPEN, (on ? 3.2 : base) * comp, on ? [] : [8, 7]);
      inkStroke(ctx, parent.x, parent.y, to.x, to.y, hashString(`open:${total}:${opt}`), 3.2, 1);
      if (on) inkBlob(ctx, to.x, to.y, 4 * comp, SEAL_DIM, hashString(`tipdot:${total}:${opt}`));
    }
    ctx.lineDashOffset = 0;
  }

  // ── 4. 主線（墨認領的路） ────────────────────────────────────
  // 手會換：訪客走過的段落是濃墨，我自己按機率抽的段落比較淡。
  // 所以訪客越參與，這棵樹越黑——這是這一節唯一想講的事。
  // 拉遠看總覽時不分色，否則一條細線變成兩種色階會像壞掉。
  const twoTone = s.zoom >= 0.6;
  for (let i = 0; i < total; i += 1) {
    const p = i < reveal ? 1 : i === reveal ? s.growProgress : 0;
    if (p <= 0) continue;
    const mine = twoTone && s.choices[i].by === 'me';
    setStroke(ctx, mine ? INK_MINE : INK, (mine ? 2.1 : 2.4) * comp);
    const a = nodeAt(s.choices, i);
    const b = nodeAt(s.choices, i + 1);
    inkStroke(ctx, a.x, a.y, b.x, b.y, hashString(`main:${i}`), 2.5, p);
  }

  // ── 5. 節點墨滴 ──────────────────────────────────────────────
  for (let i = 0; i <= reveal; i += 1) {
    const n = nodeAt(s.choices, i);
    const pending = i === total && s.growProgress < 1;
    // 節點 i 掛在第 i-1 次選擇上（0 是根）
    const mine = twoTone && i > 0 && s.choices[i - 1]?.by === 'me';
    ctx.globalAlpha = pending ? s.growProgress : 1;
    // 起點：墨滴落紙的暈染
    if (i === 0) {
      const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 52 * comp);
      halo.addColorStop(0, 'rgba(27,24,21,0.06)');
      halo.addColorStop(1, 'rgba(27,24,21,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 52 * comp, 0, Math.PI * 2);
      ctx.fill();
    }
    inkBlob(
      ctx,
      n.x,
      n.y,
      (i === 0 ? 7.2 : mine ? 4.2 : 5) * comp,
      mine ? INK_MINE : INK,
      hashString(`node:${i}`)
    );
    if (i === 0) inkDot(ctx, n.x, n.y, 2.6 * comp, PAPER);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
