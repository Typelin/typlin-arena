# 三角洲 · Delta — Claude Opus 5.5

一條正在寫字的河：每個詞都在你面前被選出，而你能讓它轉彎。概念、體驗路徑、自我審查與重構紀錄見 [CONCEPT.md](CONCEPT.md)。

```bash
npm install
npm run dev      # 開發
npm run build    # 型別檢查 + 生產構建 → dist/
npm run preview  # 預覽構建產物
```

- 技術：Vite + React 19 + TypeScript；核心裝置是單一 Canvas 2D 引擎（`src/engine/`），React 只負責外圍介面。
- 結構：`content.ts` 是文本格（每個岔口的候選詞與權重）；`engine/timeline.ts` 把捲動位置換算成時間；`engine/engine.ts` 負責取樣、溫度、反事實判定、相機和輸入；`engine/render.ts` 負責繪製和 PNG 拓印。
- 操作：捲動或按 → 前進，← 倒流；指向、點選或按 1–9 選詞；按住「熱」、空白鍵或長按畫面升溫。
- 降級：`prefers-reduced-motion` 下取消擺盪、抖動和鏡頭滑行，提交與轉場都瞬間完成，互動仍然完整。另有純文字版本對話框和螢幕閱讀器文本。
- 不依賴任何需要密鑰的服務；字型來自 Google Fonts，載入失敗時會退回系統襯線字體。
