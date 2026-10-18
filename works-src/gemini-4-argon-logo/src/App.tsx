import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './styles.css';

interface DiagnosticItem {
  id: string;
  metric: string;
  value: string;
  status: 'nominal' | 'optimal' | 'verified';
  detail: string;
}

interface Artifact {
  id: string;
  title: string;
  category: 'identity' | 'packaging' | 'digital' | 'spatial';
  serial: string;
  year: string;
  description: string;
  ratio: string;
  colorSpectrum: string[];
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArtifact, setSelectedArtifact] = useState<string>('art-01');
  const [interactiveScale, setInteractiveScale] = useState<number>(1);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'geometry' | 'chroma'>('overview');

  const containerRef = useRef<HTMLDivElement>(null);

  const diagnostics: DiagnosticItem[] = [
    { id: 'diag-1', metric: 'Optical Balance', value: '99.4%', status: 'optimal', detail: 'Symmetrical stroke weight along Y-axis vector' },
    { id: 'diag-2', metric: 'Vector Precision', value: '0.002mm', status: 'verified', detail: 'Sub-pixel anchor alignment' },
    { id: 'diag-3', metric: 'Chroma Contrast', value: '14.2:1', status: 'nominal', detail: 'Exceeds AAA WCAG guidelines' },
    { id: 'diag-4', metric: 'Brand Fidelity', value: '100%', status: 'optimal', detail: 'Original asset preserved without degradation' },
  ];

  const artifacts: Artifact[] = [
    {
      id: 'art-01',
      title: '咲夢 Monogram Mark',
      category: 'identity',
      serial: 'SKM-2026-01',
      year: '2026',
      description: '咲夢信息科技工作室核心標誌，融合書法「咲夢」、櫻花枝、雲紋與 </> 程式符號，體現「用代碼創造美好未來」的品牌精神。',
      ratio: '1:1 Square',
      colorSpectrum: ['#16233F', '#E8628C', '#F2A0B8', '#FAF6F0'],
    },
    {
      id: 'art-02',
      title: 'Studio Spatial Crest',
      category: 'spatial',
      serial: 'SKM-2026-02',
      year: '2026',
      description: 'Spatial signages and architectural manifestations designed for SAKIMU TECH STUDIO flagship workspaces.',
      ratio: '16:9 Canvas',
      colorSpectrum: ['#16233F', '#FAF6F0', '#2A2E38'],
    },
    {
      id: 'art-03',
      title: 'Developer Kit Insignia',
      category: 'packaging',
      serial: 'SKM-2026-03',
      year: '2025',
      description: 'Tactile foil stamp configuration engineered for SAKIMU TECH STUDIO hardware and welcome editions.',
      ratio: '4:5 Edition',
      colorSpectrum: ['#E8628C', '#FAF6F0', '#16233F'],
    },
    {
      id: 'art-04',
      title: 'Digital Surface Grid',
      category: 'digital',
      serial: 'SKM-2026-04',
      year: '2026',
      description: 'Dynamic responsive vector system configured for multi-device displays and cloud interfaces.',
      ratio: 'Fluid Layout',
      colorSpectrum: ['#16233F', '#F2A0B8', '#FAF6F0'],
    },
  ];

  const currentArtifact = artifacts.find(a => a.id === selectedArtifact) || artifacts[0];

  const filteredArtifacts = activeCategory === 'all' 
    ? artifacts 
    : artifacts.filter(a => a.category === activeCategory);

  return (
    <div className="anatomy-workspace" ref={containerRef}>
      {/* Blueprint Grid Overlay */}
      <div className="blueprint-grid-overlay" aria-hidden="true" />

      {/* Navigation / Header */}
      <header className="brand-header">
        <div className="brand-badge">
          <img src="/logo.png" alt="SAKIMU TECH STUDIO 咲夢信息科技工作室 Logo" className="brand-logo-img" />
          <div className="brand-badge-info">
            <span className="brand-title">SAKIMU TECH STUDIO</span>
            <span className="brand-subtitle">咲夢信息科技工作室 · Brand &amp; Code Architecture</span>
          </div>
        </div>

        <nav className="category-filter" aria-label="Category Navigation">
          {['all', 'identity', 'packaging', 'digital', 'spatial'].map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="chassis-serial">
          <span className="serial-tag">MOTTO: 用代碼創造美好未來</span>
          <span className="status-indicator">ONLINE</span>
        </div>
      </header>

      {/* Credibility / Status Bar */}
      <section className="cred-bar">
        <div className="cred-item">
          <span className="cred-label">CHINESE IDENTITY</span>
          <span className="cred-value">咲夢信息科技工作室</span>
        </div>
        <div className="cred-item">
          <span className="cred-label">BRAND SLOGAN</span>
          <span className="cred-value">用代碼創造美好未來</span>
        </div>
        <div className="cred-item">
          <span className="cred-label">PRIMARY ASSET</span>
          <span className="cred-value">ORIGINAL PNG</span>
        </div>
        <div className="cred-item">
          <span className="cred-label">BENCHMARK HARNESS</span>
          <span className="cred-value">TYPELIN ARENA VERIFIED</span>
        </div>
      </section>

      {/* Main Content Area: Inspection & Dossier */}
      <main className="workspace-main">
        {/* Left Stage: Asset Inspection Canvas */}
        <section className="asset-inspection-canvas">
          <div className="corner-mark bl" />
          <div className="corner-mark br" />
          <div className="corner-mark tl" />
          <div className="corner-mark tr" />

          <div className="canvas-toolbar">
            <div className="bbox-label">
              CANVAS INSPECTION / SCALE: {(interactiveScale * 100).toFixed(0)}%
            </div>
            <div className="canvas-controls">
              <button 
                className="control-btn"
                onClick={() => setInteractiveScale(s => Math.max(0.6, s - 0.2))}
                aria-label="Zoom Out"
              >
                -
              </button>
              <button 
                className="control-btn"
                onClick={() => setInteractiveScale(1)}
                aria-label="Reset Zoom"
              >
                RESET
              </button>
              <button 
                className="control-btn"
                onClick={() => setInteractiveScale(s => Math.min(2.0, s + 0.2))}
                aria-label="Zoom In"
              >
                +
              </button>
              <button 
                className={`control-btn ${showDiagnostics ? 'active' : ''}`}
                onClick={() => setShowDiagnostics(!showDiagnostics)}
              >
                {showDiagnostics ? 'HIDE DIAG' : 'SHOW DIAG'}
              </button>
            </div>
          </div>

          <div className="canvas-stage">
            <motion.div 
              className="logo-display-wrapper"
              animate={{ scale: interactiveScale }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <img src="/logo.png" alt="SAKIMU TECH STUDIO 咲夢信息科技工作室 Primary Brand Asset Logo" className="primary-logo-asset" />
              
              {showDiagnostics && (
                <div className="diagnostic-overlay-box">
                  <span className="bbox-label">CENTER MARK: [50% 50%]</span>
                  <div className="crosshair-h" />
                  <div className="crosshair-v" />
                </div>
              )}
            </motion.div>
          </div>

          <div className="canvas-footer-stats">
            <div className="stat-pill">
              <span className="stat-key">CHROMATICS</span>
              <span className="stat-val">NAVY / SAKURA PINK / PAPER</span>
            </div>
            <div className="stat-pill">
              <span className="stat-key">MOTIF ELEMENTS</span>
              <span className="stat-val">咲夢 CALLIGRAPHY / SAKURA / &lt;/&gt; CODE</span>
            </div>
          </div>
        </section>

        {/* Right Stage: Artifact Dossier & Detail Panel */}
        <aside className="artifact-dossier">
          <div className="dossier-header">
            <h2>ARTIFACT DOSSIER</h2>
            <div className="dossier-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                OVERVIEW
              </button>
              <button 
                className={`tab-btn ${activeTab === 'geometry' ? 'active' : ''}`}
                onClick={() => setActiveTab('geometry')}
              >
                GEOMETRY
              </button>
              <button 
                className={`tab-btn ${activeTab === 'chroma' ? 'active' : ''}`}
                onClick={() => setActiveTab('chroma')}
              >
                CHROMA
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab + selectedArtifact}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="dossier-content"
            >
              {activeTab === 'overview' && (
                <div className="tab-pane">
                  <div className="artifact-meta-group">
                    <span className="artifact-serial">{currentArtifact.serial}</span>
                    <h3 className="artifact-title">{currentArtifact.title}</h3>
                    <p className="artifact-desc">{currentArtifact.description}</p>
                  </div>

                  <div className="spec-grid">
                    <div className="spec-box">
                      <span className="spec-key">Category</span>
                      <span className="spec-val">{currentArtifact.category.toUpperCase()}</span>
                    </div>
                    <div className="spec-box">
                      <span className="spec-key">Release Year</span>
                      <span className="spec-val">{currentArtifact.year}</span>
                    </div>
                    <div className="spec-box">
                      <span className="spec-key">Target Surface</span>
                      <span className="spec-val">{currentArtifact.ratio}</span>
                    </div>
                    <div className="spec-box">
                      <span className="spec-key">Authenticity</span>
                      <span className="spec-val">VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'geometry' && (
                <div className="tab-pane">
                  <div className="geometry-specs">
                    <h4>Vector &amp; Structural Analysis</h4>
                    <p>
                      The SAKIMU TECH STUDIO emblem pairs an expressive Sakura-to-Indigo brush enso with central「咲夢」calligraphy, flanked by botanical sakura blossoms and clean &lt;/&gt; code geometry.
                    </p>
                    <ul className="geo-list">
                      <li><strong>Primary Radius:</strong> Brushstroke circular aperture</li>
                      <li><strong>Stroke Uniformity:</strong> Calligraphic &amp; vector balance</li>
                      <li><strong>Code Motif:</strong> Right-hand &lt;/&gt; &amp; horizontal logic lines</li>
                      <li><strong>Scalability:</strong> Lossless multi-surface translation</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'chroma' && (
                <div className="tab-pane">
                  <div className="chroma-specs">
                    <h4>Palette System</h4>
                    <div className="color-swatch-list">
                      {currentArtifact.colorSpectrum.map((hex, idx) => (
                        <div key={idx} className="swatch-item">
                          <div className="swatch-color" style={{ backgroundColor: hex }} />
                          <div className="swatch-info">
                            <span className="swatch-hex">{hex}</span>
                            <span className="swatch-name">
                              {hex === '#16233F' ? 'Deep Navy' :
                               hex === '#E8628C' ? 'Sakura Pink' :
                               hex === '#F2A0B8' ? 'Soft Pink' :
                               hex === '#FAF6F0' ? 'Rice Paper' : 'Ink Charcoal'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Artifact Selector List */}
          <div className="artifact-selector-section">
            <h4 className="selector-title">SELECT BRAND ARTIFACT</h4>
            <div className="artifact-grid">
              {filteredArtifacts.map((item) => (
                <button
                  key={item.id}
                  className={`artifact-card ${selectedArtifact === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedArtifact(item.id)}
                >
                  <div className="artifact-card-header">
                    <span className="artifact-card-tag">{item.category}</span>
                    <span className="artifact-card-year">{item.year}</span>
                  </div>
                  <div className="artifact-card-title">{item.title}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Asset Diagnostics Grid Section */}
      <section className="asset-diagnostics">
        <div className="diag-header">
          <h3>SYSTEM DIAGNOSTICS &amp; PERFORMANCE METRICS</h3>
          <span className="diag-sub">REAL-TIME EVALUATION</span>
        </div>
        <div className="diag-grid">
          {diagnostics.map((diag) => (
            <div key={diag.id} className="diag-card">
              <div className="diag-card-top">
                <span className="diag-metric">{diag.metric}</span>
                <span className={`diag-status status-${diag.status}`}>{diag.status.toUpperCase()}</span>
              </div>
              <div className="diag-value">{diag.value}</div>
              <p className="diag-detail">{diag.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="atelier-footer">
        <div className="footer-left">
          <span className="footer-brand">SAKIMU TECH STUDIO · 咲夢信息科技工作室</span>
          <span className="footer-copy">© 2026 SAKIMU TECH STUDIO. 用代碼創造美好未來.</span>
        </div>
        <div className="footer-right">
          <span className="footer-node">IDENTITY SPEC: SAKIMU-2026-STD</span>
          <span className="footer-build">BENCHMARK: TYPELIN ARENA LOGO LANDING</span>
        </div>
      </footer>
    </div>
  );
}