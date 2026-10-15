import React, { useState } from 'react';

export const AboutPolicies: React.FC = () => {
  const [openPolicies, setOpenPolicies] = useState<Set<number>>(new Set());

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

  return (
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
  );
};
