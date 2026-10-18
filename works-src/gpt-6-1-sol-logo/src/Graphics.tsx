export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg
      className={down ? "arrow is-down" : "arrow"}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function Bloom({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <g fill="currentColor">
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d="M40 40C22 31 23 9 35 9L40 15 45 9C57 9 58 31 40 40Z"
            transform={`rotate(${i * 72} 40 40)`}
          />
        ))}
      </g>
      <circle cx="40" cy="40" r="5" fill="var(--cream,#f8f7f2)" />
    </svg>
  );
}

export function ProjectArt({
  theme,
  mini = false,
}: {
  theme: string;
  mini?: boolean;
}) {
  return (
    <div
      className={`project-art ${theme} ${mini ? "is-mini" : ""}`}
      aria-hidden="true"
    >
      <div className="browser-bar">
        <span />
        <span />
        <span />
        <i>{theme}.studio / preview</i>
        <b>↗</b>
      </div>
      {theme === "mori" ? (
        <div className="mori-screen">
          <div className="mock-nav">
            <strong>
              mori<span> 森序</span>
            </strong>
            <span>日常選物　 關於森序　 ↗</span>
          </div>
          <div className="mori-copy">
            <span className="mock-eyebrow">A LITTLE MORE ROOM TO LIVE.</span>
            <h4>
              讓日常，
              <br />
              <em>慢一點。</em>
            </h4>
            <span className="mock-pill">找到你的綠意 ↗</span>
          </div>
          <svg className="plant" viewBox="0 0 330 370" fill="none">
            <ellipse
              cx="180"
              cy="334"
              rx="91"
              ry="12"
              fill="#394c32"
              opacity=".1"
            />
            <path
              d="M173 298C171 233 185 170 170 73"
              stroke="#536747"
              strokeWidth="3"
            />
            <path
              d="M179 219C141 211 120 170 122 127C170 136 187 173 179 219Z"
              fill="#6d8154"
            />
            <path
              d="M180 192C207 181 238 134 224 83C180 103 170 151 180 192Z"
              fill="#344f37"
            />
            <path
              d="M174 139C140 130 112 80 125 38C170 52 181 91 174 139Z"
              fill="#94a17a"
            />
            <path
              d="M173 99C196 80 208 42 191 10C163 28 155 70 173 99Z"
              fill="#526d43"
            />
            <path
              d="M173 267C129 269 83 236 71 187C125 183 168 219 173 267Z"
              fill="#536e43"
            />
            <path
              d="M177 248C224 246 259 213 265 168C216 168 181 200 177 248Z"
              fill="#899a70"
            />
            <path d="M129 281H224L214 335Q176 351 139 335Z" fill="#c7bfa7" />
            <ellipse cx="176" cy="281" rx="48" ry="10" fill="#dcd6c4" />
            <path
              d="M143 293 151 332M157 294 161 337M174 295V340M191 294 188 338M208 293 201 335"
              stroke="#b3aa92"
              strokeWidth="1.5"
            />
          </svg>
          <div className="mock-bottom">
            <span>OBJECTS WITH A QUIET PURPOSE.</span>
            <span>01 — 03</span>
          </div>
        </div>
      ) : theme === "flow" ? (
        <div className="flow-screen">
          <aside className="mock-sidebar">
            <b>
              f<span>•</span>
            </b>
            <span className="side-active">◈</span>
            <span>▦</span>
            <span>☷</span>
            <span>⌁</span>
            <i />
          </aside>
          <div className="flow-main">
            <div className="flow-top">
              <span>工作空間 / 總覽</span>
              <i>Y</i>
            </div>
            <h4>
              今天，一起往前。<span>早安！先從最重要的事開始。</span>
            </h4>
            <div className="flow-stat">
              <div>
                <small>進行中的專案</small>
                <strong>
                  08<span>個</span>
                </strong>
                <p>↗ 每件事，都在往前。</p>
              </div>
              <svg viewBox="0 0 230 100">
                <path
                  d="M0 90 30 68 55 78 80 50 110 59 140 30 165 39 195 14 225 2V100H0Z"
                  fill="#e6e0f0"
                />
                <path
                  d="M0 90 30 68 55 78 80 50 110 59 140 30 165 39 195 14 225 2"
                  fill="none"
                  stroke="#82719f"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <div className="flow-table">
              <div>
                <b>本週一起完成</b>
                <span>查看全部 ↗</span>
              </div>
              {[
                "品牌網站 / 介面設計",
                "工作流程 / 原型確認",
                "內容整理 / 第一版校對",
              ].map((s, i) => (
                <p key={s}>
                  <i className={"status-dot d" + i} />
                  <span>{s}</span>
                  <small>{["設計中", "待回饋", "已完成"][i]}</small>
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="sora-screen">
          <div className="mock-nav">
            <strong>
              sora<span> 空途</span>
            </strong>
            <span>找一段路　 讀一個故事　 ↗</span>
          </div>
          <div className="sora-copy">
            <span className="mock-eyebrow">TAKE THE SCENIC ROUTE.</span>
            <h4>
              下一站，
              <br />
              <em>不必太趕。</em>
            </h4>
            <span className="mock-pill">出發看看 ↗</span>
          </div>
          <svg
            className="landscape"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMax slice"
          >
            <circle cx="466" cy="90" r="40" fill="#e9b79a" />
            <path d="M-20 360 184 122 355 360Z" fill="#becbdb" />
            <path d="m111 360 227-268 257 268Z" fill="#899eb9" />
            <path d="M300 400 476 206 650 400Z" fill="#5f7999" />
            <path
              d="M-10 309C151 252 208 413 368 321C486 259 550 312 620 281V420H-10Z"
              fill="#e4dccc"
            />
            <path
              d="M365 400C275 348 271 334 340 310C379 296 392 295 397 284"
              stroke="#f8f5ec"
              strokeWidth="13"
              fill="none"
            />
          </svg>
          <div className="route-stamp">
            <span>24.16°N / 121.35°E</span>
            <b>山裡，沒有待辦事項。</b>
          </div>
        </div>
      )}
    </div>
  );
}
