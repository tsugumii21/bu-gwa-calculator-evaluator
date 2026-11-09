import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Semester } from '../../types';

vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
const { useSemesterStore } = await import('../index');
const term = (): Semester => ({ id: 'synthetic', title: 'Year 1 - 1st Semester', computed: true,
  underload: false, regularLoadConfirmed: true, subjects: [{ code: 'TEST', name: 'Synthetic', grade: '1.2', units: 3 }] });
const current = () => useSemesterStore.getState().semesters[0];

beforeEach(() => useSemesterStore.setState({ semesters: [term()] }));

describe('curriculum load evidence', () => {
  it('invalidates a computed grade but retains load confirmation after a numeric grade edit', () => {
    useSemesterStore.getState().updateSubject('synthetic', 0, { grade: '1.4' });
    expect({ computed: current().computed, load: current().regularLoadConfirmed }).toEqual({ computed: false, load: true });
  });
  it.each([{ code: 'NEW' }, { units: 4 }, { grade: 'DRP' }])('clears load confirmation for a curriculum change %j', updates => {
    useSemesterStore.getState().updateSubject('synthetic', 0, updates);
    expect(current().regularLoadConfirmed).toBe(false);
  });
  it('requires confirmation again after a dropped subject is reinstated', () => {
    useSemesterStore.setState({ semesters: [{ ...term(), subjects: [{ ...term().subjects[0], grade: 'DRP' }] }] });
    useSemesterStore.getState().updateSubject('synthetic', 0, { grade: '1.2' });
    expect(current().regularLoadConfirmed).toBe(false);
  });
  it('clears confirmation after adding a subject', () => {
    useSemesterStore.getState().addSubject('synthetic', { code: 'NEW', name: 'Synthetic', grade: '', units: 3 });
    expect(current().regularLoadConfirmed).toBe(false);
  });
  it('clears confirmation after removing a subject', () => {
    useSemesterStore.getState().removeSubject('synthetic', 0);
    expect(current().regularLoadConfirmed).toBe(false);
  });
  it.each([{ title: 'Year 1 - 2nd Semester' }, { isMidyear: true }, { underload: true }])('clears confirmation after a term change %j', updates => {
    useSemesterStore.getState().updateSemester('synthetic', updates);
    expect(current().regularLoadConfirmed).toBe(false);
  });
  it('does not permit underload and confirmed regular load together', () => {
    useSemesterStore.getState().updateSemester('synthetic', { underload: true, regularLoadConfirmed: true });
    expect({ underload: current().underload, load: current().regularLoadConfirmed }).toEqual({ underload: true, load: false });
  });
  it('stores explicit confirmation and invalidates the existing result', () => {
    useSemesterStore.setState({ semesters: [{ ...term(), regularLoadConfirmed: undefined }] });
    useSemesterStore.getState().updateSemester('synthetic', { regularLoadConfirmed: true });
    expect({ computed: current().computed, load: current().regularLoadConfirmed }).toEqual({ computed: false, load: true });
  });
  it('starts imported records unconfirmed without changing their grades', () => {
    useSemesterStore.getState().importSemesters([{ ...term(), id: 'imported' }]);
    const imported = useSemesterStore.getState().semesters[1];
    expect({ computed: imported.computed, load: imported.regularLoadConfirmed, subjects: imported.subjects }).toEqual({
      computed: false, load: false, subjects: term().subjects,
    });
  });
  it('keeps older stored subjects when load evidence is absent', () => {
    useSemesterStore.setState({ semesters: [{ ...term(), regularLoadConfirmed: undefined }] });
    expect({ load: current().regularLoadConfirmed, subjects: current().subjects }).toEqual({ load: undefined, subjects: term().subjects });
  });
});
