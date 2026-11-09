// Bicol University GWA Calculator — Math Computation Engine

import type { Semester, CumulativeStats, Subject, WeightedGradeTotals } from '../types';
import { isValidBUGrade } from './constants';

const GRADE_SCALE = 100;
const MIN_UNIT_DECIMALS = 2;

function unitDecimal(units: number) {
  const [mantissa, exponent = '0'] = units.toString().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  return { digits: BigInt(whole + fraction), decimals: fraction.length - Number(exponent) };
}

/** Totals use hundredth-unit ticks or finer ticks when an existing record requires them. */
export function calculateWeightedGrades(subjects: Subject[]): WeightedGradeTotals {
  let decimals = MIN_UNIT_DECIMALS;
  let points = 0n;
  let unitTicks = 0n;
  for (const subject of subjects) {
    const grade = parseGrade(subject.grade);
    if (grade === null || !Number.isFinite(subject.units) || subject.units <= 0) continue;
    const units = unitDecimal(subject.units);
    if (units.decimals > decimals) {
      const expansion = 10n ** BigInt(units.decimals - decimals);
      points *= expansion;
      unitTicks *= expansion;
      decimals = units.decimals;
    }
    const ticks = units.digits * 10n ** BigInt(decimals - units.decimals);
    points += BigInt(Math.round(grade * GRADE_SCALE)) * ticks;
    unitTicks += ticks;
  }
  return { points, unitTicks, unitScale: 10n ** BigInt(decimals) };
}

/** Compares the unrounded weighted average against a cutoff in grade hundredths. */
export function compareWeightedCutoff(points: bigint, unitTicks: bigint, cutoff: bigint): -1 | 0 | 1 | null {
  if (unitTicks <= 0n) return null;
  const bound = cutoff * unitTicks;
  return points < bound ? -1 : points > bound ? 1 : 0;
}

/** Adds two weighted totals without losing the finer unit precision. */
export function addWeightedGrades(left: WeightedGradeTotals, right: WeightedGradeTotals): WeightedGradeTotals {
  const unitScale = left.unitScale > right.unitScale ? left.unitScale : right.unitScale;
  const leftFactor = unitScale / left.unitScale;
  const rightFactor = unitScale / right.unitScale;
  return {
    points: left.points * leftFactor + right.points * rightFactor,
    unitTicks: left.unitTicks * leftFactor + right.unitTicks * rightFactor,
    unitScale,
  };
}

/** Numeric display of exact weighted totals. */
export function weightedAverage({ points, unitTicks }: WeightedGradeTotals): number {
  return unitTicks ? Number(points) / Number(unitTicks * BigInt(GRADE_SCALE)) : 0;
}

/** Recognizes Midyear records by their saved flag or term title. */
export function isMidyearTerm(title?: string, isExplicitMidyear?: boolean): boolean {
  return isExplicitMidyear === true || /\b(?:midyear|summer)\b/i.test(title ?? '');
}

/**
 * Returns true if the grade string represents a numeric BU mark.
 */
export function isGradeNumeric(grade: string): boolean {
  return parseGrade(grade) !== null;
}

/**
 * Parse a grade string into a number.
 * Returns `null` for non-numeric marks ('INC', 'DRP') or out-of-bound values.
 */
export function parseGrade(grade: string): number | null {
  if (!isValidBUGrade(grade)) return null;
  const value = Number(grade);
  return Number.isFinite(value) ? value : null;
}

/**
 * Calculate the GWA for a single semester.
 * Formula: sum(grade × units) / sum(graded units)
 * Only includes subjects with valid numeric grades (1.00 - 5.00) and units > 0.
 */
export function calculateSemesterGWA(semester: Semester): number {
  return weightedAverage(calculateWeightedGrades(semester?.subjects ?? []));
}

/**
 * Calculate the total completed/earned enrolled units for a semester.
 * Officially dropped courses ('DRP') are excluded from completed load.
 */
export function calculateSemesterUnits(semester: Semester): number {
  if (!semester || !semester.subjects) return 0;
  return semester.subjects.reduce((sum, sub) => {
    if (sub.grade.trim().toUpperCase() === 'DRP') return sum;
    return sum + validUnits(sub.units);
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
  const { cumulativeGWA: gpa, totalUnits, gradedUnits, hasFailingGrade, hasInc } = summarizeSubjects(subjects || []);
  return { gpa, totalUnits, gradedUnits, hasFailingGrade, hasInc };
}

const validUnits = (units: number) => Number.isFinite(units) && units > 0 ? units : 0;

function summarizeSubjects(subjects: Subject[]) {
  const weighted = calculateWeightedGrades(subjects);
  let totalUnits = 0;
  let failingCount = 0;
  let hasInc = false;
  for (const subject of subjects) {
    const grade = subject.grade.trim().toUpperCase();
    if (grade === 'DRP') continue;
    totalUnits += validUnits(subject.units);
    const numeric = parseGrade(grade);
    if (numeric === 4 || numeric === 5) failingCount++;
    if (grade === 'INC') hasInc = true;
  }
  return {
    weighted, totalUnits, failingCount, hasInc, hasFailingGrade: failingCount > 0,
    ...weightedNumbers(weighted),
  };
}

function weightedNumbers(weighted: WeightedGradeTotals) {
  return {
    totalPoints: Number(weighted.points) / Number(weighted.unitScale * BigInt(GRADE_SCALE)),
    gradedUnits: Number(weighted.unitTicks) / Number(weighted.unitScale),
    cumulativeGWA: weightedAverage(weighted),
  };
}

/**
 * Build cumulative statistics across ALL semesters.
 */
export function calculateCumulativeStats(semesters: Semester[]): CumulativeStats & { weighted: WeightedGradeTotals } {
  let totalUnits = 0;
  let totalCourses = 0;
  let hasUnderload = false;
  let hasFailingGrade = false;
  let hasInc = false;
  let failingCount = 0;

  const weighted = calculateWeightedGrades(semesters.flatMap(term => term.subjects ?? []));
  semesters.forEach((sem) => {
    if (sem.underload && !isMidyearTerm(sem.title, sem.isMidyear)) {
      hasUnderload = true;
    }

    if (sem.subjects) {

      sem.subjects.forEach((sub) => {
        totalCourses++;
        const rawGrade = (sub.grade || '').trim().toUpperCase();
        const units = validUnits(sub.units);

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

        totalUnits += units;
      });
    }
  });

  const { totalPoints, gradedUnits, cumulativeGWA } = weightedNumbers(weighted);

  return {
    weighted,
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
  let totalUnits = 0;
  let totalCourses = 0;
  let hasUnderload = false;
  let hasFailingGrade = false;
  let hasInc = false;
  let failingCount = 0;

  const computedSems = semesters.filter((s) => s.computed);
  const weighted = calculateWeightedGrades(computedSems.flatMap(term => term.subjects ?? []));

  computedSems.forEach((sem) => {
    if (sem.underload && !isMidyearTerm(sem.title, sem.isMidyear)) {
      hasUnderload = true;
    }

    if (sem.subjects) {

      sem.subjects.forEach((sub) => {
        totalCourses++;
        const rawGrade = (sub.grade || '').trim().toUpperCase();
        const units = validUnits(sub.units);

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

        totalUnits += units;
      });
    }
  });

  const { totalPoints, gradedUnits, cumulativeGWA } = weightedNumbers(weighted);

  return {
    weighted,
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
