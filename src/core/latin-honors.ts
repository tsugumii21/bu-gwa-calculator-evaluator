import type { Semester } from '../types';
import { HONOR_THRESHOLDS } from './constants';
import { isMidyearTerm, parseGrade } from './gwa-engine';
import { evaluateRawHonorBracket } from './honor-rules';

/** Student-entered targets from their own curriculum. Empty values are unset. */
export interface DegreeRequirements {
  regularSemesters: string;
  creditUnits: string;
}

export const MIN_CURRICULUM_SEMESTERS = 1;

export const LATIN_HONOR_RANGES = Object.values(HONOR_THRESHOLDS).map((rule, index, rules) => ({
  label: rule.label,
  range: `${rules[index - 1]?.maxGWA.toFixed(4) ?? '1.0000'} ${index === 0 ? '≤' : '<'} GWA ≤ ${rule.maxGWA.toFixed(4)}`,
}));

export function readDegreeTargets(requirements?: DegreeRequirements) {
  const semesters = Number(requirements?.regularSemesters);
  const units = Number(requirements?.creditUnits);
  return Number.isSafeInteger(semesters) && semesters >= MIN_CURRICULUM_SEMESTERS
    && Number.isFinite(units) && units > 0 ? { semesters, units } : null;
}

/** Optional targets must both be valid when either value is supplied. */
export function degreeTargetErrors(requirements?: DegreeRequirements) {
  if (!requirements?.regularSemesters.trim() && !requirements?.creditUnits.trim()) return { semesters: null, units: null };
  const semesters = Number(requirements?.regularSemesters);
  const units = Number(requirements?.creditUnits);
  return {
    semesters: Number.isSafeInteger(semesters) && semesters >= MIN_CURRICULUM_SEMESTERS ? null : 'Enter a positive whole number of regular semesters, or clear both targets.',
    units: Number.isFinite(units) && units > 0 ? null : 'Enter a positive degree-credit unit total, or clear both targets.',
  };
}

function countCompletedRegularSemesters(terms: Semester[]) {
  const completed = terms.filter(term =>
    !isMidyearTerm(term.title, term.isMidyear)
    && term.subjects.every(subject => subject.grade === 'DRP' || parseGrade(subject.grade) !== null)
    && term.subjects.some(subject => subject.units > 0 && parseGrade(subject.grade) !== null),
  );
  return new Set(completed.map(term => term.id)).size;
}

/** Describes entered coverage independently of the numerical range; only BU verifies eligibility. */
export function evaluateLatinProgress({
  terms, gradedUnits, issues, bracket, requirements,
}: {
  terms: Semester[];
  gradedUnits: number;
  issues: string[];
  bracket: ReturnType<typeof evaluateRawHonorBracket> | null;
  requirements?: DegreeRequirements;
}) {
  const completed = countCompletedRegularSemesters(terms);
  const targets = readDegreeTargets(requirements);
  const coverage = { completedSemesters: completed, targets };
  if (issues.length) return { ...coverage, stage: 'review', label: 'Requirements need review', note: issues[0] } as const;
  if (!bracket || bracket.level === 'pending') return {
    ...coverage, stage: 'pending', label: 'No numeric average yet', note: 'Enter a valid numeric grade with positive credit units.',
  } as const;
  const targetErrors = degreeTargetErrors(requirements);
  if (targetErrors.semesters || targetErrors.units) return {
    ...coverage, stage: 'review', label: 'Curriculum targets need review', note: targetErrors.semesters ?? targetErrors.units!,
  } as const;
  if (!targets) return { ...coverage, stage: 'progress', label: 'Degree coverage not confirmed',
    note: 'Add optional curriculum targets to compare entered coverage. BU must verify degree completion.',
  } as const;
  if (completed >= targets.semesters && gradedUnits >= targets.units) return {
    ...coverage, stage: 'targets-met', label: 'Entered targets reached',
    note: 'BU must still verify credited courses, prescribed loads, residence and degree completion. Target totals do not establish eligibility.',
  } as const;
  return { ...coverage, stage: 'progress', label: 'Partial record',
    note: `${completed}/${targets.semesters} regular semesters with grades · ${gradedUnits}/${targets.units} graded units. These entered totals do not verify curriculum completion.`,
  } as const;
}
