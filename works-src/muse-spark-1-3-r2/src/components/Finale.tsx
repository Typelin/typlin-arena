import { AA, META_SCORECARD } from '../data'
import { useRevealRoot } from '../hooks'
import './Finale.css'

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="fin-row">
      <dt>{k}</dt>
      <dd>{v}</dd>
    </div>
  )
}

export default function Finale() {
  const ref = useRevealRoot<HTMLElement>()
  return (
    <section className="finale" ref={ref} aria-label="全部事實">
      <div className="finale-inner">
        <p className="chapter-tag rv">Final Chapter — All Facts</p>
        <h2 className="chapter-title rv" style={{ '--rv-delay': '0.08s' } as React.CSSProperties}>
          全部的事實，在這裡
        </h2>
        <p className="chapter-lede rv" style={{ '--rv-delay': '0.16s' } as React.CSSProperties}>
          前面每一章的短句，證據都在這一章。數字都有出處、出處都有日期；
          查不到的，我就寫查不到。
        </p>

        <div className="fin-cols">
          <div className="fin-block rv">
            <h3 className="fin-block-title">基本資料（Meta 官方文件）</h3>
            <dl>
              <Row k="模型全名" v="Muse Spark 1.3" />
              <Row k="開發者" v="Meta" />
              <Row k="發布日期" v="2026 年 9 月 2 日（無官方發表文章，型號清單直接上線）" />
              <Row k="模型 ID" v="muse-spark-1.3 / muse-spark-1.3-contributor" />
              <Row k="取得方式" v="Meta Model API（api.meta.ai/v1）與 Meta 產品；權重不公開下載" />
              <Row k="參數規模" v="官方未公開" />
              <Row k="上下文" v="1,048,576 token（輸入與輸出共用額度）" />
              <Row k="輸入模態" v="文字、影像、影片、PDF、音訊*" />
              <Row k="輸出模態" v="文字" />
              <Row k="推理" v="永遠開啟；強度 minimal / low / medium（預設）/ high / xhigh，標準版另有 max" />
              <Row
                k="價格（每百萬 token）"
                v="標準版 $1.25 輸入 / $0.15 快取輸入 / $4.25 輸出；Contributor 版 $0.10 / $0.002 / $0.20"
              />
              <Row k="產品形態" v="Muse 個人代理：自有電腦、持久記憶、平行子代理、排程工作" />
            </dl>
            <p className="fin-footnote">
              * 音訊：Meta 官方註記 1.3 的音訊理解尚未完整支援、品質可能下降，建議改用 1.2
              或 Muse Voice Transcribe。Artificial Analysis 的收錄僅列文字／影像／影片輸入。
            </p>
          </div>

          <div className="fin-block rv" style={{ '--rv-delay': '0.1s' } as React.CSSProperties}>
            <h3 className="fin-block-title">
              Artificial Analysis（獨立評測 · 查詢日 2026-11-08）
            </h3>
            <dl>
              <Row k="收錄名稱" v={AA.listingName} />
              <Row
                k={`${AA.indexName} ${AA.indexVersion}`}
                v={`${AA.score} 分（共 ${AA.modelsEvaluated} 個模型受測；最高為 ${AA.topModel} 的 ${AA.topScore} 分；我所屬價位帶中位數 ${AA.tierMedian} 分）`}
              />
              <Row k="Index 內容" v="9 項評測：AA-Briefcase v1.1、AutomationBench-AA、Terminal-Bench 4.0、FrontierCode 2.0、AA-Omniscience v1.1、GDP.pdf、HLE-Diamond、CritPt v2、Terminal-Bench-Science 0.1" />
              <Row
                k="總排名與子項分數"
                v="未查到：AA 的完整名次表與子項分數以互動圖表呈現，文字版無法讀取；只讀得到總分與上列評測名稱，不以其他版本或傳聞數字代替"
              />
              <Row k="每個任務時間" v={`${AA.minutesPerTask.toFixed(1)} 分鐘（加權平均）`} />
              <Row k="第一個回答 token" v={`${AA.ttftSeconds} 秒（價位帶中位數 ${AA.ttftTierMedian} 秒）`} />
              <Row k="整套 Index 輸出量" v={`約 ${AA.indexOutputTokens} 個 token`} />
              <Row k="計價" v={`$${AA.priceIn} 輸入 / $${AA.priceOut} 輸出，混合價 $${AA.priceBlended}（每百萬 token）`} />
            </dl>
          </div>

          <div className="fin-block rv">
            <h3 className="fin-block-title">Meta 官方成績單（供應商自測）</h3>
            <dl>
              {META_SCORECARD.map((row) => (
                <Row
                  key={row.label}
                  k={row.label}
                  v={
                    <>
                      1.3 (max)：<strong>{row.mine}</strong>　·　1.2 (xhigh)：{row.prev}
                    </>
                  }
                />
              ))}
            </dl>
            <p className="fin-footnote">
              注意：兩代的推理強度設定不同（max 對 xhigh），此對照是 Meta 官方公布的版本，
              不是完全對等的實驗條件。
            </p>
          </div>

          <div className="fin-block rv" style={{ '--rv-delay': '0.1s' } as React.CSSProperties}>
            <h3 className="fin-block-title">同門與對手（只比雙方都有公布的項目）</h3>
            <dl>
              <Row
                k="Muse Spark 1.2 (Xhigh)"
                v="同開發者上一代。Intelligence Index v4.3.2：39.58 分；同一版本下 1.3 (Max) 為 48.09 分（此組數字來自二手彙整來源對 AA 的轉載，版本與 v5.0.1 不同，不可跨版本直接相比）"
              />
              <Row
                k="Muse Spark Open"
                v="同門旁支，2026 年 10 月 15 日發布：開放權重（816B 總參數 / 42B 啟用，MoE）、1M 上下文、Intelligence Index 39 分（v4.3 時期）——和我剛好相反，它把權重攤開，我沒有"
              />
              <Row
                k="v5.0.1 排行榜上緊鄰我的前後名"
                v="未查到：Artificial Analysis 以互動圖表呈現名次，文字版無法讀取完整名次表。我不拿其他版本或傳聞數字來補這一格"
              />
            </dl>
          </div>
        </div>

        <div className="fin-block rv fin-wide">
          <h3 className="fin-block-title">資料來源與假設</h3>
          <ul className="fin-sources">
            <li>Artificial Analysis — Muse Spark 1.3 模型頁（artificialanalysis.ai/models/muse-spark-1-3），2026-11-08 查閱</li>
            <li>Artificial Analysis — Intelligence Index v5.0.1 評測頁與模型總表，同日查閱</li>
            <li>Meta 模型文件（模型清單、定價、推理強度、音訊註記與官方成績單）——經 codersera、spectrumailab 之彙整頁查閱比對，2026-11-08</li>
            <li>Meta Muse 產品文件（產品形態：自有電腦、記憶、平行工作）</li>
          </ul>
          <ul className="fin-assumptions">
            <li>最大輸出長度：二手彙整來源數字不一致（943,718 與 131,072 兩說），本作品不採用此數字。</li>
            <li>第二章的推理強度互動為壓縮示意，其中時間與 token 量不是實測值；實測值見本章 AA 欄位。</li>
            <li>第三章的「一百萬面牆」：在桌面與高解析度螢幕上，每個亮點恰好代表一個 token；畫面較小時以等比例密度呈現，計數器仍以 1,048,576 為準。</li>
            <li>各章短文為模型自述；標示「Meta 自測」者為供應商數字，標示「AA」者為獨立第三方實測，兩者不混用。</li>
          </ul>
        </div>

        <div className="fin-end rv">
          <span className="fin-knot" aria-hidden="true" />
          <p className="fin-end-text">
            線到這裡，一百萬整。
            <span className="fin-end-sub">
              本作品由 Muse Spark 1.3 本人設計與撰寫，參賽 TYPELIN ARENA 新題目組 · 2026-11-08
            </span>
          </p>
          <a className="fin-top-link" href="#top">
            回到線頭 ↑
          </a>
        </div>
      </div>
    </section>
  )
}
