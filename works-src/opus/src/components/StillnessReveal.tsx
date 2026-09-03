interface Props {
  visible: boolean;
}

/**
 * 靜止彩蛋 — 當使用者完全不動游標數秒後浮現。
 */
export function StillnessReveal({ visible }: Props) {
  return (
    <div
      className={`stillness ${visible ? 'stillness--visible' : ''}`}
      aria-live="polite"
      role="status"
    >
      <span className="stillness__text">你找到了靜止。</span>
    </div>
  );
}
