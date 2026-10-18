export const services = [
  {
    id: "web",
    number: "01",
    label: "網站體驗",
    en: "WEB EXPERIENCES",
    title: "第一眼動心，每一步順心。",
    description:
      "從品牌的個性出發，把內容、互動與開發織成完整體驗。桌面到手機，都有自己的好比例。",
    tags: ["品牌官網", "互動網站", "活動與內容平台"],
    short: "讓品牌被看見，也被記住。",
    word: "Web",
    color: "#dce7f0",
  },
  {
    id: "tools",
    number: "02",
    label: "數位工具",
    en: "DIGITAL TOOLS",
    title: "讓複雜的事，輕一點。",
    description:
      "把每天重複的流程，變成直覺的操作。從資訊架構到介面開發，讓工具真正適合使用它的人。",
    tags: ["管理介面", "流程工具", "產品原型"],
    short: "讓順手的工具，留住專注。",
    word: "Tools",
    color: "#e5e9da",
  },
  {
    id: "brand",
    number: "03",
    label: "品牌設計",
    en: "BRAND EXPRESSION",
    title: "找到你的聲音，也找到樣子。",
    description:
      "釐清品牌想說的話，建立可以一路延伸的視覺語言。讓每個接觸點，都像同一個人說話。",
    tags: ["視覺方向", "數位識別", "設計系統"],
    short: "讓每個細節，都說同一種語言。",
    word: "Brand",
    color: "#f3dfdf",
  },
];

export const projects = [
  {
    id: "mori",
    name: "森序 MORI",
    category: "品牌網站",
    kind: "web",
    year: "CONCEPT / 01",
    subtitle: "把日常的留白，留給真正喜歡的事。",
    description:
      "以植物與生活選物為題的品牌網站概念。溫潤的字體、安靜的色彩與清楚的購物路徑，讓內容與商品一起呼吸。",
    scope: ["視覺方向", "網站設計", "響應式開發"],
    theme: "mori",
    headline: "讓日常，慢一點。",
    note: "LIVING WITH A LITTLE MORE GREEN.",
  },
  {
    id: "flow",
    name: "合流 FLOW",
    category: "數位工具",
    kind: "tools",
    year: "CONCEPT / 02",
    subtitle: "讓協作有方向，讓每一天有餘裕。",
    description:
      "把分散的待辦與團隊進度，整理成一張容易掌握的工作桌。資訊的優先次序，比多一個功能更重要。",
    scope: ["使用流程", "介面系統", "互動原型"],
    theme: "flow",
    headline: "今天，一起往前。",
    note: "A QUIETER WAY TO WORK TOGETHER.",
  },
  {
    id: "sora",
    name: "空途 SORA",
    category: "品牌網站",
    kind: "web",
    year: "CONCEPT / 03",
    subtitle: "為還沒去過的地方，留一個入口。",
    description:
      "以慢旅行為題的內容網站概念。用路線、故事與輕巧的互動，讓規劃行程也成為旅行的一部分。",
    scope: ["內容策略", "互動設計", "網站開發"],
    theme: "sora",
    headline: "下一站，不必太趕。",
    note: "TAKE THE SCENIC ROUTE.",
  },
];
export type Project = (typeof projects)[number];

export const questions = [
  {
    q: "只有一個模糊的想法，也可以開始嗎？",
    a: "可以。先把你想解決的事、希望帶來的改變，以及目前手上的內容寫下來就好。下方的需求卡會幫你把第一輪討論需要的線索整理在一起。",
  },
  {
    q: "可以只做設計，或只協助開發嗎？",
    a: "可以從適合目前階段的範圍開始：視覺方向、介面設計、互動原型，或既有設計的前端實作。先釐清交付內容與合作界線，再決定工作方式。",
  },
  {
    q: "一個網站需要多久完成？",
    a: "時間取決於頁面數、互動複雜度、素材準備與回饋節奏。簡單的品牌網站與有完整資料流程的工具，所需時間不同；需求確認後才適合排出可執行的時程。",
  },
  {
    q: "這裡的作品與需求卡可以怎麼使用？",
    a: "作品區是為這份品牌網站設計的概念展示。需求卡會在你的瀏覽器中整理成可下載的文字檔，方便你保存或分享；本站不會替你寄出，也不會收集表單內容。",
  },
];
