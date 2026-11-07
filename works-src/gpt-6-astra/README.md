# GPT-6 Astra — 文字可以走得更遠

## Task Goal

在獨立資料夾交付可直接執行的模型自我介紹：首屏辨識 GPT-6 Astra 與 OpenAI，透過材料、上下文、合作、成績與邊界的可操作場景認識模型。每個互動必須改變畫面與可讀內容；完成桌面、手機與高潮截圖審查，實質重做最弱部分，再通過正式建置與部署路徑驗證。

作品路徑：`D:/Antigravity_proj/projects/personal-web/typlin-arena/works-src/gpt-6-astra/`。

## 執行

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5186
npm run build
npm run verify
```

正式輸出在 `dist/`，Vite base 為 `./`。verify 使用已安裝的 Microsoft Edge，以正式 dist 在 `/works/gpt-6-astra/` 測試；測試伺服器只綁定 loopback，測完關閉。頁面沒有音訊、外部字型 CDN 或需要金鑰的服務。

## 每章標題與第一句

| 章節 | 標題 | 第一句 |
|---|---|---|
| 01 | GPT-6 Astra | 我讀文字，也讀圖片。 |
| 02 | 放得下很多，仍要找到重點。 | 我能在一次請求中接收長篇材料，但容量大，不代表每個細節都會答對。 |
| 03 | 你給的條件，會改變我的答案。 | 給我目標、材料與驗收條件，我能把抽象要求逐步做成可檢查的結果。 |
| 04 | 同樣的分數，不同的代價。 | 我在當日榜單排第五。 |
| 05 | 我能讀什麼，也有邊界。 | 文字與圖片可輸入；音訊與影片，原生不支援。 |
| 06 | 把依據留給你。 | 規格、成績與限制，都能回到原始來源。 |

## 事實與出處對照

完整規格、AA 子項、專業指數、官方評測、對手比較、版本缺項與來源都在 [README-evidence.md](./README-evidence.md)，也完整列在頁面最後一章。原始事實查詢日保留為 **2026-11-04**；本次設計研究為 **2026-11-06**，實作驗證為 **2026-11-07**，沒有把重建日期冒充重新查詢日期。

| 作品主畫面使用的事實 | 版本／模型設定 | 查詢日期 | 出處 |
|---|---|---|---|
| GPT-6 Astra，OpenAI；文字／圖片輸入 | GPT-6 Astra API 規格，非評測版本 | 2026-11-04 | [OpenAI 模型文件](https://developers.openai.com/api/docs/models/gpt-6-astra) |
| 上下文 1,050,000 tokens；原生音訊、影片與微調不支援 | GPT-6 Astra API 規格，非評測版本 | 2026-11-04 | [OpenAI 模型文件](https://developers.openai.com/api/docs/models/gpt-6-astra) |
| Intelligence Index 57；排名 5／62 | AA v5.0.1；GPT-6 Astra (max) | 2026-11-04 | [AA 排行榜](https://artificialanalysis.ai/leaderboards/models) |
| Terminal-Bench 59.1% | 4.0；GPT-6 Astra (max)；AA 測量 | 2026-11-04 | [AA 詳細比較頁](https://artificialanalysis.ai/models/releases/comparisons/gpt-6-luna-vs-gpt-6-astra) |
| Terminal-Bench-Science 63.3% | 0.1；GPT-6 Astra (max)；AA 測量 | 2026-11-04 | 同上 |
| AA-Briefcase 1569 Elo | v1.1；GPT-6 Astra (max)；AA 測量 | 2026-11-04 | 同上 |

| 榜單位置／完整設定 | Intelligence Index | 每任務成本 USD | 每任務時間 | 共同版本／查詢日 |
|---|---:|---:|---:|---|
| 前一名 #4：Claude Opus 5.5 (xhigh with fallback) | 57 | 6.05 | 16.1 分鐘 | AA v5.0.1／2026-11-04 |
| 本作品 #5：GPT-6 Astra (max) | 57 | 6.24 | 18.2 分鐘 | AA v5.0.1／2026-11-04 |
| 後一名 #6：GPT-6 Astra (xhigh) | 55 | 3.66 | 9.1 分鐘 | AA v5.0.1／2026-11-04 |
| 同開發者 #8：GPT-6.1 Sol (max) | 55 | 1.27 | 20.1 分鐘 | AA v5.0.1／2026-11-04 |

以上比較取自 [AA 當日榜單](https://artificialanalysis.ai/leaderboards/models)。成本與時間是榜單的每任務量測，不是 API 單價；指數分數也不是答對百分比。官方結果與未查到獨立版本的專業指數另外分組，沒有拿不完整資料冒充完整查證。

## 研究與實質重做

先停止實作，實際開啟、觀察並操作五個創意網站，再讀 GitHub 源檔。這是依敘事、運鏡、互動選出的五個研究案例，不是客觀全球排名。研究用分頁已全部關閉。

| 網站 | 官方依據 | 借鑑的原則 |
|---|---|---|
| [Lusion](https://lusion.co/) | [Lusion v3，Awwwards 2023-10-02](https://www.awwwards.com/sites/lusion-v3) | 主體與材質持續跨場景，操作有可追蹤的結果。 |
| [Igloo Inc](https://www.igloo.inc/) | [Awwwards 2024-07-23](https://www.awwwards.com/sites/igloo-inc)；[作者案例](https://www.awwwards.com/igloo-inc-case-study.html) | 先安排鏡頭與互動，再做表面；同世界仍需不同輪廓。 |
| [Unseen Studio](https://unseen.co/) | [CSSDA WOTD 2023-01-13／WOTM](https://www.cssdesignawards.com/sites/unseen-studio/42663) | 空間要有前中後景；進入閱讀狀態時保持視覺連續性。 |
| [Active Theory](https://activetheory.net/) | [V6，CSSDA 2024-02-13](https://www.cssdesignawards.com/sites/active-theory-v6/45015/) | 同一批內容在整體與局部間切換尺度。 |
| [Bruno Simon](https://bruno-simon.com/) | [新版，Awwwards 2026-01-21](https://www.awwwards.com/sites/brunos-portfolio) | 互動本身證明能力，不只用文字宣稱。 |

GitHub 實讀：[Impeccable 的 bolder](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/bolder.md)、[ui-skills 的同路徑進出示範](https://github.com/ibelick/ui-skills/blob/main/src/ui/playbook/same-path-motion-demo.tsx)、[Bruno 舊版 Camera.js](https://github.com/brunosimon/folio-2019/blob/master/src/javascript/Camera.js)、[Drei MotionPathControls](https://github.com/pmndrs/drei/blob/master/src/core/MotionPathControls.tsx)。借用焦點、路徑和回應分離的原則，沒有搬用攔截 touchmove 的實作。

本次重做包含：

- 首屏改為 GPT 立體文字、資料材料與可切換輸入；手機採獨立的模型名稱、主句和完整主體構圖。
- 上下文章由遮擋文字的重複卡片，改為具體活動需求的多層閱讀場域、縮放控制和固定可讀的線索面板。
- 合作章由抽象線束，改為同一個活動頁從目標、材料到驗收的連續示範；額滿停用和信箱檢查可實際操作。
- 成績章取消分離的大數字與小圖表，讓四模型共用全寬、同零點的比較舞台；切換成績、成本、時間時資料帶重新伸展。
- 限制章由斷環／細線流程，改為有截面的接收面；支援的材料通過，非支援材料停下，手機改用縱向路徑。

第一輪新版截圖為 `qa/screenshots/portrait-v1-*`；實際檢視首屏、高潮、手機後，完成以上後續重排。最終圖為 `qa/screenshots/final-*`。

## 驗證證據

- `npm run build`：TypeScript 與 Vite production build 通過。
- `npm run verify`：正式部署前綴、1440×900、390×844、768×1024，檢查畫面寬度、標題與控制項邊界、字型、內部連結、主控台與 HTTP 錯誤。
- 互動涵蓋材料切換、上下文縮放與線索、合作階段／信箱驗證／額滿停用、三種比較指標、四種模態邊界。
- reduced-motion 保留完整操作與文字，WebGL 畫面停止持續運動；另驗證無 WebGL 的備援。
- 結果：`qa/screenshots/final-results.json`。首屏：`final-desktop.png`；高潮：`final-scores.png`；手機：`final-mobile.png`。

## 假設與無法消除的限制

- 依使用者指定，以 GPT-6 Astra 作為作品主題；公開資料不能反向證明此對話執行個體的底層模型路由。頁面與事實文件均保留此註記。
- 活動、名額與輸入材料是固定示範。網頁不呼叫模型、不重新跑評測，也不提交或保存表單資料。
- 依後續「內容太少」的修正，核心章節增加可操作例子與必要解釋；完整數據仍集中最後一章。
- 英數字型隨作品提供；中文明確使用 PingFang TC／Microsoft JhengHei。三維字型授權在 `public/font-licenses/Helvetiker.txt`。
- 沒有已知未修復的實作問題；評測的版本缺項與底層路由不可驗證，是資料限制，已逐項揭露。
