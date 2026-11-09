import { afterEach, describe, expect, it, vi } from 'vitest';

import worker from '../index';

const env = { GEMINI_API_KEY: 'test-only-placeholder', GEMINI_API_KEY_2: 'unused-test-placeholder' };
const imageBase64 = 'iVBORw0KGgo=';
const request = (body: unknown = { imageBase64, mimeType: 'image/png' }) =>
  new Request('https://worker.example', { method: 'POST', body: JSON.stringify(body) });
const output = (courses: unknown) => new Response(JSON.stringify({
  candidates: [{ content: { parts: [{ text: JSON.stringify({ courses }) }] } }],
}));

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('optional Gemini OCR boundary', () => {
  it('rejects a declared format that does not match image bytes', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const response = await worker.fetch(request({ imageBase64, mimeType: 'image/jpeg' }), env);
    expect({ status: response.status, calls: fetch.mock.calls.length }).toEqual({ status: 400, calls: 0 });
  });

  it('uses one configured model and preserves unknown values', async () => {
    const fetch = vi.fn().mockResolvedValue(output([{ code: 'DEMO 1', name: 'Synthetic course', units: null, grade: null }]));
    vi.stubGlobal('fetch', fetch);
    const response = await worker.fetch(request(), { ...env, GEMINI_MODEL: 'gemini-3.8-flash' });
    expect({ status: response.status, data: await response.json(), calls: fetch.mock.calls.length }).toEqual({
      status: 200, data: { courses: [{ code: 'DEMO 1', name: 'Synthetic course', units: null, grade: null }] }, calls: 1,
    });
  });

  it('returns a safe quota error without cycling keys or leaking upstream data', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('provider-private-details', { status: 429 }));
    vi.stubGlobal('fetch', fetch);
    const response = await worker.fetch(request(), env);
    expect({ status: response.status, data: await response.json(), calls: fetch.mock.calls.length }).toEqual({
      status: 429, data: { error: 'Gemini quota is unavailable. Use local scanning or try later.', code: 'quota' }, calls: 1,
    });
  });

  it('rejects malformed extracted courses instead of accepting invented defaults', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(output([{ code: 'DEMO 1', name: 'Synthetic course', units: 'three', grade: 9 }])));
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(502);
  });

  it('aborts a hung provider within the shared fifteen second budget', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    vi.stubGlobal('fetch', vi.fn((_url, options) => { signal = options.signal; return new Promise(() => {}); }));
    const pending = worker.fetch(request(), env);
    await vi.advanceTimersByTimeAsync(15_000);
    const response = await pending;
    expect({ status: response.status, aborted: signal?.aborted }).toEqual({ status: 504, aborted: true });
  });

  it('rejects malformed JSON without returning parser or provider internals', async () => {
    const response = await worker.fetch(new Request('https://worker.example', { method: 'POST', body: '{' }), env);
    expect({ status: response.status, data: await response.json() }).toEqual({
      status: 400, data: { error: 'Upload a valid PNG, JPEG, or WebP image.', code: 'invalid-image' },
    });
  });

  it('keeps valid zero units and attaches a nullable structured output schema', async () => {
    const fetch = vi.fn().mockResolvedValue(output([{ code: 'DEMO 0', name: 'Synthetic civic course', units: 0, grade: '1.0' }]));
    vi.stubGlobal('fetch', fetch);
    const response = await worker.fetch(request(), env);
    const call = fetch.mock.calls[0];
    const schema = JSON.parse(call[1].body).generationConfig.responseFormat.text.schema;
    expect({ urlContainsKey: call[0].includes(env.GEMINI_API_KEY), units: (await response.json()).courses[0].units, nullable: schema.properties.courses.items.properties.units.type }).toEqual({
      urlContainsKey: false, units: 0, nullable: ['number', 'null'],
    });
  });

  it('returns a configuration failure without a provider request when keys are absent', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const response = await worker.fetch(request(), { GEMINI_API_KEY: '' });
    expect({ status: response.status, calls: fetch.mock.calls.length }).toEqual({ status: 503, calls: 0 });
  });

  it('does not treat lecture-like out-of-scale numeric grades as valid BU grades', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(output([{ code: 'DEMO 2', name: 'Synthetic course', units: 3, grade: '3.9' }])));
    const response = await worker.fetch(request(), env);
    expect(response.status).toBe(502);
  });

  it('bounds reading the provider response body as well as waiting for headers', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ReadableStream({ start() {} }))));
    const pending = worker.fetch(request(), env);
    await vi.advanceTimersByTimeAsync(15_000);
    const response = await pending;
    expect(response.status).toBe(504);
  });
});
