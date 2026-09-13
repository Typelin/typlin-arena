/* ============================================================
   Site content — kept in one place so copy is editable without
   touching layout code.
   ============================================================ */

export const BRAND = {
  name: '咲夢',
  full: '咲夢信息科技工作室',
  latin: 'SAKIMU TECH STUDIO',
  tagline: '用代碼創造美好未來',
  email: 'hello@sakimu.studio',
  phone: '+886 2 2712 0086',
  address: '台北市大安區溫州街 12 巷 7 號 3 樓',
  hours: '週一至週五 10:00 – 19:00',
}

export const NAV_LINKS = [
  { id: 'manifesto', label: '理念' },
  { id: 'services', label: '服務' },
  { id: 'process', label: '流程' },
  { id: 'works', label: '作品' },
  { id: 'contact', label: '聯絡' },
] as const

export const HERO = {
  kicker: 'SOFTWARE STUDIO · EST. 2017',
  title: ['讓一個念頭，', '慢慢開成能用的東西。'],
  lead: '我們是一間小工作室。不量產、不套模板，把每一個模糊的想法，耐心養成一件真的能上線、能維護、有人願意用的作品。',
  primaryCta: '聊聊你的專案',
  secondaryCta: '看我們做過什麼',
  seal: '咲',
}

export const MANIFESTO = {
  eyebrow: 'MANIFESTO',
  title: '「咲」，是花開的意思。',
  paragraphs: [
    '在日文裡，「咲」不是名詞，是一個動作——花自己決定要開。它不為誰的行程表服務，時機到了就綻放，時機未到，你怎麼催也沒用。',
    '我們把代碼看成同一件事。好的軟體有花期：太快交出去的東西沒有根，拖太久則錯過季節。工作室的功夫，就是判斷那個時刻。',
    '所以我們不接「三個月做十個頁面」這種單。我們寧願少接一點，把每一件做到可以拿出來、指著說「這是我們做的」。',
  ],
  buildLog: [
    { text: '$ sakimu build --seed "一個念頭"', kind: 'cmd' },
    { text: 'resolve  需求 ............... 42 項', kind: 'out' },
    { text: 'graft    設計系統 ............ ok', kind: 'out' },
    { text: 'compile  元件 ................ 318 個', kind: 'out' },
    { text: 'verify   裝置實測 ............ 12 / 12 pass', kind: 'out' },
    { text: 'bloom    ✿ 上線', kind: 'bloom' },
  ],
}

export const SERVICES = [
  {
    index: '壹',
    title: '網站與品牌官網',
    latin: 'Website & Brand',
    body: '從一張白紙開始。資訊架構、視覺語言、內容節奏，全部依你的樣子長出來，不套版型。',
    tags: ['設計系統', '響應式', 'SEO'],
  },
  {
    index: '貳',
    title: '網頁應用開發',
    latin: 'Web Application',
    body: '把重複的流程做成工具，把散落的資料收成一張表。前端到後端，能上線，也能乾淨交接。',
    tags: ['React', 'TypeScript', 'API 整合'],
  },
  {
    index: '參',
    title: '行動裝置應用',
    latin: 'Mobile App',
    body: '一支手機能完成的事，就不該讓使用者去開電腦。原生雙軌，或跨平台單一維護。',
    tags: ['iOS / Android', '跨平台', '離線優先'],
  },
  {
    index: '肆',
    title: '系統整合與自動化',
    latin: 'Integration',
    body: '把公司裡那幾套互不相識的系統縫在一起，讓資料自己流動，人去做更值得的事。',
    tags: ['流程自動化', '資料同步', '排程'],
  },
] as const

export const PROCESS = [
  {
    season: '春',
    latin: 'Listen',
    name: '對話',
    when: '第 1 – 2 週',
    body: '先不寫程式。我們坐下來把「你想要什麼」拆成「實際上要解決什麼」。需求、邊界、不能妥協的底線，全部寫下來。',
    outputs: ['需求訪談紀錄', '範圍界定書', '初步架構草圖'],
  },
  {
    season: '夏',
    latin: 'Build',
    name: '構築',
    when: '第 3 – 7 週',
    body: '進入施工期。每兩週給你一個能實際點開的版本，不是截圖、不是進度報告。看到東西，再決定下一步。',
    outputs: ['可操作原型', '元件庫', '雙週演示'],
  },
  {
    season: '秋',
    latin: 'Ship',
    name: '綻放',
    when: '第 8 – 9 週',
    body: '上線不是結束。效能、無障礙、各種裝置的實測，加上一份讓你自己也能維護的交接文件。',
    outputs: ['生產環境部署', '效能與無障礙檢測', '交接文件'],
  },
  {
    season: '冬',
    latin: 'Keep',
    name: '守護',
    when: '上線之後',
    body: '花開了要顧。監控、修補、小幅迭代，讓它在你手上繼續長，而不是交付那天就開始腐壞。',
    outputs: ['監控與告警', '修補與迭代', '季度檢視'],
  },
] as const

export const WORKS = [
  {
    year: '2026',
    kind: '網頁應用',
    title: '澄石 · 庫存中台',
    body: '把三張散落的 Excel 與一套老 ERP 縫成同一個介面，盤點時間從兩天縮到四十分鐘。',
    metric: '盤點工時 −82%',
    tone: 'iris',
    quip: '業主說「先做個簡單版就好」，然後我們做了三個月。',
  },
  {
    year: '2025',
    kind: '品牌官網',
    title: '南嶼茶事',
    body: '一間三十年的老茶行。我們沒有把它做成電商，而是做成一本可以慢慢翻的茶譜。',
    metric: '平均停留 4 分 12 秒',
    tone: 'sakura',
    quip: '業主原本堅持要購物車。我們花了兩週，勸他放棄。',
  },
  {
    year: '2025',
    kind: '行動應用',
    title: '走一段 · 步道誌',
    body: '離線可用的登山紀錄工具。山裡沒有訊號，所以整個架構都從「沒有網路」開始設計。',
    metric: '離線 100% 可用',
    tone: 'mist',
    quip: '為了離線，我們最後刪掉的程式碼比留下的還多。',
  },
  {
    year: '2024',
    kind: '系統整合',
    title: '禾光 · 排班自動化',
    body: '連鎖門市的人力排班。把規則寫進系統，讓主管從排班地獄裡被撈出來。',
    metric: '每月省下 30 小時',
    tone: 'iris',
    quip: '排班這種事，本來就不該用人腦算。',
  },
] as const

export const SERVICES_NOTE = '以上四件事，我們都不接急件——除非你願意等。'

/** Rotating lines shown while the page sits idle. */
export const IDLE_MURMURS = [
  '沒在偷懶，只是在等你',
  '花開之前，都是安靜的',
  '此刻正在校準某個東西',
  '安靜不等於停止',
  '連休息也是流程的一部分',
  '還在運轉，別擔心',
] as const

export const FOOTER_WHISPER = '這一頁的每一個像素，都是手寫的。'

/** Copy fired by the easter eggs. Kept here so the tone stays in one voice. */
export const EGG_MESSAGES = {
  konami: '找到了。這條指令從 1986 年活到現在，跟你一樣有耐心。',
  logoNudge: '你對我們的商標很有興趣，對吧？',
  logoMax: '夠了，再點下去花就要謝了。',
  petalsOff: '好，安靜一點。',
  petalsOn: '花瓣回來了。',
} as const

/** Keyword triggers for the enquiry textarea. Matched case-insensitively. */
export const EGG_KEYWORDS: { pattern: RegExp; message: string }[] = [
  {
    pattern: /免費|不用錢|無償|贊助/,
    message: '免費的東西通常最貴——但你可以先說說看。',
  },
  {
    pattern: /便宜|預算|砍價|折扣|算我便宜/,
    message: '預算這種事，早說比晚說好。我們不會裝傻。',
  },
  {
    pattern: /很急|急件|明天|這週|馬上|盡快/,
    message: '急件我們接，但不會因此做得比較快。急的是排程，不是品質。',
  },
  {
    pattern: /爆紅|發大財|一夜|保證賺/,
    message: '這種期待我們先記下來，等交付那天再一起笑。',
  },
]

export const STATS = [
  { value: '128', unit: '件', label: '交付專案' },
  { value: '9', unit: '年', label: '持續營運' },
  { value: '41', unit: '間', label: '長期合作' },
  { value: '92', unit: '%', label: '客戶回訪率' },
] as const

export const PROJECT_TYPES = [
  '網站 / 品牌官網',
  '網頁應用系統',
  '行動裝置 App',
  '系統整合 / 自動化',
  '還不確定，想先聊聊',
] as const
