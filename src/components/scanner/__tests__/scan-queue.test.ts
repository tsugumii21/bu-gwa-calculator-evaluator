import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ScanImageResult } from '../../../types/scan';
import { ScanSession, type ScanJob } from '../scan-service';

const mocks = vi.hoisted(() => ({
  createWorker: vi.fn(), initialize: vi.fn(), recognize: vi.fn(), prepare: vi.fn(),
  terminate: vi.fn(), active: 0, maximum: 0,
}));

vi.mock('../owned-ocr-worker', () => ({
  OwnedOcrWorker: class {
    constructor() { mocks.createWorker(); }
    initialize = mocks.initialize;
    recognize = mocks.recognize;
    terminate = mocks.terminate;
  },
}));

vi.mock('../image-preparation', () => ({
  SCAN_LIMITS: { initializeMs: 30_000, imageMs: 45_000, batchMs: 180_000 },
  prepareScanImage: (...args: unknown[]) => mocks.prepare(...args),
}));

vi.mock('../../../core/scan-layout', () => ({
  extractTableRows: (words: Array<{ text: string }>, sourceId: string) => ({
    candidates: [{ id: `${sourceId}:0`, code: words[0]?.text || 'DEMO', name: 'Synthetic course',
      grade: '1.5', units: 3, issues: [], sourceIds: [sourceId], reviewed: false }],
    issues: [], expectedRows: 1,
  }),
}));

const job = (id: string, content = id): ScanJob => ({
  sourceId: id, file: new File([content], `${id}.png`, { type: 'image/png' }),
});
const page = (text: string) => ({ blocks: [{ paragraphs: [{ lines: [{ words: [
  { text, confidence: 99, bbox: { x0: 0, y0: 0, x1: 30, y1: 20 } },
] }] }] }] });
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.active = 0; mocks.maximum = 0;
  mocks.terminate.mockResolvedValue(undefined);
  mocks.initialize.mockResolvedValue(undefined);
  mocks.prepare.mockImplementation(async (file: File) => ({ canvas: { width: 100, height: 100, marker: file.name }, rowEdges: [] }));
  mocks.recognize.mockImplementation(async (canvas: { marker: string }) => page(canvas.marker));
  vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 8 });
});

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Local scan queue and cleanup', () => {
  it('reports real preparation and extraction stages before a terminal result', async () => {
    const session = new ScanSession();
    const updates: ScanImageResult[] = [];
    try {
      await session.run([job('stages')], result => updates.push(result));
      expect(updates.map(result => result.phase ?? result.status)).toEqual([
        'preparing', 'recognizing', 'extracting', 'completed',
      ]);
    } finally { session.stop(); }
  });
  it('runs at most two image jobs while keeping original result identities', async () => {
    mocks.recognize.mockImplementation(async (canvas: { marker: string }) => {
      mocks.active++; mocks.maximum = Math.max(mocks.maximum, mocks.active);
      await new Promise(resolve => setTimeout(resolve, canvas.marker === 'first.png' ? 25 : 5));
      mocks.active--;
      return page(canvas.marker);
    });
    const session = new ScanSession();
    try {
      const results = await session.run([job('first'), job('second'), job('third'), job('fourth')], vi.fn());
      expect({ maximum: mocks.maximum, workers: mocks.createWorker.mock.calls.length,
        identities: results.map(result => result.sourceId) }).toEqual({
        maximum: 2, workers: 2, identities: ['first', 'second', 'third', 'fourth'],
      });
    } finally { session.stop(); }
  });

  it('keeps successful images when one image cannot be prepared', async () => {
    mocks.prepare.mockImplementation(async (file: File) => {
      if (file.name === 'bad.png') throw new Error('synthetic decode failure');
      return { canvas: { width: 100, height: 100, marker: file.name }, rowEdges: [] };
    });
    const session = new ScanSession();
    try {
      const results = await session.run([job('good'), job('bad'), job('other')], vi.fn());
      expect(results.map(({ sourceId, status }) => ({ sourceId, status }))).toEqual([
        { sourceId: 'good', status: 'completed' }, { sourceId: 'bad', status: 'failed' },
        { sourceId: 'other', status: 'completed' },
      ]);
    } finally { session.stop(); }
  });

  it('reuses identical image recognition while preserving destination source identity', async () => {
    const session = new ScanSession();
    try {
      const results = await session.run([job('one', 'same-fixture'), job('two', 'same-fixture')], vi.fn());
      expect({ calls: mocks.recognize.mock.calls.length, secondStatus: results[1].status,
        secondSource: results[1].sourceId, candidateSources: results[1].candidates[0].sourceIds }).toEqual({
        calls: 1, secondStatus: 'duplicate', secondSource: 'two', candidateSources: ['two'],
      });
    } finally { session.stop(); }
  });

  it('terminates active workers and reports cancellation when recognition hangs', async () => {
    let started!: () => void;
    const recognizing = new Promise<void>(resolve => { started = resolve; });
    mocks.recognize.mockImplementation(() => { started(); return new Promise(() => {}); });
    const session = new ScanSession();
    const updates: ScanImageResult[] = [];
    const pending = session.run([job('one')], result => updates.push(result));
    await recognizing;
    session.stop();
    const results = await pending;
    expect({ status: results[0].status, terminated: mocks.terminate.mock.calls.length,
      lastUpdate: updates.at(-1)?.status, stopped: session.isStopped }).toEqual({
      status: 'canceled', terminated: 1, lastUpdate: 'canceled', stopped: true,
    });
  });

  it('terminates the worker without waiting for startup to finish', async () => {
    vi.useFakeTimers();
    mocks.initialize.mockImplementation(() => new Promise(() => {}));
    const session = new ScanSession();
    const pending = session.run([job('one')], vi.fn());
    await vi.advanceTimersByTimeAsync(30_000);
    const results = await pending;
    expect({ status: results[0].status, terminated: mocks.terminate.mock.calls.length,
      recognitionCalls: mocks.recognize.mock.calls.length }).toEqual({
      status: 'timed-out', terminated: 1, recognitionCalls: 0,
    });
  });

  it('does not reuse cached recognition for a different crop', async () => {
    const session = new ScanSession();
    try {
      const first = job('one', 'same-fixture'), second = job('two', 'same-fixture');
      second.crop = { x0: 1, y0: 1, x1: 90, y1: 90 };
      await session.run([first, second], vi.fn());
      expect(mocks.recognize).toHaveBeenCalledTimes(2);
    } finally { session.stop(); }
  });

  it('does not register a worker whose parameter initialization completes after cancellation', async () => {
    let finishParameters!: () => void;
    let configureStarted!: () => void;
    const configuring = new Promise<void>(resolve => { configureStarted = resolve; });
    mocks.initialize.mockImplementation(() => {
      configureStarted();
      return new Promise<void>(resolve => { finishParameters = resolve; });
    });
    const session = new ScanSession();
    const pending = session.run([job('one')], vi.fn());
    await configuring;
    session.stop();
    await pending;
    finishParameters();
    await flush();
    expect({ terminated: mocks.terminate.mock.calls.length, recognitionCalls: mocks.recognize.mock.calls.length }).toEqual({
      terminated: 1, recognitionCalls: 0,
    });
  });
});
