import { DossierChapter } from './components/DossierChapter';
import { HeroPoster } from './components/HeroPoster';
import { LimitsApertureChapter } from './components/LimitsApertureChapter';
import { MillionScaleChapter } from './components/MillionScaleChapter';
import { ThinkingExcitationChapter } from './components/ThinkingExcitationChapter';
import { VelocityClimaxChapter } from './components/VelocityClimaxChapter';
import { useReducedMotion } from './hooks/useReducedMotion';

export function App() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="site-root">
      <a className="skip-link" href="#chapter-02">
        跳至主要內容
      </a>

      <nav className="chapter-rail" aria-label="章節導覽">
        <a href="#chapter-01" title="01 封面">01</a>
        <a href="#chapter-02" title="02 百萬詞元尺度">02</a>
        <a href="#chapter-03" title="03 四段思考互動">03</a>
        <a href="#chapter-04" title="04 基準速度高潮">04</a>
        <a href="#chapter-05" title="05 邊界與短板">05</a>
        <a href="#chapter-06" title="06 完整規格與來源">06</a>
      </nav>

      <main>
        <HeroPoster reducedMotion={reducedMotion} />
        <MillionScaleChapter reducedMotion={reducedMotion} />
        <ThinkingExcitationChapter reducedMotion={reducedMotion} />
        <VelocityClimaxChapter reducedMotion={reducedMotion} />
        <LimitsApertureChapter reducedMotion={reducedMotion} />
        <DossierChapter />
      </main>
    </div>
  );
}

export default App;
