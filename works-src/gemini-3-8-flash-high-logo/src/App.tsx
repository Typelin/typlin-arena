import React, { useState, useEffect } from 'react';
import { SakuraCanvas } from './components/SakuraCanvas';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { PhilosophySection } from './components/PhilosophySection';
import { CraftSection } from './components/CraftSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ManifestoSection } from './components/ManifestoSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { sound } from './lib/sound';

export function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'philosophy', 'craft', 'portfolio', 'manifesto', 'contact'];
      const scrollY = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleAudio = () => {
    const nextState = sound.toggle();
    setIsAudioOn(nextState);
  };

  return (
    <div className="min-h-screen relative bg-[#faf8f9] text-[#1a1e32]">
      {/* 2D Canvas Flowing Sakura Petals Background */}
      <SakuraCanvas interactive={true} />

      {/* Main Top Navigation */}
      <Navigation
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isAudioOn={isAudioOn}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main Sections */}
      <main className="relative z-10">
        <HeroSection
          onExploreCraft={() => handleNavigate('craft')}
          onContact={() => handleNavigate('contact')}
        />
        <PhilosophySection />
        <CraftSection />
        <PortfolioSection />
        <ManifestoSection />
        <ContactSection />
      </main>

      {/* Global Footer */}
      <Footer onBackToTop={() => handleNavigate('hero')} />
    </div>
  );
}

export default App;
