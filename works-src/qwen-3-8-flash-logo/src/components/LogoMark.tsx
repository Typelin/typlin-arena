export default function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="lm-arc"
          x1="8"
          y1="4"
          x2="40"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#e2718f" />
          <stop offset="0.55" stopColor="#8f93c4" />
          <stop offset="1" stopColor="#33406f" />
        </linearGradient>
        <linearGradient
          id="lm-petal"
          x1="14"
          y1="20"
          x2="26"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#f8cdd8" />
          <stop offset="1" stopColor="#ef9ab3" />
        </linearGradient>
      </defs>
      <path
        d="M39 9a18.5 18.5 0 1 0 1.5 27"
        stroke="url(#lm-arc)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M20 21c4.5-1.5 8.5 1.5 8 6-.5 4-4.5 7-8 7s-7-3-7-6.5c0-3.5 3-5.5 7-6.5z"
        fill="url(#lm-petal)"
      />
      <path
        d="M35 13.5l1.3 2.9 2.9 1.3-2.9 1.3-1.3 2.9-1.3-2.9-2.9-1.3 2.9-1.3z"
        fill="#8f93c4"
      />
    </svg>
  );
}
