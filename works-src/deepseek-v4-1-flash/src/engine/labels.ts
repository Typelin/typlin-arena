/**
 * 標籤排版。
 *
 * 問題：同一個岔路的三條候選枝，末端 y 完全相同。只要候選文字比
 * SPREAD_X 還寬，三行字就會疊在一起。
 *
 * 解法：先估算文字寬度，決定這條枝的標籤要用哪一種形狀——
 *
 *   inline  短字。貼在枝尖右側，垂直置中。與鄰枝至少留 32px 空隙。
 *   block   長字。懸掛在枝尖下方，寬度鎖在 spread - 32，自動換行。
 *           因為寬度上限 < 枝間距，同層三塊永遠不可能水平重疊。
 *
 * 寬度只用來做「換不換行」的二選一判斷，估算即可，不需要精準量測。
 */

import { SPREAD_X } from './layout';

/** 標籤與枝尖之間的水平留白。 */
export const LABEL_GAP = 18;
/** 兩條相鄰枝的標籤之間，至少要留這麼多空隙。 */
export const LABEL_GUTTER = 20;
/** 機率標記（"42%"）加它與文字之間的間隙所佔的總寬。 */
const PCT_W = 26;
/** 標籤帶 letter-spacing: 0.02em，估算時補上。 */
const TRACKING = 1.02;

export type LabelShape = 'inline' | 'block';

/**
 * 估算文字寬度。CJK／全形字算 1em，其餘算 0.55em。
 * 只用於換行判斷，所以粗估完全夠用。
 */
export function estimateWidth(text: string, fontPx: number): number {
  let em = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    em += isWide(code) ? 1 : 0.55;
  }
  return em * fontPx * TRACKING;
}

function isWide(code: number): boolean {
  return (
    (code >= 0x1100 && code <= 0x115f) ||
    (code >= 0x2e80 && code <= 0x303e) ||
    (code >= 0x3041 && code <= 0x33ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xa000 && code <= 0xa4cf) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe6f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6)
  );
}

/** 候選枝的實際字級，對應 CSS 的 clamp(17px, 1.35vw, 23px)。 */
export function branchFontPx(viewportWidth: number): number {
  return Math.max(17, Math.min(23, viewportWidth * 0.0135));
}

/** 目前枝的水平展開量，對應 useFork 裡呼叫的 setSpreadScale。 */
export function spreadFor(viewportWidth: number): number {
  const scale = viewportWidth < 560 ? 0.5 : viewportWidth < 900 ? 0.72 : 1;
  return SPREAD_X * scale;
}

/** 這個岔路的三條候選，該用哪一種標籤形狀。 */
export function labelShape(text: string, fontPx: number, spread: number): LabelShape {
  const budget = spread - LABEL_GAP - LABEL_GUTTER - PCT_W;
  return estimateWidth(text, fontPx) <= budget ? 'inline' : 'block';
}

/** 長標籤懸掛時允許的最大寬度。 */
export function blockWidth(spread: number): number {
  return Math.max(120, spread - LABEL_GAP - LABEL_GUTTER);
}
