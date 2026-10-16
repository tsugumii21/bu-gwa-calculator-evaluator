// Bicol University GWA Calculator — Gemini 3.8 Flash Vision Scanner Client
// Communicates with Cloudflare Worker proxy to extract courses with fallback to Tesseract.js

import type { Subject } from '../../types';

// Default worker endpoint or custom endpoint configured in localStorage
export const DEFAULT_GEMINI_WORKER_URL =
  (import.meta as any).env?.VITE_GEMINI_WORKER_URL ||
  'https://bu-gwa-gemini-ocr.workers.dev';

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
    code?: string;
    name?: string;
    units?: number | string;
    grade?: string | number;
  }>;
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
 * Calls Gemini 3.8 Flash Vision via the Cloudflare Worker proxy.
 */
export async function scanScreenshotWithGemini(
  imageBlob: Blob
): Promise<Subject[]> {
  const workerUrl = getGeminiWorkerUrl();
  const base64Data = await blobToBase64(imageBlob);

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageBase64: base64Data,
      mimeType: imageBlob.type || 'image/png',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Worker returned status ${response.status}: ${errorBody}`);
  }

  const data = (await response.json()) as GeminiExtractionResult;
  if (!data || !Array.isArray(data.courses)) {
    throw new Error('Invalid format returned by Gemini proxy worker');
  }

  return data.courses.map((c) => {
    let units = typeof c.units === 'number' ? c.units : parseFloat(String(c.units || '3.0'));
    if (isNaN(units)) units = 3.0;

    const code = (c.code || '').trim();
    if (code.toUpperCase().startsWith('NSTP')) {
      units = 0;
    }

    let grade = '';
    if (c.grade !== undefined && c.grade !== null) {
      grade = String(c.grade).trim();
    }

    return {
      code: code || 'COURSE',
      name: (c.name || 'Imported Subject').trim(),
      units,
      grade,
    };
  });
}
