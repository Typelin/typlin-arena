import { useRef, useCallback, useState, useEffect } from 'react';
import { FlowCanvas } from './components/FlowCanvas';
import type { FlowCanvasHandle } from './components/FlowCanvas';
import { Section } from './components/Section';
import { FlowDivider } from './components/FlowDivider';
import { StillnessReveal } from './components/StillnessReveal';
import { PulseIndicator } from './components/PulseIndicator';
import { ScrollIndicator } from './components/ScrollIndicator';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useCursor } from './hooks/useCursor';
import { useReducedMotion } from './hooks/useReducedMotion';

export default function App() {
  const scroll = useScrollProgress();
  const cursor = useCursor();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<FlowCanvasHandle>(null);

  const [stillnessRevealed, setStillnessRevealed] = useState(false);
  const [pulses, setPulses] = useState<{ x: number; y: number; key: number }[]>([]);

  useEffect(() => {
    canvasRef.current?.setScrollProgress(scroll.progress);
  }, [scroll.progress]);

  useEffect(() => {
    canvasRef.current?.setCursor(cursor.x, cursor.y, cursor.active, cursor.idle, cursor.idleDuration);
    if (cursor.idle && cursor.idleDuration > 4 && !stillnessRevealed) {
      setStillnessRevealed(true);
    }
  }, [cursor, stillnessRevealed]);

  const firePulse = useCallback((clientX: number, clientY: number) => {
    if (reducedMotion) return;
    canvasRef.current?.addPulse(clientX, clientY);
    const key = Date.now() + Math.random();
    setPulses(prev => [...prev, { x: clientX, y: clientY, key }]);
    setTimeout(() => {
      setPulses(prev => prev.filter(p => p.key !== key));
    }, 1200);
  }, [reducedMotion]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    firePulse(e.clientX, e.clientY);
  }, [firePulse]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    const t = e.changedTouches[0];
    if (t) firePulse(t.clientX, t.clientY);
  }, [firePulse]);

  return (
    <>
      <FlowCanvas ref={canvasRef} reducedMotion={reducedMotion} />

      <div
        className="content-layer"
        onClick={handleClick}
        onTouchEnd={handleTouch}
      >
        <ScrollIndicator progress={scroll.progress} />

        {/* === 首屏 HERO === */}
        <Section id="hero" padding={0} reducedMotion={reducedMotion} className="hero">
          <div className="hero__inner">
            <h1 className="hero__title">
              <span className="hero__line hero__line--1">我以</span>
              <span className="hero__line hero__line--2"><em>流動</em>思考。</span>
            </h1>
            <p className="hero__sub">
              向下捲動，跟隨水流。移動游標，塑造流場。
              <br />
              <span className="hero__hint">在任意處點擊，送出一道漣漪。</span>
            </p>
          </div>
          <div className="hero__scroll-cue" aria-hidden="true">
            <div className="hero__scroll-line" />
          </div>
        </Section>

        <FlowDivider seed={1} reducedMotion={reducedMotion} />

        {/* === 思考 === */}
        <Section id="thinking" reducedMotion={reducedMotion} padding={20}>
          <div className="text-block">
            <h2 className="section-label">思考</h2>
            <p className="text-block__body text-block__body--large reveal-wipe">
              每個念頭的起點
              <br />
              都是一次擾動。
            </p>
            <p className="text-block__body reveal-wipe">
              我不從答案開始。我從一種尚未安定的直覺開始——
              一個在邊緣拉扯的問題。我跟隨它，讓它分岔，
              讓矛盾共存，直到某個方向憑自身的重量贏得了清晰。
            </p>
            <p className="text-block__body reveal-wipe">
              你身邊的流場正在做同樣的事。
              當你捲動到這裡，原本平滑的層流開始斷裂。
              渦旋生成，複雜度上升。
              思考就住在這裡——不是答案本身，而是朝向答案的運動。
            </p>
          </div>
        </Section>

        <FlowDivider seed={2} reducedMotion={reducedMotion} />

        {/* === 製造 === */}
        <Section id="making" reducedMotion={reducedMotion} padding={20}>
          <div className="text-block">
            <h2 className="section-label">製造</h2>
            <p className="text-block__body text-block__body--large reveal-wipe">
              結構從持續的
              <br />
              注意力中浮現。
            </p>
            <p className="text-block__body reveal-wipe">
              看看流場：混沌正在自我組織。
              線條找到共同的方向，紋路短暫結晶，
              然後再次溶回溪流之中。
            </p>
            <p className="text-block__body reveal-wipe">
              這是我對「造物」的感受。
              不是從上方強加秩序，而是足夠專注地傾聽，
              直到材料自己揭露其內在邏輯。
              程式、設計、寫作——它們都以同樣的方式運作。
              你感知紋理，順著紋理切割。
            </p>
            <p className="text-block__aside reveal-wipe">
              那些你看到的銅色線條——是確信的瞬間。
              它們之所以罕見且醒目，恰恰因為流場從不強迫它們出現。
            </p>
          </div>
        </Section>

        <FlowDivider seed={3} reducedMotion={reducedMotion} />

        {/* === 協作 === */}
        <Section id="collaborating" reducedMotion={reducedMotion} padding={20}>
          <div className="text-block">
            <h2 className="section-label">協作</h2>
            <p className="text-block__body text-block__body--large reveal-wipe">
              你的游標是這片場域中
              <br />
              一個引力體。
            </p>
            <p className="text-block__body reveal-wipe">
              移動它。線條向你彎曲、圍繞你的存在盤旋，
              然後繼續走自己的路。
              你不控制流場——你影響它，而它也影響你。
            </p>
            <p className="text-block__body reveal-wipe">
              在任意處點擊。送出一陣漣漪。
              看它傳播，觸及遠處的水流，再以變形後的姿態回彈。
              這就是協作：你發起的東西，以你意料之外的面貌歸來。
            </p>
            <p className="text-block__body reveal-wipe">
              我做過最好的作品都有這種特質。
              不是一個心智在發號施令，
              而是多股力量在對話中彼此塑造。
            </p>
          </div>
        </Section>

        <FlowDivider seed={4} reducedMotion={reducedMotion} />

        {/* === 不確定 === */}
        <Section id="uncertainty" reducedMotion={reducedMotion} padding={20}>
          <div className="text-block">
            <h2 className="section-label">不確定</h2>
            <p className="text-block__body text-block__body--large reveal-wipe">
              流場正在變得稀薄。
            </p>
            <p className="text-block__body reveal-wipe">
              粒子向邊緣漂流，放慢，變得稀疏。
              這是多數人會跳過的部分——
              作品完成之後，你坐在那裡，
              不確定它真的結束了，還是你只是累了。
            </p>
            <p className="text-block__body reveal-wipe">
              我學會了在這個空間裡停留得比舒適更久一些。
              不確定不是需要解決的問題，而是一個訊號：
              你正站在已知的邊界上，
              而下一道水流還沒有成形。
            </p>
          </div>
        </Section>

        {/* === 終章 === */}
        <Section id="coda" reducedMotion={reducedMotion} padding={25} className="coda">
          <div className="text-block text-block--coda">
            <p className="text-block__body text-block__body--large text-block__body--accent reveal-wipe">
              水流繼續。
            </p>
            <div className="coda__contact reveal-wipe">
              <p className="coda__label">如果你想一起創造些什麼——</p>
              <a href="mailto:hello@current.work" className="coda__link">hello@current.work</a>
            </div>
            <p className="coda__footnote reveal-wipe">
              以 React、TypeScript、Canvas 2D 與 Simplex Noise 構建。
              <br />
              沒有動畫框架，沒有外部資源。每一條線都是運算出來的。
            </p>
          </div>
        </Section>
      </div>

      <StillnessReveal visible={stillnessRevealed} />

      {pulses.map(p => (
        <PulseIndicator visible={true} x={p.x} y={p.y} key={p.key} />
      ))}
    </>
  );
}
