import React, { useEffect, useRef } from 'react';
import { EFFORT_LEVELS, EffortKey } from '../data/hydrogenData';

interface HydrogenHeroProps {
  activeEffort: EffortKey;
  onSelectEffort: (key: EffortKey) => void;
  reducedMotion: boolean;
}

const VERT_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Physically contained Hydrogen Balmer orbital wavefunction shader (zero whiteout)
const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uEnergy;
uniform vec3 uColorA;
uniform vec3 uColorB;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.04;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(1.0, uRes.y);
  bool isDesktop = uRes.x > 820.0;

  // On desktop: sit cleanly in the right 34% space; on mobile: sit high in upper 28% stage (uv.y=1 is top)
  vec2 center = isDesktop ? vec2(0.69, 0.50) : vec2(0.50, 0.72);
  vec2 p = (uv - center) * vec2(aspect, 1.0);
  if (!isDesktop) p *= 1.32;

  vec2 tilt = (uPointer - 0.5) * 0.16;
  p += tilt * 0.12;

  float t = uTime * (0.38 + uEnergy * 0.48);
  float r = length(p);
  float angle = atan(p.y, p.x);

  // Strict outer containment envelope so background stays deep obsidian
  float outerEnv = exp(-r * r * 11.5);
  float haloEnv = exp(-r * 5.6);

  // Rotate orbital symmetry axis
  float rotA = t * 0.28 + tilt.x * 1.4;
  vec2 rp = mat2(cos(rotA), -sin(rotA), sin(rotA), cos(rotA)) * p;
  float rCos = clamp(rp.y / max(0.0001, r), -1.0, 1.0);

  // Analytical 3d_z2 + 2p_z Hydrogen wavefunction lobes (strictly bounded)
  float rho = r * 10.5;
  float radial = exp(-rho * 0.58) * (rho * rho) * 0.42;
  float y30 = abs(3.0 * rCos * rCos - 1.0) * 0.5;
  float lobe = pow(y30, 1.55) * radial * outerEnv;

  // Equatorial standing-wave ring (Balmer harmonic)
  float ringR = 0.18 + 0.045 * uEnergy;
  float waveMod = 0.009 * sin(angle * (3.0 + floor(uEnergy * 3.0)) - t * 2.4);
  float ring = exp(-abs(r - ringR + waveMod) * 44.0) * 0.85;

  // Secondary tilted orbital ring
  vec2 ellP = vec2(rp.x, rp.y * 2.15);
  float ellR = length(ellP);
  float ellRing = exp(-abs(ellR - ringR * 1.32) * 52.0) * 0.55 * haloEnv;

  // Micro-filament turbulence inside contained sphere
  float turb = fbm(rp * 9.0 + vec2(t * 0.35, -t * 0.28));
  float nebula = haloEnv * outerEnv * (0.28 + 0.82 * turb) * 0.72;

  // Crisp quantum interference fringes
  float fringes = smoothstep(0.91, 1.0, sin(r * 165.0 - t * 2.8)) * exp(-r * 6.8) * 0.32;

  // Sharp proton singularity
  float protonCore = exp(-r * 110.0) * 1.6 + exp(-r * 28.0) * 0.48;

  // Deep obsidian deuterium ground
  vec3 bg = vec3(0.016, 0.031, 0.062);
  vec3 col = bg;

  col += uColorA * (nebula * 0.75 + ring * 0.95 + fringes);
  col += uColorB * (lobe * 1.15 + ellRing * 0.95);
  col += vec3(0.92, 0.97, 1.0) * protonCore;

  // Extra clean protective mask behind left poster typography on desktop, bottom half on mobile
  if (isDesktop) {
    float leftProtect = smoothstep(0.32, 0.62, uv.x);
    col = mix(bg, col, 0.18 + 0.82 * leftProtect);
  } else {
    float topBarProtect = smoothstep(0.90, 0.99, uv.y);
    float lowerTextProtect = smoothstep(0.55, 0.36, uv.y);
    col = mix(col, bg, max(topBarProtect * 0.88, lowerTextProtect * 0.86));
  }

  // Subtle dither grain
  float grain = (hash(gl_FragCoord.xy + fract(uTime) * 60.0) - 0.5) * 0.014;
  col += grain;

  // ACES-like gentle shoulder compression to avoid clipping
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const EFFORT_ORDER: EffortKey[] = ['low', 'medium', 'high', 'xhigh'];

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export const HydrogenHero: React.FC<HydrogenHeroProps> = ({
  activeEffort,
  onSelectEffort,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; tx: number; ty: number }>({
    x: 0.5,
    y: 0.5,
    tx: 0.5,
    ty: 0.5,
  });
  const effortRef = useRef<EffortKey>(activeEffort);
  effortRef.current = activeEffort;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(rect.width * dpr));
      canvas.height = Math.max(2, Math.floor(rect.height * dpr));
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerRef.current.tx = (e.clientX - rect.left) / rect.width;
      pointerRef.current.ty = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    let rafId = 0;

    if (gl) {
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          gl.deleteShader(s);
          return null;
        }
        return s;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
      const prog = gl.createProgram();
      if (vs && fs && prog) {
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
      }

      if (prog && gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW
        );
        const locPos = gl.getAttribLocation(prog, 'aPos');
        gl.enableVertexAttribArray(locPos);
        gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, 'uRes');
        const uTime = gl.getUniformLocation(prog, 'uTime');
        const uPointer = gl.getUniformLocation(prog, 'uPointer');
        const uEnergy = gl.getUniformLocation(prog, 'uEnergy');
        const uColorA = gl.getUniformLocation(prog, 'uColorA');
        const uColorB = gl.getUniformLocation(prog, 'uColorB');

        let curEnergy = 0.68;
        const start = performance.now();

        const renderFrame = (now: number) => {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.useProgram(prog);

          const key = effortRef.current;
          const targetEnergy =
            key === 'low' ? 0.16 : key === 'medium' ? 0.44 : key === 'high' ? 0.70 : 1.0;
          curEnergy += (targetEnergy - curEnergy) * (reducedMotion ? 1 : 0.08);

          pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * 0.08;
          pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * 0.08;

          const spec = EFFORT_LEVELS[key];
          const [ar, ag, ab] = hexToRgb01(spec.accentHex);
          const secondaryHex = key === 'xhigh' ? '#22D3EE' : '#FB5A47';
          const [br, bg, bb] = hexToRgb01(secondaryHex);

          gl.uniform2f(uRes, canvas.width, canvas.height);
          gl.uniform1f(uTime, reducedMotion ? 1.8 : Math.max(0, (now - start) * 0.001));
          gl.uniform2f(uPointer, pointerRef.current.x, pointerRef.current.y);
          gl.uniform1f(uEnergy, curEnergy);
          gl.uniform3f(uColorA, ar, ag, ab);
          gl.uniform3f(uColorB, br, bg, bb);

          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

          if (!reducedMotion) {
            rafId = requestAnimationFrame(renderFrame);
          }
        };

        rafId = requestAnimationFrame(renderFrame);

        return () => {
          cancelAnimationFrame(rafId);
          window.removeEventListener('resize', resize);
          window.removeEventListener('pointermove', onMove);
        };
      }
    }

    // Canvas2D fallback
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const start = performance.now();
      const draw2d = (now: number) => {
        const w = canvas.width;
        const h = canvas.height;
        const t = reducedMotion ? 1.5 : Math.max(0, (now - start) * 0.001);
        ctx.fillStyle = '#040811';
        ctx.fillRect(0, 0, w, h);

        const isDesktop = w > 820 * dpr;
        const cx = isDesktop ? w * 0.69 : w * 0.5;
        const cy = isDesktop ? h * 0.5 : h * 0.28;
        const baseR = Math.min(w, h) * (isDesktop ? 0.25 : 0.19);
        const spec = EFFORT_LEVELS[effortRef.current];

        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, baseR * 1.5);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.14, spec.accentHex);
        grad.addColorStop(0.45, 'rgba(251, 90, 71, 0.25)');
        grad.addColorStop(1, 'rgba(4, 8, 17, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 1.5, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 1; i <= 4; i++) {
          ctx.strokeStyle = i === spec.shellN ? spec.accentHex : 'rgba(148,197,255,0.22)';
          ctx.lineWidth = i === spec.shellN ? 2 * dpr : 1 * dpr;
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy,
            baseR * (0.38 + i * 0.22),
            baseR * (0.34 + i * 0.2) * (0.72 + 0.1 * Math.sin(t + i)),
            t * 0.15 * (i % 2 === 0 ? 1 : -1),
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
        if (!reducedMotion) rafId = requestAnimationFrame(draw2d);
      };
      rafId = requestAnimationFrame(draw2d);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [reducedMotion]);

  const current = EFFORT_LEVELS[activeEffort];

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#040811',
        overflow: 'hidden',
        borderBottom: '1px solid var(--hairline-dark)',
      }}
    >
      {/* Full-bleed WebGL2 Contained Hydrogen Quantum Orbital */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Precision SVG optical calibration ring aligned with focal orbital */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="hero-reticle-svg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.55,
        }}
      >
        <g stroke="rgba(148, 197, 255, 0.26)" fill="none" strokeWidth="1">
          <circle cx="994" cy="450" r="168" strokeDasharray="3 8" />
          <circle cx="994" cy="450" r="248" strokeDasharray="1 14" />
          <line x1="994" y1="170" x2="994" y2="205" />
          <line x1="994" y1="695" x2="994" y2="730" />
          <line x1="714" y1="450" x2="749" y2="450" />
          <line x1="1239" y1="450" x2="1274" y2="450" />
        </g>
        <text
          x="994"
          y="756"
          textAnchor="middle"
          fill="rgba(191, 208, 226, 0.55)"
          fontSize="11"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="3"
        >
          BALMER SPECTRUM · H(1s/2p/3d) SUPERPOSITION
        </text>
      </svg>

      {/* Top Instrument Header with clean dark top fade for guaranteed legibility */}
      <header
        style={{
          position: 'relative',
          zIndex: 3,
          background: 'linear-gradient(to bottom, rgba(4,8,17,0.88) 0%, rgba(4,8,17,0) 100%)',
        }}
      >
        <div
          className="container-wide"
          style={{
            paddingBlock: 'clamp(16px, 2.5vh, 26px)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px 16px',
            fontSize: '12px',
            letterSpacing: '0.14em',
            color: '#9FB5CD',
          }}
        >
          <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: current.accentHex,
                boxShadow: `0 0 12px ${current.accentHex}`,
              }}
            />
            <span style={{ color: '#F4F9FF', fontWeight: 700 }}>GOOGLE DEEPMIND</span>
            <span style={{ opacity: 0.45 }}>/</span>
            <span>2026.11.12 RELEASE</span>
          </div>

          <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>Z = 1 · H · 1.008 u</span>
            <span style={{ color: current.accentHex, fontWeight: 700 }}>λ = {current.wavelengthNm} nm</span>
          </div>
        </div>
      </header>

      {/* Poster Hero Centerpiece Typography (unboxed, clean, surgical contrast) */}
      <div
        className="container-wide hero-main-grid"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingBlock: 'clamp(16px, 4vh, 44px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 0.92fr)',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div className="hero-type-col">
          <div
            className="font-mono"
            style={{
              fontSize: '12px',
              letterSpacing: '0.18em',
              color: current.accentHex,
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            01 / IDENTITY &amp; SPECTRAL SIGNATURE
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 'clamp(2.55rem, 6.4vw, 5.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              color: '#F4F9FF',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            GEMINI 4
            <br />
            <span
              className="font-serif"
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(3.0rem, 7.3vw, 6.4rem)',
                color: current.accentHex,
                letterSpacing: '-0.02em',
                textShadow: `0 0 36px ${current.accentGlow}`,
              }}
            >
              Hydrogen
            </span>
          </div>

          <h1
            style={{
              margin: '18px 0 10px',
              fontSize: 'clamp(1.25rem, 2.15vw, 1.85rem)',
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#EEF5FC',
            }}
          >
            我是 Gemini 4 Hydrogen
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 'clamp(0.98rem, 1.2vw, 1.12rem)',
              lineHeight: 1.65,
              color: '#C7D6E6',
              maxWidth: '40ch',
            }}
          >
            Google DeepMind 在 2026 年 11 月 12 日推出我，專為高頻開發與多步驟代理工作而生。
          </p>

          {/* Compact Poster Metrics Strip */}
          <div
            className="font-mono"
            style={{
              marginTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px 28px',
              paddingTop: '18px',
              borderTop: '1px solid rgba(148, 197, 255, 0.2)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>AA INDEX v5.0.1</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#EEF5FC' }}>
                {current.intelligenceIndex}{' '}
                <span style={{ fontSize: '12px', color: current.accentHex, fontWeight: 500 }}>
                  ({current.label})
                </span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>OUTPUT SPEED</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#EEF5FC' }}>
                {current.outputSpeedTokS} <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>tok/s</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>CONTEXT WINDOW</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#EEF5FC' }}>
                1,000,000 <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right spacer leaves the quantum orbital crystal clear */}
        <div className="hero-right-spacer" aria-hidden="true" />
      </div>

      {/* Bottom Interactive Balmer Wavelength Selector + Scroll Cue */}
      <footer
        className="container-wide"
        style={{
          position: 'relative',
          zIndex: 2,
          paddingBottom: 'clamp(18px, 3vh, 28px)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          role="group"
          aria-label="切換 Hydrogen 激發光譜檔位"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="font-mono" style={{ fontSize: '11px', color: '#9FB5CD', marginRight: '4px' }}>
            點選激發光譜：
          </span>
          {EFFORT_ORDER.map((k) => {
            const item = EFFORT_LEVELS[k];
            const active = k === activeEffort;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onSelectEffort(k)}
                className="font-mono"
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: active ? 700 : 500,
                  border: `1px solid ${active ? item.accentHex : 'rgba(148,197,255,0.22)'}`,
                  backgroundColor: active ? item.accentGlow : 'rgba(8,15,29,0.82)',
                  color: active ? '#FFFFFF' : '#BFD0E2',
                  transition: 'all 180ms ease',
                }}
              >
                {k.toUpperCase()} · {item.wavelengthNm}nm
              </button>
            );
          })}
        </div>

        <a
          href="#thinking-gears"
          className="font-mono"
          style={{
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: '#DCE8F5',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            border: '1px solid rgba(148,197,255,0.26)',
            borderRadius: '999px',
            background: 'rgba(8,15,29,0.85)',
          }}
        >
          <span>向下進入四檔實測</span>
          <span aria-hidden="true">↓</span>
        </a>
      </footer>

      <style>{`
        @media (max-width: 820px) {
          .hero-main-grid {
            grid-template-columns: 1fr !important;
            padding-top: 205px !important;
            padding-bottom: 10px !important;
          }
          .hero-right-spacer {
            display: none;
          }
          .hero-reticle-svg {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};
