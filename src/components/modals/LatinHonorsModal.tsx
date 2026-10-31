import React from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

interface LatinHonorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LatinHonorsModal: React.FC<LatinHonorsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const computeSemester = useSemesterStore((s) => s.computeSemester);
  const dialogRef = useAccessibleDialog(isOpen, onClose);

  if (!isOpen) return null;

  const stats = calculateCumulativeStats(semesters);
  const allComputed = semesters.length > 0 && semesters.every((s) => s.computed);
  const gwa = stats.cumulativeGWA;

  const computeAllSemesters = () => {
    semesters.forEach((sem) => {
      const hasAnyGrade = sem.subjects && sem.subjects.some((sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade)));
      if (hasAnyGrade) {
        computeSemester(sem.id);
      }
    });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-latin"
      ref={dialogRef}
      onClick={onClose}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title-latin">
            <i className="fa-solid fa-medal text-gold"></i> Latin Graduation Honors Computation
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="latin-modal-content">
          <div className="achieve-section">
            {semesters.length === 0 ? (
              <div className="achieve-card card-neutral">
                <div className="achieve-icon">
                  <i className="fa-solid fa-folder-open text-primary" style={{ fontSize: '1.6rem' }}></i>
                </div>
                <div className="achieve-details">
                  <strong style={{ fontSize: '0.95rem' }}>No Courses Added Yet</strong>
                  <span className="achieve-subtext" style={{ fontSize: '0.82rem' }}>
                    Add your subjects and grades in the calculator to evaluate Latin Graduation Honors.
                  </span>
                </div>
              </div>
            ) : !allComputed ? (
              <div className="achieve-card card-neutral" style={{ borderLeft: '4px solid var(--bu-gold)', padding: 14 }}>
                <div className="achieve-icon">
                  <i className="fa-solid fa-clock-rotate-left text-gold" style={{ fontSize: '1.6rem' }}></i>
                </div>
                <div className="achieve-details">
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Awaiting Full Computation</strong>
                  <span className="achieve-subtext" style={{ display: 'block', marginTop: 4, lineHeight: 1.4, fontSize: '0.82rem' }}>
                    Graduation Honor candidacy & proximity gap analysis require all semester GPAs to be computed first. Please compute each semester or click below.
                  </span>
                  <div style={{ marginTop: 10 }}>
                    <button className="btn btn-gold btn-sm" onClick={computeAllSemesters}>
                      <i className="fa-solid fa-calculator"></i> Compute All Terms Now
                    </button>
                  </div>
                </div>
              </div>
            ) : stats.hasFailingGrade || stats.hasInc || stats.hasUnderload ? (
              <>
                <div className="achieve-card alert-card-danger">
                  <div className="achieve-icon">
                    <i className="fa-solid fa-circle-xmark text-danger"></i>
                  </div>
                  <div className="achieve-details">
                    <strong style={{ fontSize: '0.95rem' }}>Not Eligible for Latin Graduation Honors</strong>
                    <span className="achieve-subtext" style={{ lineHeight: 1.4, marginTop: 4, fontSize: '0.82rem', display: 'block' }}>
                      Per the Bicol University Student Handbook (Art. VIII, Sec. 30), candidates must carry full regular load with zero academic deficiencies. Disqualified due to:{' '}
                      <strong>
                        {[
                          stats.hasFailingGrade && 'Failing mark (5.0)',
                          stats.hasInc && 'Unresolved INC mark',
                          stats.hasUnderload && 'Underloaded term',
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </strong>.
                    </span>
                  </div>
                </div>

                <div className="quote-box" style={{ marginTop: 14 }}>
                  <i className="fa-solid fa-quote-left quote-icon"></i>
                  <div className="quote-text">
                    <strong>Motivational Reminder:</strong>
                    <br />
                    "Keep striving with honor and excellence, Bueño Student! Every challenge builds character for the future."
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── 3-TIER PROGRESSION NOTICE ── */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background:
                      stats.gradedUnits < 45
                        ? 'rgba(37, 99, 235, 0.08)'
                        : stats.gradedUnits < 105
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(16, 185, 129, 0.08)',
                    border: `1px solid ${
                      stats.gradedUnits < 45
                        ? 'rgba(37, 99, 235, 0.25)'
                        : stats.gradedUnits < 105
                          ? 'rgba(245, 158, 11, 0.25)'
                          : 'rgba(16, 185, 129, 0.25)'
                    }`,
                    marginBottom: 14,
                    fontSize: '0.84rem',
                    lineHeight: 1.45,
                    color: 'var(--text-primary)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <i
                      className={`fa-solid ${
                        stats.gradedUnits < 45
                          ? 'fa-compass text-primary'
                          : stats.gradedUnits < 105
                            ? 'fa-chart-line text-gold'
                            : 'fa-award text-success'
                      }`}
                    ></i>
                    <strong>
                      {stats.gradedUnits < 45
                        ? 'Underclassman Milestone (Pace Projection)'
                        : stats.gradedUnits < 105
                          ? 'Mid-Degree Trajectory (Unofficial Simulation)'
                          : 'Senior Graduation Candidate'}
                    </strong>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {stats.gradedUnits.toFixed(0)} / 140 Units Completed
                    </span>
                  </div>
                  <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                    {stats.gradedUnits < 45
                      ? 'Latin Honors is an 8-semester cumulative marathon. This projection reflects your current pace; official candidacy is tracked at 45+ graded units.'
                      : stats.gradedUnits < 105
                        ? 'Tracking on-track honors pace across completed coursework. Cumulative qualification remains subject to full-load verification across all 8 terms.'
                        : 'Eligible for Latin Honors candidacy pending final Office of the University Registrar residency and load verification.'}
                  </span>
                </div>

                {gwa <= 1.2500 ? (
                  <div className="achieve-card card-gold">
                    <div className="achieve-icon">
                      <i className="fa-solid fa-crown text-gold"></i>
                    </div>
                    <div className="achieve-details">
                      <strong className="achieve-title" style={{ color: 'var(--honor-summa)', fontSize: '0.95rem' }}>
                        Candidate for Summa Cum Laude!
                      </strong>
                      <span className="achieve-subtext" style={{ fontSize: '0.82rem' }}>
                        Your cumulative GWA is <strong>{gwa.toFixed(4)}</strong> (≤ 1.2500). You are at the absolute pinnacle of academic excellence!
                      </span>
                    </div>
                  </div>
                ) : gwa <= 1.4500 ? (
                  <div className="achieve-card card-orange">
                    <div className="achieve-icon">
                      <i className="fa-solid fa-medal text-orange"></i>
                    </div>
                    <div className="achieve-details">
                      <strong className="achieve-title" style={{ color: 'var(--honor-magna)', fontSize: '0.95rem' }}>
                        Candidate for Magna Cum Laude!
                      </strong>
                      <span className="achieve-subtext" style={{ fontSize: '0.82rem' }}>
                        Your cumulative GWA is <strong>{gwa.toFixed(4)}</strong> (1.2500 &lt; GWA ≤ 1.4500).
                      </span>
                      <span className="gap-pill">
                        So close! | You are only&nbsp;<strong>{(gwa - 1.2500).toFixed(4)}</strong>&nbsp;points away from Summa Cum Laude!
                      </span>
                    </div>
                  </div>
                ) : gwa <= 1.7500 ? (
                  <div className="achieve-card card-blue">
                    <div className="achieve-icon">
                      <i className="fa-solid fa-award text-primary"></i>
                    </div>
                    <div className="achieve-details">
                      <strong className="achieve-title" style={{ color: 'var(--honor-cum)', fontSize: '0.95rem' }}>
                        Candidate for Cum Laude!
                      </strong>
                      <span className="achieve-subtext" style={{ fontSize: '0.82rem' }}>
                        Your cumulative GWA is <strong>{gwa.toFixed(4)}</strong> (1.4500 &lt; GWA ≤ 1.7500).
                      </span>
                      <span className="gap-pill">
                        So close! | You are only&nbsp;<strong>{(gwa - 1.4500).toFixed(4)}</strong>&nbsp;points away from Magna Cum Laude!
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="achieve-card card-emerald">
                    <div className="achieve-icon">
                      <i className="fa-solid fa-bullseye text-primary"></i>
                    </div>
                    <div className="achieve-details">
                      <strong className="achieve-title" style={{ fontSize: '0.95rem' }}>
                        Good Academic Standing Graduate Candidate
                      </strong>
                      <span className="achieve-subtext" style={{ fontSize: '0.82rem' }}>
                        Your current cumulative GWA is <strong>{gwa.toFixed(4)}</strong>.
                      </span>
                      <span className="gap-pill">
                        Goal Gap: You are&nbsp;<strong>{(gwa - 1.7500).toFixed(4)}</strong>&nbsp;points away from Cum Laude cutoff (1.7500).
                      </span>
                    </div>
                  </div>
                )}

                <div className="quote-box" style={{ marginTop: 14 }}>
                  <i className="fa-solid fa-quote-left quote-icon"></i>
                  <div className="quote-text">
                    <strong>Motivational Reminder:</strong>
                    <br />
                    "Keep striving with honor and excellence, Bueño Student! Maintain consistency and passion in your studies."
                  </div>
                </div>
              </>
            )}

            {/* Exact Criteria Cards Breakdown inside Modal */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                <i className="fa-solid fa-list-check text-primary"></i> Exact Bicol University Graduation Honor Criteria
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                <div style={{ padding: '10px 12px', background: 'var(--card-header-bg)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--honor-summa)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--honor-summa)', fontSize: '0.88rem' }}>Summa Cum Laude</strong>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>1.0000 – 1.2500</span>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--card-header-bg)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--honor-magna)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--honor-magna)', fontSize: '0.88rem' }}>Magna Cum Laude</strong>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>1.2501 – 1.4500</span>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--card-header-bg)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--honor-cum)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: 'var(--honor-cum)', fontSize: '0.88rem' }}>Cum Laude</strong>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>1.4501 – 1.7500</span>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                *Rules: Must carry full regular load every term with zero 5.0 or INC marks (Art. VIII, Sec. 30).
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
