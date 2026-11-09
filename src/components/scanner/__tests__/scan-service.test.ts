import { afterEach, describe, expect, it, vi } from 'vitest';

import { ScanSession, scanDeadline } from '../scan-service';
import { findTableGeometry, SCAN_LIMITS, validateSelection, visibleDecimalInk } from '../image-preparation';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Scanner boundaries', () => {
  it('terminates the native worker when language initialization rejects and permits retry', async () => {
    const terminated = vi.fn();
    let attempt = 0;
    vi.stubGlobal('Worker', class {
      private readonly fail = ++attempt === 1;
      onmessage?: (event: { data: object }) => void;
      postMessage({ action, jobId }: { action: string; jobId: string }) {
        queueMicrotask(() => this.onmessage?.({ data: { jobId, status: this.fail && action === 'loadLanguage' ? 'reject' : 'resolve' } }));
      }
      terminate = terminated;
    });
    const session = new ScanSession();
    try {
      await expect(session.warm()).rejects.toThrow('could not complete');
      expect(terminated).toHaveBeenCalledOnce();
      await expect(session.warm()).resolves.toBeUndefined();
    } finally { session.stop(); }
  });
  it.each(['timeout', 'cancel'])('terminates a worker that never replies to startup on %s', async mode => {
    vi.useFakeTimers();
    const terminated = vi.fn();
    vi.stubGlobal('Worker', class { postMessage = vi.fn(); terminate = terminated; });
    const session = new ScanSession();
    const rejected = expect(session.warm()).rejects.toThrow(mode === 'timeout' ? 'time limit' : 'canceled');
    if (mode === 'timeout') await vi.advanceTimersByTimeAsync(SCAN_LIMITS.initializeMs);
    else session.stop();
    await rejected;
    expect(terminated).toHaveBeenCalledOnce();
  });
  it('requires visible decimal ink rather than inferring a point from a two-digit number', () => {
    const width = 30, height = 26;
    const pixels = new Uint8ClampedArray(width * height * 4).fill(255);
    const paint = (left: number, top: number, right: number, bottom: number) => {
      for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
        const i = (y * width + x) * 4; pixels[i] = 0; pixels[i + 1] = 0; pixels[i + 2] = 0;
      }
    };
    paint(3, 4, 8, 22); paint(18, 4, 25, 22);
    expect(visibleDecimalInk(pixels, width, height)).toBe(false);
    paint(11, 19, 14, 22);
    expect(visibleDecimalInk(pixels, width, height)).toBe(true);
  });
  it('accepts ten selected images without silent truncation', () => {
    const files = Array.from({ length: 10 }, (_, index) => new File(['test'], `${index}.png`, { type: 'image/png' }));
    expect(validateSelection([], files).accepted).toHaveLength(10);
  });
  it('reports every rejected file beyond the batch limit', () => {
    const files = Array.from({ length: 23 }, (_, index) => new File(['test'], `${index}.png`, { type: 'image/png' }));
    const result = validateSelection([], files);
    expect([result.accepted.length, result.rejected.length]).toEqual([20, 3]);
  });
  it('times out a hung operation and invokes actual cleanup', async () => {
    vi.useFakeTimers();
    const cleanup = vi.fn();
    const result = scanDeadline(new Promise(() => {}), new AbortController().signal, 50, cleanup);
    const rejected = expect(result).rejects.toThrow('time limit');
    await vi.advanceTimersByTimeAsync(50);
    await rejected;
    expect(cleanup).toHaveBeenCalledOnce();
  });
  it('rejects cancellation instead of accepting a late result', async () => {
    const controller = new AbortController();
    let finish!: (value: string) => void;
    const result = scanDeadline(new Promise<string>(resolve => { finish = resolve; }), controller.signal, 1000, vi.fn());
    const rejected = expect(result).rejects.toThrow('canceled');
    controller.abort(new Error('canceled'));
    finish('late');
    await rejected;
  });
  it('finds the whole table including the last row at different vertical positions', () => {
    const width = 300, height = 250;
    const pixels = new Uint8ClampedArray(width * height * 4).fill(22);
    for (const y of [50, 75, 100, 125, 150, 175, 200]) {
      for (let x = 25; x < 275; x++) {
        const index = (y * width + x) * 4;
        pixels[index] = 45; pixels[index + 1] = 45; pixels[index + 2] = 45;
      }
    }
    const geometry = findTableGeometry(pixels, width, height);
    expect(geometry?.rowEdges).toHaveLength(6);
    expect(geometry!.box.y1).toBeGreaterThan(200);
  });
});
