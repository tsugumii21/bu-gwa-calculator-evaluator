import { describe, it, expect } from 'vitest';
import {
  evaluateHonorStanding,
  evaluateAcademicStanding,
  evaluateTermHonor,
} from '../honor-rules';
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
      { code: 'CS 111', name: 'Course 1', grade: '1.25', units: 3 },
      { code: 'CS 112', name: 'Course 2', grade: '1.25', units: 3 },
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
      { code: 'CS 111', name: 'Course 1', grade: '1.25', units: 3 },
      { code: 'CS 112', name: 'Course 2', grade: '4.00', units: 3 },
      { code: 'CS 113', name: 'Course 3', grade: '1.25', units: 3 },
      { code: 'CS 114', name: 'Course 4', grade: '1.25', units: 3 },
      { code: 'CS 115', name: 'Course 5', grade: '1.25', units: 3 },
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
    expect(evalResult.label).toBe('Regular Graduate');
  });

  it('awards Summa Cum Laude for GWA <= 1.2500 with zero deficiencies and full load', () => {
    const cleanStats: CumulativeStats = {
      totalPoints: 120,
      totalUnits: 100,
      gradedUnits: 100,
      totalCourses: 30,
      hasUnderload: false,
      hasFailingGrade: false,
      hasInc: false,
      failingCount: 0,
      cumulativeGWA: 1.2,
    };

    const evalResult = evaluateHonorStanding(cleanStats);
    expect(evalResult.level).toBe('summa');
    expect(evalResult.label).toBe('Summa Cum Laude');
  });
});
