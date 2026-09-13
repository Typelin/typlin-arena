import { createFrame, blendFrame, pathFrom, springProgress, THREADS } from "./geometry.js";
import { fingerprint } from "./state.js";
import { proposalFor, approachOf } from "./narrative.js";
const NS = "http://www.w3.org/2000/svg";
const make = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
export class LoomRenderer {
  constructor(svg, reduced = false) {
    this.svg = svg; this.reduced = reduced; this.paths = []; this.ghosts = []; this.humans = []; this.silks = [];
    this.frame = null; this.raf = 0; this.reverse = false; this.state = null;
    for (let i = 0; i < THREADS; i++) {
      const path = make("path", { opacity: i % 8 === 0 ? ".94" : ".67" });
      svg.querySelector("#threads").append(path); this.paths.push(path);
      if (i % 8 === 0) {
        const ghost = make("path"); svg.querySelector("#ghost-threads").append(ghost); this.ghosts.push({ i, path: ghost });
        const silk = make("path"); const half = make("path"); svg.querySelector("#silk-layer").append(silk, half); this.silks.push({ i, path: silk, half });
      }
      if (i % 16 === 0) { const human = make("path"); svg.querySelector("#human-threads").append(human); this.humans.push({ i, path: human }); }
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(this.raf); else if (this.state) this.update(this.state, { immediate: true }); });
  }
  update(state, { immediate = false, reverse = this.reverse } = {}) {
    cancelAnimationFrame(this.raf); this.reverse = reverse;
    const oldStage = this.state?.stage; this.state = state;
    const visualState = reverse ? { ...state, anchor: { ...state.anchor, x: 1 - state.anchor.x }, tension: 1 - state.tension } : state;
    const target = createFrame(state.stage, visualState, 0, reverse);
    const from = this.frame || target;
    this.annotate(visualState); this.paintGhosts(state);
    if (immediate || this.reduced || document.hidden) { this.frame = target; this.paint(target, state); return; }
    const duration = oldStage === state.stage ? 540 : state.stage === 3 ? 1850 : 1250;
    const reweaving = oldStage !== state.stage && state.stage === 3;
    const start = performance.now(); let last = 0;
    const tick = now => {
      if (now - last < 28 && now - start < duration) { this.raf = requestAnimationFrame(tick); return; }
      last = now; const t = Math.min(1, (now - start) / duration);
      if (t === 1) this.frame = target;
      else if (reweaving) this.frame = target.map((thread, i) => {
        const delay = i < 48 ? .04 + i / 48 * .12 : .20 + (i - 48) / 48 * .12;
        const progress = springProgress(Math.max(0, Math.min(1, (t - delay) / (1 - delay))));
        return thread.map((p, j) => [from[i][j][0] + (p[0] - from[i][j][0]) * progress, from[i][j][1] + (p[1] - from[i][j][1]) * progress]);
      });
      else this.frame = blendFrame(from, target, springProgress(t));
      this.paint(this.frame, state);
      if (t < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  paint(frame, state) {
    const pathStage = state.stage === 2 && !state.scars.length ? 1 : state.stage;
    frame.forEach((points, i) => this.paths[i].setAttribute("d", pathFrom(points, pathStage)));
    const strip = (a, b) => pathFrom(a, 0) + pathFrom([...b].reverse(), 0).replace(/^M/, "L") + "Z";
    for (const { i, path, half } of this.silks) {
      const a = frame[i], b = frame[Math.min(i + 6, THREADS - 1)];
      if (state.stage === 2 && state.scars.length) {
        const split = Math.floor(a.length / 2);
        path.setAttribute("d", strip(a.slice(0, split), b.slice(0, split)));
        half.setAttribute("d", strip(a.slice(split), b.slice(split)));
      } else { path.setAttribute("d", strip(a, b)); half.setAttribute("d", ""); }
      path.setAttribute("fill", i >= 64 && state.anchor.x > .66 ? "url(#warm-silk)" : "url(#silk-sheen)");
    }
    for (const { i, path } of this.humans) {
      path.setAttribute("d", pathFrom(frame[i], pathStage));
      path.setAttribute("opacity", state.traces.length || state.scars.length ? ".9" : "0");
    }
    const cursor = this.svg.querySelector("#cursor-guide");
    cursor.setAttribute("transform", `translate(${200 + state.anchor.x * 400} 330)`);
    cursor.setAttribute("opacity", state.stage === 4 ? "0" : ".88");
  }
  paintGhosts(state) {
    const alternate = createFrame(state.stage, { ...state, anchor: { ...state.anchor, x: 1 - state.anchor.x }, tension: 1 - state.tension }, 0, !this.reverse);
    for (const { i, path } of this.ghosts) path.setAttribute("d", pathFrom(alternate[i], state.stage === 2 && !state.scars.length ? 1 : state.stage));
    this.svg.querySelector("#ghost-threads").setAttribute("opacity", this.reverse ? ".9" : "0");
  }
  annotate(state) {
    const layer = this.svg.querySelector("#annotation-layer"), scars = this.svg.querySelector("#scar-layer");
    layer.replaceChildren(); scars.replaceChildren();
    const line = (d, color = "#b9adc9", dash = "") => layer.append(make("path", { d, stroke: color, fill: "none", "stroke-width": ".8", "stroke-dasharray": dash }));
    const text = (content, x, y, color = "#80718f", size = 12, anchor = "start") => {
      const node = make("text", { x, y, fill: color, "font-size": size, "font-family": "Arial, Microsoft JhengHei, sans-serif", "letter-spacing": "1", "text-anchor": anchor });
      node.textContent = content; layer.append(node);
    };
    const mode = approachOf(state);
    if (state.stage === 0) {
      if (mode === "balanced") {
        text("一個問題，多種可能的理解", 400, 62, "#79608f", 14, "middle");
        line("M125 462H82V489"); text("還沒有唯一答案", 82, 513, "#7d6c8e", 12);
        text("UNDERSTAND / 01", 710, 610, "#8f82a0", 10, "end");
      } else {
        text(mode === "clear" ? "你把可能性，收成了一條路。" : "你讓可能性，分出了三條路。", 400, 95, "#75588e", 16, "middle");
        if (mode === "creative") { text("角色配音", 758, 139, "#745997", 13, "end"); text("想像訪談", 758, 311, "#745997", 13, "end"); text("生活短劇", 758, 481, "#9d8059", 13, "end"); }
        else text("三句 → 跟讀 → 回聽", 735, 499, "#705091", 14, "end");
      }
    } else if (state.stage === 1) {
      text("改變的不是角度，是提案的結構。", 400, 90, "#74558d", 15, "middle");
      line("M53 102V540", "#c4b3d1", "2 6"); text("你的問題", 55, 566, "#80708f", 13);
      if (mode === "creative") { text("角色配音", 748, 120, "#755793", 13, "end"); text("想像訪談", 748, 318, "#755793", 13, "end"); text("生活短劇", 748, 557, "#9b805b", 13, "end"); }
      else text(mode === "clear" ? "一條清楚的練習路徑" : "兩種方向，可以並存", 740, 546, "#755793", 14, "end");
    } else if (state.stage === 2) {
      line("M400 87V578", "#b19d6b", "3 8");
      text(state.scars.length ? "這道裂縫，代表新的條件。" : "流暢，不代表適合你。", 400, 65, "#89734a", 15, "middle");
      text("原本的提案", 170, 586, "#80698e", 13, "middle"); text("十分鐘 / 不錄音", 630, 586, "#8c774f", 13, "middle");
      state.scars.forEach(scar => {
        const x = 365 + scar.x * 70, y = 200 + scar.y * 225;
        const dx = Math.cos(scar.angle) * 77, dy = Math.sin(scar.angle) * 77;
        scars.append(make("path", { d: `M${x - dx} ${y - dy}L${x + dx} ${y + dy}`, stroke: "#b6c774", "stroke-width": "3" }));
        scars.append(make("circle", { cx: x, cy: y, r: "5", fill: "#f4f3ef", stroke: "#8b9560" }));
      });
    } else if (state.stage === 3) {
      text("讓不同條件，成為同一個答案。", 400, 64, "#74518f", 15, "middle");
      text("敢開口", 117, 202, "#715192", 14); text("十分鐘", 715, 210, "#758447", 14, "end"); text("不錄音", 677, 507, "#758447", 14, "end");
      text("裂縫沒有被擦掉。它成了新的接點。", 400, 610, "#867594", 13, "middle");
      state.scars.forEach((scar, i) => {
        const x = 260 + scar.x * 260, y = 230 + scar.y * 180;
        scars.append(make("circle", { cx: x, cy: y, r: 10 + i * 3, fill: "#f4f3ef99", stroke: "#8a9c54", "stroke-width": "1", "stroke-dasharray": "2 3" }));
        scars.append(make("path", { d: `M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`, stroke: "#7c8c45" }));
      });
    } else {
      line("M48 102H752M48 565H752");
      text(`ENCOUNTER / ${fingerprint(state)}`, 50, 84, "#765795", 12);
      text("你 + Astra", 750, 84, "#887595", 14, "end");
      text("你的方向、你的條件，都還在這裡。", 400, 601, "#7d6790", 13, "middle");
      state.scars.forEach(scar => {
        const x = 180 + scar.x * 440, y = 187 + scar.y * 280;
        scars.append(make("circle", { cx: x, cy: y, r: "11", fill: "#f4f3efcc", stroke: "#a9b276", "stroke-width": "1" }));
        scars.append(make("path", { d: `M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`, stroke: "#88994d" }));
      });
    }
  }
  export(state) {
    const svg = this.svg.cloneNode(true);
    svg.setAttribute("xmlns", NS); svg.setAttribute("width", "1600"); svg.setAttribute("height", "1720"); svg.setAttribute("viewBox", "0 -70 800 860");
    svg.querySelector("#cursor-guide")?.remove(); svg.querySelector("#ghost-threads")?.remove();
    svg.insertBefore(make("rect", { x: 0, y: -70, width: 800, height: 860, fill: "#f4f3ef" }), svg.firstChild);
    const add = (content, y, size = 14, color = "#706077") => {
      const node = make("text", { x: 45, y, fill: color, "font-family": "Arial, Microsoft JhengHei, sans-serif", "font-size": size });
      node.textContent = content; svg.append(node);
    };
    add(`ASTRA / AN UNFINISHED FORM / ${fingerprint(state)}`, -20, 23, "#3c2c4c");
    const proposal = proposalFor(state);
    add(proposal.title, 661, 23, "#6342de");
    const detail = [...proposal.detail]; add(detail.slice(0, 43).join(""), 695, 14); add(detail.slice(43).join(""), 721, 14);
    add(`${state.traces.length} GESTURE SAMPLES / ${state.scars.length} CONSTRAINTS / ${proposal.mode}`, 760, 11);
    const metadata = make("metadata"); metadata.textContent = JSON.stringify({ ...state, proposal }); svg.append(metadata);
    return new XMLSerializer().serializeToString(svg);
  }
}
