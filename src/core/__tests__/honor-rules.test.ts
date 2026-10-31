import { describe, it, expect } from 'vitest';
import {
  evaluateHonorStanding,
  evaluateTermHonor,
  isMidyearTerm,
} from '../honor-rules';
import { isValidBUGrade } from '../constants';
import type { CumulativeStats } from '../../types';

describe('honor-rules — BU BOR Res. 89 s. 2006 Policy Compliance', () => {
  it('CRITICAL DEFENSE: empty courses with unentered grades must NEVER award President Lister on 0.0000 GPA', () => {
    const subjects = [
      { code: 'CS 111', name: 'Intro', grade: '', units: 3 },
      { code: 'CS 112', name: 'Programming', grade: '', units: 3 },
      { code: 'GEC 11', name: 'UTS', grade: '', units: 3 },
    ];

    const result = evaluateTermHonor(0, subjects, false);
    expect(result.level).toBe('none');
    expect(result.label).toBe('Pending');
  });

  it('awards President Lister when GPA <= 1.4500, no grade > 1.75, and full load (>= 15 units)', () => {
    const subjects = [
      { code: 'CS 111', name: 'Course 1', grade: '1.20', units: 3 },
      { code: 'CS 112', name: 'Course 2', grade: '1.20', units: 3 },
      { code: 'CS 113', name: 'Course 3', grade: '1.50', units: 3 },
      { code: 'CS 114', name: 'Course 4', grade: '1.50', units: 3 },
      { code: 'CS 115', name: 'Course 5', grade: '1.50', units: 3 },
    ];
    // GPA = 1.4000, 15 units, lowest grade 1.50 <= 1.75
    const result = evaluateTermHonor(1.4, subjects, false);
    expect(result.level).toBe('president');
    expect(result.label).toBe("President's Lister");
  });

  it('disqualifies student from President Lister if any grade exceeds 1.75 even if GPA is <= 1.4500', () => {
    const subjects = [
      { code: 'CS 111', name: 'Course 1', grade: '1.00', units: 3 },
      { code: 'CS 112', name: 'Course 2', grade: '1.00', units: 3 },
      { code: 'CS 113', name: 'Course 3', grade: '1.00', units: 3 },
      { code: 'CS 114', name: 'Course 4', grade: '1.00', units: 3 },
      { code: 'CS 115', name: 'Course 5', grade: '2.00', units: 3 },
    ];
    // GPA = 1.2000, but has a 2.00 (> 1.75) -> Should fall back to Dean's Lister
    const result = evaluateTermHonor(1.2, subjects, false);
    expect(result.level).toBe('dean');
    expect(result.label).toBe("Dean's Lister");
  });

  it('disqualifies from term honors if term has 4.00, 5.00, or INC', () => {
    const subjects = [
      { code: 'CS 111', name: 'Course 1', grade: '1.20', units: 3 },
      { code: 'CS 112', name: 'Course 2', grade: '4.00', units: 3 },
      { code: 'CS 113', name: 'Course 3', grade: '1.20', units: 3 },
      { code: 'CS 114', name: 'Course 4', grade: '1.20', units: 3 },
      { code: 'CS 115', name: 'Course 5', grade: '1.20', units: 3 },
    ];
    const result = evaluateTermHonor(1.4, subjects, false);
    expect(result.level).toBe('none');
    expect(result.label).toBe('Not Eligible');
    expect(result.reason).toContain('4.00');
  });

  it('disqualifies from Latin Graduation Honors if student has any deficiency or underload', () => {
    const statsWithDeficiency: CumulativeStats = {
      totalPoints: 120,
      totalUnits: 100,
      gradedUnits: 100,
      totalCourses: 30,
      hasUnderload: false,
      hasFailingGrade: true, // e.g. had a 4.00 or 5.00
      hasInc: false,
      failingCount: 1,
      cumulativeGWA: 1.2,
    };

    const evalResult = evaluateHonorStanding(statsWithDeficiency);
    expect(evalResult.level).toBe('not-eligible');
    expect(evalResult.label).toBe('Regular Degree Standing');
    expect(evalResult.tier).toBe('disqualified');
  });

  it('Tier 1: underclassmen (< 45 units) do NOT receive premature Latin certification', () => {
    const freshmanStats: CumulativeStats = {
      totalPoints: 21.6,
      totalUnits: 18,
      gradedUnits: 18,
      totalCourses: 6,
      hasUnderload: false,
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.20, // Summa level GWA, but only 18 units!
    };

    const evalResult = evaluateHonorStanding(freshmanStats);
    expect(evalResult.level).toBe('underclassman-milestone');
    expect(evalResult.tier).toBe('tier-1-milestone');
    expect(evalResult.isLocked).toBe(true);
    expect(evalResult.label).toBe('Degree Tracker: Milestone Active');
    expect(evalResult.projectedHonor).toBe('Summa Cum Laude');
    expect(evalResult.requiredUnitsRemaining).toBe(27); // 45 - 18
  });

  it('Tier 2: mid-degree students (45–104.9 units) receive Projected: [Honor] Pace', () => {
    const juniorStats: CumulativeStats = {
      totalPoints: 91.8,
      totalUnits: 68,
      gradedUnits: 68,
      totalCourses: 22,
      hasUnderload: false,
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.35, // Magna bracket
    };

    const evalResult = evaluateHonorStanding(juniorStats);
    expect(evalResult.level).toBe('magna');
    expect(evalResult.tier).toBe('tier-2-projected');
    expect(evalResult.isLocked).toBe(false);
    expect(evalResult.label).toBe('Projected: Magna Pace');
    expect(evalResult.description).toContain('68/140 units');
  });

  it('Tier 3: graduating seniors (>= 105 units) receive Degree Honors Candidate status', () => {
    const seniorStats: CumulativeStats = {
      totalPoints: 144,
      totalUnits: 120,
      gradedUnits: 120,
      totalCourses: 40,
      hasUnderload: false,
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.20, // Summa bracket
    };

    const evalResult = evaluateHonorStanding(seniorStats);
    expect(evalResult.level).toBe('summa');
    expect(evalResult.tier).toBe('tier-3-candidate');
    expect(evalResult.label).toBe('Candidate: Summa Cum Laude');
    expect(evalResult.description).toContain('Registrar');
  });

  it('allows simulation bypass when ignoreUnitThresholds option is true', () => {
    const simulatedFreshman: CumulativeStats = {
      totalPoints: 21.6,
      totalUnits: 18,
      gradedUnits: 18,
      totalCourses: 6,
      hasUnderload: false,
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.20,
    };

    const evalResult = evaluateHonorStanding(simulatedFreshman, { ignoreUnitThresholds: true });
    expect(evalResult.level).toBe('summa');
    expect(evalResult.label).toBe('Summa Cum Laude');
  });

  it('recognizes Midyear / Summer terms and does not classify them as underloaded terms', () => {
    const midyearSubjects = [
      { code: 'CS 111', name: 'Practicum', grade: '1.20', units: 3 },
      { code: 'CS 112', name: 'Seminar', grade: '1.20', units: 3 },
    ];
    // 6 units in Midyear
    const result = evaluateTermHonor(1.20, midyearSubjects, false, 'Year 1 - Midyear');
    expect(result.level).toBe('none');
    expect(result.label).toBe('Midyear Term');

    // Also recognizes explicit user midyear flag even without keyword in title
    expect(isMidyearTerm('Term 3', true)).toBe(true);
    const resultExplicit = evaluateTermHonor(1.20, midyearSubjects, false, 'Term 3', true);
    expect(resultExplicit.level).toBe('none');
    expect(resultExplicit.label).toBe('Midyear Term');
    expect(resultExplicit.reason).toContain('exempt from semestral honors');
  });

  it('disqualifies from Latin Honors ONLY when hasUnderload is explicitly flagged', () => {
    const underloadedStats: CumulativeStats = {
      totalPoints: 120,
      totalUnits: 100,
      gradedUnits: 100,
      totalCourses: 30,
      hasUnderload: true, // User pressed the Underloaded Term button
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.20,
    };

    const latinResult = evaluateHonorStanding(underloadedStats);
    expect(latinResult.level).toBe('not-eligible');
    expect(latinResult.description).toContain('underload');
  });

  it('validates authentic BU discrete grading scale and rejects non-discrete decimals', () => {
    // Valid BU grades
    expect(isValidBUGrade('1.0')).toBe(true);
    expect(isValidBUGrade('1.1')).toBe(true);
    expect(isValidBUGrade('1.2')).toBe(true);
    expect(isValidBUGrade('1.5')).toBe(true);
    expect(isValidBUGrade('2.0')).toBe(true);
    expect(isValidBUGrade('3.0')).toBe(true);
    expect(isValidBUGrade('4.0')).toBe(true);
    expect(isValidBUGrade('5.0')).toBe(true);
    expect(isValidBUGrade('INC')).toBe(true);
    expect(isValidBUGrade('DRP')).toBe(true);

    // Non-existent BU grades
    expect(isValidBUGrade('1.25')).toBe(false);
    expect(isValidBUGrade('1.75')).toBe(false);
    expect(isValidBUGrade('2.25')).toBe(false);
    expect(isValidBUGrade('1.65')).toBe(false);
    expect(isValidBUGrade('0.9')).toBe(false);
    expect(isValidBUGrade('6.0')).toBe(false);
    expect(isValidBUGrade('abc')).toBe(false);
  });
});
