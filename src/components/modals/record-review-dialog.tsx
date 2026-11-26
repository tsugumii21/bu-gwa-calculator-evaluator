import { useAppStore, useSemesterStore } from '../../store';
import { buildCalculationReport } from '../../core/calculation-report';
import { isMidyearTerm } from '../../core/gwa-engine';
import { degreeTargetErrors } from '../../core/latin-honors';
import { LATIN_UNOFFICIAL_NOTICE } from '../dashboard/calculation-result';
import { DialogFrame } from './dialog-frame';

/** Reviews completeness without silently calculating or certifying achievements. */
export function RecordReviewDialog({ isOpen, onClose, onEditSemester }: { isOpen: boolean; onClose: () => void; onEditSemester: (id: string) => void }) {
  const semesters = useSemesterStore(state => state.semesters);
  const requirements = useAppStore(state => state.degreeRequirements);
  const updateRequirements = useAppStore(state => state.updateDegreeRequirements);
  const report = buildCalculationReport(semesters, requirements);
  const targetErrors = degreeTargetErrors(requirements);
  return <DialogFrame isOpen={isOpen} onClose={onClose} title="Record & curriculum">
    <div className="v2-curriculum-review">
      <h3>Your entered record</h3>
      <dl className="v2-record-coverage">
        <div><dt>Semesters</dt><dd>{semesters.length}</dd></div><div><dt>Courses</dt><dd>{report.stats.totalCourses}</dd></div>
        <div><dt>Recorded units</dt><dd>{report.stats.totalUnits}</dd></div><div><dt>Graded units</dt><dd>{report.stats.gradedUnits}</dd></div>
      </dl>
      <p>{report.pending} pending or INC entries · {report.latinIssues.length} record issues to review.</p>
      <p><strong>{report.latin.label}</strong>. {report.latin.note}</p>
      {report.latinIssues.length > 0 && <ul>{report.latinIssues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      <h3>Compare with your curriculum</h3>
      <p id="degree-target-help">Optional: copy the required regular semesters and degree-credit units from your program’s curriculum. Include credited Midyear units in the unit target. Both values save automatically in this browser. Calculate again after changing them.</p>
      <div className="v2-curriculum-fields">
        <div className="form-group"><label htmlFor="degree-semesters">Required regular semesters</label>
          <input className="form-control" id="degree-semesters" type="text" inputMode="numeric" placeholder="Optional" value={requirements.regularSemesters}
            onChange={event => updateRequirements({ regularSemesters: event.target.value })} aria-invalid={!!targetErrors.semesters} aria-describedby={`degree-target-help${targetErrors.semesters ? ' degree-semesters-error' : ''}`} />
          {targetErrors.semesters && <p id="degree-semesters-error" role="alert">{targetErrors.semesters}</p>}
        </div>
        <div className="form-group"><label htmlFor="degree-units">Required degree-credit units</label>
          <input className="form-control" id="degree-units" type="text" inputMode="decimal" placeholder="Optional" value={requirements.creditUnits}
            onChange={event => updateRequirements({ creditUnits: event.target.value })} aria-invalid={!!targetErrors.units} aria-describedby={`degree-target-help${targetErrors.units ? ' degree-units-error' : ''}`} />
          {targetErrors.units && <p id="degree-units-error" role="alert">{targetErrors.units}</p>}
        </div>
      </div>
      <p>Target totals measure entered coverage. They do not verify earned credits, residence or degree completion.</p>
      <h3>Your semesters</h3>
      {semesters.length === 0 ? <p>No semesters yet. Add your first term to get started.</p> : <ul className="v2-record-list v2-curriculum-list">{semesters.map(term => {
        const termReport = buildCalculationReport([term]);
        return <li key={term.id}><div><strong>{term.title}</strong><span>{term.subjects.length} {term.subjects.length === 1 ? 'course' : 'courses'} · {termReport.stats.gradedUnits} graded units{isMidyearTerm(term.title, term.isMidyear) ? ' · Midyear' : ''}</span>
          <span>{termReport.latinIssues.length ? `${termReport.latinIssues.length} issue(s) to review` : 'No recorded grade or load issues'}</span></div>
          <button type="button" className="btn btn-secondary" aria-label={`Edit semester ${term.title}`} onClick={() => onEditSemester(term.id)}>Edit semester</button></li>;
      })}</ul>}
      {report.errors.length > 0 && <p role="alert">{report.errors[0]}</p>}
      <p className="v2-unofficial">{LATIN_UNOFFICIAL_NOTICE}</p>
    </div>
  </DialogFrame>;
}
