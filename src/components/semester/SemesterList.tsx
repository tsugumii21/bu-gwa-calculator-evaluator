import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { SemesterCard } from './SemesterCard';

interface SemesterListProps {
  onAddSemester: () => void;
  onOpenScanCor: () => void;
  onOpenScanPhoto: () => void;
  onOpenLatinHonors?: () => void;
}

export const SemesterList: React.FC<SemesterListProps> = ({
  onAddSemester,
  onOpenScanCor,
  onOpenScanPhoto,
  onOpenLatinHonors,
}) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const computeAllSemesters = useSemesterStore((s) => s.computeAllSemesters);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const handleComputeAll = () => {
    const hasAnyValidGrade = semesters.some((s) =>
      s.subjects?.some((sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade)))
    );

    if (!hasAnyValidGrade) {
      alert('Please enter at least one course grade rating before computing overall GWA.');
      return;
    }

    computeAllSemesters();

    // Auto-collapse computed terms for clean summary overview
    const nextMap: Record<string, boolean> = {};
    semesters.forEach((s) => {
      nextMap[s.id] = true;
    });
    setCollapsedMap(nextMap);

    if (onOpenLatinHonors) {
      onOpenLatinHonors();
    }
  };

  // Helper: computed terms collapse by default; draft/uncomputed remain open
  const isSemCollapsed = (sem: (typeof semesters)[0]): boolean => {
    if (collapsedMap[sem.id] !== undefined) {
      return collapsedMap[sem.id];
    }
    return Boolean(sem.computed);
  };

  const toggleSemester = (id: string) => {
    setCollapsedMap((prev) => {
      const sem = semesters.find((s) => s.id === id);
      const current = prev[id] !== undefined ? prev[id] : Boolean(sem?.computed);
      return { ...prev, [id]: !current };
    });
  };

  const allCollapsed = semesters.length > 0 && semesters.every((s) => isSemCollapsed(s));

  const toggleAll = () => {
    const nextState = !allCollapsed;
    const nextMap: Record<string, boolean> = {};
    semesters.forEach((s) => {
      nextMap[s.id] = nextState;
    });
    setCollapsedMap(nextMap);
  };

  if (semesters.length === 0) {
    return (
      <div className="empty-state" id="empty-state">
        <div className="empty-state-icon">
          <i className="fa-solid fa-folder-open"></i>
        </div>
        <h3>No Semesters Added</h3>
        <p>
          Click <strong>&quot;Add Semester&quot;</strong> or scan a COR PDF / screenshot to get started.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={onAddSemester}>
            <i className="fa-solid fa-plus"></i> Add Semester
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onOpenScanCor}>
            <i className="fa-solid fa-file-pdf text-danger"></i> Scan COR (PDF)
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onOpenScanPhoto}>
            <i className="fa-solid fa-camera text-primary"></i> Scan Screenshots
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="semesters-container" aria-label="Semester cards">
      {semesters.length > 0 && (
        <div className="semester-list-header">
          <span className="sem-badge-count">
            <i className="fa-solid fa-graduation-cap"></i> {semesters.length} {semesters.length === 1 ? 'Semester' : 'Semesters'} Recorded
          </span>

          <div className="sem-list-controls">
            <button
              type="button"
              className="btn btn-gold btn-sm sem-compute-all-btn"
              onClick={handleComputeAll}
              title="Compute overall cumulative GWA and evaluate Latin Graduation Honors"
            >
              <i className="fa-solid fa-calculator"></i>
              <span>Compute Overall GWA</span>
            </button>

            {semesters.length > 1 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm sem-toggle-all-btn"
                onClick={toggleAll}
                title={allCollapsed ? 'Expand all semesters' : 'Collapse all semesters'}
              >
                <i className={`fa-solid ${allCollapsed ? 'fa-angles-down' : 'fa-angles-up'}`}></i>
                <span>{allCollapsed ? 'Expand All' : 'Collapse All'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {semesters.map((sem, idx) => (
        <SemesterCard
          key={sem.id}
          semester={sem}
          index={idx}
          collapsed={isSemCollapsed(sem)}
          onToggleCollapse={() => toggleSemester(sem.id)}
        />
      ))}
    </div>
  );
};
