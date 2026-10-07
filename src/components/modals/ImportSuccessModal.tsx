import React from 'react';

interface ImportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  semesterTitle: string;
}

export const ImportSuccessModal: React.FC<ImportSuccessModalProps> = ({
  isOpen,
  onClose,
  count,
  semesterTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      id="import-success-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-import-success"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: '440px', textAlign: 'center', padding: '24px' }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px auto',
          }}
        >
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <h3
          id="modal-title-import-success"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          PDF COR Import Successful!
        </h3>
        <p
          id="import-success-desc"
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          Successfully imported {count} courses from PDF for &quot;{semesterTitle}&quot; into your academic schedule!
        </p>
        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%', justifyContent: 'center', padding: '10px', fontWeight: 700 }}
        >
          Great!
        </button>
      </div>
    </div>
  );
};
