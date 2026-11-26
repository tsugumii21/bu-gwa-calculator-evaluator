import { useState } from 'react';
import { X } from 'lucide-react';

import type { ScenarioDraft, ScenarioReport } from '../../core/scenario-planner';
import type { buildSavedRecordEvidence } from '../../core/calculation-report';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

const number = (value: number) => value.toString();
const grade = (value: number | null) => value === null ? '—' : value.toFixed(4);

export function CalculationSteps({ draft, report }: { draft: ScenarioDraft; report: ScenarioReport }) {
  const { baseline, future, combined, required } = report;
  const isGoal = draft.question.kind === 'goal';
  return <div className="plan-evidence">
    <h3>Where this number comes from</h3>
    <ol>
      <li><strong>Your saved record</strong><p>{number(baseline.points)} weighted points ÷ {number(baseline.units)} graded units{baseline.average !== null ? ` = ${grade(baseline.average)}` : '. No numeric grades yet.'}</p></li>
      <li><strong>{isGoal ? 'Your goal calculation' : 'Your future assumption'}</strong>
        {required ? <><p>({number(required.targetPoints)} target points − {number(required.knownPoints)} already assigned points) ÷ {number(report.unknownUnits)} unassigned units</p>
          <p>{required.isUnreachable ? `≈ ${required.raw.toFixed(4)} would be required — better than 1.00 and therefore unattainable.` : `= ${required.recommended.toFixed(4)} maximum average needed. The recommendation rounds toward the better grade.`}</p></>
          : <p>{future.units === 0 ? 'No additional graded units' : !isGoal && draft.method === 'quick' ? `${number(future.units)} units × ${Number(draft.average || 0).toFixed(4)} average` : 'Sum of expected grade × units for assigned courses'} = {number(future.points)} future weighted points.</p>}
      </li>
      <li><strong>{isGoal ? report.status === 'unreachable' ? 'Best-case outcome with 1.00' : 'Outcome under the shown assumptions' : 'Combined record'}</strong>
        <p>({number(baseline.points)} + {number(future.points)}) ÷ ({number(baseline.units)} + {number(future.units)}) = <strong>{grade(combined.average)}</strong></p>
        {isGoal && required && <p>This uses {report.status === 'unreachable' ? '1.00 in the unassigned units' : required.raw >= 3 ? 'a passing 3.00 in the unassigned units' : 'the recommended average in the unassigned units'}; it is not an entered grade.</p>}
      </li>
    </ol>
    {report.coursePoints.length > 0 && <details><summary>See assigned course points</summary><ul>{report.coursePoints.map(course => <li key={course.id}>{course.name}: {course.grade.toFixed(2)} × {number(course.units)} units = {number(course.points)} points</li>)}</ul></details>}
  </div>;
}


interface EvidenceProps {
  view: 'record' | 'calculation' | null;
  draft: ScenarioDraft; report: ScenarioReport;
  evidence: ReturnType<typeof buildSavedRecordEvidence>;
  onClose: () => void; onCalculator: () => void;
}

function SavedRecord({ evidence, report }: Pick<EvidenceProps, 'evidence' | 'report'>) {
  const [openTerm, setOpenTerm] = useState<string | null>(evidence.semesters[0]?.id ?? null);
  const hasErrors = evidence.errors.length > 0;
  return <>
    {hasErrors && <p className="plan-warning" role="alert">Your record needs review. Numbers below are valid-entry subtotals, not a complete verified GWA. Correct invalid entries in Calculator.</p>}
    <dl className="plan-record-totals"><div><dt>{hasErrors ? 'Valid-entry GWA' : 'Starting GWA'}</dt><dd>{grade(report.baseline.average)}</dd></div><div><dt>Graded units</dt><dd>{number(report.baseline.units)}</dd></div><div><dt>Weighted points</dt><dd>{number(report.baseline.points)}</dd></div><div><dt>Semesters included</dt><dd>{report.includedTerms.length}</dd></div></dl>
    <p className="plan-hint">Numeric grades count even before Compute is pressed. Blank grades, INC, DRP and zero-credit courses do not enter the average. A numeric 4.00 or 5.00 still counts.</p>
    {!report.baseline.units && <p className="plan-warning">No saved numeric grades with positive units yet. You can explore a future-only scenario.</p>}
    <div className="plan-record-terms">{evidence.semesters.map(term => <section key={term.id}>
      <button type="button" className="plan-term-toggle" aria-expanded={openTerm === term.id} aria-controls={`plan-term-${term.id}`} onClick={() => setOpenTerm(openTerm === term.id ? null : term.id)}><span>{term.title}</span><small>{term.units} units · {term.points} points <span aria-hidden="true">{openTerm === term.id ? '−' : '+'}</span></small></button>
      {openTerm === term.id && <div id={`plan-term-${term.id}`} className="plan-record-rows">{!term.courses.length && <p>No courses in this saved semester.</p>}{term.courses.map((course, index) => <div className="plan-record-row" key={index}>
        <strong>{course.name}</strong><dl><div><dt>Grade</dt><dd>{course.grade || 'Pending'}</dd></div><div><dt>Units</dt><dd>{Number.isFinite(course.units) ? course.units : 'Invalid'}</dd></div><div><dt>Weighted points</dt><dd>{course.points ?? '—'}</dd></div></dl>
        {course.exclusion && <p className="plan-exclusion">Excluded: {course.exclusion}</p>}
      </div>)}</div>}
    </section>)}</div>
  </>;
}

/** One accessible shell for read-only saved evidence and hypothetical calculation details. */
export function SimulatorEvidenceDialog({ view, draft, report, evidence, onClose, onCalculator }: EvidenceProps) {
  const dialogRef = useAccessibleDialog(view !== null, onClose);
  if (!view) return null;
  return <div className="modal-overlay plan-dialog-overlay" onClick={onClose}>
    <div className="modal-content v2-info-dialog plan-help-dialog plan-evidence-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="plan-evidence-title" onClick={event => event.stopPropagation()}>
      <div className="modal-header"><div><h2 id="plan-evidence-title">{view === 'record' ? 'Your saved grade record' : 'Your calculation details'}</h2><p>{view === 'record' ? 'Read-only evidence from Calculator.' : 'Saved points + future assumptions, step by step.'}</p></div><button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close evidence"><X size={22} /></button></div>
      <div className="modal-body">{view === 'record' ? <SavedRecord evidence={evidence} report={report} /> : <CalculationSteps draft={draft} report={report} />}<p className="plan-help-notice">Unofficial planning tool. Confirm final grades and eligibility with the Bicol University Office of the University Registrar.</p></div>
      <div className="modal-footer">{view === 'record' && <button type="button" onClick={onCalculator}>Open Calculator</button>}<button type="button" className="plan-primary" onClick={onClose}>Back to planning</button></div>
    </div>
  </div>;
}