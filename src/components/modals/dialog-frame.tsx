import { useId, type ReactNode } from 'react';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

/** Shared accessible frame for compact informational dialogs. */
export function DialogFrame({ isOpen, title, onClose, children }: {
  isOpen: boolean; title: string; onClose: () => void; children: ReactNode;
}) {
  const titleId = useId();
  const ref = useAccessibleDialog(isOpen, onClose);
  if (!isOpen) return null;
  return <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-content v2-info-dialog">
      <header className="modal-header"><div><span className="v2-info-eyebrow">YOUR RECORD, EXPLAINED</span><h2 id={titleId}>{title}</h2></div><button className="modal-close-btn" type="button" aria-label="Close dialog" onClick={onClose}>×</button></header>
      <div className="modal-body">{children}</div>
      <footer className="modal-footer"><button type="button" className="btn btn-primary" onClick={onClose}>Back to my record</button></footer>
    </div>
  </div>;
}
