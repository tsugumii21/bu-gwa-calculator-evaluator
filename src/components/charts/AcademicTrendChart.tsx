import { useMemo, useState } from 'react';
import { CircleHelp } from 'lucide-react';

import { useSemesterStore } from '../../store';
import { addWeightedGrades, calculateCumulativeStats, weightedAverage } from '../../core/gwa-engine';
import { validateCalculationEntries } from '../../core/calculation-report';
import type { WeightedGradeTotals } from '../../types';

export type ChartMode = 'term' | 'cumulative';
export interface AcademicTrendChartProps { onOpenInfo?: () => void }

function formatSemesterTick(title: string): string {
  const t = title.trim();

  // Pattern: "AY 2025-2026 1st Semester" or "AY 2025-2026 - 1st Semester"
  const ayMatch = t.match(/(?:AY|A\.Y\.|School\s*Year:?\s*AY?)\s*(\d{2,4})[-–](\d{2,4})\s*(?:-\s*)?(\d(?:st|nd|rd|th)?|Midyear|Summer)?\s*(?:Sem(?:ester)?)?/i);
  if (ayMatch) {
    const y1 = ayMatch[1].slice(-2);
    const y2 = ayMatch[2].slice(-2);
    let term = '1';
    if (ayMatch[3]) {
      if (/midyear|summer/i.test(ayMatch[3])) term = 'Mid';
      else term = ayMatch[3].replace(/(st|nd|rd|th)/i, '');
    }
    return `'${y1}-${y2} S${term}`;
  }

  // Pattern: "Year 1 - 1st Semester" or "1st Year - 1st Semester"
  const yrMatch = t.match(/(?:Year\s*(\d)|(\d)(?:st|nd|rd|th)?\s*Year)\s*(?:-\s*)?(\d)(?:st|nd|rd|th)?\s*Sem/i);
  if (yrMatch) {
    const yr = yrMatch[1] || yrMatch[2];
    const sem = yrMatch[3];
    return `Y${yr} S${sem}`;
  }

  // Pattern: "1st Semester" / "2nd Semester"
  const semOnlyMatch = t.match(/(\d)(?:st|nd|rd|th)?\s*Sem(?:ester)?/i);
  if (semOnlyMatch) {
    return `Sem ${semOnlyMatch[1]}`;
  }

  return t.length > 10 ? `${t.slice(0, 9)}…` : t;
}

/**
 * Extracts a deterministic chronological sort key so multi-semester trajectories
 * always flow from the earliest academic term on the left to the latest on the right.
 */
function getSemesterSortKey(title: string, originalIndex: number, minAyYear: number | null): number {
  const t = title.trim();

  // 1. AY pattern: e.g. "AY 2024-2025 1st Semester"
  const ayMatch = t.match(/(?:AY|A\.Y\.|School\s*Year:?\s*AY?)\s*(\d{2,4})[-–](\d{2,4})?/i);
  if (ayMatch) {
    let startYear = parseInt(ayMatch[1], 10);
    if (startYear < 100) startYear += 2000;
    let term = 1;
    if (/midyear|summer/i.test(t)) {
      term = 3;
    } else if (/\b2nd\b|\bsecond\b|\bsem\s*2\b|\bs2\b/i.test(t)) {
      term = 2;
    } else if (/\b1st\b|\bfirst\b|\bsem\s*1\b|\bs1\b/i.test(t)) {
      term = 1;
    }
    return startYear * 10 + term;
  }

  // 2. Year pattern: e.g. "Year 1 - 1st Semester" or "1st Year - 2nd Semester"
  const yrMatch = t.match(/(?:Year\s*(\d)|(\d)(?:st|nd|rd|th)?\s*Year)/i);
  if (yrMatch) {
    const yr = parseInt(yrMatch[1] || yrMatch[2], 10);
    let term = 1;
    if (/midyear|summer/i.test(t)) {
      term = 3;
    } else if (/\b2nd\b|\bsecond\b|\bsem\s*2\b|\bs2\b/i.test(t)) {
      term = 2;
    } else if (/\b1st\b|\bfirst\b|\bsem\s*1\b|\bs1\b/i.test(t)) {
      term = 1;
    }

    if (minAyYear !== null) {
      const effectiveYear = minAyYear - 1 + (yr - 1);
      return effectiveYear * 10 + term;
    }
    return yr * 10 + term;
  }

  // 3. Fallback: preserve original index
  return originalIndex * 10;
}

/** Recorded-only chart and equivalent accessible table; never renders scenario inputs. */
export function AcademicTrendChart({ onOpenInfo }: AcademicTrendChartProps) {
  const semesters = useSemesterStore(state => state.semesters);
  const [mode, setMode] = useState<ChartMode>('term');
  const errors = validateCalculationEntries(semesters);
  const data = useMemo(() => {
    const years = semesters.flatMap(term => {
      const match = term.title.match(/(?:AY|A\.Y\.)\s*(\d{4})[-–]/i);
      return match ? [Number(match[1])] : [];
    });
    const minYear = years.length ? Math.min(...years) : null;
    const ordered = semesters.map((term, index) => ({ term, index })).sort((a, b) =>
      getSemesterSortKey(a.term.title, a.index, minYear) - getSemesterSortKey(b.term.title, b.index, minYear));
    let running: WeightedGradeTotals | undefined;
    return ordered.flatMap(({ term }) => {
      const stats = calculateCumulativeStats([term]);
      if (!stats.gradedUnits) return [];
      running = running ? addWeightedGrades(running, stats.weighted) : stats.weighted;
      return [{ id: term.id, title: term.title, term: stats.cumulativeGWA, cumulative: weightedAverage(running), units: stats.gradedUnits }];
    });
  }, [semesters]);
  if (errors.length || !data.length) return <p className="plan-hint">{errors.length ? 'Correct invalid saved entries in Calculator before viewing history.' : 'No recorded numeric grades yet. Add grades in Calculator to build your history.'}</p>;
  const plot = { width: 800, height: 240, left: 48, right: 48, top: 20, bottom: 40 };
  const x = (index: number) => plot.left + (data.length === 1 ? 0.5 : index / (data.length - 1)) * (plot.width - plot.left - plot.right);
  const y = (value: number) => plot.top + ((value - 1) / 4) * (plot.height - plot.top - plot.bottom);
  const path = data.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(point[mode])}`).join(' ');
  const stride = Math.max(1, Math.ceil(data.length / 6));
  return <div className="plan-history-chart">
    <div className="plan-section-heading"><div className="plan-history-toggle" role="group" aria-label="History average scope">
      <button type="button" aria-pressed={mode === 'term'} onClick={() => setMode('term')}>Semester GWA</button><button type="button" aria-pressed={mode === 'cumulative'} onClick={() => setMode('cumulative')}>Cumulative GWA</button>
    </div>{onOpenInfo && <button type="button" className="plan-icon-button" onClick={onOpenInfo} aria-label="Help with recorded history"><CircleHelp size={20} /></button>}</div>
    <p className="plan-hint">{mode === 'term' ? 'Each semester on its own.' : 'All numeric grades recorded up to each semester.'} Lower numbers are better. Exact values appear in the table.</p>
    <svg className="plan-chart" viewBox={`0 0 ${plot.width} ${plot.height}`} role="img" aria-labelledby="plan-chart-title" preserveAspectRatio="xMidYMid meet">
      <title id="plan-chart-title">Recorded {mode === 'term' ? 'semester' : 'cumulative'} GWA on the full 1.00 to 5.00 scale; exact values in the following table</title>
      {[1, 2, 3, 4, 5].map(value => <g key={value}><line x1={plot.left} x2={plot.width - plot.right} y1={y(value)} y2={y(value)} /><text x={plot.left - 10} y={y(value) + 4} textAnchor="end">{value.toFixed(2)}</text></g>)}
      <path d={path} className="plan-history-line" />
      {data.map((point, index) => <g key={point.id}><circle cx={x(index)} cy={y(point[mode])} r="5"><title>{point.title}: {point[mode].toFixed(4)}</title></circle>
        {index % stride === 0 && <text x={x(index)} y={plot.height - 14} textAnchor="middle">{formatSemesterTick(point.title)}</text>}</g>)}
    </svg>
    <div className="plan-history-table"><table><caption>Saved grade history — no hypothetical grades</caption><thead><tr><th scope="col">Semester</th><th scope="col">Semester GWA</th><th scope="col">Cumulative GWA</th><th scope="col">Graded units</th></tr></thead>
      <tbody>{data.map(point => <tr key={point.id}><th scope="row">{point.title}</th><td>{point.term.toFixed(4)}</td><td>{point.cumulative.toFixed(4)}</td><td>{point.units}</td></tr>)}</tbody>
    </table></div>
  </div>;
}