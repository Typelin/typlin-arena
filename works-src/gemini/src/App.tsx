import { useState, useEffect, useRef } from 'react';
import { LatentChamberCanvas, ChamberParams } from './components/LatentChamberCanvas';
import { ControlDeck } from './components/ControlDeck';
import { Overture } from './sections/Overture';
import { PhaseVoyage } from './sections/PhaseVoyage';
import { AestheticAudit } from './sections/AestheticAudit';
import { Coda } from './sections/Coda';
import { soundEngine } from './lib/sound';

export function App() {
  const [entropy, setEntropy] = useState<number>(0.42);
  const [tension, setTension] = useState<number>(0.68);
  const [phaseIndex, setPhaseIndex] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const phaseSectionRef = useRef<HTMLDivElement | null>(null);

  // Global mouse tracking with damping
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x: normX, y: normY });
    };

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        setScrollProgress(progress);

        // Map scroll depth smoothly to phase
        const calculatedPhase = Math.min(3, Math.floor(progress * 4));
        if (calculatedPhase !== phaseIndex && progress > 0.1) {
          setPhaseIndex(calculatedPhase);
          soundEngine.modulate(entropy, tension, calculatedPhase);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [phaseIndex, entropy, tension]);

  // Keyboard navigation & accessibility controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const muted = soundEngine.toggleMute();
        setIsMuted(muted);
      }
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        setPhaseIndex(idx);
        soundEngine.triggerChime('phase');
        soundEngine.modulate(entropy, tension, idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entropy, tension]);

  const handleProbePing = () => {
    soundEngine.triggerChime('probe');
    // Transient impulse to entropy & tension
    const prevEntropy = entropy;
    setEntropy((prev) => Math.min(1, prev + 0.3));
    setTimeout(() => {
      setEntropy(prevEntropy);
    }, 450);
  };

  const scrollToPhase = (targetPhase: number) => {
    setPhaseIndex(targetPhase);
    soundEngine.triggerChime('phase');
    if (phaseSectionRef.current) {
      phaseSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const chamberParams: ChamberParams = {
    entropy,
    tension,
    phaseIndex,
    mouseX: mousePos.x,
    mouseY: mousePos.y,
    scrollProgress
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-slate-100 overflow-x-hidden">
      {/* Background Central Chamber Experience */}
      <div className="fixed inset-0 z-0">
        <LatentChamberCanvas params={chamberParams} />
        {/* Subtle noise grain layer for tactile filmic texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Foreground Narrative Flow */}
      <main className="relative z-10">
        <Overture
          onScrollToPhase={scrollToPhase}
          onExploreClick={() => scrollToPhase(0)}
        />

        <div ref={phaseSectionRef}>
          <PhaseVoyage
            currentPhase={phaseIndex}
            onSelectPhase={(idx) => {
              setPhaseIndex(idx);
              soundEngine.triggerChime('phase');
            }}
            setEntropy={setEntropy}
            setTension={setTension}
          />
        </div>

        <AestheticAudit />

        <Coda
          entropy={entropy}
          tension={tension}
          phaseIndex={phaseIndex}
        />
      </main>

      {/* Floating Interactive Control Deck */}
      <ControlDeck
        entropy={entropy}
        setEntropy={setEntropy}
        tension={tension}
        setTension={setTension}
        phaseIndex={phaseIndex}
        setPhaseIndex={setPhaseIndex}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onProbePing={handleProbePing}
      />
    </div>
  );
}

export default App;
