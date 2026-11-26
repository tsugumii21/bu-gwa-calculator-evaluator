import { describe, expect, it } from 'vitest';
import { emptyScenario } from '../../core/scenario-planner';
import { createSimulatorStore, SIMULATOR_STORAGE_KEY } from '../simulator-store';

function memoryStorage(initial?: string) {
  const entries = new Map<string, string>(initial ? [[SIMULATOR_STORAGE_KEY, initial]] : []);
  return { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => { entries.set(key, value); }, entries };
}

describe('separate simulator drafts', () => {
  it('retains a draft across a new store session', () => {
    const storage = memoryStorage();
    const first = createSimulatorStore(storage);
    first.getState().replaceDraft({ ...emptyScenario('semester'), units: '21', average: '1.4' });
    expect(createSimulatorStore(storage).getState().drafts.semester.average).toBe('1.4');
  });
  it('keeps semester and degree plans separate', () => {
    const state = createSimulatorStore(memoryStorage());
    state.getState().replaceDraft({ ...emptyScenario('semester'), units: '21' });
    state.getState().chooseHorizon('degree');
    expect(state.getState().drafts.degree.units).toBe('');
  });
  it('resets only the selected scenario', () => {
    const state = createSimulatorStore(memoryStorage());
    state.getState().replaceDraft({ ...emptyScenario('semester'), units: '21' });
    state.getState().replaceDraft({ ...emptyScenario('degree'), units: '60' });
    state.getState().resetDraft();
    expect([state.getState().drafts.semester.units, state.getState().drafts.degree.units]).toEqual(['', '60']);
  });
  it.each(['broken json', '{"version":1,"drafts":{}}', '{"version":2}'])('recovers malformed saved plans: %s', raw => {
    expect(createSimulatorStore(memoryStorage(raw)).getState().storageMessage).toContain('could not be read');
  });
  it('keeps an in-memory draft when storage write fails', () => {
    const state = createSimulatorStore({ getItem: () => null, setItem: () => { throw new Error('Quota'); } });
    state.getState().replaceDraft({ ...emptyScenario('semester'), units: '21' });
    expect([state.getState().drafts.semester.units, !!state.getState().storageMessage]).toEqual(['21', true]);
  });
  it('reports blocked storage reads', () => {
    const state = createSimulatorStore({ getItem: () => { throw new Error('Blocked'); }, setItem: () => undefined });
    expect(state.getState().storageMessage).toContain('could not be read');
  });
  it('writes only the independent scenario key', () => {
    const storage = memoryStorage();
    createSimulatorStore(storage).getState().replaceDraft({ ...emptyScenario('semester'), units: '21' });
    expect([...storage.entries.keys()]).toEqual([SIMULATOR_STORAGE_KEY]);
  });
});
