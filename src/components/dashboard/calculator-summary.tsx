import { useSemesterStore } from '../../store';
import { calculateComputedCumulativeStats } from '../../core/gwa-engine';

/** Explicit computed-record scope without treating an empty record as zero GWA. */
export function CalculatorSummary() {
  const semesters = useSemesterStore(s => s.semesters);
  const stats = calculateComputedCumulativeStats(semesters);
  const computed = semesters.filter(s => s.computed);
  const pending = computed.flatMap(s => s.subjects).filter(s => !s.grade.trim()).length;
  const uncomputed = semesters.length - computed.length;
  return <section className="rd-calculator-result" aria-label="Computed record summary" aria-live="polite">
    <div><span className="rd-eyebrow">Cumulative GWA</span><strong>{stats.gradedUnits > 0 ? stats.cumulativeGWA.toFixed(4) : '—'}</strong></div>
    <div><b>{stats.gradedUnits === 0 ? 'Ready when you are' : pending || uncomputed ? 'Provisional' : 'Computed record'}</b>
      <p>{stats.gradedUnits} graded units · {computed.length} computed {computed.length === 1 ? 'term' : 'terms'}</p>
      <p>{pending} pending {pending === 1 ? 'grade' : 'grades'} in computed terms · {uncomputed} {uncomputed === 1 ? 'term' : 'terms'} awaiting computation</p></div>
    <p className="rd-result-note">One step closer.</p>
  </section>;
}
