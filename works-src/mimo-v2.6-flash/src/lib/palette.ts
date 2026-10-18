export type RGB = [number, number, number];

export const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const css = (c: RGB) =>
  `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;

/** 每一幕的地面色：骨白 → 灰青 → 砂 → 夜靛 → 骨白（回到起點） */
export const GROUNDS: RGB[] = [
  hex("#F2EFE6"),
  hex("#D8E0E4"),
  hex("#EAE0CD"),
  hex("#111629"),
  hex("#F2EFE6"),
];

export const INK = hex("#14181F");
export const INK_NIGHT = hex("#EFEAE0");
export const ACCENT = hex("#DD3F1B");
export const ACCENT_NIGHT = hex("#FF6A3D");
