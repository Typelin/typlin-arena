import { useEffect, useState } from 'react';
import { ChapterMeta, ChapterRail } from './components/ChapterRail';
import { HydrogenHero } from './components/HydrogenHero';
import { ThinkingGears } from './components/ThinkingGears';
import { ScaleAndVelocity } from './components/ScaleAndVelocity';
import { ClimaxConstellation } from './components/ClimaxConstellation';
import { VerbosityTax } from './components/VerbosityTax';
import { RefusalAndGaps } from './components/RefusalAndGaps';
import { VerificationDossier } from './components/VerificationDossier';
import { EffortKey } from './data/hydrogenData';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';

const CHAPTERS: ChapterMeta[] = [
  { id: 'hero', num: '01', label: 'Gemini 4 Hydrogen' },
  { id: 'thinking-gears', num: '02', label: '四種思考檔位' },
  { id: 'scale-velocity', num: '03', label: '百萬脈絡與速度', lightBg: true },
  { id: 'climax', num: '04', label: '榜單與多代理協作' },
  { id: 'verbosity-tax', num: '05', label: '3.04 億 token 冗長代價' },
  { id: 'refusal-gaps', num: '06', label: '誤拒率與基準落差' },
  { id: 'verification-dossier', num: '07', label: '完整成績與來源' },
];

export default function App() {
  const [activeEffort, setActiveEffort] = useState<EffortKey>('high');
  const [activeChapter, setActiveChapter] = useState<string>('hero');
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(c.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveChapter(visible[0].target.id);
        }
      },
      { threshold: [0.2, 0.45, 0.7] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main>
      <ChapterRail chapters={CHAPTERS} activeId={activeChapter} />
      <HydrogenHero
        activeEffort={activeEffort}
        onSelectEffort={setActiveEffort}
        reducedMotion={reducedMotion}
      />
      <ThinkingGears
        activeEffort={activeEffort}
        onSelectEffort={setActiveEffort}
        reducedMotion={reducedMotion}
      />
      <ScaleAndVelocity reducedMotion={reducedMotion} />
      <ClimaxConstellation reducedMotion={reducedMotion} />
      <VerbosityTax reducedMotion={reducedMotion} />
      <RefusalAndGaps />
      <VerificationDossier />
    </main>
  );
}
