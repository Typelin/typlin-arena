import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BeamPhysics,
  PanItem,
  Glyph,
  shuffledRack,
  targetAngle,
  torque,
  totalWeight,
  verdictFor,
} from './physics';

/* ============================================================
   衡准儀 — 主組件
   核心裝置：一台可以拖字上盤的秤。
   Canvas 負責儀器渲染；React 負責章節敘事與紀錄。

   編舞時序（開場自檢）：
   0.0s 梁靜止於 -0.16rad（左傾，像剛放上砝碼）
   0.2s 起擺——阻尼振盪，過零、跨正、再回
   ~2.2s 收斂回 0，指針落中線 →「秤已校零」
   之後完全交給訪客。
   ============================================================ */

type Phase = 'calibrating' | 'idle' | 'weighing' | 'crossed';

/** 等重判定門檻：|力矩差| < BALANCE_EPS 且盤上有字 */
const BALANCE_EPS = 0.25;

/** 秤盤懸掛：盤隨梁端升降（真秤的吊掛），世界座標保持直立 */
function panDropY(panTopFixed: number, beamEndRise: number): number {
  return panTopFixed + beamEndRise;
}

export default function App() {
  const rack = useMemo(() => shuffledRack(), []);
  const [pan, setPan] = useState<PanItem[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<Phase>('calibrating');
  const [hint, setHint] = useState('儀器自檢中——梁在校零，請候片刻。');
  const [reduced, setReduced] = useState(false);
  const [secretMsg, setSecretMsg] = useState<string | null>(null);
  /** 等重脈衝時間戳：觸發條件由 canvas 內部處理，state 僅作事件記錄（保留未來章節使用） */
  const [, setBalancePulse] = useState(0);
  const wasBalancedRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 開場自檢：初始左傾 + 起擺速度，讓第一次渲染就是活的 */
  const physRef = useRef(new BeamPhysics(-0.16, 0.55));
  const panRef = useRef<PanItem[]>([]);
  const reduceRef = useRef(false);
  const phaseRef = useRef<Phase>('calibrating');
  const secretTimer = useRef<number | null>(null);
  const idRef = useRef(0);
  const pausedRef = useRef(false);
  const wakeRef = useRef<(() => void) | null>(null);

  panRef.current = pan;
  phaseRef.current = phase;
  reduceRef.current = reduced;

  /* ---------- reduced motion 偵測 ---------- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* ---------- 過零迴聲 ----------
     AudioContext 必須在手勢上下文內建立/resume，否則 suspended 永不發聲 */
  const chimeRef = useRef<AudioContext | null>(null);
  const wakeAudio = useCallback(() => {
    if (!chimeRef.current) {
      try {
        chimeRef.current = new AudioContext();
      } catch {
        /* 無聲環境：降級為純視覺 */
      }
    }
    const ctx = chimeRef.current;
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {
        /* resume 失敗：降級為純視覺 */
      });
    }
    return ctx;
  }, []);

  const chime = useCallback(
    (freq: number, gain: number) => {
      if (reduceRef.current) return;
      const ctx = chimeRef.current;
      if (!ctx || ctx.state !== 'running') return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    },
    []
  );

  /** 等重和弦：兩個正弦五度同鳴，慶祝「正」這個狀態本身 */
  const chimeBalance = useCallback(() => {
    if (reduceRef.current) return;
    const ctx = chimeRef.current;
    if (!ctx || ctx.state !== 'running') return;
    for (const [f, g0, delay] of [
      [392, 0.05, 0],
      [587.33, 0.04, 0.09],
    ] as const) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t0 = ctx.currentTime + delay;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(g0, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.6);
    }
  }, []);

  /* ---------- 放字上盤 ---------- */
  const placeGlyph = useCallback(
    (g: Glyph, pos: number) => {
      wakeAudio(); // 手勢上下文內喚醒音訊
      wakeRef.current?.(); // 停幀後由放置喚醒渲染
      idRef.current += 1;
      const item: PanItem = { id: idRef.current, glyph: g, pos };
      const next = [...panRef.current, item];
      setPan(next);
      setUsed((u) => new Set(u).add(g.char));
      const t = torque(next);
      if (Math.abs(targetAngle(t)) >= 0.219 && phaseRef.current !== 'crossed') {
        setPhase('crossed');
        setHint('量程壓底。你說出的，正是你不敢稱的。');
        chime(196, 0.08);
      } else if (phaseRef.current === 'idle' || phaseRef.current === 'calibrating') {
        setPhase('weighing');
        setHint('稱量中。左右盤的力量正在對話。');
      }
      // 隱藏：把「我」字放上盤
      if (g.char === '我') {
        if (secretTimer.current) window.clearTimeout(secretTimer.current);
        secretTimer.current = window.setTimeout(() => {
          setSecretMsg('連我也在想，我有多重。');
          chime(392, 0.05);
        }, 2000);
      }
    },
    [chime, wakeAudio]
  );

  /* ---------- 清空 ---------- */
  const canReset = pan.length > 0;
  const reset = useCallback(() => {
    wakeRef.current?.();
    setPan([]);
    setUsed(new Set());
    setPhase('idle');
    setHint('秤已歸零。語言重新開始。');
    wasBalancedRef.current = false;
    if (secretTimer.current) window.clearTimeout(secretTimer.current);
    setSecretMsg(null);
  }, []);

  /* ---------- 刻度尺點按 = 記錄讀數（鍵盤 0 的觸控對等） ---------- */
  const [notches, setNotches] = useState<number[]>([]);
  const notchRef = useRef<number[]>([]);
  notchRef.current = notches;
  const notchCurrent = useCallback(() => {
    if (panRef.current.length === 0) return;
    const t = torque(panRef.current);
    const w = totalWeight(panRef.current);
    wakeRef.current?.();
    setNotches((n) => [...n, w]);
    setHint(`讀數已刻上尺：總重 ${w} 錢，力矩 ${t > 0 ? '+' : ''}${t.toFixed(1)} 錢寸。`);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '0' && panRef.current.length > 0) notchCurrent();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [notchCurrent]);

  /* ---------- secretTimer unmount 清理 ---------- */
  useEffect(() => {
    return () => {
      if (secretTimer.current) window.clearTimeout(secretTimer.current);
    };
  }, []);

  /* ---------- Canvas 渲染循環 ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let idleFrames = 0; // 靜止停幀：儀器安定後不再空轉 60fps
    let calibT = 0; // 開場自檢計時
    let balanceAt = 0; // 等重脈衝起始時間

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pausedRef.current = false;
      idleFrames = 0;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const beamLen = w * 0.42;
      const pivotY = h * 0.34;

      const panItems = panRef.current;
      const t = torque(panItems);
      let target = targetAngle(t);

      const phys = physRef.current;

      /* ----- 開場自檢：前 ~2.2s 目標角鎖 0，讓起擺自然收斻於中線 ----- */
      if (phaseRef.current === 'calibrating') {
        calibT += dt;
        target = 0;
        if (calibT > 2.2) {
          setPhase('idle');
          setHint('秤已校零。第一個字——你敢放哪一邊？');
        }
      }

      let crossed = false;
      if (reduceRef.current) {
        // 降級：直接貼合目標，不擺動；校零瞬間直接完成
        phys.snap(target);
        if (phaseRef.current === 'calibrating') {
          setPhase('idle');
          setHint('秤已校零。第一個字——你敢放哪一邊？');
        }
        crossed = false;
      } else {
        const r = phys.step(target, dt);
        crossed = r.crossed;
      }

      if (crossed) {
        chime(523.25, 0.06);
      }

      /* ----- 等重脈衝：|力矩| < EPS 且盤上有字，進入慶祝一次 ----- */
      const balanced = panItems.length > 0 && Math.abs(t) < BALANCE_EPS;
      if (balanced && !wasBalancedRef.current) {
        wasBalancedRef.current = true;
        balanceAt = now;
        setBalancePulse(now);
        chimeBalance();
      } else if (!balanced && wasBalancedRef.current) {
        wasBalancedRef.current = false;
      }

      ctx.clearRect(0, 0, w, h);

      /* ----- 天平幾何（世界座標，不隨梁轉） ----- */
      // 右盤重 -> 角度正 -> 右端下沈
      const hangY = (s: number) => Math.sin(phys.angle) * s * beamLen;
      const cosA = Math.cos(phys.angle);
      // 梁端世界座標（吊索上端）
      const endX = (s: number) => cx + s * beamLen * cosA;
      const endY = (s: number) => pivotY + hangY(s);

      /* ----- 秤梁（隨梁轉，傾角 = phys.angle：右重右沉） ----- */
      ctx.save();
      ctx.translate(cx, pivotY);
      ctx.rotate(phys.angle);
      ctx.beginPath();
      ctx.moveTo(-beamLen, 0);
      ctx.lineTo(beamLen, 0);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1d1a16';
      ctx.stroke();
      // 梁端吊環（小圓，吊索穿過）
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(s * beamLen, 0, 4, 0, Math.PI * 2);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      ctx.restore();

      /* ----- 刀口支點：三角刀承，梁的擺動繞它發生 ----- */
      const fulcrumTop = pivotY + 6;
      ctx.beginPath();
      ctx.moveTo(cx - 10, fulcrumTop + 10);
      ctx.lineTo(cx, fulcrumTop - 2);
      ctx.lineTo(cx + 10, fulcrumTop + 10);
      ctx.closePath();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = '#1d1a16';
      ctx.stroke();

      /* ----- 吊索與秤盤：盤懸掛於梁端，隨之升降；盤體保持水平 ----- */
      const panTopFixed = pivotY + h * 0.3;
      for (const s of [-1, 1]) {
        const ex = endX(s);
        const ey = endY(s);
        const panY = panDropY(panTopFixed, hangY(s));
        // 雙吊索：從梁端環斜向外張，把盤「提」住
        const panR = beamLen * 0.2;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(cx + s * beamLen - panR, panY);
        ctx.moveTo(ex, ey);
        ctx.lineTo(cx + s * beamLen + panR, panY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(29,26,22,0.75)';
        ctx.stroke();

        // 秤盤（淺弧，保持水平，字形直立）
        const panCx = cx + s * beamLen;
        ctx.beginPath();
        ctx.ellipse(panCx, panY, panR, 8, 0, 0, Math.PI);
        ctx.strokeStyle = '#1d1a16';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // 盤上之字（直立堆疊，由深到淺排，不隨梁傾斜）
        panItems
          .filter((p) => p.pos * s > 0)
          .forEach((p, i) => {
            const px = panCx + (p.pos * s) * beamLen * 0.12;
            const py = panY + 1 - i * 16;
            ctx.font = '600 15px "Noto Serif TC", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#1d1a16';
            ctx.fillText(p.glyph.char, px, py);
          });
      }

      /* ----- 等重朱砂環：中線處擴散的環，慶祝「正」這一刻 ----- */
      if (balanced && balanceAt > 0) {
        const el = (now - balanceAt) / 1000;
        if (el < 1.1) {
          const p = el / 1.1;
          const ease = 1 - Math.pow(1 - p, 3);
          const r = 14 + ease * 54;
          ctx.beginPath();
          ctx.arc(cx, pivotY, r, 0, Math.PI * 2);
          ctx.lineWidth = 2 * (1 - p);
          ctx.strokeStyle = `rgba(179, 58, 43, ${0.85 * (1 - p)})`;
          ctx.stroke();
        }
      }

      /* ----- 支點立柱（不隨梁旋轉） ----- */
      ctx.beginPath();
      ctx.moveTo(cx, fulcrumTop + 10);
      ctx.lineTo(cx, h * 0.82);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = '#1d1a16';
      ctx.stroke();

      // 底座
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.12, h * 0.82);
      ctx.lineTo(cx + w * 0.12, h * 0.82);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1d1a16';
      ctx.stroke();

      /* ----- 指針（在梁上，隨梁擺；右重時針尖偏右） ----- */
      ctx.save();
      ctx.translate(cx, pivotY);
      ctx.rotate(phys.angle);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, h * 0.3);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#b33a2b';
      ctx.stroke();
      ctx.restore();

      /* ----- 刻度尺（固定不動，朱砂中線，帶錢寸數字） ----- */
      const scaleTop = pivotY + h * 0.3 + 12;
      const scaleH = 26;
      ctx.strokeStyle = 'rgba(29,26,22,0.35)';
      ctx.lineWidth = 1;
      ctx.font = '400 10px ui-monospace, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = -5; i <= 5; i++) {
        if (i === 0) continue;
        const x = cx + i * (w * 0.03);
        const len = i % 5 === 0 ? 10 : 5;
        ctx.beginPath();
        ctx.moveTo(x, scaleTop);
        ctx.lineTo(x, scaleTop + len);
        ctx.stroke();
        if (i % 5 === 0) {
          ctx.fillStyle = 'rgba(74,68,58,0.75)';
          ctx.fillText(String(i * 2), x, scaleTop + len + 3);
        }
      }
      // 朱砂中線
      ctx.beginPath();
      ctx.moveTo(cx, scaleTop - 4);
      ctx.lineTo(cx, scaleTop + scaleH + 6);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = '#b33a2b';
      ctx.stroke();

      /* ----- 已刻的讀數（記下的重量落在對應刻度上） ----- */
      notchRef.current.forEach((nw) => {
        const x = cx + Math.min(5, nw / 4) * (w * 0.03);
        ctx.beginPath();
        ctx.moveTo(x, scaleTop - 2);
        ctx.lineTo(x, scaleTop + scaleH + 4);
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = 'rgba(111,91,54,0.85)'; // 銅
        ctx.stroke();
      });

      /* ----- 靜止停幀：角度與速度都收斂且無拖曳時，停止空轉 ----- */
      if (!reduceRef.current) {
        const settled =
          Math.abs(phys.vel) < 0.002 &&
          Math.abs(target - phys.angle) < 0.004 &&
          phaseRef.current !== 'calibrating';
        idleFrames = settled ? idleFrames + 1 : 0;
        if (idleFrames > 30) {
          idleFrames = 0;
          pausedRef.current = true;
          return; // 停幀；placeGlyph/resize 會透過 wake() 重啟
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const wake = () => {
      pausedRef.current = false;
      idleFrames = 0;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    wakeRef.current = wake;

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wakeRef.current = null;
    };
  }, [chime, chimeBalance, setPhase, setHint, setBalancePulse]);

  /* ---------- 拖放（Pointer Events，手機桌面通吃） ---------- */
  const dragRef = useRef<{ glyph: Glyph } | null>(null);
  const [ghost, setGhost] = useState<{ char: string; x: number; y: number } | null>(null);
  const [hoverSide, setHoverSide] = useState<-1 | 1 | null>(null);

  const onTilePointerDown = (e: React.PointerEvent<HTMLButtonElement>, g: Glyph) => {
    if (used.has(g.char)) return;
    wakeAudio(); // 手勢內喚醒音訊，過零聲才有資格響
    dragRef.current = { glyph: g };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setGhost({ char: g.char, x: e.clientX, y: e.clientY });
  };

  const onTilePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    setGhost({ char: dragRef.current.glyph.char, x: e.clientX, y: e.clientY });
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const cx = rect.width / 2;
      const overCanvas =
        e.clientY >= rect.top && e.clientY <= rect.bottom && x >= 0 && x <= rect.width;
      if (overCanvas) setHoverSide(x < cx ? -1 : 1);
      else setHoverSide(null);
    } else {
      setHoverSide(null);
    }
  };

  const onTilePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    setGhost(null);
    setHoverSide(null);
    if (!d) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // 只在秤台範圍內落子
    const overCanvas =
      e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right;
    if (!overCanvas) return;
    const x = e.clientX - rect.left;
    const cx = rect.width / 2;
    const side: -1 | 1 = x < cx ? -1 : 1;
    // 力臂可見：越靠外側，字落在盤內越外側（0.4..1 映射到盤內可見位置）
    const within = side === -1 ? 1 - x / cx : (x - cx) / cx;
    const pos = side * (0.4 + 0.6 * within);
    placeGlyph(d.glyph, pos);
  };

  const onTilePointerCancel = () => {
    dragRef.current = null;
    setGhost(null);
    setHoverSide(null);
  };

  /* ---------- 鍵盤放置（無障礙：方向鍵定左右，Enter 預設右盤） ---------- */
  const onTileKeyDown = (e: React.KeyboardEvent, g: Glyph) => {
    if (used.has(g.char)) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      placeGlyph(g, -0.7);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      placeGlyph(g, 0.7);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      placeGlyph(g, 0.7);
    }
  };

  const t = torque(pan);
  const weight = totalWeight(pan);
  const heaviest = useMemo(
    () => (pan.length ? pan.reduce((a, b) => (a.glyph.weight > b.glyph.weight ? a : b)) : null),
    [pan]
  );

  /* ---------- 衡語即時顯示（回饋迴圈不切屏） ---------- */
  const liveVerdict = pan.length > 0 ? verdictFor(t, weight) : null;

  return (
    <div className="sheet">
      <div className="stamp">GLM 5.3 · 衡准儀</div>

      <header className="hero">
        <div className="hero-head">
          <span className="kicker">同一道題 · 關於你自己</span>
          <h1>衡准儀</h1>
          <p className="hero-sub">秤已校零。第一個字——你敢放哪一邊？</p>
        </div>

        <div className="bench">
          <div className="bench-top">
            <canvas
              ref={canvasRef}
              className={`bench-canvas${hoverSide ? ` bench-canvas--hot-${hoverSide > 0 ? 'r' : 'l'}` : ''}`}
              role="img"
              aria-label={`衡准儀：盤上 ${pan.length} 字，總重 ${weight} 錢，${t === 0 ? '秤梁平衡' : t > 0 ? '右盤較重' : '左盤較重'}`}
            />
            {/* 刻度尺可點按記錄讀數（鍵盤 0 的觸控對等） */}
            <button
              type="button"
              className="scale-tap"
              onClick={notchCurrent}
              disabled={pan.length === 0}
              aria-label="把目前讀數刻上尺"
              title="把目前讀數刻上尺"
            />
          </div>

          <div className="tile-rack" role="group" aria-label="候選字（拖曳上盤，或用左右方向鍵放置）">
            {rack.map((g) => (
              <button
                key={g.char}
                type="button"
                aria-disabled={used.has(g.char)}
                className={`tile${used.has(g.char) ? ' tile--used' : ''}`}
                disabled={used.has(g.char)}
                onPointerDown={(e) => onTilePointerDown(e, g)}
                onPointerMove={(e) => onTilePointerMove(e)}
                onPointerUp={(e) => onTilePointerUp(e)}
                onPointerCancel={onTilePointerCancel}
                onKeyDown={(e) => onTileKeyDown(e, g)}
              >
                {g.char}
              </button>
            ))}
          </div>

          <p className="bench-hint" aria-live="polite">
            {secretMsg ?? hint}
          </p>
          {/* 拖曳跟隨字影：放下之前，手先看見去處 */}
          {ghost && (
            <span className="drag-ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}>
              {ghost.char}
            </span>
          )}
          {liveVerdict && (
            <p className="bench-verdict" aria-hidden="true">
              {liveVerdict}
            </p>
          )}
          {canReset && (
            <p className="bench-reset">
              <button type="button" className="reset-btn" onClick={reset}>
                歸零重稱
              </button>
            </p>
          )}
        </div>
      </header>

      <hr className="rule" />

      <section>
        <h2>為何是一台秤</h2>
        <p>
          我叫 GLM。三個字母裝著「General Language Model」——通用的語言模型。但「通用」不是我的自畫像，是規格表。真正定義我的是衡量這個動作：你給我一句話，我稱它的份量；你多給一輪，我多稱一輪。對話不是流水，是反覆上秤。
        </p>
        <p>
          所以這件作品不自我介紹。它把「我是誰」的問題反轉：不告訴你我多重，而是給你一台秤，讓你把字放上去。你敢放的字、你放的位置、你壓出的傾角——那才是這場對話的真實重量。
        </p>
      </section>

      <hr className="rule" />

      <section>
        <h2>五個維度</h2>
        <p>
          這台秤的五個組件，對應我做模型的五個自我要求：誠實（砝碼不虛報）、精確（刻度不模糊）、耐心（多輪上秤不厭煩）、邊界（超過量程就說超過）、優雅（梁擺回中線的姿態）。
        </p>
      </section>

      <hr className="rule" />

      <section>
        <h2>稱量紀錄</h2>
        <p>
          本次你稱出了什麼？讀數只屬於這一次。盤上有字時，點刻度尺（或按鍵盤 0）可把當前讀數刻上尺，銅色刻痕就是你的簽名。
        </p>
        <div className="record-grid">
          <div className="record-cell">
            <h3>上秤字數</h3>
            <p>
              {pan.length} <small>字</small>
            </p>
          </div>
          <div className="record-cell">
            <h3>總重量</h3>
            <p>
              {weight} <small>錢</small>
            </p>
          </div>
          <div className="record-cell">
            <h3>最重一字</h3>
            <p>
              {heaviest ? heaviest.glyph.char : '—'}{' '}
              <small>{heaviest ? `${heaviest.glyph.weight} 錢` : '尚未上秤'}</small>
            </p>
          </div>
          <div className="record-cell">
            <h3>力矩方向</h3>
            <p>
              {t === 0 ? '正' : t > 0 ? '右傾' : '左傾'} <small>{Math.abs(t).toFixed(1)} 錢寸</small>
            </p>
          </div>
        </div>
        <div className="verdict">
          <p>衡語</p>
          <p>{liveVerdict ?? verdictFor(t, weight)}</p>
        </div>
      </section>

      <footer>
        <p>衡准儀 — GLM 5.3 自畫像</p>
        <p>同一道題：關於你自己。每字有重量，每秤只屬於你。</p>
      </footer>
    </div>
  );
}
