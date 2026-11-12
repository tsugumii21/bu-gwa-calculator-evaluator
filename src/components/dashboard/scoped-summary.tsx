import type { Semester } from '../../types';
import type { CalculationMode, buildCalculationReport } from '../../core/calculation-report';
import { CalculatorHelp } from './calculator-help';

/** Legacy card hierarchy, driven exclusively by the active calculation scope. */
export function ScopedSummary({ report, mode, scope, isCurrent }: {
  report: ReturnType<typeof buildCalculationReport>; mode: CalculationMode;
  scope: string; isCurrent: boolean; terms: Semester[];
}) {
  const { stats } = report;
  const hasResult = isCurrent && stats.gradedUnits > 0;
  const termHonor = hasResult ? report.termHonor : null;
  const standing = hasResult ? report.standing.label : 'Pending review';
  const cards = [
    { topic: 'average', label: mode === 'gwa' ? 'Semester GWA' : 'Cumulative GWA', value: hasResult ? stats.cumulativeGWA.toFixed(4) : '—', note: hasResult ? `${stats.gradedUnits} graded units · ${scope}` : 'Awaiting computation', icon: 'chart-line', tone: 'blue' },
    { topic: 'honors', label: mode === 'gwa' ? 'Semestral honor (term)' : 'Latin honors', value: !hasResult ? 'Pending' : mode === 'gwa' ? termHonor?.label ?? 'Provisional' : report.latin.label, note: mode === 'gwa' ? 'PL / DL · unofficial estimate' : hasResult ? report.latin.note : 'Compute to check your eligibility', icon: mode === 'gwa' ? 'crown' : 'medal', tone: 'gold' },
    { topic: 'standing', label: 'Academic standing', value: standing, note: hasResult ? report.standing.reason : 'Compute to review this scope', icon: 'shield-halved', tone: 'green' },
    { topic: 'units', label: 'Recorded units', value: String(stats.totalUnits), note: `${stats.totalCourses} ${stats.totalCourses === 1 ? 'course' : 'courses'} entered · not earned credits`, icon: 'layer-group', tone: 'purple' },
  ];
  return <CalculatorHelp key={mode} mode={mode} report={report} isCurrent={hasResult}>{open => <section className="v2-summary-cards" aria-label="Academic summary dashboard" aria-live="polite">
    {cards.map((card, index) => <article className={`v2-summary-card ${index === 0 ? 'v2-summary-hero' : ''}`} key={card.label}>
      <span className={`v2-summary-icon v2-summary-${card.tone}`} aria-hidden="true"><i className={`fa-solid fa-${card.icon}`} /></span>
      <div className="v2-summary-copy"><span className="v2-summary-label">{card.label}</span><strong>{card.value}</strong><p>{card.note}</p></div>
      <button className="v2-summary-help" type="button" aria-label={`Explain ${card.label}`} aria-haspopup="dialog" onClick={() => open(card.topic)}><i className="fa-solid fa-circle-question" aria-hidden="true" /></button>
    </article>)}
  </section>}</CalculatorHelp>;
}
