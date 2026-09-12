import Reveal from './Reveal'
import SecHead from './SecHead'
import { useState } from 'react'

type Work = {
  id: string
  year: string
  t: string
  z: string
  type: string
  d: string
  tags: string[]
}

const WORKS: Work[] = [
  {
    id: 'sakura',
    year: '2026',
    t: '櫻守茶屋',
    z: 'SAKURA-MORI CHAYA',
    type: '品牌官網',
    d: '三代老茶鋪的品牌重生。以手繪櫻花與季節輪轉動畫，把「一期一會」變成可滑動的旅程，上線後會員成長 2.4 倍。',
    tags: ['品牌官網', '動態敘事', '電商整合'],
  },
  {
    id: 'kumo',
    year: '2025',
    t: '雲上提案',
    z: 'KUMO PITCH',
    type: 'SaaS 平台',
    d: '給小型團隊的簡報協作工具。即時共編與版本樹設計，讓「改到第 38 版」不再是玩笑，而是可以回溯的歷史。',
    tags: ['SaaS', '即時協作', '設計系統'],
  },
  {
    id: 'yume',
    year: '2025',
    t: '夢境手帳',
    z: 'YUME NOTE',
    type: '行動應用',
    d: '醒來 90 秒內記下夢的 App。以漸層夜色與手繪貼紙營造半夢半醒的質地，獲選 App Store 生活類編輯推薦。',
    tags: ['iOS / Android', '插畫系統', '離線優先'],
  },
  {
    id: 'ha',
    year: '2024',
    t: '葉脈圖書室',
    z: 'HA-MYAKU LIBRARY',
    type: '數據視覺化',
    d: '把地方誌 40 年的植物標本數據，長成一棵可互動的知識樹。滑過葉脈，就看見一個物種的興衰。',
    tags: ['視覺化', '開放資料', '教育'],
  },
]

function WorkVisual({ id }: { id: string }) {
  const palettes: Record<string, { bg: string; a: string; b: string }> = {
    sakura: { bg: 'linear-gradient(135deg,#2A2431,#3D2C3D)', a: '#F2A9BC', b: '#FBD9E2' },
    kumo: { bg: 'linear-gradient(135deg,#20263B,#2E3A5C)', a: '#8F9BD8', b: '#F2F2F2' },
    yume: { bg: 'linear-gradient(135deg,#241F33,#33305A)', a: '#CBA6D6', b: '#F2A9BC' },
    ha: { bg: 'linear-gradient(135deg,#1F2A2C,#2C4038)', a: '#9BD8B8', b: '#F2E9C9' },
  }
  const p = palettes[id] ?? palettes.sakura
  return (
    <div className="wk-visual" style={{ background: p.bg }}>
      <svg viewBox="0 0 200 120" aria-hidden="true">
        {id === 'sakura' && (
          <>
            {[30, 80, 130, 170].map((x, i) => (
              <circle key={x} cx={x} cy={i % 2 ? 40 : 78} r={i % 2 ? 10 : 14} fill={p.a} opacity={0.85 - i * 0.15} />
            ))}
            <path d="M0 104 C 50 84 90 116 200 92" stroke={p.b} strokeWidth="2" fill="none" opacity="0.5" />
          </>
        )}
        {id === 'kumo' && (
          <>
            {[24, 78, 132].map((x, i) => (
              <rect key={x} x={x} y={30 + i * 18} width={110 - i * 26} height="9" rx="4.5" fill={i === 1 ? p.a : p.b} opacity={0.9 - i * 0.2} />
            ))}
            <circle cx="164" cy="38" r="12" fill={p.a} opacity="0.9" />
            <circle cx="164" cy="70" r="7" fill={p.b} opacity="0.7" />
          </>
        )}
        {id === 'yume' && (
          <>
            <rect x="70" y="14" width="60" height="92" rx="12" fill="none" stroke={p.a} strokeWidth="2.4" />
            <circle cx="100" cy="52" r="16" fill={p.b} opacity="0.85" />
            <path d="M84 84 h32 M88 92 h24" stroke={p.a} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M28 40 q10 -12 20 0 M150 78 q10 -12 20 0" stroke={p.b} strokeWidth="2" fill="none" opacity="0.6" />
          </>
        )}
        {id === 'ha' && (
          <>
            <path d="M100 104 V44" stroke={p.a} strokeWidth="2.4" />
            {[44, 62, 80].map((y, i) => (
              <g key={y}>
                <path d={`M100 ${y} C ${82 - i * 6} ${y - 6}, ${78 - i * 6} ${y - 22}, 100 ${y - 30}`} stroke={p.b} strokeWidth="1.8" fill="none" opacity="0.85" />
                <path d={`M100 ${y} C ${118 + i * 6} ${y - 6}, ${122 + i * 6} ${y - 22}, 100 ${y - 30}`} stroke={p.b} strokeWidth="1.8" fill="none" opacity="0.85" />
              </g>
            ))}
            <circle cx="100" cy="18" r="5" fill={p.a} />
          </>
        )}
      </svg>
    </div>
  )
}

export default function Works() {
  const [active, setActive] = useState(0)

  return (
    <section className="sec" id="works">
      <div className="wrap">
        <SecHead no="03" zh="作品" en="SELECTED WORKS" lead="每一個專案，都是一次從種子到盛開的紀錄。" />
        <div className="wk-tabs" role="tablist" aria-label="作品切換">
          {WORKS.map((w, i) => (
            <button
              key={w.id}
              role="tab"
              aria-selected={active === i}
              className={active === i ? 'on' : ''}
              onClick={() => setActive(i)}
            >
              {w.t}
            </button>
          ))}
        </div>
        <Reveal key={WORKS[active].id} className="wk-panel">
          <WorkVisual id={WORKS[active].id} />
          <div className="wk-info">
            <p className="wk-meta">
              <span className="wk-year">{WORKS[active].year}</span>
              <span className="wk-type">{WORKS[active].type}</span>
            </p>
            <h3>{WORKS[active].t}</h3>
            <p className="wk-z">{WORKS[active].z}</p>
            <p className="wk-desc">{WORKS[active].d}</p>
            <div className="tags">
              {WORKS[active].tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
