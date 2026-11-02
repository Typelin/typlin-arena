// Shared GLSL chunks. All colour comes from one blackbody function so every
// pass (background, orb, sparks, token field) reads as the same material.

const BLACKBODY = /* glsl */ `
vec3 bbChroma(float t) {
  t = clamp(t, 800.0, 12000.0);
  float u = (0.860117757 + 1.54118254e-4 * t + 1.28641212e-7 * t * t) /
            (1.0 + 8.42420235e-4 * t + 7.08145163e-7 * t * t);
  float v = (0.317398726 + 4.22806245e-5 * t + 4.20481691e-8 * t * t) /
            (1.0 - 2.89741816e-5 * t + 1.61456053e-7 * t * t);
  float x = 3.0 * u / (2.0 * u - 8.0 * v + 4.0);
  float y = 2.0 * v / (2.0 * u - 8.0 * v + 4.0);
  vec3 XYZ = vec3(x / y, 1.0, (1.0 - x - y) / y);
  mat3 M = mat3(3.2404542, -0.9692660, 0.0556434,
                -1.5371385, 1.8760108, -0.2040259,
                -0.4985314, 0.0415560, 1.0572252);
  vec3 c = max(M * XYZ, vec3(0.0));
  return c / max(max(c.r, c.g), max(c.b, 1e-4));
}
// Radiance grows steeply with temperature; the curve is softened so that a
// white-hot surface still shows texture instead of clipping flat.
float bbPower(float t) {
  float k = max(t - 650.0, 0.0) / 1350.0;
  return pow(k, 1.6) * 0.9;
}
vec3 blackbody(float t) {
  float p = bbPower(t);
  return bbChroma(t) * (p / (1.0 + p * 0.18));
}
`

const NOISE = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
           i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm(vec3 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 5; i++) { s += a * snoise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return s;
}
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`

export const FULL_VS = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

export const ORB_FS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uOrb;      // centre (px, gl origin) and radius (px)
uniform float uTemp;    // surface temperature in kelvin
uniform float uCrust;   // 0 = fully molten, 1 = fully crusted
uniform float uGlow;    // halo strength
uniform vec3 uBg;       // linear background tint
uniform float uFlash;
uniform float uDim;     // darkens everything under the token field
uniform vec2 uLook;     // where the hot spot leans, -1..1
uniform float uStill;   // 1 when reduced motion
uniform float uExposure;
uniform float uDetail;  // raises noise frequency as the orb is magnified
uniform vec4 uOrb2;     // visitor's ember: x, y, r (px), alpha
uniform vec3 uPour;     // stream x (px), half width (px), alpha
uniform float uVis;     // orb visibility
uniform sampler2D uGlyphTex; // R: sharp glyph mask, G: blurred mask
uniform vec4 uGlyph;    // glyph box: x, y, w, h (px, gl coords)
uniform float uGlyphA;
uniform vec4 uRing;     // scope ring: x, y, r (px), alpha
out vec4 outColor;
${BLACKBODY}
${NOISE}

vec3 tonemap(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float minDim = min(uRes.x, uRes.y);
  float t = uTime * (1.0 - uStill * 0.97);
  vec2 q = (fc - uOrb.xy) / uOrb.z;
  float d = length(q);

  // Background: tinted dark with a soft gradient falling away from the top.
  vec2 uv = fc / uRes;
  vec3 col = uBg * (0.55 + 0.45 * smoothstep(-0.2, 1.1, uv.y));
  // Slow heat shimmer keeps large flat fields from looking like a fill.
  vec2 sp = fc / minDim;
  float shimmer = snoise(vec3(sp * 1.6, t * 0.035)) * 0.6 + snoise(vec3(sp * 4.1, t * 0.05 + 9.0)) * 0.4;
  col *= 0.9 + 0.14 * shimmer;

  // Halo light spills from the orb into the room. Its power is capped so a
  // white-hot orb doesn't wash out the type around it.
  vec3 chroma = bbChroma(uTemp);
  float pw = bbPower(uTemp);
  float rr = max(d - 0.92, 0.0);
  float halo = uGlow / (1.0 + rr * rr * 7.0 + rr * 1.6);
  float wide = uGlow * 0.07 / (1.0 + pow(length(fc - uOrb.xy) / (minDim * 0.6), 2.0) * 5.0);
  col += chroma * (halo * 0.16 * min(pw, 4.0) + wide * min(pw, 1.4)) * uVis;

  // Licking flames just outside the limb.
  if (uVis > 0.001 && d > 0.9 && d < 2.4) {
    vec2 dir = q / max(d, 1e-4);
    float n = fbm(vec3(dir * 2.4, t * 0.22 - d * 1.3));
    float edge = smoothstep(1.0 + 0.35 * (1.0 - uCrust) * (0.6 + n), 0.96, d);
    col += blackbody(uTemp * 0.82) * edge * (0.55 + 0.45 * n) * (1.0 - uCrust * 0.85) * uGlow * uVis;
  }

  if (uVis > 0.001 && d < 1.0 && uOrb.z > 1.5) {
    float z = sqrt(1.0 - d * d);
    vec3 n = vec3(q, z);
    float ang = t * 0.045;
    mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    n.xz = r * n.xz;
    vec3 p = n * 1.9 * uDetail + vec3(0.0, t * 0.02, 0.0);
    float w = fbm(p * 1.3 + vec3(t * 0.05));
    float f = fbm(p + w * 0.75) * 0.5 + 0.5;

    // Crust forms where the field is coolest; cracks glow where it breaks.
    float level = mix(-0.05, 0.92, uCrust);
    float molten = smoothstep(level - 0.015, level + 0.05, f);
    float crack = exp(-abs(f - level) * 38.0) * step(0.02, uCrust);

    float lean = 0.5 + 0.5 * dot(normalize(vec3(uLook, 1.2)), vec3(q, z));
    float T = uTemp * (0.56 + 0.66 * f * f) * mix(0.88, 1.1, lean);
    vec3 hot = blackbody(T) * mix(0.3, 1.0, pow(z, 0.6));

    vec3 rock = vec3(0.020, 0.015, 0.013) * (0.6 + 0.8 * fbm(p * 6.0) * 0.5 + 0.4);
    rock += blackbody(uTemp * 0.55) * 0.05 * (1.0 - z);
    rock += vec3(0.05, 0.035, 0.03) * pow(max(dot(normalize(vec3(-0.4, 0.6, 0.7)), vec3(q, z)), 0.0), 6.0) * 0.6;

    vec3 surf = mix(rock, hot, molten) + blackbody(uTemp * 1.05) * crack * 0.9;
    float aa = smoothstep(1.0, 1.0 - 2.0 / uOrb.z, d);
    col = mix(col, surf, aa * uVis);
  }

  // A continuous pour of molten metal: long, uninterrupted work.
  if (uPour.z > 0.001) {
    float yy = fc.y / minDim;
    float wob = snoise(vec3(yy * 2.2, t * 0.4, 3.0)) * 0.35 + snoise(vec3(yy * 7.0, t * 0.9, 8.0)) * 0.12;
    // The stream leaves the bottom of the orb and falls past the screen edge,
    // thinning slightly as it accelerates.
    float inY = 1.0 - smoothstep(uOrb.y - uOrb.z * 0.92, uOrb.y - uOrb.z * 0.7, fc.y);
    float fall = clamp((uOrb.y - fc.y) / max(uOrb.y, 1.0), 0.0, 1.0);
    float w = uPour.y * mix(1.25, 0.75, sqrt(fall)) * (1.0 + 0.18 * snoise(vec3(yy * 3.0, t * 0.6, 1.0)));
    float dx = (fc.x - uPour.x) / w - wob;
    float core = smoothstep(1.0, 0.35, abs(dx));
    float flow = fbm(vec3(dx * 1.4, yy * 3.2 + t * 1.6, t * 0.15)) * 0.5 + 0.5;
    vec3 metal = blackbody(uTemp * (0.82 + 0.32 * flow)) * mix(0.55, 1.15, 1.0 - abs(dx));
    float glowP = uPour.z * 0.16 / (1.0 + dx * dx * 0.35);
    col += blackbody(uTemp * 0.9) * glowP * inY;
    col = mix(col, metal, core * inY * uPour.z);
  }

  // The glyph 字, cast in the same molten material as the orb.
  if (uGlyphA > 0.001) {
    vec2 gv = (fc - uGlyph.xy) / uGlyph.zw;
    if (gv.x > -0.2 && gv.x < 1.2 && gv.y > -0.2 && gv.y < 1.2) {
      vec2 tv = clamp(gv, 0.0, 1.0);
      float inBox = step(0.0, gv.x) * step(gv.x, 1.0) * step(0.0, gv.y) * step(gv.y, 1.0);
      vec4 tx = texture(uGlyphTex, tv) * inBox;
      float m = tx.r;
      float b = tx.g;
      vec2 e = vec2(1.5 / 512.0, 0.0);
      float bx = texture(uGlyphTex, tv + e.xy).g - texture(uGlyphTex, tv - e.xy).g;
      float by = texture(uGlyphTex, tv + e.yx).g - texture(uGlyphTex, tv - e.yx).g;
      vec3 nrm = normalize(vec3(-bx * 9.0, -by * 9.0, 1.0));
      float height = smoothstep(0.35, 1.0, b);
      // Metal flows downward through the strokes.
      vec3 gp = vec3(gv * vec2(3.2, 2.4) + vec2(0.0, t * 0.12), t * 0.05);
      float wv = fbm(gp * 1.3);
      float fl = fbm(gp + wv * 0.8) * 0.5 + 0.5;
      float T = uTemp * (0.5 + 0.55 * fl) * mix(0.72, 1.06, height);
      vec3 metal = blackbody(T);
      float lit = pow(max(dot(nrm, normalize(vec3(-0.35, 0.55, 0.76))), 0.0), 24.0);
      metal += bbChroma(uTemp * 1.2) * lit * 0.9 * height;
      // Thin cooled skin along the stroke edges, broken by cracks.
      float skin = smoothstep(0.62, 0.18, height) * smoothstep(0.42, 0.62, fl);
      vec3 cool = vec3(0.03, 0.018, 0.014) + blackbody(uTemp * 0.55) * 0.12;
      metal = mix(metal, cool, skin * 0.75);
      float halo = b * (1.0 - m) * 0.55 + pow(b, 3.0) * 0.25;
      col += bbChroma(uTemp) * halo * min(bbPower(uTemp), 2.5) * uGlyphA;
      col = mix(col, metal, m * uGlyphA);
    }
  }

  // Scope ring: a thin hot line that the sparks press against.
  if (uRing.w > 0.001) {
    vec2 rq = fc - uRing.xy;
    float rl = length(rq);
    float an = atan(rq.y, rq.x);
    float px1 = 1.4 * max(uRes.x / 1440.0, 1.0);
    float line = exp(-pow((rl - uRing.z) / px1, 2.0));
    float flick = 0.55 + 0.45 * snoise(vec3(cos(an) * 2.0, sin(an) * 2.0, t * 0.35));
    float inner = smoothstep(uRing.z, uRing.z * 0.55, rl) * step(rl, uRing.z);
    col += bbChroma(uTemp * 1.1) * (line * (0.55 + 0.9 * flick) + inner * 0.035) * uRing.w;
  }

  if (uOrb2.w > 0.001) {
    vec2 q2 = (fc - uOrb2.xy) / uOrb2.z;
    float d2 = length(q2);
    float r2 = max(d2 - 0.9, 0.0);
    col += blackbody(2500.0) * uOrb2.w * 0.16 / (1.0 + r2 * r2 * 4.0 + r2 * 1.1);
    if (d2 < 1.0) {
      float z2 = sqrt(1.0 - d2 * d2);
      float f2 = fbm(vec3(q2 * 1.5, t * 0.09)) * 0.5 + 0.5;
      vec3 s2 = blackbody(2300.0 * (0.78 + 0.4 * f2)) * mix(0.5, 1.0, pow(z2, 0.5));
      col = mix(col, s2, smoothstep(1.0, 1.0 - 2.0 / uOrb2.z, d2) * uOrb2.w);
    }
  }

  col *= 1.0 - uDim;
  col += vec3(1.0, 0.97, 0.9) * uFlash * 2.5;

  // Vignette and film grain give the frame a physical, photographed feel.
  vec2 vq = uv - 0.5;
  col *= 1.0 - dot(vq, vq) * 0.55;
  vec3 mapped = tonemap(col * uExposure);
  mapped = pow(mapped, vec3(1.0 / 2.2));
  float g = hash12(fc + floor(t * 12.0) * 17.0) - 0.5;
  mapped += g * 0.028;
  outColor = vec4(mapped, 1.0);
}
`

export const SPARK_VS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec3 uOrb;
uniform float uTime;
uniform float uTemp;
uniform float uCount;
uniform float uScale;
uniform float uBound;   // px radius sparks stay inside; 0 = unbounded
uniform float uFade;
uniform vec3 uAttract;  // px target that half the sparks arc toward, strength
out vec3 vCol;
out float vA;
${BLACKBODY}
float h(float n) { return fract(sin(n * 127.1 + 3.7) * 43758.5453); }
void main() {
  float id = float(gl_VertexID);
  if (id >= uCount) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return; }
  float life = mix(2.2, 4.8, h(id + 1.0));
  float tt = uTime / life + h(id + 2.0);
  float age = fract(tt);
  float s = id * 7.31 + floor(tt) * 13.7;
  float ang = h(s) * 6.2831;
  vec2 dir = vec2(cos(ang), sin(ang));
  vec2 start = uOrb.xy + dir * uOrb.z * (0.88 + 0.14 * h(s + 3.0));
  vec2 vel = (dir * 0.45 + vec2((h(s + 4.0) - 0.5) * 0.5, 0.75)) * uOrb.z * (0.5 + 0.9 * h(s + 5.0));
  // Buoyancy: sparks accelerate upward and wander as they cool.
  vec2 pos = start + vel * age + vec2(sin(age * 5.0 + s) * 0.06, age * age * 0.9) * uOrb.z;
  float T = mix(uTemp * 1.08, 820.0, pow(age, 0.6));
  if (uAttract.z > 0.0 && mod(id, 2.0) < 1.0) {
    vec2 a = uAttract.xy + (vec2(h(s + 6.0), h(s + 7.0)) - 0.5) * uOrb.z * 0.25;
    vec2 arc = start + (a - start) * smoothstep(0.0, 1.0, age);
    arc.y += sin(age * 3.14159) * length(a - start) * (0.16 + 0.22 * h(s + 8.0));
    pos = mix(pos, arc, uAttract.z);
    T = mix(T, mix(uTemp * 1.08, 1600.0, age), uAttract.z);
  }
  vCol = blackbody(T) * 1.8;
  vA = (1.0 - age) * smoothstep(0.0, 0.06, age) * uFade * clamp(uCount - id, 0.0, 1.0);
  if (uBound > 0.0) {
    vec2 off = pos - uOrb.xy;
    float L = length(off);
    // Sparks slide along the boundary instead of crossing it.
    if (L > uBound * 0.97) pos = uOrb.xy + off / L * uBound * 0.97;
    vA *= 1.0 - smoothstep(uBound * 0.9, uBound * 0.97, L) * 0.7;
  }
  gl_PointSize = mix(3.2, 1.2, age) * uScale;
  gl_Position = vec4(pos / uRes * 2.0 - 1.0, 0.0, 1.0);
}
`

export const GRID_VS = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec2 uAnchor;   // px where the target cell lands
uniform vec2 uTarget;   // target cell in grid units
uniform float uCell;    // px per cell
uniform float uTime;
uniform float uAlpha;
uniform float uScale;
uniform vec2 uStart;    // first visible cell
uniform float uCols;    // visible column count
uniform float uMaxSize; // GPU point size limit
uniform float uOut;     // highlight for the output-limit rows
uniform float uTemp;
uniform float uTargetA;
uniform vec4 uClear;    // px rect (gl coords) kept quiet behind text
out vec3 vCol;
out float vA;
${BLACKBODY}
float h2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 perm3(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float sn2(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = perm3(perm3(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
  float id = float(gl_VertexID);
  float row = floor(id / uCols);
  vec2 cell = uStart + vec2(id - row * uCols, row);
  vec2 g = cell + 0.5 + (vec2(h2(cell), h2(cell + 71.3)) - 0.5) * 0.36;
  bool target = all(equal(cell, uTarget));
  if (target) g = cell + 0.5;
  vec2 sp = uAnchor + (g - (uTarget + 0.5)) * uCell;
  float real = uCell * 0.42;
  // Sub-pixel tokens are drawn a little larger and dimmer so they average
  // into a smooth field instead of aliasing into static.
  float size = clamp(real, 2.2 * uScale, min(uMaxSize, 30.0 * uScale));
  if (target) size = clamp(max(real, 7.0 * uScale), 1.0, uMaxSize);
  if (cell.x > 999.0 || cell.y > 999.0 || (uAlpha <= 0.0 && !target) ||
      sp.x < -size || sp.y < -size || sp.x > uRes.x + size || sp.y > uRes.y + size) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; return;
  }
  // Energy-preserving: sub-pixel tokens still add up to the right brightness.
  float cover = min(1.0, (real * real) / (size * size));
  float r = h2(cell + 5.1);
  float flick = 0.9 + 0.1 * sin(uTime * (0.6 + r * 2.2) + r * 40.0);
  // Large-scale heat currents so the full million reads as a landscape.
  vec2 nc = cell / 1000.0;
  float t = uTime * 0.02;
  vec2 warp = vec2(sn2(nc * 2.2 + t), sn2(nc * 2.2 + 17.0 - t));
  float heat = sn2(nc * 3.1 + warp * 0.55) * 0.6 + sn2(nc * 8.3 + warp) * 0.28 + sn2(nc * 21.0) * 0.12;
  heat = smoothstep(-0.55, 0.75, heat);
  // Ember reds and oranges; a sparse few run white-gold.
  float T = mix(1150.0, 2900.0, clamp(heat * 0.85 + r * 0.25, 0.0, 1.0));
  float star = step(0.992, r);
  T = mix(T, 4800.0, star);
  float gain = flick * (0.3 + 1.2 * heat * heat + star * 1.4);
  // Bottom 128 rows = 128,000 tokens, the single-reply output limit. They
  // ignite row by row from the bottom as the visitor scrolls.
  float fillTo = uOut * 132.0;
  float outRow = step(cell.y, 127.5) * clamp(fillTo - cell.y, 0.0, 1.0);
  T = mix(T, 7800.0, outRow);
  gain = mix(gain * (1.0 - 0.45 * uOut), flick * (1.6 + 1.2 * heat), outRow);
  vCol = target ? bbChroma(uTemp) * 4.0 : bbChroma(T) * gain;
  // Density compensation keeps on-screen brightness steady across zoom.
  vA = target ? uTargetA : uAlpha * min(1.0, cover * 14.0);
  // Soft, rounded quiet zone behind the headline so text stays legible.
  vec2 cc = (uClear.xy + uClear.zw) * 0.5;
  vec2 he = (uClear.zw - uClear.xy) * 0.5;
  vec2 qd = max(abs(sp - cc) - he, 0.0);
  float dq = length(qd);
  if (!target && he.x > 0.0) vA *= 1.0 - 0.8 * (1.0 - smoothstep(0.0, 120.0 * uScale, dq));
  gl_PointSize = size;
  gl_Position = vec4(sp / uRes * 2.0 - 1.0, 0.0, 1.0);
}
`

export const POINT_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vCol;
in float vA;
out vec4 outColor;
void main() {
  float r = length(gl_PointCoord - 0.5) * 2.0;
  // Point size from derivatives: small points stay soft, large ones become
  // crisp little spheres with limb darkening.
  float px = max(fwidth(gl_PointCoord.x), 1e-3);
  float big = smoothstep(0.2, 0.05, px);
  float soft = smoothstep(1.0, 0.55, r) * 0.55 + exp(-r * r * 7.0) * 0.9;
  float edge = 1.0 - smoothstep(1.0 - px * 3.0, 1.0, r);
  float z = sqrt(max(1.0 - r * r, 0.0));
  float sphere = edge * (0.25 + 0.75 * pow(z, 0.8)) + exp(-r * r * 16.0) * 0.35;
  vec3 c = vCol * mix(soft, sphere, big);
  // Hue-preserving rolloff: bright points stay coloured instead of greying out.
  c = c / (1.0 + max(max(c.r, c.g), c.b) * 0.6);
  outColor = vec4(c * vA, 1.0);
}
`
