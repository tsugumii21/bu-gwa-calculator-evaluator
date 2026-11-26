import { describe, expect, it } from 'vitest';
import type { Semester } from '../../types';
import { buildCalculationReport, buildSavedRecordEvidence, selectCalculationTerms } from '../calculation-report';
import { degreeTargetErrors, readDegreeTargets } from '../latin-honors';

const term = (id: string, grade: string, units: number): Semester => ({
  id, title: id, computed: false, underload: false, regularLoadConfirmed: true,
  subjects: [{ code: '', name: '', grade, units }],
});

describe('saved record evidence', () => {
  it('explains fractional weighted points without changing the baseline', () => {
    const terms = [term('first', '1.6', 3.0001), term('second', '2.2', 1.25)];
    const evidence = buildSavedRecordEvidence(terms);
    expect(evidence.semesters.map(({ points, units }) => ({ points, units })))
      .toEqual(terms.map(item => { const stats = buildCalculationReport([item]).stats; return { points: stats.totalPoints, units: stats.gradedUnits }; }));
  });
  it.each([['', 3, 'Pending grade'], ['INC', 3, 'Incomplete (INC)'], ['DRP', 3, 'Dropped (DRP)'],
    ['1.0', 0, 'Zero-credit course'], ['bad', 3, 'Invalid entry — review in Calculator'],
    ['1.0', -1, 'Invalid entry — review in Calculator']])('explains exclusion of %s / %s units', (grade, units, reason) => {
    expect(buildSavedRecordEvidence([term('entry', String(grade), Number(units))]).semesters[0].courses[0])
      .toMatchObject({ name: 'Course 1', points: null, exclusion: reason });
  });
  it.each(['4.0', '5.0'])('includes %s even though recognition may be restricted', grade => {
    expect(buildSavedRecordEvidence([term('numeric', grade, 3)]).semesters[0].courses[0])
      .toMatchObject({ points: Number(grade) * 3, exclusion: null });
  });
  it('preserves invalid-record notices alongside valid-entry subtotals', () => {
    const record = term('mixed', '1.5', 3);
    record.subjects.push({ code: 'BAD', name: '', grade: '1.11', units: 3 });
    const evidence = buildSavedRecordEvidence([record]);
    expect({ errors: evidence.errors.length, points: evidence.semesters[0].points }).toEqual({ errors: 1, points: 4.5 });
  });
});

describe('Latin honors progress', () => {
  const regularTerms = (count: number) => Array.from({ length: count }, (_, index) => term(`regular-${index}`, '1.6', 18));
  const targets = { regularSemesters: '8', creditUnits: '147' };

  it('separates a first-year numerical range from incomplete curriculum coverage', () => {
    const report = buildCalculationReport(regularTerms(2), targets);
    expect({ range: report.bracket, ...report.latin }).toMatchObject({
      range: 'Cum Laude',
      stage: 'progress',
      label: 'Partial record',
      note: expect.stringContaining('2/8 regular semesters'),
    });
  });

  it('includes Midyear units without counting Midyear as a regular semester', () => {
    const report = buildCalculationReport([...regularTerms(5), term('Midyear', '1.6', 3)], targets);
    expect(report.latin).toMatchObject({ stage: 'progress', completedSemesters: 5, note: expect.stringContaining('93/147 graded units') });
  });

  it('does not infer residence or eligibility from six entered semesters', () => {
    expect(buildCalculationReport(regularTerms(6)).latin).toMatchObject({
      stage: 'progress',
      label: 'Degree coverage not confirmed',
      targets: null,
    });
  });

  it.each([
    [regularTerms(8), targets],
    [[...regularTerms(7), term('Midyear', '1.6', 30)], targets],
    [regularTerms(8), { ...targets, creditUnits: '' }],
  ])('never treats incomplete targets as graduation eligibility', (terms, requirements) => {
    expect(buildCalculationReport(terms, requirements).latin.stage).not.toBe('targets-met');
  });

  it('uses Midyear credits toward targets without awarding graduation honors', () => {
    const report = buildCalculationReport([...regularTerms(8), term('Midyear', '1.6', 3)], targets);
    expect(report.latin).toMatchObject({ stage: 'targets-met', label: 'Entered targets reached', note: expect.stringContaining('BU must still verify') });
  });

  it.each([
    { ...term('underload', '1.2', 3), underload: true },
    term('inc', 'INC', 3),
    term('conditional', '4.0', 0),
    term('dropped', 'DRP', 3),
  ])('withholds a named result when an entered course or load needs review', blocker => {
    expect(buildCalculationReport([...regularTerms(8), blocker], targets).latin.stage).toBe('review');
  });

  it.each([
    { ...term('underload', '1.2', 3), underload: true },
    term('conditional', '4.0', 0), term('failure', '5.0', 3), term('inc', 'INC', 3),
    term('pending', '', 3), term('dropped', 'DRP', 3),
  ])('reveals early record issues without waiting for six semesters', blocker => {
    expect(buildCalculationReport([term('first', '1.5', 3), blocker], targets).latin.stage).toBe('review');
  });

  it('accepts a program target shorter than six terms without claiming residence verification', () => {
    expect(readDegreeTargets({ regularSemesters: '4', creditUnits: '72' })).toEqual({ semesters: 4, units: 72 });
  });

  it.each([
    [{ regularSemesters: '', creditUnits: '' }, { semesters: null, units: null }],
    [{ regularSemesters: '4', creditUnits: '' }, { semesters: null, units: expect.any(String) }],
    [{ regularSemesters: '1.5', creditUnits: '-1' }, { semesters: expect.any(String), units: expect.any(String) }],
  ])('validates optional targets without inventing missing values', (requirements, errors) => {
    expect(degreeTargetErrors(requirements)).toEqual(errors);
  });

  it('calculates a range when targets are incomplete while reporting the target problem', () => {
    const report = buildCalculationReport(regularTerms(1), { regularSemesters: '4', creditUnits: '' });
    expect({ range: report.bracket, label: report.latin.label }).toEqual({ range: 'Cum Laude', label: 'Curriculum targets need review' });
  });

  it('invalidates a computed result when the curriculum targets change', () => {
    const terms = regularTerms(8);
    expect(buildCalculationReport(terms, targets).signature)
      .not.toBe(buildCalculationReport(terms, { ...targets, creditUnits: '144' }).signature);
  });
});

describe('combined calculator scope', () => {
  it('keeps total courses separate from pending grades and includes zero-unit courses', () => {
    const subjects = [...Array.from({ length: 5 }, () => ({ code: 'TEST', name: 'Synthetic', grade: '1.5', units: 3 })),
      { code: 'PE', name: 'Synthetic PE', grade: '1.5', units: 2 }, { code: 'NSTP', name: 'Synthetic NSTP', grade: '1.2', units: 0 }];
    const report = buildCalculationReport([{ ...term('regular', '1.5', 3), subjects }]);
    expect({ courses: report.stats.totalCourses, pending: report.pending, units: report.stats.gradedUnits,
      honor: report.termHonor?.label }).toEqual({ courses: 7, pending: 0, units: 17, honor: "Dean's Lister" });
  });
  it('uses the existing evaluator for a full-load President’s Lister result', () => {
    expect(buildCalculationReport([term('regular', '1.2', 15)]).termHonor?.level).toBe('president');
  });
  it('does not award a term honor while a course grade is still pending', () => {
    const regular = term('regular', '1.2', 15);
    regular.subjects.push({ code: 'PENDING', name: 'Pending course', units: 3, grade: '' });
    expect(buildCalculationReport([regular]).termHonor?.label).toBe('Provisional');
  });
  it.each([
    ['ordinary', '2.0', false, false, 'Good Academic Standing'],
    ['deficiency', '5.0', false, false, 'Not Eligible'],
    ['underload', '1.2', true, false, 'Good Academic Standing'],
    ['midyear', '1.2', false, true, 'Midyear Term'],
  ])('keeps shared term evaluation for %s', (id, grade, underload, isMidyear, label) => {
    const regular = { ...term(String(id), String(grade), 15), underload: !!underload, isMidyear: !!isMidyear };
    expect(buildCalculationReport([regular]).termHonor?.label).toBe(label);
  });
  it('computes only the selected term in GWA mode', () => {
    const terms = [term('first', '1.0', 3), term('second', '2.0', 6)];
    expect(buildCalculationReport(selectCalculationTerms(terms, 'gwa', 'first')).stats.cumulativeGWA).toBe(1);
  });
  it('weights cumulative grades by course units, not semester averages', () => {
    const terms = [term('first', '1.0', 3), term('second', '2.0', 6)];
    expect(buildCalculationReport(selectCalculationTerms(terms, 'latin', 'first')).stats.cumulativeGWA).toBeCloseTo(15 / 9);
  });
  it('keeps empty and zero-unit records without an honors bracket', () => {
    expect(buildCalculationReport([term('empty', '', 3), term('zero', '1.0', 0)]).bracket).toBeNull();
  });
  it('counts blank and INC as pending while excluding DRP from weighted math', () => {
    const report = buildCalculationReport([term('blank', '', 3), term('inc', ' inc ', 3), term('dropped', 'DRP', 3)]);
    expect({ pending: report.pending, units: report.stats.gradedUnits }).toEqual({ pending: 2, units: 0 });
  });
  it('rejects malformed grades and negative units before computation', () => {
    expect(buildCalculationReport([term('bad', '1.0abc', -3)]).errors).toHaveLength(2);
  });
  it('invalidates a snapshot when a term flag changes, but not its computed marker', () => {
    const original = term('first', '1.0', 3);
    const signature = buildCalculationReport([original]).signature;
    expect([buildCalculationReport([{ ...original, computed: true }]).signature === signature,
      buildCalculationReport([{ ...original, underload: true }]).signature === signature]).toEqual([true, false]);
  });
  it('includes Midyear grades without applying the regular-term underload flag', () => {
    const report = buildCalculationReport([{ ...term('summer', '1.0', 3), underload: true, isMidyear: true }]);
    expect({ underload: report.stats.hasUnderload, bracket: report.bracket }).toEqual({ underload: false, bracket: 'Summa Cum Laude' });
  });
});


describe('exact weighted recognition boundaries', () => {
  it.each([
    ['1.0', 1, '1.5', 1, 'president', 'Summa Cum Laude'],
    ['1.0', 1, '1.6', 3, 'president', 'Magna Cum Laude'],
    ['1.6', 3, '2.2', 1, 'dean', 'Cum Laude'],
    ['1.0', 1, '1.6', 3.0001, 'dean', 'Cum Laude'],
    ['1.6', 3, '2.2', 1.0001, 'none', 'Outside Latin honors GWA brackets'],
  ])('classifies %s × %s and %s × %s without display rounding', (gradeA, unitsA, gradeB, unitsB, level, bracket) => {
    const first = term('boundary', gradeA, unitsA);
    first.subjects.push(...term('second', gradeB, unitsB).subjects);
    const result = buildCalculationReport([first]);
    expect([result.termHonor?.level, result.bracket]).toEqual([level, bracket]);
  });
});

describe('handbook evidence and recognition are separate', () => {
  it('evaluates old records without a manual load confirmation gate', () => {
    const original = { ...term('old', '1.2', 15), regularLoadConfirmed: undefined };
    expect(buildCalculationReport([original]).termHonor?.level).toBe('president');
  });
  it('ignores retired load confirmation in the calculation snapshot', () => {
    const original = { ...term('old', '1.2', 15), regularLoadConfirmed: undefined };
    expect(buildCalculationReport([original]).signature).toBe(buildCalculationReport([{ ...original, regularLoadConfirmed: true }]).signature);
  });
  it('shows good standing for a complete passing record outside PL and DL', () => {
    expect(buildCalculationReport([term('ordinary', '2.5', 15)]).standing.label).toBe('Good Academic Standing');
  });
  it.each(['', 'INC', '4.0', '5.0'])('never calls a %s record good standing', grade => {
    expect(buildCalculationReport([term('needs-review', grade, 15)]).standing.level).not.toBe('good');
  });
  it('does not combine failures from different terms into current probation', () => {
    expect(buildCalculationReport([term('first', '5.0', 3), term('second', '5.0', 3)]).standing.label).toBe('Record needs review');
  });
  it('keeps known failures visible while other semesters still have pending grades', () => {
    expect(buildCalculationReport([term('failed', '5.0', 3), term('pending', '', 3)]).standing.label).toBe('Record needs review');
  });
  it('keeps a 2.5 from disqualifying the separate Latin grade condition', () => {
    expect(buildCalculationReport([term('latin', '2.5', 15)]).latinIssues).toEqual([]);
  });
  it('keeps a known subject-cap blocker visible even without load confirmation', () => {
    const original = { ...term('old', '2.5', 15), regularLoadConfirmed: undefined };
    expect(buildCalculationReport([original]).termHonor?.reason).toContain('2.40');
  });
});
