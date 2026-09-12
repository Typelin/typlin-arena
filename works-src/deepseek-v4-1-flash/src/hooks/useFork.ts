import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { ALL_FORKS, TOTAL_STEPS } from '../data/script';
import { ghostChoices, pathId } from '../engine/path';
import type { Choice } from '../engine/path';
import { boundsOf, easeInOutCubic, easeOutCubic, nodeAt, setSpreadScale } from '../engine/layout';
import type { Vec } from '../engine/layout';
import { hashString, mulberry32 } from '../engine/rng';
import { drawTree } from '../render/drawTree';
import type { Scene } from '../render/drawTree';
import { ClickAudio } from '../audio/clicks';
import { useReducedMotion } from './useReducedMotion';

export type Phase = 'choosing' | 'growing' | 'sealing' | 'replaying' | 'done';

/** 一次生長（一格墨線）。 */
const GROW_MS = 420;
/** 落墨之後的停頓，讓紙安靜下來。 */
const SEAL_MS = 460;
/** 回放的基準長度；實際會隨步數伸縮。 */
const REPLAY_BASE_MS = 2400;
const REPLAY_PER_STEP_MS = 140;
/** 幽靈森林的棵數。 */
const GHOST_COUNT = 9;

export type ForkApi = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  choices: Choice[];
  phase: Phase;
  hover: number | null;
  setHover: (v: number | null) => void;
  choose: (option: number) => void;
  reset: () => void;
  muted: boolean;
  toggleMute: () => void;
  ghostsOn: boolean;
  setGhostsOn: (v: boolean) => void;
  /** 總覽：拉遠到看得見整條路 */
  overview: boolean;
  toggleOverview: () => void;
  id: string;
  reduced: boolean;
};

export function useFork(): ForkApi {
  const reduced = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const [choices, setChoices] = useState<Choice[]>([]);
  const [phase, setPhase] = useState<Phase>('choosing');
  const [hover, setHover] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [ghostsOn, setGhostsOn] = useState(false);
  const [overview, setOverview] = useState(false);

  // ── 給動畫迴圈讀的即時值（state 是非同步的，迴圈不能等） ──
  const choicesRef = useRef<Choice[]>([]);
  const phaseRef = useRef<Phase>('choosing');
  const hoverRef = useRef<number | null>(null);
  const ghostsRef = useRef(false);
  const reducedRef = useRef(reduced);
  const mutedRef = useRef(muted);
  const overviewRef = useRef(false);

  const audioRef = useRef<ClickAudio | null>(null);
  const camRef = useRef<Vec>({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const camReadyRef = useRef(false);
  const growRef = useRef<{ start: number; done: boolean } | null>(null);
  const replayRef = useRef<{ start: number; pinged: number; dur: number } | null>(null);
  const shakeRef = useRef<{ start: number } | null>(null);
  const sealUntilRef = useRef(0);
  const ghostCacheRef = useRef<{ key: string; data: Choice[][] } | null>(null);

  useEffect(() => {
    hoverRef.current = hover;
  }, [hover]);
  useEffect(() => {
    ghostsRef.current = ghostsOn;
  }, [ghostsOn]);
  useEffect(() => {
    overviewRef.current = overview;
  }, [overview]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  useEffect(() => {
    mutedRef.current = muted;
    audioRef.current?.setMuted(muted);
  }, [muted]);

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  // ── 動畫與繪製迴圈 ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audio = new ClickAudio();
    audio.setMuted(mutedRef.current);
    audioRef.current = audio;

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }

      const chs = choicesRef.current;
      const total = chs.length;
      const red = reducedRef.current;

      // 窄螢幕收窄枝的展開量
      setSpreadScale(w < 560 ? 0.5 : w < 900 ? 0.72 : 1);

      // 生長
      let reveal = total;
      let growProgress = 1;
      const g = growRef.current;
      if (g) {
        const t = red ? 1 : Math.min(1, (now - g.start) / GROW_MS);
        growProgress = easeOutCubic(t);
        reveal = total - 1;
        if (t >= 1) {
          growProgress = 1;
          reveal = total;
          growRef.current = null;
          if (total >= TOTAL_STEPS) {
            audio.seal();
            shakeRef.current = { start: now };
            sealUntilRef.current = now + (red ? 140 : SEAL_MS);
            setPhaseBoth('sealing');
          } else {
            setPhaseBoth('choosing');
          }
        }
      }

      // 落墨之後 → 回放
      if (phaseRef.current === 'sealing' && now >= sealUntilRef.current) {
        replayRef.current = {
          start: now,
          pinged: -1,
          dur: REPLAY_BASE_MS + total * REPLAY_PER_STEP_MS,
        };
        setPhaseBoth('replaying');
      }

      // 回放：樹保持完整，逐格指出你放棄了什麼
      let highlight: number | null = null;
      let highlightAlpha = 0;
      let replayIdx = -1;
      const rp = replayRef.current;
      if (rp) {
        const t = red ? 1 : Math.min(1, (now - rp.start) / rp.dur);
        const prog = easeInOutCubic(t) * total;
        reveal = total;
        replayIdx = Math.min(total, Math.floor(prog));
        const frac = prog - Math.floor(prog);
        if (replayIdx > 0) {
          highlight = replayIdx - 1;
          highlightAlpha = 1 - frac;
        }
        if (replayIdx > rp.pinged) {
          rp.pinged = replayIdx;
          if (replayIdx > 0 && replayIdx <= total) audio.ping(replayIdx);
        }
        if (t >= 1) {
          replayRef.current = null;
          setPhaseBoth('done');
        }
      }

      // ── 鏡頭 ────────────────────────────────────────────────
      // 平常：末端置中。回放：跟著掃描線從起點走回末端。
      // 收束：稍微拉遠，回頭看最後這幾步——路的盡頭，然後溶進紙裡。
      const tip = nodeAt(chs, total);
      const k = red || !camReadyRef.current ? 1 : 1 - Math.pow(0.0022, dt);
      camReadyRef.current = true;

      let targetZoom = 1;
      let tx = tip.x - w / 2;
      // 末端節點的垂直錨點。視窗太矮時要往上收，
      // 否則懸掛的長標籤會壓到底部提示列。
      const anchor = Math.min(h * 0.45, Math.max(110, h - 380));
      let ty = tip.y - anchor;

      if (overviewRef.current && total > 0) {
        // 總覽：把整條路徑塞進畫面，讓三十步的形狀一眼可見
        const b = boundsOf(chs, total);
        const padX = 96;
        const padY = 96;
        const zw = (w - padX * 2) / Math.max(1, b.maxX - b.minX);
        const zh = (h - padY * 2) / Math.max(1, b.maxY - b.minY);
        targetZoom = Math.max(0.03, Math.min(1, Math.min(zw, zh)));
        tx = (b.minX + b.maxX) / 2 - w / (2 * targetZoom);
        ty = (b.minY + b.maxY) / 2 - h / (2 * targetZoom);
      } else if (replayIdx >= 0) {
        const n = nodeAt(chs, replayIdx);
        tx = n.x - w / 2;
        ty = n.y - h * 0.52;
      } else if (phaseRef.current === 'done' && total > 0) {
        targetZoom = 0.42;
        const back = nodeAt(chs, Math.max(0, total - 3));
        tx = back.x - w / (2 * targetZoom);
        ty = back.y - (h * 0.16) / targetZoom;
      }

      zoomRef.current += (targetZoom - zoomRef.current) * k;
      camRef.current = {
        x: camRef.current.x + (tx - camRef.current.x) * k,
        y: camRef.current.y + (ty - camRef.current.y) * k,
      };

      // 落墨的紙面震動
      let shake = 0;
      const sk = shakeRef.current;
      if (sk) {
        const t = (now - sk.start) / 900;
        if (t >= 1) {
          shakeRef.current = null;
        } else {
          shake = (1 - t) * (1 - t);
        }
      }

      // 幽靈森林：同一題在別的路徑下會長成的樹（快取，別每幀重建）
      let ghosts: Choice[][] | null = null;
      if (ghostsRef.current && chs.length > 0) {
        const key = chs.map((c) => c.option).join('');
        if (!ghostCacheRef.current || ghostCacheRef.current.key !== key) {
          const seed = mulberry32(hashString('ghost-forest'));
          const data: Choice[][] = [];
          for (let i = 0; i < GHOST_COUNT; i += 1) {
            data.push(ghostChoices(chs, i, () => seed()));
          }
          ghostCacheRef.current = { key, data };
        }
        ghosts = ghostCacheRef.current.data;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scene: Scene = {
        choices: chs,
        hover: hoverRef.current,
        reveal,
        growProgress,
        highlight,
        highlightAlpha,
        ghosts,
        cam: camRef.current,
        zoom: zoomRef.current,
        w,
        h,
        time: now / 1000,
        shake,
      };
      drawTree(ctx, scene);

      if (worldRef.current) {
        const z = zoomRef.current;
        worldRef.current.style.transform = `translate3d(${-camRef.current.x * z}px, ${
          -camRef.current.y * z
        }px, 0) scale(${z})`;
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      audio.dispose();
      audioRef.current = null;
    };
  }, [setPhaseBoth]);

  // ── 選擇 ───────────────────────────────────────────────────
  const choose = useCallback(
    (option: number) => {
      const chs = choicesRef.current;
      if (chs.length >= TOTAL_STEPS) return;
      if (phaseRef.current === 'growing') return;
      if (phaseRef.current !== 'choosing') return;
      const fork = ALL_FORKS[chs.length];
      if (!fork) return;
      if (option < 0 || option >= fork.options.length) return;

      audioRef.current?.tick(chs.length);
      const next = [...chs, { fork: fork.index, option }];
      choicesRef.current = next;
      growRef.current = { start: performance.now(), done: false };
      setChoices(next);
      setPhaseBoth('growing');
      setHover(null);
    },
    [setPhaseBoth]
  );

  const reset = useCallback(() => {
    choicesRef.current = [];
    growRef.current = null;
    replayRef.current = null;
    shakeRef.current = null;
    sealUntilRef.current = 0;
    setChoices([]);
    setPhaseBoth('choosing');
    setHover(null);
    setGhostsOn(false);
    setOverview(false);
  }, [setPhaseBoth]);

  const toggleMute = useCallback(() => setMuted((v) => !v), []);

  const toggleOverview = useCallback(() => setOverview((v) => !v), []);

  // ── 鍵盤：Shift 掀開幽靈森林 ───────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setGhostsOn(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setGhostsOn(false);
    };
    const blur = () => setGhostsOn(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const id = useMemo(() => pathId(choices), [choices]);

  return {
    canvasRef,
    worldRef,
    choices,
    phase,
    hover,
    setHover,
    choose,
    reset,
    muted,
    toggleMute,
    ghostsOn,
    setGhostsOn,
    overview,
    toggleOverview,
    id,
    reduced,
  };
}
