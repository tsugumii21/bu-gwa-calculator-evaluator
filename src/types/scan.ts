/** Pixel coordinates in the image supplied to recognition. */
export interface ScanBox { x0: number; y0: number; x1: number; y1: number }

/** One recognized word with its source location. */
export interface ScanWord { text: string; confidence: number; bbox: ScanBox }

/** Editable observation; unknown units stay null until the user resolves them. */
export interface ScanCandidate {
  id: string;
  code: string;
  name: string;
  units: number | null;
  grade: string;
  issues: string[];
  sourceIds: string[];
  reviewed: boolean;
  conflicts?: Partial<Record<'grade' | 'units' | 'name', { value: string; sourceIds: string[] }[]>>;
  bbox?: ScanBox;
  rawGrade?: string;
  gradeBox?: ScanBox;
  codeBox?: ScanBox;
  rawCode?: string;
  codeConfidence?: number;
}

export type ScanStatus = 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'timed-out' | 'canceled' | 'duplicate';

/** Per-file outcomes remain visible even when other files succeed. */
export interface ScanImageResult {
  sourceId: string;
  name: string;
  status: ScanStatus;
  candidates: ScanCandidate[];
  issues: string[];
  expectedRows: number | null;
  milliseconds: number;
  timings?: Record<string, number>;
  phase?: 'preparing' | 'recognizing' | 'extracting' | 'recovering';
}

/** Expected operational failures exposed safely at the scanner boundary. */
export class ScanFailure extends Error {
  constructor(public readonly kind: 'invalid' | 'timeout' | 'canceled' | 'recognition' | 'provider', message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ScanFailure';
  }
}
