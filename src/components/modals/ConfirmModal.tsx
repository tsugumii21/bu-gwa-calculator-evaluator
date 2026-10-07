import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      id="delete-confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-content animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h3 id="confirm-modal-title" style={{ margin: 0 }}>
            <i className={`fa-solid fa-triangle-exclamation text-${confirmVariant}`}></i> {title}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
            }}
          >
            {message}
          </p>
        </div>

        <div
          className="modal-footer"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 16px',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onCancel}
            style={{ minWidth: '80px', height: '36px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} btn-sm`}
            onClick={onConfirm}
            style={{ minWidth: '90px', height: '36px' }}
          >
            <i className="fa-solid fa-trash-can"></i> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
