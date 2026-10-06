# 咲梦信息科技工作室 · Landing（mimo-v2.6-flash-logo）

以官方 LOGO（`benchmark-assets/logo-landing/logo.png`，已複製一份至 `public/logo.png`，
原始檔案未修改）為核心視覺的獨立落地站。

## 啟動

```bash
npm install
npm run dev      # http://localhost:5178
npm run build    # production build → dist/
npm run preview  # http://localhost:4178
```

## 技術

- Vite + React 19 + TypeScript
- 純 CSS（無 UI 框架），視覺語言取自 LOGO 的「櫻粉 × 靛藍 × 紙白」
- Canvas 2D 花瓣飄落背景（含 `prefers-reduced-motion` 降級）
- IntersectionObserver 捲動進場與 section 偵測

## 區塊

Hero（LOGO＋品牌宣言＋跑馬燈）→ 理念（咲/夢/码 三卡）→ 匠藝（清單＋心願編譯器互動）
→ 作品（分類篩選）→ 工序（四步）→ 聯絡 → Footer。
