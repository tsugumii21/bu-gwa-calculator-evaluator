import { useCallback } from 'react';
import { Award, Crown, ShieldCheck, X } from 'lucide-react';

import type { CalculationMode, buildCalculationReport } from '../../core/calculation-report';
import { LATIN_HONOR_RANGES } from '../../core/latin-honors';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { RESULT_MOMENTS, SUPPORT_MOMENT_INDEX } from '../illustrations/result-moments';
import { MascotReference } from '../illustrations/mascot-reference';

type Report = ReturnType<typeof buildCalculationReport>;
type ResultProps = { report: Report; mode: CalculationMode; scope: string; isCurrent: boolean; moment?: number };
const RESULT_SCENES = {
  president: 'results-president', dean: 'results-dean', latin: 'results-high-honors', none: 'results-support',
} as const;
export const UNOFFICIAL_NOTICE = 'Unofficial estimate for personal academic planning. Not an official Bicol University grade computation or confirmation of Latin honors. Final grades and eligibility are determined by the University Registrar.';
export const LATIN_UNOFFICIAL_NOTICE = 'Unofficial estimate based on the grades entered. Final graduation honors are determined by the Bicol University Office of the University Registrar.';

/** Shared numeric evidence with an outcome-specific, accessible result presentation. */
export function CalculationResult({ report, mode, isCurrent }: ResultProps) {
  const honor = !isCurrent ? 'Awaiting recomputation' : mode === 'gwa' ? report.termHonor?.label ?? 'Pending'
    : report.bracket?.startsWith('Outside') ? 'Outside Latin honors range' : `Current range: ${report.bracket ?? 'Not available'}`;
  const level = mode === 'gwa' ? report.termHonor?.level ?? 'none' : report.latin.stage === 'targets-met' && report.bracket && !report.bracket.startsWith('Outside') ? 'latin' : 'none';
  const Icon = level === 'president' ? Crown : level === 'dean' || level === 'latin' ? Award : ShieldCheck;
  const isPending = !isCurrent || (mode === 'gwa' ? ['Pending', 'Provisional'].includes(honor) : level === 'none');
  const tone = isPending ? 'pending' : level === 'none' ? report.standing.level : level;
  return <section className="v2-calculation-result" aria-label="Calculation result">
    <div className="result-hero">
      <div className="result-numbers">
        <strong>{isCurrent && report.stats.gradedUnits > 0 ? report.stats.cumulativeGWA.toFixed(4) : '—'}</strong>
        <span className="result-average-label">{mode === 'gwa' ? 'Semester GWA' : 'Cumulative GWA'}</span>
        <span className={`result-honor result-honor-${tone}`}><Icon size={18} aria-hidden="true" />{honor}</span>
      </div>
      <MascotReference scene={RESULT_SCENES[isCurrent ? level : 'none']} className="result-mascot" />
    </div>
    <dl className="result-counts">
      <div><dt>courses</dt><dd>{report.stats.totalCourses}</dd></div>
      <div><dt>graded units</dt><dd>{isCurrent ? report.stats.gradedUnits : '—'}</dd></div>
      <div><dt>pending grades</dt><dd>{report.pending}</dd></div>
    </dl>
  </section>;
}

/** One explanation for the full-record range, evidence and requirements that BU must verify. */
export function LatinCalculationDetails({ report, isCurrent }: { report: Report; isCurrent: boolean }) {
  const { totalPoints, gradedUnits, cumulativeGWA } = report.stats;
  return <div className="v2-honor-evidence">
    <h3>Which grades count?</h3>
    <p>One calculation combines all saved semesters, including Midyear. Use the courses credited toward your degree. Valid numeric grades with positive credit units contribute to the cumulative GWA.</p>
    <p>Blank grades, INC, DRP and zero-credit courses do not contribute to the numeric average. Excluding a course from the average does not resolve a missing grade or load issue. Numeric 4.00 and 5.00 grades still count in the average and require review.</p>
    <h3>Where does the number come from?</h3>
    <p>Multiply each grade by its credit units, add the products across every semester, then divide by the total graded units. Do not average semester GWAs equally.</p>
    <p className="v2-latin-formula"><strong>Cumulative GWA = Σ (grade × units) ÷ total graded units</strong></p>
    {isCurrent && gradedUnits > 0 && <p><strong>Your record:</strong> {totalPoints} weighted points ÷ {gradedUnits} graded units = <strong>{cumulativeGWA.toFixed(4)}</strong>.</p>}
    <p><strong>Example:</strong> Semester 1 has a 1.00 grade in 3 units; Semester 2 has a 2.00 grade in 6 units. (1.00 × 3 + 2.00 × 6) ÷ 9 = 1.6667. The different unit totals give Semester 2 more weight.</p>
    <h3>What range does it meet?</h3>
    <p>The calculator displays cumulative GWA to four decimal places and compares it with these handbook ranges:</p>
    <ul>{LATIN_HONOR_RANGES.map(({ label, range }) => <li key={label}><strong>{label}</strong> · {range}</li>)}</ul>
    <p>A GWA above 1.7500 is outside these ranges.</p>
    <h3>What can affect eligibility?</h3>
    <p>The handbook also requires the prescribed curriculum and regular loads, applicable residence, and no numeric subject grade above 3.00. Pending grades, INC, conditional or failing grades, underload and dropped-course load changes require review.</p>
    <p>BU verifies degree credits, repeated or transferred courses, curriculum completion and residence. Residence must be confirmed from official enrollment records. Entered semester and unit totals cannot establish these conditions.</p>
    <h3>What does your result mean?</h3>
    <ul><li><strong>Current range:</strong> the range of the grades entered, not an earned honor or a forecast of future grades.</li><li><strong>Partial record:</strong> the entered totals have not reached your optional curriculum targets.</li><li><strong>Requirements need review:</strong> recorded grades or load information need attention.</li><li><strong>Entered targets reached:</strong> your entered totals meet your targets; official completion and eligibility remain unverified.</li></ul>
    {isCurrent && <p><strong>{report.latin.label}.</strong> {report.latin.note}</p>}
    {isCurrent && report.latinIssues.length > 0 && <ul>{report.latinIssues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
    <p className="v2-reference-note">BU Student Handbook, Reprinted Version 2019, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31.</p>
  </div>;
}

function ResultDetails({ report, mode, isCurrent }: ResultProps) {
  return <details className="result-evidence" open={mode === 'latin' && isCurrent}>
    <summary>{mode === 'latin' ? 'Calculation & graduation requirements' : 'Calculation & recognition details'}</summary>
    <p>Recorded units: <strong>{report.stats.totalUnits}</strong>. Recorded units are not necessarily earned credits.</p>
    {!isCurrent ? <p>Your entries changed. Compute again to update this result.</p> : <>
      {mode === 'gwa' && <p>{report.termHonor?.reason}</p>}
      <p>{report.standing.reason}</p>
      {mode === 'gwa' && <p>GWA = Σ (grade × units) ÷ Σ graded units. Comparisons use the unrounded average.</p>}
    </>}
    {mode === 'latin' && <LatinCalculationDetails report={report} isCurrent={isCurrent} />}
    {mode === 'gwa' && <p>{UNOFFICIAL_NOTICE}</p>}
  </details>;
}

/** Focus-protected result dialog matching the approved artwork-led reference. */
export function CalculationDialog(props: ResultProps & { isOpen: boolean; onClose: () => void }) {
  const { isOpen, onClose, report, mode, isCurrent } = props;
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useAccessibleDialog(isOpen, close);
  if (!isOpen) return null;
  const moment = RESULT_MOMENTS[isCurrent ? props.moment ?? SUPPORT_MOMENT_INDEX : SUPPORT_MOMENT_INDEX];
  const outcomeNote = isCurrent ? mode === 'latin' ? report.latin.note
    : report.termHonor?.label === 'Provisional' ? report.termHonor.reason : null : null;
  return <div className="modal-overlay v2-calculation-overlay" role="dialog" aria-modal="true" aria-labelledby="calculation-dialog-title" ref={ref}>
    <div className="modal-content v2-calculation-dialog">
      <header><div><h2 id="calculation-dialog-title">{mode === 'gwa' ? 'Your semester result' : 'Your Latin honors review'}</h2><p className="result-scope">{props.scope}</p></div>
        <button type="button" className="result-close" onClick={close} aria-label="Close calculation result"><X size={24} aria-hidden="true" /></button></header>
      <CalculationResult {...props} />
      <blockquote className="result-quote">“{moment[1]}”</blockquote>
      {outcomeNote && <p className="result-provisional">{mode === 'latin' && <strong>{report.latin.label}. </strong>}{outcomeNote}</p>}
      {mode === 'latin' && <p className="result-notice">{LATIN_UNOFFICIAL_NOTICE}</p>}
      <ResultDetails {...props} />
      <footer className="result-footer">{mode === 'gwa' && <p className="result-notice">Unofficial academic estimate</p>}
        <button type="button" className="result-return" onClick={close}>Back to my courses</button></footer>
    </div>
  </div>;
}
