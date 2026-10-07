import React, { useState } from 'react';

type AboutSubtab = 'overview' | 'guide' | 'policies' | 'developer';

export const AboutView: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<AboutSubtab>('overview');
  const [desktopStep, setDesktopStep] = useState(0);
  const [mobileStep, setMobileStep] = useState(0);

  // Suggestions form state
  const [sugName, setSugName] = useState('');
  const [sugEmail, setSugEmail] = useState('');
  const [sugCategory, setSugCategory] = useState('feature');
  const [sugMessage, setSugMessage] = useState('');
  const [sugStatus, setSugStatus] = useState<string | null>(null);

  // Mobile accordion state (clauses 1-5, policies 1-8, capabilities 1-9)
  const [openClauses, setOpenClauses] = useState<Set<number>>(new Set());
  const [openPolicies, setOpenPolicies] = useState<Set<number>>(new Set());
  const [openCapabilities, setOpenCapabilities] = useState<Set<number>>(new Set());

  const toggleClause = (id: number) => {
    setOpenClauses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllClauses = () => {
    setOpenClauses((prev) => (prev.size === 5 ? new Set() : new Set([1, 2, 3, 4, 5])));
  };

  const togglePolicy = (id: number) => {
    setOpenPolicies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPolicies = () => {
    setOpenPolicies((prev) => (prev.size === 8 ? new Set() : new Set([1, 2, 3, 4, 5, 6, 7, 8])));
  };

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
    <div className="tab-pane active" id="tab-about">
      <div className="section-header">
        <h2>
          <i className="fa-solid fa-circle-info text-primary"></i> About & Official Academic Governance
        </h2>
        <p className="section-desc">
          Learn more about the project, official policies, platform capabilities, and developer.
        </p>
      </div>

      {/* SUB-TAB BAR */}
      <div className="subtab-bar" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('overview')}
        >
          <i className="fa-solid fa-book-open"></i> Overview & Disclaimer
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('guide')}
        >
          <i className="fa-solid fa-circle-question"></i> How to Use
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('policies')}
        >
          <i className="fa-solid fa-landmark"></i> Handbook Policy Governance
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'developer' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('developer')}
        >
          <i className="fa-solid fa-user-gear"></i> Developer & Feedback
        </button>
      </div>

      {/* ── SUB-TAB 1: OVERVIEW & DISCLAIMER ── */}
      {activeSubtab === 'overview' && (
        <div className="about-subtab-content active" id="about-overview">
          <div className="guide-section">
            <div
              className="about-hero-box"
              style={{
                padding: 28,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="brand-logo"
                style={{
                  width: 58,
                  height: 58,
                  fontSize: '1.75rem',
                  marginBottom: 14,
                  background: 'linear-gradient(135deg, var(--bu-orange), var(--bu-gold))',
                  color: '#fff',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="images/bu-app-logo.png"
                  alt="BU GWA Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                Bicol University GWA Calculator & Academic Evaluator
              </h3>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  marginTop: 10,
                  lineHeight: 1.6,
                  maxWidth: 820,
                }}
              >
                The <strong>Bicol University GWA Calculator</strong> is an independent, state-of-the-art web application engineered specifically for Bicol University students across all colleges and campuses. Governed strictly by the <strong>Bicol University Student Handbook (BOR Res. 89 s. 2006)</strong>, this platform provides an all-in-one suite for 4-decimal General Weighted Average computation, semester Dean's and President's Lister verification, multi-term academic trend trajectory tracking, per-subject target grade reverse-solving, multi-COR PDF and screenshot OCR ingestion, and handbook policy guidance powered by the Bueño AI Advisor.
              </p>
              <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href="BU-Student-Handbook.pdf"
                  download="BU-Student-Handbook.pdf"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    textDecoration: 'none',
                    padding: '10px 18px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <i className="fa-solid fa-file-pdf" style={{ fontSize: '1.1rem', color: '#ef4444' }}></i> Download Official Student Handbook (PDF)
                </a>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <div className="about-bu-box">
              <div className="bu-header">
                <i className="fa-solid fa-graduation-cap"></i>
                <h4>About Bicol University</h4>
              </div>
              <div className="bu-content">
                <p>
                  <strong>Bicol University (BU)</strong> is the premier state university of the Bicol Region, Philippines. Established on June 21, 1969 under Republic Act 5521, Bicol University has committed itself to producing top-tier professionals and leaders. Guided by its core values of <em>Scholarship, Leadership, Character, and Service</em>, the university operates across campuses in Albay and Sorsogon.
                </p>
                <p style={{ marginTop: 10, marginBottom: 14, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Explore the official portals below for administrative inquiries, official academic records, grade verification, and enrollment guidelines:
                </p>
                <div className="bu-links-grid">
                  <a href="https://bicol-u.edu.ph/" target="_blank" rel="noopener noreferrer" className="bu-link-card">
                    <div className="link-card-icon"><i className="fa-solid fa-globe"></i></div>
                    <div className="link-details">
                      <strong>Official BU Website</strong>
                      <span className="url-text">bicol-u.edu.ph <i className="fa-solid fa-up-right-from-square mini-arrow"></i></span>
                    </div>
                  </a>
                  <a href="https://ibu.bicol-u.edu.ph/" target="_blank" rel="noopener noreferrer" className="bu-link-card">
                    <div className="link-card-icon"><i className="fa-solid fa-user-shield"></i></div>
                    <div className="link-details">
                      <strong>iBU Student Portal</strong>
                      <span className="url-text">ibu.bicol-u.edu.ph <i className="fa-solid fa-up-right-from-square mini-arrow"></i></span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="guide-section">
            <div
              className="welcome-disclaimer-box"
              style={{
                marginBottom: 0,
                padding: '24px 28px',
                background: 'var(--card-bg)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div
                  className="disclaimer-header"
                  style={{
                    fontSize: '1.2rem',
                    color: 'var(--bu-orange)',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    margin: 0,
                  }}
                >
                  <i className="fa-solid fa-scale-balanced" style={{ fontSize: '1.35rem' }}></i> Official Academic Disclaimer & Governance
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="accordion-toggle-all-btn"
                    onClick={toggleAllClauses}
                  >
                    <i className={`fa-solid ${openClauses.size === 5 ? 'fa-compress' : 'fa-expand'}`}></i>
                    {openClauses.size === 5 ? 'Collapse All' : 'Expand All'}
                  </button>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: 'rgba(234, 88, 12, 0.12)',
                      color: 'var(--bu-orange)',
                      border: '1px solid rgba(234, 88, 12, 0.3)',
                    }}
                  >
                    <i className="fa-solid fa-shield-halved"></i> Statutory Notice
                  </span>
                </div>
              </div>

              <div
                className="disclaimer-text"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  fontSize: '0.88rem',
                  lineHeight: 1.65,
                  color: 'var(--text-primary)',
                }}
              >
                {/* Clause 1 */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--subtle-bg, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="accordion-card-header"
                    onClick={() => toggleClause(1)}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', marginBottom: openClauses.has(1) ? 6 : 0, fontSize: '0.92rem' }}>
                      <i className="fa-solid fa-landmark text-primary"></i>
                      Clause I — Institutional Independence & Non-Affiliation
                    </strong>
                    <i className={`fa-solid fa-chevron-down accordion-chevron ${openClauses.has(1) ? 'is-open' : ''}`}></i>
                  </div>
                  <div className={`accordion-card-body ${openClauses.has(1) ? 'is-expanded' : ''}`}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      The <strong>Bicol University GWA Calculator & Academic Evaluator</strong> is an independent, non-commercial software project engineered by student software developers. It is <strong>not officially affiliated with, endorsed, sponsored, administered, or operated by Bicol University, the Board of Regents (BOR), or university administration</strong>. Any reference to "Bicol University", "BU", "iBU", campus names, or heraldic emblems is made strictly for nominative identification, educational reference, and student community public service.
                    </p>
                  </div>
                </div>

                {/* Clause 2 */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--subtle-bg, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="accordion-card-header"
                    onClick={() => toggleClause(2)}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', marginBottom: openClauses.has(2) ? 6 : 0, fontSize: '0.92rem' }}>
                      <i className="fa-solid fa-stamp text-primary"></i>
                      Clause II — Sole Certification Authority of the University Registrar (OUR) & College Deans
                    </strong>
                    <i className={`fa-solid fa-chevron-down accordion-chevron ${openClauses.has(2) ? 'is-open' : ''}`}></i>
                  </div>
                  <div className={`accordion-card-body ${openClauses.has(2) ? 'is-expanded' : ''}`}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      All numeric GWA calculations, President's Lister and Dean's Lister classifications, Latin graduation honor forecasts, and scholarship retention evaluations generated by this platform remain <strong>strictly advisory simulations for self-monitoring only</strong>. The sole, authoritative legal and institutional body empowered to certify academic grades, confer graduation honors, and issue official documents is the <strong>Bicol University Office of the University Registrar (OUR)</strong> in concurrence with respective College Deans. This web application does not replace, supersede, or modify the official student academic evaluation.
                    </p>
                  </div>
                </div>

                {/* Clause 3 */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--subtle-bg, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="accordion-card-header"
                    onClick={() => toggleClause(3)}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', marginBottom: openClauses.has(3) ? 6 : 0, fontSize: '0.92rem' }}>
                      <i className="fa-solid fa-triangle-exclamation text-primary"></i>
                      Clause III — Anti-Falsification Policy & Prohibition of Document Misrepresentation
                    </strong>
                    <i className={`fa-solid fa-chevron-down accordion-chevron ${openClauses.has(3) ? 'is-open' : ''}`}></i>
                  </div>
                  <div className={`accordion-card-body ${openClauses.has(3) ? 'is-expanded' : ''}`}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      All generated outputs—including exported PDF academic worksheets and printable grade rosters—are personal planning aids and educational reference worksheets. <strong>Presenting, altering, submitting, or utilizing any graphic or output generated by this software as an Official Transcript of Records (OTR), certified Certificate of Registration (COR), or verified institutional document before scholarship boards, employers, government agencies, or university committees is strictly prohibited</strong> and constitutes academic dishonesty and falsification punishable under the Bicol University Student Code of Conduct, the Cybercrime Prevention Act of 2012 (RA 10175), and the Revised Penal Code of the Philippines.
                    </p>
                  </div>
                </div>

                {/* Clause 4 */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--subtle-bg, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="accordion-card-header"
                    onClick={() => toggleClause(4)}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', marginBottom: openClauses.has(4) ? 6 : 0, fontSize: '0.92rem' }}>
                      <i className="fa-solid fa-shield-halved text-primary"></i>
                      Clause IV — Absolute Limitation of Liability
                    </strong>
                    <i className={`fa-solid fa-chevron-down accordion-chevron ${openClauses.has(4) ? 'is-open' : ''}`}></i>
                  </div>
                  <div className={`accordion-card-body ${openClauses.has(4) ? 'is-expanded' : ''}`}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Under no circumstances shall the developer, contributors, or hosting platforms be held legally or academically liable for any academic disqualifications, scholarship forfeitures, grade contestations, course load disputes, or curriculum misinterpretations arising from the use of or reliance on this calculator. Students maintain personal responsibility to review their official curriculum checklist and confirm all graduation requirements directly with their respective Department Chairperson and College Registrar.
                    </p>
                  </div>
                </div>

                {/* Clause 5 */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--subtle-bg, rgba(0,0,0,0.02))',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div
                    className="accordion-card-header"
                    onClick={() => toggleClause(5)}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', marginBottom: openClauses.has(5) ? 6 : 0, fontSize: '0.92rem' }}>
                      <i className="fa-solid fa-lock text-primary"></i>
                      Clause V — Zero-Knowledge Privacy Architecture & Philippine Data Privacy Act (RA 10173)
                    </strong>
                    <i className={`fa-solid fa-chevron-down accordion-chevron ${openClauses.has(5) ? 'is-open' : ''}`}></i>
                  </div>
                  <div className={`accordion-card-body ${openClauses.has(5) ? 'is-expanded' : ''}`}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      This application operates on a <strong>100% client-side, zero-telemetry architecture</strong>. Uploaded Certificate of Registration (COR) PDF files, mobile screenshots, student names, course titles, and numeric grades are parsed entirely inside your browser's sandboxed local memory via client-side WebAssembly, Canvas, and Tesseract.js. No student credentials, portal passwords, or scholastic data are ever transmitted across external networks, saved to remote databases, or collected. The platform fully complies with Republic Act 10173 (Data Privacy Act of 2012).
                    </p>
                  </div>
                </div>
              </div>

              {/* Official Registry Channels */}
              <div
                style={{
                  marginTop: 20,
                  padding: '14px 18px',
                  background: 'rgba(234, 88, 12, 0.06)',
                  border: '1px dashed rgba(234, 88, 12, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-building-columns" style={{ fontSize: '1.2rem', color: 'var(--bu-orange)' }}></i>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      Need Official Academic Records or Grade Certification?
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Contact the Office of the University Registrar (OUR) or log in to the official student portal.
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href="https://ibu.bicol-u.edu.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> Open iBU Portal
                  </a>
                  <a
                    href="https://bicol-u.edu.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <i className="fa-solid fa-globe"></i> BU Official Website
                  </a>
                </div>
              </div>

              <div
                className="copyright-notice"
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <i className="fa-regular fa-copyright" style={{ color: 'var(--bu-orange)' }}></i>
                <span><strong>© 2026 BU GWA Calculator & Academic Evaluator.</strong> All Rights Reserved. Created & Maintained by <strong>Allen Del Valle</strong> (BSIT, BU Polangui). Strictly governed by the Official Bicol University Student Handbook (BOR Res. 89 s. 2006).</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: HOW TO USE GUIDE ── */}
      {activeSubtab === 'guide' && (
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
                      <p>Enter course details, select official grades (1.00 to 5.00, INC, or DRP), and set credit units. Click <strong>Compute GPA</strong> on individual cards to lock calculations, or click <strong>Compute Overall GWA</strong> in the list header to evaluate all semesters at once. Computed cards automatically collapse to save vertical screen real estate.</p>
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
                        Input numeric marks and credit units. Semester cards collapse automatically once computed to keep your view compact and clean.
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
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: HANDBOOK POLICY GOVERNANCE ── */}
      {activeSubtab === 'policies' && (
        <div className="about-subtab-content active" id="about-policies">
          <div className="guide-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <h3 className="guide-section-title" style={{ margin: 0 }}>
                <i className="fa-solid fa-book-bookmark text-orange"></i> Governing Bicol University Student Handbook Articles & Citations
              </h3>
              <button
                type="button"
                className="accordion-toggle-all-btn"
                onClick={toggleAllPolicies}
              >
                <i className={`fa-solid ${openPolicies.size === 8 ? 'fa-compress' : 'fa-expand'}`}></i>
                {openPolicies.size === 8 ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            <p className="guide-note">
              Every mathematical formula, honor threshold, and warning condition in this platform is directly codified from the official <strong>Bicol University Student Handbook (BOR Res. 89 s. 2006)</strong>:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
              {/* Policy 1: GWA */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(1)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-blue">
                      <i className="fa-solid fa-calculator"></i> Grading System & GWA Math
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VI, Section 13–15 (Page 28)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(1) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(1) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Defines weighted grade point average computation <code>GWA = ∑(Grade × Units) / ∑Units</code>, 4-decimal precision rounding, and non-numerical mark exclusions (INC/DRP) per BOR Res. 89 s. 2006. Passing mark is strictly 3.00.
                  </p>
                </div>
              </div>

              {/* Policy 2: Term Honors */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(2)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-gold">
                      <i className="fa-solid fa-award"></i> Term Honors (PL & DL)
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VIII, Section 28–29 (Page 34–35)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(2) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(2) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Establishes semester honor rolls: <strong>President's Lister</strong> requires GPA ≤ 1.4500 with no grade below 1.75; <strong>Dean's Lister</strong> requires GPA ≤ 1.7500 with no grade below 2.50. Both mandate regular load (min. 15 units) and zero INC or DRP.
                  </p>
                </div>
              </div>

              {/* Policy 3: Latin Honors */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(3)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-orange">
                      <i className="fa-solid fa-medal"></i> Graduation Latin Honors
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VIII, Section 30 (Page 36)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(3) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(3) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Defines graduation honor ceilings: <strong>Summa Cum Laude</strong> (1.0000–1.2500), <strong>Magna Cum Laude</strong> (1.2501–1.4500), and <strong>Cum Laude</strong> (1.4501–1.7500). Mandates 75% BU residency, regular curriculum progression, zero failing marks (5.0), and no unexcused underloading.
                  </p>
                </div>
              </div>

              {/* Policy 4: Underload */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(4)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-danger">
                      <i className="fa-solid fa-triangle-exclamation"></i> Underload Disqualification
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VIII, Section 30 & Article XI
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(4) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(4) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Enrolling in fewer than the prescribed semester units permanently disqualifies a candidate from graduation Latin Honors. Exemptions are strictly limited to University Physician-certified illness, Dean-approved working student status, or curriculum phase-out.
                  </p>
                </div>
              </div>

              {/* Policy 5: INC 1-Year Rule */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(5)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-amber">
                      <i className="fa-solid fa-clock-rotate-left"></i> Incomplete (INC) 1-Year Rule
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article IX, Section 4 (Page 38)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(5) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(5) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Incomplete marks must be satisfied within exactly <strong>one (1) calendar year</strong> from the end of the term incurred. Failure to complete requirements automatically converts the mark to 5.00 upon registrar audit and permanently removes Latin Honor eligibility.
                  </p>
                </div>
              </div>

              {/* Policy 6: Scholastic Delinquency */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(6)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-green">
                      <i className="fa-solid fa-shield-halved"></i> Retention & Scholastic Standing
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VII, Section 21–24 (Page 31–32)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(6) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(6) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Defines college retention status: <strong>Good Standing</strong> (0 fails), <strong>Academic Warning</strong> (25–49% units failed), <strong>Academic Probation</strong> (50–75% units failed, load capped at 75% next term), and <strong>Dismissal Risk</strong> (&gt;75% failed or 2 consecutive probations).
                  </p>
                </div>
              </div>

              {/* Policy 7: Official Dropping */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(7)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-azure">
                      <i className="fa-solid fa-ban"></i> Official Course Dropping (DRP)
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VII, Section 6 (Page 30)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(7) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(7) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Dropping must be officially filed with approvals from Instructor, Department Chair, and College Dean before the midterm exam period. Dropping unofficially (abandoning attendance) automatically results in a failing grade of 5.00.
                  </p>
                </div>
              </div>

              {/* Policy 8: Shifting & Retention */}
              <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div
                  className="accordion-card-header"
                  onClick={() => togglePolicy(8)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="citation-category citation-cat-purple">
                      <i className="fa-solid fa-arrow-right-arrow-left"></i> Program Shifting & Transfer
                    </div>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                      Article VI, Section 11–12 (Page 26)
                    </strong>
                  </div>
                  <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(8) ? 'is-open' : ''}`}></i>
                </div>
                <div className={`accordion-card-body ${openPolicies.has(8) ? 'is-expanded' : ''}`}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                    Cross-enrollment and internal degree shifting require meeting the destination college's minimum GWA cutoff (typically ≤ 2.25 or 2.00 in prerequisite subjects), dean endorsement, and university registrar clearance.
                  </p>
                </div>
              </div>
            </div>

            {/* University Compliance & Fair Use Audit Box */}
            <div
              style={{
                marginTop: 20,
                padding: 20,
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-check-double"></i> Handbook Compliance & Institutional Non-Violation Audit
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                This platform is engineered to fully respect and protect university policies, student rights, and institutional integrity:
              </p>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8, marginBottom: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                <li><strong>No Database Scraping or Portal Hacking:</strong> The app never interacts with or bypasses the official iBU portal servers, firewalls, or databases. All imports are user-initiated via drag-and-drop file processing in local browser memory.</li>
                <li><strong>No Impersonation of Official Documents:</strong> Exported PDF transcripts and academic worksheets bear clear unofficial advisory notices, preventing misrepresentation as official university registrar documents.</li>
                <li><strong>Educational Fair Use:</strong> Built in accordance with Philippine Republic Act 8293 (Intellectual Property Code) Section 185 on Fair Use for non-profit educational and personal academic planning assistance.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: DEVELOPER & FEEDBACK ── */}
      {activeSubtab === 'developer' && (
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
      )}
    </div>
  );
};
