import { useState } from 'react';
import { X } from 'lucide-react';

import { isValidBUGrade } from '../../core/constants';
import { courseNameWarning, scanImportError } from '../../core/scan-results';
import type { ScanCandidate } from '../../types/scan';

/** Compact editable observations; unknown values stay explicit until final import validation. */
export function ScanReviewRows({ rows, onChange, semesterTitle }: { rows: ScanCandidate[]; onChange: (rows: ScanCandidate[]) => void; semesterTitle: string }) {
  const [unitDrafts, setUnitDrafts] = useState<Record<string, { text: string; value: number | null }>>({});
  const update = (id: string, patch: Partial<ScanCandidate>) => onChange(rows.map(row => row.id === id ? { ...row, ...patch } : row));
  const choose = (row: ScanCandidate, field: 'grade' | 'units' | 'name', value: string) => {
    const conflicts = { ...row.conflicts }; delete conflicts[field];
    const units = value.trim() === '' ? null : Number(value);
    if (field === 'units') setUnitDrafts(previous => ({ ...previous, [row.id]: { text: value, value: units } }));
    update(row.id, { [field]: field === 'units' ? units : value, conflicts, reviewed: false });
  };
  return <div className="photo-course-editor"><div className="photo-course-columns" aria-hidden="true"><span>Code</span><span>Course name</span><span>Grade</span><span>Units</span><span /></div>
    {rows.map((row, index) => {
      const prefix = `${semesterTitle}, course ${index + 1}`;
      const issue = scanImportError([row]);
      const warning = courseNameWarning(row.name);
      const draft = unitDrafts[row.id];
      const unitText = draft && Object.is(draft.value, row.units) ? draft.text : row.units !== null && Number.isFinite(row.units) ? String(row.units) : '';
      const invalid = { code: !row.code.trim(), name: !row.name.trim() || !!row.conflicts?.name,
        grade: !!row.conflicts?.grade || (!!row.grade && !isValidBUGrade(row.grade)),
        units: row.units === null || !Number.isFinite(row.units) || row.units < 0 || !!row.conflicts?.units };
      return <div className="photo-course-row" role="group" aria-label={prefix} key={row.id} data-import-blocked={!!issue} tabIndex={-1}>
        <div className="photo-course-fields">
          <label><span>Code</span><input aria-label={`${prefix} code`} value={row.code} aria-invalid={invalid.code} onChange={event => update(row.id, { code: event.target.value, reviewed: false })} /></label>
          <label><span>Course name</span><input aria-label={`${prefix} course name`} value={row.name} aria-invalid={invalid.name} onChange={event => choose(row, 'name', event.target.value)} /></label>
          <label><span>Grade</span><input aria-label={`${prefix} grade`} value={row.grade} inputMode="decimal" placeholder="Pending" aria-invalid={invalid.grade} onChange={event => choose(row, 'grade', event.target.value)} /></label>
          <label><span>Units</span><input aria-label={`${prefix} units`} inputMode="decimal" placeholder="Unknown" value={unitText} aria-invalid={invalid.units} onChange={event => choose(row, 'units', event.target.value)} /></label>
          <button type="button" className="photo-icon photo-danger" aria-label={`Remove ${prefix}`} title={`Remove course ${index + 1}`} onClick={() => onChange(rows.filter(item => item.id !== row.id))}><X size={19} aria-hidden="true" /></button>
        </div>
        <p className="photo-course-source">Course {index + 1} · {row.sourceIds.length ? row.sourceIds.map(id => `Image ${Number(id.split(':').pop()) + 1}`).join(', ') : 'Manually added'}{!row.grade ? ' · Grade pending' : ''}</p>
        {issue && <p className="photo-field-error">{issue.replace(/^Course 1: /, '')}</p>}{warning && <p className="photo-field-warning">{warning}</p>}
        {(['grade', 'units', 'name'] as const).map(field => row.conflicts?.[field] && <div className="photo-conflict" key={field}><span>Choose {field === 'name' ? 'the course name' : `the ${field}`} from the source:</span>{row.conflicts[field].map(option => <button type="button" className="btn btn-secondary" key={option.value} aria-label={`Use ${field === 'name' ? 'course name' : field} ${option.value} for ${prefix}`} onClick={() => choose(row, field, option.value)}>{option.value}</button>)}</div>)}
      </div>;
    })}
    <button type="button" className="btn btn-secondary photo-add-course" onClick={() => onChange([...rows, { id: crypto.randomUUID(), code: '', name: '', units: null, grade: '', reviewed: false, sourceIds: [], issues: ['Manually added row; compare it with the source image.'] }])}>Add missing course</button>
  </div>;
}
