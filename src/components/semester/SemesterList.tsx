import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { SemesterCard } from './SemesterCard';

interface SemesterListProps {
  onAddSemester: () => void;
  onOpenScanCor: () => void;
  onOpenScanPhoto: () => void;
  lastComputedAt?: number;
}

export const SemesterList: React.FC<SemesterListProps> = ({
  onAddSemester,
  onOpenScanCor,
  onOpenScanPhoto,
  lastComputedAt,
}) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [computeFeedback, setComputeFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (lastComputedAt && lastComputedAt > 0) {
      const validCount = semesters.filter((s) =>
        s.subjects?.some((sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade)))
      ).length;
      setComputeFeedback(`Computed ${validCount} semester${validCount > 1 ? 's' : ''} • Cumulative GWA updated`);
      setTimeout(() => setComputeFeedback(null), 3500);
    }
  }, [lastComputedAt, semesters]);


  // Smart Compact Accordions: On multi-term profiles (>2 semesters), prior computed semesters
  // auto-collapse into compact summary rows to eliminate vertical scroll death-march,
  // keeping the active / latest semester expanded for immediate editing.
  const isSemCollapsed = (sem: (typeof semesters)[0], idx: number): boolean => {
    if (collapsedMap[sem.id] !== undefined) {
      return collapsedMap[sem.id];
    }
    if (semesters.length > 2 && sem.computed && idx < semesters.length - 1) {
      return true;
    }
    return false;
  };

  const toggleSemester = (id: string) => {
    setCollapsedMap((prev) => {
      const semIndex = semesters.findIndex((s) => s.id === id);
      const current = prev[id] !== undefined ? prev[id] : isSemCollapsed(semesters[semIndex], semIndex);
      return { ...prev, [id]: !current };
    });
  };

  const allCollapsed = semesters.length > 0 && semesters.every((s, idx) => isSemCollapsed(s, idx));

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
            <i className="fa-solid fa-camera text-primary"></i> Scan Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="semesters-container" aria-label="Semester cards">
      {semesters.length > 0 && (
        <div className="semester-list-header">
          <label className="rd-semester-index">Jump to term
            <select aria-label="Jump to semester" defaultValue="" onChange={e => {
              setCollapsedMap(prev => ({ ...prev, [e.target.value]: false }));
              const card = document.getElementById(`semester-${e.target.value}`);
              card?.scrollIntoView({ block: 'start' });
              card?.focus({ preventScroll: true });
            }}><option value="" disabled>Select semester</option>{semesters.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
          </label>
          <span className="sem-badge-count">
            <i className="fa-solid fa-graduation-cap"></i> {semesters.length} {semesters.length === 1 ? 'Semester' : 'Semesters'} Recorded
          </span>

          <div className="sem-list-controls">
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

      {computeFeedback && (
        <div className="compute-feedback-banner">
          <i className="fa-solid fa-circle-check"></i>
          <span>{computeFeedback}</span>
        </div>
      )}

      {semesters.map((sem, idx) => (
        <SemesterCard
          key={sem.id}
          semester={sem}
          index={idx}
          collapsed={isSemCollapsed(sem, idx)}
          onToggleCollapse={() => toggleSemester(sem.id)}
        />
      ))}
    </div>
  );
};
