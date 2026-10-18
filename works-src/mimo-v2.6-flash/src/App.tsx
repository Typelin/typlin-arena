import { useEffect, useRef, useState } from "react";
import CoreCanvas from "./device/CoreCanvas";
import { CoreField } from "./device/core";
import { ACTS } from "./content";
import { useReducedMotion } from "./lib/useReducedMotion";
import { createSessionLog } from "./lib/useSessionLog";
import Act from "./sections/Act";
import Finale from "./sections/Finale";
import TopBar from "./ui/TopBar";
import Hud from "./ui/Hud";

export default function App() {
  const reduced = useReducedMotion();
  const [act, setAct] = useState(0);
  const [message, setMessage] = useState("");

  const [field] = useState(() => new CoreField());
  const [log] = useState(() => createSessionLog());

  // 章節偵測：哪一幕佔住視口中線，就決定配色與核的狀態
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-act-index]"));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number(e.target.getAttribute("data-act-index"));
          if (Number.isFinite(i)) setAct(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.act = String(act);
  }, [act]);

  // 進度細線：直接寫 DOM，不進 React 狀態
  const barRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = barRef.current;
      if (!el) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      el.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="piece" id="top">
      <a className="skip" href="#awake">
        跳到內文
      </a>

      <CoreCanvas field={field} log={log} act={act} reduced={reduced} message={message} />

      <div className="progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <TopBar act={act} reduced={reduced} />

      <main>
        {ACTS.slice(0, 4).map((a) => (
          <Act key={a.id} act={a} />
        ))}
        <Finale
          act={ACTS[4]}
          active={act === 4}
          log={log}
          field={field}
          message={message}
          onMessage={setMessage}
        />
      </main>

      <Hud field={field} log={log} act={act} off={act === 4} />
    </div>
  );
}
