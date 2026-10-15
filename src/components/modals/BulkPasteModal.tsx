import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import type { Subject } from '../../types';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DATA = `CS 111 - Introduction to Computing - 3 - 1.25
GEC 11 - Understanding the Self - 3 - 1.50
MATH 111 - Calculus 1 - 4 - 1.75
CS 112 - Computer Programming 1 - 3 - 1.25
NSTP 1 - National Service Training Program 1 - 3 - 1.25`;

export const BulkPasteModal: React.FC<BulkPasteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSemester } = useSemesterStore();
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleLoadSample = () => {
    setText(SAMPLE_DATA);
  };

  const processBulkPaste = () => {
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
          const unitsVal = Math.max(0, parseFloat(parts[parts.length - 2]) || 3);
          const nameVal = parts.slice(1, -2).join(` ${delim} `);
          return { code: codeVal, name: nameVal, units: unitsVal, grade: gradeVal };
        }
        if (parts.length === 3) {
          return { code: parts[0], name: parts[1], units: Math.max(0, parseFloat(parts[2]) || 3), grade: '1.50' };
        }
        if (parts.length === 2) {
          return { code: parts[0], name: parts[1], units: 3, grade: '1.50' };
        }
        return { code: parts[0], name: 'Imported Course', units: 3, grade: '1.50' };
      };

      if (trimmed.includes('\t')) {
        newSubjects.push(parseRow(trimmed, '\t'));
      } else if (trimmed.includes(',')) {
        newSubjects.push(parseRow(trimmed, ','));
      } else if (trimmed.includes('-')) {
        newSubjects.push(parseRow(trimmed, '-'));
      } else {
        newSubjects.push({ code: trimmed, name: 'Imported Course', grade: '1.50', units: 3 });
      }
    });

    if (newSubjects.length > 0) {
      addSemester({
        id: crypto.randomUUID(),
        title: `Bulk Imported (${newSubjects.length} Courses)`,
        underload: false,
        computed: false,
        subjects: newSubjects,
      });
    }

    setText('');
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-paste"
      onClick={onClose}
    >
      <div
        className="modal-content animate__animated animate__zoomIn animate__faster"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title-paste">
            <i className="fa-solid fa-paste text-primary"></i> Bulk Paste Schedule
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-instruction">
            Paste your schedule below, one subject per line. Supported formats (with optional grade):
          </p>
          <ul className="modal-format-list">
            <li><code>CS 111 - Introduction to Computing - 3 - 1.25</code></li>
            <li><code>CS 111 &Tab; Introduction to Computing &Tab; 3 &Tab; 1.5</code></li>
            <li><code>CS 111, Introduction to Computing, 3, 1.0</code></li>
          </ul>
          <textarea
            id="bulk-paste-textarea"
            className="form-control bulk-textarea"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`CS 111 - Introduction to Computing - 3 - 1.25\nGEC 11 - Understanding the Self - 3 - 1.5\nMATH 111 - Calculus 1 - 4 - 1.0`}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-gold btn-sm" onClick={handleLoadSample}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> Load Sample
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={processBulkPaste} disabled={!text.trim()}>
            <i className="fa-solid fa-check"></i> Import
          </button>
        </div>
      </div>
    </div>
  );
};
