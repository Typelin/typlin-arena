import { clamp, css, hex, mixRGB, smoothstep, type RGB } from './math'

interface Palette {
  bg: RGB
  fg: RGB
  soft: RGB
  accent: RGB
  line: RGB
}

/** 色票全部取自 logo：粉 #F0A8C0 / #F090A8，靛 #304878，蓝紫 #6078C0 / #9090C0 */
const DAY: Palette = {
  bg: hex('#fdf3f6'),
  fg: hex('#304878'),
  soft: hex('#5b6a9a'),
  accent: hex('#e0708f'),
  line: hex('#d9c4d4'),
}
const NIGHT: Palette = {
  bg: hex('#141a3a'),
  fg: hex('#f6e9f1'),
  soft: hex('#b3bde8'),
  accent: hex('#F0A8C0'),
  line: hex('#3a4476'),
}
const DAWN: Palette = {
  bg: hex('#fbe3ea'),
  fg: hex('#304878'),
  soft: hex('#56649a'),
  accent: hex('#d65c82'),
  line: hex('#ecc3d0'),
}
const PALETTES = [DAY, NIGHT, DAWN]

interface Key {
  id: string
  frac: number
  v: number
}

/** 从上到下的关键位置；dusk 那一整段是天色最快转变的地方，里面没有正文 */
const KEYS: Key[] = [
  { id: 'top', frac: 0.5, v: 0 },
  { id: 'bloom', frac: 0.75, v: 0 },
  { id: 'dusk', frac: 0.08, v: 0 },
  { id: 'dusk', frac: 0.92, v: 1 },
  { id: 'moon', frac: 0.85, v: 1 },
  { id: 'letter', frac: 0.2, v: 2 },
]

export interface Tone {
  night: number
  v: number
}

export function applyTone(root: HTMLElement): Tone {
  const mid = window.scrollY + window.innerHeight * 0.5
  const pts: { y: number; v: number }[] = []
  for (const k of KEYS) {
    const el = document.getElementById(k.id)
    if (!el) continue
    const r = el.getBoundingClientRect()
    pts.push({ y: r.top + window.scrollY + r.height * k.frac, v: k.v })
  }
  let v = 0
  if (pts.length) {
    if (mid <= pts[0].y) v = pts[0].v
    else if (mid >= pts[pts.length - 1].y) v = pts[pts.length - 1].v
    else {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        if (mid >= a.y && mid <= b.y) {
          v = a.v + (b.v - a.v) * ((mid - a.y) / Math.max(1, b.y - a.y))
          break
        }
      }
    }
  }
  const i = Math.min(1, Math.floor(clamp(v, 0, 1.999)))
  const t = clamp(v - i, 0, 1)
  const A = PALETTES[i]
  const B = PALETTES[i + 1]
  const fgT = smoothstep(0.38, 0.62, t)
  const set = (name: string, c: RGB) => root.style.setProperty(name, css(c))
  set('--bg', mixRGB(A.bg, B.bg, smoothstep(0, 1, t)))
  set('--fg', mixRGB(A.fg, B.fg, fgT))
  set('--soft', mixRGB(A.soft, B.soft, fgT))
  set('--accent', mixRGB(A.accent, B.accent, fgT))
  set('--line', mixRGB(A.line, B.line, smoothstep(0, 1, t)))
  const night = smoothstep(0.3, 1, v) * (1 - smoothstep(1.05, 1.8, v))
  return { night, v }
}
