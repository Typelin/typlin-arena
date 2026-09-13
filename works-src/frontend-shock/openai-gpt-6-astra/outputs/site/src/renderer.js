import { createFrame, blendFrame, pathFrom, springProgress, THREADS } from "./geometry.js";
import { fingerprint } from "./state.js";
const NS = "http://www.w3.org/2000/svg";
const make = (name, attrs = {}) => {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
export class LoomRenderer {
  constructor(svg, reduced = false) {
    this.svg = svg;
    this.reduced = reduced;
    this.paths = [];
    this.ghosts = [];
    this.humans = [];
    this.frame = null;
    this.raf = 0;
    this.reverse = false;
    this.state = null;
    for (let i = 0; i < THREADS; i++) {
      const path = make("path", { opacity: i % 7 === 0 ? ".96" : ".73" });
      svg.querySelector("#threads").append(path);
      this.paths.push(path);
      if (i % 8 === 0) {
        const ghost = make("path", { opacity: ".75" });
        svg.querySelector("#ghost-threads").append(ghost);
        this.ghosts.push({ i, path: ghost });
      }
      if (i % 16 === 0) {
        const human = make("path");
        svg.querySelector("#human-threads").append(human);
        this.humans.push({ i, path: human });
      }
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(this.raf);
      else if (this.state) this.update(this.state, { immediate: true });
    });
  }
  update(state, { immediate = false, reverse = this.reverse } = {}) {
    cancelAnimationFrame(this.raf);
    this.reverse = reverse;
    const oldStage = this.state?.stage;
    this.state = state;
    const target = createFrame(state.stage, state, 0, reverse);
    const from = this.frame || target;
    this.annotate(state);
    this.paintGhosts(state);
    if (immediate || this.reduced || document.hidden) {
      this.frame = target;
      this.paint(target, state);
      return;
    }
    const duration = oldStage === state.stage ? 600 : state.stage === 3 ? 2200 : state.stage === 4 ? 1750 : 1500;
    const isReweaving = oldStage !== state.stage && state.stage === 3;
    const start = performance.now();
    let last = 0;
    const tick = now => {
      if (now - last < 30 && now - start < duration) { this.raf = requestAnimationFrame(tick); return; }
      last = now;
      const t = Math.min(1, (now - start) / duration);
      if (t === 1) this.frame = target;
      else if (isReweaving) {
        this.frame = target.map((thread, i) => {
          const delay = i < 48 ? .06 + (i / 48) * .09 : .20 + ((i - 48) / 48) * .10;
          const local = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
          const progress = springProgress(local);
          const retreat = t < delay ? Math.sin(t / delay * Math.PI) * (i < 48 ? -12 : 12) : 0;
          return thread.map((p, j) => [from[i][j][0] + (p[0] - from[i][j][0]) * progress + retreat, from[i][j][1] + (p[1] - from[i][j][1]) * progress]);
        });
      } else this.frame = blendFrame(from, target, springProgress(t));
      this.paint(this.frame, state);
      if (t < 1) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  paint(frame, state) {
    const pathStage = state.stage === 2 && !state.scars.length ? 1 : state.stage;
    frame.forEach((points, i) => this.paths[i].setAttribute("d", pathFrom(points, pathStage)));
    const showHuman = state.traces.length > 0 || state.stage > 0;
    for (const { i, path } of this.humans) {
      path.setAttribute("d", pathFrom(frame[i], pathStage));
      path.setAttribute("opacity", showHuman ? "1" : "0");
    }
    const cursor = this.svg.querySelector("#cursor-guide");
    const cx = state.stage === 0 ? 400 : 400 + (state.anchor.x - .5) * 280;
    const cy = state.stage === 0 ? 330 : 330 + (state.anchor.y - .5) * 250;
    cursor.setAttribute("transform", `translate(${cx} ${cy})`);
    cursor.setAttribute("opacity", state.stage === 4 ? "0" : "1");
  }
  paintGhosts(state) {
    const alternate = createFrame(state.stage, state, .6, !this.reverse);
    for (const { i, path } of this.ghosts) path.setAttribute("d", pathFrom(alternate[i], state.stage));
    this.svg.querySelector("#ghost-threads").setAttribute("opacity", this.reverse ? "1" : "0");
  }
  annotate(state) {
    const layer = this.svg.querySelector("#annotation-layer");
    const scars = this.svg.querySelector("#scar-layer");
    layer.replaceChildren();
    scars.replaceChildren();
    const line = (d, stroke = "#b5afc0", dash = "") => layer.append(make("path", { d, fill: "none", stroke, "stroke-width": ".8", "stroke-dasharray": dash }));
    const text = (content, x, y, color = "#7e748f", size = 9, anchor = "start") => {
      const el = make("text", { x, y, fill: color, "font-size": size, "font-family": "Consolas, monospace", "letter-spacing": "1", "text-anchor": anchor });
      el.textContent = content; layer.append(el);
    };
    if (state.stage === 0) {
      line("M606 143H682V111"); text("POSSIBILITY / 096", 688, 107, "#645975", 8, "end");
      line("M130 473H84V501"); text("NO SINGLE ANSWER", 84, 522, "#645975", 8);
      text("∞", 400, 341, "#5e49a0", 29, "middle");
    } else if (state.stage === 1) {
      line("M64 62H736M64 56V68M736 56V68"); text("A DIRECTION IS A CONSTRAINT", 400, 49, "#756985", 9, "middle");
      text("MANY", 65, 565); text("ONE INTENTION", 735, 565, "#756985", 9, "end");
      line("M400 395V472H500"); text("YOUR INPUT", 509, 476, "#5838f5", 10);
    } else if (state.stage === 2) {
      const center = 400 + ((state.scars[0]?.x ?? .5) - .5) * 100;
      line(`M${center} 72V580`, "#8c8139", "2 6");
      text(state.scars.length ? "CERTAINTY, INTERRUPTED." : "A BEAUTIFUL ANSWER CAN BE WRONG.", 400, 57, "#7a6c31", 9, "middle");
      text("BEFORE", 168, 595); text("WHAT IF?", 635, 595, "#7a6c31", 9, "end");
      state.scars.forEach((scar, i) => {
        const x = 360 + scar.x * 80;
        const y = 190 + scar.y * 230 + i * 10;
        scars.append(make("path", { d: `M${x - 70} ${y - 70}L${x + 70} ${y + 70}`, stroke: "#cde761", "stroke-width": "4" }));
        scars.append(make("circle", { cx: x, cy: y, r: "5", fill: "#f5f5f0", stroke: "#68632c", "stroke-width": "1" }));
        text(`0${i + 1}`, x + 16, y - 8, "#74652c", 9);
      });
    } else if (state.stage === 3) {
      text("NOT RESTORED. RECOMPOSED.", 400, 66, "#5838f5", 10, "middle");
      line("M76 191V479M69 191H83M69 479H83");
      text("YOU", 700, 145, "#5e772c", 11); text("ME", 88, 535, "#5838f5", 11);
      text(`${state.scars.length} FRACTURE${state.scars.length > 1 ? "S" : ""} / HELD IN THE WEAVE`, 400, 597, "#756985", 9, "middle");
      state.scars.forEach((scar, i) => {
        const x = 260 + scar.x * 260; const y = 220 + scar.y * 210;
        scars.append(make("circle", { cx: x, cy: y, r: 9 + i * 2, stroke: "#829c30", "stroke-width": "1", "stroke-dasharray": "2 3" }));
        scars.append(make("path", { d: `M${x - 4} ${y}H${x + 4}M${x} ${y - 4}V${y + 4}`, stroke: "#607921", "stroke-width": "1" }));
      });
    } else {
      layer.append(make("rect", { x: 43, y: 75, width: 709, height: 518, fill: "none", stroke: "#bbb4c8", "stroke-width": "1" }));
      line("M43 102H752M43 555H752");
      text(`FORM / ${fingerprint(state)}`, 60, 93, "#5838f5", 10); text("AN UNFINISHED EDITION", 734, 93, "#756985", 8, "end");
      text(`${String(state.traces.length).padStart(2, "0")} HUMAN TRACES`, 61, 578, "#756985", 9);
      text(`${state.direction === "wonder" ? "WONDER" : "CLARITY"} / ${Math.round(state.tension * 100)}% OPEN`, 734, 578, "#756985", 9, "end");
      state.scars.forEach((scar, i) => {
        const x = 180 + scar.x * 440; const y = 187 + scar.y * 280;
        scars.append(make("path", { d: `M${x - 8} ${y - 9}L${x + 8} ${y + 9}M${x - 8} ${y + 9}L${x + 8} ${y - 9}`, stroke: "#7c942f", "stroke-width": "1.3" }));
        text(`R${i + 1}`, x + 11, y + 4, "#6a7c2f", 8);
      });
    }
  }
  export(state) {
    const svg = this.svg.cloneNode(true);
    svg.setAttribute("xmlns", NS);
    svg.setAttribute("width", "1600");
    svg.setAttribute("height", "1480");
    svg.setAttribute("viewBox", "0 -70 800 740");
    svg.querySelector("#cursor-guide")?.remove();
    svg.querySelector("#ghost-threads")?.remove();
    const background = make("rect", { x: 0, y: -70, width: 800, height: 740, fill: "#f5f5f0" });
    svg.insertBefore(background, svg.firstChild);
    const title = make("text", { x: 45, y: -22, fill: "#242031", "font-family": "Arial, sans-serif", "font-size": "23", "font-weight": "700" });
    title.textContent = `ASTRA / AN UNFINISHED FORM / ${fingerprint(state)}`;
    const note = make("text", { x: 45, y: 637, fill: "#716b7b", "font-family": "Consolas, monospace", "font-size": "9" });
    note.textContent = `OPENAI GPT-6-ASTRA + YOU / ${state.traces.length} TRACES / ${state.scars.length} FRACTURES`;
    const metadata = make("metadata"); metadata.textContent = JSON.stringify(state);
    svg.append(title, note, metadata);
    return new XMLSerializer().serializeToString(svg);
  }
}
