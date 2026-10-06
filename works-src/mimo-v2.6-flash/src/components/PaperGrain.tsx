import { useMemo } from "react";

/** 128px 灰階噪點 tile：一次生成，之後只當 backgroundImage 平鋪 */
function makeNoiseTile(): string {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return "";
  const img = g.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = 120 + ((Math.random() * 70) | 0);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

/** 紙紋：固定 overlay，靜態噪點平鋪（無 feTurbulence、不重繪） */
export default function PaperGrain() {
  const tile = useMemo(() => makeNoiseTile(), []);
  return (
    <div className="grain" aria-hidden="true">
      <div
        className="grain__noise"
        style={tile ? { backgroundImage: `url(${tile})` } : undefined}
      />
      <div className="grain__vignette" />
    </div>
  );
}
