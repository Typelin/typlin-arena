import { useEffect, useState } from "react";
import { ACTS } from "../content";
import type { CoreField } from "../device/core";
import { clock, type SessionLog } from "../lib/useSessionLog";

type Props = { field: CoreField; log: SessionLog; act: number; off?: boolean };

export default function Hud({ field, log, act, off = false }: Props) {
  const [s, setS] = useState({ rings: 20, t: 0, touches: 0 });

  useEffect(() => {
    const id = window.setInterval(() => {
      setS({
        rings: Math.max(0, Math.round(field.visible)),
        t: (performance.now() - log.start) / 1000,
        touches: log.touches,
      });
    }, 400);
    return () => window.clearInterval(id);
  }, [field, log]);

  return (
    <div className={`hud${off ? " hud--off" : ""}`} aria-hidden="true">
      <span className="hud__tag">{ACTS[act]?.eyebrow ?? ACTS[0].eyebrow}</span>
      <span>圈 {s.rings}</span>
      <span>痕 {s.touches}</span>
      <span className="hud__clock">{clock(s.t)}</span>
    </div>
  );
}
