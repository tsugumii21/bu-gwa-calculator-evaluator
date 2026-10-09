import React from 'react';

export const PoliciesView: React.FC = () => {
  return (
    <div className="tab-content active" id="tab-guide">
      <div className="section-header">
        <h2><i className="fa-solid fa-book-open"></i> Bicol University Grading System & Academic Policies</h2>
        <p className="section-desc">
          Official grading scale, graduation honor requirements, and academic recognition criteria per the <em>Bicol University Student Handbook (2019 Revised Edition)</em>.
        </p>
      </div>

      {/* SECTION 1: OFFICIAL GRADING SCALE */}
      <div className="guide-section">
        <h3 className="guide-section-title"><i className="fa-solid fa-table-list text-primary"></i> Official Academic Grading Scale</h3>
        <div className="policy-citation-banner banner-blue">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Article VI, Section 13–15 (Page 28) · BOR Res. 89 s. 2006
        </div>
        <p className="guide-note">Official grade ratings, percentage equivalents, and adjectival descriptions as defined in the Bicol University grading system:</p>
        <div className="table-responsive">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Grade Rating</th>
                <th>Adjectival Rating</th>
                <th>Percentage Equivalent</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1.0 – 1.4</strong></td>
                <td><span className="adjectival-badge badge-outstanding">Outstanding</span></td>
                <td><strong>95 – 100%</strong></td>
              </tr>
              <tr>
                <td><strong>1.5 – 1.7</strong></td>
                <td><span className="adjectival-badge badge-superior">Superior</span></td>
                <td><strong>92 – 94%</strong></td>
              </tr>
              <tr>
                <td><strong>1.8 – 2.5</strong></td>
                <td><span className="adjectival-badge badge-very-satisfactory">Very Satisfactory</span></td>
                <td><strong>84 – 91%</strong></td>
              </tr>
              <tr>
                <td><strong>2.6 – 2.8</strong></td>
                <td><span className="adjectival-badge badge-satisfactory">Satisfactory</span></td>
                <td><strong>78 – 83%</strong></td>
              </tr>
              <tr>
                <td><strong>2.9 – 3.0</strong></td>
                <td><span className="adjectival-badge badge-fair">Fair / Average</span></td>
                <td><strong>75 – 77% (75 Passing)</strong></td>
              </tr>
              <tr>
                <td><strong>3.1 – 4.0</strong></td>
                <td><span className="adjectival-badge badge-conditional">Poor</span></td>
                <td><strong>Below 75 (Conditional / Mid-term)</strong></td>
              </tr>
              <tr>
                <td><strong>5.0</strong></td>
                <td><span className="adjectival-badge badge-failure">Failure</span></td>
                <td><strong>Below 75 (Lowest Final Rating)</strong></td>
              </tr>
              <tr>
                <td><strong>INC</strong></td>
                <td><span className="adjectival-badge badge-incomplete">Incomplete</span></td>
                <td>Requirements Pending</td>
              </tr>
              <tr>
                <td><strong>DRP</strong></td>
                <td><span className="adjectival-badge badge-dropped">Dropped</span></td>
                <td>Officially Withdrawn</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: SEMESTER ACADEMIC RECOGNITION CRITERIA TABLE */}
      <div className="guide-section">
        <h3 className="guide-section-title"><i className="fa-solid fa-star text-gold"></i> Semester Academic Recognition Criteria (PL & DL)</h3>
        <div className="policy-citation-banner banner-gold">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Article VIII, Section 28–29 (Page 34–35)
        </div>
        <p className="guide-note">Official per-semester honor roll cutoffs and individual subject grade caps per Bicol University Academic Policies:</p>
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
                <td><strong>Max 1.75</strong> (No subject below 1.75)</td>
                <td>Full regular academic load, zero 5.0 or INC marks</td>
              </tr>
              <tr>
                <td><strong className="honor-text-dl">Dean's Lister (DL)</strong></td>
                <td><strong>1.4600 – 1.7500</strong></td>
                <td><strong>Max 2.50</strong> (No subject below 2.50)</td>
                <td>Full regular academic load, zero 5.0 or INC marks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: LATIN GRADUATION HONORS CRITERIA TABLE */}
      <div className="guide-section">
        <h3 className="guide-section-title"><i className="fa-solid fa-graduation-cap text-gold"></i> Exact Bicol University Latin Graduation Honors Criteria</h3>
        <div className="policy-citation-banner banner-orange">
          <i className="fa-solid fa-book"></i> Bicol University Student Handbook: Article VIII, Section 30 (Page 36)
        </div>
        <p className="guide-note">Official graduation honor cutoffs and eligibility requirements per the Bicol University Student Handbook:</p>
        <div className="table-responsive">
          <table className="policy-table">
            <thead>
              <tr>
                <th>Honor Level</th>
                <th>Exact Cumulative GWA Range</th>
                <th>Key Requirements</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="honor-text-summa">Summa Cum Laude</strong></td>
                <td><strong>1.0000 – 1.2500</strong></td>
                <td>Full regular load every semester, zero 5.0 or INC marks</td>
              </tr>
              <tr>
                <td><strong className="honor-text-magna">Magna Cum Laude</strong></td>
                <td><strong>1.2501 – 1.4500</strong></td>
                <td>Full regular load every semester, zero 5.0 or INC marks</td>
              </tr>
              <tr>
                <td><strong className="honor-text-cum">Cum Laude</strong></td>
                <td><strong>1.4501 – 1.7500</strong></td>
                <td>Full regular load every semester, zero 5.0 or INC marks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
