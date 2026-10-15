// Bicol University GWA Calculator — Math Computation Engine

import type { Semester, CumulativeStats, Subject } from '../types';

/**
 * Returns true if the grade string represents a valid numeric grade (1.00 - 5.00).
 */
export function isGradeNumeric(grade: string): boolean {
  if (!grade || grade.trim() === '') return false;
  const num = parseFloat(grade.trim());
  return !isNaN(num) && num >= 1.0 && num <= 5.0;
}

/**
 * Parse a grade string into a number.
 * Returns `null` for non-numeric marks ('INC', 'DRP') or out-of-bound values.
 */
export function parseGrade(grade: string): number | null {
  if (!grade || grade.trim() === '') return null;
  const num = parseFloat(grade.trim());
  return !isNaN(num) && num >= 1.0 && num <= 5.0 ? num : null;
}

/**
 * Calculate the GWA for a single semester.
 * Formula: sum(grade × units) / sum(graded units)
 * Only includes subjects with valid numeric grades (1.00 - 5.00) and units > 0.
 */
export function calculateSemesterGWA(semester: Semester): number {
  let totalGradePoints = 0;
  let totalUnits = 0;

  if (!semester || !semester.subjects) return 0;

  semester.subjects.forEach((sub) => {
    if (sub.grade === 'DRP' || sub.grade === 'INC') return;
    const numGrade = parseGrade(sub.grade);
    const units = Math.max(0, parseFloat(String(sub.units)) || 0);
    if (numGrade !== null && units > 0) {
      totalGradePoints += numGrade * units;
      totalUnits += units;
    }
  });

  return totalUnits > 0 ? totalGradePoints / totalUnits : 0;
}

/**
 * Calculate the total completed/earned enrolled units for a semester.
 * Officially dropped courses ('DRP') are excluded from completed load.
 */
export function calculateSemesterUnits(semester: Semester): number {
  if (!semester || !semester.subjects) return 0;
  return semester.subjects.reduce((sum, sub) => {
    if (sub.grade === 'DRP') return sum;
    return sum + Math.max(0, parseFloat(String(sub.units)) || 0);
  }, 0);
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
    const rawGrade = (sub.grade || '').trim().toUpperCase();
    const units = Math.max(0, parseFloat(String(sub.units)) || 0);

    if (rawGrade === 'DRP') return;

    if (units > 0) {
      totalUnits += units;
      const numGrade = parseGrade(sub.grade);

      if (numGrade !== null) {
        totalGradePoints += numGrade * units;
        gradedUnits += units;
        // 4.00 (Conditional) and 5.00 (Failure) are active academic deficiencies
        if (numGrade === 5.0 || numGrade === 4.0 || rawGrade === '5.0' || rawGrade === '5.00' || rawGrade === '4.0' || rawGrade === '4.00') {
          hasFailingGrade = true;
        }
      }

      if (rawGrade === 'INC') {
        hasInc = true;
      }
    }
  });

  const gpa = gradedUnits > 0 ? totalGradePoints / gradedUnits : 0;
  return { gpa, totalUnits, gradedUnits, hasFailingGrade, hasInc };
}

/**
 * Build cumulative statistics across ALL semesters.
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
      // Check semester active completed load for underload (< 15 units in regular term)
      const semActiveUnits = sem.subjects.reduce((sum, s) => {
        if (s.grade === 'DRP') return sum;
        return sum + Math.max(0, parseFloat(String(s.units)) || 0);
      }, 0);
      if (sem.subjects.length > 0 && semActiveUnits < 15 && semActiveUnits > 0) {
        hasUnderload = true;
      }

      sem.subjects.forEach((sub) => {
        totalCourses++;
        const rawGrade = (sub.grade || '').trim().toUpperCase();
        const units = Math.max(0, parseFloat(String(sub.units)) || 0);

        if (rawGrade === 'DRP') return;

        const numGrade = parseGrade(sub.grade);

        if (
          rawGrade === '5.0' ||
          rawGrade === '5.00' ||
          rawGrade === '4.0' ||
          rawGrade === '4.00' ||
          (numGrade !== null && (numGrade === 5.0 || numGrade === 4.0))
        ) {
          hasFailingGrade = true;
          failingCount++;
        }

        if (rawGrade === 'INC') {
          hasInc = true;
        }

        if (units > 0) {
          totalUnits += units;
          if (numGrade !== null) {
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
      const semActiveUnits = sem.subjects.reduce((sum, s) => {
        if (s.grade === 'DRP') return sum;
        return sum + Math.max(0, parseFloat(String(s.units)) || 0);
      }, 0);
      if (sem.subjects.length > 0 && semActiveUnits < 15 && semActiveUnits > 0) {
        hasUnderload = true;
      }

      sem.subjects.forEach((sub) => {
        totalCourses++;
        const rawGrade = (sub.grade || '').trim().toUpperCase();
        const units = Math.max(0, parseFloat(String(sub.units)) || 0);

        if (rawGrade === 'DRP') return;

        const numGrade = parseGrade(sub.grade);

        if (
          rawGrade === '5.0' ||
          rawGrade === '5.00' ||
          rawGrade === '4.0' ||
          rawGrade === '4.00' ||
          (numGrade !== null && (numGrade === 5.0 || numGrade === 4.0))
        ) {
          hasFailingGrade = true;
          failingCount++;
        }

        if (rawGrade === 'INC') {
          hasInc = true;
        }

        if (units > 0) {
          totalUnits += units;
          if (numGrade !== null) {
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
