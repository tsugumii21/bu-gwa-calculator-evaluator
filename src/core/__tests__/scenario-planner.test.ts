import { describe, expect, it } from 'vitest';
import type { Semester } from '../../types';
import { deriveScenario, emptyScenario, importScenarioCourses, recordSignature, type ScenarioDraft } from '../scenario-planner';

const record: Semester[] = [{ id: 'one', title: 'Year 1 - 1st Semester', underload: false, computed: false,
  subjects: [2.4, 2.4, 2.5].map(grade => ({ code: '', name: '', grade: grade.toFixed(1), units: 3 })) }];
const quick = (changes: Partial<ScenarioDraft> = {}): ScenarioDraft => ({ ...emptyScenario('semester'), units: '21', average: '1.5', ...changes });
const goal = (target: string, changes: Partial<ScenarioDraft> = {}): ScenarioDraft => quick({ question: { kind: 'goal', scope: 'overall', target }, ...changes });

describe('connected scenario planning', () => {
  it('accepts a typed two-decimal course grade with fractional units', () => {
    const report = deriveScenario([], quick({ method: 'courses', courses: [{ id: 'typed', name: '', units: '1.25', grade: '1.50' }] }));
    expect(report.combined).toEqual({ points: 1.875, units: 1.25, average: 1.5 });
  });
  it('identifies a typed grade outside the discrete BU scale', () => {
    const report = deriveScenario([], quick({ method: 'courses', courses: [{ id: 'typed', name: '', units: '3', grade: '1.45' }] }));
    expect({ status: report.status, fields: report.invalidFields }).toEqual({ status: 'invalid', fields: ['grade-typed'] });
  });
  it.each([0, 1, 6, 7, 12, 24, 200])('keeps all %s future courses in one report regardless of presentation pages', count => {
    const courses = Array.from({ length: count }, (_, index) => ({ id: String(index), name: '', units: '1', grade: '1.5' }));
    const report = deriveScenario(record, quick({ method: 'courses', courses }));
    expect({ status: report.status, units: report.future.units, points: report.future.points })
      .toEqual({ status: count ? 'forecast' : 'setup', units: count, points: count * 1.5 });
  });
  it('does not reuse a completed import semester for a manual-only semester plan', () => {
    const report = deriveScenario(record, quick({ method: 'courses', sourceSemesterId: record[0].id,
      courses: [{ id: 'manual', name: '', units: '3', grade: '1.5' }] }));
    expect({ scope: report.scopeTitle, semester: report.term.average, cumulative: report.combined.average })
      .toEqual({ scope: 'Next semester', semester: 1.5, cumulative: 2.2 });
  });
  it('does not invent a forecast before inputs are entered', () => {
    expect(deriveScenario(record, emptyScenario('semester')).status).toBe('setup');
  });
  it('explains the 1.7800 scenario from exact recorded points', () => {
    const report = deriveScenario(record, quick());
    expect([report.baseline.points, report.future.points, report.combined.points, report.combined.units, report.combined.average]).toEqual([21.9, 31.5, 53.4, 30, 1.78]);
  });
  it('updates the same result when an assumption changes', () => {
    expect(deriveScenario(record, quick({ average: '1.4' })).combined.average).toBe(1.71);
  });
  it('matches course and quick estimates and accepts unnamed rows', () => {
    const draft = quick({ method: 'courses', courses: [{ id: 'a', name: '', grade: '1.5', units: '21' }] });
    expect(deriveScenario(record, draft).combined).toEqual(deriveScenario(record, quick()).combined);
  });
  it('supports future-only planning without an invented current GWA', () => {
    const report = deriveScenario([], quick());
    expect([report.baseline.average, report.combined.average]).toEqual([null, 1.5]);
  });
  it('keeps recorded GWA when future units are zero', () => {
    expect(deriveScenario(record, quick({ units: '0', average: '' })).combined.average).toBeCloseTo(21.9 / 9);
  });
  it('does not divide by zero for an entirely empty zero-unit plan', () => {
    expect(deriveScenario([], quick({ units: '0' })).status).toBe('setup');
  });
  it.each(['-1', '201', 'Infinity', 'NaN'])('rejects invalid future units %s', units => {
    expect(deriveScenario(record, quick({ units })).status).toBe('invalid');
  });
  it.each(['0.99', '5.01', '1.45678'])('rejects invalid future averages %s', average => {
    expect(deriveScenario(record, quick({ average })).status).toBe('invalid');
  });
  it.each(['4', '5'])('supports explicit conditional or failing assumptions %s', average => {
    const report = deriveScenario([], quick({ average }));
    expect([report.combined.average, report.hasRiskGrade]).toEqual([Number(average), true]);
  });
  it('retains legacy fractional units', () => {
    expect(deriveScenario([], quick({ units: '0.000125', average: '1.2345' })).combined).toEqual({ points: 0.0001543125, units: 0.000125, average: 1.2345 });
  });
  it('keeps continuous averages separate from discrete individual grades', () => {
    expect(deriveScenario([], quick({ method: 'courses', courses: [{ id: 'a', name: '', units: '3', grade: '1.45' }] })).status).toBe('invalid');
  });
  it('requires all future grades in forecast mode', () => {
    expect(deriveScenario(record, quick({ method: 'courses', courses: [{ id: 'a', name: '', units: '3', grade: '' }] })).status).toBe('setup');
  });
  it('rounds a required upper bound toward the better grade', () => {
    const report = deriveScenario(record, goal('1.75'));
    expect([report.required?.recommended, report.combined.average! <= 1.75]).toEqual([1.4571, true]);
  });
  it('identifies goals unreachable even with the best future grades', () => {
    expect(deriveScenario(record, goal('1.25')).status).toBe('unreachable');
  });
  it('shows a passing-average scenario when that is sufficient', () => {
    expect(deriveScenario([], goal('3')).future.average).toBe(3);
  });
  it.each([['1.4', 'met'], ['1.5', 'missed']])('evaluates an all-assigned goal at %s', (grade, status) => {
    const report = deriveScenario([], goal('1.45', { method: 'courses', courses: [{ id: 'a', name: '', units: '3', grade }] }));
    expect(report.status).toBe(status);
  });
  it('uses the unrounded average near a goal boundary', () => {
    const draft = goal('1.45', { method: 'courses', courses: [
      { id: 'a', name: '', units: '1', grade: '1.4' }, { id: 'b', name: '', units: '1.0001', grade: '1.5' },
    ] });
    expect(deriveScenario([], draft).status).toBe('missed');
  });
  it.each([['1.25', '1.2', '1.3'], ['1.45', '1.4', '1.5'], ['1.75', '1.7', '1.8']])('compares %s exactly at and either side of its boundary', (target, better, worse) => {
    const draft = goal(target, { method: 'courses', courses: [
      { id: 'a', name: '', units: '1', grade: better }, { id: 'b', name: '', units: '1', grade: worse },
    ] });
    const equal = deriveScenario([], draft).status;
    draft.courses[1].units = '0.9999';
    const below = deriveScenario([], draft).status;
    draft.courses[1].units = '1.0001';
    expect([equal, below, deriveScenario([], draft).status]).toEqual(['met', 'met', 'missed']);
  });
  it('detects an impossible goal even when floating display would round the required bound to 1.00', () => {
    const tiny = [{ ...record[0], subjects: [{ code: '', name: '', units: 1e-16, grade: '1.1' }] }];
    expect(deriveScenario(tiny, goal('1', { units: '1' })).status).toBe('unreachable');
  });
  it('blocks invalid saved records instead of silently skipping them', () => {
    const invalid = [{ ...record[0], subjects: [{ code: '', name: '', units: 3, grade: '1.45' }] }];
    expect(deriveScenario(invalid, quick()).status).toBe('invalid');
  });
});

describe('record-aware course imports', () => {
  const unfinished: Semester[] = [{ ...record[0], subjects: [
    { code: '', name: '', units: 3, grade: '2.0' }, { code: '', name: '', units: 3, grade: '' },
    { code: '', name: '', units: 3, grade: 'INC' }, { code: '', name: '', units: 0, grade: '' },
  ] }];
  it('imports blanks only and does not require course names', () => {
    expect(importScenarioCourses(emptyScenario('semester'), unfinished, 'one').courses.map(row => row.units)).toEqual(['3', '0']);
  });
  it('deduplicates repeat imports without discarding unchanged assumptions', () => {
    const draft = importScenarioCourses(emptyScenario('semester'), unfinished, 'one');
    draft.courses[0].grade = '1.5';
    expect(importScenarioCourses(draft, unfinished, 'one').courses).toEqual(draft.courses);
  });
  it('counts recorded semester grades once when solving a semester goal', () => {
    const draft = importScenarioCourses(emptyScenario('semester'), unfinished, 'one');
    draft.question = { kind: 'goal', scope: 'term', target: '1.75' };
    const report = deriveScenario(unfinished, draft);
    expect([report.required?.recommended, report.combined.units, report.term.average]).toEqual([1.5, 6, 1.75]);
  });
  it('blocks stale plans when an imported blank gains a recorded grade', () => {
    const draft = importScenarioCourses(emptyScenario('semester'), unfinished, 'one');
    const changed = structuredClone(unfinished);
    changed[0].subjects[1].grade = '1.5';
    expect(deriveScenario(changed, draft).status).toBe('stale');
  });
  it('refresh removes newly recorded future rows and preserves manual courses', () => {
    const draft = importScenarioCourses(emptyScenario('semester'), unfinished, 'one');
    draft.courses.push({ id: 'manual', name: '', grade: '1.5', units: '3' });
    const changed = structuredClone(unfinished);
    changed[0].subjects[1].grade = '1.5';
    expect(importScenarioCourses(draft, changed, 'one').courses.map(row => row.id)).toEqual(['manual', 'import-one-3']);
  });
  it('does not invalidate a plan when only Compute flags change', () => {
    expect(recordSignature([{ ...record[0], computed: true }])).toBe(recordSignature(record));
  });
  it('preserves the actual grade record through planning', () => {
    const before = JSON.stringify(unfinished);
    deriveScenario(unfinished, importScenarioCourses(quick(), unfinished, 'one'));
    expect(JSON.stringify(unfinished)).toBe(before);
  });
});
