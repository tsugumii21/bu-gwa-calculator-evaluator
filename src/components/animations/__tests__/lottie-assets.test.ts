import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => { vi.resetModules(); vi.unstubAllGlobals(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('shared Lottie assets', () => {
  it('shares an in-flight preload with the visible loader and caches the validated result', async () => {
    const data = { layers: [] };
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
    vi.stubGlobal('fetch', fetch);
    const { loadLottieAsset, getCachedLottieAsset } = await import('../lottie-assets');

    const preload = loadLottieAsset('/study.json');
    const display = loadLottieAsset('/study.json');
    await Promise.all([preload, display]);
    await loadLottieAsset('/study.json');

    expect(preload === display && fetch.mock.calls.length === 1 && getCachedLottieAsset('/study.json') === data).toBe(true);
  });

  it('rejects malformed data without poisoning the cache and permits retry', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ layers: 'wrong' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ layers: [] }) });
    vi.stubGlobal('fetch', fetch);
    const { loadLottieAsset } = await import('../lottie-assets');

    const invalid = await loadLottieAsset('/study.json');
    const retried = await loadLottieAsset('/study.json');

    expect(!invalid.ok && invalid.reason === 'invalid-data' && retried.ok && fetch.mock.calls.length === 2).toBe(true);
  });

  it('returns a retryable network failure for an unsuccessful HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const { loadLottieAsset, getCachedLottieAsset } = await import('../lottie-assets');

    const result = await loadLottieAsset('/missing.json');

    expect(!result.ok && result.reason === 'network' && getCachedLottieAsset('/missing.json') === undefined).toBe(true);
  });

  it('bounds stalled requests and returns an explicit timeout failure', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn((_src, { signal }: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    })));
    const { loadLottieAsset } = await import('../lottie-assets');

    const pending = loadLottieAsset('/slow.json');
    await vi.advanceTimersByTimeAsync(4_000);

    expect(await pending).toMatchObject({ ok: false, reason: 'timeout' });
  });
});
