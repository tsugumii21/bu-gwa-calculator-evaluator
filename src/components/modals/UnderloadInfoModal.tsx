import React from 'react';

interface UnderloadInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnderloadInfoModal: React.FC<UnderloadInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
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
              <i className="fa-solid fa-book"></i> BU Student Handbook Reference: Article VIII, Section 30 (Page 36)
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
                  Official Disqualification Rule (Art. VIII, Sec. 30):
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
                  Carrying an underloaded term officially <strong>disqualifies</strong> a student candidate from{' '}
                  <strong>Graduation Latin Honors</strong> (Summa, Magna, or Cum Laude) and{' '}
                  <strong>Semester Academic Recognition</strong> (President&apos;s Lister or Dean&apos;s Lister).
                </span>
              </div>
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
