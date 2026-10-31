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
              <i className="fa-solid fa-book"></i> BU Student Handbook: Article VIII &amp; Article X (Pages 28–36)
            </div>

            {/* 1. Why no PL / DL */}
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
                  Why Can&apos;t a Midyear Term Award PL or DL?
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
                  Under <strong>BU Student Handbook Article X (Term Honors)</strong>, qualification for{' '}
                  <strong>President&apos;s Lister</strong> (GPA ≤ 1.4500) or{' '}
                  <strong>Dean&apos;s Lister</strong> (GPA ≤ 1.7500) strictly requires enrollment in a{' '}
                  <strong>regular semester carrying at least 15 graded academic units</strong>. Since Midyear/Summer is an
                  accelerated, non-regular term (typically 3–9 units / 2–3 subjects), it is exempt from semestral honor rolls.
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
                  <strong>YES, 100%.</strong> All passing and failing course grades, as well as credit units completed
                  during midyear sessions, are fully computed into your cumulative 4-year undergraduate GWA.
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
                  <strong>NO.</strong> Under Article VIII &amp; XI, midyear terms are recognized non-regular terms.
                  Carrying 3–9 units during summer is standard authorized load and will{' '}
                  <strong>NOT disqualify</strong> you from Summa, Magna, or Cum Laude graduation honors!
                </span>
              </div>
            </div>

            <div className="quote-box" style={{ marginTop: 0 }}>
              <i className="fa-solid fa-quote-left quote-icon"></i>
              <div className="quote-text">
                <strong>Registrar Policy Reminder:</strong>
                <br />
                &quot;Midyear terms keep your graduation curriculum on schedule. Every grade counts toward your degree honor standing!&quot;
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
