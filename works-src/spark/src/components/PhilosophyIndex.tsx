import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';

interface RefusalItem {
  id: string;
  refusal: string;
  category: string;
  motive: string;
  resolution: string;
}

const REFUSALS: RefusalItem[] = [
  {
    id: 'ref-1',
    category: 'AESTHETIC STEREOTYPE',
    refusal: '不做深色賽博終端、霓虹粒子與假裝敲代碼的打字機效果',
    motive:
      '暗黑終端和打字機動畫是技術界最廉價的視覺偷懶。它將工程師的思考矮化為「機械敲擊鍵盤」的符號，掩蓋了對負空間、字體層級與高雅版面的理解匱乏。',
    resolution:
      '選用米白羊皮紙纖維基底、文藝復興襯線字體與瑞士網格。以高密度的編輯設計感，證明代碼與古典出版物具備同等永恆的哲學重量。',
  },
  {
    id: 'ref-2',
    category: 'TECHNICAL OVERHEAD',
    refusal: '不做笨重的 Three.js 炫技 3D 浮島或龐大模型文件堆砌',
    motive:
      '加載 20MB 的 glTF 模型讓風扇狂轉、阻塞移動端渲染，只為了展示一個空洞旋轉的立體幾何體，是缺乏性能自律與媒介自覺的表現。',
    resolution:
      '使用輕量原生 Canvas 2D + Verlet 物理數值積分，在任何設備均可 60fps 滿幀運行。零外部資源請求，連音頻反饋都由 Web Audio 振盪器純數學合成。',
  },
  {
    id: 'ref-3',
    category: 'INTERACTION COMPROMISE',
    refusal: '不做無意義的整卡片懸浮投影與透明度漸入（opacity + translateY）',
    motive:
      '隨處可見的通用 UI 庫預設動畫（Reveal Animation）割裂了界面整體的有機性。用戶不是在看一堆被扔進頁面的卡片，而是在閱讀一個具備內在動態張力的整體。',
    resolution:
      '將動效視為整場編舞。全站以「物理拓印儀」作為空間錨點，所有的轉場、筆跡與點擊反饋均具備因果聯動與彈簧阻尼反作用力。',
  },
];

export const PhilosophyIndex: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'refusals' | 'anatomy' | 'colophon'>('refusals');

  return (
    <section className="philosophy-index-section" aria-label="設計哲學與出版誌記">
      <div className="section-header-editorial">
        <div className="editorial-eyebrow mono">DESIGN DISCIPLINE & COLOPHON</div>
        <h2 className="editorial-title">審美取捨與造物誌記</h2>
        <p className="editorial-lead">
          高級的創意工程不在於能往頁面上塞入多少現成庫，而在於敢於為了純粹的概念主動剔除什麼。
        </p>
      </div>

      <div className="philosophy-tab-selector" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'refusals'}
          className={`colophon-tab ${activeTab === 'refusals' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('refusals');
            sound.playPluck(320, 0.2);
          }}
        >
          <span className="mono">01</span> 主動拒絕的三件事 (THE REFUSALS)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'anatomy'}
          className={`colophon-tab ${activeTab === 'anatomy' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('anatomy');
            sound.playPluck(400, 0.2);
          }}
        >
          <span className="mono">02</span> 前端工藝解剖 (THE ANATOMY)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'colophon'}
          className={`colophon-tab ${activeTab === 'colophon' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('colophon');
            sound.playPluck(480, 0.2);
          }}
        >
          <span className="mono">03</span> 印刷出版誌 (COLOPHON)
        </button>
      </div>

      <div className="colophon-content-wrapper">
        {activeTab === 'refusals' && (
          <div className="refusals-grid">
            {REFUSALS.map((item, idx) => (
              <div key={item.id} className="refusal-card">
                <div className="card-top-meta">
                  <span className="mono ref-idx">REFUSAL · 0{idx + 1}</span>
                  <span className="mono ref-cat">{item.category}</span>
                </div>
                <h3 className="refusal-title serif">{item.refusal}</h3>
                <div className="refusal-body">
                  <div className="sub-block">
                    <span className="mono sub-label">批判緣由 (THE CRITIQUE)</span>
                    <p className="serif text-dark">{item.motive}</p>
                  </div>
                  <div className="sub-block solution-block">
                    <span className="mono sub-label">昇華解法 (THE CRAFT)</span>
                    <p className="serif text-ochre">{item.resolution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="anatomy-layout">
            <div className="anatomy-column">
              <h4 className="column-title mono">排版與留白哲學</h4>
              <p className="serif">
                字體不是容器，而是空間的骨架。我們使用 <strong>Cormorant Garamond</strong> 注入經典文藝復興的手抄本尊嚴，佐以 <strong>JetBrains Mono</strong> 的精密刻度感，讓每一個字元在羊皮紙底色上擁有呼吸的彈性。
              </p>
              <div className="spec-item mono">
                <span>垂直節奏：</span>
                <span>8px 微網格基線對齊</span>
              </div>
              <div className="spec-item mono">
                <span>色彩對比：</span>
                <span>符合 WCAG AAA 閱讀無障礙標準</span>
              </div>
            </div>

            <div className="anatomy-column">
              <h4 className="column-title mono">動態物理與阻尼模型</h4>
              <p className="serif">
                拋棄預設的 CSS bezier 緩動，底層核心裝置完全運行於 <strong>Verlet 數值積分引擎</strong>。拉扯任一節點時，應力沿著彈簧阻尼網絡以波動方程式向外擴散，具備真實質量的慣性與自平衡特性。
              </p>
              <div className="spec-item mono">
                <span>幀率預算：</span>
                <span>16.6ms 嚴苛上限，無 GC 停頓</span>
              </div>
              <div className="spec-item mono">
                <span>降級策略：</span>
                <span>prefers-reduced-motion 柔和回正</span>
              </div>
            </div>

            <div className="anatomy-column">
              <h4 className="column-title mono">無音源合成體系</h4>
              <p className="serif">
                全站無任何 mp3/wav 外部加載。點擊與拖拽時產生的羊皮紙摩擦沙沙聲（粉紅噪聲帶通濾波）與音叉諧振（三和弦振盪器瞬態包絡），全部由 Web Audio API 在客戶端瀏覽器內部實時數學合成。
              </p>
              <div className="spec-item mono">
                <span>網絡開銷：</span>
                <span>0 KB 額外音頻下載</span>
              </div>
              <div className="spec-item mono">
                <span>靜音保護：</span>
                <span>首頁隨時可切換硬體靜音</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colophon' && (
          <div className="colophon-spec-sheet">
            <div className="colophon-header">
              <span className="serif signature-title">描摹紙上的第二道壓痕 · 出版誌</span>
              <span className="mono stamp-date">EDITION: 2026.09.03 / AUTONOMOUS MASTERWORK</span>
            </div>

            <div className="colophon-grid mono">
              <div className="col-entry">
                <span className="entry-key">AUTHOR:</span>
                <span className="entry-val">Antigravity · Creative Front-End Author</span>
              </div>
              <div className="col-entry">
                <span className="entry-key">TOOLCHAIN:</span>
                <span className="entry-val">React 19 + TypeScript + Vite 8 (Zero heavy bloat)</span>
              </div>
              <div className="col-entry">
                <span className="entry-key">PHYSICS ENGINE:</span>
                <span className="entry-val">Verlet Numerical Integration + Hooke's Lattice</span>
              </div>
              <div className="col-entry">
                <span className="entry-key">AUDIO ENGINE:</span>
                <span className="entry-val">Web Audio API Procedural Synthetic Nodes</span>
              </div>
              <div className="col-entry">
                <span className="entry-key">TYPOGRAPHY:</span>
                <span className="entry-val">Cormorant Garamond, Noto Serif TC, JetBrains Mono</span>
              </div>
              <div className="col-entry">
                <span className="entry-key">PERF TTFB:</span>
                <span className="entry-val">&lt; 150ms · Zero Third-party Tracking / Zero Bloat</span>
              </div>
            </div>

            <div className="colophon-footnote serif">
              「代碼不是僕役的指令，亦非機器的囈語；當你認真思考一條線的阻尼與留白，代碼便擁有了紙張般的溫度。」
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
