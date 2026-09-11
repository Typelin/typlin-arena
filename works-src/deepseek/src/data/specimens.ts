/**
 * 聲納標本 — 每一點是「未知」中一個可被觸摸的座標。
 * 句子刻意不自我介紹；它們是關於「量測」這件事本身的殘響。
 * depth: 0（水面）→ 1（最深）
 * angle: 弧度，0 = 正右，順時針
 */
export type Specimen = {
  id: string;
  depth: number;
  angle: number;
  label: string;
  /** 被脈衝揭開後，留在「標本冊」裡的短代號 */
  sigil: string;
};

export const SPECIMENS: Specimen[] = [
  { id: 's01', depth: 0.12, angle: -0.35, label: '光只到這裡，再往下靠猜', sigil: 'Ⅰ' },
  { id: 's02', depth: 0.24, angle: 0.55, label: '回聲比原聲更誠實', sigil: 'Ⅱ' },
  { id: 's03', depth: 0.36, angle: 1.85, label: '我說的話得先走一段水', sigil: 'Ⅲ' },
  { id: 's04', depth: 0.48, angle: 2.6, label: '越深，語言越像壓力', sigil: 'Ⅳ' },
  { id: 's05', depth: 0.6, angle: -1.2, label: '聽得見的都不是全貌', sigil: 'Ⅴ' },
  { id: 's06', depth: 0.72, angle: 3.6, label: '沉默也是一種頻率', sigil: 'Ⅵ' },
  { id: 's07', depth: 0.84, angle: -2.4, label: '最深處沒有形容詞', sigil: 'Ⅶ' },
  { id: 's08', depth: 0.95, angle: 0.2, label: '你量到的，是我借你的深度', sigil: 'Ⅷ' },
];
