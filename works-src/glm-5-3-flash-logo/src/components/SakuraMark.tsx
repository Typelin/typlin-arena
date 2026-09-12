export default function SakuraMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="var(--pink)">
        <ellipse cx="32" cy="18" rx="8.2" ry="13" />
        <ellipse cx="32" cy="18" rx="8.2" ry="13" transform="rotate(72 32 32)" />
        <ellipse cx="32" cy="18" rx="8.2" ry="13" transform="rotate(144 32 32)" />
        <ellipse cx="32" cy="18" rx="8.2" ry="13" transform="rotate(216 32 32)" />
        <ellipse cx="32" cy="18" rx="8.2" ry="13" transform="rotate(288 32 32)" />
      </g>
      <circle cx="32" cy="32" r="5.5" fill="#F2F2F2" />
    </svg>
  )
}
