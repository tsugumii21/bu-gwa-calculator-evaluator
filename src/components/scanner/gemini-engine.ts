// Bicol University GWA Calculator — Gemini AI Vision Scanner Client
// Communicates with Cloudflare Worker proxy (multi-model cascade) with fallback to Tesseract.js

import type { Subject } from '../../types';
import { ScanFailure } from '../../types/scan';

// Default worker endpoint or custom endpoint configured in localStorage
export const DEFAULT_GEMINI_WORKER_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_GEMINI_WORKER_URL ||
  'https://bu-gwa-gemini-ocr.tsugumii-tsuki04.workers.dev';

export function getGeminiWorkerUrl(): string {
  try {
    const saved = localStorage.getItem('bu_gemini_worker_url');
    if (saved && saved.trim().length > 0) return saved.trim();
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_GEMINI_WORKER_URL;
}

export function setGeminiWorkerUrl(url: string): void {
  try {
    localStorage.setItem('bu_gemini_worker_url', url.trim());
  } catch {
    // Ignore storage errors
  }
}

export interface GeminiExtractionResult {
  courses: Array<{
    code?: string | null;
    name?: string | null;
    units?: number | string | null;
    grade?: string | number | null;
  }>;
}

export interface GeminiScanOptions {
  imageCount?: number;
  signal?: AbortSignal;
}

/**
 * Converts a Blob or File to a Base64 data string.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      resolve(res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Calls Gemini AI Vision via the Cloudflare Worker proxy with multi-model cascade.
 */
export async function scanScreenshotWithGemini(
  imageBlob: Blob,
  options?: GeminiScanOptions
): Promise<Subject[]> {
  const workerUrl = getGeminiWorkerUrl();
  const base64Data = await blobToBase64(imageBlob);

  const response = await fetch(workerUrl, {
    method: 'POST',
    signal: AbortSignal.any([AbortSignal.timeout(15_000), ...(options?.signal ? [options.signal] : [])]),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64Data,
      mimeType: imageBlob.type || 'image/png',
      imageCount: options?.imageCount,
    }),
  });

  if (!response.ok) {
    throw new ScanFailure('provider', response.status === 429 ? 'Gemini quota reached. Use local scanning or retry later.' : 'Gemini could not process this image. Use local scanning or retry.');
  }

  const data = (await response.json()) as GeminiExtractionResult;
  if (!data || !Array.isArray(data.courses)) {
    throw new Error('Invalid format returned by Gemini proxy worker');
  }

  return data.courses.map((c) => {
    const units = typeof c.units === 'number' ? c.units : c.units == null ? NaN : Number(c.units);
    if (!Number.isFinite(units) || units < 0) throw new ScanFailure('provider', 'Total units could not be read. Review the image locally.');

    const code = (c.code || '').trim();
    if (!code || !c.name?.trim()) throw new ScanFailure('provider', 'A course label could not be read. Review the image locally.');

    let grade = '';
    if (c.grade !== undefined && c.grade !== null) {
      grade = String(c.grade).trim();
    }

    return {
      code,
      name: c.name.trim(),
      units,
      grade,
    };
  });
}
