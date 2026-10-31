// Bicol University GWA Calculator — Honor & Standing Evaluation Rules
// (Based on BU Student Handbook BOR Res. 89 s. 2006)

import type {
  CumulativeStats,
  HonorEvaluation,
  HonorLevel,
  StandingEvaluation,
  Subject,
  TermHonorEvaluation,
} from '../types';
import { HONOR_THRESHOLDS, HONORS_UNIT_MILESTONES } from './constants';

// ---------------------------------------------------------------------------
// Cumulative Honor Standing (Graduation Honors — 3-Tier Progressive Blueprint)
// ---------------------------------------------------------------------------

/**
 * Pure mathematical evaluation of honor bracket based on cumulative GWA.
 * Summa: ≤ 1.2500, Magna: ≤ 1.4500, Cum Laude: ≤ 1.7500.
 */
export function evaluateRawHonorBracket(gwa: number): { level: HonorLevel; label: string } {
  if (gwa <= HONOR_THRESHOLDS.SUMMA.maxGWA) {
    return { level: 'summa', label: HONOR_THRESHOLDS.SUMMA.label };
  }
  if (gwa <= HONOR_THRESHOLDS.MAGNA.maxGWA) {
    return { level: 'magna', label: HONOR_THRESHOLDS.MAGNA.label };
  }
  if (gwa <= HONOR_THRESHOLDS.CUM.maxGWA) {
    return { level: 'cum-laude', label: HONOR_THRESHOLDS.CUM.label };
  }
  return { level: 'regular', label: 'Regular Graduate' };
}

/**
 * Evaluate cumulative honor standing for graduation with strict BU BOR Res. 89 s. 2006
 * unit progression tiers ("Sprint vs. Marathon" Architecture).
 *
 * Tiers:
 * - Tier 1 (< 45 graded units): Underclassman Milestone. Locks premature Latin certification.
 * - Tier 2 (45–104.9 graded units): Projected Pace (Unofficial trajectory simulation).
 * - Tier 3 (≥ 105 graded units): Degree Honors Candidate (Pending final Registrar audit).
 *
 * Disqualification: any 5.0, 4.0, unremoved INC, or unapproved underload disqualifies.
 */
export function evaluateHonorStanding(
  stats: CumulativeStats,
  options?: { ignoreUnitThresholds?: boolean },
): HonorEvaluation {
  // No data yet
  if (stats.gradedUnits === 0) {
    return {
      level: 'pending',
      label: 'Pending Evaluation',
      description: 'Awaiting term computation',
      tier: 'pending',
      isLocked: true,
      progressPercent: 0,
      requiredUnitsRemaining: HONORS_UNIT_MILESTONES.UNDERCLASSMAN_THRESHOLD,
    };
  }

  // Disqualification: any failing/conditional grade, INC, or underload
  if (stats.hasFailingGrade || stats.hasInc || stats.hasUnderload) {
    const reasons: string[] = [];
    if (stats.hasFailingGrade) reasons.push(`${stats.failingCount || 1} deficiency`);
    if (stats.hasInc) reasons.push('INC grade');
    if (stats.hasUnderload) reasons.push('underload');

    return {
      level: 'not-eligible',
      label: 'Regular Degree Standing',
      description: `Ineligible for Latin Honors: ${reasons.join(', ')}`,
      tier: 'disqualified',
      isLocked: false,
      progressPercent: Math.min(100, (stats.gradedUnits / HONORS_UNIT_MILESTONES.DEGREE_TOTAL_UNITS) * 100),
    };
  }

  const raw = evaluateRawHonorBracket(stats.cumulativeGWA);
  const progressPercent = Math.min(
    100,
    (stats.gradedUnits / HONORS_UNIT_MILESTONES.DEGREE_TOTAL_UNITS) * 100,
  );

  // If ignoreUnitThresholds is enabled (e.g. simulator preview / raw solver)
  if (options?.ignoreUnitThresholds) {
    return {
      level: raw.level,
      label: raw.label,
      description: `Meets ${raw.label} criteria (≤ ${
        raw.level === 'summa'
          ? HONOR_THRESHOLDS.SUMMA.maxGWA.toFixed(4)
          : raw.level === 'magna'
            ? HONOR_THRESHOLDS.MAGNA.maxGWA.toFixed(4)
            : raw.level === 'cum-laude'
              ? HONOR_THRESHOLDS.CUM.maxGWA.toFixed(4)
              : 'N/A'
      })`,
      tier: 'tier-3-candidate',
      projectedHonor: raw.label,
      progressPercent,
      isLocked: false,
    };
  }

  // Tier 1: Underclassman Milestone (< 45 Units / Years 1–2)
  if (stats.gradedUnits < HONORS_UNIT_MILESTONES.UNDERCLASSMAN_THRESHOLD) {
    const remainingUnits = HONORS_UNIT_MILESTONES.UNDERCLASSMAN_THRESHOLD - stats.gradedUnits;
    return {
      level: 'underclassman-milestone',
      label: 'Degree Tracker: Milestone Active',
      description: `Underclassman Milestone: Latin honor trajectory activates at 45+ units (${remainingUnits.toFixed(0)} more units needed).`,
      tier: 'tier-1-milestone',
      projectedHonor: raw.label,
      progressPercent,
      isLocked: true,
      requiredUnitsRemaining: remainingUnits,
    };
  }

  // Tier 2: Projected Pace (45–104.9 Units / Years 2–3)
  if (stats.gradedUnits < HONORS_UNIT_MILESTONES.CANDIDATE_THRESHOLD) {
    const formattedUnits = stats.gradedUnits.toFixed(stats.gradedUnits % 1 === 0 ? 0 : 1);
    const paceLabel =
      raw.level === 'summa'
        ? 'Projected: Summa Pace'
        : raw.level === 'magna'
          ? 'Projected: Magna Pace'
          : raw.level === 'cum-laude'
            ? 'Projected: Cum Laude Pace'
            : 'Regular Degree Pace';

    return {
      level: raw.level,
      label: paceLabel,
      description: `Unofficial degree trajectory based on ${formattedUnits}/${HONORS_UNIT_MILESTONES.DEGREE_TOTAL_UNITS} units.`,
      tier: 'tier-2-projected',
      projectedHonor: raw.label,
      progressPercent,
      isLocked: false,
      requiredUnitsRemaining: Math.max(0, HONORS_UNIT_MILESTONES.DEGREE_TOTAL_UNITS - stats.gradedUnits),
    };
  }

  // Tier 3: Graduating Senior Candidate (≥ 105 Units / Year 4)
  const candidateLabel =
    raw.level === 'regular'
      ? 'Regular Degree Candidate'
      : `Candidate: ${raw.label}`;

  return {
    level: raw.level,
    label: candidateLabel,
    description: 'Pending final University Registrar residency & underload audit.',
    tier: 'tier-3-candidate',
    projectedHonor: raw.label,
    progressPercent,
    isLocked: false,
    requiredUnitsRemaining: Math.max(0, HONORS_UNIT_MILESTONES.DEGREE_TOTAL_UNITS - stats.gradedUnits),
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
// Midyear & Underload Policy Helpers (BU Student Handbook Art. VIII, X, XI)
// ---------------------------------------------------------------------------

/**
 * Checks whether a term is a Midyear or Summer term based on its title or explicit flag.
 * Under BU Student Handbook policies and CHED guidelines, Midyear/Summer terms
 * typically carry 3–9 units and are non-regular academic periods. They are NOT
 * classified as underloaded terms and do not disqualify students from Latin Honors.
 */
export function isMidyearTerm(title?: string, isExplicitMidyear?: boolean): boolean {
  if (isExplicitMidyear === true) return true;
  if (!title) return false;
  return /\b(?:midyear|summer)\b/i.test(title);
}

// ---------------------------------------------------------------------------
// Term Honor Standing (Per-Semester: President's / Dean's Lister)
// ---------------------------------------------------------------------------

/**
 * Evaluate per-semester honor standing.
 *
 * President's Lister: GPA ≤ 1.4500, NO subject > 1.75, full load (≥15 units), zero 5.0/INC
 * Dean's Lister:      GPA ≤ 1.7500, NO subject > 2.50, full load (≥15 units), zero 5.0/INC
 *
 * Disqualified if: underloaded, or any 5.0/INC grade present.
 */
export function evaluateTermHonor(
  semesterGPA: number,
  subjects: Subject[],
  hasUnderload: boolean,
  semesterTitle?: string,
  isExplicitMidyear?: boolean,
): TermHonorEvaluation {
  if (!subjects || subjects.length === 0) {
    return {
      level: 'none',
      label: 'Pending',
      reason: 'No courses recorded in this semester',
    };
  }

  let worstNumericGrade = -1;
  let hasDeficiency = false;
  let gradedUnits = 0;
  let activeCompletedUnits = 0;

  subjects.forEach((sub) => {
    const rawGrade = (sub.grade || '').trim().toUpperCase();
    const units = Math.max(0, parseFloat(String(sub.units)) || 0);

    if (rawGrade === 'DRP') return;

    activeCompletedUnits += units;

    const num = parseFloat(sub.grade);
    const isValidNumber = !isNaN(num) && num >= 1.0 && num <= 5.0;

    if (
      rawGrade === '5.0' ||
      rawGrade === '5.00' ||
      rawGrade === '4.0' ||
      rawGrade === '4.00' ||
      (isValidNumber && (num === 5.0 || num === 4.0)) ||
      rawGrade === 'INC'
    ) {
      hasDeficiency = true;
    }

    if (isValidNumber && units > 0) {
      gradedUnits += units;
      if (worstNumericGrade === -1 || num > worstNumericGrade) {
        worstNumericGrade = num;
      }
    }
  });

  // Zero-grade defense: If no valid grades are entered or GPA is zero, do not award honors
  if (gradedUnits === 0 || semesterGPA <= 0 || worstNumericGrade === -1) {
    return {
      level: 'none',
      label: 'Pending',
      reason: 'Awaiting course grade entries to evaluate term honors',
    };
  }

  const isMidyear = isMidyearTerm(semesterTitle, isExplicitMidyear);

  // Term honors (President's/Dean's Lister per Art. X) require:
  // - Regular semester (not midyear)
  // - Full regular academic load (>= 15 units)
  // - Not flagged as underloaded
  // - Zero deficiencies
  const isEligibleLoad = !hasUnderload && !isMidyear && activeCompletedUnits >= 15;

  if (!hasDeficiency && isEligibleLoad) {
    // President's Lister: GPA ≤ 1.4500 and no grade > 1.75
    if (semesterGPA <= 1.45 && worstNumericGrade <= 1.75) {
      return {
        level: 'president',
        label: "President's Lister",
        reason: `Semester GPA ${semesterGPA.toFixed(4)} with no grade above 1.75`,
      };
    }

    // Dean's Lister: GPA ≤ 1.7500 and no grade > 2.50
    if (semesterGPA <= 1.75 && worstNumericGrade <= 2.5) {
      return {
        level: 'dean',
        label: "Dean's Lister",
        reason: `Semester GPA ${semesterGPA.toFixed(4)} with no grade above 2.50`,
      };
    }
  }

  // Explicit user underload
  if (hasUnderload) {
    return {
      level: 'none',
      label: 'Underloaded Term',
      reason: 'Underloaded term disqualifies from academic honors per BU policy',
    };
  }

  // Midyear term
  if (isMidyear) {
    return {
      level: 'none',
      label: 'Midyear Term',
      reason: 'Midyear courses count toward cumulative GWA but are exempt from semestral honors (PL/DL)',
    };
  }

  if (hasDeficiency) {
    return {
      level: 'none',
      label: 'Not Eligible',
      reason: 'Disqualified due to 5.00 failure, 4.00 conditional, or unremoved INC mark',
    };
  }

  if (activeCompletedUnits < 15 && activeCompletedUnits > 0) {
    return {
      level: 'none',
      label: 'Regular Standing',
      reason: "Minimum 15 units required for President's or Dean's Lister qualification",
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
