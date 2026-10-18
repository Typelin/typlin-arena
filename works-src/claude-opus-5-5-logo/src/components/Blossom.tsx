/** One notched sakura petal pointing up from the origin, 10 units long. */
export const PETAL_D = 'M0 0 C-5.2 -2.6 -5.6 -8.6 -1.7 -10.4 L0 -8.7 L1.7 -10.4 C5.6 -8.6 5.2 -2.6 0 0 Z'

interface Props {
  x: number
  y: number
  r: number
  /** 0 = closed bud, 1 = fully open. */
  open: number
  rot?: number
  tone?: 'pink' | 'pale' | 'lilac'
}

const TONES = {
  pink: ['#fbd0dc', '#ef8fac'],
  pale: ['#fff0f4', '#f5b3c6'],
  lilac: ['#ece7f8', '#a9a1dc'],
}

/** A five-petal blossom; petals unfold with `open`. Uses the shared gradients in <BlossomDefs/>. */
export function Blossom({ x, y, r, open, rot = 0, tone = 'pink' }: Props) {
  const o = Math.max(0, Math.min(1, open))
  const s = (r / 10) * (0.25 + 0.75 * o)
  const spread = 0.35 + 0.65 * o
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - o) * -40}) scale(${s})`} opacity={o > 0 ? 1 : 0}>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={PETAL_D} fill={`url(#bl-${tone})`} transform={`rotate(${i * 72 * spread})`} />
      ))}
      <g opacity={o}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <g key={i}>
              <line x1={0} y1={0} x2={Math.cos(a) * 3.6} y2={Math.sin(a) * 3.6} stroke="#fff" strokeWidth={0.35} />
              <circle cx={Math.cos(a) * 3.8} cy={Math.sin(a) * 3.8} r={0.55} fill="#fff" />
            </g>
          )
        })}
        <circle r={1.1} fill="#e2799a" />
      </g>
    </g>
  )
}

export function BlossomDefs() {
  return (
    <defs>
      {Object.entries(TONES).map(([k, [a, b]]) => (
        <radialGradient key={k} id={`bl-${k}`} cx="0" cy="-6" r="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      ))}
    </defs>
  )
}
