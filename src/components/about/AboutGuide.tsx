import React, { useState } from 'react';
interface ActionControlItem {
  name: string;
  location: string;
  desc: string;
  icon: string;
}

const ACTION_CONTROLS: ActionControlItem[] = [
  { name: 'Add Semester', location: 'Toolbar / Top Bar', desc: 'Appends a new semester card with default course slots.', icon: 'fa-calendar-plus' },
  { name: 'Multi-COR Queue', location: 'Toolbar', desc: 'Concurrently uploads and parses multiple PDF Certificate of Registration files.', icon: 'fa-file-pdf' },
  { name: 'Screenshot Buckets', location: 'Toolbar', desc: 'Ingests mobile grade screenshots in groups of up to 3 per term with OCR deduplication.', icon: 'fa-images' },
  { name: 'Compute GPA', location: 'Semester Card', desc: 'Computes term GPA and awards semestral honors (President\'s Lister or Dean\'s Lister).', icon: 'fa-calculator' },
  { name: 'Compute All Semesters', location: 'Dashboard / Header', desc: 'Evaluates all terms instantaneously and checks Latin Graduation Honors.', icon: 'fa-bolt' },
  { name: 'Expand / Collapse All', location: 'Semester Header', desc: 'Toggles accordion visibility across all recorded semester cards.', icon: 'fa-up-down' },
  { name: 'Export to PDF', location: 'Toolbar', desc: 'Generates an official-style, printable academic transcript report.', icon: 'fa-file-export' },
  { name: 'Clear All', location: 'Toolbar', desc: 'Resets recorded academic data with in-app confirmation modal protection.', icon: 'fa-trash-can' },
];

export const AboutGuide: React.FC = () => {
  const [desktopStep, setDesktopStep] = useState(0);
  const [mobileStep, setMobileStep] = useState(0);
  const [isDirOpen, setIsDirOpen] = useState(false);

  return (
    <div className="about-subtab-content active" id="about-guide">
      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-circle-question text-primary"></i> How to Use the Complete Academic Suite
        </h3>
        <p className="guide-note">
          Follow these interactive steps to navigate all calculation, simulation, scanning, and milestone features:
        </p>

        {/* Desktop Guide Workspace */}
        <div className="guide-workspace">
          <div className="guide-steps-list">
            <button
              type="button"
              className={`guide-step-btn ${desktopStep === 0 ? 'active' : ''}`}
              onClick={() => setDesktopStep(0)}
            >
              <i className="fa-solid fa-file-import"></i> 1. Ingestion & Staging
            </button>
            <button
              type="button"
              className={`guide-step-btn ${desktopStep === 1 ? 'active' : ''}`}
              onClick={() => setDesktopStep(1)}
            >
              <i className="fa-solid fa-table-list"></i> 2. Accordions & Grading
            </button>
            <button
              type="button"
              className={`guide-step-btn ${desktopStep === 2 ? 'active' : ''}`}
              onClick={() => setDesktopStep(2)}
            >
              <i className="fa-solid fa-chart-line"></i> 3. Analytics & Badges
            </button>
            <button
              type="button"
              className={`guide-step-btn ${desktopStep === 3 ? 'active' : ''}`}
              onClick={() => setDesktopStep(3)}
            >
              <i className="fa-solid fa-flask"></i> 4. Allocator & Trends
            </button>
            <button
              type="button"
              className={`guide-step-btn ${desktopStep === 4 ? 'active' : ''}`}
              onClick={() => setDesktopStep(4)}
            >
              <i className="fa-solid fa-robot"></i> 5. AI & Scholarships
            </button>
          </div>

          <div className="guide-preview-canvas">
            {desktopStep === 0 && (
              <div className="guide-mockup-slide active">
                <div className="guide-mockup-info">
                  <h4>Step 1: Setup & Smart Ingestion Queue</h4>
                  <p>Build your academic records manually via <strong>Add Semester</strong>, or speed up ingestion with our batch tools: the <strong>Multi-COR PDF Staging Queue</strong> lets you upload and import multiple semesters at once; the <strong>Screenshot Bucket OCR</strong> lets you group up to 3 mobile grade sheet photos per semester with automatic image preprocessing; or use <strong>Bulk Paste</strong> for raw schedule blocks.</p>
                </div>
                <div className="css-mockup-wrapper">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div className="btn btn-primary btn-sm"><i className="fa-solid fa-plus"></i> Add Semester</div>
                    <div className="btn btn-secondary btn-sm"><i className="fa-solid fa-file-pdf text-danger"></i> Multi-COR Queue</div>
                    <div className="btn btn-secondary btn-sm"><i className="fa-solid fa-camera text-primary"></i> Screenshot Buckets</div>
                    <div className="btn btn-secondary btn-sm"><i className="fa-solid fa-paste"></i> Bulk Paste</div>
                  </div>
                </div>
              </div>
            )}

            {desktopStep === 1 && (
              <div className="guide-mockup-slide active">
                <div className="guide-mockup-info">
                  <h4>Step 2: Managing Semester Accordions & Grade Ingestion</h4>
                  <p>Enter course details, select official grades (1.00 to 5.00, INC, or DRP), and set credit units. Click <strong>Compute GPA</strong> on individual cards to lock calculations, or click <strong>Compute Overall GWA</strong> in the list header to evaluate all semesters at once. Cards remain open after computation and can be toggled via Expand / Collapse controls.</p>
                </div>
                <div className="css-mockup-wrapper">
                  <div className="mockup-sem-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>Year 1 - 1st Semester</strong>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--bu-gold)', fontWeight: 700 }}>GPA: 1.2500 • President's Lister</span>
                    </div>
                    <table className="mockup-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Grade</th>
                          <th>Units</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>CS 111</td>
                          <td><input type="text" className="mockup-input" value="1.25" disabled style={{ maxWidth: 44 }} /></td>
                          <td><input type="text" className="mockup-input" value="3" disabled style={{ maxWidth: 30 }} /></td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                      <div className="btn btn-gold btn-sm"><i className="fa-solid fa-calculator"></i> Compute GPA</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {desktopStep === 2 && (
              <div className="guide-mockup-slide active">
                <div className="guide-mockup-info">
                  <h4>Step 3: Dashboard Analytics & Proximity Radars</h4>
                  <p>Monitor your 4-decimal Cumulative GWA and honor standing. Uncomputed terms are marked with a <strong>Partial</strong> indicator. Click <strong>Latin Honors</strong> to see your live point gap to the next honor ceiling, and open <strong>Achievements</strong> to view your 4 colored Milestone Badges (Zero Deficiencies, Honors Pace, Consistent Evaluator, Full Load Regular).</p>
                </div>
                <div className="css-mockup-wrapper">
                  <div className="mockup-gwa-card">
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CUMULATIVE GWA</div>
                    <div className="mockup-gwa-val">1.2167</div>
                    <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontWeight: 700 }}>Candidate for Summa Cum Laude (0.0333 to 1.2500)</span>
                  </div>
                </div>
              </div>
            )}

            {desktopStep === 3 && (
              <div className="guide-mockup-slide active">
                <div className="guide-mockup-info">
                  <h4>Step 4: Simulator, Target Grade Allocator & Trajectory</h4>
                  <p>Open the <strong>Simulator</strong> tab for forecasting: use the <strong>Anticipated Grade Slider</strong> (0.05 step precision) to project future GWA; use the <strong>Subject Target Allocator</strong> to lock expected marks in GE/PE subjects and reverse-solve the exact grades required in remaining majors; and track your semestral progression against Latin Honor benchmarks on the <strong>Academic Trend SVG Chart</strong>.</p>
                </div>
                <div className="css-mockup-wrapper">
                  <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Target Honor: President's Lister (1.4500)</div>
                    <div style={{ padding: '8px 12px', background: 'var(--card-header-bg)', borderRadius: 6, margin: '8px 0', fontSize: '0.74rem', color: 'var(--text-primary)' }}>
                      Locked: GE (1.25) → Remaining Majors Need: <strong>1.48 or better</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--bu-orange)' }}><i className="fa-solid fa-chart-line"></i> Trajectory: Summa/Magna Range</div>
                  </div>
                </div>
              </div>
            )}

            {desktopStep === 4 && (
              <div className="guide-mockup-slide active">
                <div className="guide-mockup-info">
                  <h4>Step 5: Bueño AI Handbook Advisor & Scholarship Monitor</h4>
                  <p>Click <strong>Ask Bueño AI</strong> for instant handbook guidance grounded in official Bicol University regulations, run 1-click transcript diagnostics, and navigate to the <strong>Scholarship</strong> view to verify retention criteria for DOST, CHED, TES, or Athletic grants.</p>
                </div>
                <div className="css-mockup-wrapper">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 280 }}>
                    <div style={{ padding: 10, background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-robot" style={{ color: '#7c3aed' }}></i>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bueño AI: Official Handbook Knowledge</span>
                    </div>
                    <div style={{ padding: 10, background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-graduation-cap" style={{ color: '#0284c7' }}></i>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Scholarship: DOST / CHED Compliance</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Guide Step Carousel */}
        <div className="guide-carousel">
          <div className="mobile-carousel-container">
            <div className="mobile-carousel-track">
              {mobileStep === 0 && (
                <div className="mobile-carousel-slide active">
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    <i className="fa-solid fa-file-import text-primary"></i> 1. Ingestion & Staging
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                    Add semesters manually, queue multiple COR PDF files in one batch, upload screenshots into semester buckets, or use bulk paste.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-plus"></i> Add</span>
                    <span className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-file-pdf text-danger"></i> Multi-COR</span>
                    <span className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-camera text-primary"></i> OCR Buckets</span>
                  </div>
                </div>
              )}

              {mobileStep === 1 && (
                <div className="mobile-carousel-slide active">
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    <i className="fa-solid fa-table-list text-primary"></i> 2. Accordions & Grading
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                    Input numeric marks and credit units. Semester cards remain open after computation, with individual and global Collapse controls available.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    <span className="btn btn-gold btn-sm" style={{ fontSize: '0.75rem' }}><i className="fa-solid fa-calculator"></i> Compute GPA</span>
                  </div>
                </div>
              )}

              {mobileStep === 2 && (
                <div className="mobile-carousel-slide active">
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    <i className="fa-solid fa-chart-line text-primary"></i> 3. Analytics & Badges
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                    Inspect 4-decimal Cumulative GWA, Latin Honor proximity, and unlock the 4 colored Milestone Badges (Zero Deficiencies, Honors Pace, Streak, Full Load).
                  </p>
                  <div style={{ textAlign: 'center', padding: 10, background: 'var(--card-header-bg)', borderRadius: 6, margin: '0 auto', width: '85%' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CUMULATIVE GWA</div>
                    <strong style={{ color: 'var(--bu-azure)', fontSize: '1.25rem' }}>1.2167</strong>
                  </div>
                </div>
              )}

              {mobileStep === 3 && (
                <div className="mobile-carousel-slide active">
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    <i className="fa-solid fa-flask text-primary"></i> 4. Allocator & Trends
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                    Use the Simulator slider, reverse-solve required grades in the Target Allocator, and view your multi-semester trend on the SVG chart.
                  </p>
                  <input type="range" min="1" max="3" step="0.05" value="1.5" disabled style={{ width: '80%', margin: '0 auto', display: 'block', accentColor: 'var(--bu-orange)' }} />
                </div>
              )}

              {mobileStep === 4 && (
                <div className="mobile-carousel-slide active">
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-primary)' }}>
                    <i className="fa-solid fa-robot text-primary"></i> 5. AI & Scholarships
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14 }}>
                    Ask the Bueño AI Advisor official handbook questions, run 1-click transcript diagnostics, and verify scholarship retention compliance.
                  </p>
                  <div style={{ padding: 8, background: 'rgba(124, 58, 237, 0.12)', borderRadius: 6, textAlign: 'center', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, width: '85%', margin: '0 auto' }}>
                    <i className="fa-solid fa-robot"></i> Bueño AI & Scholarship Monitor Active
                  </div>
                </div>
              )}
            </div>

            {/* Carousel Controls */}
            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-nav-btn"
                disabled={mobileStep === 0}
                onClick={() => setMobileStep((p) => Math.max(0, p - 1))}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className="carousel-dots">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`carousel-dot ${mobileStep === i ? 'active' : ''}`}
                    onClick={() => setMobileStep(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="carousel-nav-btn"
                disabled={mobileStep === 4}
                onClick={() => setMobileStep((p) => Math.min(4, p + 1))}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* IN-DEPTH SIMULATORS & TOOLBAR BUTTONS REFERENCE */}
        <div className="guide-section" style={{ marginTop: '28px' }}>
          <h3 className="guide-section-title">
            <i className="fa-solid fa-calculator text-primary"></i> Simulation Modules &amp; Controls Reference
          </h3>
          <p className="guide-note">
            Every calculation engine, forecasting simulator, and toolbar control in the Academic Suite serves a distinct role in your collegiate journey:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
            {/* Card 1: What-If */}
            <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-flask text-primary" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)' }}>What-If Scenario Simulator</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Degree-Wide Cumulative GWA Forecast</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                Forecasts your final cumulative graduation GWA by simulating remaining academic units and anticipated grade averages.
              </p>
              <div style={{ padding: '10px', borderRadius: '6px', background: 'var(--card-header-bg)', fontSize: '0.78rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                <strong>Why Latin Honor Pace (not PL/DL)?</strong> President's Lister (≤1.4500) and Dean's Lister (≤1.7500) are <em>single-semester</em> honors with individual grade caps and minimum 15 units. The What-If Simulator projects <em>4-year cumulative graduation GWA</em>, which is governed by Latin Honor standards (Summa ≤1.2500, Magna ≤1.4500, Cum Laude ≤1.7500).
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <strong>Target Honor Finder:</strong> Reverse-calculates the exact minimum grade needed in your remaining units to graduate with your desired Latin honor.
              </div>
            </div>

            {/* Card 2: Allocator */}
            <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-bullseye text-gold" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Target Grade Allocator</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Semestral Reverse Solver</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                Solves for the exact uniform grades you must attain in major subjects by locking in expected marks in General Education or Physical Education courses.
              </p>
              <ul style={{ margin: '0 0 10px 0', paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Lock Confident Courses:</strong> Lock 1.00 or 1.25 in minor/GE courses.</li>
                <li><strong>Dynamic Reverse Math:</strong> Computes the exact buffer required across unlocked major units.</li>
                <li><strong>1-Tap Apply:</strong> Push calculated target grades directly into the active semester sheet.</li>
              </ul>
            </div>

            {/* Card 3: Trend */}
            <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-chart-line text-success" style={{ fontSize: '1.1rem' }}></i>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)' }}>Academic Trend &amp; Trajectory</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Multi-Term SVG Visualization</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                Visualizes semester-to-semester volatility against your cumulative GWA progression and BU honor benchmarks.
              </p>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Blue Line:</strong> Term GPA reflecting term difficulty and volatility.</li>
                <li><strong>Orange Line:</strong> Cumulative GWA reflecting total degree stability.</li>
                <li><strong>Dashed Lines:</strong> Summa (≤1.25), Magna (≤1.45), and Cum Laude (≤1.75) target horizons.</li>
              </ul>
            </div>
          </div>

          {/* Action Toolbar Reference Directory (Collapsible Accordion) */}
          <div className="action-directory-container">
            <button
              type="button"
              className="action-dir-header"
              onClick={() => setIsDirOpen((prev) => !prev)}
              aria-expanded={isDirOpen}
              aria-controls="action-dir-content"
            >
              <div className="action-dir-title-group">
                <span className="action-dir-title">
                  <i className="fa-solid fa-wrench text-primary"></i> Action Controls &amp; Buttons Directory
                </span>
                <span className="action-dir-count-badge">8 Core Controls</span>
                <span className="action-dir-subtitle desktop-only">• Toolbar, Semester Cards &amp; Header</span>
              </div>
              <div className="action-dir-toggle-pill">
                <span>{isDirOpen ? 'Hide Directory' : 'View Directory'}</span>
                <i className={`fa-solid fa-chevron-down action-dir-chevron ${isDirOpen ? 'is-open' : ''}`}></i>
              </div>
            </button>

            {isDirOpen && (
              <div className="action-dir-body" id="action-dir-content">
                {/* Desktop Table View (>768px) */}
                <div className="desktop-only table-responsive" style={{ marginTop: '12px' }}>
                  <table className="policy-table action-dir-table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '28%' }}>Button / Control</th>
                        <th style={{ width: '24%' }}>Location</th>
                        <th>Function &amp; Behavior</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ACTION_CONTROLS.map((ctrl) => (
                        <tr key={ctrl.name}>
                          <td>
                            <strong>
                              <i className={`fa-solid ${ctrl.icon} text-primary`} style={{ marginRight: '8px' }}></i>
                              {ctrl.name}
                            </strong>
                          </td>
                          <td>
                            <span className="action-loc-badge">{ctrl.location}</span>
                          </td>
                          <td>{ctrl.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View (<=768px) */}
                <div className="mobile-only action-dir-mobile" style={{ marginTop: '12px' }}>
                  {ACTION_CONTROLS.map((ctrl) => (
                    <div key={ctrl.name} className="action-dir-card">
                      <div className="action-dir-card-header">
                        <span className="action-dir-card-name">
                          <i className={`fa-solid ${ctrl.icon} text-primary`}></i>
                          {ctrl.name}
                        </span>
                        <span className="action-loc-badge">{ctrl.location}</span>
                      </div>
                      <p className="action-dir-card-desc">{ctrl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
