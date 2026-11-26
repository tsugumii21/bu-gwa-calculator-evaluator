import { describe, expect, it } from 'vitest';

import { courseNameWarning, mergeScanCandidates, replaceRetriedCandidates, reviewedSubjects, scanImportError } from '../scan-results';
import type { ScanCandidate, ScanImageResult } from '../../types/scan';

const candidate = (patch: Partial<ScanCandidate> = {}): ScanCandidate => ({
  id: 'a:0', code: 'TEST 101', name: 'Example course', units: 0, grade: '1.0',
  issues: [], sourceIds: ['a'], reviewed: false, ...patch,
});

describe('Scan review safety', () => {
  it('keeps completed overlapping evidence and unrelated edits when one image retry fails', () => {
    const first = candidate({ sourceIds: ['a:0'], grade: '1.5' });
    const second = candidate({ sourceIds: ['a:1'], grade: '1.5' });
    const edited = candidate({ id: 'other', code: 'TEST 102', name: 'Edited name', sourceIds: ['a:2'] });
    const outcome = (sourceId: string, candidates: ScanCandidate[]) => ({ sourceId, candidates } as ScanImageResult);
    const rows = mergeScanCandidates([first, second, edited]);

    const replaced = replaceRetriedCandidates(rows, [outcome('a:0', [first]), outcome('a:1', [second])], [outcome('a:0', [])], ['a:0']);

    expect(replaced.map(row => [row.code, row.name, row.sourceIds])).toEqual([
      ['TEST 102', 'Edited name', ['a:2']], ['TEST 101', 'Example course', ['a:1']],
    ]);
  });
  it('exposes conflicts between a retry and completed evidence instead of silently replacing grades', () => {
    const completed = candidate({ sourceIds: ['a:1'], grade: '1.5' });
    const incoming = candidate({ sourceIds: ['a:0'], grade: '2.0' });
    const previous = { sourceId: 'a:1', candidates: [completed] } as ScanImageResult;
    const merged = candidate({ sourceIds: ['a:0', 'a:1'], grade: '1.5' });

    const replaced = replaceRetriedCandidates([merged], [previous], [{ sourceId: 'a:0', candidates: [incoming] } as ScanImageResult], ['a:0']);

    expect(replaced[0].conflicts?.grade?.map(option => option.value)).toEqual(['1.5', '2.0']);
  });
  it('warns about a numeric course name without converting it into a grade', () => {
    const row = candidate({ name: '2.0', grade: '' });
    expect({ warning: courseNameWarning(row.name), grade: reviewedSubjects([row])[0].grade })
      .toEqual({ warning: 'Course name looks numeric. Compare it with the source image.', grade: '' });
  });
  it('keeps conflicting observations flagged without silently preferring a higher grade', () => {
    const merged = mergeScanCandidates([candidate(), candidate({ id: 'b:0', grade: '2.0', sourceIds: ['b'] })]);
    expect(merged[0].issues.some(issue => issue.includes('Conflicting'))).toBe(true);
    expect(merged[0].grade).toBe('1.0');
    expect(merged[0].conflicts?.grade?.map(choice => choice.value)).toEqual(['1.0', '2.0']);
    expect(scanImportError(merged)).toContain('conflicting');
  });
  it('merges missing fields without treating equivalent numeric spellings as conflicts', () => {
    const merged = mergeScanCandidates([candidate({ grade: '1.00', units: null }), candidate({ grade: '1.0', units: 3 })]);
    expect([merged[0].units, scanImportError(merged)]).toEqual([3, null]);
  });
  it('does not merge different codes sharing the same course title', () => {
    expect(mergeScanCandidates([candidate(), candidate({ id: 'b:0', code: 'TEST 102' })])).toHaveLength(2);
  });
  it('preserves legitimate zero units and pending grades without a checkbox', () => {
    expect(scanImportError([candidate({ grade: '', reviewed: false })])).toBeNull();
  });
  it('rejects unresolved units even after acknowledgment', () => {
    expect(scanImportError([candidate({ units: null, reviewed: true })])).toContain('units');
  });
  it('imports acknowledged recovered rows without copying OCR diagnostics into saved subjects', () => {
    const row = candidate({ issues: ['Recovered from image; check source.'], reviewed: true });

    const subjects = reviewedSubjects([row]);

    expect(subjects).toEqual([{ code: 'TEST 101', name: 'Example course', units: 0, grade: '1.0' }]);
  });
  it('allows the final import action to confirm valid uncertain rows', () => {
    const row = candidate({ issues: ['Recovered from image; check source.'] });

    const importUncheckedRow = () => reviewedSubjects([row]);

    expect(importUncheckedRow()).toEqual([{ code: 'TEST 101', name: 'Example course', units: 0, grade: '1.0' }]);
  });
  it('still rejects invalid grades after removing the acknowledgement gate', () => {
    expect(scanImportError([candidate({ grade: '99' })])).toContain('valid BU grade');
  });
});
