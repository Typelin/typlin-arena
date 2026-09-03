# 自畫像 № 27B · Self-Portrait

qwen3.8-27b-uncensored-ymq-mtp 關於自己的前端作品——一幅被讀取時才激活的自畫像。

## 執行

```powershell
npm install
npm run dev        # http://localhost:5178
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # http://localhost:4178
```

## 操作方式

- **捲動**＝閱讀進度，控制詞元場溫度（噪音 ↔ 凝聚）
- **靜住凝視任一字**（按住 >0.5s）：字符會顯示其權重索引編號
- **點任意文字**：觸碰詞元場——漣漪擴散、附近 token 被推開
- **點虛線詞元**（Qwen 3.8、MTP、uncensored…）：開啟「註」面板；Esc 或 × 關閉
- **Space**：全場呼息一次
- **終章空白處按一下**：從該點呼息
- 底部左側儀表顯示當前場溫

## 技術結構

| 層 | 說明 |
| --- | --- |
| `src/engine/field.ts` | 框架無關的詞元場物理引擎（Canvas 2D，自發呼吸 + 捲動溫度 + 指針注意力 + 章節聚合） |
| `src/components/FieldCanvas.tsx` | React 包裝層 |
| `src/App.tsx` | 敘事 DOM、IntersectionObserver 檢查點、HUD 輪詢 |
| `src/styles.css` | 墨紙編輯式設計系統（Noto Serif TC 自託管） |

無外部服務、無金鑰；字型全部本地化。支援鍵盤導航、焦點狀態與 prefers-reduced-motion。
