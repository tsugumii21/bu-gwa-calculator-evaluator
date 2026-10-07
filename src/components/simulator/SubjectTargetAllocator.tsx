import React, { useState, useMemo } from 'react';
import { useSemesterStore } from '../../store';
import { GRADE_OPTIONS } from '../../core/constants';

interface AllocatorItem {
  id: string;
  code: string;
  name: string;
  units: number;
  grade: number;
  isLocked: boolean;
}

export const SubjectTargetAllocator: React.FC = () => {
  const { semesters, updateSubject } = useSemesterStore();

  const [selectedSemId, setSelectedSemId] = useState<string>(
    semesters.length > 0 ? semesters[semesters.length - 1].id : ''
  );

  const activeSemester = useMemo(() => {
    return semesters.find((s) => s.id === selectedSemId) || semesters[0] || null;
  }, [semesters, selectedSemId]);

  const [targetGpa, setTargetGpa] = useState<number>(1.45);

  const defaultCourses: AllocatorItem[] = useMemo(() => {
    if (activeSemester && activeSemester.subjects.length > 0) {
      return activeSemester.subjects.map((sub, idx) => {
        const numGrade = parseFloat(sub.grade);
        return {
          id: `${sub.code || 'sub'}-${idx}`,
          code: sub.code || `SUBJ ${idx + 1}`,
          name: sub.name || `Course ${idx + 1}`,
          units: sub.units || 3,
          grade: !isNaN(numGrade) && numGrade >= 1.0 ? numGrade : 1.5,
          isLocked: false,
        };
      });
    }

    return [
      { id: 'cs101', code: 'CS 101', name: 'Major Core Subject I', units: 3, grade: 1.5, isLocked: false },
      { id: 'cs102', code: 'CS 102', name: 'Major Core Subject II', units: 3, grade: 1.5, isLocked: false },
      { id: 'math1', code: 'MATH 21', name: 'Calculus / Advanced Math', units: 3, grade: 1.75, isLocked: false },
      { id: 'ge1', code: 'GE 01', name: 'Understanding the Self', units: 3, grade: 1.25, isLocked: true },
      { id: 'pe1', code: 'PATHFit 1', name: 'Physical Activity & Fitness', units: 2, grade: 1.25, isLocked: true },
    ];
  }, [activeSemester]);

  const [items, setItems] = useState<AllocatorItem[]>(defaultCourses);

  React.useEffect(() => {
    setItems(defaultCourses);
  }, [defaultCourses]);

  const toggleLock = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isLocked: !item.isLocked } : item))
    );
  };

  const updateItemGrade = (index: number, newGrade: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, grade: newGrade } : item))
    );
  };

  const calculation = useMemo(() => {
    const totalUnits = items.reduce((sum, item) => sum + item.units, 0);
    if (totalUnits === 0) return { status: 'empty', requiredGrade: 0, unlockedUnits: 0 };

    const totalTargetPoints = targetGpa * totalUnits;

    const lockedUnits = items
      .filter((i) => i.isLocked)
      .reduce((sum, i) => sum + i.units, 0);

    const lockedPoints = items
      .filter((i) => i.isLocked)
      .reduce((sum, i) => sum + i.grade * i.units, 0);

    const unlockedUnits = totalUnits - lockedUnits;

    if (unlockedUnits === 0) {
      const currentAvg = lockedPoints / totalUnits;
      return {
        status: currentAvg <= targetGpa ? 'all_locked_met' : 'all_locked_missed',
        requiredGrade: currentAvg,
        unlockedUnits: 0,
      };
    }

    const remainingPointsNeeded = totalTargetPoints - lockedPoints;
    const requiredGrade = remainingPointsNeeded / unlockedUnits;

    if (requiredGrade < 1.0) {
      return { status: 'impossible', requiredGrade, unlockedUnits };
    }
    if (requiredGrade > 3.0) {
      return { status: 'guaranteed', requiredGrade, unlockedUnits };
    }
    return { status: 'achievable', requiredGrade, unlockedUnits };
  }, [items, targetGpa]);

  const handleApplyToActiveSemester = () => {
    if (!activeSemester) return;
    if (calculation.status === 'impossible') {
      alert('Cannot apply grades: the target is mathematically impossible.');
      return;
    }

    items.forEach((item, index) => {
      if (index < activeSemester.subjects.length) {
        const assignedGrade = item.isLocked
          ? item.grade.toFixed(2)
          : Math.max(1.0, Math.min(3.0, calculation.requiredGrade)).toFixed(2);
        updateSubject(activeSemester.id, index, { grade: assignedGrade });
      }
    });

    alert(`Applied target grades to "${activeSemester.title}"!`);
  };

  return (
    <div className="sim-panel" style={{ marginTop: '24px', padding: '20px' }}>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <h3 className="panel-title" style={{ fontSize: '1.15rem', margin: 0 }}>
          <i className="fa-solid fa-bullseye text-primary" style={{ marginRight: '8px' }}></i>
          Per-Subject Target Grade Allocator (Reverse Solver)
        </h3>
        <p className="section-desc" style={{ marginTop: '4px', marginBottom: 0, fontSize: '0.82rem' }}>
          Lock expected grades in specific courses (GEs or PE) to solve required minimum grades in major subjects.
        </p>
      </div>

      {/* Control Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
          background: 'var(--color-bg-secondary)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
            Target Term GPA
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              step="0.01"
              min="1.00"
              max="3.00"
              className="form-control form-control-sm"
              value={targetGpa}
              onChange={(e) => setTargetGpa(parseFloat(e.target.value) || 1.75)}
              style={{ fontWeight: 700, width: '90px' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`btn btn-sm ${targetGpa === 1.25 ? 'btn-gold' : 'btn-secondary'}`}
                onClick={() => setTargetGpa(1.25)}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                Summa (1.25)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${targetGpa === 1.45 ? 'btn-gold' : 'btn-secondary'}`}
                onClick={() => setTargetGpa(1.45)}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                PL (1.45)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${targetGpa === 1.75 ? 'btn-gold' : 'btn-secondary'}`}
                onClick={() => setTargetGpa(1.75)}
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                DL (1.75)
              </button>
            </div>
          </div>
        </div>

        {semesters.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
              Active Semester
            </label>
            <select
              className="form-control form-control-sm"
              value={selectedSemId}
              onChange={(e) => setSelectedSemId(e.target.value)}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.subjects.length} subjects)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calculation Ribbon */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          background:
            calculation.status === 'impossible'
              ? 'rgba(239, 68, 68, 0.1)'
              : calculation.status === 'guaranteed'
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${
            calculation.status === 'impossible'
              ? 'var(--color-danger)'
              : calculation.status === 'guaranteed'
              ? 'var(--color-success)'
              : 'var(--color-primary)'
          }`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i
            className={`fa-solid ${
              calculation.status === 'impossible'
                ? 'fa-circle-xmark text-danger'
                : calculation.status === 'guaranteed'
                ? 'fa-circle-check text-success'
                : 'fa-circle-info text-primary'
            }`}
            style={{ fontSize: '1.25rem' }}
          ></i>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
              {calculation.status === 'impossible' && 'Mathematically Unreachable'}
              {calculation.status === 'guaranteed' && 'Target Already Guaranteed!'}
              {calculation.status === 'achievable' && 'Target Achievable!'}
              {calculation.status === 'all_locked_met' && 'All Subjects Locked — Goal Met!'}
              {calculation.status === 'all_locked_missed' && 'All Subjects Locked — Goal Missed'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {calculation.status === 'impossible' &&
                `Requires average of ${calculation.requiredGrade.toFixed(2)}, which exceeds BU maximum grade (1.00).`}
              {calculation.status === 'guaranteed' &&
                `Passing average (3.00) already achieves target GPA ${targetGpa.toFixed(2)}.`}
              {calculation.status === 'achievable' &&
                `Need average grade of ${calculation.requiredGrade.toFixed(2)} across ${calculation.unlockedUnits} unlocked units.`}
              {calculation.status === 'all_locked_met' &&
                `Current locked average of ${calculation.requiredGrade.toFixed(2)} meets your goal.`}
              {calculation.status === 'all_locked_missed' &&
                `Current locked average of ${calculation.requiredGrade.toFixed(2)} falls short.`}
            </div>
          </div>
        </div>

        {calculation.status === 'achievable' && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Required Grade
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {calculation.requiredGrade.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Compact Course Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {items.map((item, index) => {
          const isNeededGrade = !item.isLocked && calculation.status === 'achievable';
          const displayedGrade = isNeededGrade
            ? Math.max(1.0, Math.min(3.0, calculation.requiredGrade)).toFixed(2)
            : item.grade.toFixed(2);

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                borderRadius: '8px',
                background: item.isLocked ? 'rgba(245, 158, 11, 0.06)' : 'var(--color-surface)',
                border: item.isLocked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--color-border)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ flex: '1 1 auto', minWidth: 0, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    {item.code}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {item.units}u
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {item.isLocked ? (
                  <select
                    className="form-control form-control-sm"
                    value={item.grade.toFixed(2)}
                    onChange={(e) => updateItemGrade(index, parseFloat(e.target.value))}
                    style={{ width: '74px', fontWeight: 700, fontSize: '0.82rem', height: '30px' }}
                  >
                    {GRADE_OPTIONS.filter((g) => !isNaN(parseFloat(g.value))).map((g) => (
                      <option key={g.value} value={parseFloat(g.value).toFixed(2)}>
                        {parseFloat(g.value).toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                    }}
                  >
                    {displayedGrade}
                  </span>
                )}

                {/* Tactile Lock Pill Button */}
                <button
                  type="button"
                  onClick={() => toggleLock(index)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: `1px solid ${item.isLocked ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    background: item.isLocked ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-bg-secondary)',
                    color: item.isLocked ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease',
                  }}
                  title={item.isLocked ? 'Locked (Click to unlock)' : 'Unlocked (Click to lock expected grade)'}
                >
                  <i className={`fa-solid ${item.isLocked ? 'fa-lock' : 'fa-lock-open'}`}></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeSemester && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleApplyToActiveSemester}
            disabled={calculation.status === 'impossible'}
          >
            <i className="fa-solid fa-check-double" style={{ marginRight: '6px' }}></i>
            Apply Target Grades to {activeSemester.title}
          </button>
        </div>
      )}
    </div>
  );
};
