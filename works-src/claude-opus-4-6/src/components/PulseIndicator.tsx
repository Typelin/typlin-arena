interface Props {
  visible: boolean;
  x: number;
  y: number;
}

/**
 * A small ripple indicator at click location,
 * telling the user their click sent a pulse through the field.
 */
export function PulseIndicator({ visible, x, y }: Props) {
  if (!visible) return null;

  return (
    <div
      className="pulse-indicator"
      style={{
        left: x,
        top: y,
      }}
      aria-hidden="true"
    >
      <div className="pulse-indicator__ring" />
      <div className="pulse-indicator__ring pulse-indicator__ring--delayed" />
    </div>
  );
}
