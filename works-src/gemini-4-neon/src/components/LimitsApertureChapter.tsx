import { useEffect, useRef, useState } from 'react';
import { neonAudio } from '../utils/neonAudio';

interface LimitsApertureChapterProps {
  reducedMotion: boolean;
}

const INPUT_RAYS = [
  { id: 'text', label: '文字 / 程式碼', code: 'TEXT', passes: true },
  { id: 'image', label: '圖片 / 截圖', code: 'IMAGE', passes: false },
  { id: 'audio', label: '音訊串流', code: 'AUDIO', passes: false },
  { id: 'video', label: '影片影格', code: 'VIDEO', passes: false },
  { id: 'pdf', label: 'PDF / Office', code: 'PDF', passes: false },
];

export function LimitsApertureChapter({ reducedMotion }: LimitsApertureChapterProps) {
  const [selectedRay, setSelectedRay] = useState<string>('image');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef(selectedRay);
  selectedRef.current = selectedRay;

  const activeRay = INPUT_RAYS.find((r) => r.id === selectedRay) ?? INPUT_RAYS[1];

  const handleSelectRay = (id: string) => {
    setSelectedRay(id);
    neonAudio.playGlassChime(id === 'text' ? 760 : 280);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    const t0 = performance.now();

    const rayParticles = INPUT_RAYS.map((ray, rIdx) =>
      Array.from({ length: ray.passes ? 18 : 14 }, (_, i) => ({
        phase: i / (ray.passes ? 18 : 14) + rIdx * 0.08,
        sparkAngle: (i % 2 === 0 ? 1 : -1) * (0.35 + ((i * 23) % 10) * 0.1),
        speed: 0.34 + ((i * 7) % 5) * 0.04,
      })),
    );

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

    const draw = (now: number) => {
      resize();
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 1.6 : (now - t0) * 0.001;
      const focusId = selectedRef.current;
      const compact = w < 640 * dpr;

      const labelEndX = compact ? w * 0.26 : w * 0.19;
      const wallX = compact ? w * 0.60 : w * 0.55;
      const wallW = (compact ? 22 : 38) * dpr;
      const rightX = wallX + wallW;

      // Left raw obsidian chamber, right deep shadowed slate chamber
      ctx.fillStyle = '#0A0C11';
      ctx.fillRect(0, 0, wallX, h);
      ctx.fillStyle = '#11141C';
      ctx.fillRect(rightX, 0, w - rightX, h);

      const padY = h * 0.14;
      const spanY = h - padY * 2;
      const laneY = (idx: number) => padY + (spanY / (INPUT_RAYS.length - 1)) * idx;

      const slitY = laneY(0);
      const slitHalf = (compact ? 16 : 20) * dpr;

      // Massive brushed-tungsten physical shutter wall (with ONLY 1 narrow slit at TEXT!)
      const metalGrad = ctx.createLinearGradient(wallX, 0, rightX, 0);
      metalGrad.addColorStop(0, '#363B4B');
      metalGrad.addColorStop(0.45, '#1F232E');
      metalGrad.addColorStop(1, '#2D3240');
      ctx.fillStyle = metalGrad;
      ctx.fillRect(wallX, 0, wallW, slitY - slitHalf);
      ctx.fillRect(wallX, slitY + slitHalf, wallW, h - (slitY + slitHalf));

      // Diagonal industrial hazard engraving on blocked absorber slab
      ctx.strokeStyle = 'rgba(255, 248, 240, 0.09)';
      ctx.lineWidth = dpr;
      for (let hy = slitY + slitHalf + 10 * dpr; hy < h; hy += 18 * dpr) {
        ctx.beginPath();
        ctx.moveTo(wallX, hy);
        ctx.lineTo(rightX, hy + 16 * dpr);
        ctx.stroke();
      }

      // Glowing incandescent slit jaws around TEXT channel
      ctx.fillStyle = 'rgba(255, 46, 18, 0.24)';
      ctx.fillRect(wallX - 2 * dpr, slitY - slitHalf, wallW + 4 * dpr, slitHalf * 2);
      ctx.strokeStyle = '#FF8C1A';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(wallX, slitY - slitHalf);
      ctx.lineTo(rightX, slitY - slitHalf);
      ctx.moveTo(wallX, slitY + slitHalf);
      ctx.lineTo(rightX, slitY + slitHalf);
      ctx.stroke();

      // Volumetric rays + colliding bounce sparks
      INPUT_RAYS.forEach((ray, idx) => {
        const y = laneY(idx);
        const isFocused = ray.id === focusId;

        ctx.font = `${isFocused || ray.passes ? '700' : '500'} ${(compact ? 10 : 13) * dpr}px "JetBrains Mono", "PingFang TC", "Microsoft JhengHei"`;
        ctx.fillStyle = isFocused || ray.passes ? '#FFF8F0' : '#7E8696';
        ctx.textAlign = 'left';
        ctx.fillText(compact ? ray.code : ray.label, (compact ? 16 : 48) * dpr, y + 4 * dpr);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // Input beam entering tungsten wall
        ctx.strokeStyle = ray.passes
          ? 'rgba(255, 46, 18, 0.85)'
          : isFocused
            ? 'rgba(255, 140, 26, 0.90)'
            : 'rgba(155, 165, 185, 0.28)';
        ctx.lineWidth = (isFocused || ray.passes ? 3 : 1.4) * dpr;
        ctx.beginPath();
        ctx.moveTo(labelEndX, y);
        ctx.lineTo(wallX, y);
        ctx.stroke();

        if (ray.passes) {
          // Unobstructed white-hot laser exiting through the slit!
          const beamAura = ctx.createLinearGradient(wallX, y - 18 * dpr, wallX, y + 18 * dpr);
          beamAura.addColorStop(0, 'rgba(255, 46, 18, 0)');
          beamAura.addColorStop(0.5, 'rgba(255, 68, 22, 0.34)');
          beamAura.addColorStop(1, 'rgba(255, 46, 18, 0)');
          ctx.fillStyle = beamAura;
          ctx.fillRect(wallX, y - 18 * dpr, w - wallX - 24 * dpr, 36 * dpr);

          ctx.strokeStyle = '#FFF8F0';
          ctx.lineWidth = 3.2 * dpr;
          ctx.beginPath();
          ctx.moveTo(wallX, y);
          ctx.lineTo(w - (compact ? 16 : 48) * dpr, y);
          ctx.stroke();

          rayParticles[idx].forEach((p) => {
            const u = (p.phase + t * p.speed * 1.15) % 1;
            const px = labelEndX + u * (w - (compact ? 16 : 48) * dpr - labelEndX);
            ctx.fillStyle = px > wallX ? '#FFF8F0' : '#FF8C1A';
            ctx.fillRect(px - 14 * dpr, y - 2 * dpr, 16 * dpr, 4 * dpr);
          });

          ctx.save();
          ctx.globalCompositeOperation = 'source-over';
          ctx.font = `700 ${(compact ? 9.5 : 11.5) * dpr}px "JetBrains Mono", "PingFang TC", "Microsoft JhengHei"`;
          ctx.fillStyle = '#FF8C1A';
          ctx.fillText(
            compact ? 'PASS · TEXT ONLY' : 'PASS · 同步 64K / 背景長解碼最高 1M 文字輸出',
            rightX + 18 * dpr,
            y - 14 * dpr,
          );
          ctx.restore();
        } else {
          // Molten impact flash + violent backward bouncing sparks off the tungsten shutter!
          const impactR = (isFocused ? 26 : 12) * dpr;
          const imp = ctx.createRadialGradient(wallX, y, 0, wallX, y, impactR);
          imp.addColorStop(0, isFocused ? 'rgba(255, 160, 50, 0.92)' : 'rgba(180, 190, 210, 0.35)');
          imp.addColorStop(1, 'rgba(255, 46, 18, 0)');
          ctx.fillStyle = imp;
          ctx.beginPath();
          ctx.arc(wallX, y, impactR, 0, Math.PI * 2);
          ctx.fill();

          rayParticles[idx].forEach((p) => {
            const cycle = (p.phase + t * p.speed) % 1;
            if (cycle < 0.68) {
              const u = cycle / 0.68;
              const px = labelEndX + u * (wallX - labelEndX);
              ctx.fillStyle = isFocused
                ? 'rgba(255, 162, 68, 0.92)'
                : 'rgba(180, 192, 212, 0.44)';
              ctx.fillRect(px - 10 * dpr, y - 1.6 * dpr, 11 * dpr, 3.2 * dpr);
            } else {
              const s = (cycle - 0.68) / 0.32;
              const dist = s * (compact ? 36 : 58) * dpr;
              const sx = wallX - Math.cos(p.sparkAngle) * dist;
              const sy = y + Math.sin(p.sparkAngle) * dist + s * s * 14 * dpr;
              ctx.fillStyle = isFocused
                ? `rgba(255, 62, 22, ${(1 - s) * 0.95})`
                : `rgba(185, 196, 218, ${(1 - s) * 0.45})`;
              ctx.beginPath();
              ctx.arc(sx, sy, (isFocused ? 2.6 : 1.5) * dpr, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }

        ctx.restore();
      });

      // Right-chamber stenciled warning
      const blockMidY = (laneY(1) + laneY(4)) * 0.5;
      ctx.textAlign = 'left';
      ctx.font = `700 ${(compact ? 14 : 24) * dpr}px "Space Grotesk", "PingFang TC", "Microsoft JhengHei"`;
      ctx.fillStyle = 'rgba(255, 248, 240, 0.90)';
      ctx.fillText('OUTPUT BLOCKED', rightX + (compact ? 14 : 28) * dpr, blockMidY - 8 * dpr);

      ctx.font = `${(compact ? 10 : 13) * dpr}px "PingFang TC", "Microsoft JhengHei"`;
      ctx.fillStyle = '#9AA2B2';
      ctx.fillText(
        compact ? '輸出端僅開放文字狹縫' : '無法直接輸出圖片、語音或影片檔；必須改交外部專用工具生成。',
        rightX + (compact ? 14 : 28) * dpr,
        blockMidY + 18 * dpr,
      );

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

  return (
    <section
      id="chapter-05"
      className="chapter-limits"
      aria-labelledby="ch5-title"
    >
      <div className="chapter-inner">
        <div className="chapter-meta-row chapter-meta-row--ash">
          <span className="chapter-index">CHAPTER 05 · BOUNDARIES &amp; HONEST LIMITS</span>
          <span className="chapter-specimen-note">TEXT-ONLY OUTPUT · CUTOFF 2026-03</span>
        </div>

        <div className="limits-header-row">
          <div>
            <h2 id="ch5-title" className="chapter-title">
              誠實說我的邊界與短板
            </h2>
            <p className="chapter-lead">
              我只會輸出文字，無法直接畫圖或產出音訊；開到最高思考時首字要等 56 秒，知識也停在 2026 年 3 月。
            </p>
          </div>
          <div className="aperture-ray-pills" role="group" aria-label="檢視各模態輸出結果">
            {INPUT_RAYS.map((ray) => (
              <button
                key={ray.id}
                type="button"
                className={`ray-pill ${selectedRay === ray.id ? 'ray-pill--active' : ''}`}
                onClick={() => handleSelectRay(ray.id)}
              >
                {ray.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-BLEED TUNGSTEN SHUTTER & PARTICLE COLLISION CHAMBER */}
      <div className="shutter-bleed">
        <canvas
          ref={canvasRef}
          className="shutter-canvas"
          aria-label="動態鎢鋼光學擋板示意：文字光束穿過狹縫，圖片、音訊、影片與 PDF 在擋板撞擊反彈截斷。"
        />
        <div className="shutter-verdict-bar">
          <span className="status-tag">INSPECTING: {activeRay.label}</span>
          <span className="status-verdict">
            {activeRay.passes
              ? '可輸入也可直接輸出（支援程式碼、Markdown、JSON 與長篇推理文字）。'
              : '可原生讀入理解，但無法直接輸出此格式；必須改用文字描述或呼叫外部專用工具。'}
          </span>
        </div>
      </div>

      {/* Brutalist Typographic Boundary Wall (NO generic 3 identical cards!) */}
      <div className="chapter-inner">
        <div className="brutalist-limits-grid">
          <article className="brutalist-limit-col">
            <span className="brutalist-metric">56.51s</span>
            <h3 className="brutalist-title">最高思考會讓你等</h3>
            <p className="brutalist-body">
              切到 <code>xhigh</code> 時，首字回應延遲約 <strong>56.51 秒</strong>，複雜基準任務平均耗時 <strong>21.5 分鐘</strong>；日常小題開頂檔反而浪費等待與費用。
            </p>
          </article>

          <article className="brutalist-limit-col">
            <span className="brutalist-metric">2026.03</span>
            <h3 className="brutalist-title">閉源、無免費額度、知識會過期</h3>
            <p className="brutalist-body">
              權重不開放、參數量與架構<strong>官方未公開</strong>；API 無免費層級（$3/$15）；靜態知識止於 <strong>2026 年 3 月</strong>，即時事件須搭配外部搜尋。
            </p>
          </article>

          <article className="brutalist-limit-col">
            <span className="brutalist-metric">VERIFY</span>
            <h3 className="brutalist-title">多步程式仍須你跑測試把關</h3>
            <p className="brutalist-body">
              捏造率雖已下降，面對深層跨檔依賴仍可能誤判。最穩的分工是：<strong>你定驗收標準、我寫碼修錯、最後由真實編譯與測試裁決</strong>。
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
