(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))e(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&e(l)}).observe(document,{childList:!0,subtree:!0});function o(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(t){if(t.ep)return;t.ep=!0;const n=o(t);fetch(t.href,n)}})();const Et=11,ko=`#version 300 es
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
}`,Co=`#version 300 es
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
}`,so=`#version 300 es
layout(location=0) in vec2 aQ;
uniform vec4 uRect;
uniform vec2 uView;
uniform float uScroll;
out vec2 vP;
void main(){
  vec2 p = uRect.xy + aQ * uRect.zw;
  vP = p;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - (p.y - uScroll) / uView.y * 2.0, 0.0, 1.0);
}`,No=`#version 300 es
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
}`,zo=`#version 300 es
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
}`;function Jt(s,a,o){const e=(n,l)=>{const c=s.createShader(n);if(s.shaderSource(c,l),s.compileShader(c),!s.getShaderParameter(c,s.COMPILE_STATUS))throw new Error(s.getShaderInfoLog(c)||"shader");return c},t=s.createProgram();if(s.attachShader(t,e(s.VERTEX_SHADER,a)),s.attachShader(t,e(s.FRAGMENT_SHADER,o)),s.linkProgram(t),!s.getProgramParameter(t,s.LINK_STATUS))throw new Error(s.getProgramInfoLog(t)||"link");return t}function to(s,a,o){const e={};for(const t of o)e[t]=s.getUniformLocation(a,t);return e}class ro{constructor(a){this.canvas=a,this.meshes=new Map,this.w=1,this.h=1,this.dpr=1,this.scroll=0;const o=a.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!0});if(!o)throw new Error("webgl2");this.gl=o,this.rib=Jt(o,ko,Co),this.ball=Jt(o,so,No),this.cloth=Jt(o,so,zo),this.uR=to(o,this.rib,["uView","uScroll","uOff","uInfl","uMode","uReveal","uLayer","uDpr","uClipY","uAlpha","uSheenY"]),this.uB=to(o,this.ball,["uRect","uView","uScroll","uC","uRad","uRot","uDpr","uCol","uDens"]),this.uC=to(o,this.cloth,["uRect","uView","uScroll","uEdge","uProg","uSw","uTime","uWeft","uWarp","uDpr"]),this.quad=o.createVertexArray(),o.bindVertexArray(this.quad);const e=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,e),o.bufferData(o.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),o.STATIC_DRAW),o.enableVertexAttribArray(0),o.vertexAttribPointer(0,2,o.FLOAT,!1,0,0),o.bindVertexArray(null),o.enable(o.BLEND),o.blendFunc(o.ONE,o.ONE_MINUS_SRC_ALPHA),o.disable(o.DEPTH_TEST)}resize(a,o,e){this.w=a,this.h=o,this.dpr=e;const t=Math.round(a*e),n=Math.round(o*e);(this.canvas.width!==t||this.canvas.height!==n)&&(this.canvas.width=t,this.canvas.height=n),this.gl.viewport(0,0,t,n)}begin(a){this.scroll=a;const o=this.gl;o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT)}set(a,o,e,t=!1){const n=this.gl;let l=this.meshes.get(a);if(!l){const r=n.createVertexArray(),i=n.createBuffer();n.bindVertexArray(r),n.bindBuffer(n.ARRAY_BUFFER,i);const f=4*Et,h=(m,d,u)=>{n.enableVertexAttribArray(m),n.vertexAttribPointer(m,d,n.FLOAT,!1,f,u*4)};h(0,3,0),h(1,2,3),h(2,1,5),h(3,1,6),h(4,1,7),h(5,3,8),l={vao:r,vbo:i,count:0,cap:0},this.meshes.set(a,l)}n.bindBuffer(n.ARRAY_BUFFER,l.vbo);const c=o.subarray(0,e*Et);c.length>l.cap?(n.bufferData(n.ARRAY_BUFFER,c,t?n.DYNAMIC_DRAW:n.STATIC_DRAW),l.cap=c.length):n.bufferSubData(n.ARRAY_BUFFER,0,c),l.count=e}draw(a,o={}){const e=this.meshes.get(a);if(!e||e.count<3)return;const t=this.gl,n=this.uR;if(t.useProgram(this.rib),t.bindVertexArray(e.vao),t.uniform2f(n.uView,this.w,this.h),t.uniform1f(n.uScroll,this.scroll),t.uniform1f(n.uReveal,o.reveal??1e9),t.uniform1f(n.uLayer,o.layer??0),t.uniform1f(n.uDpr,this.dpr),t.uniform1f(n.uClipY,o.clipY??1e9),t.uniform1f(n.uSheenY,o.sheenY??-1e6),o.shadow){const l=o.shadowOff??[5,8];t.uniform1i(n.uMode,1),t.uniform2f(n.uOff,l[0],l[1]),t.uniform1f(n.uInfl,o.shadowInfl??1.7),t.uniform1f(n.uAlpha,o.shadow),t.drawArrays(t.TRIANGLE_STRIP,0,e.count)}t.uniform1i(n.uMode,o.mode??0),t.uniform2f(n.uOff,0,0),t.uniform1f(n.uInfl,1),t.uniform1f(n.uAlpha,o.alpha??1),t.drawArrays(t.TRIANGLE_STRIP,0,e.count)}quadCommon(a,o){const e=this.gl;e.bindVertexArray(this.quad),e.uniform4f(a.uRect,o[0],o[1],o[2],o[3]),e.uniform2f(a.uView,this.w,this.h),e.uniform1f(a.uScroll,this.scroll),e.uniform1f(a.uDpr,this.dpr)}drawBall(a,o,e,t,n,l){const c=this.gl,r=this.uB;c.useProgram(this.ball);const i=e*1.5;this.quadCommon(r,[a-i,o-i,i*2,i*2]),c.uniform2f(r.uC,a,o),c.uniform1f(r.uRad,e),c.uniformMatrix3fv(r.uRot,!1,t),c.uniform3f(r.uCol,n[0],n[1],n[2]),c.uniform1f(r.uDens,l),c.drawArrays(c.TRIANGLE_STRIP,0,4)}drawCloth(a,o,e,t,n,l,c){const r=this.gl,i=this.uC;r.useProgram(this.cloth),this.quadCommon(i,a),r.uniform1f(i.uEdge,o),r.uniform1f(i.uProg,e),r.uniform1f(i.uSw,t),r.uniform1f(i.uTime,n),r.uniform3f(i.uWeft,l[0],l[1],l[2]),r.uniform3f(i.uWarp,c[0],c[1],c[2]),r.drawArrays(r.TRIANGLE_STRIP,0,4)}}const J=[.8,.2,.115],Fo=[.13,.38,.45],Io=[.76,.53,.14],zt=[.33,.42,.56],Yt=[.4,.48,.34],Bo=[.9,.85,.73],qo=[{name:"low",idx:54,cost:"$3.10",time:"6.3 分",gap:15},{name:"medium",idx:56,cost:"$3.80",time:"7.7 分",gap:11.5},{name:"high",idx:62,cost:"$9.08",time:"16.9 分",gap:7.2},{name:"xhigh",idx:62,cost:"$14.83",time:"25.8 分",gap:5.4},{name:"max",idx:65,cost:"$26.54",time:"45.0 分",gap:3.5}],P=s=>document.getElementById(s),j=(s,a,o)=>Math.min(o,Math.max(a,s)),Ut=s=>(s=j(s,0,1),s*s*(3-2*s)),ot=s=>{const a=Math.sin(s*127.1+11.7)*43758.5453;return a-Math.floor(a)},I=matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.classList.add("js");function X(s){const a=s.getBoundingClientRect(),o=a.left+window.scrollX,e=a.top+window.scrollY;return{x:o,y:e,w:a.width,h:a.height,cx:o+a.width/2,cy:e+a.height/2,r:o+a.width,b:e+a.height}}function Oo(s,a){const o=[],e=[],t=[],n=[],l=[],c=[],r=[s[0],...s,s[s.length-1]];for(let i=1;i<r.length-2;i++){const f=r[i-1],h=r[i],m=r[i+1],d=r[i+2],u=(L,T)=>Math.sqrt(Math.max(Math.hypot(T.x-L.x,T.y-L.y),.001)),g=0,p=g+u(f,h),A=p+u(h,m),b=A+u(m,d),z=Math.hypot(m.x-h.x,m.y-h.y),_=Math.max(2,Math.ceil(z/a)),N=i===r.length-3;c.push(o.length);const y=h.c??J;for(let L=0;L<(N?_+1:_);L++){const T=L/_,K=p+(A-p)*T,x=(D,H,F,W)=>(W-K)/(W-F)*D+(K-F)/(W-F)*H,k=x(f.x,h.x,g,p),U=x(f.y,h.y,g,p),w=x(h.x,m.x,p,A),mt=x(h.y,m.y,p,A),wt=x(m.x,d.x,A,b),yt=x(m.y,d.y,A,b),Q=x(k,w,g,A),ft=x(U,mt,g,A),Qt=x(w,wt,p,b),Ot=x(mt,yt,p,b);o.push(x(Q,Qt,p,A)),e.push(x(ft,Ot,p,A));const M=Ut(T);t.push((h.z??-1)+((m.z??-1)-(h.z??-1))*M),n.push((h.r??1)+((m.r??1)-(h.r??1))*M),l.push(y[0],y[1],y[2])}}return c.push(o.length-1),{X:o,Y:e,Z:t,R:n,C:l,wpI:c}}class vt{constructor(a){this.n=0,this.data=new Float32Array(a*Et)}reset(){this.n=0}v(a,o,e,t,n,l,c,r,i,f,h){if((this.n+1)*Et>this.data.length){const u=new Float32Array(this.data.length*2);u.set(this.data),this.data=u}const m=this.data;let d=this.n*Et;m[d++]=a,m[d++]=o,m[d++]=e,m[d++]=t,m[d++]=n,m[d++]=l,m[d++]=c,m[d++]=r,m[d++]=i,m[d++]=f,m[d]=h,this.n++}line(a,o,e,t,n,l,c){if(e<2)return;let r=0;const i=n.length>3;for(let f=0;f<e;f++){const h=Math.max(0,f-1),m=Math.min(e-1,f+1);let d=a[m]-a[h],u=o[m]-o[h];const g=Math.hypot(d,u)||1;d/=g,u/=g,f>0&&(r+=Math.hypot(a[f]-a[f-1],o[f]-o[f-1])),c&&(c[f]=r);const p=typeof t=="number"?t:t[f],A=typeof l=="number"?l:l[f],b=i?n[f*3]:n[0],z=i?n[f*3+1]:n[1],_=i?n[f*3+2]:n[2];if(f===0&&this.n>0){const N=this.data,y=(this.n-1)*Et;this.v(N[y],N[y+1],N[y+2],N[y+3],N[y+4],N[y+5],N[y+6],N[y+7],N[y+8],N[y+9],N[y+10]),this.v(a[f],o[f],A,-u,d,-1,r,p,b,z,_)}this.v(a[f],o[f],A,-u,d,-1,r,p,b,z,_),this.v(a[f],o[f],A,-u,d,1,r,p,b,z,_)}}}function oo(s,a,o,e=5){const t=Oo(a,e),n=t.X.length,l=Float32Array.from(t.X),c=Float32Array.from(t.Y),r=new Float32Array(n),i=new Float32Array(n),f=t.R.map(u=>u*o),h=new Float32Array(n);for(let u=1;u<n;u++)h[u]=h[u-1]+Math.hypot(l[u]-l[u-1],c[u]-c[u-1]);a.forEach((u,g)=>{if(!u.knot)return;const p=h[t.wpI[g]],A=f[t.wpI[g]];for(let b=0;b<n;b++)f[b]*=1+.2*Math.exp(-(((h[b]-p)/(A*1.1))**2))});const m=new vt(n*2+4);m.line(l,c,n,f,t.C,t.Z,r);let d=-1e9;for(let u=0;u<n;u++)d=Math.max(d,c[u]),i[u]=d;return{name:s,data:m.data,count:m.n,n,len:r[n-1],X:l,Y:c,S:r,M:i,rev:0,wpS:t.wpI.map(u=>r[u])}}function Wt(s,a){let o=0,e=s.n-1;if(s.M[e]<=a)return s.len;for(;o<e;){const t=o+e>>1;s.M[t]>a?e=t:o=t+1}return s.S[o]}function po(s,a){let o=0,e=s.n-1;for(;o<e;){const h=o+e>>1;s.S[h]>=a?e=h:o=h+1}const t=j(o,1,s.n-1),n=j((a-s.S[t-1])/Math.max(.001,s.S[t]-s.S[t-1]),0,1),l=Math.max(0,t-3),c=Math.min(s.n-1,t+1);let r=s.X[c]-s.X[l],i=s.Y[c]-s.Y[l];const f=Math.hypot(r,i)||1;return r/=f,i/=f,{x:s.X[t-1]+(s.X[t]-s.X[t-1])*n,y:s.Y[t-1]+(s.Y[t]-s.Y[t-1])*n,tx:r,ty:i}}let C=null,rt=null;try{C=new ro(P("gl-back")),rt=new ro(P("gl-front")),document.documentElement.classList.add("gl")}catch{C=rt=null}(function(){const a=document.createElement("canvas");a.width=a.height=220;const o=a.getContext("2d");if(!o)return;const e=o.createImageData(220,220);for(let t=0;t<220;t++)for(let n=0;n<220;n++){const l=ot(n*3.1)*.5+ot(n*.37+t*91.7)*.5,c=ot(t*5.3+2)*.5+ot(t*.41+n*57.3)*.5,r=255-(l*.5+c*.5)*34-ot(n*13.1+t*71.7)*14,i=(t*220+n)*4;e.data[i]=r,e.data[i+1]=r-2,e.data[i+2]=r-6,e.data[i+3]=255}o.putImageData(e,0,0),P("grain").style.backgroundImage=`url(${a.toDataURL()})`})();let S=0,v=0,V=!1,q=6,Z=30,B,Y,G,Xt=0,vo=0,R={cx:0,cy:0,R:0},E,at={x:0,y:0},lt={x:0,y:0},O,nt=0,wo=12,$t=0,Lt,dt=[],pt=[],go=[],no=!1,xt=I?1:0,bo=0;const $=1e3,ut=new Float32Array($),jt=new Float32Array($),Mo=new Float32Array($).fill(.5),Tt=new Float32Array($*3),Ao=new Float32Array($);for(let s=0;s<$;s++){const a=ot(s*1.37),o=ot(s*7.91+3),e=.55+.6*a,t=o>.9?1:0;Tt[s*3]=(t?.98:.86)*e,Tt[s*3+1]=(t?.78:.25+.1*o)*e,Tt[s*3+2]=(t?.6:.15+.08*o)*e,Ao[s]=.5+.35*ot(s*3.3+1)}const Do=new vt($*30),Yo=new vt(4e3),_o=new vt(540),co=new vt(40);function Vo(s){const a=parseInt(s.slice(1),16);return[a>>16&255,a>>8&255,a&255]}function Ro(){S=document.documentElement.clientWidth,v=window.innerHeight,V=S<=760,q=j(S*.0046,3.3,6.8),Z=Math.max(V?9:16,S*.022);const s=Math.min(window.devicePixelRatio||1,2);C?.resize(S,v,s),rt?.resize(S,v,s),dt=Array.from(document.querySelectorAll("[data-bg]")).map(M=>{const D=X(M);return{top:D.y,bottom:D.b,rgb:Vo(M.dataset.bg)}});const a=M=>X(P(`s${M}`)),o=P("hbig"),e=Array.from(o.querySelectorAll("i")).map(M=>X(M)),t=parseFloat(getComputedStyle(o).fontSize),n=X(P("hbl")).y,l=t*.47,c=n-l*.5,r=M=>(e[M].r+e[M+1].x)/2,i=X(P("heroEnd")),f=X(document.querySelector(".h-ver")),h=V?1.25:1.5;vo=a(0).b;const m=a(1),d=a(2),u=a(3),g=a(4),p=a(5),A=a(6),b=X(P("ball"));R={cx:b.cx,cy:b.cy,R:b.w/2};const z=[{x:-80,y:c-t*.3,z:-1,r:h},{x:e[0].x-t*.06,y:c-l*.34,z:-1,r:h},{x:e[0].cx,y:c+l*.16,z:-1,r:h},{x:r(0),y:c+l*.02,z:0,r:h},{x:e[1].cx,y:c-l*.3,z:1,r:h},{x:r(1),y:c-l*.04,z:0,r:h},{x:e[2].cx,y:c+l*.22,z:-1,r:h},{x:r(2),y:c-l*.02,z:0,r:h},{x:e[3].cx,y:c-l*.34,z:1,r:h},{x:r(3),y:c-l*.06,z:0,r:h},{x:e[4].cx,y:c+l*.2,z:-1,r:h},{x:e[4].r+t*.03,y:c-l*.3,z:-1,r:h},{x:f.cx,y:f.y-t*.1,z:-1,r:h},{x:Math.min(S-Z,f.r+t*.1),y:f.cy+t*.02,z:-1,r:h}];if(V){const M={x:S*.5,y:(f.b+i.y)/2-v*.01},D=Math.min(S*.2,(i.y-f.b)*.3);for(const H of[-50,30,110,190,270,345]){const F=H*Math.PI/180;z.push({x:M.x+Math.cos(F)*D*1.25,y:M.y+Math.sin(F)*D,z:-1,r:h})}z.push({x:i.x+16,y:i.y-v*.09,z:-1,r:h})}else z.push({x:Math.min(S-Z,i.x+S*.05),y:i.y-v*.22,z:-1,r:h});const _={x:i.x,y:i.y,z:-1};z.push(_),V?z.push({x:S-Z,y:m.y+v*.12},{x:S-Z,y:R.cy-R.R*1},{x:S-Z-26,y:R.cy-R.R*.5}):z.push({x:R.cx-R.R*.3,y:R.cy-R.R*1.06},{x:R.cx-R.R*.12,y:R.cy-R.R*.55}),B=oo("A",z,q),Xt=B.wpS[z.indexOf(_)],E=X(P("loom"));const N=(V?.15:.17)*v;at={x:E.cx,y:E.y-N},lt={x:E.cx,y:E.b+N};const y=V?S-Z:S*.74;Y=oo("A2",[{x:R.cx-R.R*.42,y:R.cy+R.R*.5},{x:R.cx-R.R*.8,y:R.cy+R.R*1},{x:V?S*.5:S*.55,y:m.b-v*.03},{x:y,y:d.y+v*.04},{x:V?y:S*.8,y:at.y-v*.24},{x:V?S*.8:S*.66,y:at.y-v*.1},{x:at.x+(V?20:40),y:at.y-v*.035},{x:at.x,y:at.y}],q);const L=X(P("track")),T=L.y+23,K=X(P("route")),x=(M,D)=>({x:K.x+M*K.w,y:K.y+D*K.h}),k=j(S*.021,11,30)/q;O=X(P("cloth")),nt=O.y+O.h*.55,wo=q*2.05;const U=O.x-Math.max(13,q*2.6),w=S-Z,mt=[{x:lt.x,y:lt.y},{x:lt.x-(V?10:40),y:lt.y+v*.06},{x:S*.24,y:u.y+v*.06},{x:Z,y:u.y+v*.15},{x:Z,y:T-90},{x:Z+3,y:T-30},{x:L.x+6,y:T},{x:L.x+L.w*.33,y:T},{x:L.x+L.w*.66,y:T},{x:L.r+4,y:T},V?{x:w,y:T+44}:{x:L.r+70,y:T+60},V?{x:w,y:u.b-v*.05}:{x:S*.62,y:u.b-v*.05},{x:w,y:g.y+v*.12},{x:w,y:g.b-v*.16},{x:w,y:p.y+v*.05},{...x(.95,-.04),y:Math.max(x(0,-.04).y,p.y+v*.12)},{...x(.82,.09),r:k},{...x(.67,.17),r:k,c:zt,knot:!0},{...x(.43,.24),r:k,c:zt},{...x(.22,.33),r:k,c:zt},{...x(.12,.44),r:k,knot:!0},{...x(.14,.54),r:k},{...x(.3,.63),r:k,c:Yt,knot:!0},{...x(.55,.7),r:k,c:Yt},{...x(.8,.78),r:k,knot:!0},{...x(.9,.88),r:k},{...x(.93,1),r:1},...V?[{x:S*.55,y:A.y+v*.02},{x:Z,y:A.y+v*.1},{x:Z,y:O.y-v*.06}]:[{x:S*.78,y:A.y+v*.07},{x:U+90,y:O.y-v*.09}],{x:U,y:O.y+v*.05},{x:U,y:nt-80},{x:U+8,y:nt-22},{x:O.x+26,y:nt-3},{x:O.x+O.w*.3,y:nt-3},{x:O.x+O.w*.56,y:nt-3}];G=oo("B",mt,q);const wt=mt.map((M,D)=>M.knot?D:-1).filter(M=>M>=0);go=wt.map(M=>G.wpS[M]+k*q*1.2);const yt=[[J,zt],[zt,J],[J,Yt],[Yt,J]];wt.forEach((M,D)=>{const H=new vt(200),F=po(G,G.wpS[M]),W=k*q,Ct=-F.ty,Dt=F.tx;for(let ct=0;ct<2;ct++){const gt=ct?1:-1,Nt=[],bt=[],Mt=[],At=9;for(let Rt=0;Rt<At;Rt++){const ht=Rt/(At-1),St=W*(.5+1.9*Math.sin(ht*1.35)),tt=W*(.2+2.6*ht*ht)*-gt;Nt.push(F.x+Ct*St*gt+F.tx*tt),bt.push(F.y+Dt*St*gt+F.ty*tt),Mt.push(W*.4*(1-.55*ht*ht))}H.line(Nt,bt,At,Mt,yt[D][ct],-1)}for(let ct=-2;ct<=2;ct++){const gt=ct*W*.36,Nt=W*.34,bt=yt[D][ct<0?1:0],Mt=7,At=[],Rt=[],ht=[];for(let St=0;St<Mt;St++){const tt=St/(Mt-1)*2-1;At.push(F.x+F.tx*(gt+Nt*tt)+Ct*W*1.36*tt),Rt.push(F.y+F.ty*(gt+Nt*tt)+Dt*W*1.36*tt),ht.push(W*.2*(1-.5*tt*tt*tt*tt))}H.line(At,Rt,Mt,ht,[bt[0]*1.08,bt[1]*1.08,bt[2]*1.08],-1)}C?.set(`knot${D}`,H.data,H.n)});const Q=X(P("tokMark")),ft=new vt(8);ft.line([Q.x,Q.x+Q.w*.5,Q.r],[Q.cy,Q.cy-.6,Q.cy],3,[1.2,2.2,1.2],J,-1);const Qt=V?3.4:5;pt=[],document.querySelectorAll("#cmp .grp").forEach(M=>{const D=parseFloat(M.dataset.max);M.querySelectorAll(".row").forEach(H=>{const F=X(H.querySelector(".trk")),W=parseFloat(H.dataset.v)/D,Ct=H.querySelector(".val");Ct.style.setProperty("--f",String(W));const Dt=H.classList.contains("me")?J:H.classList.contains("gm")?Fo:Io;pt.push({x:F.x,y:F.cy,len:F.w*W,col:Dt,p:I?1:0,hit:-10,val:Ct})})}),So=Qt,Lt=X(P("score")),Lo(Number(P("effort").value),!0),C&&(C.set("A",B.data,B.count),C.set("A2",Y.data,Y.count),C.set("B",G.data,G.count),C.set("tok",ft.data,ft.n)),rt?.set("A",B.data,B.count);const Ot=window.scrollY+v*.7;for(const M of[B,Y,G])M.rev=I?M.len:Wt(M,Ot);I||(B.rev=Math.max(B.rev,Xt*xt)),$t=I?nt:Math.min(nt,Ot),no=!0}let So=3.6,kt=[],It=[],it=-1,Eo=-1,Ft=1.8,Gt=!1,Kt=!1;function Lo(s,a){const o=qo[s],e=Lt,t=String(o.idx),n=Math.min(e.h*.98,e.w/1.32),l=P("scoreNum");l.textContent=t,l.style.fontSize=`${n}px`;const c=.5,r=document.createElement("canvas");r.width=Math.max(2,Math.round(e.w*c)),r.height=Math.max(2,Math.round(e.h*c));const i=r.getContext("2d",{willReadFrequently:!0}),f=[];if(i){i.font=`900 ${n*c}px "Fraunces"`,i.textAlign="center";const m=i.measureText(t);i.fillStyle="#000",i.fillText(t,r.width/2,(r.height+m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2);const d=i.getImageData(0,0,r.width,r.height).data,u=(x,k)=>{const U=Math.round(x*c),w=Math.round(k*c);return U>=0&&w>=0&&U<r.width&&w<r.height&&d[(w*r.width+U)*4+3]>110},g=n/420,p=Math.max(2.4,o.gap*Math.max(g,.55));Ft=j(1.75*Math.max(g,.6),1.05,2.3);const A=-.36,b=Math.cos(A),z=Math.sin(A),_=-z,N=b,y=Math.hypot(e.w,e.h)/2,L=e.w/2,T=e.h/2;let K=0;for(let x=-y;x<=y;x+=p,K++){let k=NaN;const U=[];for(let w=-y;w<=y+2;w+=1.5){const mt=L+b*w+_*x,wt=T+z*w+N*x,yt=u(mt,wt);if(yt&&Number.isNaN(k)&&(k=w),!yt&&!Number.isNaN(k)){if(w-k>5){const Q=(ot(K*9.1+w)-.5)*2.4,ft=(ot(K*4.3+w*1.7)-.5)*2.4;U.push({x0:e.x+L+b*(k+Q)+_*x,y0:e.y+T+z*(k+Q)+N*x,x1:e.x+L+b*(w+ft)+_*x,y1:e.y+T+z*(w+ft)+N*x,br:.86+.28*ot(K*3.7+w*.13)})}k=NaN}}K%2&&(U.reverse(),U.forEach(w=>{[w.x0,w.x1]=[w.x1,w.x0],[w.y0,w.y1]=[w.y1,w.y0]})),f.push(...U)}}const h=performance.now()/1e3;a||I?(It=[],kt=f,it=Kt||I?-100:-1):(It=kt,Eo=h,kt=f,it=h+.16),Gt=!1,P("rIdx").textContent=String(o.idx),P("rCost").textContent=o.cost,P("rTime").textContent=o.time,document.querySelectorAll(".stops li").forEach((m,d)=>m.classList.toggle("on",d===s)),P("track").style.setProperty("--p",String(s/4))}function Uo(s){if(Gt)return;const a=Yo;a.reset();let o=!1;const e=(t,n)=>{if(n<=.02)return;const l=t.x0+(t.x1-t.x0)*n,c=t.y0+(t.y1-t.y0)*n,r=Math.hypot(l-t.x0,c-t.y0);if(r<2)return;const i=(l-t.x0)/r*Math.min(2.2,r*.3),f=(c-t.y0)/r*Math.min(2.2,r*.3),h=[J[0]*t.br,J[1]*t.br,J[2]*t.br];a.line([t.x0,t.x0+i,l-i,l],[t.y0,t.y0+f,c-f,c],4,[Ft*.35,Ft,Ft,Ft*.35],h,-1)};if(It.length){const t=1-(s-Eo)/.22;if(t>0){o=!0;for(const n of It)e(n,t)}else It=[]}if(it>-50&&it>=0){const t=kt.length,n=1,l=.16,c=s-it;c<n+l&&(o=!0);for(let r=0;r<t;r++)e(kt[r],j((c-r/t*n)/l,0,1))}else if(it<=-50)for(const t of kt)e(t,1);C?.set("stitch",a.data,a.n,!0),!o&&(it<=-50||it>=0)&&(Gt=!0)}const io=P("effort"),Po=document.createElement("span");Po.className="ping";P("track").appendChild(Po);io.addEventListener("input",()=>{P("track").classList.add("used"),no&&(Kt=!0,Lo(Number(io.value),!1))});let Pt=NaN,eo=0,Bt=0,lo=!1;const Zt=P("loom");function ao(s,a,o,e){if(!E)return;const t=E.w/($-1);let n=Math.floor((Math.min(s,a)-E.x)/t)-2,l=Math.ceil((Math.max(s,a)-E.x)/t)+2;n=j(n,0,$-1),l=j(l,0,$-1);const c=j((o-E.y)/E.h,.12,.88);for(let r=n;r<=l;r++)jt[r]+=e,Mo[r]=c}Zt.addEventListener("pointermove",s=>{const a=performance.now(),o=s.pageX,e=s.pageY;if(Bt=e,!Number.isNaN(Pt)&&a-eo<120){const t=o-Pt;Math.abs(t)>.5&&(ao(Pt,o,e,j(t*26,-900,900)),lo||(lo=!0,P("loomHint").classList.add("off")))}Pt=o,eo=a});Zt.addEventListener("pointerdown",s=>{ao(s.pageX-14,s.pageX+14,s.pageY,520),Pt=s.pageX,eo=performance.now(),Bt=s.pageY});Zt.addEventListener("pointerleave",()=>{Pt=NaN});let _t=-1,fo=!1,st=0,Ht=0,ho="";function Wo(s,a){const o=E.w/($-1),e=Math.max(1,Math.ceil(a/.006)),t=a/e;for(let d=0;d<e;d++){for(let u=0;u<$;u++){const g=u>0?ut[u-1]:0,p=u<$-1?ut[u+1]:0;jt[u]+=(-760*ut[u]-2.6*jt[u]+520*(g+p-2*ut[u]))*t}for(let u=0;u<$;u++)ut[u]=j(ut[u]+jt[u]*t,-70,70)}const n=I||Y.rev>Y.len-6?1:0;I?st=1:(Ht+=(46*(n-st)-8.4*Ht)*a,st=Math.max(0,st+Ht*a));const l=st.toFixed(3);l!==ho&&(ho=l,Zt.style.setProperty("--s",l));const c=Do;c.reset();const r=9,i=new Float32Array(r+4),f=new Float32Array(r+4),h=new Float32Array((r+4)*3),m=new Float32Array(r+4);for(let d=0;d<$;d++){const u=E.cx+(E.x+d*o-E.cx)*st,g=I?0:Math.sin(s*1.1+d*.021)*.7+Math.sin(s*.53+d*.13)*.4,p=ut[d]+g,A=Mo[d],b=Math.min(1,Math.abs(ut[d])/16),z=Tt[d*3]+b*.5,_=Tt[d*3+1]+b*.5,N=Tt[d*3+2]+b*.36;i[0]=at.x,f[0]=at.y,i[1]=u,f[1]=E.y;for(let y=0;y<r;y++){const L=(y+1)/(r+1),T=L<A?L/A:(1-L)/(1-A);i[2+y]=u+p*Math.sin(T*1.5708),f[2+y]=E.y+E.h*L}i[r+2]=u,f[r+2]=E.b,i[r+3]=lt.x,f[r+3]=lt.y;for(let y=0;y<r+4;y++){const L=y<2?0:y>r+1?1:(y-1)/(r+1),T=y===0||y===r+3?.42:.74+.36*Math.sin(L*Math.PI);h[y*3]=z*T,h[y*3+1]=_*T,h[y*3+2]=N*T,m[y]=Ao[d]}c.line(i,f,r+4,m,h,-1)}C.set("loom",c.data,c.n,!0)}function $o(s,a,o){const e=_o;e.reset();const t=22,n=new Float32Array(t),l=new Float32Array(t);for(const c of pt){const r=I||o>c.y+20?1:0,i=c.p;if(c.p+=(r-c.p)*(1-Math.exp(-a*4.2)),i<.9&&c.p>=.9&&(c.hit=s),c.val.classList.toggle("on",c.p>.93),c.p<.004)continue;const f=c.len*c.p,h=I?0:5*Math.exp(-3.2*(s-c.hit))*Math.sin((s-c.hit)*44);for(let m=0;m<t;m++){const d=m/(t-1);n[m]=c.x+f*d,l[m]=c.y+h*Math.sin(d*Math.PI)}e.line(n,l,t,So,c.col,-1)}C.set("bars",e.data,e.n,!0)}let Vt=Math.PI/2,qt=1;function jo(s,a,o){let e=null;if(G.rev>2?e=G:Y.rev>2&&Y.rev<Y.len-2?e=Y:B.rev<B.len-2&&Y.rev<=2&&(e=B),qt+=((e?1:0)-qt)*(1-Math.exp(-a*10)),!e||qt<.02){rt.set("needle",co.data,0,!0);return}const n=po(e,Math.max(1,e.rev));let l=Math.atan2(n.ty,n.tx);e===B&&o<4&&!I&&(l+=Math.sin(s*1.4)*.07);let c=l-Vt;for(;c>Math.PI;)c-=Math.PI*2;for(;c<-Math.PI;)c+=Math.PI*2;Vt+=I?c:c*(1-Math.exp(-a*9));const r=j(S*.085,74,132),i=Math.max(2.1,q*.5),f=Math.cos(Vt),h=Math.sin(Vt),m=12,d=[],u=[],g=[];for(let A=0;A<=m;A++){const b=A/m;d.push(n.x+f*r*(b-.04)),u.push(n.y+h*r*(b-.04)),g.push(b<.12?i*(.7+4.6*b)*.86:i*Math.pow(1-(b-.12)/.88,.62)*1.08+.1)}const p=co;p.reset(),p.line(d,u,m+1,g,[1,1,1],1),rt.set("needle",p.data,p.n,!0)}let uo=0,mo="";const et=new Float32Array(9);function To(s){if(requestAnimationFrame(To),!no)return;const a=s/1e3,o=Math.min(.05,Math.max(.001,a-uo));uo=a;const e=window.scrollY,t=e+v*.7,n=e+v*.5;let l=dt[0].rgb;for(let i=0;i<dt.length;i++){const f=dt[i];if(n>=f.top&&(n<f.bottom||i===dt.length-1)){l=f.rgb;const h=v*.17,m=(d,u,g)=>[d[0]+(u[0]-d[0])*g,d[1]+(u[1]-d[1])*g,d[2]+(u[2]-d[2])*g];i>0&&n-f.top<h?l=m(dt[i-1].rgb,f.rgb,Ut(.5+(n-f.top)/(2*h))):i<dt.length-1&&f.bottom-n<h&&(l=m(f.rgb,dt[i+1].rgb,Ut(.5-(f.bottom-n)/(2*h))));break}}const c=`rgb(${l[0]|0},${l[1]|0},${l[2]|0})`;if(c!==mo&&(mo=c,document.body.style.backgroundColor=c),!C||!rt)return;if(!I){xt<1&&(xt=j((a-bo)/1.9,0,1));const i=xt<.5?4*xt**3:1-Math.pow(-2*xt+2,3)/2,f=1-Math.exp(-o*6.5),h=(g,p)=>Math.abs(p-g)>v*3?p:g+(p-g)*f,m=Math.max(Xt*i,Wt(B,t));B.rev=xt<1&&m<=Xt?m:h(B.rev,m);const d=B.rev>B.len-4?Wt(Y,t):0;Y.rev=h(Y.rev,d);const u=t>lt.y?Wt(G,t):0;G.rev=h(G.rev,u),u>0&&st<.5&&Y.rev>Y.len-6&&(st=1,Ht=0),$t+=(Math.min(nt,t)-$t)*(1-Math.exp(-o*5))}const r=(i,f)=>f>e-80&&i<e+v+80;if(C.begin(e),C.draw("A",{reveal:B.rev,layer:-1,shadow:.2,shadowOff:[q*.7,q*1.2]}),C.draw("A2",{reveal:Y.rev,shadow:.2,shadowOff:[q*.7,q*1.2]}),C.draw("tok",{shadow:.2,shadowOff:[1,2]}),r(R.cy-R.R*1.5,R.cy+R.R*1.5)){const i=I?.6:e*.0011+.6,f=.42,h=Math.cos(i),m=Math.sin(i),d=Math.cos(f),u=Math.sin(f);et[0]=h,et[1]=0,et[2]=-m,et[3]=m*u,et[4]=d,et[5]=h*u,et[6]=m*d,et[7]=-u,et[8]=h*d,C.drawBall(R.cx,R.cy,R.R,et,J,R.R/(q*2.1))}if(r(at.y,lt.y)){if(!fo&&!I&&st>.97&&e+v*.62>E.y&&(fo=!0,_t=a),_t>=0){const i=(a-_t)/1.5;if(i<1){const f=E.x+E.w*(.18+.64*Ut(i));ao(f-6,f+6,E.y+E.h*(.3+.4*i),120)}else _t=-1}Wo(a,o),C.draw("loom",{mode:3,alpha:Math.min(1,st*4),sheenY:Bt>E.y&&Bt<E.b?Bt:E.y+E.h*(.5+.3*Math.sin(a*.5))})}r(Lt.y,Lt.b)&&(!Kt&&(I||t>Lt.y+Lt.h*.45)&&(Kt=!0,it=I?-100:a,Gt=!1),Uo(a),C.draw("stitch",{shadow:.18,shadowOff:[1.2,2.2],shadowInfl:1.5})),pt.length&&r(pt[0].y-40,pt[pt.length-1].y+40)&&($o(a,o,t),C.draw("bars",{shadow:.2,shadowOff:[2,4]})),r(O.y,O.b)&&C.drawCloth([O.x,O.y,O.w,O.h],nt,$t,wo,I?0:a,J,Bo),C.draw("B",{reveal:G.rev,shadow:.22,shadowOff:[q*.8,q*1.4]}),go.forEach((i,f)=>{const h=I?1:j((G.rev-i)/40,0,1);h>0&&C.draw(`knot${f}`,{alpha:h,shadow:.2*h,shadowOff:[3,6]})}),rt.begin(e),e<vo&&rt.draw("A",{reveal:B.rev,layer:1,shadow:.34,shadowOff:[q*.9,q*1.5]}),jo(a,o,e),rt.draw("needle",{mode:2,alpha:qt,shadow:.26*qt,shadowOff:[5,9],shadowInfl:1.5})}let yo=0;function xo(){clearTimeout(yo),yo=window.setTimeout(Ro,120)}async function Ho(){try{await Promise.all([document.fonts.load('560 100px "Fraunces"'),document.fonts.load('900 100px "Fraunces"'),document.fonts.load('500 12px "Plex Mono"')]),await document.fonts.ready}catch{}Ro(),bo=performance.now()/1e3,document.documentElement.classList.add("ready"),window.addEventListener("resize",xo),new ResizeObserver(xo).observe(P("page")),requestAnimationFrame(To)}Ho();
