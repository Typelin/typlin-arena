import { forwardRef, useEffect, useRef, type MutableRefObject } from 'react';
import { FieldEngine, type FieldConfig } from '../engine/field';

/**
 * Thin React wrapper around the framework-free FieldEngine.
 * The canvas is a decorative layer: all meaning lives in the DOM text,
 * so it stays aria-hidden for screen readers.
 */
const FieldCanvas = forwardRef<FieldEngine, FieldConfig>(function FieldCanvas(
  { sentences, corpus },
  ref,
) {
  const cRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!cRef.current) return;
    const engine = new FieldEngine(cRef.current, { sentences, corpus });
    (ref as MutableRefObject<FieldEngine | null>).current = engine;
    (window as unknown as Record<string, unknown>).__fieldEngine = engine; // dev/QC hook
    return () => {
      engine.destroy();
      (ref as MutableRefObject<FieldEngine | null>).current = null;
    };
  }, [sentences, corpus, ref]);

  return <canvas ref={cRef} className="field" aria-hidden="true" />;
});

export default FieldCanvas;
