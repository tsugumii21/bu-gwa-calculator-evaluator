import React, { useState, useRef } from 'react';
import { useSemesterStore } from '../../store';
import type { Subject } from '../../types';
import { parsePdfCOR } from './pdf-parser';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter(
      (f) => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
    );

    if (files.length === 0) {
      alert('Please select valid PDF documents (.pdf). Image files are not supported in this tool.');
      return;
    }

    setIsProcessing(true);
    const newStaged: StagedCorSemester[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatusMessage(`Parsing COR ${i + 1} of ${files.length} (${file.name})...`);

      try {
        const result = await parsePdfCOR(file);
        if (result.subjects && result.subjects.length > 0) {
          const units = result.subjects.reduce((acc, s) => acc + (s.units || 0), 0);
          newStaged.push({
            id: crypto.randomUUID(),
            title: result.semesterTitle || `Year ${stagedSemesters.length + newStaged.length + 1} - 1st Semester`,
            fileName: file.name,
            subjects: result.subjects,
            totalUnits: units,
          });
        }
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
      }
    }

    setIsProcessing(false);
    setStatusMessage('');

    if (newStaged.length > 0) {
      setStagedSemesters((prev) => [...prev, ...newStaged]);
    } else {
      alert('Could not parse course schedules from the selected PDF(s). Please ensure they are official Bicol University Certificate of Registration (COR) PDFs.');
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
    if (stagedSemesters.length === 0) return;

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

    setStagedSemesters([]);
    onClose();
    onSuccess(totalCourses, summaryTitle);
  };

  const handleModalClose = () => {
    if (isProcessing) return;
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
      className="modal-overlay"
      id="cor-scan-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cor-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) handleModalClose();
      }}
    >
      <div className="modal-content animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h3 id="cor-modal-title">
            <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Scan Bicol University COR (PDF)
          </h3>
          <button
            className="modal-close-btn"
            onClick={handleModalClose}
            disabled={isProcessing}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body">
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
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>
                Processing COR Document(s)...
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {statusMessage}
              </p>
            </div>
          ) : stagedSemesters.length === 0 ? (
            <div
              className={`modal-dropzone ${dragActive ? 'drag-active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div>
                <i className="fa-solid fa-file-pdf modal-dropzone-icon" style={{ color: '#ef4444' }}></i>
              </div>
              <h4 className="modal-dropzone-title">
                Click or tap to select BU COR PDF(s)
              </h4>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Staged COR Semesters ({stagedSemesters.length})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ fontSize: '0.75rem', padding: '4px 10px', gap: '4px' }}
                >
                  <i className="fa-solid fa-plus text-primary"></i> Add Another PDF
                </button>
              </div>

              <div className="staged-cor-list">
                {stagedSemesters.map((sem, idx) => (
                  <div key={sem.id} className="staged-cor-card">
                    <div className="staged-cor-header">
                      <div className="staged-cor-title-row">
                        <i className="fa-solid fa-file-pdf text-danger" style={{ fontSize: '1rem' }}></i>
                        <input
                          type="text"
                          className="staged-cor-input"
                          value={sem.title}
                          onChange={(e) => updateStagedTitle(sem.id, e.target.value)}
                          placeholder={`Semester ${idx + 1}`}
                          title="Click to rename semester"
                        />
                      </div>
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
                    <div className="staged-cor-meta">
                      <span className="staged-meta-pill">
                        <i className="fa-solid fa-book-open"></i> {sem.subjects.length} Courses
                      </span>
                      <span className="staged-meta-pill">
                        <i className="fa-solid fa-layer-group"></i> {sem.totalUnits.toFixed(1)} Units
                      </span>
                      <span className="staged-meta-filename" title={sem.fileName}>
                        {sem.fileName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`staged-drop-mini ${dragActive ? 'drag-active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <i className="fa-solid fa-cloud-arrow-up text-primary"></i>
                <span>Drop another COR PDF here or click to browse</span>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '14px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
            }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: 'var(--color-success)' }}></i>
            <span>All parsing occurs client-side in your browser. Student data is never sent externally.</span>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleModalClose}
            disabled={isProcessing}
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
