import { X, type LucideIcon } from 'lucide-react';

/** Shared heading for record imports and deliberate destructive confirmations. */
export function RecordDialogHeader({ id, title, icon: Icon, onClose, eyebrow = 'IMPORT GRADES' }: {
  id: string; title: string; icon: LucideIcon; onClose: () => void; eyebrow?: string;
}) {
  return <header className="modal-header record-dialog-header">
    <div className="record-dialog-heading">
      <span className="record-dialog-icon" aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>
      <div><span className="record-dialog-eyebrow">{eyebrow}</span><h2 id={id}>{title}</h2></div>
    </div>
    <button className="modal-close-btn" type="button" aria-label="Close modal" onClick={onClose}><X size={20} aria-hidden="true" /></button>
  </header>;
}
