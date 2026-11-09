import { X } from 'lucide-react';

import { isValidBUGrade } from '../../core/constants';
import { scanImportError } from '../../core/scan-results';
import type { ScanCandidate } from '../../types/scan';

/** Keeps uncertain observations editable; the final import action confirms the batch. */
export function ScanReviewRows({ rows, onChange }: { rows: ScanCandidate[]; onChange: (rows: ScanCandidate[]) => void }) {
  const update = (id: string, patch: Partial<ScanCandidate>) => onChange(rows.map(row => row.id === id ? { ...row, ...patch } : row));
  const choose = (row: ScanCandidate, field: 'grade' | 'units' | 'name', value: string) => {
    const conflicts = { ...row.conflicts };
    delete conflicts[field];
    update(row.id, { [field]: field === 'units' ? (value === '' ? null : Number(value)) : value, conflicts, reviewed: false });
  };
  return <div className="v2-import-rows">{rows.map((row, index) => <fieldset key={row.id} data-import-blocked={!!scanImportError([row])} tabIndex={-1}>
    <legend><span>Course {index + 1} · {row.sourceIds.map(id => `Image ${Number(id.split(':').pop()) + 1}`).join(', ')}</span>
      <button type="button" className="scan-remove-course" aria-label={`Remove course ${index + 1}`} title={`Remove course ${index + 1}`}
        onClick={() => onChange(rows.filter(item => item.id !== row.id))}><X size={20} aria-hidden="true" /></button>
    </legend>
    <label>Code<input value={row.code} onChange={event => update(row.id, { code: event.target.value, reviewed: false })} /></label>
    <label>Description<input value={row.name} onChange={event => choose(row, 'name', event.target.value)} /></label>
    <label>Grade<input value={row.grade} placeholder="Unknown or pending" aria-invalid={!!row.conflicts?.grade || (!!row.grade && !isValidBUGrade(row.grade))} onChange={event => choose(row, 'grade', event.target.value)} /></label>
    <label>Total units<input type="number" min="0" step="0.5" placeholder="Unknown" value={row.units ?? ''} aria-invalid={row.units === null || !!row.conflicts?.units} onChange={event => choose(row, 'units', event.target.value)} /></label>
    {(['grade', 'units', 'name'] as const).map(field => row.conflicts?.[field] && <div className="scan-row-issues" key={field}>
      <span>Choose {field === 'name' ? 'a description' : `the ${field}`}</span>{' '}
      {row.conflicts[field].map(option => <button type="button" className="btn btn-secondary" key={option.value}
        aria-label={`Use ${field} ${option.value} for course ${index + 1}`} onClick={() => choose(row, field, option.value)}>{option.value}</button>)}
    </div>)}
    {(row.issues.length > 0 || !row.grade) && <div className="scan-row-issues">
      <span className="scan-review-state">{row.grade ? 'Check detected values' : 'Grade pending'}</span>
    </div>}
  </fieldset>)}<button type="button" className="btn btn-secondary" onClick={() => onChange([...rows, {
    id: crypto.randomUUID(), code: '', name: '', units: null, grade: '', reviewed: false,
    sourceIds: rows[0]?.sourceIds ?? [], issues: ['Manually added row; compare it with the source image.'],
  }])}>Add missing course</button></div>;
}
