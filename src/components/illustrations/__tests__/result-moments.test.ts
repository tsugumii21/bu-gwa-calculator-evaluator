import { afterEach, describe, expect, it, vi } from 'vitest';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { chooseResultMoment, RESULT_MOMENTS, type ResultMomentPool } from '../result-moments';
import { ResultMascot } from '../result-mascot';

afterEach(() => vi.restoreAllMocks());

describe('result artwork and encouragement', () => {
  it.each([
    ['president', 0, 4], ['dean', 5, 9], ['support', 10, 14], ['latin', 0, 9],
  ] as const)('keeps %s outcomes inside the matching artwork pool', (pool, first, last) => {
    const samples = Array.from({ length: 100 }, () => chooseResultMoment(pool as ResultMomentPool, -1));
    expect(samples.every(index => index >= first && index <= last)).toBe(true);
  });

  it('does not immediately repeat artwork when reopening a new calculation', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(chooseResultMoment('president', 0)).not.toBe(0);
  });

  it('provides fifteen distinct native website scenes and original quotes', () => {
    expect(new Set(RESULT_MOMENTS.map(([asset, quote]) => `${asset}:${quote}`)).size).toBe(15);
    const scenes = RESULT_MOMENTS.map((_, moment) => renderToStaticMarkup(createElement(ResultMascot, { moment })));
    expect(new Set(scenes).size).toBe(15);
    expect(scenes.every(scene => scene.includes('data-result-pose=') && scene.includes('<svg'))).toBe(true);
  });

  it('uses supportive artwork for an invalid or stale selection', () => {
    expect(renderToStaticMarkup(createElement(ResultMascot, { moment: -1 })))
      .toBe(renderToStaticMarkup(createElement(ResultMascot, { moment: 10 })));
  });
});
