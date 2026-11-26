import type { Semester, Subject } from '../types';
import { isValidBUGrade } from './constants';
import { calculateCumulativeStats, parseGrade } from './gwa-engine';
import { validateCalculationEntries } from './calculation-report';
import {
  addSimulationTotals, EMPTY_SIMULATION_TOTALS, meetsSimulationGoal, savedSimulationTotals,
  simulationNumbers, simulationTotals, solveSimulationGoal, SIMULATION_MAX_UNITS,
  type SimulationTotals,
} from './simulation';

export type PlanningHorizon = 'semester' | 'degree';
export type PlanningQuestion = { kind: 'forecast' } | { kind: 'goal'; scope: 'overall' | 'term'; target: string };

/** A hypothetical row; source evidence prevents counting a saved course twice. */
export interface PlannedCourse {
  id: string;
  name: string;
  units: string;
  grade: string;
  source?: { semesterId: string; rowIndex: number; fingerprint: string };
}

/** Editable inputs only; hypothetical plans never write to the academic record. */
export interface ScenarioDraft {
  horizon: PlanningHorizon;
  method: 'quick' | 'courses';
  question: PlanningQuestion;
  units: string;
  average: string;
  courses: PlannedCourse[];
  sourceSemesterId: string;
  reviewedRecord: string;
}

export type PlanStatus = 'setup' | 'invalid' | 'stale' | 'forecast' | 'goal' | 'unreachable' | 'met' | 'missed';
export type PlanNumbers = ReturnType<typeof simulationNumbers>;

/** A single derived result shared by inputs, summary and calculation evidence. */
export interface ScenarioReport {
  status: PlanStatus;
  message: string;
  errors: string[];
  invalidFields: string[];
  recordInvalid: boolean;
  baseline: PlanNumbers;
  future: PlanNumbers;
  combined: PlanNumbers;
  term: PlanNumbers;
  includedTerms: { id: string; title: string; points: number; units: number }[];
  excluded: number;
  unknownUnits: number;
  required: ReturnType<typeof solveSimulationGoal>;
  target: number | null;
  hasRiskGrade: boolean;
  coursePoints: { id: string; name: string; units: number; grade: number; points: number }[];
  scopeTitle: string;
}

export function emptyScenario(horizon: PlanningHorizon): ScenarioDraft {
  return { horizon, method: 'quick', question: { kind: 'forecast' }, units: '', average: '', courses: [], sourceSemesterId: '', reviewedRecord: '' };
}

/** Ignores Compute flags: they do not change which numeric grades contribute. */
export function recordSignature(semesters: Semester[]): string {
  return JSON.stringify(semesters.map(({ id, title, subjects }) => ({ id, title, subjects })));
}

export const courseFingerprint = (subject: Subject) => JSON.stringify(subject);

/** Refresh only source-linked rows; preserve manual rows and unchanged assumptions. */
export function importScenarioCourses(draft: ScenarioDraft, semesters: Semester[], semesterId: string): ScenarioDraft {
  const term = semesters.find(semester => semester.id === semesterId);
  const manual = draft.courses.filter(course => !course.source);
  const imported = (term?.subjects ?? []).flatMap((subject, rowIndex): PlannedCourse[] => {
    if (subject.grade.trim()) return [];
    const fingerprint = courseFingerprint(subject);
    const previous = draft.courses.find(course => course.source?.semesterId === semesterId && course.source.rowIndex === rowIndex && course.source.fingerprint === fingerprint);
    return [previous ?? {
      id: `import-${semesterId}-${rowIndex}`, name: subject.code || subject.name || `Course ${rowIndex + 1}`,
      units: String(subject.units), grade: '', source: { semesterId, rowIndex, fingerprint },
    }];
  });
  return { ...draft, method: 'courses', courses: [...manual, ...imported], sourceSemesterId: term?.id ?? '', reviewedRecord: recordSignature(semesters) };
}

function parseInput(value: string, min: number, max: number): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : NaN;
}

function validAverage(value: string, max = 5) {
  const result = parseInput(value, 1, max);
  return result !== null && Number.isFinite(result) && Math.abs(result * 10000 - Math.round(result * 10000)) > 1e-7 ? NaN : result;
}

function baseReport(semesters: Semester[], draft: ScenarioDraft): ScenarioReport {
  const stats = calculateCumulativeStats(semesters);
  const includedTerms = semesters.flatMap(term => {
    const totals = calculateCumulativeStats([term]);
    return totals.gradedUnits ? [{ id: term.id, title: term.title, points: totals.totalPoints, units: totals.gradedUnits }] : [];
  });
  const selected = draft.courses.some(course => course.source?.semesterId === draft.sourceSemesterId)
    ? semesters.find(term => term.id === draft.sourceSemesterId) : undefined;
  const blank = simulationNumbers(EMPTY_SIMULATION_TOTALS);
  return {
    status: 'setup', message: 'Enter future units and an expected average to see their effect.', errors: [], invalidFields: [], recordInvalid: false,
    baseline: simulationNumbers(savedSimulationTotals(stats.weighted)), future: blank, combined: blank, term: blank,
    includedTerms, excluded: semesters.flatMap(term => term.subjects).filter(subject => parseGrade(subject.grade) === null || subject.units <= 0).length,
    unknownUnits: 0, required: null, target: null, hasRiskGrade: false, coursePoints: [],
    scopeTitle: draft.horizon === 'degree' ? 'Remaining degree' : selected && draft.method === 'courses' && selected.subjects.some(subject => !subject.grade.trim()) ? `Finish ${selected.title}` : 'Next semester',
  };
}

interface FutureEvidence { fixed: SimulationTotals; unknown: number; errors: string[]; invalidFields: string[]; incomplete: boolean; risk: boolean; rows: ScenarioReport['coursePoints'] }

function quickEvidence(draft: ScenarioDraft): FutureEvidence {
  const units = parseInput(draft.units, 0, SIMULATION_MAX_UNITS);
  const average = validAverage(draft.average);
  const isForecast = draft.question.kind === 'forecast';
  const errors = [];
  const invalidFields = [];
  if (Number.isNaN(units)) errors.push(`Additional units must be between 0 and ${SIMULATION_MAX_UNITS}.`);
  if (isForecast && Number.isNaN(average)) errors.push('Expected average must be 1.00–5.00, with up to four decimal places.');
  if (Number.isNaN(units)) invalidFields.push('units');
  if (isForecast && Number.isNaN(average)) invalidFields.push('average');
  const complete = units !== null && Number.isFinite(units) && (units === 0 || !isForecast || (average !== null && Number.isFinite(average)));
  return {
    fixed: complete && isForecast && units! > 0 ? simulationTotals(units!, average!) : EMPTY_SIMULATION_TOTALS,
    unknown: complete && !isForecast ? units! : 0, errors, invalidFields, incomplete: !complete,
    risk: isForecast && average !== null && average > 3, rows: [],
  };
}

function courseEvidence(draft: ScenarioDraft): FutureEvidence {
  const result: FutureEvidence = { fixed: EMPTY_SIMULATION_TOTALS, unknown: 0, errors: [], invalidFields: [], incomplete: !draft.courses.length, risk: false, rows: [] };
  let unknown = EMPTY_SIMULATION_TOTALS;
  for (const [index, course] of draft.courses.entries()) {
    const units = parseInput(course.units, 0, SIMULATION_MAX_UNITS);
    if (Number.isNaN(units)) result.errors.push(`Course ${index + 1}: enter valid non-negative units, up to ${SIMULATION_MAX_UNITS}.`);
    if (Number.isNaN(units)) result.invalidFields.push(`units-${course.id}`);
    if (units === null) { result.incomplete = true; continue; }
    if (!Number.isFinite(units)) continue;
    if (!course.grade.trim()) { unknown = addSimulationTotals(unknown, simulationTotals(units, 0)); continue; }
    if (!isValidBUGrade(course.grade) || parseGrade(course.grade) === null) {
      result.errors.push(`Course ${index + 1}: enter a numeric BU course grade (1.00–3.00 in 0.10 steps, 4.00 or 5.00).`);
      result.invalidFields.push(`grade-${course.id}`); continue;
    }
    const grade = Number(course.grade);
    result.risk ||= grade > 3;
    const weighted = simulationTotals(units, grade);
    result.rows.push({ id: course.id, name: course.name || `Course ${index + 1}`, units, grade, points: simulationNumbers(weighted).points });
    result.fixed = addSimulationTotals(result.fixed, weighted);
  }
  result.unknown = simulationNumbers(unknown).units;
  if (simulationNumbers(addSimulationTotals(result.fixed, unknown)).units > SIMULATION_MAX_UNITS) result.errors.push(`Plan at most ${SIMULATION_MAX_UNITS} additional units at a time.`);
  if (draft.question.kind === 'forecast' && result.unknown > 0) result.incomplete = true;
  return result;
}

function hasChangedSource(draft: ScenarioDraft, semesters: Semester[]) {
  const seen = new Set<string>();
  return draft.courses.some(course => {
    if (!course.source) return false;
    const { semesterId, rowIndex, fingerprint } = course.source;
    const key = `${semesterId}:${rowIndex}`;
    const subject = semesters.find(term => term.id === semesterId)?.subjects[rowIndex];
    const changed = seen.has(key) || !subject || subject.grade.trim() || courseFingerprint(subject) !== fingerprint;
    seen.add(key);
    return !!changed;
  });
}

function applyForecast(report: ScenarioReport, baseline: SimulationTotals, term: SimulationTotals, future: FutureEvidence) {
  report.future = simulationNumbers(future.fixed);
  report.combined = simulationNumbers(addSimulationTotals(baseline, future.fixed));
  report.term = simulationNumbers(addSimulationTotals(term, future.fixed));
  report.status = report.combined.average === null ? 'setup' : 'forecast';
  report.message = report.future.units === 0 ? 'No additional graded units; your recorded average is unchanged.'
    : report.baseline.units ? 'Your saved record combined with these future assumptions.' : 'Future grades only. No saved numeric grades are included yet.';
  return report;
}

function applyGoal(report: ScenarioReport, draft: ScenarioDraft, baseline: SimulationTotals, term: SimulationTotals, future: FutureEvidence) {
  if (draft.question.kind !== 'goal') return report;
  const target = validAverage(draft.question.target, 3);
  if (target === null) return { ...report, message: 'Enter a GWA goal to find the average you would need.' };
  if (!Number.isFinite(target)) return { ...report, status: 'invalid' as const, invalidFields: ['target'], errors: ['Goal must be 1.00–3.00, with up to four decimal places.'] };
  report.target = target;
  const scope = draft.question.scope === 'term' && draft.horizon === 'semester' ? term : baseline;
  const known = addSimulationTotals(scope, future.fixed);
  report.future = simulationNumbers(future.fixed);
  if (!future.unknown) {
    report.combined = simulationNumbers(addSimulationTotals(baseline, future.fixed));
    report.term = simulationNumbers(addSimulationTotals(term, future.fixed));
    report.status = !known.unitTicks ? 'setup' : meetsSimulationGoal(known, target) ? 'met' : 'missed';
    report.message = !known.unitTicks ? 'Add units to calculate a goal.' : `With all grades assigned, this ${draft.question.scope === 'term' ? 'semester average' : 'overall GWA'} ${report.status === 'met' ? 'meets' : 'does not meet'} your numerical goal.`;
    return report;
  }
  report.required = solveSimulationGoal(known, future.unknown, target);
  const required = report.required!;
  report.status = required.isUnreachable ? 'unreachable' : 'goal';
  const assumed = simulationTotals(future.unknown, Math.max(1, Math.min(3, required.recommended)));
  const boundary = addSimulationTotals(future.fixed, assumed);
  report.future = simulationNumbers(boundary);
  report.combined = simulationNumbers(addSimulationTotals(baseline, boundary));
  report.term = simulationNumbers(addSimulationTotals(term, boundary));
  report.message = required.isUnreachable ? 'Even a 1.00 average in the unassigned units cannot reach this goal with these assumptions.'
    : required.allowsPassing ? 'A passing average of 3.00 or better in the unassigned units would meet this numerical goal.'
      : 'Aim for this average or numerically lower across the unassigned units.';
  return report;
}

/** Derives the only planner result; invalid or stale sources never produce a combined forecast. */
export function deriveScenario(semesters: Semester[], draft: ScenarioDraft): ScenarioReport {
  const report = baseReport(semesters, draft);
  const errors = validateCalculationEntries(semesters);
  if (errors.length) return { ...report, status: 'invalid', recordInvalid: true, errors, message: 'Correct the saved record in Calculator before planning.' };
  if ((draft.reviewedRecord && draft.reviewedRecord !== recordSignature(semesters)) || hasChangedSource(draft, semesters)) {
    return { ...report, status: 'stale', message: 'Your saved record changed. Review it before combining it with this plan.' };
  }
  const future = draft.horizon === 'semester' && draft.method === 'courses' ? courseEvidence(draft) : quickEvidence(draft);
  report.errors = future.errors;
  report.invalidFields = future.invalidFields;
  report.unknownUnits = future.unknown;
  report.hasRiskGrade = future.risk;
  report.coursePoints = future.rows;
  if (future.errors.length) return { ...report, status: 'invalid', message: 'Check the highlighted planning values.' };
  if (future.incomplete) return { ...report, message: draft.method === 'courses' ? 'Enter course units and expected grades. In goal mode, leave the grades you want to solve blank.' : report.message };
  const baseline = savedSimulationTotals(calculateCumulativeStats(semesters).weighted);
  const hasImportedCourses = draft.courses.some(course => course.source?.semesterId === draft.sourceSemesterId);
  const selected = draft.method === 'courses' && hasImportedCourses ? semesters.filter(term => term.id === draft.sourceSemesterId) : [];
  const term = savedSimulationTotals(calculateCumulativeStats(selected).weighted);
  return draft.question.kind === 'forecast' ? applyForecast(report, baseline, term, future) : applyGoal(report, draft, baseline, term, future);
}
