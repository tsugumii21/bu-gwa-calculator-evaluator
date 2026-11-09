import type { Subject } from '../types';
import { ScanFailure, type ScanCandidate } from '../types/scan';
import { isValidBUGrade } from './constants';

/** Returns the next issue that must be resolved before importing staged observations. */
export function scanImportError(rows: ScanCandidate[]): string | null {
  if (!rows.length) return 'No detected courses to import.';
  for (const [index, row] of rows.entries()) {
    const prefix = `Course ${index + 1}: `;
    if (row.conflicts && Object.keys(row.conflicts).length) return prefix + 'resolve the conflicting source values.';
    if (!row.code.trim() || !row.name.trim()) return prefix + 'enter the code and description.';
    if (row.units === null || !Number.isFinite(row.units) || row.units < 0) return prefix + 'enter valid units.';
    if (row.grade && !isValidBUGrade(row.grade)) return prefix + 'enter a valid BU grade, INC, DRP, or leave pending.';
  }
  return null;
}

/** Converts only resolved candidates into the existing saved-record contract. */
export function reviewedSubjects(rows: ScanCandidate[]): Subject[] {
  const error = scanImportError(rows);
  if (error) throw new ScanFailure('invalid', error);
  return rows.map(row => ({ code: row.code.trim(), name: row.name.trim(), units: row.units!, grade: row.grade.trim().toUpperCase() }));
}

const key = (text: string) => text.toUpperCase().replace(/\s+/g, '').trim();

const comparableGrade = (grade: string) => isValidBUGrade(grade) && Number.isFinite(Number(grade))
  ? String(Number(grade)) : key(grade);

function mergeField(row: ScanCandidate, incoming: ScanCandidate, field: 'grade' | 'units' | 'name') {
  const previous = row[field];
  const next = incoming[field];
  if (next === null || next === '') return;
  if (previous === null || previous === '') {
    Object.assign(row, { [field]: next });
    return;
  }
  const normalize = field === 'grade' ? comparableGrade : key;
  const same = normalize(String(previous)) === normalize(String(next));
  if (same && !row.conflicts?.[field]) return;
  row.conflicts ??= {};
  const values = row.conflicts[field] ?? [{ value: String(previous), sourceIds: [...row.sourceIds] }];
  const existing = values.find(option => normalize(option.value) === normalize(String(next)));
  if (existing) existing.sourceIds = [...new Set([...existing.sourceIds, ...incoming.sourceIds])];
  else values.push({ value: String(next), sourceIds: [...incoming.sourceIds] });
  row.conflicts[field] = values;
}

/** Merge only within one caller-supplied semester; retain conflicting values for review. */
export function mergeScanCandidates(rows: ScanCandidate[]): ScanCandidate[] {
  const result: ScanCandidate[] = [];
  for (const row of rows) {
    const existing = result.find(item => row.code && key(item.code) === key(row.code));
    if (!existing) { result.push({ ...row, issues: [...row.issues], sourceIds: [...row.sourceIds], conflicts: row.conflicts ? structuredClone(row.conflicts) : undefined }); continue; }
    for (const field of ['grade', 'units', 'name'] as const) mergeField(existing, row, field);
    existing.sourceIds = [...new Set([...existing.sourceIds, ...row.sourceIds])];
    existing.issues = [...new Set([...existing.issues, ...row.issues])];
    if (existing.conflicts) {
      const issue = 'Conflicting source values. Compare the source images.';
      if (!existing.issues.includes(issue)) existing.issues.push(issue);
      existing.reviewed = false;
    }
  }
  return result;
}
