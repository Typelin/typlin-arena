// Minimal WebGL2 renderer: ribbons shaded as twisted yarn, a wound yarn ball, and a plain-weave cloth.

export const STRIDE = 11; // pos3, side2, t, u, r, col3

const RIBBON_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aSide;
layout(location=2) in float aT;
layout(location=3) in float aU;
layout(location=4) in float aR;
layout(location=5) in vec3 aCol;
uniform vec2 uView;
uniform float uScroll;
uniform vec2 uOff;
uniform float uInfl;
out float vT; out float vU; out float vR; out vec3 vCol; out vec2 vSide; out float vZ; out float vY;
void main(){
  float r = max(aR, 0.75);
  vec2 p = aPos.xy + aSide * aT * r * uInfl + uOff * (1.0 + max(aPos.z, 0.0) * 0.6);
  vT = aT; vU = aU; vR = aR; vCol = aCol; vSide = aSide; vZ = aPos.z; vY = aPos.y;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - (p.y - uScroll) / uView.y * 2.0, 0.0, 1.0);
}`;

const RIBBON_FS = `#version 300 es
precision highp float;
in float vT; in float vU; in float vR; in vec3 vCol; in vec2 vSide; in float vZ; in float vY;
uniform int uMode;       // 0 yarn, 1 shadow, 2 steel, 3 silk
uniform float uReveal;
uniform float uLayer;
uniform float uDpr;
uniform float uClipY;
uniform float uAlpha;
uniform float uSheenY;
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  if (vU > uReveal) discard;
  if (uLayer * vZ < 0.0) discard;
  if (vY > uClipY) discard;
  float t = clamp(vT, -1.0, 1.0);
  float rr = max(vR, 0.75);
  float aa = clamp(1.3 / (rr * uDpr), 0.02, 0.95);
  float edge = smoothstep(1.0, 1.0 - aa, abs(t)) * min(1.0, vR / 0.75);
  if (uMode == 1) {
    float s = pow(max(0.0, 1.0 - t * t), 1.7) * uAlpha;
    o = vec4(0.0, 0.0, 0.0, s);
    return;
  }
  vec2 sd = normalize(vSide);
  float h = sqrt(max(0.0, 1.0 - t * t));
  vec3 N = vec3(sd * t, h);
  vec3 T = vec3(-sd.y, sd.x, 0.0);
  vec3 L = normalize(vec3(-0.5, -0.62, 0.6));
  vec3 col;
  if (uMode == 0) {
    // three-ply twisted yarn: each ply is a rounded bulge, grooves between plies, fibres along the plies
    float ang = asin(t);
    float cyc = (3.0 * ang + vU / rr * 1.55) / 6.2831853;
    float q = fract(cyc) * 2.0 - 1.0;
    float ply = sqrt(max(0.0, 1.0 - q * q));
    float k = smoothstep(1.4, 4.0, rr);
    float big = smoothstep(7.0, 18.0, rr);
    vec3 Ar = vec3(sd * h, -t);
    vec3 g = normalize(Ar * 3.0 + T * 1.55);
    N = normalize(N + g * q * (0.5 + 0.3 * big) * k);
    float diff = clamp((dot(N, L) + 0.42) / 1.42, 0.0, 1.0);
    float fl = floor(cyc);
    float fib = hash(vec2(floor(q * rr * 0.75), fl));
    float fib2 = hash(vec2(floor(q * rr * 2.3 + 40.0), fl + floor(vU / (rr * 5.0))));
    col = vCol * (0.24 + 1.04 * diff);
    col *= mix(1.0, mix(0.34, 1.0, smoothstep(0.0, 0.62, ply)), k);
    col *= 0.88 + 0.24 * fib * k;
    col *= 1.0 - 0.16 * big * step(0.72, fib2);
    col += vCol * 0.5 * big * step(0.93, fib2) * ply;
    float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 12.0);
    col += spec * 0.2 * vec3(1.0, 0.86, 0.74);
    col *= mix(0.46, 1.0, smoothstep(0.0, 0.55, h));
    // stray fibres catching the light along the silhouette
    float fuzz = hash(vec2(floor(vU / max(rr * 0.22, 1.0)), 7.0));
    col += vCol * 0.35 * big * smoothstep(0.86, 1.0, abs(t)) * step(0.6, fuzz);
  } else if (uMode == 2) {
    float e = dot(N, normalize(vec3(-0.55, -0.5, 0.67)));
    col = mix(vec3(0.16, 0.17, 0.2), vec3(0.78, 0.8, 0.84), smoothstep(-0.25, 0.75, e));
    col += vec3(1.0) * smoothstep(0.035, 0.0, abs(t + 0.34)) * 0.75;
    col = mix(col, vec3(0.42, 0.36, 0.3), smoothstep(0.55, 1.0, t) * 0.5);
    col *= vCol;
  } else {
    float sheen = exp(-pow((vY - uSheenY) / 150.0, 2.0));
    col = vCol * (0.72 + 0.55 * sheen) + vec3(1.0, 0.8, 0.62) * sheen * 0.1;
  }
  float a = edge * uAlpha;
  o = vec4(col * a, a);
}`;

const QUAD_VS = `#version 300 es
layout(location=0) in vec2 aQ;
uniform vec4 uRect;
uniform vec2 uView;
uniform float uScroll;
out vec2 vP;
void main(){
  vec2 p = uRect.xy + aQ * uRect.zw;
  vP = p;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - (p.y - uScroll) / uView.y * 2.0, 0.0, 1.0);
}`;

const BALL_FS = `#version 300 es
precision highp float;
in vec2 vP;
uniform vec2 uC;
uniform float uRad;
uniform mat3 uRot;
uniform float uDpr;
uniform vec3 uCol;
uniform float uDens;
out vec4 o;
float h1(float n){ return fract(sin(n * 91.345) * 47453.5453); }
vec3 axis(float k){
  float z = h1(k * 1.7 + 0.3) * 2.0 - 1.0;
  float a = h1(k * 3.1 + 1.9) * 6.2831853;
  float r = sqrt(max(0.0, 1.0 - z * z));
  return vec3(r * cos(a), r * sin(a), z);
}
void main(){
  vec2 p = (vP - uC) / uRad;
  float d = length(p);
  float sh = smoothstep(1.34, 0.92, length(p - vec2(0.045, 0.085))) * 0.36;
  if (d > 1.0) { o = vec4(0.0, 0.0, 0.0, sh); return; }
  vec3 n = vec3(p, sqrt(max(0.0, 1.0 - d * d)));
  vec3 q = uRot * n;
  vec3 ax = axis(0.0);
  float cc = dot(q, ax);
  float top = 0.0;
  float shade = 1.0;
  for (int k = 1; k < 20; k++) {
    vec3 a = axis(float(k));
    float wk = 0.16 + 0.26 * h1(float(k) * 5.3);
    float dk = dot(q, a);
    float ad = abs(dk);
    if (ad < wk) { top = float(k); ax = a; cc = dk; shade = 1.0; }
    else { shade *= mix(0.42, 1.0, smoothstep(0.0, 0.085, ad - wk)); }
  }
  float sIdx = cc * uDens;
  float t = (fract(sIdx) - 0.5) * 2.0;
  vec3 across = normalize(ax - q * dot(ax, q));
  vec3 along = cross(q, across);
  float hh = sqrt(max(0.0, 1.0 - t * t));
  vec3 b = normalize(cross(ax, vec3(0.31, 0.9, 0.23)));
  vec3 c2 = cross(ax, b);
  float phi = atan(dot(q, b), dot(q, c2));
  float rad = sqrt(max(1.0 - cc * cc, 0.01));
  float uLen = phi * rad * uDens * 2.0;
  float ph = 3.0 * asin(clamp(t, -1.0, 1.0)) + uLen * 1.55 + floor(sIdx) * 2.1;
  float ridge = 0.5 + 0.5 * sin(ph);
  vec3 No = normalize(q + across * t * 0.9 + along * cos(ph) * 0.34 * hh);
  vec3 Nv = transpose(uRot) * No;
  vec3 L = normalize(vec3(-0.5, -0.62, 0.6));
  float diff = clamp((dot(Nv, L) + 0.4) / 1.4, 0.0, 1.0);
  float big = clamp((dot(n, L) + 0.62) / 1.62, 0.0, 1.0);
  vec3 col = uCol * (0.2 + 1.05 * diff) * mix(0.42, 1.0, big);
  col *= mix(0.56, 1.0, pow(ridge, 0.75));
  col *= mix(0.36, 1.0, smoothstep(0.0, 0.6, hh));
  col *= shade;
  col *= 0.86 + 0.26 * h1(floor(sIdx) + top * 13.0);
  float spec = pow(max(dot(reflect(-L, Nv), vec3(0.0, 0.0, 1.0)), 0.0), 14.0);
  col += spec * 0.16 * vec3(1.0, 0.86, 0.74) * big;
  col *= mix(0.6, 1.0, smoothstep(0.0, 0.34, n.z));
  float a = smoothstep(1.0, 1.0 - 2.5 / (uRad * uDpr), d);
  o = vec4(col * a, a + (1.0 - a) * sh);
}`;

const CLOTH_FS = `#version 300 es
precision highp float;
in vec2 vP;
uniform vec4 uRect;
uniform float uEdge;
uniform float uProg;
uniform float uSw;
uniform float uTime;
uniform vec3 uWeft;
uniform vec3 uWarp;
uniform float uDpr;
out vec4 o;
float h1(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
void main(){
  vec2 p = vP - uRect.xy;
  float sw = uSw;
  float shh = uSw * 0.86;
  float below = max(0.0, vP.y - uEdge);
  float i0 = floor(p.x / sw);
  float sway = (sin(uTime * 0.8 + i0 * 0.19 + below * 0.011) * 0.03 + (h1(i0) - 0.5) * 0.05) * below;
  float x = p.x - sway;
  float i = floor(x / sw);
  float fx = fract(x / sw);
  float j = floor(p.y / shh);
  float fy = fract(p.y / shh);
  float limitJ = floor((min(uProg, uEdge) - uRect.y) / shh) - 1.0;
  bool woven = j <= limitJ;
  float tw = (fx - 0.5) / 0.4;
  float th = (fy - 0.5) / 0.45;
  float fringeEnd = uRect.y + uRect.w - (0.04 + 0.2 * h1(i * 1.7 + 3.0)) * (uRect.y + uRect.w - uEdge);
  bool inWarp = abs(tw) < 1.0 && vP.y < fringeEnd && i >= 0.0 && x < uRect.z;
  bool inWeft = woven && abs(th) < 1.0;
  bool weftTop = mod(i + j, 2.0) < 1.0;
  vec3 L = normalize(vec3(-0.5, -0.62, 0.6));
  vec3 col; float a = 1.0;
  if (inWeft && (weftTop || !inWarp)) {
    float hh = sqrt(1.0 - th * th);
    float und = weftTop ? cos((fx - 0.5) * 3.14159) : 0.25;
    vec3 N = normalize(vec3(-sin((fx - 0.5) * 3.14159) * (weftTop ? 0.55 : -0.3), th, hh));
    float diff = clamp((dot(N, L) + 0.4) / 1.4, 0.0, 1.0);
    float ph = 3.0 * asin(th) + p.x / (shh * 0.45) * 1.55 + j * 1.3;
    col = uWeft * (0.22 + 1.0 * diff) * mix(0.5, 1.0, und) * mix(0.62, 1.0, 0.5 + 0.5 * sin(ph));
    col *= mix(0.45, 1.0, smoothstep(0.0, 0.6, hh)) * (0.88 + 0.24 * h1(j * 3.1));
    a = smoothstep(1.0, 1.0 - 1.6 / (shh * 0.45 * uDpr), abs(th));
  } else if (inWarp) {
    float hh = sqrt(1.0 - tw * tw);
    float und = woven ? cos((fy - 0.5) * 3.14159) : 1.0;
    vec3 N = normalize(vec3(tw, woven ? -sin((fy - 0.5) * 3.14159) * 0.55 : 0.0, hh));
    float diff = clamp((dot(N, L) + 0.4) / 1.4, 0.0, 1.0);
    float ph = 3.0 * asin(tw) + p.y / (sw * 0.4) * 1.55 + i * 2.3;
    float fade = 1.0 - 0.45 * smoothstep(0.0, uRect.w * 0.45, below);
    col = uWarp * (0.2 + 1.0 * diff) * mix(0.5, 1.0, und) * mix(0.66, 1.0, 0.5 + 0.5 * sin(ph)) * fade;
    col *= mix(0.45, 1.0, smoothstep(0.0, 0.6, hh)) * (0.82 + 0.3 * h1(i * 7.7));
    a = smoothstep(1.0, 1.0 - 1.6 / (sw * 0.4 * uDpr), abs(tw));
    a *= smoothstep(fringeEnd, fringeEnd - 6.0, vP.y);
  } else {
    if (!woven) discard;
    col = vec3(0.0); a = 0.55;
  }
  o = vec4(col * a, a);
}`;

type Mesh = { vao: WebGLVertexArrayObject; vbo: WebGLBuffer; count: number; cap: number };

export interface DrawOpts {
  mode?: number;
  reveal?: number;
  layer?: number;
  clipY?: number;
  alpha?: number;
  sheenY?: number;
  shadow?: number; // shadow strength, 0 = none
  shadowOff?: [number, number];
  shadowInfl?: number;
}

function compile(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  return p;
}

function uniforms(gl: WebGL2RenderingContext, p: WebGLProgram, names: string[]) {
  const u: Record<string, WebGLUniformLocation | null> = {};
  for (const n of names) u[n] = gl.getUniformLocation(p, n);
  return u;
}

export class Renderer {
  gl: WebGL2RenderingContext;
  private rib: WebGLProgram;
  private ball: WebGLProgram;
  private cloth: WebGLProgram;
  private uR: Record<string, WebGLUniformLocation | null>;
  private uB: Record<string, WebGLUniformLocation | null>;
  private uC: Record<string, WebGLUniformLocation | null>;
  private meshes = new Map<string, Mesh>();
  private quad: WebGLVertexArrayObject;
  private w = 1;
  private h = 1;
  private dpr = 1;
  private scroll = 0;

  constructor(public canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) throw new Error('webgl2');
    this.gl = gl;
    this.rib = compile(gl, RIBBON_VS, RIBBON_FS);
    this.ball = compile(gl, QUAD_VS, BALL_FS);
    this.cloth = compile(gl, QUAD_VS, CLOTH_FS);
    this.uR = uniforms(gl, this.rib, ['uView', 'uScroll', 'uOff', 'uInfl', 'uMode', 'uReveal', 'uLayer', 'uDpr', 'uClipY', 'uAlpha', 'uSheenY']);
    this.uB = uniforms(gl, this.ball, ['uRect', 'uView', 'uScroll', 'uC', 'uRad', 'uRot', 'uDpr', 'uCol', 'uDens']);
    this.uC = uniforms(gl, this.cloth, ['uRect', 'uView', 'uScroll', 'uEdge', 'uProg', 'uSw', 'uTime', 'uWeft', 'uWarp', 'uDpr']);
    this.quad = gl.createVertexArray()!;
    gl.bindVertexArray(this.quad);
    const qb = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
  }

  resize(w: number, h: number, dpr: number) {
    this.w = w; this.h = h; this.dpr = dpr;
    const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw; this.canvas.height = ch;
    }
    this.gl.viewport(0, 0, cw, ch);
  }

  begin(scroll: number) {
    this.scroll = scroll;
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  set(name: string, data: Float32Array, count: number, dynamic = false) {
    const gl = this.gl;
    let m = this.meshes.get(name);
    if (!m) {
      const vao = gl.createVertexArray()!;
      const vbo = gl.createBuffer()!;
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      const B = 4 * STRIDE;
      const at = (loc: number, size: number, off: number) => {
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, B, off * 4);
      };
      at(0, 3, 0); at(1, 2, 3); at(2, 1, 5); at(3, 1, 6); at(4, 1, 7); at(5, 3, 8);
      m = { vao, vbo, count: 0, cap: 0 };
      this.meshes.set(name, m);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
    const view = data.subarray(0, count * STRIDE);
    if (view.length > m.cap) {
      gl.bufferData(gl.ARRAY_BUFFER, view, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
      m.cap = view.length;
    } else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
    }
    m.count = count;
  }

  draw(name: string, o: DrawOpts = {}) {
    const m = this.meshes.get(name);
    if (!m || m.count < 3) return;
    const gl = this.gl, u = this.uR;
    gl.useProgram(this.rib);
    gl.bindVertexArray(m.vao);
    gl.uniform2f(u.uView, this.w, this.h);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform1f(u.uReveal, o.reveal ?? 1e9);
    gl.uniform1f(u.uLayer, o.layer ?? 0);
    gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform1f(u.uClipY, o.clipY ?? 1e9);
    gl.uniform1f(u.uSheenY, o.sheenY ?? -1e6);
    if (o.shadow) {
      const off = o.shadowOff ?? [5, 8];
      gl.uniform1i(u.uMode, 1);
      gl.uniform2f(u.uOff, off[0], off[1]);
      gl.uniform1f(u.uInfl, o.shadowInfl ?? 1.7);
      gl.uniform1f(u.uAlpha, o.shadow);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, m.count);
    }
    gl.uniform1i(u.uMode, o.mode ?? 0);
    gl.uniform2f(u.uOff, 0, 0);
    gl.uniform1f(u.uInfl, 1);
    gl.uniform1f(u.uAlpha, o.alpha ?? 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, m.count);
  }

  private quadCommon(u: Record<string, WebGLUniformLocation | null>, rect: [number, number, number, number]) {
    const gl = this.gl;
    gl.bindVertexArray(this.quad);
    gl.uniform4f(u.uRect, rect[0], rect[1], rect[2], rect[3]);
    gl.uniform2f(u.uView, this.w, this.h);
    gl.uniform1f(u.uScroll, this.scroll);
    gl.uniform1f(u.uDpr, this.dpr);
  }

  drawBall(cx: number, cy: number, rad: number, rot: Float32Array, col: number[], dens: number) {
    const gl = this.gl, u = this.uB;
    gl.useProgram(this.ball);
    const m = rad * 1.5;
    this.quadCommon(u, [cx - m, cy - m, m * 2, m * 2]);
    gl.uniform2f(u.uC, cx, cy);
    gl.uniform1f(u.uRad, rad);
    gl.uniformMatrix3fv(u.uRot, false, rot);
    gl.uniform3f(u.uCol, col[0], col[1], col[2]);
    gl.uniform1f(u.uDens, dens);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  drawCloth(rect: [number, number, number, number], edge: number, prog: number, sw: number, time: number, weft: number[], warp: number[]) {
    const gl = this.gl, u = this.uC;
    gl.useProgram(this.cloth);
    this.quadCommon(u, rect);
    gl.uniform1f(u.uEdge, edge);
    gl.uniform1f(u.uProg, prog);
    gl.uniform1f(u.uSw, sw);
    gl.uniform1f(u.uTime, time);
    gl.uniform3f(u.uWeft, weft[0], weft[1], weft[2]);
    gl.uniform3f(u.uWarp, warp[0], warp[1], warp[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
