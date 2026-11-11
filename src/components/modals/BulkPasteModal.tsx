import React, { useState } from 'react';
import { ClipboardPaste, FileText } from 'lucide-react';
import { useSemesterStore } from '../../store';
import type { Subject } from '../../types';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { buildCalculationReport } from '../../core/calculation-report';
import { ImportRows } from './import-rows';
import { RecordDialogHeader } from './record-dialog-header';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DATA = `CS 111 - Introduction to Computing - 3 - 1.2
GEC 11 - Understanding the Self - 3 - 1.50
MATH 111 - Calculus 1 - 4 - 1.7
CS 112 - Computer Programming 1 - 3 - 1.2
NSTP 1 - National Service Training Program 1 - 3 - 1.2`;

export const BulkPasteModal: React.FC<BulkPasteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSemester } = useSemesterStore();
  const [text, setText] = useState('');
  const [review, setReview] = useState<Subject[] | null>(null);
  const [title, setTitle] = useState('Imported semester');
  const [error, setError] = useState('');
  const close = () => { setText(''); setReview(null); setError(''); onClose(); };
  const dialogRef = useAccessibleDialog(isOpen, close);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setText(SAMPLE_DATA);
  };

  const processBulkPaste = () => {
    if (review) {
      const term = { id: crypto.randomUUID(), title, subjects: review, computed: false, underload: false };
      const invalid = buildCalculationReport([term]).errors[0];
      if (invalid || !review.length || !title.trim()) { setError(invalid ?? 'Enter a semester title and at least one course.'); return; }
      addSemester(term);
      close();
      return;
    }
    const rawText = text.trim();
    if (!rawText) {
      onClose();
      return;
    }

    const lines = rawText.split('\n');
    const newSubjects: Subject[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parseRow = (lineStr: string, delim: string): Subject => {
        const parts = lineStr.split(delim).map((p) => p.trim());
        if (parts.length >= 4) {
          const codeVal = parts[0];
          const gradeVal = parts[parts.length - 1];
          const unitsVal = Number(parts[parts.length - 2]) || 0;
          const nameVal = parts.slice(1, -2).join(` ${delim} `);
          return { code: codeVal, name: nameVal, units: unitsVal, grade: gradeVal };
        }
        if (parts.length === 3) {
          return { code: parts[0], name: parts[1], units: Number(parts[2]) || 0, grade: '' };
        }
        if (parts.length === 2) {
          return { code: parts[0], name: parts[1], units: 0, grade: '' };
        }
        return { code: parts[0], name: '', units: 0, grade: '' };
      };

      if (trimmed.includes('\t')) {
        newSubjects.push(parseRow(trimmed, '\t'));
      } else if (trimmed.includes(',')) {
        newSubjects.push(parseRow(trimmed, ','));
      } else if (trimmed.includes('-')) {
        newSubjects.push(parseRow(trimmed, '-'));
      } else {
        newSubjects.push({ code: trimmed, name: '', grade: '', units: 0 });
      }
    });

    setReview(newSubjects);
  };

  return (
    <div
      className="modal-overlay v2-import-overlay v2-record-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-paste"
      ref={dialogRef}
      onClick={close}
    >
      <div
        className="modal-content v2-record-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <RecordDialogHeader id="modal-title-paste" title={review ? 'Review pasted courses' : 'Paste your courses'} icon={ClipboardPaste} onClose={close} eyebrow={review ? 'REVIEW BEFORE IMPORTING' : 'IMPORT GRADES'} />

        <div className="modal-body">
          <p className="v2-dialog-note">Adds a new semester to your shared record. Existing semesters are kept. In GWA mode, select the imported semester to compute it on its own.</p>
          {error && <p role="alert">{error}</p>}
          {review ? <><label className="v2-dialog-field">New semester title<input value={title} onChange={event => setTitle(event.target.value)} /></label><ImportRows subjects={review} onChange={setReview} /></> : <>
          <p className="modal-instruction">
            One course per line. Include its code, description, units and an optional grade.
          </p>
          <details className="record-format-help"><summary>See supported formats</summary>
          <ul className="modal-format-list">
            <li><code>CS 111 - Introduction to Computing - 3 - 1.2</code></li>
            <li><code>CS 111 [Tab] Introduction to Computing [Tab] 3 [Tab] 1.5</code></li>
            <li><code>CS 111, Introduction to Computing, 3, 1.0</code></li>
          </ul>
          </details>
          <label className="record-field-label" htmlFor="bulk-paste-textarea">Course rows</label>
          <textarea
            id="bulk-paste-textarea"
            aria-label="Paste course rows"
            className="form-control bulk-textarea"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`CS 111 - Introduction to Computing - 3 - 1.2\nGEC 11 - Understanding the Self - 3 - 1.5\nMATH 111 - Calculus 1 - 4 - 1.0`}
            style={{ resize: 'none' }}
          />
          </>}
        </div>

        <div className="modal-footer">
          {!review && <button type="button" className="btn btn-secondary btn-sm" onClick={handleLoadSample}>
            <FileText size={18} aria-hidden="true" /> Load Sample
          </button>}
          {review && <button type="button" className="btn btn-secondary" onClick={() => setReview(null)}>Back to text</button>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={processBulkPaste} disabled={!text.trim()}>
            <i className="fa-solid fa-check" aria-hidden="true"></i> {review ? 'Import reviewed courses' : 'Review courses'}
          </button>
        </div>
      </div>
    </div>
  );
};
