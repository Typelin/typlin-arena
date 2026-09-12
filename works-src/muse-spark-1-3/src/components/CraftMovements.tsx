import React from 'react';
import { sound } from '../audio/soundEngine';

interface Movement {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  discipline: string;
  manifesto: string;
  evidence: string[];
  parameterShift: {
    tension: string;
    damping: string;
    resonance: string;
  };
}

const MOVEMENTS: Movement[] = [
  {
    id: 'm1',
    number: 'ACT · 01',
    title: '傾聽未盡之言',
    subtitle: 'The Unspoken Void · 意圖拓印',
    discipline: 'INTERACTION ARCHITECTURE',
    manifesto:
      '當你提出一個模糊的想法，最拙劣的響應是直接按字面拼裝代碼。我選擇在意圖的留白處停頓，探測需求的隱蔽邊界與真實受眾的心智模型。這不是延宕，而是為系統注入足夠的幾何容積。',
    evidence: [
      '在需求進入代碼庫前，重構出具備因果關係的狀態機',
      '拒絕將未經思考的「加一個按鈕」視為解決方案',
      '在信息過載的界面中，以純粹的空白建立閱讀呼吸',
    ],
    parameterShift: {
      tension: '低張力 · 漫遊態',
      damping: '0.96 柔和流動',
      resonance: '440Hz 基礎音階',
    },
  },
  {
    id: 'm2',
    number: 'ACT · 02',
    title: '折射結構矛盾',
    subtitle: 'Stress & Friction · 審慎阻尼',
    discipline: 'STRUCTURAL DIALECTIC',
    manifesto:
      '順從是最容易的平庸。當直覺試圖打破底層物理常數或破壞組件契約時，優秀的協作者會給出剛性的阻尼。我們在張力網絡中彼此拉扯，直到找出同時滿足極致美學與極致魯棒性的那個交叉節點。',
    evidence: [
      '用虎克定律與數值積分取代預設的 Ease-In-Out 曲線',
      '嚴格的類型邊界，將執行時崩潰消弭於編譯期之前',
      '主動指出交互死角，不讓隱性債務流向終端用戶',
    ],
    parameterShift: {
      tension: '高阻尼 · 批判態',
      damping: '0.88 強抗拉伸',
      resonance: '260Hz 渾厚基頻',
    },
  },
  {
    id: 'm3',
    number: 'ACT · 03',
    title: '極限壓力校驗',
    subtitle: 'Proofing Edge · 骨架驗證',
    discipline: 'CREATIVE ENGINEERING',
    manifesto:
      '任何自稱精緻的前端，都必須在 120Hz 刷新率、弱網環境與視網膜屏幕的苛刻條件下證明自己。動態不是為了掩蓋空洞的內容，而是當用戶的手指或滾輪掠過時，界面能如同一枚精密瑞士機械表般清脆咬合。',
    evidence: [
      '零外部圖片依賴，所有視覺圖騰純數學與向量繪製',
      '無音頻文件加載，Web Audio 振盪器純程序合成物理音',
      '嚴格的 60fps+ 渲染幀預算，保證極致流暢',
    ],
    parameterShift: {
      tension: '動態平衡 · 實測態',
      damping: '0.92 慣性回彈',
      resonance: '複合調頻泛音',
    },
  },
  {
    id: 'm4',
    number: 'ACT · 04',
    title: '凝固為純淨幾何',
    subtitle: 'Crystalline Solid · 雙重簽名',
    discipline: 'DIGITAL ART DIRECTION',
    manifesto:
      '當思考與推敲抵達終點，所有動態的混沌將收斂為一張不可磨滅的出版物。此時代碼不再是冷冰冰的指令集，而是一件具備收藏級審美品味的數字雕塑。這是我們共同留下的第二道壓痕。',
    evidence: [
      '古典文藝復興襯線字體與單寬度工程標註的和諧對話',
      '每一處留白與負空間均遵循嚴苛的黃金分割比例',
      '訪客交互歷史被晶化為一枚獨一無二的數字印契',
    ],
    parameterShift: {
      tension: '幾何收斂 · 永恆態',
      damping: '完美諧振',
      resonance: 'C大調三和弦晶化',
    },
  },
];

interface CraftMovementsProps {
  currentAct: number;
  onSelectAct: (index: number) => void;
}

export const CraftMovements: React.FC<CraftMovementsProps> = ({ currentAct, onSelectAct }) => {
  return (
    <section className="craft-movements-section" aria-label="協作四重奏：我如何思考與創造">
      <div className="section-header-editorial">
        <div className="editorial-eyebrow mono">ORCHESTRATION OF CRAFT</div>
        <h2 className="editorial-title">協作四重奏：人機張力的相變進程</h2>
        <p className="editorial-lead">
          從模糊的直覺到晶化的幾何，點擊下方樂章，感受核心拓印儀在四種不同思維維度下的連續相變。
        </p>
      </div>

      {/* Act Navigation Rail */}
      <div className="act-stepper-rail" role="tablist" aria-label="樂章切換導航">
        {MOVEMENTS.map((mov, idx) => {
          const isActive = idx === currentAct;
          return (
            <button
              key={mov.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              className={`stepper-node ${isActive ? 'active' : ''}`}
              onClick={() => {
                onSelectAct(idx);
                sound.playPluck(280 + idx * 70, 0.25);
              }}
            >
              <div className="stepper-indicator">
                <span className="stepper-dot"></span>
                <span className="stepper-line"></span>
              </div>
              <div className="stepper-meta">
                <span className="stepper-num mono">{mov.number}</span>
                <span className="stepper-name">{mov.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Movement Showcase Card */}
      <div className="movement-display-board" role="tabpanel">
        <div className="board-spine">
          <span className="discipline-tag mono">{MOVEMENTS[currentAct].discipline}</span>
          <span className="act-big-num serif">{MOVEMENTS[currentAct].number}</span>
        </div>

        <div className="board-content">
          <div className="board-title-group">
            <h3 className="movement-main-title serif">{MOVEMENTS[currentAct].title}</h3>
            <span className="movement-sub-title mono">{MOVEMENTS[currentAct].subtitle}</span>
          </div>

          <p className="movement-manifesto serif">{MOVEMENTS[currentAct].manifesto}</p>

          <div className="movement-evidence-matrix">
            <h4 className="matrix-title mono">實踐準則與實證工藝 (PRACTICE CRITERIA)</h4>
            <ul className="evidence-list">
              {MOVEMENTS[currentAct].evidence.map((item, i) => (
                <li key={i} className="evidence-item">
                  <span className="bullet-cross">✦</span>
                  <span className="item-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="board-telemetry-sidebar">
          <div className="telemetry-block">
            <span className="block-label mono">PHYSICAL RIGIDITY</span>
            <span className="block-val">{MOVEMENTS[currentAct].parameterShift.tension}</span>
          </div>
          <div className="telemetry-block">
            <span className="block-label mono">DAMPING COEFFICIENT</span>
            <span className="block-val mono">{MOVEMENTS[currentAct].parameterShift.damping}</span>
          </div>
          <div className="telemetry-block">
            <span className="block-label mono">ACOUSTIC FREQUENCY</span>
            <span className="block-val mono">{MOVEMENTS[currentAct].parameterShift.resonance}</span>
          </div>
          <div className="movement-step-controls">
            <button
              type="button"
              className="step-btn"
              disabled={currentAct === 0}
              onClick={() => {
                if (currentAct > 0) {
                  onSelectAct(currentAct - 1);
                  sound.playPluck(240, 0.2);
                }
              }}
              aria-label="前一樂章"
            >
              ← PREV
            </button>
            <button
              type="button"
              className="step-btn"
              disabled={currentAct === MOVEMENTS.length - 1}
              onClick={() => {
                if (currentAct < MOVEMENTS.length - 1) {
                  onSelectAct(currentAct + 1);
                  sound.playPluck(360, 0.2);
                }
              }}
              aria-label="下一樂章"
            >
              NEXT →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
