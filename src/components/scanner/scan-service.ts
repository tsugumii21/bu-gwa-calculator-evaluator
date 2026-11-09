import { PSM, type Page } from 'tesseract.js';

import { extractTableRows } from '../../core/scan-layout';
import { isValidBUGrade } from '../../core/constants';
import { ScanFailure, type ScanBox, type ScanImageResult, type ScanWord } from '../../types/scan';
import { hasVisibleDecimal, prepareScanImage, SCAN_LIMITS } from './image-preparation';
import { OwnedOcrWorker } from './owned-ocr-worker';

/** A file keeps its identity regardless of queue completion order or semester grouping. */
export interface ScanJob { sourceId: string; file: File; crop?: ScanBox; force?: boolean }

/** A timeout rejects promptly; cleanup terminates recognition rather than only hiding its result. */
export function scanDeadline<T>(operation: Promise<T>, signal: AbortSignal, milliseconds: number, onTimeout: () => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const cancel = () => { cleanup(); reject(signal.reason ?? new ScanFailure('canceled', 'Scan canceled.')); };
    const timer = setTimeout(() => { onTimeout(); cleanup(); reject(new ScanFailure('timeout', 'Scan time limit reached. Retry this image or adjust its crop.')); }, milliseconds);
    const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', cancel); };
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
    operation.then(value => { cleanup(); if (!signal.aborted) resolve(value); }, error => { cleanup(); reject(error); });
  });
}

/** Flattens explicitly requested Tesseract blocks without relying on plain-text reading order. */
export function recognitionWords(page: Page): ScanWord[] {
  return (page.blocks ?? []).flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines.flatMap(line =>
    line.words.map(({ text, confidence, bbox }) => ({ text, confidence, bbox })))));
}

/** A bounded, cancelable local OCR session; no image/text is sent to a cloud service. */
export class ScanSession {
  private readonly controller = new AbortController();
  private readonly workers = new Set<OwnedOcrWorker>();
  private readonly cache = new Map<string, Promise<ScanImageResult>>();
  private warming?: Promise<void>;
  private stopped = false;
  private isRunning = false;

  get isStopped() { return this.stopped; }

  warm() {
    this.warming ??= scanDeadline(this.addWorker(), this.controller.signal, SCAN_LIMITS.initializeMs, () => this.stop('timeout')).catch(error => {
      this.warming = undefined;
      throw error;
    });
    return this.warming;
  }

  private async addWorker() {
    this.controller.signal.throwIfAborted();
    const worker = new OwnedOcrWorker();
    this.workers.add(worker);
    try {
      await worker.initialize();
      this.controller.signal.throwIfAborted();
    } catch (error) {
      if (this.workers.delete(worker)) worker.terminate();
      throw error;
    }
  }

  stop(kind: 'canceled' | 'timeout' = 'canceled') {
    if (this.stopped) return;
    this.stopped = true;
    const failure = new ScanFailure(kind, kind === 'timeout' ? 'Scan time limit reached. Retry unfinished images.' : 'Scan canceled.');
    this.controller.abort(failure);
    this.cache.clear();
    for (const worker of this.workers) worker.terminate(failure);
    this.workers.clear();
  }

  async run(jobs: ScanJob[], onResult: (result: ScanImageResult) => void): Promise<ScanImageResult[]> {
    if (this.isRunning) return this.failJobs(jobs, onResult, new ScanFailure('recognition', 'A scan is already running.'));
    this.isRunning = true;
    const batchTimer = setTimeout(() => this.stop('timeout'), SCAN_LIMITS.batchMs);
    try {
      await this.warm();
      const device = navigator as Navigator & { deviceMemory?: number };
      const parallel = jobs.length > 1 && navigator.hardwareConcurrency >= 4 && (device.deviceMemory ?? 0) >= 4;
      if (parallel && this.workers.size === 1) await scanDeadline(this.addWorker(), this.controller.signal, SCAN_LIMITS.initializeMs, () => this.stop('timeout'));
      const results: ScanImageResult[] = new Array(jobs.length);
      let next = 0;
      const lane = async (worker: OwnedOcrWorker) => {
        while (next < jobs.length) {
          const index = next++, job = jobs[index];
          onResult({ ...emptyResult(job), status: 'running', phase: 'preparing' });
          results[index] = await this.process(job, onResult, worker);
          onResult(results[index]);
        }
      };
      await Promise.all(Array.from(this.workers).slice(0, parallel ? 2 : 1).map(lane));
      return results;
    } catch (error) {
      return this.failJobs(jobs, onResult, error);
    } finally { clearTimeout(batchTimer); this.isRunning = false; }
  }

  private failJobs(jobs: ScanJob[], onResult: (result: ScanImageResult) => void, error: unknown) {
    const results = jobs.map(job => failedResult(job, error));
    results.forEach(onResult);
    return results;
  }

  private async process(job: ScanJob, onResult: (result: ScanImageResult) => void, worker: OwnedOcrWorker): Promise<ScanImageResult> {
    const start = performance.now();
    try {
      if (this.controller.signal.aborted) throw this.controller.signal.reason;
      const key = await imageKey(job);
      const cached = job.force ? undefined : this.cache.get(key);
      if (cached) {
        const previous = await cached;
        if (['completed', 'partial', 'duplicate'].includes(previous.status)) {
          return { ...previous, sourceId: job.sourceId, name: job.file.name, status: 'duplicate',
            candidates: previous.candidates.map((row, index) => ({ ...row, id: `${job.sourceId}:${index}`, sourceIds: [job.sourceId] })) };
        }
      }
      const phase = (value: ScanImageResult['phase']) => {
        if (!this.controller.signal.aborted) onResult({ ...emptyResult(job), status: 'running', phase: value });
      };
      const pending = scanDeadline(this.recognize(job, phase, worker), this.controller.signal, SCAN_LIMITS.imageMs, () => this.stop('timeout'));
      this.cache.set(key, pending);
      return await pending;
    } catch (error) {
      return { ...failedResult(job, error), milliseconds: performance.now() - start };
    }
  }

  private async recognize(job: ScanJob, onPhase: (phase: ScanImageResult['phase']) => void, worker: OwnedOcrWorker): Promise<ScanImageResult> {
    const start = performance.now();
    const prepared = await prepareScanImage(job.file, job.crop);
    try {
      if (this.controller.signal.aborted) throw this.controller.signal.reason;
      const ready = performance.now();
      onPhase('recognizing');
      const data = await worker.recognize(prepared.canvas, {}, { blocks: true, text: true });
      onPhase('extracting');
      let words = recognitionWords(data);
      let parsed = extractTableRows(words, job.sourceId, prepared.rowEdges);
      restoreVisibleDecimals(parsed.candidates, prepared.canvas);
      const firstPass = performance.now();
      const codeRetries = parsed.candidates.filter(item => item.codeBox && (!item.code || (item.codeConfidence ?? 0) < 90 || /1/.test(item.rawCode ?? '')));
      if (codeRetries.length) onPhase('recovering');
      for (const row of codeRetries) {
        await this.retryCode(prepared.canvas, row, worker);
      }
      const weak = parsed.candidates.filter(row => (!row.code || row.units === null || !row.grade) && row.bbox).slice(0, 4);
      if (weak.length) onPhase('recovering');
      for (const row of weak) {
        if (this.controller.signal.aborted) throw this.controller.signal.reason;
        const box = row.bbox!;
        const top = Math.max(0, box.y0 - 8), bottom = Math.min(prepared.canvas.height, box.y1 + 8);
        const retry = await worker.recognize(prepared.canvas, { rectangle: { left: 0, top, width: prepared.canvas.width, height: bottom - top } }, { blocks: true, text: true });
        // Tesseract rectangle output already uses absolute image coordinates.
        const retried = recognitionWords(retry);
        const retained = words.filter(word => (word.bbox.y0 + word.bbox.y1) / 2 < top || (word.bbox.y0 + word.bbox.y1) / 2 >= bottom);
        const attempt = extractTableRows([...retained, ...retried], job.sourceId, prepared.rowEdges);
        restoreVisibleDecimals(attempt.candidates, prepared.canvas);
        const index = parsed.candidates.findIndex(candidate => candidate.id === row.id);
        const previous = parsed.candidates[index], next = attempt.candidates[index];
        const fields = (candidate: typeof row) => Number(!!candidate.code) + Number(candidate.units !== null) + Number(!!candidate.grade);
        if (next && previous && fields(next) > fields(previous)) {
          words = [...retained, ...retried];
          parsed = attempt;
        }
      }
      const issues = [...parsed.issues];
      if (!parsed.candidates.length) issues.push('No table rows identified. Retry a clearer image or enter courses manually.');
      const status = issues.length || parsed.candidates.some(row => row.issues.length) ? 'partial' : 'completed';
      return { sourceId: job.sourceId, name: job.file.name, status, ...parsed, issues,
        milliseconds: performance.now() - start, timings: { preparation: ready - start, recognition: firstPass - ready, retry: performance.now() - firstPass } };
    } finally { prepared.canvas.width = 0; prepared.canvas.height = 0; }
  }

  private async retryCode(canvas: HTMLCanvasElement, row: ScanImageResult['candidates'][number], worker: OwnedOcrWorker) {
    const box = row.codeBox!;
    const left = Math.max(0, box.x0 - 8), top = Math.max(0, box.y0 - 8);
    const width = Math.min(canvas.width - left, box.x1 - left + 8), height = Math.min(canvas.height - top, box.y1 - top + 8);
    const crop = document.createElement('canvas');
    crop.width = width * 2; crop.height = height * 2;
    const context = crop.getContext('2d');
    if (!context) return;
    context.imageSmoothingEnabled = false;
    context.drawImage(canvas, left, top, width, height, 0, 0, crop.width, crop.height);
    try {
      const options = { rectangle: { left: 0, top: 0, width: crop.width, height: crop.height }, tessedit_pageseg_mode: PSM.SINGLE_LINE,
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.- ',
      };
      const data = await worker.recognize(crop, options, { text: true, blocks: true });
      const match = data.text.trim().match(/^([A-Za-z]{2,12}(?:[- ](?:Elect|Elec))?)\s*(\d+(?:\.\d+)?[A-Za-z]?)\b/i);
      if (!match) return;
      const code = `${match[1]} ${match[2]}`;
      const confidence = recognitionWords(data).reduce((sum, word, _, words) => sum + word.confidence / words.length, 0);
      if (row.code && code.toUpperCase().replace(/\s/g, '') !== row.code.toUpperCase().replace(/\s/g, '')) {
        row.issues.push(`Another OCR reading is ${code}; compare each course-code character against the source.`);
        if (confidence <= (row.codeConfidence ?? 0)) return;
      }
      row.code = code;
      if (row.rawCode && row.name.startsWith(row.rawCode)) row.name = row.name.slice(row.rawCode.length).trim();
      row.issues = row.issues.filter(issue => issue !== 'Course code unreadable.');
      row.issues.push('Course code recovered from a larger crop; verify against the source.');
    } finally { crop.width = 0; crop.height = 0; }
  }
}

function emptyResult(job: ScanJob): ScanImageResult {
  return { sourceId: job.sourceId, name: job.file.name, status: 'queued', candidates: [], issues: [], expectedRows: null, milliseconds: 0 };
}

function failedResult(job: ScanJob, error: unknown): ScanImageResult {
  const status = error instanceof ScanFailure && error.kind === 'timeout' ? 'timed-out' : error instanceof ScanFailure && error.kind === 'canceled' ? 'canceled' : 'failed';
  return { ...emptyResult(job), status, issues: [error instanceof ScanFailure ? error.message : 'Unable to read this image. Retry or adjust its crop.'] };
}

async function imageKey(job: ScanJob) {
  const digest = await crypto.subtle.digest('SHA-256', await job.file.arrayBuffer());
  return `${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}:${JSON.stringify(job.crop ?? null)}`;
}

function restoreVisibleDecimals(rows: ScanImageResult['candidates'], canvas: HTMLCanvasElement) {
  for (const row of rows) {
    if (row.grade || !row.gradeBox || !/^[1-5]\d$/.test(row.rawGrade ?? '')) continue;
    const recovered = `${row.rawGrade![0]}.${row.rawGrade![1]}`;
    if (!isValidBUGrade(recovered) || !hasVisibleDecimal(canvas, row.gradeBox)) continue;
    row.grade = recovered;
    row.issues = row.issues.filter(issue => !issue.startsWith('Grade unreadable'));
    row.issues.push('Decimal point confirmed from image pixels; verify against the source.');
  }
}
