import React, { useState } from 'react';
import { ClipboardPaste, FileText, Images, Trash2 } from 'lucide-react';
import { useSemesterStore } from '../../store';
import { DataPrivacyNote } from '../common/data-privacy-note';
import { ConfirmModal } from '../modals/ConfirmModal';

interface ActionToolbarProps {
  onAddSemester: () => void;
  onOpenScanCor: () => void;
  onOpenScanPhoto: () => void;
  onOpenBulkPaste: () => void;
  onOpenAchievements: () => void;
  onComputeAll?: () => void;
  showAddSemester?: boolean;
  showAchievements?: boolean;
  group?: 'all' | 'imports' | 'records';
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onAddSemester,
  onOpenScanCor,
  onOpenScanPhoto,
  onOpenBulkPaste,
  onOpenAchievements,
  onComputeAll,
  showAddSemester = true,
  showAchievements = true,
  group = 'all',
}) => {
  const { clearAll, semesters } = useSemesterStore();
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const Container = 'div';

  const handleClearAll = () => {
    if (semesters.length === 0) return;
    setIsClearAllModalOpen(true);
  };

  return (
    <section className={`toolbar-card v2-tools-${group}`} aria-label={group === 'imports' ? 'Import grades' : 'Record tools'}>
      <Container className="rd-tools">
        <h2 className="v2-tools-label">Import grades</h2>
        <div className="toolbar-section toolbar-actions">
        {group !== 'imports' && <>
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

        {showAchievements && <button
          className="btn btn-gold btn-sm"
          onClick={onOpenAchievements}
          id="btn-achievements"
          title="Review saved semesters and pending courses"
        >
          <i className="fa-solid fa-list-check"></i> Review record
        </button>}

        {showAddSemester && <button
          className="btn btn-primary btn-sm"
          onClick={onAddSemester}
          id="btn-add-semester"
        >
          <i className="fa-solid fa-plus"></i> Add Semester
        </button>}

        </>}
        {group !== 'records' && <>
        <button
          type="button"
          aria-haspopup="dialog"
          className="btn btn-secondary btn-sm"
          onClick={onOpenScanCor}
          id="btn-import-doc"
          title="Scan official COR PDF file"
        >
          <FileText size={18} aria-hidden="true" /> <span>Scan COR (PDF)</span>
        </button>

        <button
          type="button"
          aria-haspopup="dialog"
          className="btn btn-secondary btn-sm"
          onClick={onOpenScanPhoto}
          id="btn-scan-ss"
          title="Scan mobile screenshots or photos of grade sheet with OCR"
        >
          <Images size={18} aria-hidden="true" /> <span>Scan Image</span>
        </button>

        <button
          type="button"
          aria-haspopup="dialog"
          className="btn btn-secondary btn-sm"
          onClick={onOpenBulkPaste}
          id="btn-bulk-paste"
          title="Paste schedule text"
        >
          <ClipboardPaste size={18} aria-hidden="true" /> <span>Bulk Paste</span>
        </button>

        </>}
          <button
            type="button"
            aria-haspopup="dialog"
            className="btn btn-danger btn-sm"
            onClick={handleClearAll}
            id="btn-reset"
            title="Clear all data"
            disabled={semesters.length === 0}
          >
            <Trash2 size={18} aria-hidden="true" /> <span>Clear All</span>
          </button>
        </div>
        {group !== 'records' && (
          <DataPrivacyNote>PDFs, images, and pasted grades are processed in this browser. Saved grades stay here.</DataPrivacyNote>
        )}
      </Container>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Clear All Semesters"
        message={`This will remove ${semesters.length} saved ${semesters.length === 1 ? 'semester' : 'semesters'}, including every course and computed result in this browser. This action cannot be undone.`}
        confirmText="Clear All"
        onConfirm={() => {
          setIsClearAllModalOpen(false);
          clearAll();
        }}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </section>
  );
};
