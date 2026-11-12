import type { Semester } from '../types';
import { HONOR_THRESHOLDS } from './constants';
import { isMidyearTerm, parseGrade } from './gwa-engine';
import { evaluateRawHonorBracket } from './honor-rules';

/** Student-entered targets from their own curriculum. Empty values are unset. */
export interface DegreeRequirements {
  regularSemesters: string;
  creditUnits: string;
}

export const LATIN_ELIGIBILITY_SEMESTERS = 6;

export const LATIN_HONOR_RANGES = Object.values(HONOR_THRESHOLDS).map((rule, index, rules) => ({
  label: rule.label,
  range: `${rules[index - 1]?.maxGWA.toFixed(4) ?? '1.0000'} ${index === 0 ? '≤' : '<'} GWA ≤ ${rule.maxGWA.toFixed(4)}`,
}));

export function readDegreeTargets(requirements?: DegreeRequirements) {
  const semesters = Number(requirements?.regularSemesters);
  const units = Number(requirements?.creditUnits);
  return Number.isSafeInteger(semesters) && semesters >= LATIN_ELIGIBILITY_SEMESTERS
    && Number.isFinite(units) && units > 0 ? { semesters, units } : null;
}

function countCompletedRegularSemesters(terms: Semester[]) {
  const completed = terms.filter(term =>
    !isMidyearTerm(term.title, term.isMidyear)
    && term.subjects.every(subject => subject.grade === 'DRP' || parseGrade(subject.grade) !== null)
    && term.subjects.some(subject => subject.units > 0 && parseGrade(subject.grade) !== null),
  );
  return new Set(completed.map(term => term.id)).size;
}

/** Estimates progress from the saved record. Residence and curriculum credit are verified by BU. */
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
  if (completed < LATIN_ELIGIBILITY_SEMESTERS) {
    const units = targets ? `${gradedUnits} of ${targets.units} curriculum units graded` : `${gradedUnits} graded units entered`;
    return { stage: 'progress', label: 'More grades and units needed',
      note: `${completed} of ${LATIN_ELIGIBILITY_SEMESTERS} regular semesters complete · ${units}. Add the remaining grades and units to see a possible honor.` } as const;
  }
  if (issues.length || !bracket || bracket.level === 'pending') {
    return { stage: 'review', label: 'Eligibility needs review', note: issues[0] ?? 'Complete your graded record.' } as const;
  }
  if (bracket.level === 'regular') {
    return { stage: 'outside', label: 'Outside Latin honors range', note: 'The cumulative GWA is above 1.7500.' } as const;
  }
  if (targets && completed >= targets.semesters && gradedUnits >= targets.units) {
    return { stage: 'estimate', label: bracket.label, note: 'Unofficial graduation estimate. Await official BU results.' } as const;
  }
  const progress = targets
    ? `${completed}/${targets.semesters} regular semesters · ${gradedUnits}/${targets.units} graded units.`
    : 'Set your curriculum targets in Review record.';
  return { stage: 'eligible', label: `Possible ${bracket.label}`, note: `Unofficial projection · ${progress}` } as const;
}
