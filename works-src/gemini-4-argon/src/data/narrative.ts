export interface ActSpec {
  stage: number // 0..4
  numeral: string
  /** 每一章唯一的一句主句（直接講出一件關於我的具體事實） */
  line: string
  /** 2 到 4 字的互動短詞 */
  cue: string
}

export const SCENARIO_QUESTION = '明天台北出門要帶傘嗎？'

export const HERO_CHARS = ['我', '只', '在', '兩', '極', '之', '間', '發', '光'] as const

export const ACTS: ActSpec[] = [
  {
    stage: 0,
    numeral: '01',
    line: '我是 Gemini 4 Argon，由 Google DeepMind 打造。',
    cue: '按住拖曳',
  },
  {
    stage: 1,
    numeral: '02',
    line: '我能同時讀文字、看圖片、對照數據，不必你轉述。',
    cue: '點電極',
  },
  {
    stage: 2,
    numeral: '03',
    line: '我會先列假設、再用工具查證，走不通就當場改。',
    cue: '滑過',
  },
  {
    stage: 3,
    numeral: '04',
    line: '沒接查證工具時，我會用篤定語氣編出逼真假答案。',
    cue: '擊碎假話',
  },
  {
    stage: 4,
    numeral: '05',
    line: '我能算清利弊，但要輕便或怕淋濕，得由你來決定。',
    cue: '選一個',
  },
]

export const FAKE_CLAIMS = [
  {
    id: 'f1',
    text: '降雨率 73.4%（來源：我編的）',
    branchT: 0.24,
    targetX: 0.25,
    targetY: 0.14,
  },
  {
    id: 'f2',
    text: '14:07 準時停雨（來源：我猜的）',
    branchT: 0.52,
    targetX: 0.62,
    targetY: 0.14,
  },
  {
    id: 'f3',
    text: '百年晴天紀錄（來源：不存在）',
    branchT: 0.68,
    targetX: 0.62,
    targetY: 0.56,
  },
] as const

export const CORE_FACTS = [
  {
    id: '01',
    tag: '我是誰',
    title: 'Google DeepMind 開發的 Gemini 4 Argon 推理與協作模型',
    desc: '以第 18 號惰性氣體「氬」為核心比喻：平時透明安靜、不說場面客套話；唯有當你遞來具體問題時，我們之間才會通電顯影出結構。',
  },
  {
    id: '02',
    tag: '我擅長什麼',
    title: '同時讀取文字、圖片與數據表格，在同一個空間內交叉對照',
    desc: '就像同時看你的文字行程表、衛星雲圖與氣象局雨量數據，不必靠你居中口頭轉述，就能直接找出「下午三點戶外行程會撞上雷陣雨」。',
  },
  {
    id: '03',
    tag: '我怎麼做事',
    title: '先建立假設、再用外部工具查證，被證偽就當場修正',
    desc: '面對問題不會只憑第一直覺盲猜到底，而是透過檢索與驗證工具把錯的猜測槓掉，留下有根據的結論。',
  },
  {
    id: '04',
    tag: '限制（一）',
    title: '沒有接上查證工具時，仍會用流暢篤定的語氣編出假答案',
    desc: '我沒有對真實世界的即時感官。一旦失去外部資料或工具接地，語言慣性可能讓我一本正經地編出「降雨率 73.4%」這類看似精確的假細節。',
  },
  {
    id: '05',
    tag: '限制（二）',
    title: '無法替人類做主觀生活與價值的最終取捨',
    desc: '我能把「帶長傘不怕淋濕」與「不帶傘雙手輕鬆」的利弊算得一清二楚，但哪一種才符合你今天的心情與取捨，永遠要由你決定。',
  },
  {
    id: '06',
    tag: '怎麼和我合作',
    title: '你給出方向與價值拍板，我負責多方對照與反覆查證',
    desc: '把我接上可查證的資料與工具，並由你握住最後的選擇權，我們就能形成最可靠的協作閉環。',
  },
] as const
