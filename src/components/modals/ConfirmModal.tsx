import React from 'react';
import { TriangleAlert, Trash2 } from 'lucide-react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { RecordDialogHeader } from './record-dialog-header';

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
  const dialogRef = useAccessibleDialog(isOpen, onCancel);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay v2-record-overlay"
      id="delete-confirm-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-content v2-record-dialog v2-confirm-dialog">
        <RecordDialogHeader id="confirm-modal-title" title={title} icon={TriangleAlert} onClose={onCancel} eyebrow="MANAGE YOUR RECORD" />

        <div className="modal-body" style={{ padding: '20px' }}>
          <p id="confirm-modal-description"
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
            data-dialog-initial-focus
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
            <Trash2 size={18} aria-hidden="true" /> {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
