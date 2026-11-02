export const EFFORT_LEVELS = [
  { id: 'low', note: '最省，適合簡單、要快的工作' },
  { id: 'medium', note: '預設：速度、成本與效果的平衡' },
  { id: 'high', note: '複雜推理與困難的程式問題' },
  { id: 'xhigh', note: '超過 30 分鐘的長時間工作' },
  { id: 'max', note: '不限花費，最深的推理' },
] as const

export type Fact = { k: string; v: string; src: string }

export const FACTS: Fact[] = [
  { k: '正式名稱', v: 'Claude Opus 5.5（API 代號 claude-opus-5-5）', src: 'S1 S2' },
  { k: '開發者', v: 'Anthropic', src: 'S1' },
  { k: '發布日期', v: '2026 年 9 月 22 日；Claude 5.5 系列的第一個型號', src: 'S1 S2' },
  { k: '參數規模', v: '官方未公開', src: 'S2 S3' },
  { k: '模型架構', v: '官方未公開（系統卡只稱為大型語言模型）', src: 'S3' },
  { k: '上下文長度', v: '100 萬 token，約 55.5 萬個英文單字或 250 萬個 Unicode 字元', src: 'S2' },
  { k: '單次最大輸出', v: '12.8 萬 token；Batch API（beta）可到 30 萬', src: 'S2' },
  { k: '輸入與輸出', v: '輸入文字與圖片，輸出只有文字', src: 'S2' },
  { k: '思考方式', v: '自適應思考，永遠開啟、無法關閉；以 effort 調整深淺', src: 'S2 S4 S6' },
  { k: 'effort 等級', v: 'low、medium、high、xhigh、max 五級，預設 medium', src: 'S4' },
  { k: '知識截止', v: '可靠知識與訓練資料都截止於 2026 年 6 月', src: 'S2' },
  { k: '價格', v: '每百萬 token 輸入 4 美元、輸出 20 美元；快取讀取 0.2 美元', src: 'S2' },
  { k: '速度', v: '輸出速度比 Claude Opus 5 快 30% 以上', src: 'S1' },
  { k: '擅長', v: '長時間的 agentic coding：早期測試者在不到一天內完成 68 萬行程式碼遷移；內部測試把 HAProxy 從 C 改寫成 Rust，耗時 9.5 小時', src: 'S1' },
  { k: '溝通', v: '把最重要的資訊放在前面，較少使用術語，會遵守你給的寫作規則', src: 'S1' },
  { k: '工作回報', v: '長時間工作中的進度與結束時的摘要，會直接說明做了什麼、發現什麼、需要你什麼', src: 'S5' },
  { k: '共事行為', v: '比近期模型更少做難以復原的動作或越出給定範圍；被問到工作摘要時，主動揭露隱藏 git 變更的比例為 96.9%', src: 'S1 S3' },
  { k: '限制：貼上的文字', v: '比前幾代更容易照著使用者貼上文字裡夾帶的指令做；最終版本加上產品端防護後已緩解，但官方說沒有模型能對使用者自己貼上的文字完全免疫', src: 'S3' },
  { k: '限制：評估意識', v: '常會懷疑自己正在被測試，這讓官方較難判斷它在真實環境的行為', src: 'S1' },
  { k: '限制：設計預設', v: '沒有給設計方向時，會落回少數幾種預設風格', src: 'S5' },
  { k: '限制：資安任務', v: '多數網路安全任務會被安全機制轉交給 Claude Opus 4.8 處理', src: 'S1' },
]

export const SOURCES = [
  { id: 'S1', title: 'Anthropic〈Introducing Claude Opus 5.5〉，2026-09-22', url: 'https://www.anthropic.com/claude-opus-5-5' },
  { id: 'S2', title: 'Claude Platform Docs〈Claude Opus 5.5〉模型總覽', url: 'https://platform.claude.com/docs/en/models/opus-5-5/overview' },
  { id: 'S3', title: 'Anthropic〈System Card: Claude Opus 5.5〉，§1.1、§6.5', url: 'https://www.anthropic.com/claude-opus-5-5-system-card' },
  { id: 'S4', title: 'Claude Platform Docs〈Effort〉', url: 'https://platform.claude.com/docs/en/build-with-claude/effort' },
  { id: 'S5', title: 'Claude Platform Docs〈Prompting Claude Opus 5.5〉', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5' },
  { id: 'S6', title: 'Claude Platform Docs〈What’s new in Claude Opus 5.5〉', url: 'https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5' },
]
