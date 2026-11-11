import React, { useState } from 'react';

export const HandbookPolicies: React.FC = () => {
  const [openPolicies, setOpenPolicies] = useState<Set<number>>(new Set([0])); // Midyear open by default

  const togglePolicy = (id: number) => {
    setOpenPolicies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllPolicies = () => {
    setOpenPolicies((prev) => (prev.size === 9 ? new Set() : new Set([0, 1, 2, 3, 4, 5, 6, 7, 8])));
  };

  return (
    <div className="about-subtab-content active" id="handbook-policies">
      {/* ── SECTION 1: OFFICIAL ACADEMIC GRADING SCALE ── */}
      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-table-list text-primary"></i> Official Academic Grading Scale (Discrete Tenths)
        </h3>
        <div className="policy-citation-banner banner-blue">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Section III, Grading System, printed p. 18 / PDF p. 28
        </div>
        <p className="guide-note">
          Official grade ratings, percentage equivalents, and adjectival descriptions codified in the Bicol University grading system:
        </p>
        <div className="table-responsive">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Grade Rating</th>
                <th>Adjectival Rating</th>
                <th>Percentage Equivalent</th>
                <th>Academic Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1.0 – 1.4</strong></td>
                <td><span className="adjectival-badge badge-outstanding">Outstanding</span></td>
                <td><strong>95 – 100%</strong></td>
                <td>Passed • Honors Eligible</td>
              </tr>
              <tr>
                <td><strong>1.5 – 1.7</strong></td>
                <td><span className="adjectival-badge badge-superior">Superior</span></td>
                <td><strong>92 – 94%</strong></td>
                <td>Passed • Honors Eligible</td>
              </tr>
              <tr>
                <td><strong>1.8 – 2.5</strong></td>
                <td><span className="adjectival-badge badge-very-satisfactory">Very Satisfactory</span></td>
                <td><strong>84 – 91%</strong></td>
                <td>Passed • DL Eligible (≤ 2.5)</td>
              </tr>
              <tr>
                <td><strong>2.6 – 2.8</strong></td>
                <td><span className="adjectival-badge badge-satisfactory">Satisfactory</span></td>
                <td><strong>78 – 83%</strong></td>
                <td>Passed</td>
              </tr>
              <tr>
                <td><strong>2.9 – 3.0</strong></td>
                <td><span className="adjectival-badge badge-fair">Fair / Average</span></td>
                <td><strong>75 – 77%</strong></td>
                <td>Passed (3.00 Passing Mark)</td>
              </tr>
              <tr>
                <td><strong>3.1 – 4.0</strong></td>
                <td><span className="adjectival-badge badge-conditional">Poor / Conditional</span></td>
                <td><strong>Below 75</strong></td>
                <td>Conditional Deficient Mark</td>
              </tr>
              <tr>
                <td><strong>5.0</strong></td>
                <td><span className="adjectival-badge badge-failure">Failure</span></td>
                <td><strong>Below 75</strong></td>
                <td>Lowest Final Rating (Deficiency)</td>
              </tr>
              <tr>
                <td><strong>INC</strong></td>
                <td><span className="adjectival-badge badge-incomplete">Incomplete</span></td>
                <td>Requirements Pending</td>
                <td>Must resolve within 1 school year</td>
              </tr>
              <tr>
                <td><strong>DRP</strong></td>
                <td><span className="adjectival-badge badge-dropped">Dropped</span></td>
                <td>Officially Withdrawn</td>
                <td>Excluded from GWA math</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 2: SEMESTER ACADEMIC RECOGNITION (PL & DL) ── */}
      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-award text-gold"></i> Semester Academic Recognition Criteria (PL &amp; DL)
        </h3>
        <div className="policy-citation-banner banner-gold">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Section IV, Scholarships &amp; Financial Assistance, printed pp. 31–32 / PDF pp. 41–42
        </div>
        <p className="guide-note">
          Official semestral honor roll thresholds and course grade caps per Bicol University Academic Policies:
        </p>
        <div className="table-responsive">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Honor Level</th>
                <th>Semester GPA Cutoff</th>
                <th>Individual Grade Cap</th>
                <th>Key Eligibility Criteria</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="honor-text-pl">President's Lister (PL)</strong></td>
                <td><strong>1.0000 – 1.4500</strong></td>
                <td><strong>Max 2.40</strong></td>
                <td>Prescribed curriculum load and complete grades</td>
              </tr>
              <tr>
                <td><strong className="honor-text-dl">Dean's Lister (DL)</strong></td>
                <td><strong>&gt; 1.4500 through 1.7500</strong></td>
                <td><strong>Max 2.40</strong></td>
                <td>Prescribed curriculum load and complete grades</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 3: LATIN GRADUATION HONORS CRITERIA ── */}
      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-graduation-cap text-gold"></i> Latin Graduation Honors Criteria (Degree-Wide)
        </h3>
        <div className="policy-citation-banner banner-orange">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Section III, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31
        </div>
        <p className="guide-note">
          Cumulative degree requirements and lifetime conditions for Latin Graduation Honors:
        </p>
        <div className="table-responsive">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Honor Level</th>
                <th>Exact Cumulative GWA Range</th>
                <th>Key Handbook Requirements</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="honor-text-summa">Summa Cum Laude</strong></td>
                <td><strong>1.0000 – 1.2500</strong></td>
                <td>Full regular load every semester, zero lifetime 5.0 / 4.0 / unremoved INC marks</td>
              </tr>
              <tr>
                <td><strong className="honor-text-magna">Magna Cum Laude</strong></td>
                <td><strong>&gt; 1.2500 through 1.4500</strong></td>
                <td>Full regular load every semester, zero lifetime 5.0 / 4.0 / unremoved INC marks</td>
              </tr>
              <tr>
                <td><strong className="honor-text-cum">Cum Laude</strong></td>
                <td><strong>&gt; 1.4500 through 1.7500</strong></td>
                <td>Full regular load every semester, zero lifetime 5.0 / 4.0 / unremoved INC marks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 4: DEDICATED MIDYEAR / SUMMER TERM POLICY ── */}
      <div className="guide-section">
        <h3 className="guide-section-title">
          <i className="fa-solid fa-sun text-gold"></i> Midyear / Summer Term Policy &amp; Academic Governance
        </h3>
        <div className="policy-citation-banner banner-blue">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: See Section III, Academic Load, and Section IV, Academic Distinctions
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
          {/* Card 1: GWA Weight */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="citation-category citation-cat-blue">
                <i className="fa-solid fa-calculator"></i> 100% GWA &amp; Unit Inclusion
              </span>
            </div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              Midyear Grades Fully Count
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              All subjects and numerical grades earned during a Midyear or Summer term are mathematically factored into your Cumulative Degree GWA and credit total with identical weight as regular semester courses.
            </p>
          </div>

          {/* Card 2: PL/DL Exemption */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="citation-category citation-cat-orange">
                <i className="fa-solid fa-award"></i> Semestral Honors Exemption
              </span>
            </div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              No President's / Dean's Lister in Summer
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The calculator reserves term distinctions for regular semesters and leaves Midyear out of its regular-term underload check. Confirm official requirements with your college.
            </p>
          </div>

          {/* Card 3: Latin Honors Protection */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="citation-category citation-cat-blue">
                <i className="fa-solid fa-shield-halved"></i> Latin Honors Safe
              </span>
            </div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              Authorized Summer Load (Not Underloaded)
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The app skips its regular-term underload check for Midyear. Your college can confirm prescribed loads and official eligibility.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: GOVERNING BU HANDBOOK ARTICLES & CITATIONS ── */}
      <div className="guide-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <h3 className="guide-section-title" style={{ margin: 0 }}>
            <i className="fa-solid fa-book-bookmark text-orange"></i> Governing Bicol University Student Handbook Articles
          </h3>
          <button
            type="button"
            className="accordion-toggle-all-btn"
            onClick={toggleAllPolicies}
          >
            <i className={`fa-solid ${openPolicies.size === 9 ? 'fa-compress' : 'fa-expand'}`}></i>
            {openPolicies.size === 9 ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        <p className="guide-note">
          Codified directly from the official <strong>Bicol University Student Handbook (BOR Res. 89 s. 2006)</strong>:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 14 }}>
          {/* Policy 1: GWA */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(1)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-blue">
                  <i className="fa-solid fa-calculator"></i> Grading System &amp; GWA Math
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section III, Grading System, printed p. 18 / PDF p. 28
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

          {/* Policy 2: Underload */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(2)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-orange">
                  <i className="fa-solid fa-scale-unbalanced"></i> Regular Academic Load &amp; Underload
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section III, Academic Load, printed p. 10 / PDF p. 20
                </strong>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(2) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openPolicies.has(2) ? 'is-expanded' : ''}`}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                Regular full-time load is 15–24 units per regular semester. Carrying fewer units than prescribed in the approved curriculum constitutes an underload, disqualifying the student from Latin Graduation Honors (unless caused by course unavailability documented by Dean).
              </p>
            </div>
          </div>

          {/* Policy 3: Semestral Honors */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(3)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-gold">
                  <i className="fa-solid fa-award"></i> President's &amp; Dean's Lister Honors
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section IV, Scholarships &amp; Financial Assistance, printed pp. 31–32 / PDF pp. 41–42
                </strong>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(3) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openPolicies.has(3) ? 'is-expanded' : ''}`}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                PL applies through 1.4500. DL applies above 1.4500 through 1.7500. Both use a maximum numeric subject grade of 2.40 and the prescribed regular curriculum load.
              </p>
            </div>
          </div>

          {/* Policy 4: Latin Honors */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(4)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-orange">
                  <i className="fa-solid fa-graduation-cap"></i> Latin Graduation Honors
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section III, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31
                </strong>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(4) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openPolicies.has(4) ? 'is-expanded' : ''}`}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                Summa Cum Laude (1.0000–1.2500), Magna Cum Laude (above 1.2500 through 1.4500), Cum Laude (above 1.4500 through 1.7500). Candidates must complete 100% of curriculum within prescribed timeframe with no underloaded semesters and zero failing (5.0) or unremoved INC marks.
              </p>
            </div>
          </div>

          {/* Policy 5: INC Removal */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(5)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-red">
                  <i className="fa-solid fa-triangle-exclamation"></i> Incomplete (INC) Removal Timeline
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section III, The Grade of Incomplete, printed p. 20 / PDF p. 30
                </strong>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(5) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openPolicies.has(5) ? 'is-expanded' : ''}`}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                An INC mark must be satisfied within one (1) academic year from term received. Failure to remove an INC within statutory deadline automatically converts it to 5.0 (Failure) or forfeiture of credit.
              </p>
            </div>
          </div>

          {/* Policy 6: Residency */}
          <div style={{ padding: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div className="accordion-card-header" onClick={() => togglePolicy(6)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="citation-category citation-cat-blue">
                  <i className="fa-solid fa-landmark"></i> Maximum Residency Rule (MRR)
                </div>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                  Section III, Maximum Residence Rule, printed p. 17 / PDF p. 27
                </strong>
              </div>
              <i className={`fa-solid fa-chevron-down accordion-chevron ${openPolicies.has(6) ? 'is-open' : ''}`}></i>
            </div>
            <div className={`accordion-card-body ${openPolicies.has(6) ? 'is-expanded' : ''}`}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                Maximum residence is the prescribed program duration plus one year (five years for a four-year program). Confirm applicable exceptions with the University.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
