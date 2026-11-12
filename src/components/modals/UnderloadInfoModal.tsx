import React from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

interface UnderloadInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnderloadInfoModal: React.FC<UnderloadInfoModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useAccessibleDialog(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      ref={dialogRef}
      id="underload-info-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-underload"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
      >
        <div className="modal-header underload-header">
          <h3 id="modal-title-underload">
            <i className="fa-solid fa-circle-info"></i> Underloaded Term in Bicol University
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="underload-modal-body">
          <div className="achieve-section" style={{ marginBottom: 0 }}>
            <div className="underload-ref-badge">
              <i className="fa-solid fa-book"></i> BU Student Handbook: Section III, Academic Load and Graduation with Honors, printed pp. 10, 20–21 / PDF pp. 20, 30–31
            </div>

            <div className="modal-callout-box">
              <p>
                An <strong>underloaded term</strong> means enrolling in fewer credit units than the regular required academic load prescribed in your curriculum for that specific semester.
              </p>
            </div>

            <div className="achieve-card alert-card-danger" style={{ marginBottom: '14px' }}>
              <div className="achieve-icon">
                <i className="fa-solid fa-triangle-exclamation text-danger" style={{ fontSize: '1.6rem' }}></i>
              </div>
              <div className="achieve-details">
                <strong className="disqualification-title" style={{ fontSize: '0.95rem' }}>
                  Graduation with Honors (Section III)
                </strong>
                <span
                  className="achieve-subtext"
                  style={{
                    display: 'block',
                    marginTop: '3px',
                    lineHeight: 1.45,
                    fontSize: '0.82rem',
                  }}
                >
                  The Handbook excludes underloaded candidates from <strong>graduation honors</strong>.
                  Confirm your prescribed load and any approved adjustment with your college.
                </span>
              </div>
            </div>

            <div className="modal-callout-box" style={{ marginBottom: '14px', fontSize: '0.84rem' }}>
              <strong><i className="fa-solid fa-circle-check text-success"></i> When is a low unit count NOT an underload?</strong>
              <ul style={{ margin: '6px 0 0 16px', padding: 0, lineHeight: 1.45 }}>
                <li><strong>Midyear / Summer Terms:</strong> The calculator checks underload for regular terms. Ask your college about your prescribed Midyear load.</li>
                <li><strong>Curriculum Prescribed Loads:</strong> If your degree program curriculum officially prescribes fewer units (e.g. 9–12 units for graduating thesis, practicum, or OJT), this is an authorized regular load, not an unexcused underload.</li>
                <li><strong>Approved adjustments:</strong> Ask your college how an approved load change affects eligibility.</li>
              </ul>
              <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <em>Only check the <strong>&quot;Underloaded Term&quot;</strong> button on a semester if you had an unauthorized/unexcused reduced load below your prescribed curriculum.</em>
              </p>
            </div>

            <div className="quote-box" style={{ marginTop: 0 }}>
              <i className="fa-solid fa-quote-left quote-icon"></i>
              <div className="quote-text">
                <strong>Motivational Reminder:</strong>
                <br />
                &quot;Every step forward is real progress, no matter the unit count. Keep going strong!&quot;
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary btn-sm"
            onClick={onClose}
            style={{ padding: '8px 22px', fontWeight: 700 }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
