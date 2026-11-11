import React, { useMemo } from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import type { Semester } from '../../types';
import { buildCalculationReport } from '../../core/calculation-report';

interface TermHonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: Semester | null;
}

export const TermHonorModal: React.FC<TermHonorModalProps> = ({ isOpen, onClose, semester }) => {
  const details = useMemo(() => {
    if (!semester) return null;

    const report = buildCalculationReport([semester]);
    const honor = report.termHonor;
    const isPresident = honor?.level === 'president';
    const isDean = honor?.level === 'dean';
    const isRecognized = isPresident || isDean;
    const isGood = report.standing.level === 'good';
    const icon = isPresident ? 'fa-crown' : isDean ? 'fa-medal' : isGood ? 'fa-bullseye' : 'fa-circle-exclamation';
    const average = report.stats.gradedUnits ? report.stats.cumulativeGWA.toFixed(4) : '—';
    return {
      title: honor?.label ?? report.standing.label,
      badgeClass: isPresident ? 'card-gold' : isDean ? 'card-azure' : isGood ? 'card-emerald' : 'card-amber',
      icon,
      subtext: `${semester.title} • Semester GWA: ${average}`,
      reason: report.errors[0] ?? honor?.reason ?? report.standing.reason,
      headerIcon: `${icon} ${isRecognized ? 'text-gold' : 'text-primary'}`,
      headerText: 'Semester recognition estimate',
      quote: isPresident ? 'You turned steady effort into an exceptional term. Carry that discipline into your next chapter.'
        : isDean ? 'Your progress is earned, one lesson at a time. Let this term remind you what consistent effort can build.'
        : 'A title is one milestone, not the measure of your potential. Choose your next step and keep moving.',
    };
  }, [semester]);

  const dialogRef = useAccessibleDialog(isOpen && !!semester && !!details, onClose);
  if (!isOpen || !semester || !details) return null;

  return (
    <div
      className="modal-overlay"
      ref={dialogRef}
      id="term-honor-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-term"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
      >
        <div className="modal-header">
          <h3 id="modal-title-term">
            <i className={`fa-solid ${details.headerIcon}`}></i> {details.headerText}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="term-modal-content">
          <div className="achieve-section" style={{ marginBottom: 0 }}>
            <div className={`achieve-card ${details.badgeClass}`}>
              <div className="achieve-icon">
                <i className={`fa-solid ${details.icon}`}></i>
              </div>
              <div className="achieve-details">
                <strong className="achieve-title">{details.title}</strong>
                <span className="achieve-subtext">{details.subtext}</span>
                <span className="achieve-subtext">{details.reason}</span>
              </div>
            </div>

            <div className="quote-box" style={{ marginTop: '14px' }}>
              <i className="fa-solid fa-quote-left quote-icon"></i>
              <div className="quote-text">
                <strong>Motivational Reminder:</strong>
                <br />
                &quot;{details.quote}&quot;
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
