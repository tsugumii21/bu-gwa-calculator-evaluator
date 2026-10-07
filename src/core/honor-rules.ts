// Bicol University GWA Calculator — Honor & Standing Evaluation Rules
// (Based on BU Student Handbook BOR Res. 89 s. 2006)

import type {
  CumulativeStats,
  HonorEvaluation,
  StandingEvaluation,
  Subject,
  TermHonorEvaluation,
} from '../types';
import { HONOR_THRESHOLDS } from './constants';

// ---------------------------------------------------------------------------
// Cumulative Honor Standing (Graduation Honors)
// ---------------------------------------------------------------------------

/**
 * Evaluate cumulative honor standing for graduation.
 *
 * Rules:
 * - Summa Cum Laude: GWA ≤ 1.2500, full load every term, zero 5.0/INC
 * - Magna Cum Laude: GWA 1.2501–1.4500, full load every term, zero 5.0/INC
 * - Cum Laude:       GWA 1.4501–1.7500, full load every term, zero 5.0/INC
 * - Not eligible:    any 5.0, INC, or underloaded term disqualifies
 * - Pending:         no graded units yet
 */
export function evaluateHonorStanding(stats: CumulativeStats): HonorEvaluation {
  // No data yet
  if (stats.gradedUnits === 0) {
    return {
      level: 'pending',
      label: 'Pending Evaluation',
      description: 'Awaiting term computation',
    };
  }

  // Disqualification: any failing grade, INC, or underload
  if (stats.hasFailingGrade || stats.hasInc || stats.hasUnderload) {
    const reasons: string[] = [];
    if (stats.hasFailingGrade) reasons.push(`${stats.failingCount} fail`);
    if (stats.hasInc) reasons.push('INC grade');
    if (stats.hasUnderload) reasons.push('underload');

    return {
      level: 'not-eligible',
      label: 'Regular Graduate',
      description: `Ineligible: ${reasons.join(', ')}`,
    };
  }

  const gwa = stats.cumulativeGWA;

  if (gwa <= HONOR_THRESHOLDS.SUMMA.maxGWA) {
    return {
      level: 'summa',
      label: HONOR_THRESHOLDS.SUMMA.label,
      description: `Meets Summa criteria (≤ ${HONOR_THRESHOLDS.SUMMA.maxGWA.toFixed(4)})`,
    };
  }

  if (gwa <= HONOR_THRESHOLDS.MAGNA.maxGWA) {
    return {
      level: 'magna',
      label: HONOR_THRESHOLDS.MAGNA.label,
      description: `Meets Magna criteria (≤ ${HONOR_THRESHOLDS.MAGNA.maxGWA.toFixed(4)})`,
    };
  }

  if (gwa <= HONOR_THRESHOLDS.CUM.maxGWA) {
    return {
      level: 'cum-laude',
      label: HONOR_THRESHOLDS.CUM.label,
      description: `Meets Cum Laude criteria (≤ ${HONOR_THRESHOLDS.CUM.maxGWA.toFixed(4)})`,
    };
  }

  return {
    level: 'regular',
    label: 'Regular Graduate',
    description: `Below Cum Laude threshold (≤ ${HONOR_THRESHOLDS.CUM.maxGWA.toFixed(4)})`,
  };
}

// ---------------------------------------------------------------------------
// Academic Standing
// ---------------------------------------------------------------------------

/**
 * Evaluate academic standing based on the number of failing grades.
 *
 * Rules (BU Student Handbook):
 * - 0 failures: Good Standing
 * - 1 failure:  Academic Warning (subject load reduced next term)
 * - 2 failures: Academic Probation (max 75% load)
 * - 3+ failures: Academic Dismissal Risk (dropped from rolls)
 */
export function evaluateAcademicStanding(stats: CumulativeStats): StandingEvaluation {
  if (stats.failingCount === 0) {
    return {
      level: 'good',
      label: 'Good Standing',
      description: '0 deficiencies detected',
    };
  }

  if (stats.failingCount === 1) {
    return {
      level: 'warning',
      label: 'Academic Warning',
      description: '1 failure (reduced load)',
    };
  }

  if (stats.failingCount === 2) {
    return {
      level: 'probation',
      label: 'Academic Probation',
      description: '2 failures (max 75% load)',
    };
  }

  return {
    level: 'dismissal-risk',
    label: 'Academic Dismissal Risk',
    description: '3+ failures (dismissal risk)',
  };
}

// ---------------------------------------------------------------------------
// Term Honor Standing (Per-Semester: President's / Dean's Lister)
// ---------------------------------------------------------------------------

/**
 * Evaluate per-semester honor standing.
 *
 * President's Lister: GPA ≤ 1.4500, NO subject > 1.75, full load, zero 5.0/INC
 * Dean's Lister:      GPA ≤ 1.7500, NO subject > 2.50, full load, zero 5.0/INC
 *
 * Disqualified if: underloaded, or any 5.0/INC grade present.
 */
export function evaluateTermHonor(
  semesterGPA: number,
  subjects: Subject[],
  hasUnderload: boolean,
): TermHonorEvaluation {
  // Determine highest (worst) numeric grade and check for fail/INC
  let lowestGradeInSem = 1.0;
  let hasFailOrInc = false;

  subjects.forEach((sub) => {
    const num = parseFloat(sub.grade);
    if (
      sub.grade === '5.0' ||
      sub.grade === '5.00' ||
      num === 5.0 ||
      sub.grade === 'INC'
    ) {
      hasFailOrInc = true;
    }
    if (!isNaN(num) && num > lowestGradeInSem) {
      lowestGradeInSem = num;
    }
  });

  // Calculate total semester units for the "has units" check
  const semUnits = subjects.reduce(
    (sum, sub) => sum + (parseFloat(String(sub.units)) || 0),
    0,
  );

  // Eligible path: has units, no fail/INC, not underloaded
  if (semUnits > 0 && !hasFailOrInc && !hasUnderload) {
    // President's Lister: GPA ≤ 1.4500 and no grade > 1.75
    if (semesterGPA <= 1.45 && lowestGradeInSem <= 1.75) {
      return {
        level: 'president',
        label: "President's Lister",
        reason: `Semester GPA ${semesterGPA.toFixed(4)} with no grade above 1.75`,
      };
    }

    // Dean's Lister: GPA ≤ 1.7500 and no grade > 2.50
    if (semesterGPA <= 1.75 && lowestGradeInSem <= 2.5) {
      return {
        level: 'dean',
        label: "Dean's Lister",
        reason: `Semester GPA ${semesterGPA.toFixed(4)} with no grade above 2.50`,
      };
    }
  }

  // Not qualified — build a human-readable reason
  if (hasUnderload) {
    return {
      level: 'none',
      label: 'Not Eligible',
      reason: 'Custom/underloaded term disqualifies from term honors',
    };
  }

  if (hasFailOrInc) {
    return {
      level: 'none',
      label: 'Not Eligible',
      reason: 'Disqualified due to 5.0 or INC grade',
    };
  }

  if (semUnits === 0) {
    return {
      level: 'none',
      label: 'Not Eligible',
      reason: 'No enrolled units in this semester',
    };
  }

  return {
    level: 'none',
    label: 'Not Eligible',
    reason: `Semester GPA ${semesterGPA.toFixed(4)} does not meet Dean's Lister threshold (≤ 1.7500)`,
  };
}

// ---------------------------------------------------------------------------
// Target Grade Calculator (Simulator)
// ---------------------------------------------------------------------------

/**
 * Calculate the average grade needed across future units to reach a target
 * cumulative GWA.
 *
 * Formula:
 *   requiredTotalPoints = targetGWA × (currentUnits + futureUnits)
 *   neededFuturePoints  = requiredTotalPoints − currentTotalPoints
 *   requiredAverageGrade = neededFuturePoints / futureUnits
 *
 * currentGWA and currentUnits come from stats.cumulativeGWA and stats.totalUnits.
 * The currentTotalPoints = currentGWA × currentUnits (i.e. stats.totalPoints).
 *
 * Returns `null` if futureUnits ≤ 0 (cannot divide by zero).
 * Returns the raw required average grade (may be < 1.0 or > 3.0).
 */
export function calculateTargetGrade(
  currentGWA: number,
  currentUnits: number,
  futureUnits: number,
  targetGWA: number,
): number | null {
  if (futureUnits <= 0) return null;

  const currentTotalPoints = currentGWA * currentUnits;
  const requiredTotalPoints = targetGWA * (currentUnits + futureUnits);
  const neededFuturePoints = requiredTotalPoints - currentTotalPoints;
  const requiredAverageGrade = neededFuturePoints / futureUnits;

  return requiredAverageGrade;
}

/**
 * Convenience wrapper to evaluate term honors given subjects and underload status.
 */
export function evaluateTermHonors(
  subjects: Subject[],
  hasUnderload: boolean,
): TermHonorEvaluation {
  let totalGradePoints = 0;
  let gradedUnits = 0;
  (subjects || []).forEach((sub) => {
    const numGrade = parseFloat(sub.grade);
    const units = parseFloat(String(sub.units)) || 0;
    if (!isNaN(numGrade) && units > 0) {
      totalGradePoints += numGrade * units;
      gradedUnits += units;
    }
  });
  const gpa = gradedUnits > 0 ? totalGradePoints / gradedUnits : 0;
  return evaluateTermHonor(gpa, subjects, hasUnderload);
}

/**
 * Alias for evaluating Latin graduation honors.
 */
export const evaluateLatinHonors = evaluateHonorStanding;
