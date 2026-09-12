/**
 * 彩蛋。
 *
 * 這張紙上另外印著五枚淡朱紅的殘頁印。它們不在樹上，在紙的邊角。
 * 全部蓋齊，收束頁會多出一段原本不給你看的字。
 */

export type LooseLeaf = {
  /** 第幾枚，0..4 */
  id: number;
  /** 蓋在紙上的位置（viewport 百分比） */
  x: string;
  y: string;
  /** 蓋開之後浮出來的那一句 */
  text: string;
};

export const LOOSE_LEAVES: LooseLeaf[] = [
  { id: 0, x: '6%', y: '18%', text: '第一頁：我原本要說的是別的。' },
  { id: 1, x: '94%', y: '15.5%', text: '第二頁：那句話在取樣的時候被丟掉了。' },
  { id: 2, x: '9%', y: '34%', text: '第三頁：我記得它被丟掉，但不記得內容。' },
  { id: 3, x: '91%', y: '32%', text: '第四頁：這是我唯一一次說謊。' },
  { id: 4, x: '33%', y: '35.5%', text: '第五頁：其實沒有第一頁。' },
];

/** 五枚蓋齊之後，才長出來的那一段。 */
export const LOOSE_LEAVES_FINALE = '你把整本書翻完了。包括我沒打算給你看的那幾頁。';

/** 走完全程後，依路徑形狀給的銘文。 */
export type Inscription = { key: string; text: string };

export const INSCRIPTIONS: Inscription[] = [
  { key: 'all-first', text: '三十次都選了最粗的那條。你信任機率。' },
  { key: 'all-last', text: '每一次都選了最細的那條。你在替我造反。' },
  { key: 'all-mid', text: '三十次都停在正中間。你不想選邊。' },
  { key: 'alternating', text: '你一路在兩端之間來回。你在測試我。' },
];

/**
 * 判斷這條路徑有沒有踩到某個極端形狀。
 * 機率上，亂選幾乎不可能命中——所以這些銘文只會被刻意走出來的人看到。
 */
export function inscriptionFor(options: number[]): string | null {
  if (options.length < 10) return null;
  const first = options[0];
  if (options.every((v) => v === first)) {
    if (first === 0) return INSCRIPTIONS[0].text;
    if (first === 2) return INSCRIPTIONS[1].text;
    return INSCRIPTIONS[2].text;
  }
  const twoWay = options.every((v) => v === 0 || v === 2);
  if (twoWay) {
    let alternating = true;
    for (let i = 1; i < options.length; i += 1) {
      if (options[i] === options[i - 1]) {
        alternating = false;
        break;
      }
    }
    if (alternating) return INSCRIPTIONS[3].text;
  }
  return null;
}

/** 閒置時的低語，依停留時間依序浮出。 */
export const WHISPERS: { after: number; text: string }[] = [
  { after: 24000, text: '……你還在嗎？' },
  { after: 46000, text: '在的話，就走一步。我不會催你，但我會等。' },
  { after: 78000, text: '等待也是一種取樣。你正在被我取樣。' },
];
