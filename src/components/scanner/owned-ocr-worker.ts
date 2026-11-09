import { OEM, PSM, type OutputFormats, type Page, type RecognizeOptions } from 'tesseract.js';
import workerUrl from 'tesseract.js/dist/worker.min.js?url';

import { ScanFailure } from '../../types/scan';

type Action = 'load' | 'loadLanguage' | 'initialize' | 'setParameters' | 'recognize';
type Reply = { jobId: string; status: 'progress' | 'resolve' | 'reject'; data: unknown };
type PendingJob = { id: string; resolve: (value: unknown) => void; reject: (cause: unknown) => void };

const LANGUAGE = 'eng';

/** Owns the native Tesseract worker before core or language initialization starts. */
export class OwnedOcrWorker {
  private readonly workerId = crypto.randomUUID();
  private readonly native = new Worker(workerUrl);
  private pending?: PendingJob;
  private nextJob = 0;
  private failure?: ScanFailure;

  constructor() {
    this.native.onmessage = (event: MessageEvent<Reply>) => this.receive(event.data);
    this.native.onerror = event => {
      event.preventDefault();
      this.terminate(new ScanFailure('recognition', 'The OCR worker could not run.', { cause: event.error }));
    };
    this.native.onmessageerror = () => this.terminate(new ScanFailure('recognition', 'The OCR worker returned an unreadable response.'));
  }

  async initialize() {
    // Tesseract 7.0.0's createWorker waits for this protocol before returning its native handle.
    await this.request('load', { options: { lstmOnly: true } });
    await this.request('loadLanguage', { langs: LANGUAGE, options: { lstmOnly: true } });
    await this.request('initialize', { langs: LANGUAGE, oem: OEM.LSTM_ONLY });
    await this.request('setParameters', { params: { tessedit_pageseg_mode: PSM.SPARSE_TEXT, preserve_interword_spaces: '1' } });
  }

  async recognize(canvas: HTMLCanvasElement, options: Partial<RecognizeOptions>, output: Partial<OutputFormats>): Promise<Page> {
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => {
      if (value) resolve(value);
      else reject(new ScanFailure('recognition', 'Could not prepare the image for OCR.'));
    }));
    const bytes = await blob.arrayBuffer();
    return await this.request('recognize', { image: new Uint8Array(bytes), options, output }, [bytes]) as Page;
  }

  terminate(failure = new ScanFailure('canceled', 'Scan canceled.')) {
    if (this.failure) return;
    this.failure = failure;
    this.native.terminate();
    this.pending?.reject(failure);
    this.pending = undefined;
  }

  private request(action: Action, payload: object, transfer: Transferable[] = []): Promise<unknown> {
    if (this.failure) return Promise.reject(this.failure);
    if (this.pending) return Promise.reject(new ScanFailure('recognition', 'The OCR worker is busy.'));
    const jobId = String(++this.nextJob);
    return new Promise((resolve, reject) => {
      this.pending = { id: jobId, resolve, reject };
      try {
        this.native.postMessage({ workerId: this.workerId, jobId, action, payload }, transfer);
      } catch (cause) {
        this.terminate(new ScanFailure('recognition', 'Could not send a job to the OCR worker.', { cause }));
      }
    });
  }

  private receive({ jobId, status, data }: Reply) {
    const pending = this.pending;
    if (!pending || jobId !== pending.id || status === 'progress') return;
    this.pending = undefined;
    if (status === 'resolve') pending.resolve(data);
    else pending.reject(new ScanFailure('recognition', 'The OCR worker could not complete its operation.', { cause: data }));
  }
}
