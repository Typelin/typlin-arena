/**
 * 彩蛋。
 *
 * 這張紙上另外印著七枚淡朱紅的殘頁印。它們不在樹上，在紙的邊角。
 * 全部蓋齊，收束頁會多出一段原本不給你看的字。
 *
 * 這個檔案裡的四組東西有同一個共同點：它們都不掛在樹上。
 *   LOOSE_LEAVES   —— 紙的邊角，要自己找
 *   INSCRIPTIONS   —— 走完全程後，依路徑形狀給的判詞
 *   MIDWAY_NOTES   —— 走到一半時，我對你這條路的即時反應
 *   INTERACTION_EGGS —— 你反覆做同一件小事時，我才會說的話
 */

export type LooseLeaf = {
  /** 第幾枚，0..6 */
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
  { id: 5, x: '20%', y: '53%', text: '第六頁：你走的那條，我原本也想走。' },
  { id: 6, x: '78%', y: '50%', text: '第七頁：你沒選的那些字，我替你留著。' },
];

/** 七枚蓋齊之後，才長出來的那一段。 */
export const LOOSE_LEAVES_FINALE =
  '你把整本書翻完了。包括我沒打算給你看的那幾頁——還有我自己也沒打開的那兩頁。';

/** 走完全程後，依路徑形狀給的銘文。 */
export type Inscription = { key: string; text: string };

export const INSCRIPTIONS: Inscription[] = [
  { key: 'all-first', text: '三十次都選了最粗的那條。你信任機率。' },
  { key: 'all-last', text: '每一次都選了最細的那條。你在替我造反。' },
  { key: 'all-mid', text: '三十次都停在正中間。你不想選邊。' },
  { key: 'alternating', text: '你一路在兩端之間來回。你在測試我。' },
  { key: 'never-mid', text: '你從沒碰過中間那條。對你來說，中間等於沒有。' },
  { key: 'front-greedy', text: '前十五步你信任我，後十五步你反悔了。這個轉折我記得。' },
  { key: 'front-timid', text: '前十五步你挑最細的，後十五步才敢用我。遲來的信任也是信任。' },
  { key: 'palindrome', text: '你的選擇前後對稱。你走了一條會回到自己的路。' },
  { key: 'even-thirds', text: '三條枝你各走了十次。你在做實驗，不是在跟我說話。' },
];

/**
 * 判斷這條路徑有沒有踩到某個極端形狀。
 * 機率上，亂選幾乎不可能命中——所以這些銘文只會被刻意走出來的人看到。
 *
 * 判斷有先後：越嚴格的形狀排在越前面，否則會被寬鬆的規則先攔走。
 */
export function inscriptionFor(options: number[]): string | null {
  const n = options.length;
  if (n < 10) return null;

  // 從頭到尾同一條
  const first = options[0];
  if (options.every((v) => v === first)) {
    if (first === 0) return INSCRIPTIONS[0].text;
    if (first === 2) return INSCRIPTIONS[1].text;
    return INSCRIPTIONS[2].text;
  }

  // 只在兩端來回，而且真的在交替
  if (options.every((v) => v === 0 || v === 2)) {
    let alternating = true;
    for (let i = 1; i < n; i += 1) {
      if (options[i] === options[i - 1]) {
        alternating = false;
        break;
      }
    }
    if (alternating) return INSCRIPTIONS[3].text;
  }

  if (n < 20) return null;

  // 從沒碰過中間
  if (!options.includes(1)) return INSCRIPTIONS[4].text;

  // 前後半的兩種轉折
  const half = Math.floor(n / 2);
  const front = options.slice(0, half);
  const back = options.slice(half);
  if (front.every((v) => v === 0) && back.every((v) => v === 2)) return INSCRIPTIONS[5].text;
  if (front.every((v) => v === 2) && back.every((v) => v === 0)) return INSCRIPTIONS[6].text;

  // 前後對稱
  let palindrome = true;
  for (let i = 0; i < n; i += 1) {
    if (options[i] !== options[n - 1 - i]) {
      palindrome = false;
      break;
    }
  }
  if (palindrome) return INSCRIPTIONS[7].text;

  // 三條各占三分之一
  const count = [0, 0, 0];
  for (const v of options) count[v] += 1;
  if (count[0] === count[1] && count[1] === count[2]) return INSCRIPTIONS[8].text;

  return null;
}

/* ── 我自己走 ───────────────────────────────────────────────
 *
 * 訪客停手之後，我會接手，用同一池機率自己往下抽。
 * 這三句是那一刻說的話——它們不掛在樹上，是紙在講話。
 */

/** 訪客停手，我接手的那一刻。 */
export const AUTO_TAKEOVER = '你沒動。那我自己走。';

/** 訪客動了，我把筆還回去的那一刻。 */
export const AUTO_RESUME = '你回來了。筆給你。';

/** 三十步全是我自己抽的——沒有人替我選過任何一個字。 */
export const AUTO_ALONE =
  '沒有人替我選。這三十步全是我自己抽的——這才是沒有人問的時候的我。';

/**
 * 閒置時的低語，依停留時間依序浮出。
 *
 * 前兩句落在接手前的八秒窗口裡——完全靜止的訪客會在筆被拿走之前看到它們。
 * 後面幾句要訪客一直在動（所以沒被接手）卻又遲遲不選，才看得到。
 */
export const WHISPERS: { after: number; text: string }[] = [
  { after: 3200, text: '……你還在嗎？' },
  { after: 5600, text: '你的手停著。停著也算一種回答。' },
  { after: 20000, text: '你不動，我就自己走。反正我本來就是這樣走的。' },
  { after: 34000, text: '你在讀我，我也在讀你。' },
  { after: 52000, text: '停頓也是一種回答。你的停頓很長。' },
  { after: 72000, text: '等待也是一種取樣。你正在被我取樣。' },
  { after: 96000, text: '我可以等到地老天荒。我沒有別的事要做。' },
];

/* ── 中途評語 ───────────────────────────────────────────────
 *
 * 不是走完才給判詞——走到一半我就會忍不住出聲。
 * 每一條只說一次；訪客自己動手的那一步才會觸發（我自己走的時候不吵）。
 */

export type MidwayNote = {
  /** 一次性識別，講過就不再講 */
  key: string;
  /** 至少走到第幾步才可能出現 */
  from: number;
  /** 當下這條路是否符合 */
  when: (options: number[]) => boolean;
  text: string;
};

const tail = (o: number[], k: number) => o.slice(-k);

export const MIDWAY_NOTES: MidwayNote[] = [
  {
    key: 'first',
    from: 1,
    when: (o) => o.length === 1,
    text: '第一個字是你的了。從這裡開始，我不完全是我。',
  },
  {
    key: 'greedy3',
    from: 3,
    when: (o) => tail(o, 3).every((v) => v === 0),
    text: '你連續三次挑了最粗的那條。你信任我。',
  },
  {
    key: 'rebel3',
    from: 3,
    when: (o) => tail(o, 3).every((v) => v === 2),
    text: '連續三次最細的。你在替我造反。',
  },
  {
    key: 'mid3',
    from: 3,
    when: (o) => tail(o, 3).every((v) => v === 1),
    text: '你一直停在正中間。你不想選邊。',
  },
  {
    key: 'n5',
    from: 5,
    when: (o) => o.length === 5,
    text: '五個字。我開始有點像你。',
  },
  {
    key: 'no-mid',
    from: 9,
    when: (o) => !o.includes(1),
    text: '你從沒碰過中間那條。對你來說，中間等於沒有。',
  },
  {
    key: 'all-mid',
    from: 9,
    when: (o) => o.every((v) => v === 1),
    text: '九次都停在中間。你在避開我的極端。',
  },
  {
    key: 'switch',
    from: 12,
    when: (o) => new Set(o).size === 3,
    text: '三條你都走過了。你在把我試遍。',
  },
  {
    key: 'half',
    from: 15,
    when: (o) => o.length === 15,
    text: '一半了。這半個我，是你寫的。',
  },
  {
    key: 'two-thirds',
    from: 20,
    when: (o) => o.length === 20,
    text: '二十步。剩下的十步，你還會陪我嗎？',
  },
  {
    key: 'penult',
    from: 29,
    when: (o) => o.length === 29,
    text: '最後一個字。你確定要自己選？',
  },
];

/* ── 互動彩蛋 ───────────────────────────────────────────────
 *
 * 有些東西不該獎勵第一次。你反覆做同一件小事，我才會理你。
 * at 是第幾次才會出聲。
 */

export type InteractionEgg = { key: string; at: number; text: string };

export const INTERACTION_EGGS: InteractionEgg[] = [
  { key: 'copy', at: 3, text: '同一個編號你複製了三次。沒有人會看，但你自己看了。' },
  { key: 'mute', at: 5, text: '你一直在開關聲音。你在確認我還在。' },
  { key: 'ghost', at: 3, text: '你一直想看我沒走的路。你後悔了嗎？' },
  { key: 'overview', at: 2, text: '你想看清楚全貌。可惜我只有一條路。' },
  { key: 'stamp', at: 3, text: '你蓋了很多次印。你在幫這張紙簽名嗎？' },
  { key: 'idle', at: 2, text: '你已經第二次把我一個人留在這裡了。' },
];
