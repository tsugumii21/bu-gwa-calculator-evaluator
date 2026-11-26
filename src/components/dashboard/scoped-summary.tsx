import type { Semester } from '../../types';
import type { CalculationMode, buildCalculationReport } from '../../core/calculation-report';
import { CalculatorHelp } from './calculator-help';

/** Scoped term cards or a three-card full-record summary with visible weighted evidence. */
export function ScopedSummary({ report, mode, scope, isCurrent, isStale = false }: {
  report: ReturnType<typeof buildCalculationReport>; mode: CalculationMode;
  scope: string; isCurrent: boolean; isStale?: boolean; terms: Semester[];
}) {
  const { stats } = report;
  const hasResult = isCurrent && stats.gradedUnits > 0;
  const termHonor = hasResult ? report.termHonor : null;
  const standing = hasResult ? report.standing.label : 'Pending review';
  const standardCards = [
    { topic: 'average', label: mode === 'gwa' ? 'Semester GWA' : 'Cumulative GWA', value: hasResult ? stats.cumulativeGWA.toFixed(4) : '—', note: hasResult ? `${stats.gradedUnits} graded units · ${scope}` : 'Awaiting computation', icon: 'chart-line', tone: 'blue' },
    { topic: 'honors', label: mode === 'gwa' ? 'Semestral honor (term)' : 'Latin honors', value: !hasResult ? mode === 'gwa' ? 'Pending' : isStale ? 'Record changed' : 'Not calculated' : mode === 'gwa' ? termHonor?.label ?? 'Provisional' : report.bracket?.startsWith('Outside') ? 'Outside Latin honors range' : `Current range: ${report.bracket}`, note: mode === 'gwa' ? 'PL / DL · unofficial estimate' : isStale ? 'Calculate again to update this record.' : hasResult ? report.latin.label : 'Calculate your full record to see its current range.', icon: mode === 'gwa' ? 'crown' : 'medal', tone: 'gold' },
    { topic: 'standing', label: 'Academic standing', value: standing, note: hasResult ? report.standing.reason : 'Compute to review this scope', icon: 'shield-halved', tone: 'green' },
    { topic: 'units', label: 'Recorded units', value: String(stats.totalUnits), note: `${stats.totalCourses} ${stats.totalCourses === 1 ? 'course' : 'courses'} entered${mode === 'latin' ? ` · ${stats.gradedUnits} graded units` : ''} · not earned credits`, icon: 'layer-group', tone: 'purple' },
  ];
  const cards = mode === 'latin' ? standardCards.filter(card => card.topic !== 'average') : standardCards;
  return <CalculatorHelp key={mode} mode={mode} report={report} isCurrent={hasResult}>{open => <section className={`v2-summary-cards${mode === 'latin' ? ' v2-latin-summary' : ''}`} data-state={hasResult ? 'computed' : 'pending'} aria-label="Academic summary dashboard" aria-live="polite">
    {cards.map((card, index) => <article className={`v2-summary-card ${index === 0 ? 'v2-summary-hero' : ''}`} key={card.label}>
      <span className={`v2-summary-icon v2-summary-${card.tone}`} aria-hidden="true"><i className={`fa-solid fa-${card.icon}`} /></span>
      <div className="v2-summary-copy"><span className="v2-summary-label">{card.label}</span><strong>{card.value}</strong>
        {mode === 'latin' && index === 0 && <dl className="v2-latin-average"><dt>Cumulative GWA</dt><dd>{hasResult ? stats.cumulativeGWA.toFixed(4) : '—'}</dd></dl>}
        <p>{card.note}</p>{mode === 'latin' && index === 0 && hasResult && <p>{report.latin.note}</p>}</div>
      <button className="v2-summary-help" type="button" aria-label={`Explain ${card.label}`} aria-haspopup="dialog" onClick={() => open(card.topic)}><i className="fa-solid fa-circle-question" aria-hidden="true" /></button>
    </article>)}
  </section>}</CalculatorHelp>;
}
