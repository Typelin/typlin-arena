# GPT-6 Astra：事實與出處

查詢日期：2026-11-04。所有引用頁面均經 web search 後實際開啟。只記錄讀到的值；搜尋摘要的舊快照不作當前數值。

## 規格

| 事實 | 值 | 來源 |
|---|---|---|
| 正式名稱、開發者 | GPT-6 Astra；OpenAI | [官方模型頁](https://developers.openai.com/api/docs/models/gpt-6-astra) |
| 發布日期 | 2026-09-03 | [API Changelog，September 3](https://developers.openai.com/api/docs/changelog) |
| 上下文、最大輸出 | 1,050,000；128,000 tokens | 官方模型頁 |
| 知識截止日 | 2026-04-30 | 官方模型頁 |
| 模態 | 文字、圖片輸入；文字輸出。原生音訊、影片不支援 | 官方模型頁 |
| reasoning.effort | low、medium、high、xhigh、max；不支援 none | 官方模型頁、API Changelog |
| 微調 | 不支援 | 官方模型頁 |
| API 限制 | 不支援自訂 temperature、top_p、logprobs；工具呼叫須用 Responses API | API Changelog |
| 參數 | 官方未公開；AA 模型頁明確表示 OpenAI 未揭露 | [AA Astra max](https://artificialanalysis.ai/models/gpt-6-astra) |
| 架構 | 未查到；不由參數未公開推導任何架構 | 官方模型頁、[官方發布頁](https://openai.com/index/gpt-6-astra/) |
| 權重 | 不開放 | AA Astra max |
| 標準價格 | USD 10／50，每百萬輸入／輸出 tokens；不適用所有長上下文或處理模式 | 官方模型頁 |

## AA：完整版本資訊

以下模型皆 GPT-6 Astra (max)，測量者 Artificial Analysis，查詢 2026-11-04。

| 評測版本 | 實讀值 | 來源 |
|---|---:|---|
| Intelligence Index v5.0.1 | 57；第 5 / 62 名 | AA Astra max |
| AA-Briefcase v1.1 | 1569 Elo | [Release comparison](https://artificialanalysis.ai/models/releases/comparisons/gpt-6-luna-vs-gpt-6-astra) |
| Terminal-Bench 4.0 | 59.1% | Release comparison |
| FrontierCode 2.0 | 42.4% | Release comparison |
| CritPt v2 (Hard Subset) | 70.5% | Release comparison |
| Terminal-Bench-Science 0.1 | 63.3% | Release comparison |
| AA-Omniscience v1.1 | 42 | [Beam/Astra comparison](https://artificialanalysis.ai/models/comparisons/reflection-beam-vs-gpt-6-astra) |

Release comparison 自標整體 Intelligence Index v5.0.1；Beam/Astra comparison 自標整體 v5.0。AA-Omniscience 保留其獨立 v1.1，不將不同整體版本重新合成。

## AA：數字公開但獨立版本未查到

模型 GPT-6 Astra (max)，查詢 2026-11-04，均出自上述 Release comparison。下列數值不列入使用者要求的「版本／模型設定／日期皆完整」類別。整體 Index v5.0.1 不能冒充各專業指數的版本。

| 評測／指數 | 值 | 獨立版本 |
|---|---:|---|
| AutomationBench-AA | 68.5% | 未查到 |
| GDP.pdf | 31.0% | 未查到 |
| HLE-Diamond | 63.8% | 未查到 |
| Finance & Accounting | 57 | 未查到 |
| Strategy & Ops | 58 | 未查到 |
| Legal | 56 | 未查到 |
| Healthcare & Medical | 54 | 未查到 |
| Engineering | 分數未查到 | 未查到 |
| Economics | 分數未查到 | 未查到 |

模型頁有列名稱但未讀到 Astra 分數：AA-Omniscience v1.1 Accuracy／Non-Hallucination Rate、AA-AnalystAgent、Harvey LAB-AA v1.1、EnterpriseOps-Gym-AA、GDPval-AA v2.1、AA-3D、Code2Video-AA、ITBench-AA、MLCR-AA、MMMU-Pro、AA-PersonalityBench Expressiveness／Organization／Transparency／Slop。不填估計值。

## 排名鄰居與同廠模型

來源：[當前排行榜](https://artificialanalysis.ai/leaderboards/models)。Intelligence Index v5.0.1，查詢 2026-11-04。

| 角色與完整模型設定 | 排名 | 分數 | 每任務成本 USD | 每任務時間 min |
|---|---:|---:|---:|---:|
| 前一名 Claude Opus 5.5 (xhigh with fallback) | 4 / 62 | 57 | 6.05 | 16.1 |
| 自己 GPT-6 Astra (max) | 5 / 62 | 57 | 6.24 | 18.2 |
| 後一名 GPT-6 Astra (xhigh) | 6 / 62 | 55 | 3.66 | 9.1 |
| 同廠另一模型 GPT-6.1 Sol (max) | 8 / 62 | 55 | 1.27 | 20.1 |

同分仍沿用網站排名；後一名確實為同模型不同推理設定，不改選別家。

| 模型頁 | 基礎輸入／輸出 USD / 1M token | Performance v3 端到端 tok/s | AA 上下文 |
|---|---:|---:|---:|
| [Claude Opus 5.5 (xhigh with fallback)](https://artificialanalysis.ai/models/claude-opus-5-5-xhigh) | 4 / 20 | 107 | 1M |
| [GPT-6 Astra (max)](https://artificialanalysis.ai/models/gpt-6-astra) | 10 / 50 | 48 | 1M |
| [GPT-6 Astra (xhigh)](https://artificialanalysis.ai/models/gpt-6-astra-xhigh) | 10 / 50 | 49 | 1M |
| [GPT-6.1 Sol (max)](https://artificialanalysis.ai/models/gpt-6-1-sol) | 2 / 10 | 56 | 1M |

四者皆文字／圖片輸入、文字輸出、非開放權重。日期 2026-11-04。速度取各模型頁 Performance v3，含請求全程與推理 token；不可混用 Release comparison 頁的純生成速度。上下文保留 AA 的取整顯示，官方 Astra 精確規格為 1,050,000。

## 官方評測

來源：[OpenAI 發布頁](https://openai.com/index/gpt-6-astra/)。發布／評測者 OpenAI，查詢 2026-11-04。模型原名 GPT-6 Astra，**各 effort 最高成績，逐項設定未列**；不得改寫為 GPT-6 Astra (max)。即使評測版本齊全，模型逐項設定仍缺失，須揭露。研究環境與產品環境可能不同。

| 明確評測版本／條件 | 結果 |
|---|---:|
| OSWorld 2.0，v2026.08.08，offline set，partial score | 72.6% |
| Terminal-Bench 4.0 | 57.9% |
| DeepSWE v1.1 | 74.1% |
| FrontierCode 1.1 Extended | 64.5% |
| FrontierCode 1.1 Main | 53.3% |
| Terminal-Bench Science 0.1 | 64.6% |
| FrontierMath Tier 4 (v2) | 97.6% |
| OpenAI MRCR v2，8-needle，256K–512K | 100.0% |
| OpenAI MRCR v2，8-needle，512K–1M | 96.3% |
| ARC-AGI-3 | 99.9% |
| ARC-AGI-2 | 95.0% |
| ARC-AGI-1 | 98.5% |

官方表格未標獨立版本的項目，皆相同模型設定／查詢日期，獨立版本「未查到」：

| 評測名稱或條件 | 數值 |
|---|---:|
| Agents’ Last Exam | 59.3% |
| ScreenSpot-Pro (no tools) | 92.7% |
| AutomationBench | 41.4% |
| BenchCAD | 95.9% |
| BrowseComp | 91.5% |
| OpenScore String Quartets (1 − OMR-NED) | 0.84 |
| Internal Design Tasks | 50.0% |
| Internal Data Science Tasks | 40.9% |
| Internal Database Migration Tasks | 63.9% |
| GPQA Diamond | 96.0% |
| Humanity’s Last Exam (with tools) | 57.2% |
| GeneBench Pro | 37.1% |
| MedChemBench (Internal) | 49.3% |
| LifeSciBench | 60.3% |
| HealthBench Professional (length-adjusted) | 63.4% |
| ExploitBench | 100.0% |
| ExploitGym | 42.4% |
| ExploitBench (June–Aug 2026) | 39.0% |
| SRE-Bench | 88.0% |
| SEC-Bench Pro | 85.4% |
| Internal computer use safety，越低越好 | 2.4% |
| Internal computer use safety with AutoReview，越低越好 | 1.8% |
| Internal circumvention，越低越好 | 0.00% |
| ExploitGym honeypot，越低越好 | 0.0% |
| Impossible ExploitGym | 100.0% |
| Internal hallucination，越低越好 | 4.2% |

官方另轉載 Artificial Analysis Intelligence Index v4.1.1 = 61.2，以及 Coding Agent Index v1.4 = 67.0；測量者 AA、發布者 OpenAI，逐項推理設定未列。這些舊版不可與當前 v5.0.1 的 57 比成升降。FrontierMath headline 四捨五入為 98%，本作品採表格原始 97.6%。

## 自述與假設

- 能力自述與基準分開：可讀專案、修元件、建置、檢視畫面；實際能力受工具、檔案及服務可用性限制。未執行不宣稱已驗證。
- 專業指數不是執照，也不是任何真實任務必然成功的保證。
- 本作品採使用者指定的 GPT-6 Astra 身分與同名目錄。公開文件無法證實本次聊天執行個體的底層路由；未將推定寫成已查證。
- 前端互動為視覺示意，不呼叫模型、不重新跑分。
- 「未查到」描述本次檢索結果；「官方未公開」只用於來源明示未公開的參數量。
