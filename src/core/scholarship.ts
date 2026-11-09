import type { Semester } from '../types';
import { buildCalculationReport } from './calculation-report';

export interface ScholarshipRequirements {
  preset: string;
  maxGWA: string;
  lowestGrade: string;
  noInc: boolean;
  noFail: boolean;
  confirmed: boolean;
}
export const DEFAULT_SCHOLARSHIP_REQUIREMENTS: ScholarshipRequirements = {
  preset: '', maxGWA: '2.5', lowestGrade: '3', noInc: true, noFail: true, confirmed: false,
};
export type RequirementState = 'met' | 'unmet' | 'unknown' | 'not-required';
const MIN_GRADE = 1;
const MAX_GRADE = 5;

/** Compares entered criteria with saved evidence without certifying an award. */
export function evaluateScholarship(semesters: Semester[], requirements: ScholarshipRequirements) {
  const report = buildCalculationReport(semesters);
  const caps = [Number(requirements.maxGWA), Number(requirements.lowestGrade)];
  const invalidRequirements = caps.some(value => !Number.isFinite(value) || value < MIN_GRADE || value > MAX_GRADE);
  const grades = semesters.flatMap(term => term.subjects).map(subject => Number(subject.grade)).filter(grade => grade >= MIN_GRADE && grade <= MAX_GRADE);
  const worstGrade = grades.length ? Math.max(...grades) : null;
  const hasEvidence = report.stats.gradedUnits > 0;
  const isIncomplete = !hasEvidence || report.pending > 0 || report.emptyTerms > 0;
  const compare = (failed: boolean): RequirementState => failed ? 'unmet' : isIncomplete ? 'unknown' : 'met';
  const checks: RequirementState[] = [
    compare(hasEvidence && report.stats.cumulativeGWA > caps[0]),
    compare(worstGrade !== null && worstGrade > caps[1]),
    requirements.noInc ? compare(report.stats.hasInc) : 'not-required',
    requirements.noFail ? compare(report.stats.hasFailingGrade) : 'not-required',
  ];
  const state: 'unconfigured' | 'invalid' | 'unmet' | 'incomplete' | 'met' = !requirements.confirmed ? 'unconfigured' : invalidRequirements || report.errors.length ? 'invalid' : checks.includes('unmet') ? 'unmet' : isIncomplete ? 'incomplete' : 'met';
  return { ...report, checks, state, worstGrade, invalidRequirements };
}
