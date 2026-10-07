import React from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats, calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSemesterCompute?: (semIndex: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  onOpenSemesterCompute,
}) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const computeSemester = useSemesterStore((s) => s.computeSemester);

  if (!isOpen) return null;

  const stats = calculateCumulativeStats(semesters);
  const allComputed = semesters.length > 0 && semesters.every((s) => s.computed);
  const computedCount = semesters.filter((s) => s.computed).length;
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
      aria-labelledby="modal-title-achieve"
      onClick={onClose}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title-achieve">
            <i className="fa-solid fa-trophy text-gold"></i> Academic Achievements & Proximity Radar
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="achievements-content">
          {/* 1. Current Graduation Honor Status & Proximity Gap Analysis */}
          <div className="achieve-section">
            <h4 className="achieve-heading">
              <i className="fa-solid fa-graduation-cap text-gold"></i> Graduation Honor Proximity
            </h4>

            {semesters.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Add your subjects and grades to evaluate graduation honors.
              </p>
            ) : !allComputed ? (
              <div className="achieve-card card-neutral" style={{ borderLeft: '4px solid var(--bu-gold)', padding: 14 }}>
                <div className="achieve-icon">
                  <i className="fa-solid fa-clock-rotate-left text-gold" style={{ fontSize: '1.6rem' }}></i>
                </div>
                <div className="achieve-details">
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Awaiting Full Computation</strong>
                  <span className="achieve-subtext" style={{ display: 'block', marginTop: 2, lineHeight: 1.4, fontSize: '0.82rem' }}>
                    Graduation Honor proximity gap analysis requires all semester GPAs to be computed first.
                  </span>
                  <div style={{ marginTop: 8 }}>
                    <button className="btn btn-gold btn-sm" onClick={computeAllSemesters}>
                      <i className="fa-solid fa-calculator"></i> Compute All Terms
                    </button>
                  </div>
                </div>
              </div>
            ) : stats.hasFailingGrade || stats.hasInc || stats.hasUnderload ? (
              <div className="achieve-card alert-card-danger">
                <div className="achieve-icon">
                  <i className="fa-solid fa-circle-xmark text-danger"></i>
                </div>
                <div className="achieve-details">
                  <strong style={{ fontSize: '0.95rem' }}>Not Eligible for Graduation Honors</strong>
                  <br />
                  {stats.hasFailingGrade && <span style={{ fontSize: '0.82rem' }}>Disqualified due to failing grade (5.0).</span>}
                  {stats.hasInc && <span style={{ fontSize: '0.82rem' }}> Disqualified due to unresolved INC grade.</span>}
                  {stats.hasUnderload && <span style={{ fontSize: '0.82rem' }}> Disqualified due to carrying an underloaded term.</span>}
                </div>
              </div>
            ) : (
              <>
                {gwa <= 1.2500 ? (
                  <div className="achieve-card card-gold">
                    <div className="achieve-icon"><i className="fa-solid fa-crown text-gold"></i></div>
                    <div className="achieve-details">
                      <strong style={{ fontSize: '0.95rem', color: 'var(--honor-summa)' }}>Candidate for Summa Cum Laude!</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Cumulative GWA {gwa.toFixed(4)} ≤ 1.2500. You are at the pinnacle of academic excellence!
                      </span>
                    </div>
                  </div>
                ) : gwa <= 1.4500 ? (
                  <div className="achieve-card card-orange">
                    <div className="achieve-icon"><i className="fa-solid fa-medal text-orange"></i></div>
                    <div className="achieve-details">
                      <strong style={{ fontSize: '0.95rem', color: 'var(--honor-magna)' }}>Candidate for Magna Cum Laude!</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Cumulative GWA {gwa.toFixed(4)}.
                      </span>
                      <span className="gap-pill">
                        So close! | You are only&nbsp;<strong>{(gwa - 1.2500).toFixed(4)}</strong>&nbsp;points away from Summa Cum Laude!
                      </span>
                    </div>
                  </div>
                ) : gwa <= 1.7500 ? (
                  <div className="achieve-card card-blue">
                    <div className="achieve-icon"><i className="fa-solid fa-award text-primary"></i></div>
                    <div className="achieve-details">
                      <strong style={{ fontSize: '0.95rem', color: 'var(--honor-cum)' }}>Candidate for Cum Laude!</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Cumulative GWA {gwa.toFixed(4)}.
                      </span>
                      <span className="gap-pill">
                        So close! | You are only&nbsp;<strong>{(gwa - 1.4500).toFixed(4)}</strong>&nbsp;points away from Magna Cum Laude!
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="achieve-card card-neutral">
                    <div className="achieve-icon"><i className="fa-solid fa-bullseye text-primary"></i></div>
                    <div className="achieve-details">
                      <strong style={{ fontSize: '0.95rem' }}>Regular Graduate Candidate</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Current GWA is {gwa.toFixed(4)}.
                      </span>
                      <span className="gap-pill">
                        Goal Gap: You are&nbsp;<strong>{(gwa - 1.7500).toFixed(4)}</strong>&nbsp;points away from Cum Laude threshold (1.7500).
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 2. Semester-by-Semester Academic Recognition (President's & Dean's Lister) */}
          <div className="achieve-section" style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h4 className="achieve-heading" style={{ marginBottom: 0 }}>
                <i className="fa-solid fa-award text-gold"></i> Term Academic Recognition (PL &amp; DL)
              </h4>
              <button
                type="button"
                className="btn btn-gold btn-sm"
                onClick={computeAllSemesters}
                title="Compute GPA for all semesters at once"
              >
                <i className="fa-solid fa-calculator"></i> Compute All
              </button>
            </div>

            {semesters.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                No semesters available to evaluate.
              </p>
            ) : (
              <div className="term-recog-list">
                {semesters.map((sem, idx) => {
                  if (!sem.computed) {
                    return (
                      <div className="term-recog-item" key={sem.id}>
                        <div className="term-recog-info">
                          <strong>{sem.title}</strong>{' '}
                          <span className="term-gpa-tag" style={{ background: 'var(--card-header-bg)', color: 'var(--text-secondary)' }}>
                            Awaiting Computation
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          style={{ padding: '3px 10px', fontSize: '0.78rem' }}
                          onClick={() => {
                            if (onOpenSemesterCompute) {
                              onOpenSemesterCompute(idx);
                            } else {
                              computeSemester(sem.id);
                            }
                          }}
                        >
                          <i className="fa-solid fa-calculator"></i> Compute GPA
                        </button>
                      </div>
                    );
                  }

                  const semGWA = calculateSemesterGWA(sem);
                  const semUnits = calculateSemesterUnits(sem);

                  let lowestGradeInSem = 1.0;
                  let hasFailOrInc = false;

                  sem.subjects.forEach((sub) => {
                    const num = parseFloat(sub.grade);
                    if (sub.grade === '5.0' || sub.grade === '5.00' || num === 5.0 || sub.grade === 'INC') {
                      hasFailOrInc = true;
                    }
                    if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
                  });

                  let statusTitle = 'Dedicated Bueño';
                  let statusBadge = 'badge-success';

                  if (semUnits > 0 && !hasFailOrInc && !sem.underload) {
                    if (semGWA <= 1.4500 && lowestGradeInSem <= 1.75) {
                      statusTitle = "President's Lister (PL)";
                      statusBadge = 'badge-pl';
                    } else if (semGWA <= 1.7500 && lowestGradeInSem <= 2.50) {
                      statusTitle = "Dean's Lister (DL)";
                      statusBadge = 'badge-dl';
                    } else if (semGWA > 1.7500 && semGWA <= 1.8500) {
                      const gapToDL = semGWA - 1.7500;
                      statusTitle = `Close to DL (Gap: ${gapToDL.toFixed(4)})`;
                      statusBadge = 'badge-close';
                    }
                  } else if (sem.underload) {
                    statusTitle = 'Balanced Pace Bueño';
                    statusBadge = 'badge-warning';
                  } else if (hasFailOrInc) {
                    statusTitle = 'Academic Deficiency Detected';
                    statusBadge = 'badge-danger';
                  }

                  return (
                    <div className="term-recog-item" key={sem.id}>
                      <div className="term-recog-info">
                        <strong>{sem.title}</strong>{' '}
                        <span className="term-gpa-tag">GPA: {semGWA.toFixed(4)}</span>
                      </div>
                      <span className={`recog-pill ${statusBadge}`}>{statusTitle}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Milestone Badges */}
          <div className="achieve-section" style={{ marginTop: 18 }}>
            <h4 className="achieve-heading">
              <i className="fa-solid fa-medal text-gold"></i> Academic Milestone Badges
            </h4>
            <div className="badges-grid">
              {/* Badge 1: Zero Deficiencies */}
              <div className={`badge-box badge-deficiencies ${stats.totalCourses > 0 && stats.failingCount === 0 && !stats.hasInc ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-shield-halved"></i></div>
                <strong className="badge-title">Zero Deficiencies</strong>
                <span className="badge-desc">
                  {stats.totalCourses > 0 && stats.failingCount === 0 && !stats.hasInc
                    ? '0 failing marks or unresolved INCs across all terms!'
                    : 'Maintain a clean record without 5.0 or INC marks.'}
                </span>
              </div>

              {/* Badge 2: Honors Pace */}
              <div className={`badge-box badge-honors ${stats.gradedUnits > 0 && stats.cumulativeGWA <= 1.7500 && !stats.hasFailingGrade ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-crown"></i></div>
                <strong className="badge-title">Honors Pace</strong>
                <span className="badge-desc">
                  {stats.gradedUnits > 0 && stats.cumulativeGWA <= 1.7500
                    ? `Pacing for graduation honors (GWA ${stats.cumulativeGWA.toFixed(4)})!`
                    : 'Maintain a cumulative GWA of 1.7500 or better.'}
                </span>
              </div>

              {/* Badge 3: Consistent Evaluator */}
              <div className={`badge-box badge-streak ${computedCount >= 2 ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-fire"></i></div>
                <strong className="badge-title">Consistent Evaluator</strong>
                <span className="badge-desc">
                  {computedCount >= 2
                    ? `Active streak: ${computedCount} semesters computed!`
                    : `Compute at least 2 full semesters (${computedCount}/2).`}
                </span>
              </div>

              {/* Badge 4: Full Load Regular */}
              <div className={`badge-box badge-fullload ${semesters.length > 0 && !stats.hasUnderload ? 'unlocked' : 'locked'}`}>
                <div className="badge-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                <strong className="badge-title">Full Load Regular</strong>
                <span className="badge-desc">
                  {semesters.length > 0 && !stats.hasUnderload
                    ? 'All semesters carry full prescribed load!'
                    : 'Carry full regular load without underloading.'}
                </span>
              </div>
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
