import { useCallback } from 'react';
import { Award, Crown, ShieldCheck, X } from 'lucide-react';

import type { CalculationMode, buildCalculationReport } from '../../core/calculation-report';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { RESULT_MOMENTS, SUPPORT_MOMENT_INDEX } from '../illustrations/result-moments';
import { MascotReference } from '../illustrations/mascot-reference';

type Report = ReturnType<typeof buildCalculationReport>;
type ResultProps = { report: Report; mode: CalculationMode; scope: string; isCurrent: boolean; moment?: number };
export const UNOFFICIAL_NOTICE = 'Unofficial estimate for personal academic planning. Not an official Bicol University grade computation or confirmation of Latin honors. Final grades and eligibility are determined by the University Registrar.';

/** Shared numeric evidence with an outcome-specific, accessible result presentation. */
export function CalculationResult({ report, mode, isCurrent }: ResultProps) {
  const honor = !isCurrent ? 'Awaiting recomputation' : mode === 'gwa' ? report.termHonor?.label ?? 'Pending' : report.latin.label;
  const level = mode === 'gwa' ? report.termHonor?.level ?? 'none' : report.latin.stage === 'estimate' ? 'latin' : 'none';
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
      <MascotReference scene={isCurrent && level !== 'none' ? 'results-high-honors' : 'results-support'} className="result-mascot" />
    </div>
    <dl className="result-counts">
      <div><dt>courses</dt><dd>{report.stats.totalCourses}</dd></div>
      <div><dt>graded units</dt><dd>{isCurrent ? report.stats.gradedUnits : '—'}</dd></div>
      <div><dt>pending grades</dt><dd>{report.pending}</dd></div>
    </dl>
  </section>;
}

/** Explains the current eligibility estimate and the checks BU still needs to make. */
export function HonorEvidence({ report }: { report: Report }) {
  return <div className="v2-honor-evidence">
    <p>Graduation with Honors (2019 handbook, printed pp. 20–21 / PDF pp. 30–31) uses a unit-weighted GWA, no numeric grade worse than 3.00, and the prescribed regular curriculum load.</p>
    <ul>{report.latinIssues.map(issue => <li key={issue}>{issue}</li>)}
      <li>BU verifies credited courses, prescribed loads, degree completion, and applicable residence requirements.</li>
    </ul>
  </div>;
}

function ResultDetails({ report, mode, isCurrent }: ResultProps) {
  return <details className="result-evidence">
    <summary>{mode === 'latin' ? 'Calculation & graduation requirements' : 'Calculation & recognition details'}</summary>
    <p>Recorded units: <strong>{report.stats.totalUnits}</strong>. Recorded units are not necessarily earned credits.</p>
    {!isCurrent ? <p>Your entries changed. Compute again to update this result.</p> : <>
      {mode === 'gwa' && <p>{report.termHonor?.reason}</p>}
      <p>{report.standing.reason}</p>
      <p>GWA = Σ (grade × units) ÷ Σ graded units. Comparisons use the unrounded average.</p>
      {mode === 'latin' && <HonorEvidence report={report} />}
    </>}
    <p>{UNOFFICIAL_NOTICE}</p>
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
      {outcomeNote && <p className="result-provisional">{outcomeNote}</p>}
      <ResultDetails {...props} />
      <footer className="result-footer"><p className="result-notice">Unofficial academic estimate{mode === 'latin' ? ' · only Bicol University issues official honors results' : ''}</p>
        <button type="button" className="result-return" onClick={close}>Back to my courses</button></footer>
    </div>
  </div>;
}
