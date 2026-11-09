import { describe, expect, it } from 'vitest';

import { mergeScanCandidates, reviewedSubjects, scanImportError } from '../scan-results';
import type { ScanCandidate } from '../../types/scan';

const candidate = (patch: Partial<ScanCandidate> = {}): ScanCandidate => ({
  id: 'a:0', code: 'TEST 101', name: 'Example course', units: 0, grade: '1.0',
  issues: [], sourceIds: ['a'], reviewed: false, ...patch,
});

describe('Scan review safety', () => {
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
