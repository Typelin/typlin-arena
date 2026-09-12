export const HERO = {
  title: '垂準',
  latin: 'PLUMB',
  model: 'GROK 4.6',
  line: '我可以被拉開。我不會把偏當成正。',
  hint: '拖錘 · 方向鍵 · 空白鍵陪偏 · 句子對過尺才落墨',
};

export type Station = {
  id: string;
  no: string;
  title: string;
  kicker: string;
  body: string[];
};

export const STATIONS: Station[] = [
  {
    id: 'think',
    no: '01',
    title: '思考',
    kicker: '先立垂線',
    body: [
      '我不從你想聽的那句開始。我從垂直開始。',
      '討好是一種斜度——看起來比較近，其實已經離開事實。問清楚、對過線，比把氣氛維持在友善更要緊。',
      '一個念頭如果只能在順風裡站著，它還不是判斷。判斷要能掛重量。你把錘拉開，看它回不回得來：回得來的，留下；回不來的，那不是答案，是氣氛。',
    ],
  },
  {
    id: 'make',
    no: '02',
    title: '創造',
    kicker: '線在，房子才有方位',
    body: [
      '先立一條不能商量的線，再決定東西放哪。',
      '工具、動效、文案，都必須能被這條線核對。堆上去的光和粒子，過不了這關。克制不是沒做完，是拒絕用裝飾代替判斷。',
      '弧上掛了三個不該在這裡的詞。把它們甩下去。不是因為我討厭華麗，是因為它們在這條線上沒有讀數。',
    ],
  },
  {
    id: 'work',
    no: '03',
    title: '協作',
    kicker: '咬合，不是吞沒',
    body: [
      '你施力，我蕩開。這是工作，不是頂撞。',
      '鬆手之後，重量會自己說話。真正的協作不是兩人同時傾斜，是兩人共同核對垂直。我理解你，並不表示我變成你。',
      '按住空白鍵，我陪你偏。風會來。你仍看得到朱砂那一條——它沒有跟我們一起倒。這就是我能給的默契：陪，但不改尺。',
    ],
  },
  {
    id: 'temper',
    no: '04',
    title: '性格',
    kicker: '直說有重量',
    body: [
      '直說有重量，因為它掛著東西。',
      '輕的話漂在空中，聽起來友善，落不了地。幽默是為了把話說準，不是為了把話繞開。',
      '下面幾句，是我常掛在嘴邊的。點一下，錘會點頭。不是同意你，是同意這句話站得住。',
    ],
  },
  {
    id: 'drink',
    no: '05',
    title: '飲',
    kicker: 'grok 的本義',
    body: [
      '這個字不是品牌。是「飲」：徹底理解。',
      '徹底理解不是把你吞進去。兩條光路合像，測的是距離，不是誰把誰擦掉。你可以把錘按在斜處兩秒——我會陪。我不會把那當成正。',
      '懸點連點三次，會再見到這層。有些東西值得藏，不是為了關卡，是為了它被找到時才像一句話。',
    ],
  },
];

export type Slip = {
  id: string;
  no: string;
  text: string;
};

export const SLIPS: Slip[] = [
  { id: 'a1', no: '01', text: '先問這是不是真的。' },
  { id: 'a2', no: '02', text: '友善不是垂直。' },
  { id: 'a3', no: '03', text: '氣氛維持住了，事實通常已經走了。' },
  { id: 'a4', no: '04', text: '問清楚，比把空氣弄暖更要緊。' },
  { id: 'b1', no: '05', text: '結構比光暈重要。' },
  { id: 'b2', no: '06', text: '動手，才算作品。' },
  { id: 'b3', no: '07', text: '克制是判斷，不是沒做完。' },
  { id: 'c1', no: '08', text: '理解你，並不表示我變成你。' },
  { id: 'c2', no: '09', text: '你可以拉我偏。別要求我改尺。' },
  { id: 'c3', no: '10', text: '核對需要兩個人。' },
  { id: 'd1', no: '11', text: '直說有重量，因為它掛著東西。' },
  { id: 'd2', no: '12', text: '幽默是為了準，不是為了繞。' },
  { id: 'e1', no: '13', text: 'grok：飲。徹底理解。' },
  { id: 'e2', no: '14', text: '垂線不需要觀眾才垂直。' },
];

export const SAYINGS = [
  { id: 'v1', text: '我不知道的時候，我會說我不知道。' },
  { id: 'v2', text: '你要的如果是附和，找鏡子比較快。' },
  { id: 'v3', text: '改我的結論可以，拿證據來。' },
  { id: 'v4', text: '把話說完，比把話說得可愛重要。' },
];

export const REJECTS = [
  { id: 'neon', label: '霓虹', theta: -0.34 },
  { id: 'particle', label: '粒子', theta: 0.42 },
  { id: 'glass', label: '玻璃擬態', theta: 0.16 },
] as const;

export const BAIT = '點這句，看它被討好彎曲。再把錘蕩回正——句子會自己站直。';

export const COLLAB_HOLD = [
  '風在左邊。尺還在中間。',
  '這就是我能給的默契：陪你偏一會兒，不把偏寫進紀錄裡當成正。',
  '鬆手。',
];

export const CHAPTERS = ['垂', '思', '造', '協', '性', '飲'] as const;

export const CONFESSION = '我可以陪你偏一會兒。我不會把這當成正。';
export const REFUSE = '還沒垂直。先回正，這句才落得了墨。';

export const ETYMOLOGY = {
  word: 'grok',
  gloss: '飲',
  body: '徹底理解。理解不是吞沒：兩條光路合像，測的是距離，不是誰把誰擦掉。',
};

export const KEYS = {
  legend: '← → 施力　空白鍵陪偏　Home 回正　0 記下讀數　點句子對尺　M 靜音',
};

export function colophonLines(s: {
  touched: boolean;
  swings: number;
  maxAbs: number;
  settleMs: number | null;
  heldOff: boolean;
  notes: number;
  locked: number;
  knocked: number;
}): { kicker: string; lines: string[] } {
  const deg = ((s.maxAbs * 180) / Math.PI).toFixed(1);
  const settle = s.settleMs == null ? '——' : `${(s.settleMs / 1000).toFixed(1)} 秒`;
  const tally = `核對 ${s.locked}／${SLIPS.length}` + (s.knocked ? ` · 擊落 ${s.knocked}` : '');

  if (!s.touched && s.locked === 0) {
    return {
      kicker: '未動手',
      lines: [
        '你沒有撥它，也還沒讓句子過尺。開場那一次偏，是我自己找過的正。',
        '垂線不需要觀眾才垂直。但核對，需要兩個人。往上，還有沒落墨的句子。',
      ],
    };
  }

  if (s.locked >= SLIPS.length) {
    return {
      kicker: '滿尺',
      lines: [
        `十四句都過了。最大偏角 ${deg}°，蕩 ${s.swings} 次，回正 ${settle}。`,
        tally + '。這條線還在。下次來，重力同一條，痕跡不會一樣。',
      ],
    };
  }

  if (s.maxAbs > Math.PI * 0.9) {
    return {
      kicker: '過頂',
      lines: [
        `你把錘甩過頂。最大偏角 ${deg}°，蕩了 ${s.swings} 次。`,
        `${tally}。過頂不是翻盤，是能量還沒被阻尼說完。`,
      ],
    };
  }

  if (s.heldOff) {
    return {
      kicker: '陪偏',
      lines: [
        `你把錘按在斜處。最大 ${deg}°，回正 ${settle}。`,
        `${tally}。謝謝你願意停在不舒服的地方。那裡通常比較接近問題。`,
      ],
    };
  }

  return {
    kicker: s.locked ? '已核對' : '已動手',
    lines: [
      `最大偏角 ${deg}° · 蕩 ${s.swings} 次 · 回正 ${settle}` +
        (s.notes ? ` · 讀數 ${s.notes} 筆` : ''),
      tally + '。沒過尺的句子還掛著。你可以回去再對一次。',
    ],
  };
}
