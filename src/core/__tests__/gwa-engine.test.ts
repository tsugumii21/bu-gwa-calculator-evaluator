import { describe, it, expect } from 'vitest';
import {
  isGradeNumeric,
  parseGrade,
  calculateSemesterGWA,
  calculateSemesterUnits,
  calculateSemesterStats,
  calculateCumulativeStats,
} from '../gwa-engine';
import type { Semester } from '../../types';

describe('gwa-engine — Bounds, Validation & Calculation', () => {
  it('validates official BU grades correctly and rejects invalid/out-of-bound marks', () => {
    expect(isGradeNumeric('1.00')).toBe(true);
    expect(isGradeNumeric('1.25')).toBe(true);
    expect(isGradeNumeric('3.00')).toBe(true);
    expect(isGradeNumeric('5.00')).toBe(true);

    expect(isGradeNumeric('0')).toBe(false);
    expect(isGradeNumeric('-1.5')).toBe(false);
    expect(isGradeNumeric('99')).toBe(false);
    expect(isGradeNumeric('INC')).toBe(false);
    expect(isGradeNumeric('DRP')).toBe(false);
    expect(isGradeNumeric('')).toBe(false);
  });

  it('parses valid numeric grades and returns null for invalid grades', () => {
    expect(parseGrade('1.50')).toBe(1.5);
    expect(parseGrade('2.75')).toBe(2.75);
    expect(parseGrade('5.0')).toBe(5.0);
    expect(parseGrade('0.00')).toBeNull();
    expect(parseGrade('-10')).toBeNull();
    expect(parseGrade('INC')).toBeNull();
  });

  it('calculates semester GWA accurately and ignores DRP, INC, or empty grades', () => {
    const semester: Semester = {
      id: 'sem-1',
      title: 'Year 1 - 1st Semester',
      underload: false,
      computed: true,
      subjects: [
        { code: 'CS 111', name: 'Intro', grade: '1.25', units: 3 },
        { code: 'CS 112', name: 'Programming', grade: '1.75', units: 3 },
        { code: 'GEC 11', name: 'UTS', grade: 'INC', units: 3 },
        { code: 'PE 1', name: 'Pathfit', grade: 'DRP', units: 2 },
      ],
    };

    // Only CS 111 (1.25 * 3 = 3.75) and CS 112 (1.75 * 3 = 5.25) are graded
    // Total points: 9.0, Total graded units: 6 -> GWA: 1.5000
    const gwa = calculateSemesterGWA(semester);
    expect(gwa).toBeCloseTo(1.5, 4);
  });

  it('excludes DRP from completed semester units', () => {
    const semester: Semester = {
      id: 'sem-2',
      title: 'Year 1 - 2nd Semester',
      underload: false,
      computed: true,
      subjects: [
        { code: 'CS 121', name: 'DSA', grade: '1.50', units: 3 },
        { code: 'CS 122', name: 'Discrete', grade: 'DRP', units: 3 },
      ],
    };

    expect(calculateSemesterUnits(semester)).toBe(3);
  });

  it('detects 4.00 (Conditional) as an active academic deficiency in calculateSemesterStats', () => {
    const stats = calculateSemesterStats([
      { code: 'CS 111', name: 'Intro', grade: '4.00', units: 3 },
      { code: 'GEC 11', name: 'UTS', grade: '1.50', units: 3 },
    ]);

    expect(stats.hasFailingGrade).toBe(true);
    expect(stats.gradedUnits).toBe(6);
  });

  it('calculates cumulative statistics and detects underloaded terms (< 15 units)', () => {
    const semesters: Semester[] = [
      {
        id: 'sem-1',
        title: 'Term 1',
        underload: false,
        computed: true,
        subjects: [
          { code: 'CS 111', name: 'Intro', grade: '1.25', units: 3 },
          { code: 'CS 112', name: 'Prog', grade: '1.50', units: 3 },
          { code: 'CS 113', name: 'Math', grade: '1.75', units: 3 },
          // Total 9 units -> Underloaded (< 15 units)
        ],
      },
    ];

    const stats = calculateCumulativeStats(semesters);
    expect(stats.hasUnderload).toBe(true);
    expect(stats.cumulativeGWA).toBeCloseTo(1.5, 4);
  });
});
