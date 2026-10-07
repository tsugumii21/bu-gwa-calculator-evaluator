// Bicol University GWA Calculator — Math Computation Engine

import type { Semester, CumulativeStats, Subject } from '../types';

/**
 * Returns true if the grade string represents a numeric grade
 * (as opposed to 'INC' or 'DRP').
 */
export function isGradeNumeric(grade: string): boolean {
  return !isNaN(parseFloat(grade));
}

/**
 * Parse a grade string into a number.
 * Returns `null` for non-numeric grades like 'INC' or 'DRP'.
 */
export function parseGrade(grade: string): number | null {
  const num = parseFloat(grade);
  return isNaN(num) ? null : num;
}

/**
 * Calculate the GWA for a single semester.
 * Formula: sum(grade × units) / sum(graded units)
 * Only includes subjects with numeric grades and units > 0.
 */
export function calculateSemesterGWA(semester: Semester): number {
  let totalGradePoints = 0;
  let totalUnits = 0;

  if (!semester || !semester.subjects) return 0;

  semester.subjects.forEach((sub) => {
    const numGrade = parseFloat(sub.grade);
    const units = parseFloat(String(sub.units)) || 0;
    if (!isNaN(numGrade) && units > 0) {
      totalGradePoints += numGrade * units;
      totalUnits += units;
    }
  });

  return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
}

/**
 * Calculate the total enrolled units for a semester (all subjects).
 */
export function calculateSemesterUnits(semester: Semester): number {
  if (!semester || !semester.subjects) return 0;
  return semester.subjects.reduce(
    (sum, sub) => sum + (parseFloat(String(sub.units)) || 0),
    0,
  );
}

/**
 * Calculate per-semester statistics for a list of subjects.
 */
export function calculateSemesterStats(subjects: Subject[] = []): {
  gpa: number;
  totalUnits: number;
  gradedUnits: number;
  hasFailingGrade: boolean;
  hasInc: boolean;
} {
  let totalGradePoints = 0;
  let gradedUnits = 0;
  let totalUnits = 0;
  let hasFailingGrade = false;
  let hasInc = false;

  (subjects || []).forEach((sub) => {
    const numGrade = parseFloat(sub.grade);
    const units = parseFloat(String(sub.units)) || 0;
    if (units > 0) {
      totalUnits += units;
      if (!isNaN(numGrade)) {
        totalGradePoints += numGrade * units;
        gradedUnits += units;
        if (numGrade === 5.0 || sub.grade === '5.0' || sub.grade === '5.00') {
          hasFailingGrade = true;
        }
      }
      if (sub.grade === 'INC') {
        hasInc = true;
      }
    }
  });

  const gpa = gradedUnits > 0 ? totalGradePoints / gradedUnits : 0;
  return { gpa, totalUnits, gradedUnits, hasFailingGrade, hasInc };
}

/**
 * Build cumulative statistics across ALL semesters.
 *
 * - totalUnits: sum of all units for subjects with units > 0
 * - gradedUnits: sum of units for subjects with numeric grades and units > 0
 * - totalPoints: sum of (numericGrade × units) for graded subjects
 * - cumulativeGWA: totalPoints / gradedUnits (or 0 if no graded units)
 * - Failing grade detection: grade === '5.0' || '5.00' || parseFloat(grade) === 5.0
 * - INC detection: grade === 'INC'
 */
export function calculateCumulativeStats(semesters: Semester[]): CumulativeStats {
  let totalPoints = 0;
  let totalUnits = 0;
  let gradedUnits = 0;
  let totalCourses = 0;
  let hasUnderload = false;
  let hasFailingGrade = false;
  let hasInc = false;
  let failingCount = 0;

  semesters.forEach((sem) => {
    if (sem.underload) hasUnderload = true;

    if (sem.subjects) {
      sem.subjects.forEach((sub) => {
        totalCourses++;
        const numGrade = parseFloat(sub.grade);
        const units = parseFloat(String(sub.units)) || 0;

        if (sub.grade === '5.0' || sub.grade === '5.00' || numGrade === 5.0) {
          hasFailingGrade = true;
          failingCount++;
        }
        if (sub.grade === 'INC') {
          hasInc = true;
        }

        if (units > 0) {
          totalUnits += units;
          if (!isNaN(numGrade)) {
            totalPoints += numGrade * units;
            gradedUnits += units;
          }
        }
      });
    }
  });

  const cumulativeGWA = gradedUnits > 0 ? totalPoints / gradedUnits : 0;

  return {
    totalPoints,
    totalUnits,
    gradedUnits,
    totalCourses,
    hasUnderload,
    hasFailingGrade,
    hasInc,
    failingCount,
    cumulativeGWA,
  };
}

/**
 * Build cumulative statistics for ONLY computed (locked-in) semesters.
 * Identical logic to `calculateCumulativeStats`, but filters to
 * semesters where `semester.computed === true`.
 */
export function calculateComputedCumulativeStats(semesters: Semester[]): CumulativeStats {
  let totalPoints = 0;
  let totalUnits = 0;
  let gradedUnits = 0;
  let totalCourses = 0;
  let hasUnderload = false;
  let hasFailingGrade = false;
  let hasInc = false;
  let failingCount = 0;

  const computedSems = semesters.filter((s) => s.computed);

  computedSems.forEach((sem) => {
    if (sem.underload) hasUnderload = true;

    if (sem.subjects) {
      sem.subjects.forEach((sub) => {
        totalCourses++;
        const numGrade = parseFloat(sub.grade);
        const units = parseFloat(String(sub.units)) || 0;

        if (sub.grade === '5.0' || sub.grade === '5.00' || numGrade === 5.0) {
          hasFailingGrade = true;
          failingCount++;
        }
        if (sub.grade === 'INC') {
          hasInc = true;
        }

        if (units > 0) {
          totalUnits += units;
          if (!isNaN(numGrade)) {
            totalPoints += numGrade * units;
            gradedUnits += units;
          }
        }
      });
    }
  });

  const cumulativeGWA = gradedUnits > 0 ? totalPoints / gradedUnits : 0;

  return {
    totalPoints,
    totalUnits,
    gradedUnits,
    totalCourses,
    hasUnderload,
    hasFailingGrade,
    hasInc,
    failingCount,
    cumulativeGWA,
  };
}
