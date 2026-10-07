import React, { useState, useMemo } from 'react';
import type { Semester, Subject } from '../../types';
import { useSemesterStore } from '../../store';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { SubjectRow } from './SubjectRow';
import { ComputeModal } from '../animations/ComputeModal';
import { TermHonorModal } from '../modals/TermHonorModal';
import { UnderloadInfoModal } from '../modals/UnderloadInfoModal';
import { ConfirmModal } from '../modals/ConfirmModal';

interface SemesterCardProps {
  semester: Semester;
  index: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  index,
  collapsed,
  onToggleCollapse,
}) => {
  const {
    updateSemester,
    removeSemester,
    addSubject,
    updateSubject,
    removeSubject,
    computeSemester,
  } = useSemesterStore();

  const [localCollapsed, setLocalCollapsed] = useState<boolean>(() => Boolean(semester.computed));
  const isCollapsed = collapsed !== undefined ? collapsed : localCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed((prev) => !prev);
    }
  };

  const [isComputing, setIsComputing] = useState(false);
  const [isTermHonorOpen, setIsTermHonorOpen] = useState(false);
  const [isUnderloadInfoOpen, setIsUnderloadInfoOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const semGWA = calculateSemesterGWA(semester);
  const semUnits = calculateSemesterUnits(semester);

  const honorBadgeData = useMemo(() => {
    if (!semester.computed) return null;

    if (semUnits === 0) {
      return {
        pillClass: 'sem-pill-regular',
        honorCode: 'No Courses',
      };
    }

    let lowestGradeInSem = 1.0;
    let hasFailOrInc = false;

    if (semester.subjects) {
      semester.subjects.forEach((sub) => {
        const num = parseFloat(sub.grade);
        if (
          sub.grade === '5.0' ||
          sub.grade === '5.00' ||
          num === 5.0 ||
          sub.grade === 'INC'
        ) {
          hasFailOrInc = true;
        }
        if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
      });
    }

    let honorCode = 'Good Academic Standing';
    let pillClass = 'sem-pill-regular';

    if (!hasFailOrInc && !semester.underload) {
      if (semGWA <= 1.45 && lowestGradeInSem <= 1.75) {
        honorCode = "President's Lister";
        pillClass = 'sem-pill-pl';
      } else if (semGWA <= 1.75 && lowestGradeInSem <= 2.5) {
        honorCode = "Dean's Lister";
        pillClass = 'sem-pill-dl';
      }
    } else if (semester.underload) {
      honorCode = 'Balanced Pace Bueño';
      pillClass = 'sem-pill-warning';
    } else if (hasFailOrInc) {
      honorCode = 'Good Academic Standing';
      pillClass = 'sem-pill-regular';
    }

    return { honorCode, pillClass };
  }, [semester, semGWA, semUnits]);

  const handleAddSubject = () => {
    const newSubject: Subject = {
      code: '',
      name: '',
      grade: '1.25',
      units: 3.0,
    };
    addSubject(semester.id, newSubject);
  };

  const handleTriggerCompute = () => {
    const hasAnyGrade = semester.subjects && semester.subjects.some(
      (sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade))
    );
    if (!hasAnyGrade) {
      alert('Please enter at least one Grade Rating before computing.');
      return;
    }
    setIsComputing(true);
  };

  const handleComputeComplete = () => {
    setIsComputing(false);
    computeSemester(semester.id);
    setIsTermHonorOpen(true);
    // Auto-collapse computed terms per user preference
    if (!isCollapsed) {
      handleToggleCollapse();
    }
  };

  return (
    <>
      <div className={`semester-card ${isCollapsed ? 'is-collapsed' : ''}`}>
        {/* ── EXACT ORIGINAL SEMESTER HEADER ── */}
        <div className={`sem-header ${isCollapsed ? 'sem-header-collapsed' : ''}`}>
          <div className="sem-title-group">
            <div className="sem-title-row">
              <input
                type="text"
                className="sem-title-select"
                value={semester.title}
                onChange={(e) => updateSemester(semester.id, { title: e.target.value })}
                aria-label="Semester Title"
              />
            </div>

            {!isCollapsed && (
              <button
                type="button"
                className="btn btn-gold btn-sm btn-compute-trigger"
                onClick={handleTriggerCompute}
                title="Compute GPA and Honor Qualification for this semester"
              >
                <i className="fa-solid fa-calculator"></i> Compute Term GPA
              </button>
            )}

            <div className="sem-badges-row">
              {isCollapsed && (
                <span className="sem-units-chip">
                  {semUnits} Units • {semester.subjects?.length || 0} Courses
                </span>
              )}

              {semester.computed && honorBadgeData && (
                <span className={`sem-result-pill ${honorBadgeData.pillClass}`}>
                  GPA: <strong>{semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>{honorBadgeData.honorCode}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="sem-actions">
            {!isCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <label
                  className="underload-toggle"
                  title="Check if student carried less than regular load this semester"
                >
                  <input
                    type="checkbox"
                    checked={semester.underload}
                    onChange={(e) => updateSemester(semester.id, { underload: e.target.checked })}
                  />{' '}
                  Underloaded Term
                </label>

                <button
                  type="button"
                  className="underload-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUnderloadInfoOpen(true);
                  }}
                  title="What is an Underloaded Term?"
                  aria-label="Underload Info"
                >
                  <i className="fa-solid fa-circle-question"></i>
                </button>
              </div>
            )}

            <div className="sem-action-buttons">
              <button
                type="button"
                className="btn btn-secondary btn-sm sem-toggle-btn"
                onClick={handleToggleCollapse}
                title={isCollapsed ? 'Expand semester details' : 'Collapse semester details'}
                aria-label={isCollapsed ? 'Expand semester details' : 'Collapse semester details'}
              >
                <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
                <span className="toggle-btn-text">{isCollapsed ? 'Expand' : 'Collapse'}</span>
              </button>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setIsDeleteModalOpen(true)}
                title="Remove Semester"
                aria-label={`Delete ${semester.title}`}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        {/* ── EXACT ORIGINAL SUBJECT TABLE ── */}
        {!isCollapsed && (
          <>
            <div className="table-responsive">
              <table className="subject-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Course Code (Optional)</th>
                    <th style={{ width: '43%' }}>Course Description</th>
                    <th style={{ width: '17%' }}>Grade Rating</th>
                    <th style={{ width: '10%' }}>Credit Units</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.subjects && semester.subjects.length > 0 ? (
                    semester.subjects.map((sub, sIdx) => (
                      <SubjectRow
                        key={sIdx}
                        subject={sub}
                        index={sIdx}
                        onUpdate={(field, val) =>
                          updateSubject(semester.id, sIdx, { [field]: val })
                        }
                        onRemove={() => removeSubject(semester.id, sIdx)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
                        No course rows. Click &quot;+ Add Course Row&quot; below.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── EXACT ORIGINAL SEMESTER FOOTER ── */}
            <div className="sem-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSubject}
              >
                <i className="fa-solid fa-plus"></i> Add Course Row
              </button>

              <span className="sem-total-units text-muted" style={{ fontSize: '0.82rem' }}>
                Total Units: {Math.round(semUnits)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 2.7s Lottie Computation Animation Modal */}
      <ComputeModal
        isOpen={isComputing}
        onComplete={handleComputeComplete}
        termTitle={semester.title}
      />

      {/* Term Honor Qualification Result Modal */}
      <TermHonorModal
        isOpen={isTermHonorOpen}
        onClose={() => setIsTermHonorOpen(false)}
        semester={semester}
      />

      {/* Underload Information Modal */}
      <UnderloadInfoModal
        isOpen={isUnderloadInfoOpen}
        onClose={() => setIsUnderloadInfoOpen(false)}
      />

      {/* Delete Semester Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Semester"
        message={`Are you sure you want to delete "${semester.title}" and all its subjects? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          removeSemester(semester.id);
        }}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};
