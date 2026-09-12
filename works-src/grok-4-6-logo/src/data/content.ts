export const NAV = [
  { href: '#name', label: '名' },
  { href: '#craft', label: '工' },
  { href: '#season', label: '期' },
  { href: '#works', label: '谱' },
  { href: '#compile', label: '译' },
  { href: '#letter', label: '信' },
] as const

export const HERO = {
  koan: '花期很短。我们把工期也写短。',
  aside: '月洞门 · 推门即春',
  ctaEnter: '推门看看',
  ctaWrite: '写一封信',
}

export const NAME = {
  kicker: '名',
  title: '两个字，一道接缝。',
  lead: '标志画了一道圆。圆的左边是花，右边是代码。我们住在中间那条缝里。',
  bloom: {
    glyph: '咲',
    ruby: 'さく · 开',
    body: '日语「咲く」：花自己打开。口字旁，不是人手把它掰开。界面也该这样——手指一靠近，它自己开。',
  },
  dream: {
    glyph: '梦',
    ruby: 'ゆめ · 尚未落地',
    body: '还没有类型的形状。很多人把梦挂在墙上；我们把它放进仓库，让它长出版本号。粉的那边负责开，蓝的那边负责别崩溃。',
  },
  koans: {
    bloom: '开得太满，就没有明天。',
    dream: '梦如果不落地，只是云。',
    seam: '刚好。花和代码在这里握手。',
  },
}

export const CRAFT = {
  kicker: '工',
  title: '四件事。多了不接。',
  lead: '不是服务清单。是我们愿意反复磨的四块石头。',
  items: [
    {
      id: 'ui',
      mark: '</>',
      title: '界面 · 让路记得脚',
      body: '不是「做个网站」。是让人第二次来时，不必再问路。按钮有重量，空态有礼貌，错误像人说话。',
    },
    {
      id: 'sys',
      mark: '{ }',
      title: '系统 · 让规则站出来',
      body: '后台不是抽屉。抽屉会吞东西。我们把规则摆上桌面：谁能改、何时改、改坏了怎么回。',
    },
    {
      id: 'tool',
      mark: '=>',
      title: '工具 · 让重复的事死掉',
      body: '如果你每周要点同一百次，那是花还没开。脚本、整理、把表格从世界上藏起来。',
    },
    {
      id: 'word',
      mark: '〃',
      title: '字 · 让句子有骨头',
      body: '软件里的字不是装饰。命名、空状态、那句「确定要删吗」——我们当正文写。',
    },
  ],
}

export const SEASON = {
  kicker: '期',
  title: '花期是工期。',
  lead: '樱花不延期。软件也不该靠「再加一周」活着。我们按四候做事，候过即收。',
  stages: [
    {
      id: 'bud',
      name: '含蕾',
      en: 'BUD',
      days: '三日',
      body: '只问：这朵花该不该开。不该开的，我们会说。这三天不出方案书，出判断。',
    },
    {
      id: 'open',
      name: '初开',
      en: 'OPEN',
      days: '七日',
      body: '给你能点、能骂、能改的东西。先活，再好看。方案可以后补，按钮不能后补。',
    },
    {
      id: 'full',
      name: '盛放',
      en: 'FULL',
      days: '满开',
      body: '把边角开完。空态、错态、加载、半夜三点那次刷新。盛放不是加功能，是把已有的开满。',
    },
    {
      id: 'fall',
      name: '花散',
      en: 'FALL',
      days: '交工',
      body: '教你浇水，交出钥匙，扫地出门。花期不续。维护另算，事先说清。谢幕是礼貌，不是失败。',
    },
  ],
}

export const WORKS = {
  kicker: '谱',
  title: '三件按时谢幕的事。',
  lead: '不放 Logo 墙。花谢了，路还在。',
  items: [
    {
      no: '01',
      title: '准时的药局',
      line: '把墙上的叫号，请回口袋里。',
      tags: ['界面', '系统'],
    },
    {
      no: '02',
      title: '夜览',
      line: '一家小博物馆，闭馆后仍有路灯。',
      tags: ['界面', '字'],
    },
    {
      no: '03',
      title: '三次就好',
      line: '把一张活不完的表格，收成三次点击。',
      tags: ['工具'],
    },
  ],
}

export const COMPILE = {
  kicker: '译',
  title: '把一句愿望交给花期。',
  lead: '不是控制台。是一张花笺：你写下要做成的事，我们把它排成可开的形状。',
  placeholder: '写下一件想做成的事',
  action: '开花',
  chips: ['准时的官网', '会呼吸的按钮', '把表格藏起来', '让报错像人说话'],
  emits: [
    '开在七日之内，谢在夸完之前。',
    '先给能点的，再给能看的。',
    '少一片花瓣，多一口气。',
    '类型过了，春天才能合并。',
    '把「以后再说」从需求里删掉。',
    '路要记得脚，按钮要记得手。',
    '盛放不是加功能，是把已有的开满。',
    '花期不可 += 1。',
  ],
}

export const LETTER = {
  kicker: '信',
  title: '一封信，一枚章。',
  lead: '不设漏斗。你写信，我们盖章。章没按下，信就不算出门。',
  honorific: '咲梦信息科技工作室 台启',
  fields: {
    name: '来信人',
    about: '想开的那件事',
    body: '正文',
  },
  placeholders: {
    name: '怎么称呼',
    about: '一句话就好',
    body: '不必客套。写约束、写预算、写你讨厌的那种软件。',
  },
  stampHint: '请将印章按于此',
  stampAction: '蘸墨盖章',
  send: '投出此信',
  needStamp: '章还没按下。',
  needWords: '信还是白的。',
  email: 'hello@sakimu.tech',
}

export const FOOTER = {
  studio: '咲梦信息科技工作室',
  en: 'SAKIMU TECH STUDIO',
  tag: '用代码创造美好未来',
  colophon: '本页以原标志为月洞门。黑被拿掉，花园从圆里过来。',
}
