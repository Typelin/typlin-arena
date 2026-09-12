# 第一版創意總監審查

## 1. 概念是否貫穿
**7.5/10。**「校樣機」已影響紙張材質、紅色校樣印、三種壓力控制、候選路徑與定稿文案；不是只掛在標題上。但第一版的 Canvas 只存在於一個普通段落，離開裝置後，後續章節的「發散／施壓／承諾／修訂」變回文字說明，概念沒有持續佔據視覺中心。

## 2. 是否有模板感
**8.5/10。** 沒有卡片牆、霓虹、粒子、玻璃擬態或 SaaS hero；視覺語言相對獨立。弱點是後半段四章列表仍稍像 editorial section list，和核心裝置的因果關係不夠緊。

## 3. 是否有無意義動效
**8/10。** 主動畫有因果，Canvas 路徑受壓力與進度控制。章節 active 時的小幅 translateX 是唯一接近「裝飾性 reveal」的部分，沒有必要，應刪除。

## 4. 首屏是否有記憶點
**8/10。** 巨型「我把可能性壓成承諾」與紅色 PROOF 圓印辨識度高；但首屏的圓印是靜態，而真正有生命的裝置在下一屏，兩者稍微分裂。

## 5. 信息是否易懂
**9/10。** 訪客能很快理解三個壓力與目前校樣句的關係。核心操作不用說明書。

## 6. 移動端與可訪問性
**待驗證。** 有 focus-visible、range label、鍵盤 R/Esc、reduced-motion，但需實測 390/768 與 sticky/高度。

## 7. 性能是否合理
**9/10。** Canvas 2D、DPR 上限 2、無外部 API、無重型圖形庫。需確認 resize/RAF 在頁面不可見時的成本是否合理。

# 第二輪實質重構決策
1. **把核心裝置變成 300vh 的 sticky 長時序場景**：從發散到承諾始終在視野內，符合「開始—發展—轉折—收束」。
2. **改用裝置局部 scroll progress**：Canvas 的狀態只由這場體驗的時間軸控制，不被頁尾長度污染。
3. **加入 phase rail**：讓訪客知道同一裝置正在進入哪一個認知階段，而非切成四個普通區塊。
4. **刪除 chapter translate 動效**：後續章節改成靜態校樣註記，避免不必要動畫。
5. **手機保留同一長時序，但重排機器比例**：Canvas 與控制區縮進單一 viewport 內，避免把桌機版簡單堆疊成超長面板。

## PROOF 02 · Motion 動效重構

評審回饋指出中段向下捲動會閃爍、動效狀態切換感過重。檢查後確認第一版把 scroll progress 放在 React state，導致每個 scroll frame 重新 render；LoomCanvas 又把 progress 放在 effect dependency，因此 RAF、ResizeObserver 與 canvas buffer 會反覆 teardown/recreate，這是主要閃爍來源。

### 實質修改

- 引入 Motion，使用 `useScroll` 將核心裝置進度綁定 scroll timeline。
- 使用 `useSpring`（175 / 32 / .28）做短行程、快速收束的機械阻尼，不做果凍式跟手。
- 使用 `useTransform` 驅動進度尺、階段 caption、壓印帶與 proof axis，DOM 直接吃 MotionValue，不經 React 每幀重繪。
- LoomCanvas 改為在 RAF 內直接 `progress.get()`；scroll 不再重啟 Canvas effect。
- weights / revision / reduced-motion 改以 ref 提供 Canvas 最新狀態，拖 slider 也不重建 RAF。
- ResizeObserver 只有在真實 backing-buffer pixel 尺寸改變時才重設 canvas，避免 sticky sub-pixel resize 清空畫布。
- 四階段由硬切 class 改為同一條連續編舞：發散 → 壓力帶進場 → 路徑收束 → 壓板承諾 → proof ghost 修訂。
- `prefers-reduced-motion` 下取消裝飾性位移與 sweep，保留必要的狀態理解。

### 壓力驗證

390×844、768×1024、1366×768、1920×1080 的連續捲動測試皆得到：

- horizontal overflow: 0
- blank canvas frame: 0
- canvas backing-buffer resize during scroll: 0
- sticky stage drift: 0 px
- browser page error: 0

`R` / `Esc` 隱藏修訂層與 production build 亦通過。
