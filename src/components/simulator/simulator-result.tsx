import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Equal, Calculator } from 'lucide-react';

import type { ScenarioDraft, ScenarioReport } from '../../core/scenario-planner';
import { CalculationSteps } from './simulator-evidence-dialog';

const number = (value: number) => value.toString();
const grade = (value: number | null) => value === null ? '—' : value.toFixed(4);

function resultDisplay(draft: ScenarioDraft, report: ScenarioReport) {
  const required = draft.question.kind === 'goal' ? report.required : null;
  return { ready: !['setup', 'invalid', 'stale'].includes(report.status),
    value: required ? report.status === 'unreachable' ? 'Unreachable' : Math.min(3, required.recommended).toFixed(4) : grade(report.combined.average),
    label: required ? 'Average needed in unassigned units' : 'Projected cumulative GWA' };
}

/** Mobile preview of the same report, positioned directly before the bounded editor. */
export function SimulatorBrief({ draft, report }: { draft: ScenarioDraft; report: ScenarioReport }) {
  const display = resultDisplay(draft, report);
  return <div className="plan-mobile-brief"><div><span>{display.ready ? display.label : 'Your scenario'}</span><strong>{display.ready ? display.value : 'Needs entries'}</strong></div><a href="#plan-result">View result ↓</a></div>;
}

export function SimulatorResult({ draft, report, onReview, onCalculator, onDetails }: {
  draft: ScenarioDraft; report: ScenarioReport; onReview: () => void; onCalculator: () => void; onDetails: () => void;
}) {
  const { ready, value: resultValue, label } = resultDisplay(draft, report);
  const isCompact = draft.horizon === 'semester' && draft.method === 'courses';
  const panelRef = useRef<HTMLElement>(null);
  const [fitsViewport, setFitsViewport] = useState(false);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const measure = () => {
      const gap = Number(getComputedStyle(panel).getPropertyValue('--plan-sticky-gap').trim().replace('px', ''));
      setFitsViewport(panel.getBoundingClientRect().height + gap * 2 <= window.innerHeight);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(panel); window.addEventListener('resize', measure); measure();
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  const isGoal = draft.question.kind === 'goal';
  const required = report.required;
  const delta = report.combined.average !== null && report.baseline.average !== null ? report.combined.average - report.baseline.average : null;
  const DeltaIcon = delta === null || Math.abs(delta) < 0.00005 ? Equal : delta < 0 ? ArrowDownRight : ArrowUpRight;
  return <section className={`plan-panel plan-result${isCompact ? ' plan-result-compact' : ''}`} data-fits-viewport={fitsViewport} ref={panelRef} id="plan-result" aria-labelledby="plan-result-title" tabIndex={-1}>
    <div className="plan-section-heading"><h2 id="plan-result-title">Your explained result</h2><Calculator size={21} aria-hidden="true" /></div>
    <p className="plan-hint">{report.scopeTitle} · hypothetical planning</p>
    <div className="plan-live" role="status" aria-live="polite" aria-atomic="true">
      {ready ? <><span className="plan-result-label">{label}</span><strong className={`plan-result-value${report.status === 'unreachable' ? ' plan-result-word' : ''}`}>{resultValue}</strong><p>{report.message}</p></>
        : <div className="plan-result-empty"><strong>{report.status === 'stale' ? 'Review your updated record' : report.status === 'invalid' ? 'Check your entries' : 'Start with your assumptions'}</strong><p>{report.message}</p></div>}
    </div>
    {report.recordInvalid && <ul className="plan-errors" role="alert">{report.errors.map(error => <li key={error}>{error}</li>)}</ul>}
    {report.status === 'stale' && <button type="button" className="plan-primary" onClick={onReview}>Review record changes</button>}
    {report.recordInvalid && <button type="button" onClick={onCalculator}>Review saved grades in Calculator</button>}
    {ready && <>
      <dl className="plan-result-facts"><div><dt>{isGoal ? 'Cumulative GWA under these assumptions' : draft.horizon === 'degree' ? 'Average across remaining coursework' : 'Planned semester average'}</dt><dd>{grade(isGoal ? report.combined.average : report.term.average)}</dd></div>
        <div><dt>Additional graded units</dt><dd>{number(report.future.units)}</dd></div></dl>
      {draft.question.kind === 'goal' && draft.question.scope === 'term' && <p className="plan-hint">Semester average under these assumptions: <strong>{grade(report.term.average)}</strong>.</p>}
      {delta !== null && !isCompact && <p className="plan-change"><DeltaIcon size={19} aria-hidden="true" /> {Math.abs(delta) < 0.00005 ? 'No change from' : `${Math.abs(delta).toFixed(4)} ${delta < 0 ? 'lower (better)' : 'higher'} than`} your saved cumulative GWA.</p>}
      {isCompact ? <><p className="plan-compact-formula">{required ? <>( {number(required.targetPoints)} target points − {number(required.knownPoints)} assigned points ) ÷ {report.unknownUnits} unassigned units = {required.raw.toFixed(4)}{required.isUnreachable ? ' (unreachable)' : ' maximum average'}</> : <>( {report.baseline.points} saved points + {report.future.points} future points ) ÷ ( {report.baseline.units} + {report.future.units} units ) = {grade(report.combined.average)}</>}</p>
        <p className="plan-hint">{report.coursePoints.length} courses with assumed grades · {report.unknownUnits} {isGoal ? 'units to solve' : 'unassigned units'}</p>
        <button type="button" aria-haspopup="dialog" onClick={onDetails}>Calculation details</button></> : <CalculationSteps draft={draft} report={report} />}
    </>}
    {report.hasRiskGrade && <p className="plan-warning">This scenario includes a conditional or failing-grade assumption. Its average does not establish good standing or award eligibility.</p>}
    <p className="plan-disclaimer">{isCompact ? 'Unofficial estimate. GWA alone cannot confirm awards or standing. Confirm final results with BU’s Office of the University Registrar.' : 'Unofficial planning estimate. This tool cannot confirm Latin honors, PL/DL or academic standing. Get your final grades and eligibility from Bicol University’s Office of the University Registrar.'}</p>
  </section>;
}
