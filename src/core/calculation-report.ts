import type { CumulativeStats, Semester, StandingLevel } from '../types';
import { isValidBUGrade } from './constants';
import { calculateCumulativeStats, isMidyearTerm, parseGrade } from './gwa-engine';
import { evaluateAcademicStanding, evaluateRawHonorBracket, evaluateTermHonor } from './honor-rules';
import { evaluateLatinProgress, type DegreeRequirements } from './latin-honors';

export type CalculationMode = 'gwa' | 'latin';

/** Academic evidence within this scope, without inferring an official enrollment decision. */
export interface ScopedAcademicStanding {
  level: StandingLevel | 'pending' | 'review';
  label: string;
  reason: string;
}

/** Selects calculation scope without mutating or discarding saved terms. */
export function selectCalculationTerms(semesters: Semester[], mode: CalculationMode, selectedId: string) {
  return mode === 'latin' ? semesters : semesters.filter(term => term.id === selectedId);
}

/** Finds invalid entries without modifying saved courses. */
export function validateCalculationEntries(terms: Semester[]) {
  const errors: string[] = [];
  for (const term of terms) {
    term.subjects.forEach((subject, index) => {
      if (subject.grade.trim() && !isValidBUGrade(subject.grade)) errors.push(`${term.title}, row ${index + 1}: enter a valid BU grade, INC or DRP.`);
      if (!Number.isFinite(subject.units) || subject.units < 0) errors.push(`${term.title}, row ${index + 1}: units must be a non-negative number.`);
    });
  }
  return errors;
}

function scopeStanding(terms: Semester[], stats: CumulativeStats, pending: number, hasErrors: boolean): ScopedAcademicStanding {
  if (hasErrors) return { level: 'review', label: 'Record needs review', reason: 'Correct invalid course entries before reviewing standing.' };
  if (!stats.gradedUnits || pending || terms.some(term => !term.subjects.length)) return {
    level: 'pending', label: 'Pending review', reason: 'Complete the record and resolve pending or INC grades before reviewing standing.',
  };
  const grades = terms.flatMap(term => term.subjects.map(subject => parseGrade(subject.grade)));
  const failures = grades.filter(grade => grade === 5).length;
  if (terms.length > 1 && (failures || grades.includes(4))) return {
    level: 'review', label: 'Record needs review', reason: 'Conditional or failing grades are present. Review each semester separately; cumulative counts do not establish current probation.',
  };
  if (grades.includes(4)) return { level: 'review', label: 'Conditional grade needs review', reason: 'A 4.00 conditional grade is recorded; resolve it with your college.' };
  if (failures) {
    const standing = evaluateAcademicStanding({ ...stats, failingCount: failures });
    return { level: standing.level, label: standing.label, reason: `${standing.description}. Semester advisory only; confirm restrictions with your college.` };
  }
  return { level: 'good', label: 'Good Academic Standing', reason: 'All entered active course grades are complete and passing; this is an unofficial academic estimate.' };
}

function latinRecordIssues(terms: Semester[], pending: number, emptyTerms: number, hasErrors: boolean) {
  const issues: string[] = [];
  if (hasErrors) issues.push('Correct invalid course entries.');
  if (pending || emptyTerms) issues.push('The record contains pending grades, INC, or empty semesters.');
  if (terms.some(term => term.subjects.some(subject => (parseGrade(subject.grade) ?? 0) > 3))) issues.push('A recorded grade exceeds the Latin honors subject limit of 3.00.');
  for (const term of terms) {
    if (isMidyearTerm(term.title, term.isMidyear)) continue;
    if (term.underload) issues.push(`${term.title}: underloaded term recorded.`);
    if (term.subjects.some(subject => subject.grade === 'DRP')) {
      issues.push(`${term.title}: verify prescribed load after dropped courses.`);
    }
  }
  return issues;
}

/** Adds handbook evidence to existing weighted math; never certifies graduation eligibility. */
export function buildCalculationReport(terms: Semester[], requirements?: DegreeRequirements) {
  const normalized = terms.map(term => ({ ...term, subjects: (term.subjects || []).map(subject => ({
    ...subject, grade: subject.grade.trim().toUpperCase(),
  })) }));
  const errors = validateCalculationEntries(normalized);
  const stats = calculateCumulativeStats(normalized);
  const pending = normalized.reduce((count, term) => count + term.subjects.filter(subject => !subject.grade || subject.grade === 'INC').length, 0);
  const emptyTerms = normalized.filter(term => term.subjects.length === 0).length;
  const raw = stats.gradedUnits > 0 ? evaluateRawHonorBracket(stats.cumulativeGWA, stats.weighted) : null;
  const signature = JSON.stringify([requirements, terms.map(({ id, title, subjects, underload, isMidyear }) =>
    ({ id, title, subjects, underload, isMidyear }))]);
  const term = normalized[0];
  const termHonor = normalized.length !== 1 ? null : evaluateTermHonor(stats.cumulativeGWA,
    term.subjects, !!term.underload, term.title, term.isMidyear, !!term.regularLoadConfirmed, stats.weighted);
  const latinIssues = latinRecordIssues(normalized, pending, emptyTerms, errors.length > 0);
  return { stats, pending, emptyTerms, errors, signature, termHonor,
    standing: scopeStanding(normalized, stats, pending, errors.length > 0),
    latinIssues,
    latin: evaluateLatinProgress({ terms: normalized, gradedUnits: stats.gradedUnits, issues: latinIssues, bracket: raw, requirements }),
    bracket: raw?.level === 'regular' ? 'Outside Latin honors GWA brackets' : raw?.label ?? null };
}
