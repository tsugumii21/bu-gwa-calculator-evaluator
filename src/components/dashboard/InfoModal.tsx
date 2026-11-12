import React from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

export type InfoModalType = 'gwa' | 'honor' | 'latin-honor' | 'standing' | 'units' | null;

interface InfoModalProps {
  type: InfoModalType;
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, isOpen, onClose }) => {
  const dialogRef = useAccessibleDialog(isOpen && !!type, onClose);
  if (!isOpen || !type) return null;

  return (
    <div
      className="modal-overlay"
      ref={dialogRef}
      id="card-info-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-info-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
      >
        <div
          className="modal-header"
          id="card-info-header"
        >
          <h3 id="card-info-title" style={{ fontSize: '1.15rem' }}>
            {type === 'gwa' && (
              <>
                <i className="fa-solid fa-chart-line text-primary"></i> Cumulative General Weighted Average (GWA)
              </>
            )}
            {type === 'honor' && (
              <>
                <i className="fa-solid fa-crown text-gold"></i> Semestral Honor Qualification (PL &amp; DL)
              </>
            )}
            {type === 'latin-honor' && (
              <>
                <i className="fa-solid fa-medal text-gold"></i> Graduation Latin Honors (Summa, Magna, Cum Laude)
              </>
            )}
            {type === 'standing' && (
              <>
                <i className="fa-solid fa-shield-halved text-success"></i> Scholastic Academic Standing
              </>
            )}
            {type === 'units' && (
              <>
                <i className="fa-solid fa-layer-group text-primary"></i> Total Academic Credit Units
              </>
            )}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="card-info-body">
          {type === 'gwa' && (
            <div className="achieve-section" style={{ marginBottom: 0 }}>
              <div className="handbook-ref-badge handbook-ref-blue">
                <i className="fa-solid fa-book"></i> BU Student Handbook: Section III, Grading System, printed p. 18 / PDF p. 28
              </div>
              <p style={{ fontSize: '0.90rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '12px' }}>
                The <strong>Cumulative GWA</strong> represents your overall weighted academic average across all courses taken at Bicol University per official academic policies (BOR Res. 89 s. 2006).
              </p>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--card-header-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.86rem',
                  marginBottom: '12px',
                }}
              >
                <strong className="formula-box-title">Weighted Math Formula:</strong>
                <br />
                <code
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    padding: '6px 10px',
                    background: 'var(--card-bg)',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.80rem',
                  }}
                >
                  GWA = ∑ (Grade Rating × Credit Units) / ∑ (Credit Units)
                </code>
              </div>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, paddingLeft: '18px', margin: 0 }}>
                <li>Calculated and rounded to <strong>4 decimal places</strong> per official university policy.</li>
                <li>Excludes non-numerical marks such as <strong>INC</strong> (Incomplete) and <strong>DRP</strong> (Dropped).</li>
                <li>Serves as the primary evaluation metric for graduation Latin Honors and academic honors.</li>
              </ul>
            </div>
          )}

          {type === 'honor' && (
            <div className="achieve-section" style={{ marginBottom: 0 }}>
              <div className="handbook-ref-badge handbook-ref-gold">
                <i className="fa-solid fa-book"></i> BU Student Handbook: Section IV, Scholarships &amp; Academic Distinctions, printed pp. 31–32 / PDF pp. 41–42
              </div>
              <p style={{ fontSize: '0.90rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Evaluates your term eligibility for semester academic recognition per Bicol University academic policies:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <div
                  className="standing-info-card"
                  style={{
                    background: 'var(--card-header-bg)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--bu-gold)',
                  }}
                >
                  <strong style={{ color: 'var(--bu-gold)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                    President&apos;s Lister (PL)
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <div><strong>GPA Cutoff:</strong> 1.0000 – 1.4500</div>
                    <div><strong>Subject-grade cap:</strong> 2.40</div>
                  </div>
                </div>
                <div
                  className="standing-info-card"
                  style={{
                    background: 'var(--card-header-bg)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--honor-cum)',
                  }}
                >
                  <strong style={{ color: 'var(--honor-cum)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                    Dean&apos;s Lister (DL)
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <div><strong>GPA Cutoff:</strong> 1.4500 &lt; GWA ≤ 1.7500</div>
                    <div><strong>Subject-grade cap:</strong> 2.40</div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '9px 12px',
                  background: 'rgba(234,88,12,0.06)',
                  borderLeft: '4px solid var(--bu-orange)',
                  borderRadius: '4px',
                  fontSize: '0.80rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}
              >
                <strong>Term requirements:</strong> Check the prescribed regular curriculum load for that semester. Both distinctions require every numeric subject grade to be 2.40 or better. Resolve incomplete grades and confirm how any dropped courses affect your load.
              </div>
            </div>
          )}

          {type === 'latin-honor' && (
            <div className="achieve-section" style={{ marginBottom: 0 }}>
              <div className="handbook-ref-badge handbook-ref-gold">
                <i className="fa-solid fa-book"></i> BU Student Handbook: Section III, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31
              </div>
              <p style={{ fontSize: '0.90rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Graduation Latin Honors use the <strong>cumulative weighted average for the degree</strong> alongside the University’s graduation eligibility requirements.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <div
                  className="standing-info-card"
                  style={{
                    background: 'var(--card-header-bg)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--bu-gold)',
                  }}
                >
                  <strong style={{ color: 'var(--bu-gold)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                    Summa Cum Laude
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <div><strong>Cumulative GWA:</strong> 1.0000 – 1.2500</div>
                    <div>Highest university academic distinction.</div>
                  </div>
                </div>
                <div
                  className="standing-info-card"
                  style={{
                    background: 'var(--card-header-bg)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid var(--bu-orange)',
                  }}
                >
                  <strong style={{ color: 'var(--bu-orange)', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                    Magna Cum Laude
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <div><strong>Cumulative GWA:</strong> 1.2501 – 1.4500</div>
                    <div>High university academic distinction.</div>
                  </div>
                </div>
                <div
                  className="standing-info-card"
                  style={{
                    background: 'var(--card-header-bg)',
                    border: '1px solid var(--border-color)',
                    borderLeft: '4px solid #3b82f6',
                  }}
                >
                  <strong style={{ color: '#3b82f6', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>
                    Cum Laude
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <div><strong>Cumulative GWA:</strong> 1.4501 – 1.7500</div>
                    <div>University academic distinction.</div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: '9px 12px',
                  background: 'rgba(234,88,12,0.06)',
                  borderLeft: '4px solid var(--bu-orange)',
                  borderRadius: '4px',
                  fontSize: '0.80rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                }}
              >
                <strong>Graduation requirements:</strong> Candidates must carry the prescribed regular curriculum load and have no numeric subject grade worse than 3.00. Bicol University verifies credited courses, residence, and degree completion.
              </div>
            </div>
          )}

          {type === 'standing' && (
            <div className="achieve-section" style={{ marginBottom: 0 }}>
              <div className="handbook-ref-badge handbook-ref-green">
                <i className="fa-solid fa-book"></i> BU Student Handbook: Section III, Scholastic Deficiency, printed p. 15 / PDF p. 25
              </div>
              <p style={{ fontSize: '0.90rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '12px' }}>
                These are the Handbook’s next-term load rules for failing grades. Resolve any incomplete grades with your college.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="standing-info-card" style={{ background: 'rgba(16,185,129,0.08)', borderLeft: '4px solid var(--color-success)' }}>
                  <strong style={{ color: 'var(--color-success)', fontSize: '0.90rem' }}>No recorded failing grades</strong>
                  <span style={{ display: 'block', marginTop: '2px', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    Your college determines official standing and enrollment load.
                  </span>
                </div>
                <div className="standing-info-card" style={{ background: 'rgba(245,158,11,0.08)', borderLeft: '4px solid var(--bu-gold)' }}>
                  <strong style={{ color: 'var(--bu-gold)', fontSize: '0.90rem' }}>One failing grade</strong>
                  <span style={{ display: 'block', marginTop: '2px', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    The following term’s load is reduced by one subject of equivalent units.
                  </span>
                </div>
                <div className="standing-info-card" style={{ background: 'rgba(239,68,68,0.08)', borderLeft: '4px solid var(--color-danger)' }}>
                  <strong style={{ color: 'var(--color-danger)', fontSize: '0.90rem' }}>Academic Probation (2 Deficiencies):</strong>
                  <span style={{ display: 'block', marginTop: '2px', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                    Carrying 2 failing marks. Maximum allowable academic load reduced to 75% per BU rules.
                  </span>
                </div>
              </div>
            </div>
          )}

          {type === 'units' && (
            <div className="achieve-section" style={{ marginBottom: 0 }}>
              <div className="handbook-ref-badge handbook-ref-blue">
                <i className="fa-solid fa-book"></i> BU Student Handbook: Section III, Academic Load, printed pp. 10–11 / PDF pp. 20–21
              </div>
              <p style={{ fontSize: '0.90rem', lineHeight: 1.55, color: 'var(--text-primary)', marginBottom: '12px' }}>
                <strong>Total Units</strong> adds the credit units entered across all recorded terms.
              </p>
              <ul style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, paddingLeft: '18px', margin: 0 }}>
                <li>Monitors curriculum degree completion progress toward graduation requirements.</li>
                <li>Check each semester against the load prescribed by your curriculum.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary btn-sm"
            onClick={onClose}
            style={{ padding: '8px 22px', fontWeight: 700 }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
