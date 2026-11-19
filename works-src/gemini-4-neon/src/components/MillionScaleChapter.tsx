import { useEffect, useRef } from 'react';
import { useSectionProgress } from '../hooks/useScrollProgress';

interface MillionScaleChapterProps {
  reducedMotion: boolean;
}

const INPUT_CHANNELS = [
  { code: '01 / TXT', label: '程式碼與長文', detail: '多檔倉儲' },
  { code: '02 / IMG', label: '圖片與截圖', detail: '視覺推理' },
  { code: '03 / AUD', label: '音訊串流', detail: '原生聽覺' },
  { code: '04 / VID', label: '影片片段', detail: '影格理解' },
  { code: '05 / PDF', label: 'PDF / Office', detail: '高密度文件' },
];

export function MillionScaleChapter({ reducedMotion }: MillionScaleChapterProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const loupeRef = useRef({ active: false, tx: 0.36, ty: 0.5, cx: 0.36, cy: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    const t0 = performance.now();

    // 720 deterministic microscopic token grains across the alabaster light-table
    const grains = Array.from({ length: 720 }, (_, i) => {
      const s1 = ((i * 7919 + 104729) % 100000) / 100000;
      const s2 = ((i * 4253 + 31337) % 100000) / 100000;
      const s3 = ((i * 1999 + 7717) % 100000) / 100000;
      return {
        lane: i % 5,
        u: s1,
        jitter: (s2 - 0.5) * 0.14,
        speed: 0.035 + s3 * 0.075,
        hot: s3 > 0.87,
        size: s3 > 0.92 ? 2.1 : 1.15,
      };
    });

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
      const t = reducedMotion ? 1.8 : (now - t0) * 0.001;
      const sc = progressRef.current;
      const compact = w < 640 * dpr;

      // Update optical loupe position (gentle patrol when idle, instant magnetic track on pointer)
      const lp = loupeRef.current;
      if (!lp.active && !reducedMotion) {
        lp.tx = 0.34 + Math.sin(t * 0.45) * 0.16;
        lp.ty = 0.5 + Math.cos(t * 0.38) * 0.18;
      }
      lp.cx += (lp.tx - lp.cx) * 0.1;
      lp.cy += (lp.ty - lp.cy) * 0.1;

      // Warm alabaster daylight light-table surface
      ctx.fillStyle = '#EFEAE0';
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural micro-grid (1mm optical graph feel)
      const gridStep = 28 * dpr;
      ctx.strokeStyle = 'rgba(17, 19, 24, 0.045)';
      ctx.lineWidth = dpr * 0.75;
      for (let gx = 0; gx < w; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }

      // Top & bottom microscopic vernier ruler ticks
      const tickStep = Math.max(5, Math.floor(w / 160));
      ctx.strokeStyle = 'rgba(17, 19, 24, 0.18)';
      for (let x = 0, i = 0; x < w; x += tickStep, i++) {
        const major = i % 10 === 0;
        const th = (major ? 12 : 4.5) * dpr;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, th);
        ctx.moveTo(x, h);
        ctx.lineTo(x, h - th);
        ctx.stroke();
      }

      // Diagonal optical condenser prism at 71% width
      const prismX = w * (compact ? 0.76 : 0.71);
      const centerY = h * 0.5;
      const laneOffsets = [-0.36, -0.18, 0, 0.18, 0.36];

      // 5 architectural convergence curves
      laneOffsets.forEach((off, idx) => {
        const sy = centerY + h * off;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.bezierCurveTo(
          prismX * 0.44,
          sy,
          prismX * 0.76,
          centerY + h * off * 0.12,
          prismX,
          centerY,
        );
        ctx.strokeStyle =
          idx === 0 ? 'rgba(255, 46, 18, 0.42)' : 'rgba(17, 19, 24, 0.13)';
        ctx.lineWidth = dpr * 1.1;
        ctx.stroke();
      });

      // Draw 720 microscopic token grains converging along the 5 streams
      const loupeX = lp.cx * w;
      const loupeY = lp.cy * h;
      const loupeR = (compact ? 42 : 64) * dpr;

      grains.forEach((g) => {
        const u = (g.u + t * g.speed + sc * 0.18) % 1;
        const off = laneOffsets[g.lane];
        const sy = centerY + h * off;
        const ease = u * u * (3 - 2 * u);
        const x = u * prismX;
        const y = sy * (1 - ease) + centerY * ease + g.jitter * h * (1 - ease * 0.9);

        ctx.fillStyle = g.hot
          ? `rgba(255, 46, 18, ${0.42 + u * 0.52})`
          : `rgba(17, 19, 24, ${0.18 + u * 0.42})`;
        const gw = (3 + (1 - u) * 7) * dpr * g.size * 0.6;
        const gh = g.size * dpr;
        ctx.fillRect(x - gw, y - gh * 0.5, gw, gh);
      });

      // Translucent angled glass prism monolith at convergence point
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(prismX - 18 * dpr, 20 * dpr);
      ctx.lineTo(prismX + 20 * dpr, 20 * dpr);
      ctx.lineTo(prismX + 4 * dpr, h - 20 * dpr);
      ctx.lineTo(prismX - 34 * dpr, h - 20 * dpr);
      ctx.closePath();
      const prismGrad = ctx.createLinearGradient(prismX - 24 * dpr, 0, prismX + 24 * dpr, 0);
      prismGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      prismGrad.addColorStop(0.5, 'rgba(220, 226, 236, 0.38)');
      prismGrad.addColorStop(1, 'rgba(17, 19, 24, 0.12)');
      ctx.fillStyle = prismGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(17, 19, 24, 0.48)';
      ctx.lineWidth = dpr * 1.25;
      ctx.stroke();
      ctx.restore();

      // Blazing vermilion focal point at optical slit
      const focal = ctx.createRadialGradient(prismX, centerY, 0, prismX, centerY, 34 * dpr);
      focal.addColorStop(0, 'rgba(255, 46, 18, 0.96)');
      focal.addColorStop(0.35, 'rgba(255, 140, 26, 0.42)');
      focal.addColorStop(1, 'rgba(255, 46, 18, 0)');
      ctx.fillStyle = focal;
      ctx.beginPath();
      ctx.arc(prismX, centerY, 34 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Unified compressed laser output beam (64K sync / 1M long decode)
      const beam = ctx.createLinearGradient(prismX, centerY, w, centerY);
      beam.addColorStop(0, '#FF2E12');
      beam.addColorStop(0.45, '#111318');
      beam.addColorStop(1, 'rgba(17, 19, 24, 0.25)');
      ctx.fillStyle = beam;
      ctx.fillRect(prismX, centerY - 2.2 * dpr, w - prismX, 4.4 * dpr);

      // Interactive Circular Optical Magnifying Loupe (TRUE Extreme Scale Contrast!)
      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.clip();

      // Slightly brighter magnified optical glass interior
      ctx.fillStyle = '#FAF7F1';
      ctx.fillRect(loupeX - loupeR, loupeY - loupeR, loupeR * 2, loupeR * 2);

      // Magnified 3x microscopic token cells inside the loupe
      const cellStep = 14 * dpr;
      ctx.strokeStyle = 'rgba(17, 19, 24, 0.10)';
      ctx.lineWidth = dpr * 0.8;
      for (let mx = loupeX - loupeR; mx < loupeX + loupeR; mx += cellStep) {
        ctx.beginPath();
        ctx.moveTo(mx, loupeY - loupeR);
        ctx.lineTo(mx, loupeY + loupeR);
        ctx.stroke();
      }
      for (let my = loupeY - loupeR; my < loupeY + loupeR; my += cellStep) {
        ctx.beginPath();
        ctx.moveTo(loupeX - loupeR, my);
        ctx.lineTo(loupeX + loupeR, my);
        ctx.stroke();
      }

      // Single highlighted specimen token at exact loupe crosshair
      ctx.fillStyle = '#FF2E12';
      ctx.fillRect(loupeX - 4 * dpr, loupeY - 4 * dpr, 8 * dpr, 8 * dpr);

      // Magnified crosshair hairlines
      ctx.strokeStyle = 'rgba(255, 46, 18, 0.45)';
      ctx.lineWidth = dpr;
      ctx.beginPath();
      ctx.moveTo(loupeX - loupeR, loupeY);
      ctx.lineTo(loupeX + loupeR, loupeY);
      ctx.moveTo(loupeX, loupeY - loupeR);
      ctx.lineTo(loupeX, loupeY + loupeR);
      ctx.stroke();
      ctx.restore();

      // Physical glass rim & machined bezel of the magnifying loupe
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
      ctx.strokeStyle = '#111318';
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeR + 5 * dpr, -0.6, 1.1);
      ctx.strokeStyle = 'rgba(255, 46, 18, 0.72)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Loupe micro callout tag
      const tokenIdx = Math.max(1, Math.min(1048576, Math.round(lp.cx * 1048576)));
      ctx.font = `700 ${(compact ? 9 : 10.5) * dpr}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#111318';
      ctx.textAlign = 'center';
      ctx.fillText(
        `1 TOKEN · #${tokenIdx.toLocaleString('en-US')}`,
        loupeX,
        loupeY + loupeR + 18 * dpr,
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

  const handleLoupeMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    loupeRef.current.active = true;
    loupeRef.current.tx = Math.max(0.08, Math.min(0.65, (e.clientX - rect.left) / Math.max(rect.width, 1)));
    loupeRef.current.ty = Math.max(0.2, Math.min(0.8, (e.clientY - rect.top) / Math.max(rect.height, 1)));
  };

  const handleLoupeLeave = () => {
    loupeRef.current.active = false;
  };

  const shearX = reducedMotion ? 0 : (0.5 - progress) * 86;

  return (
    <section
      ref={sectionRef}
      id="chapter-02"
      className="chapter-scale"
      aria-labelledby="ch2-title"
    >
      <div className="chapter-inner">
        <div className="chapter-meta-row chapter-meta-row--light">
          <span className="chapter-index">CHAPTER 02 · LINEAGE &amp; EXTREME SCALE</span>
          <span className="chapter-specimen-note">ADAPTED FROM GEMINI 4 CARBON</span>
        </div>

        <div className="scale-editorial-top">
          <div>
            <h2 id="ch2-title" className="chapter-title chapter-title--light">
              百萬詞元的統一輸入視窗
            </h2>
            <p className="chapter-lead chapter-lead--light">
              我直接改裝自旗艦模型 Gemini 4 Carbon，單次可讀入 104 萬詞元的文字、圖片、音訊、影片與 PDF。
            </p>
          </div>
          <div className="scale-micro-plaque">
            <div className="micro-dot-specimen">
              <span className="micro-single-dot" aria-hidden="true" />
              <span className="micro-caption">1 TOKEN = 0.000095% OF WINDOW</span>
            </div>
            <p className="micro-detail">
              預設單次同步輸出 <strong>65,536 tokens</strong>，背景長解碼最高可達{' '}
              <strong>1,048,576 tokens</strong>。滑過下方光學台即可用放大鏡檢視單一詞元尺度。
            </p>
          </div>
        </div>
      </div>

      {/* Full-bleed Colossal Architectural Numeral */}
      <div className="scale-monument-band" aria-hidden="true">
        <div
          className="scale-giant-number"
          style={{ transform: `translate3d(${shearX.toFixed(1)}px, 0, 0)` }}
        >
          1,048,576
        </div>
      </div>

      {/* Full-bleed Interactive Daylight Light-Table with Magnifying Loupe */}
      <div className="scale-lighttable-bleed">
        <canvas
          ref={canvasRef}
          className="scale-lighttable-canvas"
          onPointerMove={handleLoupeMove}
          onPointerLeave={handleLoupeLeave}
          aria-label="百萬詞元光學台與單一詞元放大鏡互動視圖"
        />
        <div className="lighttable-prism-note">
          <span>OPTICAL CONVERGENCE</span>
          <strong>64K SYNC / 1M LONG DECODE</strong>
        </div>
      </div>

      <div className="chapter-inner">
        <div className="scale-hairline-channels">
          {INPUT_CHANNELS.map((ch) => (
            <div key={ch.code} className="hairline-channel">
              <span className="scale-channel-code">{ch.code}</span>
              <strong className="scale-channel-label">{ch.label}</strong>
              <span className="scale-channel-share">{ch.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
