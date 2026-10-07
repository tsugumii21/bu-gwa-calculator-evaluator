import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { ConfirmModal } from '../modals/ConfirmModal';

interface ActionToolbarProps {
  onAddSemester: () => void;
  onOpenScanCor: () => void;
  onOpenScanPhoto: () => void;
  onOpenBulkPaste: () => void;
  onOpenLatinHonors: () => void;
  onOpenAchievements: () => void;
  onComputeAll?: () => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onAddSemester,
  onOpenScanCor,
  onOpenScanPhoto,
  onOpenBulkPaste,
  onOpenLatinHonors,
  onOpenAchievements,
  onComputeAll,
}) => {
  const { clearAll, semesters } = useSemesterStore();
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  const handleClearAll = () => {
    if (semesters.length === 0) return;
    setIsClearAllModalOpen(true);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="toolbar-card">
      <div className="toolbar-section toolbar-actions">
        {semesters.length > 0 && onComputeAll && (
          <button
            type="button"
            className="btn btn-gold btn-sm btn-compute-all-toolbar"
            onClick={onComputeAll}
            id="btn-compute-all-toolbar"
            title="Compute all recorded semesters and calculate Cumulative GWA"
          >
            <i className="fa-solid fa-calculator"></i> Compute All Semesters
          </button>
        )}

        <button
          className="btn btn-gold btn-sm"
          onClick={onOpenLatinHonors}
          id="btn-latin-honors"
          title="Compute Latin Graduation Honors & Proximity"
        >
          <i className="fa-solid fa-medal"></i> Latin Honors
        </button>

        <button
          className="btn btn-gold btn-sm"
          onClick={onOpenAchievements}
          id="btn-achievements"
          title="View Academic Achievements Radar"
        >
          <i className="fa-solid fa-trophy"></i> Achievements
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={onAddSemester}
          id="btn-add-semester"
        >
          <i className="fa-solid fa-plus"></i> Add Semester
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenScanCor}
          id="btn-import-doc"
          title="Scan official COR PDF file"
        >
          <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444' }}></i> Scan COR (PDF)
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenScanPhoto}
          id="btn-scan-ss"
          title="Scan mobile screenshots of grade sheet with OCR"
        >
          <i className="fa-solid fa-camera" style={{ color: '#2563eb' }}></i> Scan Screenshots
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenBulkPaste}
          id="btn-bulk-paste"
          title="Paste schedule text"
        >
          <i className="fa-solid fa-paste"></i> Bulk Paste
        </button>

        <button
          className="btn btn-gold btn-sm"
          onClick={handleExportPDF}
          id="btn-export-pdf"
          title="Export academic summary as PDF"
        >
          <i className="fa-solid fa-file-export"></i> Export to PDF
        </button>

        {semesters.length > 0 && (
          <button
            className="btn btn-danger btn-sm"
            onClick={handleClearAll}
            id="btn-reset"
            title="Clear all data"
          >
            <i className="fa-solid fa-trash-can"></i> Clear All
          </button>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Clear All Semesters"
        message="Are you sure you want to clear all semesters, subjects, and computed records? This action cannot be undone."
        confirmText="Clear All"
        onConfirm={() => {
          setIsClearAllModalOpen(false);
          clearAll();
        }}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};
