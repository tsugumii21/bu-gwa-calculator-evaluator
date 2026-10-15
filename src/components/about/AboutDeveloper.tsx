import React, { useState } from 'react';

export const AboutDeveloper: React.FC = () => {
  const [openCapabilities, setOpenCapabilities] = useState<Set<number>>(new Set());

  // Suggestions form state
  const [sugName, setSugName] = useState('');
  const [sugEmail, setSugEmail] = useState('');
  const [sugCategory, setSugCategory] = useState('feature');
  const [sugMessage, setSugMessage] = useState('');
  const [sugStatus, setSugStatus] = useState<string | null>(null);

  const toggleCapability = (id: number) => {
    setOpenCapabilities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllCapabilities = () => {
    setOpenCapabilities((prev) => (prev.size === 9 ? new Set() : new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugMessage.trim()) return;
    setSugStatus('Thank you! Your feedback has been recorded.');
    setSugName('');
    setSugEmail('');
    setSugMessage('');
    setTimeout(() => setSugStatus(null), 5000);
  };

  return (
    <div className="about-subtab-content active" id="about-developer">
      <div className="guide-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <h3 className="guide-section-title" style={{ margin: 0 }}>
            <i className="fa-solid fa-layer-group text-gold"></i> Core Platform Capabilities & Feature Architecture
          </h3>
          <button
            type="button"
            className="accordion-toggle-all-btn"
            onClick={toggleAllCapabilities}
          >
            <i className={`fa-solid ${openCapabilities.size === 9 ? 'fa-compress' : 'fa-expand'}`}></i>
            {openCapabilities.size === 9 ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        <p className="guide-note">
          Engineered exclusively for Bicol University students with a comprehensive suite of academic tools:
        </p>

        {/* Desktop Bento Grid */}
        <div className="capabilities-bento">
          {/* Row 1, Card 1: GWA Math (Span 2 Hero) */}
          <div className="bento-card bento-col-2 accent-blue">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(1)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-blue">
                    <i className="fa-solid fa-calculator"></i>
                  </div>
                  <span className="bento-category-pill pill-blue">
                    <i className="fa-solid fa-circle-check"></i> Core Arithmetic
                  </span>
                </div>
                <h4>Dynamic 4-Decimal GWA Math Engine</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(1) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(1) ? 'is-expanded' : ''}`}>
              <p>
                Precision arithmetic engine computing exact semestral GPA and cumulative GWA to 4 decimal places per BU BOR Res. 89 s. 2006. Strict mathematical boundary separation isolates draft loads and non-numerical marks (INC/DRP).
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> BOR Res. 89 s. 2006</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> 4-Decimal Precision</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Draft Isolation</span>
              </div>
            </div>
          </div>

          {/* Row 1, Card 2: Ingestion Suite (Span 1) */}
          <div className="bento-card accent-red">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(2)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-red">
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                  <span className="bento-category-pill pill-red">
                    <i className="fa-solid fa-shield"></i> Client Ingestion
                  </span>
                </div>
                <h4>Multi-COR & Screenshot OCR</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(2) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(2) ? 'is-expanded' : ''}`}>
              <p>
                Multi-file PDF queue for one-click batch import, plus a multi-semester screenshot bucket OCR engine with client-side Tesseract.js and Canvas preprocessing.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> PDF Staging Queue</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Zero-Server OCR</span>
              </div>
            </div>
          </div>

          {/* Row 2, Card 3: Honors Lister (Span 1) */}
          <div className="bento-card accent-gold">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(3)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-gold">
                    <i className="fa-solid fa-medal"></i>
                  </div>
                  <span className="bento-category-pill pill-gold">
                    <i className="fa-solid fa-award"></i> Academic Honors
                  </span>
                </div>
                <h4>Term Honors & Proximity Radar</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(3) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(3) ? 'is-expanded' : ''}`}>
              <p>
                Real-time qualification checks for President's Lister (≤1.4500) and Dean's Lister (≤1.7500) with grade-cap safeguards and Latin honor point gap tracking.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> PL & DL Cutoffs</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Latin Point Gap</span>
              </div>
            </div>
          </div>

          {/* Row 2, Card 4: Milestone Badges (Span 1) */}
          <div className="bento-card accent-green">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(4)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-green">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <span className="bento-category-pill pill-green">
                    <i className="fa-solid fa-trophy"></i> Progress Metrics
                  </span>
                </div>
                <h4>Academic Milestone Badges</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(4) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(4) ? 'is-expanded' : ''}`}>
              <p>
                Gamified achievement tracking with distinct semantic badges: Zero Deficiencies (Emerald), Honors Pace (Gold), Consistent Evaluator (Flame), and Full Regular (Sapphire).
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> 4 Semantic Tints</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Live Progression</span>
              </div>
            </div>
          </div>

          {/* Row 2, Card 5: Underload & Deficiencies (Span 1) */}
          <div className="bento-card accent-amber">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(5)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-amber">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <span className="bento-category-pill pill-amber">
                    <i className="fa-solid fa-circle-exclamation"></i> Policy Safeguards
                  </span>
                </div>
                <h4>Underload & Deficiency Watch</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(5) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(5) ? 'is-expanded' : ''}`}>
              <p>
                Automated guards flagging underloaded semesters (&lt;15 units), unremoved INCs nearing the 1-year calendar deadline, and failing marks that void honor qualification.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> 1-Year INC Watch</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Underload Alert</span>
              </div>
            </div>
          </div>

          {/* Row 3, Card 6: Simulator & Reverse Allocator (Span 2) */}
          <div className="bento-card bento-col-2 accent-orange">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(6)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-orange">
                    <i className="fa-solid fa-flask"></i>
                  </div>
                  <span className="bento-category-pill pill-orange">
                    <i className="fa-solid fa-sliders"></i> Reverse-Solver
                  </span>
                </div>
                <h4>Scenario Simulator & Subject Target Allocator</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(6) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(6) ? 'is-expanded' : ''}`}>
              <p>
                Projects future cumulative GWA with a 0.05 step precision slider. Includes an intelligent reverse-solver: lock expected grades in GE/PE subjects to dynamically back-calculate the exact marks required in remaining majors.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> 0.05 Step Slider</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Target Grade Solver</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Course Locks</span>
              </div>
            </div>
          </div>

          {/* Row 3, Card 7: Trend Visualizer (Span 1) */}
          <div className="bento-card accent-blue">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(7)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-blue">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <span className="bento-category-pill pill-blue">
                    <i className="fa-solid fa-chart-simple"></i> Visual Analytics
                  </span>
                </div>
                <h4>Academic Trend Visualizer</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(7) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(7) ? 'is-expanded' : ''}`}>
              <p>
                Zero-dependency lightweight SVG trajectory chart plotting semestral GPAs against running cumulative GWA alongside official Summa, Magna, and Cum Laude target horizons.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Pure SVG Chart</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Honor Baselines</span>
              </div>
            </div>
          </div>

          {/* Row 4, Card 8: Scholarship Monitor (Span 1) */}
          <div className="bento-card accent-cyan">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(8)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-cyan">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <span className="bento-category-pill pill-cyan">
                    <i className="fa-solid fa-stamp"></i> Grant Compliance
                  </span>
                </div>
                <h4>Scholarship Retention Monitor</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(8) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(8) ? 'is-expanded' : ''}`}>
              <p>
                Compliance benchmarking engine matching student academic standing against official maintenance criteria for DOST-SEI Merit, CHED Merit, UniFAST TES, and BU Athletic grants.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> DOST / CHED Presets</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Retention Check</span>
              </div>
            </div>
          </div>

          {/* Row 4, Card 9: Bueño AI Handbook Advisor (Span 2 Hero Footer) */}
          <div className="bento-card bento-col-2 accent-purple">
            <div
              className="accordion-card-header"
              onClick={() => toggleCapability(9)}
            >
              <div style={{ flex: 1 }}>
                <div className="bento-top-row">
                  <div className="feat-icon-badge badge-purple">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <span className="bento-category-pill pill-purple">
                    <i className="fa-solid fa-sparkles"></i> AI Academic Advisor
                  </span>
                </div>
                <h4>Bueño AI Handbook Advisor & Intelligent Evaluation</h4>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openCapabilities.has(9) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openCapabilities.has(9) ? 'is-expanded' : ''}`}>
              <p>
                Intelligent assistant trained on the complete Bicol University Student Handbook. Features on-device handbook search, 1-click "Analyze My Grades" academic diagnostics, retention risk assessment, and safe rate-limited conversational guidance.
              </p>
              <div className="bento-chips">
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Complete Handbook Knowledge</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> 1-Click Transcript Diagnostic</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Offline Search</span>
                <span className="bento-chip"><i className="fa-solid fa-check"></i> Rate-Limited Safety</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-code text-primary"></i> Developer & Project Information
        </h3>
        <div className="developer-box">
          <div className="dev-info">
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Allen Del Valle
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              BSIT Student at BU Polangui · Creator & Maintainer
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
              Designed and developed as an open-source contribution to empower Bicol University students with modern, accessible, and precise academic tracking tools.
            </p>
            <div className="dev-links" style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/tsugumii21"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <i className="fa-brands fa-github"></i> GitHub Profile
              </a>
              <a
                href="https://github.com/tsugumii21/bu-gwa-calculator-evaluator"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <i className="fa-solid fa-code-branch"></i> View Repository
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-layer-group text-primary"></i> Technology Stack & Architecture
        </h3>
        <div className="tech-stack-container">
          {/* Category 1: Core Framework & Runtime */}
          <div className="tech-stack-category">
            <h4 className="tech-cat-title">
              <i className="fa-solid fa-code text-primary"></i> Core Framework & Runtime
            </h4>
            <div className="tech-stack-grid">
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">React 19</span>
                  <span className="tech-item-badge">UI Library</span>
                </div>
                <p className="tech-item-desc">Component-driven reactive user interface architecture.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">TypeScript 5.6</span>
                  <span className="tech-item-badge">Language</span>
                </div>
                <p className="tech-item-desc">Strict type-safe arithmetic, grade validation, and domain models.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Vite 6</span>
                  <span className="tech-item-badge">Build Tool</span>
                </div>
                <p className="tech-item-desc">Next-generation frontend bundler with optimized production minification.</p>
              </div>
            </div>
          </div>

          {/* Category 2: State Management & Storage */}
          <div className="tech-stack-category">
            <h4 className="tech-cat-title">
              <i className="fa-solid fa-database text-blue"></i> State Management & Local Storage
            </h4>
            <div className="tech-stack-grid">
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Zustand 5</span>
                  <span className="tech-item-badge">State Engine</span>
                </div>
                <p className="tech-item-desc">Lightweight centralized state store for multi-term tracking.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">HTML5 LocalStorage</span>
                  <span className="tech-item-badge">Client Storage</span>
                </div>
                <p className="tech-item-desc">100% on-device data persistence with zero external server dependencies.</p>
              </div>
            </div>
          </div>

          {/* Category 3: Document & Computer Vision */}
          <div className="tech-stack-category">
            <h4 className="tech-cat-title">
              <i className="fa-solid fa-file-invoice text-red"></i> Document Ingestion & Computer Vision
            </h4>
            <div className="tech-stack-grid">
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Mozilla PDF.js 3.11</span>
                  <span className="tech-item-badge">Document Parser</span>
                </div>
                <p className="tech-item-desc">Client-side binary parsing of Certificate of Registration (COR) PDFs.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Tesseract.js 7.0</span>
                  <span className="tech-item-badge">WebAssembly OCR</span>
                </div>
                <p className="tech-item-desc">Zero-server optical character recognition for grade table screenshots.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">HTML5 Canvas API</span>
                  <span className="tech-item-badge">Computer Vision</span>
                </div>
                <p className="tech-item-desc">Grayscale thresholding and adaptive contrast image preprocessing.</p>
              </div>
            </div>
          </div>

          {/* Category 4: AI & Knowledge Engine */}
          <div className="tech-stack-category">
            <h4 className="tech-cat-title">
              <i className="fa-solid fa-robot text-purple"></i> Artificial Intelligence & Handbook Knowledge
            </h4>
            <div className="tech-stack-grid">
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Google Gemini API</span>
                  <span className="tech-item-badge">LLM Engine</span>
                </div>
                <p className="tech-item-desc">Context-grounded advisor trained on Bicol University Student Handbook regulations.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">On-Device Keyword Index</span>
                  <span className="tech-item-badge">Search Index</span>
                </div>
                <p className="tech-item-desc">Offline fallback handbook article retrieval system.</p>
              </div>
            </div>
          </div>

          {/* Category 5: Design System & Styling */}
          <div className="tech-stack-category">
            <h4 className="tech-cat-title">
              <i className="fa-solid fa-palette text-gold"></i> Design System & UI Engineering
            </h4>
            <div className="tech-stack-grid">
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">CSS3 Design Tokens</span>
                  <span className="tech-item-badge">Design System</span>
                </div>
                <p className="tech-item-desc">Native custom properties with strict Dark and Light theme compliance.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">Lottie React</span>
                  <span className="tech-item-badge">Animation</span>
                </div>
                <p className="tech-item-desc">Lightweight vector micro-interactions for grade computation feedback.</p>
              </div>
              <div className="tech-item-card">
                <div className="tech-item-header">
                  <span className="tech-item-name">FontAwesome 6</span>
                  <span className="tech-item-badge">Iconography</span>
                </div>
                <p className="tech-item-desc">Universal vector iconography system with semantic color tokens.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-paper-plane text-gold"></i> Send Suggestions & Feedback to Developer
        </h3>
        <div
          style={{
            padding: 24,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginTop: 12,
          }}
        >
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
            Have an idea for a new feature, found an issue, or want to share feedback? We'd love to hear from you! Send your thoughts directly to help improve the platform.
          </p>
          <form onSubmit={handleSuggestionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={sugName}
                  onChange={(e) => setSugName(e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={sugEmail}
                  onChange={(e) => setSugEmail(e.target.value)}
                  placeholder="e.g. juan@bicol-u.edu.ph"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Feedback Category
                </label>
                <select
                  className="form-control"
                  value={sugCategory}
                  onChange={(e) => setSugCategory(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="feature">New Feature Suggestion</option>
                  <option value="bug">Bug Report / Math Calculation</option>
                  <option value="policy">BU Handbook Policy Update</option>
                  <option value="feedback">General Student Feedback</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Your Message / Suggestion *
              </label>
              <textarea
                rows={5}
                className="form-control"
                value={sugMessage}
                onChange={(e) => setSugMessage(e.target.value)}
                placeholder="Describe your feedback, feature idea, or bug report in detail..."
                required
                style={{ width: '100%', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <i className="fa-solid fa-paper-plane"></i> Send Suggestion
              </button>
              {sugStatus && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-success)' }}>
                  <i className="fa-solid fa-circle-check"></i> {sugStatus}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
