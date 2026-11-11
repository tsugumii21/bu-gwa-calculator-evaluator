import type { Semester } from '../../types';
import type { CalculationMode } from '../../core/calculation-report';
import { SemesterCard } from '../semester/SemesterCard';

type RecordsProps = {
  semesters: Semester[]; selectedId: string; mode: CalculationMode;
  onSelect: (id: string) => void; onAdd: () => void; onCompute: () => void;
};

/** Preserves all saved terms while limiting GWA editing and computation to one. */
export function CalculatorRecords({ semesters, selectedId, mode, onSelect, onAdd, onCompute }: RecordsProps) {
  return <section className="v2-course-records" aria-label="Your courses" tabIndex={-1}>
    <div className="v2-course-heading"><h2>Your courses</h2><button type="button" onClick={onAdd}>+ Add semester</button></div>
    {mode === 'gwa' && semesters.length > 0 && <div className="v2-semester-picker" role="group" aria-label="Select semester">
      {semesters.map(term => <button key={term.id} type="button" aria-pressed={selectedId === term.id} onClick={() => onSelect(term.id)}>{term.title}</button>)}
    </div>}
    {semesters.length === 0 && <div className="empty-state"><i className="fa-regular fa-file-lines" aria-hidden="true" /><h3>Your next step starts here.</h3><p>Add a semester, scan your grades, or paste your courses above.</p></div>}
    {semesters.map((term, index) => (mode === 'latin' || term.id === selectedId) && <SemesterCard
      key={term.id} semester={term} index={index} showModifiers
      computeLabel={mode === 'latin' ? 'Compute Latin Honors' : 'Compute GWA'} showRecognition onCompute={onCompute} />)}
  </section>;
}
