import React, { useState, useMemo } from 'react';
import type { Semester, Subject } from '../../types';
import { useSemesterStore } from '../../store';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { isMidyearTerm } from '../../core/honor-rules';
import { SubjectRow } from './SubjectRow';
import { ComputeModal } from '../animations/ComputeModal';
import { TermHonorModal } from '../modals/TermHonorModal';
import { UnderloadInfoModal } from '../modals/UnderloadInfoModal';
import { MidyearInfoModal } from '../modals/MidyearInfoModal';
import { ConfirmModal } from '../modals/ConfirmModal';

interface SemesterCardProps {
  semester: Semester;
  index: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  index: _index,
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

  const [localCollapsed, setLocalCollapsed] = useState<boolean>(false);
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
  const [isMidyearInfoOpen, setIsMidyearInfoOpen] = useState(false);
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
          sub.grade === '4.0' ||
          sub.grade === '4.00' ||
          num === 4.0 ||
          sub.grade === 'INC'
        ) {
          hasFailOrInc = true;
        }
        if (!isNaN(num) && num > lowestGradeInSem) lowestGradeInSem = num;
      });
    }

    let honorCode = 'Good Academic Standing';
    let pillClass = 'sem-pill-regular';

    const isMidyear = isMidyearTerm(semester.title, semester.isMidyear);

    if (hasFailOrInc) {
      honorCode = 'Academic Deficiency';
      pillClass = 'sem-pill-danger';
    } else if (semester.underload) {
      honorCode = 'Underloaded Term';
      pillClass = 'sem-pill-warning';
    } else if (semUnits >= 15 && !isMidyear) {
      if (semGWA <= 1.45 && lowestGradeInSem <= 1.75) {
        honorCode = "President's Lister";
        pillClass = 'sem-pill-pl';
      } else if (semGWA <= 1.75 && lowestGradeInSem <= 2.5) {
        honorCode = "Dean's Lister";
        pillClass = 'sem-pill-dl';
      }
    } else if (isMidyear) {
      honorCode = 'Midyear Term';
      pillClass = 'sem-pill-regular';
    }

    return { honorCode, pillClass };
  }, [semester, semGWA, semUnits]);

  const handleAddSubject = () => {
    const newSubject: Subject = {
      code: '',
      name: '',
      grade: '1.2',
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
  };

  return (
    <>
      <div className={`semester-card ${isCollapsed ? 'is-collapsed' : ''}`}>
        {/* ── SEMESTER HEADER ── */}
        <div className={`sem-header ${isCollapsed ? 'sem-header-collapsed' : ''}`}>
          <div className="sem-header-left">
            {isCollapsed ? (
              <>
                <span className="sem-collapsed-title" title={semester.title}>
                  {semester.title}
                </span>
                <div className="sem-collapsed-badges">
                  <span className="sem-units-chip">
                    {semUnits} Units • {semester.subjects?.length || 0} Courses
                  </span>
                  {semester.computed && honorBadgeData && (
                    <span className={`sem-result-pill ${honorBadgeData.pillClass}`}>
                      GPA: <strong>{semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>{honorBadgeData.honorCode}</strong>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  className="sem-title-select"
                  value={semester.title}
                  onChange={(e) => updateSemester(semester.id, { title: e.target.value })}
                  aria-label="Semester Title"
                />
                {semester.computed && honorBadgeData && (
                  <span className={`sem-result-pill ${honorBadgeData.pillClass}`}>
                    GPA: <strong>{semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>{honorBadgeData.honorCode}</strong>
                  </span>
                )}
              </>
            )}
          </div>

          <div className="sem-header-right">
            {!isCollapsed && (
              <button
                type="button"
                className="btn btn-gold btn-sm btn-compute-trigger"
                onClick={handleTriggerCompute}
                title="Compute GPA and Honor Qualification for this semester"
              >
                <i className="fa-solid fa-calculator"></i> <span>Compute Term GPA</span>
              </button>
            )}

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
              className="btn btn-danger btn-sm sem-delete-btn"
              onClick={() => setIsDeleteModalOpen(true)}
              title="Remove Semester"
              aria-label={`Delete ${semester.title}`}
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        {/* ── DEDICATED TERM MODIFIERS BAR (Above course table when expanded) ── */}
        {!isCollapsed && (
          <div className="sem-modifiers-bar">
            <div className="sem-modifiers-toggles">
              {/* Midyear / Summer Term Toggle */}
              <div className="sem-modifier-item">
                <label
                  className="underload-toggle midyear-toggle"
                  title="Check if this is a Midyear or Summer term (exempt from PL/DL and underload)"
                >
                  <input
                    type="checkbox"
                    checked={!!semester.isMidyear || isMidyearTerm(semester.title)}
                    onChange={(e) => updateSemester(semester.id, { isMidyear: e.target.checked })}
                  />{' '}
                  Midyear Term
                </label>

                <button
                  type="button"
                  className="underload-info-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMidyearInfoOpen(true);
                  }}
                  title="Why does Midyear have no PL or DL?"
                  aria-label="Midyear Policy Info"
                >
                  <i className="fa-solid fa-circle-question"></i>
                </button>
              </div>

              {/* Underloaded Term Toggle */}
              <div className="sem-modifier-item">
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
            </div>

            <div className="sem-modifiers-stats">
              <span className="sem-units-chip">
                <i className="fa-solid fa-layer-group"></i> {semUnits} Units • {semester.subjects?.length || 0} Courses
              </span>
            </div>
          </div>
        )}

        {/* ── EXACT ORIGINAL SUBJECT TABLE ── */}
        {!isCollapsed && (
          <>
            <div className="table-responsive">
              <table className="subject-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '22%' }}>Course Code (Optional)</th>
                    <th scope="col" style={{ width: '43%' }}>Course Description</th>
                    <th scope="col" style={{ width: '17%' }}>Grade Rating</th>
                    <th scope="col" style={{ width: '10%' }}>Credit Units</th>
                    <th scope="col" style={{ width: '8%', textAlign: 'center' }}>Action</th>
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

      {/* Midyear Information Modal */}
      <MidyearInfoModal
        isOpen={isMidyearInfoOpen}
        onClose={() => setIsMidyearInfoOpen(false)}
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
