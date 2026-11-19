import { useEffect, useRef, useState } from 'react';
import { THINKING_TIERS, type ThinkingTierId } from '../data/facts';
import { neonAudio } from '../utils/neonAudio';

interface ThinkingExcitationChapterProps {
  reducedMotion: boolean;
}

const NEON_LINES = [
  { nm: '540.0', pos: 0.14, color: '#7EE86B', weight: 0.25 },
  { nm: '585.2', pos: 0.33, color: '#FFD23F', weight: 0.78 },
  { nm: '614.3', pos: 0.50, color: '#FF8A1E', weight: 0.90 },
  { nm: '640.2', pos: 0.66, color: '#FF2E12', weight: 1.00 },
  { nm: '650.6', pos: 0.74, color: '#E21E14', weight: 0.84 },
  { nm: '703.2', pos: 0.89, color: '#A81218', weight: 0.54 },
];

export function ThinkingExcitationChapter({
  reducedMotion,
}: ThinkingExcitationChapterProps) {
  const [selectedId, setSelectedId] = useState<ThinkingTierId>('high');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ active: false, tx: 0.5, ty: 0.5, cx: 0.5, cy: 0.5 });
  const surgeRef = useRef(0);

  const activeTier =
    THINKING_TIERS.find((t) => t.id === selectedId) ?? THINKING_TIERS[2];

  const targetRef = useRef({
    energy: activeTier.energyLevel,
    harmonics: activeTier.harmonicCount,
  });
  targetRef.current = {
    energy: activeTier.energyLevel,
    harmonics: activeTier.harmonicCount,
  };

  const selectTier = (id: ThinkingTierId) => {
    setSelectedId(id);
    surgeRef.current = 1.0;
    const found = THINKING_TIERS.find((t) => t.id === id);
    if (found) {
      neonAudio.setExcitationEnergy(found.energyLevel);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') selectTier('low');
      if (e.key === '2') selectTier('medium');
      if (e.key === '3') selectTier('high');
      if (e.key === '4') selectTier('xhigh');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    const t0 = performance.now();

    const spring = {
      energy: targetRef.current.energy,
      vel: 0,
      harmonics: targetRef.current.harmonics,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Deterministic crackling noise for live electric plasma arcs
    const noise1D = (x: number, seed: number) =>
      Math.sin(x * 13.7 + seed) * 0.5 +
      Math.sin(x * 29.3 - seed * 1.7) * 0.3 +
      Math.cos(x * 57.1 + seed * 2.3) * 0.2;

    const draw = (now: number) => {
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 1.8 : (now - t0) * 0.001;
      const compact = w < 640 * dpr;

      // Damped harmonic spring physics on tier switch
      const targetE = targetRef.current.energy;
      if (reducedMotion) {
        spring.energy = targetE;
        spring.harmonics = targetRef.current.harmonics;
        surgeRef.current = 0;
      } else {
        const force = (targetE - spring.energy) * 0.09;
        spring.vel = (spring.vel + force) * 0.77;
        spring.energy = Math.max(0.16, Math.min(1.18, spring.energy + spring.vel));
        spring.harmonics += (targetRef.current.harmonics - spring.harmonics) * 0.1;
        surgeRef.current *= 0.9;
      }

      const ptr = pointerRef.current;
      ptr.cx += (ptr.tx - ptr.cx) * 0.12;
      ptr.cy += (ptr.ty - ptr.cy) * 0.12;

      const energy = spring.energy;
      const surge = surgeRef.current;
      const effEnergy = Math.min(1.3, energy + surge * 0.35);

      const tubeY = h * 0.44;
      const tubeHalfH = h * (compact ? 0.25 : 0.28);
      const padX = w * (compact ? 0.05 : 0.07);
      const tubeW = w - padX * 2;

      // Pitch-black obsidian laboratory void
      ctx.fillStyle = '#050609';
      ctx.fillRect(0, 0, w, h);

      // Deep volumetric ionized plasma atmosphere filling the entire chamber
      const atm = ctx.createRadialGradient(
        w * ptr.cx,
        tubeY + (ptr.cy - 0.5) * tubeHalfH * 0.6,
        12 * dpr,
        w * 0.5,
        tubeY,
        w * (0.42 + effEnergy * 0.38),
      );
      atm.addColorStop(0, `rgba(255, 68, 22, ${0.18 + effEnergy * 0.32})`);
      atm.addColorStop(0.45, `rgba(195, 22, 12, ${0.06 + effEnergy * 0.16})`);
      atm.addColorStop(1, 'rgba(5, 6, 9, 0)');
      ctx.fillStyle = atm;
      ctx.fillRect(0, 0, w, h);

      // Sculpted cylindrical glass tube wall shading (real specular highlight on top & bottom curvature)
      const glassGrad = ctx.createLinearGradient(0, tubeY - tubeHalfH, 0, tubeY + tubeHalfH);
      glassGrad.addColorStop(0, 'rgba(255, 248, 240, 0.10)');
      glassGrad.addColorStop(0.08, 'rgba(255, 248, 240, 0.02)');
      glassGrad.addColorStop(0.5, 'rgba(255, 50, 20, 0.015)');
      glassGrad.addColorStop(0.92, 'rgba(130, 175, 240, 0.03)');
      glassGrad.addColorStop(1, 'rgba(165, 205, 255, 0.12)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(padX, tubeY - tubeHalfH, tubeW, tubeHalfH * 2);

      // Crisp borosilicate glass rim hairlines
      ctx.strokeStyle = 'rgba(255, 248, 240, 0.22)';
      ctx.lineWidth = dpr * 1.2;
      ctx.beginPath();
      ctx.moveTo(padX, tubeY - tubeHalfH);
      ctx.lineTo(w - padX, tubeY - tubeHalfH);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(130, 180, 255, 0.18)';
      ctx.beginPath();
      ctx.moveTo(padX, tubeY + tubeHalfH);
      ctx.lineTo(w - padX, tubeY + tubeHalfH);
      ctx.stroke();

      // Machined tungsten cathode & anode electrodes on both ends
      const elecW = Math.max(10 * dpr, w * 0.018);
      const elecGrad = ctx.createLinearGradient(0, tubeY - tubeHalfH, 0, tubeY + tubeHalfH);
      elecGrad.addColorStop(0, '#3D4252');
      elecGrad.addColorStop(0.5, '#191C24');
      elecGrad.addColorStop(1, '#2D3240');
      ctx.fillStyle = elecGrad;
      ctx.fillRect(padX - elecW, tubeY - tubeHalfH * 0.72, elecW, tubeHalfH * 1.44);
      ctx.fillRect(w - padX, tubeY - tubeHalfH * 0.72, elecW, tubeHalfH * 1.44);

      // Glowing hot electrode tips
      const tipGlow = `rgba(255, 140, 26, ${0.45 + effEnergy * 0.55})`;
      ctx.fillStyle = tipGlow;
      ctx.fillRect(padX - 2 * dpr, tubeY - tubeHalfH * 0.28, 4 * dpr, tubeHalfH * 0.56);
      ctx.fillRect(w - padX - 2 * dpr, tubeY - tubeHalfH * 0.28, 4 * dpr, tubeHalfH * 0.56);

      // Draw multi-pass additive volumetric plasma arcs!
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const filamentCount = Math.max(2, Math.round(spring.harmonics));
      const steps = 110;
      const pullX = ptr.active ? ptr.cx : 0.5;
      const pullY = ptr.active ? ptr.cy : 0.5;

      for (let f = 0; f < filamentCount; f++) {
        const fNorm = filamentCount === 1 ? 0 : f / (filamentCount - 1) - 0.5;
        const isCore = f === Math.floor(filamentCount / 2);

        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const x = padX + u * tubeW;
          const env = Math.sin(u * Math.PI);

          // Standing harmonic waves + high-frequency electric crackle on high/xhigh
          const standing =
            Math.sin(u * Math.PI * (2 + f * 0.85) - t * (2.6 + effEnergy * 4.4) + f * 1.5) * 0.62 +
            Math.cos(u * Math.PI * (5 + f * 1.2) + t * (3.4 + effEnergy * 5.2)) * 0.38;

          const crackle =
            effEnergy > 0.55
              ? noise1D(u * 4.5, t * 9.5 + f * 3.1) * (effEnergy - 0.45) * 0.52
              : 0;

          const amp = tubeHalfH * (0.14 + effEnergy * 0.64) * env;

          // Direct magnetic attraction toward user's pointer inside the glass tube!
          const du = u - pullX;
          const magnet =
            (ptr.active ? 1.35 : 0.22) *
            Math.exp(-du * du * 20) *
            (pullY - 0.5) *
            tubeHalfH *
            1.45 *
            env;

          const y =
            tubeY +
            fNorm * tubeHalfH * 0.34 * env +
            (standing + crackle) * amp +
            magnet;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Pass 1: Wide vermilion plasma bloom
        ctx.strokeStyle = isCore
          ? `rgba(255, 46, 18, ${0.26 + effEnergy * 0.36})`
          : `rgba(255, 92, 22, ${0.10 + effEnergy * 0.18})`;
        ctx.lineWidth = (isCore ? 14 + effEnergy * 18 : 6 + effEnergy * 8) * dpr;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Pass 2: Incandescent amber mid-sheath
        ctx.strokeStyle = isCore
          ? `rgba(255, 148, 36, ${0.52 + effEnergy * 0.38})`
          : `rgba(255, 165, 65, ${0.18 + effEnergy * 0.28})`;
        ctx.lineWidth = (isCore ? 4.5 + effEnergy * 3.5 : 2 + effEnergy * 1.5) * dpr;
        ctx.stroke();

        // Pass 3: White-hot ionized core thread
        ctx.strokeStyle = isCore
          ? `rgba(255, 248, 240, ${0.85 + effEnergy * 0.15})`
          : `rgba(255, 232, 200, ${0.28 + effEnergy * 0.36})`;
        ctx.lineWidth = (isCore ? 1.8 + effEnergy * 1.2 : 0.9 + effEnergy * 0.5) * dpr;
        ctx.stroke();
      }

      // If pointer is inside tube, render a live Tesla contact arc focal spark!
      if (ptr.active) {
        const px = padX + pullX * tubeW;
        const py = tubeY + (pullY - 0.5) * tubeHalfH * 1.65;
        const spark = ctx.createRadialGradient(px, py, 0, px, py, 36 * dpr);
        spark.addColorStop(0, 'rgba(255, 250, 242, 0.95)');
        spark.addColorStop(0.28, 'rgba(255, 140, 26, 0.65)');
        spark.addColorStop(1, 'rgba(255, 46, 18, 0)');
        ctx.fillStyle = spark;
        ctx.beginPath();
        ctx.arc(px, py, 36 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Bottom Atomic Emission Line Spectrometer Strip
      const specY = h * 0.80;
      const specH = h * 0.12;
      ctx.fillStyle = 'rgba(11, 13, 20, 0.92)';
      ctx.fillRect(padX, specY, tubeW, specH);
      ctx.strokeStyle = 'rgba(255, 248, 240, 0.12)';
      ctx.lineWidth = dpr;
      ctx.strokeRect(padX, specY, tubeW, specH);

      NEON_LINES.forEach((line, idx) => {
        const lx = padX + line.pos * tubeW;
        const intensity = Math.max(0.1, Math.min(1, (effEnergy - idx * 0.1 + 0.28) * line.weight));

        const sGlow = ctx.createLinearGradient(lx - 24 * dpr, specY, lx + 24 * dpr, specY);
        sGlow.addColorStop(0, 'rgba(0,0,0,0)');
        sGlow.addColorStop(0.5, line.color);
        sGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.globalAlpha = intensity * 0.48;
        ctx.fillStyle = sGlow;
        ctx.fillRect(lx - 24 * dpr, specY + dpr, 48 * dpr, specH - 2 * dpr);

        ctx.globalAlpha = 0.28 + intensity * 0.72;
        ctx.fillStyle = line.color;
        ctx.fillRect(lx - 1.3 * dpr, specY + 2 * dpr, 2.6 * dpr, specH - 4 * dpr);
        ctx.restore();
      });

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(draw);
      }
    };

    rafId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  const onChamberPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.active = true;
    pointerRef.current.tx = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / Math.max(rect.width, 1)));
    pointerRef.current.ty = Math.max(0.12, Math.min(0.88, (e.clientY - rect.top) / Math.max(rect.height, 1)));
  };

  const onChamberLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.tx = 0.5;
    pointerRef.current.ty = 0.5;
  };

  return (
    <section
      id="chapter-03"
      className="chapter-excitation"
      aria-labelledby="ch3-title"
    >
      <div className="chapter-inner">
        <div className="chapter-meta-row">
          <span className="chapter-index">CHAPTER 03 · HIGH-VOLTAGE EXCITATION</span>
          <span className="chapter-specimen-note">4-LEVEL SCALABLE THINKING · KEYS 1–4</span>
        </div>

        <div className="excitation-header">
          <div>
            <h2 id="ch3-title" className="chapter-title">
              四段可調的思考深度
            </h2>
            <p className="chapter-lead">
              你不用為簡單問題付旗艦的代價：切換四段思考強度，就能親手在速度、成本與推理深度之間拉動平衡。
            </p>
          </div>
          <div className="interactive-affordance-pill">
            <span className="affordance-pulse" aria-hidden="true" />
            <span>可互動：點擊檔位或直接滑入放電管拉動電弧</span>
          </div>
        </div>

        {/* Hairline 4-Detent Voltage Rail (NO bulky boxed cards) */}
        <div
          className="voltage-detent-rail"
          role="tablist"
          aria-label="思考深度檔位選擇器"
        >
          {THINKING_TIERS.map((tier, idx) => {
            const active = tier.id === selectedId;
            return (
              <button
                key={tier.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`voltage-detent ${active ? 'voltage-detent--active' : ''}`}
                onClick={() => selectTier(tier.id)}
              >
                <div className="detent-top">
                  <span className="detent-num">0{idx + 1}</span>
                  {tier.badge && <span className="tier-badge">{tier.badge}</span>}
                </div>
                <div className="detent-code">{tier.code}</div>
                <div className="detent-zh">{tier.labelZh}</div>
                <div className="detent-kv">{tier.voltageLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-Bleed Edge-to-Edge Plasma Discharge Synthesizer */}
      <div className="synthesizer-bleed">
        <canvas
          ref={canvasRef}
          className="synthesizer-canvas"
          onPointerMove={onChamberPointer}
          onPointerDown={onChamberPointer}
          onPointerLeave={onChamberLeave}
          aria-label={`目前處於 ${activeTier.code} 思考強度放電模擬`}
        />
        <div className="synthesizer-hud-top">
          <span>DISCHARGE TUBE · Ne-10</span>
          <span className="hud-peak">
            PEAK {activeTier.wavelengthPeak} · {activeTier.code}
          </span>
        </div>
        <div className="synthesizer-hud-bottom">
          <span>540 nm</span>
          <span>585.2 nm</span>
          <span>614.3 nm</span>
          <span className="spectral-peak-mark">640.2 nm PRIMARY</span>
          <span>703.2 nm</span>
        </div>
      </div>

      {/* Crisp Hairline Readout Strip (Zero Clunky Boxes) */}
      <div className="chapter-inner">
        <div className="excitation-readout-strip" aria-live="polite">
          <div className="readout-summary">
            <span className="telemetry-kicker">
              ACTIVE STATE · {activeTier.code}（{activeTier.labelZh}）
            </span>
            <p className="telemetry-desc">{activeTier.summary}</p>
          </div>
          <div className="readout-cell">
            <span className="telemetry-label">AA 智慧指數 v5</span>
            <strong className="telemetry-value">{activeTier.intelligenceIndex}</strong>
          </div>
          <div className="readout-cell">
            <span className="telemetry-label">首字延遲 (TTFT)</span>
            <strong className="telemetry-value">{activeTier.ttft}</strong>
          </div>
          <div className="readout-cell">
            <span className="telemetry-label">單次任務成本</span>
            <strong className="telemetry-value">{activeTier.costPerTask}</strong>
          </div>
          <div className="readout-cell">
            <span className="telemetry-label">基準任務耗時</span>
            <strong className="telemetry-value">{activeTier.taskTime}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
