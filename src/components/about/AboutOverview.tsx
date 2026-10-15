import React, { useState } from 'react';

export const AboutOverview: React.FC = () => {
  const [openClauses, setOpenClauses] = useState<Set<number>>(new Set());

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

  return (
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
            The <strong>Bicol University GWA Calculator</strong> is an independent, state-of-the-art web application engineered specifically for Bicol University students across all colleges and campuses. Governed strictly by the <strong>Bicol University Student Handbook (BOR Res. 89 s. 2006)</strong>, this platform provides an all-in-one suite for 4-decimal General Weighted Average computation, semester Dean&apos;s and President&apos;s Lister verification, multi-term academic trend trajectory tracking, per-subject target grade reverse-solving, multi-COR PDF and screenshot OCR ingestion, and handbook policy guidance powered by the Bueño AI Advisor.
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
                  The <strong>Bicol University GWA Calculator & Academic Evaluator</strong> is an independent, non-commercial software project engineered by student software developers. It is <strong>not officially affiliated with, endorsed, sponsored, administered, or operated by Bicol University, the Board of Regents (BOR), or university administration</strong>. Any reference to &quot;Bicol University&quot;, &quot;BU&quot;, &quot;iBU&quot;, campus names, or heraldic emblems is made strictly for nominative identification, educational reference, and student community public service.
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
                  All numeric GWA calculations, President&apos;s Lister and Dean&apos;s Lister classifications, Latin graduation honor forecasts, and scholarship retention evaluations generated by this platform remain <strong>strictly advisory simulations for self-monitoring only</strong>. The sole, authoritative legal and institutional body empowered to certify academic grades, confer graduation honors, and issue official documents is the <strong>Bicol University Office of the University Registrar (OUR)</strong> in concurrence with respective College Deans. This web application does not replace, supersede, or modify the official student academic evaluation.
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
                  This application operates on a <strong>100% client-side, zero-telemetry architecture</strong>. Uploaded Certificate of Registration (COR) PDF files, mobile screenshots, student names, course titles, and numeric grades are parsed entirely inside your browser&apos;s sandboxed local memory via client-side WebAssembly, Canvas, and Tesseract.js. No student credentials, portal passwords, or scholastic data are ever transmitted across external networks, saved to remote databases, or collected. The platform fully complies with Republic Act 10173 (Data Privacy Act of 2012).
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
  );
};
