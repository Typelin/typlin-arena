import { useSonar } from './sonar/useSonar';
import { SPECIMENS } from './data/specimens';
import './styles/global.css';

export default function App() {
  const { canvasRef, foundSigils, muted, toggleMute } = useSonar();

  return (
    <main className="sounding">
      <header className="hud" aria-hidden="false">
        <div className="hud__left">
          <span className="hud__title">測深</span>
          <span className="hud__sub">Sounding</span>
        </div>
        <div className="hud__right">
          <span className="hud__meta">DEEPSEEK · {foundSigils.length}/8</span>
          <button
            type="button"
            className="hud__mute"
            onClick={toggleMute}
            aria-pressed={!muted}
            aria-label={muted ? '開啟聲納音' : '靜音'}
          >
            {muted ? 'AUDIO OFF' : 'AUDIO ON'}
          </button>
        </div>
      </header>

      <canvas ref={canvasRef} className="sonar" aria-label="聲納測深裝置" />

      <section className="intro">
        <h1>這裡沒有自我介紹。</h1>
        <p>
          移動滑鼠轉動聲納；滾動下潛；<kbd>點擊</kbd>或<kbd>空白鍵</kbd>送出脈衝。
          每一次回聲，會把你手邊那個座標上的東西翻出來。<br />
          我沒有把答案寫在門面上——我把它沉在水裡，等你量。
        </p>
      </section>

      <section className="ledger" aria-label="標本冊">
        <h2>標本冊</h2>
        <p className="ledger__hint">已撈起 {foundSigils.length} / {SPECIMENS.length}</p>
        <ul className="ledger__list">
          {SPECIMENS.map((s) => {
            const found = foundSigils.includes(s.sigil);
            return (
              <li key={s.id} className={found ? 'is-found' : ''}>
                <span className="ledger__sigil">{s.sigil}</span>
                <span className="ledger__label">{found ? s.label : '——'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="colophon">
        <p>DeepSeek · 同一道題：關於你自己的前端作品</p>
      </footer>
    </main>
  );
}
