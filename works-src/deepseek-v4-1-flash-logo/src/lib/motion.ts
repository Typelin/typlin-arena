import type { CSSProperties } from 'react'

/** Stagger helper for scroll-reveal delays (consumed by `--reveal-delay`). */
export const delay = (ms: number): CSSProperties =>
  ({ '--reveal-delay': `${ms}ms` }) as CSSProperties

/**
 * Pointer parallax offset. Exposed as custom properties so CSS keeps full
 * ownership of `transform` (rotation, hover states) without being clobbered.
 */
export const parallax = (x: number, y: number, strength = 16): CSSProperties =>
  ({
    '--px': `${(x * -strength).toFixed(2)}px`,
    '--py': `${(y * -strength).toFixed(2)}px`,
  }) as CSSProperties
