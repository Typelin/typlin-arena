import { useEffect, useRef, useState } from "react";
import { AttentionField, type FieldInput } from "./lib/engine";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useReveal } from "./hooks/useReveal";
import Hero from "./components/Hero";
import Thinking from "./components/Thinking";
import Creating from "./components/Creating";
import Collaborating from "./components/Collaborating";
import Coda from "./components/Coda";

interface Pin {
  id: number;
  x: number;
  y: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [word, setWord] = useState("");
  const [temperature, setTemperature] = useState(0.2);
  const [idle, setIdle] = useState(false);
  const [touched, setTouched] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const pinId = useRef(0);

  const inputRef = useRef<FieldInput>({
    progress: 0,
    px: 0,
    py: 0,
    hasPointer: false,
    fx: null,
    fy: null,
    word: "",
    temperature: 0.2,
    lastInputAt: performance.now(),
    reduced: false,
    keepouts: [],
  });

  useReveal();

  useEffect(() => {
    inputRef.current.word = word;
  }, [word]);
  useEffect(() => {
    inputRef.current.temperature = temperature;
  }, [temperature]);
  useEffect(() => {
    inputRef.current.reduced = reduced;
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const inp = inputRef.current;
    const engine = new AttentionField(canvas, inp, setIdle);

    const progress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      inp.progress = max > 0 ? window.scrollY / max : 0;
    };
    const keepoutOf = (id: string, out: { x: number; y: number; w: number; h: number }[]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom > -80 && r.top < window.innerHeight + 80) {
        out.push({ x: r.left, y: r.top, w: r.width, h: r.height });
      }
    };
    const computeKeepouts = () => {
      const ks: { x: number; y: number; w: number; h: number }[] = [];
      if (inp.progress < 0.22) {
        keepoutOf("hero-title", ks);
        keepoutOf("scroll-cue", ks);
      }
      if (inp.progress > 0.7) {
        keepoutOf("coda-inner", ks);
      }
      if (inp.progress > 0.08 && inp.progress < 0.82) {
        document.querySelectorAll(".chapter-body").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom > -40 && r.top < window.innerHeight + 40) {
            const pr = Number.parseFloat(getComputedStyle(el).paddingRight) || 0;
            const pl = Number.parseFloat(getComputedStyle(el).paddingLeft) || 0;
            ks.push({ x: r.left + pl, y: r.top, w: Math.max(0, r.width - pl - pr), h: r.height });
          }
        });
      }
      inp.keepouts = ks;
    };
    const touch = () => {
      inp.lastInputAt = performance.now();
      setTouched(true);
    };
    const onScroll = () => {
      progress();
      computeKeepouts();
      touch();
    };
    const onPointer = (e: PointerEvent) => {
      inp.px = e.clientX;
      inp.py = e.clientY;
      inp.hasPointer = true;
      inp.fx = null;
      inp.fy = null;
      touch();
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      inp.px = t.clientX;
      inp.py = t.clientY;
      inp.hasPointer = true;
      touch();
    };
    const onKey = () => touch();
    const onFocusIn = (e: FocusEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-attention]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      inp.fx = r.left + r.width / 2;
      inp.fy = r.top + r.height / 2;
      touch();
    };
    const onFocusOut = () => {
      inp.fx = null;
      inp.fy = null;
    };
    const onDbl = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input,button,a,form,footer")) return;
      setPins((prev) => {
        const next = [...prev, { id: ++pinId.current, x: e.clientX, y: e.clientY }];
        return next.length > 12 ? next.slice(next.length - 12) : next;
      });
      touch();
    };
    const onResize = () => {
      engine.resize();
      progress();
      computeKeepouts();
    };

    progress();
    computeKeepouts();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("dblclick", onDbl);
    window.addEventListener("resize", onResize);

    const h = window.location.hash;
    if (h.length > 1) {
      const el = document.querySelector(h);
      if (el) {
        const sb = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        requestAnimationFrame(() => {
          el.scrollIntoView();
          progress();
          computeKeepouts();
          document.documentElement.style.scrollBehavior = sb;
        });
      }
    }

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts) {
      fonts.ready.then(() => engine.start());
    } else {
      engine.start();
    }

    return () => {
      engine.destroy();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("dblclick", onDbl);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onWord = (w: string) => setWord(w);
  const onTemperature = (t: number) => setTemperature(t);

  return (
    <>
      <canvas ref={canvasRef} className="field" aria-hidden="true" />
      <main className="page">
        <Hero touched={touched} />
        <Thinking />
        <Creating temperature={temperature} onTemperature={onTemperature} />
        <Collaborating onWord={onWord} />
        <Coda />
      </main>
      {pins.map((p) => (
        <span key={p.id} className="pin" style={{ left: p.x, top: p.y }} aria-hidden="true" />
      ))}
      <div className={`idle-hint ${idle ? "show" : ""}`} aria-hidden="true">
        還在看嗎？動一下，我就回來。
      </div>
    </>
  );
}
