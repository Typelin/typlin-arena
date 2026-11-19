import { useEffect, useRef } from 'react';

interface HeroRaymarchCanvasProps {
  reducedMotion: boolean;
  scrollProgress: number;
}

const VERTEX_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// Real-time 3D SDF Raymarched Sculpted Borosilicate Glass Toroid
// enclosing a blazing Neon-10 (640.2nm) volumetric ionized plasma core,
// orbital harmonic filament, Fresnel chromatic glass dispersion, and filmic ACES tone mapping.
const FRAGMENT_SRC = `
  precision highp float;

  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform float u_scroll;

  mat2 rot2(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Smooth minimum for organic sculpted glass junctions
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Twisted 3D borosilicate optical toroid SDF
  float sdGlassVessel(vec3 p, float t) {
    vec3 q = p;
    q.xz *= rot2(t * 0.24 + u_mouse.x * 0.48 + u_scroll * 0.65);
    q.yz *= rot2(0.46 + u_mouse.y * 0.34 - u_scroll * 0.35);

    // Subtle Mobius-like cross-section twist along the major torus angle
    float ang = atan(q.z, q.x);
    vec2 tor = vec2(length(q.xz) - 1.18, q.y);
    tor *= rot2(ang * 1.5 - t * 0.45);

    // Sculpted faceted optical glass profile (slightly fluted cylindrical cross-section)
    float flute = 0.022 * cos(atan(tor.y, tor.x) * 4.0);
    float outerRing = length(tor) - (0.31 + flute);

    // Secondary intersecting precision optical lens ring
    vec3 q2 = p;
    q2.xy *= rot2(-0.68 - t * 0.18 + u_mouse.x * 0.32);
    q2.yz *= rot2(0.85 + u_mouse.y * 0.28);
    float secondaryRing = length(vec2(length(q2.xz) - 1.38, q2.y)) - 0.065;

    // Central dark obsidian prism core suspended inside the toroid
    vec3 q3 = q;
    q3.xy *= rot2(t * 0.35);
    float dCore = length(max(abs(q3) - vec3(0.24), 0.0)) - 0.07;

    float rings = smin(outerRing, secondaryRing, 0.16);
    return min(rings, dCore);
  }

  // Internal blazing Neon-10 ionized plasma filament spiraling inside the glass vessel
  float sdPlasmaFilament(vec3 p, float t) {
    vec3 q = p;
    q.xz *= rot2(t * 0.24 + u_mouse.x * 0.48 + u_scroll * 0.65);
    q.yz *= rot2(0.46 + u_mouse.y * 0.34 - u_scroll * 0.35);

    float ang = atan(q.z, q.x);
    vec2 tor = vec2(length(q.xz) - 1.18, q.y);
    tor *= rot2(ang * 3.0 - t * 1.15);

    // Twin spiraling plasma threads inside the glass tube
    float threadA = length(tor - vec2(0.095, 0.0)) - 0.028;
    float threadB = length(tor + vec2(0.095, 0.0)) - 0.020;

    // Secondary fine orbital plasma ring
    vec3 q2 = p;
    q2.xy *= rot2(-0.68 - t * 0.18 + u_mouse.x * 0.32);
    q2.yz *= rot2(0.85 + u_mouse.y * 0.28);
    float orbitArc = length(vec2(length(q2.xz) - 1.38, q2.y)) - 0.016;

    return min(min(threadA, threadB), orbitArc);
  }

  vec3 calcNormal(vec3 p, float t) {
    vec2 e = vec2(0.0028, 0.0);
    return normalize(vec3(
      sdGlassVessel(p + e.xyy, t) - sdGlassVessel(p - e.xyy, t),
      sdGlassVessel(p + e.yxy, t) - sdGlassVessel(p - e.yxy, t),
      sdGlassVessel(p + e.yyx, t) - sdGlassVessel(p - e.yyx, t)
    ));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
    float aspect = u_res.x / max(u_res.y, 1.0);
    float t = u_time;

    // Frame the 3D optical sculpture cleanly inside the viewport (unclipped sculptural silhouette!)
    vec2 camShift = aspect > 1.05 ? vec2(-0.34, 0.01) : vec2(0.0, -0.08);
    vec2 p2 = uv + camShift;

    vec3 ro = vec3(0.0, 0.0, (aspect > 1.05 ? 4.35 : 4.65) - u_scroll * 0.45);
    vec3 rd = normalize(vec3(p2, -1.78));

    // High-precision 64-step SDF raymarcher for razor-clean borosilicate glass & obsidian prism core
    float dist = 0.0;
    float hitT = -1.0;
    float plasmaAccum = 0.0;
    float coreAccum = 0.0;

    for (int i = 0; i < 64; i++) {
      vec3 pos = ro + rd * dist;
      float dPlasma = sdPlasmaFilament(pos, t);
      float dGlass = sdGlassVessel(pos, t);

      // Volumetric inverse-square glow accumulation from internal Neon-10 filament
      float safeP = max(dPlasma, 0.014);
      plasmaAccum += 0.0046 / (safeP * safeP + 0.015);
      coreAccum += exp(-safeP * 28.0) * 0.13;

      if (hitT < 0.0 && dGlass < 0.0025) {
        hitT = dist;
      }

      // Tight march step near glass surface eliminates bevel banding artifacts
      float stepD = hitT < 0.0
        ? min(max(dGlass * 0.78, 0.004), max(dPlasma * 0.68, 0.018))
        : min(max(abs(dGlass), 0.022), max(dPlasma * 0.68, 0.022));
      dist += stepD;
      if (dist > 8.2) break;
    }

    // Neon-10 Atomic Emission Palette
    vec3 colVoid = vec3(0.020, 0.023, 0.032);
    vec3 colCrimson = vec3(0.74, 0.09, 0.04);
    vec3 colVermilion = vec3(1.00, 0.20, 0.08);   // 640.2 nm
    vec3 colAmber = vec3(1.00, 0.56, 0.12);       // 585.2 nm
    vec3 colCore = vec3(1.00, 0.96, 0.90);
    vec3 colDispersion = vec3(0.32, 0.56, 1.00);  // borosilicate prism edge refraction

    vec3 col = colVoid;

    // Subtle deep darkroom atmospheric radial scatter behind the sculpture
    float bgRad = exp(-length(p2) * 1.45);
    col += colCrimson * bgRad * 0.22;

    // Accumulate volumetric Neon plasma light
    col += colVermilion * (1.0 - exp(-plasmaAccum * 0.055)) * 1.35;
    col += mix(colVermilion, colAmber, 0.58) * (1.0 - exp(-plasmaAccum * 0.022)) * 0.92;
    col += colCore * min(coreAccum * 1.35, 1.7);

    // If ray intersected the 3D sculpted borosilicate glass shell, add physical Fresnel,
    // specular rim highlights, and RGB chromatic glass dispersion!
    if (hitT > 0.0) {
      vec3 hitPos = ro + rd * hitT;
      vec3 n = calcNormal(hitPos, t);
      vec3 v = -rd;
      float ndv = clamp(dot(n, v), 0.0, 1.0);
      float fresnel = pow(1.0 - ndv, 3.2);

      // Dual studio optical key lights (warm neon top-right + cool rim bottom-left)
      vec3 l1 = normalize(vec3(0.75, 0.65, 0.55));
      vec3 l2 = normalize(vec3(-0.85, -0.35, 0.42));
      vec3 h1 = normalize(l1 + v);
      vec3 h2 = normalize(l2 + v);

      float spec1 = pow(max(dot(n, h1), 0.0), 64.0);
      float spec2 = pow(max(dot(n, h2), 0.0), 28.0);

      // Internal plasma proximity lights up the glass wall from inside
      float innerProx = exp(-sdPlasmaFilament(hitPos, t) * 5.2);

      // Dark refractive obsidian glass tint at center, blazing chromatic dispersion on grazing edges
      col = mix(col, col * 0.72 + colVermilion * innerProx * 0.65, 0.42);
      col += mix(colAmber, colCore, 0.6) * spec1 * 1.45;
      col += mix(colDispersion, colCore, 0.35) * spec2 * 0.58;
      col += mix(colVermilion, colDispersion, smoothstep(0.1, 0.85, n.x * 0.5 + 0.5)) * fresnel * 0.92;
      col += colCore * pow(fresnel, 2.2) * 0.42;
    }

    // Subtle anamorphic horizontal lens streak across optical center
    float flare = exp(-abs(p2.y - 0.14) * 58.0) * exp(-abs(p2.x) * 2.4) * 0.38;
    col += mix(colAmber, colCore, 0.65) * flare;

    // Fine calibrated horizontal optical hairline
    float axisLine = exp(-abs(p2.y) * 320.0) * exp(-abs(p2.x) * 0.9) * 0.08;
    col += colCore * axisLine;

    // Preserve dramatic obsidian negative space on left hemisphere for monumental typography
    float leftShield = smoothstep(0.14, -0.78, uv.x);
    col = mix(col, col * 0.36 + colVoid * 0.64, leftShield * (aspect > 1.05 ? 0.72 : 0.25));

    // ACES Filmic Tone Mapping
    col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);

    // Subtle monochromatic optical film grain (prevents 8-bit gradient banding)
    float grain = (hash21(gl_FragCoord.xy + fract(t * 19.7)) - 0.5) * 0.018;
    col += grain;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

export function HeroRaymarchCanvas({ reducedMotion, scrollProgress }: HeroRaymarchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cap DPR at 1.5 for buttery-smooth 60 FPS raymarching across all GPUs & mobile
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

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

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });

    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uScroll = gl.getUniformLocation(prog, 'u_scroll');

    const pointer = { tx: 0, ty: 0, cx: 0, cy: 0 };
    const onMove = (e: PointerEvent) => {
      if (reducedMotion) return;
      pointer.tx = (e.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      pointer.ty = -((e.clientY / Math.max(window.innerHeight, 1)) * 2 - 1);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    let rafId = 0;
    const t0 = performance.now();

    const render = (now: number) => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      const elapsed = reducedMotion ? 2.1 : (now - t0) * 0.001;
      pointer.cx += (pointer.tx - pointer.cx) * 0.055;
      pointer.cy += (pointer.ty - pointer.cy) * 0.055;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, pointer.cx, pointer.cy);
      gl.uniform1f(uScroll, scrollRef.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="hero-shader-canvas" aria-hidden="true" />;
}
