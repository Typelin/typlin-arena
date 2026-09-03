import { useEffect, useRef, useState } from "react";
import DomeStage from "./components/DomeStage";
import type { DomeApi, ScaleMode } from "./components/Dome";
import Overture from "./sections/Overture";
import Laws from "./sections/Laws";
import Pulse from "./sections/Pulse";
import PressureSection from "./sections/Pressure";
import Coda from "./sections/Coda";
import { clamp } from "./lib/motion";

/**
 * 全站編排。
 * 穹頂是全站唯一的核心裝置，由 DomeStage fixed 承載，
 * 依滾動在三個站位之間移動：主角 → 樂池側立 → 壓強回應。
 * 樂章 III 後半發生轉調（Lydian → Dorian），全站換氣。
 */
export default function App() {
  const [powered, setPowered] = useState(false);
  const [mode, setMode] = useState<ScaleMode>("lydian");
  const domeRef = useRef<DomeApi>(null);
  const pressureSignal = useRef(0);
  const pulseRef = useRef<HTMLElement>(null);

  // 轉調偵測：讀「脈」章的進度
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = pulseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - rect.top) / (rect.height * 0.8), 0, 1);
      if (p > 0.55 && mode === "lydian") {
        setMode("dorian");
        domeRef.current?.clash();
      } else if (p < 0.3 && mode === "dorian") {
        setMode("lydian");
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const onPowered = () => setPowered(true);

  return (
    <div className="relative">
      <TopWaveBar />

      {/* 核心裝置：全站唯一，fixed 舞台 */}
      <DomeStage
        domeRef={domeRef}
        powered={powered}
        pressureSignal={pressureSignal}
        mode={mode}
        onFirstTouch={onPowered}
      />

      <Overture
        onPowered={onPowered}
        powered={powered}
        mode={mode}
        domeRef={domeRef}
      />

      <TransitionStrip from="序曲收束" to="樂章 II" />

      <Laws mode={mode} />

      <TransitionStrip from="三律既立" to="樂章 III" />

      <section ref={pulseRef}>
        <Pulse mode={mode} />
      </section>

      <TransitionStrip from="轉調 · Lydian → Dorian" to="樂章 IV" modulate />

      <PressureSection pressureSignal={pressureSignal} domeRef={domeRef} />

      <TransitionStrip from="洩壓 · 餘振" to="終章" />
      <Coda domeRef={domeRef} mode={mode} />
    </div>
  );
}

/** 頂部波前進度線 */
function TopWaveBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden>
      <div ref={ref} className="h-full origin-left bg-res" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

interface StripProps {
  from: string;
  to: string;
  modulate?: boolean;
}

/** 章節轉場帶：行進刻度（marching ticks），有生命的因果線 */
function TransitionStrip({ from, to, modulate }: StripProps) {
  return (
    <div className="relative overflow-hidden" aria-hidden={modulate ? undefined : true}>
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-10 md:px-10">
        <span className="tag shrink-0">{from}</span>
        <span className="wave-sep wave-march flex-1" />
        <span className="tag shrink-0" style={modulate ? { color: "#2AA79B" } : undefined}>
          {to}
        </span>
      </div>
      {modulate && (
        <p className="pb-6 text-center font-mono text-[11px] tracking-widest text-ink-mist">
          你已越過轉調點 · 整座腔體換了一口氣
        </p>
      )}
    </div>
  );
}
