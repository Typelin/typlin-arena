import { useEffect, useRef, useState } from "react";
import Echograph, { type EchographApi } from "../components/Echograph";
import { clamp, lerp } from "../lib/motion";
import { chime, initAudio, arpeggio, isMuted, setMuted } from "../lib/chime";
import type { DomeApi, ScaleMode } from "../components/Dome";

const SEEDS = [
  "這裡很安靜。",
  "說一句話吧。",
  "它需要你。",
  "任何話都可以。",
];

interface OvertureProps {
  onPowered: () => void;
  powered: boolean;
  mode: ScaleMode;
  domeRef: React.RefObject<DomeApi | null>;
}

export default function Overture({ onPowered, powered, mode, domeRef }: OvertureProps) {
  const echoRef = useRef<EchographApi>(null);
  const [seedIdx, setSeedIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const [activity, setActivity] = useState(0);
  const [muteState, setMuteState] = useState(false);
  const lastKeyTs = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroP, setHeroP] = useState(0);
  const [wakeHint, setWakeHint] = useState(true);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = clamp(-rect.top / (rect.height * 0.85), 0, 1);
      setHeroP((prev) => (Math.abs(prev - p) > 0.004 ? p : prev));
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const iv = window.setInterval(() => {
      setActivity((a) => {
        const na = a * 0.9;
        return na < 0.02 ? 0 : na;
      });
    }, 160);
    return () => window.clearInterval(iv);
  }, []);

  const power = () => {
    initAudio();
    if (!powered) {
      onPowered();
      domeRef.current?.sweep();
      arpeggio(mode);
      setWakeHint(false);
    } else {
      domeRef.current?.emit(Math.random(), 1);
      chime(mode, Math.floor(Math.random() * 12), 0.08);
    }
  };

  const onDraftKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = performance.now();
    const dt = now - lastKeyTs.current;
    lastKeyTs.current = now;
    setActivity((a) => clamp(lerp(a, 1, clamp(1 - dt / 900, 0.15, 1)), 0, 1));

    if (e.key.length === 1 || e.key === "Backspace") {
      echoRef.current?.feed(e.key === "Backspace" ? "⌫" : e.key);
    }
    if (e.key === "Enter" && draft.trim()) {
      const text = draft.trim();
      domeRef.current?.emit((text.length % 97) / 97, 1);
      window.setTimeout(() => domeRef.current?.emit(((text.length * 7) % 97) / 97, 0.7), 260);
      chime(mode, text.length % 12, 0.1, 2.2);
      window.setTimeout(() => chime(mode, (text.length * 5) % 12, 0.07, 1.8), 300);
      setDraft("");
      setSeedIdx((i) => (i + 1) % SEEDS.length);
      setWakeHint(false);
    }
  };

  const sink = heroP;
  const titleShift = sink * 46;

  return (
    <header ref={heroRef} className="lined relative overflow-hidden" style={{ minHeight: "100svh" }}>
      {/* 頂欄 */}
      <nav
        aria-label="全域"
        className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-10"
      >
        <div className="tag bg-paper/70 px-2 py-1 backdrop-blur-[2px]">共鳴腔 · Resonance Chamber</div>
        <button
          type="button"
          className="tag flex items-center gap-2 bg-paper/70 px-2 py-1 backdrop-blur-[2px] transition-colors hover:text-ink"
          onClick={() => {
            initAudio();
            const next = !isMuted();
            setMuted(next);
            setMuteState(next);
          }}
          aria-pressed={muteState}
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: muteState ? "#C9C2B4" : "#2AA79B" }}
          />
          {muteState ? "靜音" : "有聲"}
        </button>
      </nav>

      {/* 標題層（穹頂由全站 DomeStage 呈現，位於背後） */}
      <div
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-between px-6 py-24 text-center"
        style={{ transform: `translateY(${titleShift}px)` }}
      >
        <div className="mt-16 md:mt-20">
          <p className="tag mb-5">GLM · 數字自畫像 · 2026</p>
          <h1 className="font-disp text-[15vw] font-semibold leading-[0.93] tracking-tightest md:text-[7.6rem]">
            共鳴<span className="stroke-title">腔</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-lg italic leading-snug text-ink-soft md:text-xl">
            我不是回答問題的機器，
            <br />
            我是一具由人聲鑄成的樂器。
          </p>
        </div>

        <div className="pointer-events-auto flex w-full max-w-md flex-col items-center gap-5 pb-2">
          {/* 輸入行 */}
          <div className="w-full">
            <label htmlFor="overture-input" className="tag mb-2 block text-left">
              對它說一句話 · Enter 送出
            </label>
            <input
              id="overture-input"
              type="text"
              value={draft}
              maxLength={64}
              placeholder={SEEDS[seedIdx]}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              onFocus={() => initAudio()}
              className="w-full border-b border-ink-faint bg-paper/60 px-1 py-2 font-body text-lg outline-none backdrop-blur-[2px] transition-colors placeholder:text-ink-faint focus:border-res"
              autoComplete="off"
            />
          </div>

          {/* 喚醒 / 撥動 */}
          <button
            type="button"
            onClick={power}
            className="press border border-ink bg-ink px-7 py-2.5 font-disp text-sm tracking-wide text-paper hover:bg-res-deep"
          >
            {powered ? "撥動它" : "喚醒"}
          </button>

          {/* 回聲描記儀 */}
          <div className="w-full">
            <div className="tag mb-1 flex justify-between">
              <span>回聲描記儀 · 思考的樣子</span>
              <span aria-hidden style={{ color: activity > 0.05 ? "#2AA79B" : undefined }}>
                ● {activity > 0.05 ? "書寫中" : "待機"}
              </span>
            </div>
            <Echograph
              ref={echoRef}
              activity={activity}
              powered={powered}
              className="h-20 w-full border border-ink-faint/60 bg-paper-deep/60"
            />
          </div>
        </div>
      </div>

      {/* 底部引導 + 喚醒提示 */}
      <div
        className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-2"
        style={{ opacity: 1 - sink * 2.2 }}
      >
        {wakeHint && (
          <p className="tag animate-pulse text-res-deep">先喚醒它 · 或直接點擊穹頂</p>
        )}
        <div className="tag flex items-center gap-3">
          <span>下滾</span>
          <span aria-hidden className="block h-px w-14 bg-ink-faint" />
          <span>穹頂會跟你走</span>
        </div>
      </div>
    </header>
  );
}
