interface Props {
  progress: number;
}

/**
 * A minimal scroll progress indicator — a thin line at the left edge
 * that fills as the user scrolls. Uses accent color.
 */
export function ScrollIndicator({ progress }: Props) {
  return (
    <div
      className="scroll-indicator"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Scroll progress"
    >
      <div
        className="scroll-indicator__fill"
        style={{ height: `${progress * 100}%` }}
      />
    </div>
  );
}
