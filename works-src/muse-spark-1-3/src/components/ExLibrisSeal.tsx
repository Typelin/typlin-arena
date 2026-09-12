import React, { useState } from 'react';
import { sound } from '../audio/soundEngine';

interface ExLibrisSealProps {
  tensionScore: number;
  currentActTitle: string;
}

export const ExLibrisSeal: React.FC<ExLibrisSealProps> = ({ tensionScore, currentActTitle }) => {
  const [stampName, setStampName] = useState<string>('VISITOR');
  const [isStamped, setIsStamped] = useState<boolean>(false);
  const [sealVariant, setSealVariant] = useState<number>(1);

  const handleStamp = () => {
    setIsStamped(true);
    sound.playResonanceChord();
  };

  const cycleVariant = () => {
    setSealVariant((prev) => (prev % 3) + 1);
    sound.playPluck(420, 0.25);
  };

  return (
    <section className="exlibris-seal-section" aria-label="收束與共創印契">
      <div className="seal-container-grid">
        <div className="seal-text-column">
          <div className="editorial-eyebrow mono">THE DUAL SIGNATURE</div>
          <h2 className="editorial-title">共創印契：凝固於羊皮紙的印痕</h2>
          <p className="editorial-lead">
            數位體驗不該是單向的陳列展覽。當你在畫布上撥動彈簧、調整阻尼、在留白處駐足，你的每一次選擇已經改變了這個系統的物理常數。
          </p>
          <p className="seal-explanation serif">
            輸入你的符號或署名，將這段交互中積累的張力與哲思，拓印為一枚不可篡改的「藏書票印契（Ex-Libris Seal）」。
          </p>

          <div className="seal-input-cluster">
            <div className="input-group">
              <label htmlFor="seal-identifier" className="mono label-sm">
                IDENTIFIER / 協作者代號
              </label>
              <input
                id="seal-identifier"
                type="text"
                maxLength={12}
                value={stampName}
                onChange={(e) => setStampName(e.target.value.toUpperCase())}
                className="editorial-input mono"
                placeholder="YOUR CODE"
              />
            </div>

            <div className="seal-actions-row">
              <button
                type="button"
                className="stamp-trigger-btn"
                onClick={handleStamp}
              >
                {isStamped ? '✦ 重新拓印此印契' : '✦ 拓印永久共創印契'}
              </button>
              <button
                type="button"
                className="variant-btn mono"
                onClick={cycleVariant}
                title="切換幾何骨架變體"
              >
                幾何骨架: VAR-0{sealVariant}
              </button>
            </div>
          </div>
        </div>

        {/* The Graphic Seal Plate */}
        <div className="seal-plate-column">
          <div className={`seal-frame-paper ${isStamped ? 'stamped-active' : ''}`}>
            <div className="seal-paper-texture"></div>
            
            {/* Realtime Vector Seal SVG */}
            <svg
              className="seal-vector-svg"
              viewBox="0 0 320 320"
              role="img"
              aria-label="專屬幾何拓印印契"
            >
              {/* Outer double circular border */}
              <circle cx="160" cy="160" r="145" fill="none" stroke="#1b2d42" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="160" cy="160" r="138" fill="none" stroke="#bf5136" strokeWidth="2.5" />
              <circle cx="160" cy="160" r="128" fill="none" stroke="#1b2d42" strokeWidth="0.75" />

              {/* Text around perimeter */}
              <path
                id="textPathOuter"
                d="M 160,160 m -115,0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0"
                fill="none"
              />
              <text className="seal-curved-text mono">
                <textPath href="#textPathOuter" startOffset="0%">
                  EX LIBRIS · THE TRACING PAPER · HUMAN-ALGORITHM DIALECTIC · 2026 ·
                </textPath>
              </text>

              {/* Central Geometric Tensegrity Emblem */}
              <g className="seal-inner-geometry">
                {sealVariant === 1 && (
                  <>
                    <polygon
                      points="160,50 255,215 65,215"
                      fill="none"
                      stroke="#1b2d42"
                      strokeWidth="1.8"
                    />
                    <polygon
                      points="160,270 65,105 255,105"
                      fill="none"
                      stroke="#bf5136"
                      strokeWidth="1.2"
                      strokeDasharray="5 3"
                    />
                    <circle cx="160" cy="160" r="38" fill="none" stroke="#1b2d42" strokeWidth="1.5" />
                    <circle cx="160" cy="160" r="4" fill="#bf5136" />
                  </>
                )}

                {sealVariant === 2 && (
                  <>
                    <rect
                      x="90"
                      y="90"
                      width="140"
                      height="140"
                      fill="none"
                      stroke="#1b2d42"
                      strokeWidth="1.8"
                      transform="rotate(45 160 160)"
                    />
                    <circle cx="160" cy="160" r="70" fill="none" stroke="#bf5136" strokeWidth="1.5" />
                    <line x1="80" y1="160" x2="240" y2="160" stroke="#1b2d42" strokeWidth="1" strokeDasharray="2 3" />
                    <line x1="160" y1="80" x2="160" y2="240" stroke="#1b2d42" strokeWidth="1" strokeDasharray="2 3" />
                  </>
                )}

                {sealVariant === 3 && (
                  <>
                    <circle cx="160" cy="160" r="60" fill="none" stroke="#bf5136" strokeWidth="2" />
                    <circle cx="160" cy="160" r="30" fill="none" stroke="#1b2d42" strokeWidth="1" />
                    <path
                      d="M 110,160 Q 160,90 210,160 Q 160,230 110,160 Z"
                      fill="none"
                      stroke="#1b2d42"
                      strokeWidth="1.5"
                    />
                    <circle cx="160" cy="160" r="5" fill="#bf5136" />
                  </>
                )}

                {/* Central Monogram and dynamic tension coordinate */}
                <text
                  x="160"
                  y="156"
                  textAnchor="middle"
                  className="seal-monogram serif"
                  fill="#1b2d42"
                >
                  {stampName.slice(0, 4) || '····'}
                </text>
                <text
                  x="160"
                  y="174"
                  textAnchor="middle"
                  className="seal-sub-mono mono"
                  fill="#bf5136"
                >
                  § {currentActTitle.slice(0, 6)}
                </text>
              </g>

              {/* Stamp Date & Rigidity coordinates */}
              <text x="160" y="275" textAnchor="middle" className="seal-bottom-spec mono" fill="#787f8a">
                TENS:{tensionScore}N // LATENT-2026
              </text>
            </svg>

            <div className="seal-badge-caption">
              <span className="mono cert-title">AUTONOMOUS EMBOSS VERIFICATION</span>
              <span className="serif cert-desc">
                此印拓象徵人類直覺之深靛與工程審慎之赤赭在硫酸紙上的交會
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
