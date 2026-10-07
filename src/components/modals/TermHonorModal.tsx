import React, { useMemo } from 'react';
import type { Semester } from '../../types';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { HONOR_MESSAGES } from '../../core/constants';

interface TermHonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  semester: Semester | null;
}

export const TermHonorModal: React.FC<TermHonorModalProps> = ({ isOpen, onClose, semester }) => {
  const details = useMemo(() => {
    if (!semester) return null;

    const semGWA = calculateSemesterGWA(semester);
    const semUnits = calculateSemesterUnits(semester);

    let lowestGradeInSem = 1.0;
    let hasFailOrInc = false;

    if (semester.subjects) {
      semester.subjects.forEach((sub) => {
        const num = parseFloat(sub.grade);
        if (
          sub.grade === '5.0' ||
          sub.grade === '5.00' ||
          num === 5.0 ||
          sub.grade === 'INC'
        ) {
          hasFailOrInc = true;
        }
        if (!isNaN(num) && num > lowestGradeInSem) {
          lowestGradeInSem = num;
        }
      });
    }

    let category: 'PL' | 'DL' | 'REGULAR' | 'UNDERLOAD' = 'REGULAR';
    let title = 'Dedicated Bueño';
    let badgeClass = 'card-emerald';
    let icon = 'fa-bullseye';
    let subtext = `${semester.title} • Semester GPA: ${semGWA.toFixed(4)}`;
    let headerIcon = 'fa-chart-line text-primary';
    let headerText = 'Semester Performance Summary';

    if (semUnits > 0 && !hasFailOrInc && !semester.underload) {
      if (semGWA <= 1.45 && lowestGradeInSem <= 1.75) {
        category = 'PL';
        title = "President's Lister";
        badgeClass = 'card-gold';
        icon = 'fa-crown';
        subtext = `${semester.title} • Semester GPA: ${semGWA.toFixed(4)}`;
        headerIcon = 'fa-crown text-gold';
        headerText = "President's Lister Qualification";
      } else if (semGWA <= 1.75 && lowestGradeInSem <= 2.5) {
        category = 'DL';
        title = "Dean's Lister";
        badgeClass = 'card-azure';
        icon = 'fa-medal';
        subtext = `${semester.title} • Semester GPA: ${semGWA.toFixed(4)}`;
        headerIcon = 'fa-medal text-gold';
        headerText = "Dean's Lister Qualification";
      }
    }

    if (category === 'REGULAR') {
      if (semester.underload) {
        category = 'UNDERLOAD';
        title = 'Balanced Pace Bueño';
        badgeClass = 'card-amber';
        icon = 'fa-scale-balanced';
        subtext = `${semester.title} (GPA: ${semGWA.toFixed(4)}) • Custom Load Term`;
        headerIcon = 'fa-scale-balanced text-warning';
        headerText = 'Balanced Load Term Summary';
      } else if (hasFailOrInc) {
        subtext = `${semester.title} (GPA: ${semGWA.toFixed(4)}) • Disqualified due to 5.0 / INC grade`;
      }
    }

    // Pick a quote based on category
    const quotes = HONOR_MESSAGES[category] || HONOR_MESSAGES.REGULAR;
    const quote = quotes[Math.floor(Math.random() * quotes.length)] || quotes[0];

    return {
      semGWA,
      title,
      badgeClass,
      icon,
      subtext,
      headerIcon,
      headerText,
      quote,
    };
  }, [semester]);

  if (!isOpen || !semester || !details) return null;

  return (
    <div
      className="modal-overlay"
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
