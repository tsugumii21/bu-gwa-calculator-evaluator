import { useAppStore, useSemesterStore } from '../../store';
import { buildCalculationReport } from '../../core/calculation-report';
import { isMidyearTerm } from '../../core/gwa-engine';
import { LATIN_ELIGIBILITY_SEMESTERS, readDegreeTargets } from '../../core/latin-honors';
import { UNOFFICIAL_NOTICE } from '../dashboard/calculation-result';
import { DialogFrame } from './dialog-frame';

/** Reviews completeness without silently calculating or certifying achievements. */
export function RecordReviewDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const semesters = useSemesterStore(state => state.semesters);
  const requirements = useAppStore(state => state.degreeRequirements);
  const updateRequirements = useAppStore(state => state.updateDegreeRequirements);
  const report = buildCalculationReport(semesters, requirements);
  const hasInvalidTargets = !!(requirements.regularSemesters && requirements.creditUnits) && !readDegreeTargets(requirements);
  return <DialogFrame isOpen={isOpen} onClose={onClose} title="Your academic record">
    <p className="v2-dialog-lede">{semesters.length} semesters · {report.stats.totalCourses} courses · {report.pending} pending entries</p>
    <h3>Curriculum targets for Latin honors</h3>
    <p id="degree-target-help">Use your program’s curriculum to enter its required regular semesters and total degree-credit units. Include credited Midyear units in the unit total. These targets save on this browser. Compute Latin Honors again after changing them.</p>
    <div className="form-group">
      <label htmlFor="degree-semesters">Required regular semesters</label>
      <input className="form-control" id="degree-semesters" type="number" min={LATIN_ELIGIBILITY_SEMESTERS} step="1"
        value={requirements.regularSemesters} onChange={event => updateRequirements({ regularSemesters: event.target.value })} aria-describedby="degree-target-help" />
    </div>
    <div className="form-group">
      <label htmlFor="degree-units">Required degree-credit units</label>
      <input className="form-control" id="degree-units" type="number" min="0" step="any"
        value={requirements.creditUnits} onChange={event => updateRequirements({ creditUnits: event.target.value })} aria-describedby="degree-target-help" />
    </div>
    {hasInvalidTargets && <p role="alert">Enter at least {LATIN_ELIGIBILITY_SEMESTERS} whole regular semesters and a positive unit total.</p>}
    {semesters.length === 0 ? <p>No semesters yet. Add your first term to get started.</p> : <ul className="v2-record-list">{semesters.map(term => <li key={term.id}>
      <strong>{term.title}</strong><span>{term.subjects.length} courses{isMidyearTerm(term.title, term.isMidyear) ? ' · Midyear' : term.underload ? ' · Underloaded' : ''}</span>
    </li>)}</ul>}
    {report.errors.length > 0 && <p role="alert">{report.errors[0]}</p>}
    <aside className="v2-dialog-note">A complete-looking record does not establish degree completion or eligibility. No awards are issued by this tool.</aside>
    <p className="v2-unofficial">{UNOFFICIAL_NOTICE}</p>
  </DialogFrame>;
}
