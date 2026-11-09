// Bicol University GWA Calculator — Honor & Standing Evaluation Rules
// (Based on BU Student Handbook BOR Res. 89 s. 2006)

import type {
  CumulativeStats,
  HonorEvaluation,
  HonorLevel,
  StandingEvaluation,
  Subject,
  TermHonorEvaluation,
  WeightedGradeTotals,
} from '../types';
import { HONOR_THRESHOLDS, HONORS_UNIT_MILESTONES, TERM_HONOR_THRESHOLDS, isValidBUGrade } from './constants';
import { calculateWeightedGrades, compareWeightedCutoff, isMidyearTerm, parseGrade, weightedAverage } from './gwa-engine';

export { isMidyearTerm } from './gwa-engine';

function meetsCutoff(gwa: number, cutoff: number, weighted?: WeightedGradeTotals): boolean {
  if (!weighted) return gwa <= cutoff;
  const comparison = compareWeightedCutoff(weighted.points, weighted.unitTicks, BigInt(Math.round(cutoff * 100)));
  return comparison !== null && comparison <= 0;
}

// ---------------------------------------------------------------------------
// Cumulative Honor Standing (Graduation Honors — 3-Tier Progressive Blueprint)
// ---------------------------------------------------------------------------

/**
 * Pure mathematical evaluation of honor bracket based on cumulative GWA.
 * Summa: ≤ 1.2500, Magna: ≤ 1.4500, Cum Laude: ≤ 1.7500.
 */
export function evaluateRawHonorBracket(gwa: number, weighted?: WeightedGradeTotals): { level: HonorLevel; label: string } {
  if (!Number.isFinite(gwa) || gwa < 1) return { level: 'pending', label: 'Pending Evaluation' };
  if (meetsCutoff(gwa, HONOR_THRESHOLDS.SUMMA.maxGWA, weighted)) {
    return { level: 'summa', label: HONOR_THRESHOLDS.SUMMA.label };
  }
  if (meetsCutoff(gwa, HONOR_THRESHOLDS.MAGNA.maxGWA, weighted)) {
    return { level: 'magna', label: HONOR_THRESHOLDS.MAGNA.label };
  }
  if (meetsCutoff(gwa, HONOR_THRESHOLDS.CUM.maxGWA, weighted)) {
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

  const raw = evaluateRawHonorBracket(stats.cumulativeGWA, stats.weighted);
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
// Term Honor Standing (Per-Semester: President's / Dean's Lister)
// ---------------------------------------------------------------------------

/** Checks all recorded grades, including zero-unit subjects, against the handbook. */
function termCourseEvidence(subjects: Subject[]) {
  const active = subjects.filter(subject => subject.grade.trim().toUpperCase() !== 'DRP');
  const numeric = active.map(subject => parseGrade(subject.grade) ?? 0);
  return {
    worstGrade: Math.max(0, ...numeric),
    hasPending: active.some(subject => !subject.grade.trim() || subject.grade.trim().toUpperCase() === 'INC'),
    hasInvalid: subjects.some(subject => !Number.isFinite(subject.units) || subject.units < 0
      || (!!subject.grade.trim() && !isValidBUGrade(subject.grade))),
    hasWeightedGrade: active.some(subject => parseGrade(subject.grade) !== null && Number.isFinite(subject.units) && subject.units > 0),
  };
}

function termHonorBlocker(evidence: ReturnType<typeof termCourseEvidence>, hasUnderload: boolean): TermHonorEvaluation | null {
  const none = (label: string, reason: string): TermHonorEvaluation => ({ level: 'none', label, reason });
  if (evidence.worstGrade > 3) return none('Not Eligible', `A ${evidence.worstGrade.toFixed(2)} conditional or failing grade needs review.`);
  const cap = TERM_HONOR_THRESHOLDS.PRESIDENT.maxSubjectGrade;
  const gradeReason = evidence.worstGrade > cap
    ? `A recorded grade of ${evidence.worstGrade.toFixed(2)} exceeds the PL/DL subject cap of ${cap.toFixed(2)}.` : '';
  const loadReason = hasUnderload ? 'An underloaded term does not meet the regular curriculum load requirement for PL/DL.'
    : '';
  const reasons = [gradeReason, loadReason];
  if (evidence.hasInvalid || evidence.hasPending) reasons.push('Complete valid course entries and resolve any INC grades.');
  if (evidence.hasInvalid || evidence.hasPending) {
    return none('Provisional', reasons.filter(Boolean).join(' '));
  }
  return gradeReason || hasUnderload ? none('Good Academic Standing', reasons.filter(Boolean).join(' ')) : null;
}

/**
 * 2019 handbook, printed p.32/PDF p.42: PL [1,1.45], DL (1.45,1.75], all grades <=2.4.
 * The app reserves term distinctions for regular semesters and does not infer curriculum load from a unit count.
 */
export function evaluateTermHonor(
  semesterGPA: number,
  subjects: Subject[],
  hasUnderload: boolean,
  _semesterTitle?: string,
  _isExplicitMidyear?: boolean,
  _regularLoadConfirmed = false,
  weighted?: WeightedGradeTotals,
): TermHonorEvaluation {
  const evidence = termCourseEvidence(subjects || []);
  if (!evidence.hasWeightedGrade || !Number.isFinite(semesterGPA) || semesterGPA < 1) {
    return { level: 'none', label: 'Pending', reason: 'Awaiting valid numeric course grades with positive units.' };
  }
  if (isMidyearTerm(_semesterTitle, _isExplicitMidyear)) {
    return { level: 'none', label: 'Midyear Term', reason: 'This calculator shows term distinctions for regular semesters.' };
  }
  const blocker = termHonorBlocker(evidence, hasUnderload);
  if (blocker) return blocker;
  if (meetsCutoff(semesterGPA, TERM_HONOR_THRESHOLDS.PRESIDENT.maxGPA, weighted)) return {
    level: 'president', label: TERM_HONOR_THRESHOLDS.PRESIDENT.label,
    reason: 'PL average and subject-grade criteria met. Explicit underload flags are evaluated separately.',
  };
  if (meetsCutoff(semesterGPA, TERM_HONOR_THRESHOLDS.DEAN.maxGPA, weighted)) return {
    level: 'dean', label: TERM_HONOR_THRESHOLDS.DEAN.label,
    reason: 'DL average and subject-grade criteria met. Explicit underload flags are evaluated separately.',
  };
  return { level: 'none', label: 'Good Academic Standing', reason: 'The semester GWA is outside the PL/DL range (1.0000–1.7500).' };
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
  regularLoadConfirmed = false,
): TermHonorEvaluation {
  const weighted = calculateWeightedGrades(subjects || []);
  return evaluateTermHonor(weightedAverage(weighted), subjects, hasUnderload, undefined, undefined, regularLoadConfirmed, weighted);
}

/**
 * Alias for evaluating Latin graduation honors.
 */
export const evaluateLatinHonors = evaluateHonorStanding;
