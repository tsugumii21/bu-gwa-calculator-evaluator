import React from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

interface MidyearInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MidyearInfoModal: React.FC<MidyearInfoModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useAccessibleDialog(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      id="midyear-info-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-midyear"
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h3 id="modal-title-midyear" style={{ fontSize: '1.15rem' }}>
            <i className="fa-solid fa-sun text-gold"></i> Midyear &amp; Summer Term Academic Policy
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" id="midyear-modal-body">
          <div className="achieve-section" style={{ marginBottom: 0 }}>
            <div className="handbook-ref-badge handbook-ref-gold" style={{ marginBottom: '12px' }}>
              <i className="fa-solid fa-book"></i> BU Student Handbook: Academic Load, printed pp. 10–11 / PDF pp. 20–21. Academic Distinctions, printed p. 32 / PDF p. 42.
            </div>

            {/* Term recognition */}
            <div
              className="achieve-card alert-card-warning"
              style={{
                marginBottom: '12px',
                borderLeft: '4px solid var(--bu-gold)',
                background: 'rgba(245, 158, 11, 0.08)',
                padding: '12px 14px',
              }}
            >
              <div className="achieve-icon">
                <i className="fa-solid fa-circle-exclamation text-gold" style={{ fontSize: '1.4rem' }}></i>
              </div>
              <div className="achieve-details">
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  How does the calculator treat Midyear recognition?
                </strong>
                <span
                  className="achieve-subtext"
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    lineHeight: 1.45,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  The calculator reserves term distinctions for regular semesters and leaves Midyear out of its regular-term underload check. Confirm official requirements with your college.
                </span>
              </div>
            </div>

            {/* 2. Does it count toward GWA? */}
            <div
              className="achieve-card card-blue"
              style={{
                marginBottom: '12px',
                borderLeft: '4px solid var(--bu-azure)',
                background: 'rgba(37, 99, 235, 0.08)',
                padding: '12px 14px',
              }}
            >
              <div className="achieve-icon">
                <i className="fa-solid fa-chart-line text-primary" style={{ fontSize: '1.4rem' }}></i>
              </div>
              <div className="achieve-details">
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  Does Midyear Count Toward Cumulative Degree GWA?
                </strong>
                <span
                  className="achieve-subtext"
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    lineHeight: 1.45,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Final numeric Midyear grades with positive credit units count in your cumulative GWA using the same unit weighting as other terms.
                </span>
              </div>
            </div>

            {/* 3. Underload exemption */}
            <div
              className="achieve-card card-emerald"
              style={{
                marginBottom: '14px',
                borderLeft: '4px solid var(--color-success)',
                background: 'rgba(16, 185, 129, 0.08)',
                padding: '12px 14px',
              }}
            >
              <div className="achieve-icon">
                <i className="fa-solid fa-shield-halved text-success" style={{ fontSize: '1.4rem' }}></i>
              </div>
              <div className="achieve-details">
                <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                  Does 3–9 Units Count as an Underload for Latin Honors?
                </strong>
                <span
                  className="achieve-subtext"
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    lineHeight: 1.45,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  The calculator excludes Midyear from its regular-term underload check. Confirm prescribed load and official graduation requirements with your college.
                </span>
              </div>
            </div>

            <div className="quote-box" style={{ marginTop: 0 }}>
              <i className="fa-solid fa-quote-left quote-icon"></i>
              <div className="quote-text">
                Ask your college to confirm your prescribed Midyear load and official eligibility.
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
