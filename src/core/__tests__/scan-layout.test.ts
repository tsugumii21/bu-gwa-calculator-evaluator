import { describe, expect, it } from 'vitest';

import { extractTableRows } from '../scan-layout';
import type { ScanWord } from '../../types/scan';

const word = (text: string, x0: number, y0: number): ScanWord => ({
  text, confidence: 95, bbox: { x0, y0, x1: x0 + 35, y1: y0 + 16 },
});
const headers = [word('Code', 20, 10), word('Course', 140, 10), word('Units', 500, 10),
  word('Lec', 580, 10), word('Units', 620, 10), word('Lab', 700, 10), word('Units', 740, 10), word('Grade', 820, 10), word('Remarks', 930, 10)];
const row = [word('TEST', 20, 60), word('101', 70, 60), word('Topic', 140, 60), word('2', 200, 60),
  word('1.0', 500, 60), word('1.0', 580, 60), word('0.0', 700, 60), word('2.4', 820, 60)];

describe('Geometric screenshot extraction', () => {
  it('keeps mobile card values explicit and coverage uncertain', () => {
    const result = extractTableRows([word('TEST101', 20, 10), word('Example', 20, 35),
      word('Units:', 20, 60), word('0', 80, 60), word('Grade:', 20, 85), word('INC', 80, 85)], 'card');
    expect(result.candidates.map(row => [row.code, row.name, row.units, row.grade])).toEqual([['TEST 101', 'Example', 0, 'INC']]);
    expect(result.expectedRows).toBeNull();
  });
  it('keeps title numbers and lecture/lab values out of the grade column', () => {
    const result = extractTableRows([...headers, ...row], 'image-a');
    expect(result.candidates.map(({ code, name, units, grade }) => ({ code, name, units, grade })))
      .toEqual([{ code: 'TEST 101', name: 'Topic 2', units: 1, grade: '2.4' }]);
  });
  it('retains an unreadable row instead of silently dropping it', () => {
    const result = extractTableRows([...headers, ...row], 'image-a', [40, 90, 140]);
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[1].issues.length).toBeGreaterThan(0);
  });
  it('preserves unknown units and grades rather than substituting a lab grade', () => {
    const result = extractTableRows([...headers, ...row.filter(w => ![500, 820].includes(w.bbox.x0))], 'image-a');
    expect([result.candidates[0].units, result.candidates[0].grade]).toEqual([null, '']);
  });
  it('uses coordinates relative to each differently sized screenshot', () => {
    const shifted = [...headers, ...row].map(w => ({ ...w, bbox: {
      x0: w.bbox.x0 * .75 + 200, x1: w.bbox.x1 * .75 + 200,
      y0: w.bbox.y0 * .75 + 300, y1: w.bbox.y1 * .75 + 300,
    } }));
    expect(extractTableRows(shifted, 'image-b').candidates[0].grade).toBe('2.4');
  });
});
