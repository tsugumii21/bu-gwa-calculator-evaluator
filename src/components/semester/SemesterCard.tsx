import React, { useState } from 'react';
import type { Semester, Subject } from '../../types';
import { useSemesterStore } from '../../store';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { isMidyearTerm } from '../../core/honor-rules';
import { buildCalculationReport } from '../../core/calculation-report';
import { SubjectRow } from './SubjectRow';
import { TermHonorModal } from '../modals/TermHonorModal';
import { TermPolicyDialog } from '../modals/term-policy-dialog';
import { ConfirmModal } from '../modals/ConfirmModal';

interface SemesterCardProps {
  semester: Semester;
  index: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showModifiers?: boolean;
  hideCompute?: boolean;
  computeLabel?: string;
  onCompute?: () => void;
  showRecognition?: boolean;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  index,
  collapsed,
  onToggleCollapse,
  showModifiers = true,
  hideCompute = false,
  computeLabel,
  onCompute,
  showRecognition = true,
}) => {
  const {
    updateSemester,
    removeSemester,
    addSubject,
    updateSubject,
    removeSubject,
    computeSemester,
    moveSemester,
    semesters,
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

  const [isTermHonorOpen, setIsTermHonorOpen] = useState(false);
  const [isUnderloadInfoOpen, setIsUnderloadInfoOpen] = useState(false);
  const [isMidyearInfoOpen, setIsMidyearInfoOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const semGWA = calculateSemesterGWA(semester);
  const semUnits = calculateSemesterUnits(semester);

  const termReport = buildCalculationReport([semester]);
  const termHonor = termReport.termHonor;
  const honorBadgeData = semester.computed && termHonor ? {
    honorCode: termHonor.label,
    pillClass: termHonor.level === 'president' ? 'sem-pill-pl' : termHonor.level === 'dean' ? 'sem-pill-dl' : 'sem-pill-regular',
  } : null;

  const handleAddSubject = () => {
    const newSubject: Subject = {
      code: '',
      name: '',
      grade: '',
      units: 3.0,
    };
    addSubject(semester.id, newSubject);
  };

  const handleTriggerCompute = () => {
    if (onCompute) { onCompute(); return; }
    const hasAnyGrade = semester.subjects && semester.subjects.some(
      (sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade))
    );
    if (!hasAnyGrade) {
      alert('Please enter at least one Grade Rating before computing.');
      return;
    }
    computeSemester(semester.id);
    setIsTermHonorOpen(true);
  };

  return (
    <>
      <div id={`semester-${semester.id}`} tabIndex={-1} className={`semester-card ${isCollapsed ? 'is-collapsed' : ''}`}>
        {/* ── SEMESTER HEADER ── */}
        <div className={`sem-header ${isCollapsed ? 'sem-header-collapsed' : ''}`}>
          <div className="sem-header-left">
            {isCollapsed ? (
              <>
                <span className="sem-collapsed-title" title={semester.title}>
                  {semester.title}
                </span>
                <div className="sem-collapsed-badges">
                  {semester.computed && honorBadgeData && (
                    <span className={`sem-result-pill ${honorBadgeData.pillClass}`}>
                      GPA: <strong>{semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>{showRecognition ? honorBadgeData.honorCode : 'Entered grades'}</strong>
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
                {!semester.computed && <span className="rd-pending">Awaiting computation</span>}
                {semester.computed && honorBadgeData && (
                  <span className={`sem-result-pill ${honorBadgeData.pillClass}`}>
                    GPA: <strong>{semGWA.toFixed(4)}</strong> &nbsp;•&nbsp; <strong>{showRecognition ? honorBadgeData.honorCode : 'Entered grades'}</strong>
                  </span>
                )}
              </>
            )}
          </div>

          <div className="sem-header-right">
            {semesters.length > 1 && <div className="sem-order-controls">
              <button type="button" className="btn" disabled={index === 0} aria-label={`Move ${semester.title} up`} onClick={() => moveSemester(semester.id, 'up')}><i className="fa-solid fa-arrow-up" aria-hidden="true" /></button>
              <button type="button" className="btn" disabled={index === semesters.length - 1} aria-label={`Move ${semester.title} down`} onClick={() => moveSemester(semester.id, 'down')}><i className="fa-solid fa-arrow-down" aria-hidden="true" /></button>
            </div>}

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
            {!hideCompute && <button type="button" className="btn btn-compute-trigger" onClick={handleTriggerCompute}>
              {computeLabel ?? (onCompute ? 'Compute GWA' : 'Update term GPA')} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>}
            <span className="sem-count-summary">{semUnits} units · {semester.subjects?.length || 0} courses</span>
          </div>
        </div>

        {/* ── DEDICATED TERM MODIFIERS BAR (Above course table when expanded) ── */}
        {!isCollapsed && showModifiers && (
          <div className="sem-modifiers-bar">
            <div className="sem-modifiers-toggles">
              {/* Midyear / Summer Term Toggle */}
              <div className="sem-modifier-item">
                <label
                  className="underload-toggle midyear-toggle"
                  title="Mark this semester as a Midyear or Summer term"
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
                  title="How is the curriculum load checked for Midyear?"
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
                    <th scope="col" style={{ width: '46%' }}>Course Description</th>
                    <th scope="col" style={{ width: '14%' }}>Grade Rating</th>
                    <th scope="col" style={{ width: '12%' }}>Credit Units</th>
                    <th scope="col" style={{ width: '6%', textAlign: 'center' }}>Action</th>
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


      {/* Term Honor Qualification Result Modal */}
      <TermHonorModal
        isOpen={isTermHonorOpen}
        onClose={() => setIsTermHonorOpen(false)}
        semester={semester}
      />

      {/* Underload Information Modal */}
      <TermPolicyDialog kind="underload"
        isOpen={isUnderloadInfoOpen}
        onClose={() => setIsUnderloadInfoOpen(false)}
      />

      {/* Midyear Information Modal */}
      <TermPolicyDialog kind="midyear"
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
