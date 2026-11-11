import { beforeEach, describe, expect, it, vi } from 'vitest';

function storage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
}

beforeEach(() => { vi.resetModules(); vi.unstubAllGlobals(); });

describe('computation scene selection', () => {
  it('plays all five scenes per cycle without repeating at cycle boundaries', async () => {
    vi.stubGlobal('sessionStorage', storage());
    const { getRandomAnimation } = await import('../animations');
    const scenes = Array.from({ length: 20 }, () => getRandomAnimation('compute').id);
    expect([0, 5, 10, 15].every(start => new Set(scenes.slice(start, start + 5)).size === 5)
      && scenes.every((scene, index) => index === 0 || scene !== scenes[index - 1])).toBe(true);
  });

  it('discards duplicate or fractional persisted bag indices', async () => {
    vi.stubGlobal('sessionStorage', storage({ bu_lottie_bag_compute: '[1,1,0.5]' }));
    const { getRandomAnimation } = await import('../animations');
    const scenes = Array.from({ length: 5 }, () => getRandomAnimation('compute')?.id);
    expect(scenes.every(Boolean) && new Set(scenes).size === 5).toBe(true);
  });

  it('keeps the same cycle guarantee when browser storage is unavailable', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => { throw new Error('Storage blocked'); }, setItem: () => { throw new Error('Storage blocked'); } });
    const { getRandomAnimation } = await import('../animations');
    const scenes = Array.from({ length: 10 }, () => getRandomAnimation('compute').id);
    expect(new Set(scenes.slice(0, 5)).size === 5 && new Set(scenes.slice(5)).size === 5 && scenes[4] !== scenes[5]).toBe(true);
  });
});
