export interface Season {
  id: string;
  kanji: string;
  kana: string;
  name: string;
  weeks: string;
  title: string;
  body: string;
  deliverable: string;
}

export const seasons: Season[] = [
  {
    id: 'winter',
    kanji: '寒',
    kana: 'かん · 聽',
    name: '聽懂問題',
    weeks: '第 1 週',
    title: '先確認值不值得做，再談報價。',
    body: '一次深談，把你的生意邏輯畫成一張圖。做什麼、不做什麼、為什麼是現在做——三個答案清楚了，才會有接下來的事。如果不值得做，我們會直接說。',
    deliverable: '你會收到：一張範圍圖＋書面報價＋不做的清單。',
  },
  {
    id: 'bud',
    kanji: '蕾',
    kana: 'つぼみ · 描',
    name: '原型先行',
    weeks: '第 2–3 週',
    title: '可點的原型，比一百頁企劃書誠實。',
    body: '流程與文案先定，視覺後至。你會在手機上點到真正的頁面流程，而不是想像截圖。方向不對，在這裡轉彎最便宜。',
    deliverable: '你會收到：可點擊原型＋文案定稿＋視覺方向兩案。',
  },
  {
    id: 'bloom',
    kanji: '咲',
    kana: 'さく · 造',
    name: '小步交付',
    weeks: '第 3–6 週',
    title: '每週都看得到花開了多少。',
    body: '每週一個可看的進度，小步上線、隨時喊停。程式寫給下一個接手的人看：命名清楚、文件齊全、不綁奇怪的框架與服務。',
    deliverable: '你會收到：每週演示＋原始碼＋上線檢查表。',
  },
  {
    id: 'seed',
    kanji: '結',
    kana: 'むすぶ · 守',
    name: '長期守護',
    weeks: '上線之後',
    title: '交期有終點，維護沒有。',
    body: '上線三十天內免費修。之後可以選擇園丁方案：備份、更新、小改，有人在。軟體如庭園，不整理就會荒。',
    deliverable: '你會收到：三十天保固＋維運手冊＋園丁方案。',
  },
];

export interface Fortune {
  luck: string;
  poem: string;
  code: string;
  hidden?: boolean;
}

export const fortunes: Fortune[] = [
  { luck: '大吉', poem: '急事緩辦，花自會開。', code: 'git commit -m "bloom"' },
  { luck: '中吉', poem: '順流而下，比逆流更快。', code: 'ship v0.1 > dream v1.0' },
  { luck: '小吉', poem: '暗處的功夫，白天看得見。', code: '// TODO: 好好睡覺' },
  { luck: '吉', poem: '刪掉一百行，長出一朵花。', code: '-120 lines, +12' },
  { luck: '中吉', poem: '先給人看，再求完美。', code: 'preview > perfect' },
];

export const hiddenFortune: Fortune = {
  luck: '滿開',
  poem: '你抽到了春天本身。想法別放太久，來信吧。',
  code: '<sakura mode="full" />',
  hidden: true,
};

export interface Work {
  no: string;
  name: string;
  kana: string;
  kind: string;
  result: string;
}

export const works: Work[] = [
  {
    no: '其一',
    name: '朝櫻 — 山形麵包店',
    kana: 'あさざくら',
    kind: '預約網站',
    result: '載入 0.6 秒，電話預約少一半，假日完售提前兩小時。',
  },
  {
    no: '其二',
    name: '夜櫻帳 — 獨立書店',
    kana: 'よざくらちょう',
    kind: '庫存＋小系統',
    result: '一人顧店也點得完的盤點，月底結帳從兩天變兩小時。',
  },
  {
    no: '其三',
    name: '花筏 — 自由攝影師',
    kana: 'はないかだ',
    kind: '作品集網站',
    result: '豎排大留白，詢問量變兩倍，報價單不再被已讀不回。',
  },
  {
    no: '其四',
    name: '種子銀行 — NPO',
    kana: 'たねぎんこう',
    kind: '捐款＋志工表單',
    result: '流程從五步變兩步，維運成本降七成，志工自己會用。',
  },
];

export interface Price {
  name: string;
  kana: string;
  price: string;
  desc: string;
  points: string[];
  featured?: boolean;
}

export const prices: Price[] = [
  {
    name: '一分咲',
    kana: 'いちぶざき',
    price: 'NT$ 48,000 起',
    desc: '單頁式網站，三週，一期一會。適合剛發芽的想法。',
    points: ['單頁設計＋製作', '文案潤飾一次', '基本 SEO 與分析', '三十天保固'],
  },
  {
    name: '滿開',
    kana: 'まんかい',
    price: 'NT$ 120,000 起',
    desc: '多頁＋預約 / 金流 / CMS，最多人選的完整做法。',
    points: ['多頁＋後台', '金流或預約串接', '原型＋兩次修正', '上線＋教育訓練'],
    featured: true,
  },
  {
    name: '常駐園丁',
    kana: 'にわし',
    price: 'NT$ 18,000 / 月',
    desc: '維護＋小改＋備份。花開之後，有人繼續澆水。',
    points: ['每月小改時數', '備份＋更新', '故障優先處理', '隨時可停'],
  },
];

export interface Swatch {
  name: string;
  kana: string;
  hex: string;
  ink: boolean;
}

export const palette: Swatch[] = [
  { name: '櫻粉', kana: 'さくらいろ', hex: '#EFA3BE', ink: false },
  { name: '櫻深', kana: 'こいさくら', hex: '#C1547E', ink: true },
  { name: '靛藍', kana: 'あいいろ', hex: '#2E3D8C', ink: true },
  { name: '墨', kana: 'すみ', hex: '#23264A', ink: true },
  { name: '紙', kana: 'きなり', hex: '#FAF6EF', ink: false },
];
