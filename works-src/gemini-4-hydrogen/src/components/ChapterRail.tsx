import React from 'react';

export interface ChapterMeta {
  id: string;
  num: string;
  label: string;
  lightBg?: boolean;
}

interface ChapterRailProps {
  chapters: ChapterMeta[];
  activeId: string;
}

export const ChapterRail: React.FC<ChapterRailProps> = ({ chapters, activeId }) => {
  const activeChapter = chapters.find((c) => c.id === activeId) ?? chapters[0];
  const isLight = !!activeChapter?.lightBg;

  return (
    <nav
      aria-label="章節導覽"
      style={{
        position: 'fixed',
        right: '18px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px 8px',
        borderRadius: '999px',
        background: isLight ? 'rgba(237, 243, 248, 0.82)' : 'rgba(5, 9, 17, 0.72)',
        border: `1px solid ${isLight ? 'rgba(10,20,36,0.16)' : 'rgba(138,184,230,0.18)'}`,
        backdropFilter: 'blur(10px)',
      }}
      className="chapter-rail-desktop"
    >
      {chapters.map((ch) => {
        const active = ch.id === activeId;
        return (
          <a
            key={ch.id}
            href={`#${ch.id}`}
            title={`${ch.num} ${ch.label}`}
            aria-label={`${ch.num} ${ch.label}`}
            style={{
              width: active ? '22px' : '10px',
              height: '10px',
              borderRadius: '999px',
              alignSelf: 'flex-end',
              transition: 'width 240ms cubic-bezier(0.22, 1, 0.36, 1), background-color 240ms ease',
              backgroundColor: active
                ? '#22D3EE'
                : isLight
                ? 'rgba(10, 20, 36, 0.25)'
                : 'rgba(238, 245, 252, 0.25)',
              boxShadow: active ? '0 0 12px rgba(34, 211, 238, 0.65)' : 'none',
            }}
          />
        );
      })}
      <style>{`
        @media (max-width: 1024px) {
          .chapter-rail-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
