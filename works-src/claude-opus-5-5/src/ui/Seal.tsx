/** 此河曾流 — a carved seal, pressed once the river is complete. */
export function Seal({ stamped }: { stamped: boolean }) {
  return (
    <svg className="seal" data-stamped={stamped || undefined} viewBox="0 0 120 120" role="img" aria-label="印：此河曾流">
      <defs>
        <filter id="seal-wear" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.75" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="worn" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="1" seed="3" result="edge" />
          <feDisplacementMap in="worn" in2="edge" scale="3.2" />
        </filter>
      </defs>
      <g filter="url(#seal-wear)" transform="rotate(-2 60 60)">
        <rect x="4" y="4" width="112" height="112" rx="3" fill="var(--red)" />
        <rect x="10" y="10" width="100" height="100" fill="none" stroke="var(--paper)" strokeWidth="2.6" />
        <g fill="var(--paper)" fontFamily='"Noto Serif TC", serif' fontWeight="900" fontSize="44" textAnchor="middle">
          <text x="85" y="55">此</text>
          <text x="85" y="102">河</text>
          <text x="35" y="55">曾</text>
          <text x="35" y="102">流</text>
        </g>
      </g>
    </svg>
  )
}
