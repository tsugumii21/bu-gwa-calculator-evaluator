import type { Subject } from '../../types';
import { isValidBUGrade } from '../../core/constants';

/** Editable staged courses shared by paste, PDF and photo review. */
export function ImportRows({ subjects, onChange }: { subjects: Subject[]; onChange: (subjects: Subject[]) => void }) {
  const update = (index: number, patch: Partial<Subject>) => onChange(subjects.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return <div className="v2-import-rows">{subjects.map((row, index) => <fieldset key={index}>
    <legend>Course {index + 1}</legend>
    <label>Code<input value={row.code} onChange={event => update(index, { code: event.target.value })} /></label>
    <label>Description<input value={row.name} onChange={event => update(index, { name: event.target.value })} /></label>
    <label>Grade<input value={row.grade} placeholder="Pending" aria-invalid={!!row.grade && !isValidBUGrade(row.grade)} onChange={event => update(index, { grade: event.target.value })} /></label>
    <label>Units<input type="number" min="0" step="0.5" value={row.units} onChange={event => update(index, { units: Number(event.target.value) })} /></label>
    <button type="button" className="btn btn-secondary" onClick={() => onChange(subjects.filter((_, rowIndex) => rowIndex !== index))}>Remove course {index + 1}</button>
  </fieldset>)}</div>;
}
