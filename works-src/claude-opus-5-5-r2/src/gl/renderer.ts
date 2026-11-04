import { FULL_VS, GRID_VS, ORB_FS, POINT_FS, SPARK_VS } from './shaders'

export type Frame = {
  w: number
  h: number
  scale: number
  time: number
  orb: [number, number, number]
  temp: number
  crust: number
  glow: number
  bg: [number, number, number]
  flash: number
  dim: number
  look: [number, number]
  still: number
  exposure: number
  vis: number
  orb2: [number, number, number, number]
  pour: [number, number, number]
  sparks: number
  sparkFade: number
  bound: number
  attract: [number, number, number]
  grid: number
  cell: number
  anchor: [number, number]
  target: [number, number]
  out: number
  targetA: number
  clear: [number, number, number, number]
  glyph: [number, number, number, number]
  glyphA: number
  ring: [number, number, number, number]
  bar: Float32Array
  barV: Float32Array
  barN: number
  barA: number
  bead: Float32Array
  beadV: Float32Array
  beadN: number
  beadA: number
  beadBox: [number, number, number, number]
  hub: [number, number]
  setA: [number, number]
  split: [number, number, number, number]
}

type Program = { prog: WebGLProgram; loc: Map<string, WebGLUniformLocation | null> }

const MAX_SPARKS = 1600
const GRID = 1000

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s)
    gl.deleteShader(s)
    throw new Error(log ?? 'shader compile failed')
  }
  return s
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string): Program {
  const prog = gl.createProgram()!
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vs))
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) ?? 'program link failed')
  }
  return { prog, loc: new Map() }
}

export class Renderer {
  private gl: WebGL2RenderingContext
  private orb: Program
  private spark: Program
  private grid: Program
  private vao: WebGLVertexArrayObject
  readonly maxPoint: number

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) throw new Error('WebGL2 unavailable')
    this.gl = gl
    this.orb = link(gl, FULL_VS, ORB_FS)
    this.spark = link(gl, SPARK_VS, POINT_FS)
    this.grid = link(gl, GRID_VS, POINT_FS)
    this.vao = gl.createVertexArray()!
    const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array
    this.maxPoint = range ? range[1] : 64
    this.glyphTex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }

  private glyphTex: WebGLTexture

  // Rasterise one character: R holds the crisp mask, G a blurred copy used
  // as a height field for lighting and as the glow falloff.
  setGlyph(ch: string, family: string) {
    const S = 512
    const draw = (blur: number) => {
      const c = document.createElement('canvas')
      c.width = S
      c.height = S
      const x = c.getContext('2d')!
      x.fillStyle = '#000'
      x.fillRect(0, 0, S, S)
      if (blur) x.filter = `blur(${blur}px)`
      x.fillStyle = '#fff'
      x.font = `900 ${Math.round(S * 0.86)}px ${family}`
      x.textAlign = 'center'
      x.textBaseline = 'middle'
      x.fillText(ch, S / 2, S * 0.53)
      return x.getImageData(0, 0, S, S).data
    }
    const a = draw(0)
    const b = draw(9)
    const out = new Uint8Array(S * S * 4)
    for (let i = 0; i < S * S; i++) {
      out[i * 4] = a[i * 4]
      out[i * 4 + 1] = b[i * 4]
      out[i * 4 + 3] = 255
    }
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, S, S, 0, gl.RGBA, gl.UNSIGNED_BYTE, out)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  }

  private u(p: Program, name: string) {
    if (!p.loc.has(name)) p.loc.set(name, this.gl.getUniformLocation(p.prog, name))
    return p.loc.get(name) ?? null
  }

  private f(p: Program, name: string, ...v: number[]) {
    const gl = this.gl
    const l = this.u(p, name)
    if (!l) return
    if (v.length === 1) gl.uniform1f(l, v[0])
    else if (v.length === 2) gl.uniform2f(l, v[0], v[1])
    else if (v.length === 3) gl.uniform3f(l, v[0], v[1], v[2])
    else gl.uniform4f(l, v[0], v[1], v[2], v[3])
  }

  private v4(p: Program, name: string, v: Float32Array) {
    const l = this.u(p, `${name}[0]`) ?? this.u(p, name)
    if (l) this.gl.uniform4fv(l, v)
  }

  draw(fr: Frame) {
    const gl = this.gl
    gl.viewport(0, 0, fr.w, fr.h)
    gl.bindVertexArray(this.vao)
    gl.disable(gl.BLEND)

    const o = this.orb
    gl.useProgram(o.prog)
    this.f(o, 'uRes', fr.w, fr.h)
    this.f(o, 'uTime', fr.time)
    this.f(o, 'uOrb', ...fr.orb)
    this.f(o, 'uTemp', fr.temp)
    this.f(o, 'uCrust', fr.crust)
    this.f(o, 'uGlow', fr.glow)
    this.f(o, 'uBg', ...fr.bg)
    this.f(o, 'uFlash', fr.flash)
    this.f(o, 'uDim', fr.dim)
    this.f(o, 'uLook', ...fr.look)
    this.f(o, 'uStill', fr.still)
    this.f(o, 'uExposure', fr.exposure)
    this.f(o, 'uDetail', 1)
    this.f(o, 'uOrb2', ...fr.orb2)
    this.f(o, 'uPour', ...fr.pour)
    this.f(o, 'uVis', fr.vis)
    this.f(o, 'uGlyph', ...fr.glyph)
    this.f(o, 'uGlyphA', fr.glyphA)
    this.f(o, 'uRing', ...fr.ring)
    this.f(o, 'uDpr', fr.scale)
    this.v4(o, 'uBar', fr.bar)
    this.v4(o, 'uBarV', fr.barV)
    this.f(o, 'uBarN', fr.barN)
    this.f(o, 'uBarA', fr.barA)
    this.v4(o, 'uBead', fr.bead)
    this.v4(o, 'uBeadV', fr.beadV)
    this.f(o, 'uBeadN', fr.beadN)
    this.f(o, 'uBeadA', fr.beadA)
    this.f(o, 'uBeadBox', ...fr.beadBox)
    this.f(o, 'uHub', ...fr.hub)
    this.f(o, 'uSetA', ...fr.setA)
    this.f(o, 'uSplit', ...fr.split)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.glyphTex)
    const tl = this.u(o, 'uGlyphTex')
    if (tl) gl.uniform1i(tl, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)

    if (fr.grid > 0.002) {
      const g = this.grid
      const x0 = Math.max(0, Math.floor(fr.target[0] + 0.5 - fr.anchor[0] / fr.cell) - 1)
      const x1 = Math.min(GRID - 1, Math.ceil(fr.target[0] + 0.5 + (fr.w - fr.anchor[0]) / fr.cell) + 1)
      const y0 = Math.max(0, Math.floor(fr.target[1] + 0.5 - fr.anchor[1] / fr.cell) - 1)
      const y1 = Math.min(GRID - 1, Math.ceil(fr.target[1] + 0.5 + (fr.h - fr.anchor[1]) / fr.cell) + 1)
      const cols = x1 - x0 + 1
      const rows = y1 - y0 + 1
      if (cols > 0 && rows > 0) {
        gl.useProgram(g.prog)
        this.f(g, 'uRes', fr.w, fr.h)
        this.f(g, 'uAnchor', ...fr.anchor)
        this.f(g, 'uTarget', ...fr.target)
        this.f(g, 'uCell', fr.cell)
        this.f(g, 'uTime', fr.time)
        this.f(g, 'uAlpha', fr.grid)
        this.f(g, 'uScale', fr.scale)
        this.f(g, 'uStart', x0, y0)
        this.f(g, 'uCols', cols)
        this.f(g, 'uMaxSize', this.maxPoint)
        this.f(g, 'uOut', fr.out)
        this.f(g, 'uTemp', fr.temp)
        this.f(g, 'uTargetA', fr.targetA)
        this.f(g, 'uClear', ...fr.clear)
        gl.drawArrays(gl.POINTS, 0, cols * rows)
      }
    }

    if (fr.sparks > 1 && fr.sparkFade > 0.002) {
      const s = this.spark
      gl.useProgram(s.prog)
      this.f(s, 'uRes', fr.w, fr.h)
      this.f(s, 'uOrb', ...fr.orb)
      this.f(s, 'uTime', fr.time)
      this.f(s, 'uTemp', fr.temp)
      this.f(s, 'uCount', Math.min(MAX_SPARKS, fr.sparks))
      this.f(s, 'uScale', fr.scale)
      this.f(s, 'uBound', fr.bound)
      this.f(s, 'uFade', fr.sparkFade * fr.vis)
      this.f(s, 'uAttract', ...fr.attract)
      this.f(s, 'uSplit', ...fr.split)
      gl.drawArrays(gl.POINTS, 0, MAX_SPARKS)
    }
  }
}
