import React, { useEffect, useState, useRef } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { useSemesterStore } from '../../store';
import type { Subject } from '../../types';
import { ScanFailure } from '../../types/scan';
import { COR_LIMITS, parsePdfCOR } from './pdf-parser';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { ImportRows } from '../modals/import-rows';
import { validateCalculationEntries } from '../../core/calculation-report';
import { RecordDialogHeader } from '../modals/record-dialog-header';

interface CorScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, title: string) => void;
}

interface StagedCorSemester {
  id: string;
  title: string;
  fileName: string;
  subjects: Subject[];
  totalUnits: number;
  unreadableCourseCodes: string[];
}

export const CorScanModal: React.FC<CorScanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addSemester } = useSemesterStore();
  const [stagedSemesters, setStagedSemesters] = useState<StagedCorSemester[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [failedFiles, setFailedFiles] = useState<{ id: string; file: File; message: string }[]>([]);
  const request = useRef<AbortController | null>(null);
  const dialogRef = useAccessibleDialog(isOpen, () => handleModalClose());

  useEffect(() => {
    if (!isOpen) return;
    return () => { request.current?.abort(); request.current = null; };
  }, [isOpen]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | File[], retryId?: string) => {
    if (request.current) return;
    const files = Array.from(fileList).filter(
      (f) => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
    );

    if (files.length === 0) {
      setError('Choose a PDF document. Use Scan Image for screenshots or photos.');
      return;
    }

    if (stagedSemesters.length + failedFiles.length + files.length - Number(!!retryId) > COR_LIMITS.files) {
      setError(`Stage up to ${COR_LIMITS.files} PDFs at a time. Remove a staged or failed file to add another.`);
      return;
    }
    if (retryId) setFailedFiles(previous => previous.filter(item => item.id !== retryId));
    const controller = new AbortController();
    request.current = controller;
    setIsProcessing(true);
    setError('');
    const newStaged: StagedCorSemester[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMessage(`Parsing COR ${i + 1} of ${files.length} (${file.name})...`);

      try {
        const result = await parsePdfCOR(file, controller.signal);
        if (controller.signal.aborted) return;
        if (result.subjects.length > 0) {
          const units = result.subjects.reduce((acc, s) => acc + s.units, 0);
          newStaged.push({
            id: crypto.randomUUID(),
            title: result.semesterTitle || `Year ${stagedSemesters.length + newStaged.length + 1} - 1st Semester`,
            fileName: file.name,
            subjects: result.subjects,
            totalUnits: units,
            unreadableCourseCodes: result.unreadableCourseCodes,
          });
        } else {
          const unreadable = result.unreadableCourseCodes.join(', ');
          const message = unreadable ? 'Check the credit units for ' + unreadable + ' and enter these courses manually.' : 'No COR schedule rows found.';
          setFailedFiles(previous => [...previous, { id: crypto.randomUUID(), file, message }]);
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        const message = failure instanceof ScanFailure ? failure.message
          : failure instanceof DOMException && failure.name === 'TimeoutError' ? 'Reading the PDF timed out.'
          : 'Could not read the PDF.';
        setFailedFiles(previous => [...previous, { id: crypto.randomUUID(), file, message }]);
      }
    }

    request.current = null;
    setIsProcessing(false);
    setStatusMessage('');

    if (newStaged.length > 0) {
      setStagedSemesters((prev) => [...prev, ...newStaged]);
      setExpandedIds(previous => new Set([...previous, ...newStaged.map(term => term.id)]));
    } else {
      setError('No courses could be read from these PDFs. Try another COR file or paste the courses manually.');
    }
  };

  const updateStagedTitle = (id: string, nextTitle: string) => {
    setStagedSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: nextTitle } : s))
    );
  };

  const removeStaged = (id: string) => {
    setStagedSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCommitAll = () => {
    if (stagedSemesters.length === 0 || request.current) return;
    const invalid = validateCalculationEntries(stagedSemesters.map(term => ({ ...term, underload: false, computed: false })))[0];
    if (invalid) { setError(invalid); return; }

    let totalCourses = 0;
    stagedSemesters.forEach((sem) => {
      addSemester({
        id: sem.id,
        title: sem.title || 'Scanned COR',
        underload: false,
        computed: false,
        subjects: sem.subjects,
      });
      totalCourses += sem.subjects.length;
    });

    const summaryTitle =
      stagedSemesters.length === 1
        ? stagedSemesters[0].title
        : `${stagedSemesters.length} Semesters`;

    handleModalClose();
    onSuccess(totalCourses, summaryTitle);
  };

  const handleModalClose = () => {
    request.current?.abort();
    request.current = null;
    setIsProcessing(false);
    setError('');
    setStatusMessage('');
    setDragActive(false);
    setFailedFiles([]);
    setExpandedIds(new Set());
    setStagedSemesters([]);
    onClose();
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const totalStagedCourses = stagedSemesters.reduce((sum, s) => sum + s.subjects.length, 0);

  return (
    <div
      className="modal-overlay v2-record-overlay"
      id="cor-scan-modal"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cor-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleModalClose();
      }}
    >
      <div className="modal-content v2-record-dialog">
        <RecordDialogHeader id="cor-modal-title" title="Import a COR PDF" icon={FileText} onClose={handleModalClose} eyebrow={stagedSemesters.length ? 'REVIEW BEFORE IMPORTING' : 'IMPORT GRADES'} />

        <div className="modal-body">
          <p className="v2-dialog-note">Review before importing. Each PDF adds a new semester; existing records are kept. Select one imported term in GWA mode, or use all terms in Latin Honors mode.</p>
          {error && <p role="alert">{error}</p>}
          {failedFiles.map(({ id, file, message }) => <div key={id} className="staged-cor-card">
            <p role="status">{file.name} — {message}</p>
            <button type="button" className="btn btn-secondary" disabled={isProcessing} onClick={() => void handleFiles([file], id)}>Retry {file.name}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setFailedFiles(previous => previous.filter(item => item.id !== id))}>Remove failed file</button>
          </div>)}
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          {isProcessing ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.2rem', color: 'var(--bu-blue)' }}></i>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                Processing COR Document(s)...
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {statusMessage}
              </p>
            </div>
          ) : stagedSemesters.length === 0 ? (
            <div
              className={`modal-dropzone ${dragActive ? 'drag-active' : ''}`}
              role="button" tabIndex={0} aria-label="Choose COR PDFs"
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInputRef.current?.click(); } }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div>
                <FileText className="modal-dropzone-icon" size={32} aria-hidden="true" />
              </div>
              <h3 className="modal-dropzone-title">
                Choose COR PDFs
              </h3>
              <p className="modal-dropzone-sub">
                Select 1 or multiple official Bicol University Certificate of Registration PDFs
                <span className="modal-desktop-only"> or drag and drop files here</span>
              </p>
              <p className="modal-dropzone-note">
                100% processed in-browser. Zero files uploaded to external servers.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Staged COR Semesters ({stagedSemesters.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '0.75rem', padding: '5px 12px', gap: '5px', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}
                >
                  <i className="fa-solid fa-plus text-primary"></i> Add Another PDF
                </button>
              </div>

              <div
                className={`staged-cor-list ${dragActive ? 'drag-active' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                {stagedSemesters.map((sem, idx) => {
                  const isExpanded = expandedIds.has(sem.id);
                  return (
                    <div key={sem.id} className="staged-cor-card">
                      <div className="staged-cor-header">
                        <div className="staged-cor-title-row">
                          <div className="staged-cor-icon-badge">
                            <i className="fa-solid fa-file-pdf"></i>
                          </div>
                          <div className="staged-cor-input-wrapper">
                            <input
                              type="text"
                              className="staged-cor-input"
                              value={sem.title}
                              onChange={(e) => updateStagedTitle(sem.id, e.target.value)}
                              placeholder={`Semester ${idx + 1}`}
                              title="Click to rename semester"
                              aria-label={`New semester title ${idx + 1}`}
                            />
                          </div>
                        </div>

                        <div className="staged-cor-actions">
                          <button
                            type="button"
                            className="staged-preview-toggle"
                            onClick={() => toggleExpand(sem.id)}
                            title={isExpanded ? 'Hide extracted courses' : 'View extracted courses'}
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            <span>{isExpanded ? 'Hide' : 'Review'}</span>
                          </button>
                          <button
                            type="button"
                            className="staged-cor-del-btn"
                            onClick={() => removeStaged(sem.id)}
                            title="Remove from staging queue"
                            aria-label="Remove semester"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>

                      <div className="staged-cor-meta">
                        <span className="staged-meta-pill">
                          <i className="fa-solid fa-book-open text-primary"></i> {sem.subjects.length} Courses
                        </span>
                        <span className="staged-meta-pill">
                          <i className="fa-solid fa-layer-group text-primary"></i> {sem.totalUnits.toFixed(1)} Units
                        </span>
                        <span className="staged-meta-filename" title={sem.fileName}>
                          <i className="fa-solid fa-paperclip"></i> {sem.fileName}
                        </span>
                      </div>

                      {sem.unreadableCourseCodes.length > 0 && (
                        <p className="v2-dialog-note" role="status">
                          Could not confirm credit units for {sem.unreadableCourseCodes.join(', ')}.
                          {' '}These courses were skipped. Check your COR and enter them manually after importing.
                        </p>
                      )}

                      {isExpanded && (
                        <div className="staged-courses-preview">
                          <ImportRows subjects={sem.subjects} onChange={subjects => setStagedSemesters(previous => previous.map(term => term.id === sem.id ? { ...term, subjects, totalUnits: subjects.reduce((sum, row) => sum + row.units, 0) } : term))} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className="record-privacy-note"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '14px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}
          >
            <ShieldCheck size={18} aria-hidden="true" />
            <span>PDFs are read in your browser. These files are not uploaded.</span>
          </div>
        </div>

        <div className="modal-footer cor-modal-footer">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleModalClose}
            style={{ padding: '8px 16px', fontWeight: 600 }}
          >
            Cancel
          </button>
          {stagedSemesters.length > 0 && (
            <button
              className="btn btn-gold btn-sm"
              onClick={handleCommitAll}
              disabled={isProcessing}
              style={{ padding: '8px 18px', fontWeight: 700 }}
            >
              <i className="fa-solid fa-file-import"></i> Import All ({stagedSemesters.length} {stagedSemesters.length === 1 ? 'Semester' : 'Semesters'} • {totalStagedCourses} Courses)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
