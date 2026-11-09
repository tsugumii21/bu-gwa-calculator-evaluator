import { describe, expect, it } from 'vitest';
import { evaluateScholarship, DEFAULT_SCHOLARSHIP_REQUIREMENTS } from '../scholarship';
import type { Semester } from '../../types';
const requirements = { ...DEFAULT_SCHOLARSHIP_REQUIREMENTS, confirmed: true };
const term = (grades: string[]): Semester[] => [{ id: 'test', title: 'Test', underload: false, computed: false, subjects: grades.map(grade => ({ code: '', name: '', grade, units: 3 })) }];
describe('scholarship requirement comparison', () => {
  it('does not assess unconfirmed requirements', () => expect(evaluateScholarship(term(['1.0']), DEFAULT_SCHOLARSHIP_REQUIREMENTS).state).toBe('unconfigured'));
  it('keeps an empty record unknown', () => expect(evaluateScholarship([], requirements).state).toBe('incomplete'));
  it('keeps partial grades incomplete', () => expect(evaluateScholarship(term(['1.0', '']), requirements).checks[0]).toBe('unknown'));
  it('reports an observed unmet criterion even with missing grades', () => expect(evaluateScholarship(term(['5.0', '']), requirements).state).toBe('unmet'));
  it('checks INC without requiring numeric grades', () => expect(evaluateScholarship(term(['INC']), requirements).checks[2]).toBe('unmet'));
  it('allows a disabled INC requirement', () => expect(evaluateScholarship(term(['INC']), { ...requirements, noInc: false }).checks[2]).toBe('not-required'));
  it('compares all complete entered academic criteria', () => expect(evaluateScholarship(term(['1.5', '2.0']), requirements).state).toBe('met'));
  it('rejects impossible requirement limits', () => expect(evaluateScholarship(term(['1.0']), { ...requirements, maxGWA: '0' }).state).toBe('invalid'));
  it('rejects malformed grade evidence', () => expect(evaluateScholarship(term(['1abc']), requirements).state).toBe('invalid'));
  it('recognizes a conditional mark as an existing engine deficiency', () => expect(evaluateScholarship(term(['4.0']), requirements).checks[3]).toBe('unmet'));
});
