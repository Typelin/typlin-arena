import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  bobPos,
  createSim,
  home,
  impulse,
  pointerTheta,
  registerNote,
  release,
  stepSim,
  tapPin,
  visualShearDeg,
  wrapAngle,
  type PlumbSim,
} from '../engine/pendulum';
import { drawPlate } from '../engine/draw';
import {
  creak,
  initAudio,
  isMuted,
  knock,
  noteMark,
  notch,
  pinClick,
  releaseThud,
  setHum,
  setMuted,
  setWind as setWindAudio,
  stamp as stampSound,
  stringDraw,
  tick,
} from '../engine/audio';
import { useStageSize } from '../hooks/useStageSize';

export type Snapshot = {
  theta: number;
  deg: number;
  swings: number;
  maxAbs: number;
  settleMs: number | null;
  touched: boolean;
  heldOff: boolean;
  notes: number;
  nearTrue: boolean;
  introDone: boolean;
  stamped: boolean;
};

export type Readout = {
  nearTrue: boolean;
  settled: boolean;
  slitY: number;
  theta: number;
  omega: number;
  knocked: string[];
};

export type PlumbHandle = {
  nudge: (dir: number) => void;
  snapshot: () => Snapshot;
  muteToggle: () => boolean;
  setWind: (w: number) => void;
  setScroll: (p: number, chapter: number) => void;
  getRead: () => Readout;
};

type Props = {
  reduced: boolean;
  onConfession: () => void;
  onStamp: () => void;
  onEtymology: () => void;
  onIntroDone: () => void;
  onKnock: (id: string) => void;
};

function layout(w: number, h: number, scrollP: number) {
  const mobile = w < 720;
  const grow = 1 + scrollP * 0.1;
  const originX = mobile ? w * 0.5 : w * 0.3;
  const L0 = mobile
    ? Math.max(108, Math.min(h * 0.62, w * 0.44, 260))
    : Math.max(170, Math.min(h * 0.56, w * 0.28, 400));
  const L = L0 * grow;
  const originY = mobile ? Math.max(36, (h - L) * 0.42) : Math.max(34, h * 0.1 + scrollP * 18);
  const bobSize = Math.max(10, Math.min(18, L * 0.048));
  return { originX, originY, L, mobile, bobSize };
}

function snapOf(sim: PlumbSim): Snapshot {
  const th = wrapAngle(sim.theta);
  return {
    theta: th,
    deg: (th * 180) / Math.PI,
    swings: sim.swings,
    maxAbs: sim.maxAbs,
    settleMs: sim.settleMs,
    touched: sim.touched,
    heldOff: sim.heldOff,
    notes: sim.notes.length,
    nearTrue: Math.abs(th) < 0.014 && sim.mode !== 'intro',
    introDone: sim.mode !== 'intro',
    stamped: sim.stamped,
  };
}

export const PlumbStage = forwardRef<PlumbHandle, Props>(function PlumbStage(
  { reduced, onConfession, onStamp, onEtymology, onIntroDone, onKnock },
  ref,
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<PlumbSim>(createSim());
  const bobBtn = useRef<HTMLButtonElement>(null);
  const pinBtn = useRef<HTMLButtonElement>(null);
  const degRef = useRef<HTMLSpanElement>(null);
  const swingRef = useRef<HTMLSpanElement>(null);
  const { w, h } = useStageSize(wrapRef);

  type Drag = {
    id: number;
    samples: { t: number; th: number }[];
    x: number;
    y: number;
  };
  const dragRef = useRef<Drag | null>(null);
  const flashRef = useRef(0);
  const lastRef = useRef(0);
  const layoutRef = useRef({ originX: 0, originY: 0, L: 180, mobile: false, bobSize: 12 });
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const windRef = useRef(0);
  const scrollRef = useRef(0);
  const chapterRef = useRef(0);
  const holdingRef = useRef(false);
  const lastCreak = useRef(0);
  const slitYRef = useRef(0);
  const cb = useRef({ onConfession, onStamp, onEtymology, onIntroDone, onKnock });
  cb.current = { onConfession, onStamp, onEtymology, onIntroDone, onKnock };

  useImperativeHandle(ref, () => ({
    nudge(dir: number) {
      const s = simRef.current;
      if (s.mode === 'drag' || s.mode === 'intro') return;
      impulse(s, dir, reducedRef.current);
    },
    snapshot() {
      return snapOf(simRef.current);
    },
    muteToggle() {
      const next = !isMuted();
      setMuted(next);
      return next;
    },
    setWind(w: number) {
      windRef.current = w;
      holdingRef.current = w > 0.2;
      setWindAudio(w);
    },
    setScroll(p: number, chapter: number) {
      scrollRef.current = Math.max(0, Math.min(1, p));
      chapterRef.current = chapter;
    },
    getRead() {
      const s = simRef.current;
      const th = wrapAngle(s.theta);
      return {
        nearTrue: Math.abs(th) < 0.09 && s.mode !== 'intro',
        settled: Math.abs(s.omega) < 0.55 && s.mode !== 'drag',
        slitY: slitYRef.current,
        theta: th,
        omega: s.omega,
        knocked: s.rejects.filter((r) => r.fallen).map((r) => r.id),
      };
    },
  }));

  const paintHit = useCallback(() => {
    const s = simRef.current;
    const { originX, originY, L } = layoutRef.current;
    const len = s.mode === 'intro' ? L * Math.max(0.001, s.introLen) : L;
    const p = bobPos(originX, originY, len, s.theta, s.stretch);
    if (bobBtn.current) {
      const ssz = layoutRef.current.bobSize;
      bobBtn.current.style.width = `${Math.max(48, ssz * 4.2)}px`;
      bobBtn.current.style.height = `${Math.max(56, ssz * 5.2)}px`;
      bobBtn.current.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
      bobBtn.current.style.opacity = s.mode === 'intro' && s.introBob < 0.4 ? '0' : '1';
    }
    if (pinBtn.current) {
      pinBtn.current.style.transform = `translate(${originX}px, ${originY}px) translate(-50%, -50%)`;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w < 2 || h < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutRef.current = layout(w, h, scrollRef.current);

    let raf = 0;
    lastRef.current = performance.now();

    const loop = (now: number) => {
      const raw = Math.min(0.034, (now - lastRef.current) / 1000);
      lastRef.current = now;
      const s = simRef.current;
      const lay = layout(w, h, scrollRef.current);
      layoutRef.current = lay;

      let dragTh: number | null = null;
      let dragStretch = 1;
      const drag = dragRef.current;
      if (s.mode === 'drag' && drag) {
        dragTh = pointerTheta(lay.originX, lay.originY, drag.x, drag.y);
        const dist = Math.hypot(drag.x - lay.originX, drag.y - lay.originY);
        dragStretch = Math.max(0.88, Math.min(1.13, dist / lay.L));
      }

      const info = stepSim(
        s,
        raw,
        now,
        reducedRef.current,
        s.mode === 'drag' ? dragTh : null,
        dragStretch,
        lay.originX,
        lay.originY,
        lay.L,
        windRef.current,
        chapterRef.current === 2,
      );

      if (info.crossed && !reducedRef.current) tick(info.crossStrength);
      if (info.crossed) flashRef.current = Math.max(flashRef.current, 0.35 + info.crossStrength * 0.65);
      if (info.confession) cb.current.onConfession();
      if (info.stamped) {
        stampSound();
        cb.current.onStamp();
      }
      if (info.introDone) cb.current.onIntroDone();
      if (info.introString && !reducedRef.current) stringDraw();
      if (info.notch && !reducedRef.current) notch();
      if (info.knocked) {
        if (!reducedRef.current) knock();
        cb.current.onKnock(info.knocked);
      }

      if (!reducedRef.current) {
        const speed = Math.min(1, Math.abs(s.omega) / 3.4);
        setHum(s.mode === 'drag' ? Math.max(0.15, speed) : speed, 70 + Math.abs(s.omega) * 18);
        if (s.mode === 'drag' && Math.abs(s.stretch - 1) > 0.04 && now - lastCreak.current > 140) {
          creak(Math.abs(s.stretch - 1) * 4);
          lastCreak.current = now;
        }
      } else {
        setHum(0);
      }

      flashRef.current *= Math.exp(-raw * 6.5);

      const len = s.mode === 'intro' ? lay.L * Math.max(0.001, s.introLen) : lay.L;
      const p = bobPos(lay.originX, lay.originY, len, s.theta, s.stretch);
      const shear = visualShearDeg(s.theta);
      const abs = Math.abs(wrapAngle(s.theta));
      const trueAmt = s.introBob < 0.5 ? 0 : Math.max(0, 1 - abs / 0.16);
      const root = document.documentElement;
      root.style.setProperty('--plumb-deg', shear.toFixed(3));
      root.style.setProperty('--plumb-abs', abs.toFixed(4));
      root.style.setProperty('--true', trueAmt.toFixed(3));
      const slitY = lay.mobile ? h : lay.originY + lay.L;
      slitYRef.current = slitY;
      root.style.setProperty('--slit-y', `${slitY.toFixed(1)}px`);

      if (degRef.current) {
        const d = (wrapAngle(s.theta) * 180) / Math.PI;
        const sign = d > 0.05 ? '+' : d < -0.05 ? '−' : ' ';
        degRef.current.textContent = `${sign}${Math.abs(d).toFixed(1)}°`;
      }
      if (swingRef.current) {
        swingRef.current.textContent = String(s.swings).padStart(2, '0');
      }

      drawPlate(ctx, s, {
        w,
        h,
        originX: lay.originX,
        originY: lay.originY,
        L: lay.L,
        bobX: p.x,
        bobY: p.y,
        flash: flashRef.current,
        reduced: reducedRef.current,
        bobSize: lay.bobSize,
        chapter: chapterRef.current,
        holding: holdingRef.current,
      });
      paintHit();
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [w, h, paintHit]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.target === bobBtn.current) return;
      const s = simRef.current;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        initAudio();
        impulse(s, -1, reducedRef.current);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        initAudio();
        impulse(s, 1, reducedRef.current);
      } else if (e.key === 'Home') {
        e.preventDefault();
        home(s, reducedRef.current);
      } else if (e.key === '0') {
        e.preventDefault();
        initAudio();
        if (registerNote(s, performance.now())) noteMark();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    initAudio();
    const s = simRef.current;
    if (s.mode === 'intro' && s.introBob < 0.5) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const lay = layoutRef.current;
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const th = pointerTheta(lay.originX, lay.originY, x, y);
    s.mode = 'drag';
    s.stamped = false;
    dragRef.current = {
      id: e.pointerId,
      samples: [{ t: performance.now(), th }],
      x,
      y,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lay = layoutRef.current;
    const th = pointerTheta(lay.originX, lay.originY, x, y);
    const t = performance.now();
    drag.samples.push({ t, th });
    if (drag.samples.length > 12) drag.samples.shift();
    drag.x = x;
    drag.y = y;
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const t = performance.now();
    const recent = drag.samples.filter((s) => t - s.t < 90);
    let omega = 0;
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      omega = (b.th - a.th) / Math.max(0.016, (b.t - a.t) / 1000);
    }
    omega = Math.max(-22, Math.min(22, omega));
    release(simRef.current, reducedRef.current ? omega * 0.15 : omega);
    if (!reducedRef.current) releaseThud(Math.min(1, Math.abs(omega) / 5));
    dragRef.current = null;
  };

  const onBobKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const s = simRef.current;
    initAudio();
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      impulse(s, -1, reducedRef.current);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      impulse(s, 1, reducedRef.current);
    } else if (e.key === 'Home') {
      e.preventDefault();
      home(s, reducedRef.current);
    } else if (e.key === '0' || e.key === 'Digit0') {
      e.preventDefault();
      if (registerNote(s, performance.now())) noteMark();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      setMuted(!isMuted());
    }
  };

  const onPin = () => {
    initAudio();
    pinClick();
    if (tapPin(simRef.current, performance.now())) cb.current.onEtymology();
  };

  return (
    <div className="stage" ref={wrapRef}>
      <canvas ref={canvasRef} className="stage__canvas" aria-hidden="true" />
      <button
        ref={pinBtn}
        type="button"
        className="hit hit--pin"
        aria-label="懸點。連點三次，看 grok 的本義。"
        onClick={onPin}
      />
      <button
        ref={bobBtn}
        type="button"
        className="hit hit--bob"
        aria-label="鉛垂。按住拖曳以撥動。左右方向鍵施力，Home 回正，0 記下讀數。"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onBobKey}
      />
      <div className="hud" aria-live="off">
        <div className="hud__brand">
          <span className="hud__model">GROK 4.6</span>
          <span className="hud__sep">·</span>
          <span>垂準儀</span>
        </div>
        <div className="hud__read">
          <span className="hud__k">偏角</span>
          <span className="hud__v" ref={degRef}>
            0.0°
          </span>
          <span className="hud__k">蕩</span>
          <span className="hud__v" ref={swingRef}>
            00
          </span>
        </div>
      </div>
    </div>
  );
});
