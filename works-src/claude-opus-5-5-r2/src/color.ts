export type RGB = [number, number, number]

// Same Planckian-locus approximation as the shader, so DOM accents match the
// light the canvas emits.
export function bbChroma(t: number): RGB {
  t = Math.min(12000, Math.max(800, t))
  const u = (0.860117757 + 1.54118254e-4 * t + 1.28641212e-7 * t * t) / (1 + 8.42420235e-4 * t + 7.08145163e-7 * t * t)
  const v = (0.317398726 + 4.22806245e-5 * t + 4.20481691e-8 * t * t) / (1 - 2.89741816e-5 * t + 1.61456053e-7 * t * t)
  const x = (3 * u) / (2 * u - 8 * v + 4)
  const y = (2 * v) / (2 * u - 8 * v + 4)
  const X = x / y
  const Z = (1 - x - y) / y
  const r = Math.max(0, 3.2404542 * X - 1.5371385 - 0.4985314 * Z)
  const g = Math.max(0, -0.969266 * X + 1.8760108 + 0.041556 * Z)
  const b = Math.max(0, 0.0556434 * X - 0.2040259 + 1.0572252 * Z)
  const m = Math.max(r, g, b, 1e-4)
  return [r / m, g / m, b / m]
}

export function bbCss(t: number, lift = 0.15): string {
  const c = bbChroma(t).map((v) => Math.round(255 * Math.pow(Math.min(1, v * (1 - lift) + lift), 1 / 2.2)))
  return `rgb(${c[0]} ${c[1]} ${c[2]})`
}
