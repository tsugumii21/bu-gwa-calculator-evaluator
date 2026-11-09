import { describe, expect, it } from 'vitest';
import { projectGWA } from '../simulation';

describe('hypothetical GWA', () => {
  it('weights the scenario by units', () => expect(projectGWA(30, 20, 10, 2)).toBeCloseTo(50 / 30));
  it('keeps the baseline when future units are zero', () => expect(projectGWA(30, 20, 0, 2)).toBe(1.5));
  it('does not invent a zero GWA for an empty scenario', () => expect(projectGWA(0, 0, 0, 1.5)).toBeNull());
  it('supports a scenario without a baseline', () => expect(projectGWA(0, 0, 21, 1.55)).toBeCloseTo(1.55));
  it('rejects invalid scenario data', () => expect([projectGWA(0, 0, -1, 2), projectGWA(0, 0, 3, NaN)]).toEqual([null, null]));
});
