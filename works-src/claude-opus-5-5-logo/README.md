# 咲夢信息科技工作室 · 落地站

基於 `benchmark-assets/logo-landing/logo.png`（原圖複製到 `src/assets/logo.png`，未修改）製作的品牌落地站。

## 執行

```bash
npm install
npm run dev       # 開發
npm run build     # tsc 型別檢查 + vite 生產構建，輸出 dist/
npm run preview   # 預覽生產構建
```

## 技術

- Vite 8 + React 19 + TypeScript（strict）
- Canvas 2D：全屏櫻花瓣場（`src/petals.ts`），預渲染花瓣精靈，指標風場、滾動上揚、定點爆發
- SVG：程式碼開花樹、月相、標誌軌道、夜空星座
- Web Animations API：許願花瓣飛行軌跡
- 無第三方執行時依賴

## 結構

| 區塊 | 元件 | 內容 |
|---|---|---|
| 首屏 | `Hero.tsx` | 原始標誌 + 軌道環 + 3D 傾斜；點選標誌從花心放出花瓣 |
| 01 名字 | `Name.tsx` | 咲 / 夢 雙字卡，描邊字隨滾動填色，懸停散花 |
| 02 用程式碼開花 | `CodeBloom.tsx` | 粘性滾動：樹幹生長，程式碼逐行執行，每行枝頭開花 |
| 03 服務 | `Services.tsx` | 四項服務卡，圖示取自標誌元素（`</>`、雲、月、星） |
| 04 合作方式 | `Phases.tsx` | 新月→滿月四個階段，進入視口時月相同步漸盈 |
| 05 許一個夢 | `Wish.tsx` | 夜空切換；輸入的願望化作花瓣飛上夜空成為星星（僅存於本機 localStorage） |
| 頁尾 | `Chrome.tsx` | 導航（標誌裁切徽記）與頁尾 |

## 可訪問性與降級

- `prefers-reduced-motion`：花瓣場靜止、程式碼樹直接全開、月相直接到位、許願不播飛行動畫
- 語義化標題結構、跳轉連結、按鈕/星星均可鍵盤聚焦，`aria-live` 播報階段與許願結果
- 花瓣畫布 DPR 上限 2、頁面隱藏時暫停；手機端花瓣數量減半
