import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import type { Subject } from '../../types';
import { ScanFailure } from '../../types/scan';

export interface PdfCorParseResult {
  semesterTitle: string;
  subjects: Subject[];
}

export const COR_LIMITS = { files: 8, bytes: 10 * 1024 * 1024, pages: 20, milliseconds: 30_000 } as const;
const ROW_Y_TOLERANCE = 5;

/** Extracts text from a COR PDF and releases its pages and worker. */
export async function parsePdfCOR(file: File, signal?: AbortSignal): Promise<PdfCorParseResult> {
  if (file.size > COR_LIMITS.bytes) throw new ScanFailure('invalid', 'Choose a PDF no larger than 10 MB.');
  const deadline = AbortSignal.timeout(COR_LIMITS.milliseconds);
  const cancellation = signal ? AbortSignal.any([signal, deadline]) : deadline;
  cancellation.throwIfAborted();
  let rejectCanceled!: (reason: unknown) => void;
  const canceled = new Promise<never>((_, reject) => { rejectCanceled = reject; });
  const cancel = () => rejectCanceled(cancellation.reason);
  cancellation.addEventListener('abort', cancel, { once: true });
  let task: PDFDocumentLoadingTask | undefined;
  try {
    const data = await Promise.race([file.arrayBuffer(), canceled]);
    const pdfjs = await Promise.race([import('pdfjs-dist/legacy/build/pdf.mjs'), canceled]);
    cancellation.throwIfAborted();
    // Match the worker to the lazily loaded parser version.
    if (typeof window !== 'undefined') pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
    task = pdfjs.getDocument({ data });
    const document = await Promise.race([task.promise, canceled]);
    cancellation.throwIfAborted();
    if (document.numPages > COR_LIMITS.pages) throw new ScanFailure('invalid', 'Choose a COR with at most 20 pages.');
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      pages.push(await Promise.race([readPage(document, pageNumber, cancellation), canceled]));
    }
    return extractCORSubjectsFromText(pages.join('\n'));
  } catch (error) {
    cancellation.throwIfAborted();
    if (error instanceof ScanFailure) throw error;
    throw new ScanFailure('invalid', 'Could not read the COR schedule from this PDF.', { cause: error });
  } finally {
    cancellation.removeEventListener('abort', cancel);
    await task?.destroy();
  }
}

async function readPage(document: PDFDocumentProxy, pageNumber: number, signal: AbortSignal) {
  signal.throwIfAborted();
  const page = await document.getPage(pageNumber);
  try {
    const content = await page.getTextContent();
    signal.throwIfAborted();
    let lastY: number | null = null;
    let pageText = '';

    content.items.forEach(item => {
      if (!('str' in item) || !item.str.trim()) return;
      const str = item.str;
      const y = item.transform[5];

      if (lastY !== null && y !== null && Math.abs(y - lastY) > ROW_Y_TOLERANCE) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
        pageText += ' ';
      }
      pageText += str;
      if (y !== null) {
        lastY = y;
      }
    });

    return pageText;
  } finally {
    page.cleanup();
  }
}

const MAX_COURSE_UNITS = 12;
const COURSE_CODE = /[A-Z][A-Z0-9.-]{1,14}?(?:[ \t]+(?:FIT|ELECT|ELEC))?[ \t]*\d+[A-Z]?(?:\.\d+)?/.source;
const CODE_AT_START = new RegExp("^(" + COURSE_CODE + ")[ \\t]+", 'i');
const PLAIN_COURSE_ROW = new RegExp("^(" + COURSE_CODE + ")[ \\t]+(.+?)[ \\t]+(\\d+(?:\\.\\d+)?)$", 'i');
const METADATA = /^(?:SCHOOL YEAR|STUDENT NUMBER|ID NUMBER|SUBJECT CODE|COURSE CODE|ROOM|CLASS SCHEDULE)\b/i;
const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, ' ').replace(/(?<=[A-Z])(?=\d+[A-Z]?(?:\.\d+)?$)/, ' ');

/** Parses course rows only within a COR schedule. */
export function extractCORSubjectsFromText(text: string): PdfCorParseResult {
  if (!text || text.trim().length === 0) {
    return { semesterTitle: 'Scanned COR', subjects: [] };
  }

  const newSubjects: Subject[] = [];
  let semesterTitle = 'Scanned COR';

  // 1. Extract Semester Title (e.g., "AY 2025-2026 2nd Semester")
  const syMatch =
    text.match(/School Year:\s*(AY\s*[\d-]+\s*[\d\w\s]+Semester)/i) ||
    text.match(/(AY\s*\d{4}-\d{4}\s*\d(?:st|nd|rd|th)?\s*Semester)/i);
  if (syMatch) {
    semesterTitle = syMatch[1].trim();
  }

  // Isolate the schedule for both row formats.
  let scheduleText = text;
  const heading = text.match(/(?:^|\n)[ \t]*(?:CLASS[ \t]+)?SCHEDULE\b[ \t]*:?/i);
  if (!heading || heading.index === undefined) return { semesterTitle, subjects: [] };
  const schedStart = heading.index + heading[0].length;
  const relativeEnd = text.slice(schedStart).search(/(?:^|\n)[ \t]*(?:TOTALS?\b|ASSESSED FEES\b)/i);
  const schedEnd = relativeEnd === -1 ? -1 : schedStart + relativeEnd;

  if (schedEnd >= schedStart) {
    scheduleText = text.substring(schedStart, schedEnd);
  } else {
    scheduleText = text.substring(schedStart);
  }

  const cleanSchedule = scheduleText.replace(/\r/g, '');

  // 3. Locate each subject row by finding unit anchors: "3.0 2.0 1.0 BSIT-P-3A" or "3.0 3.0 0.0 BSIT-P-3A"
  const anchorRegex = /(?<![\d.-])(\d+(?:\.\d+)?)[ \t]+(\d+(?:\.\d+)?)[ \t]+(\d+(?:\.\d+)?)[ \t]+([A-Z]{2,12}-[A-Z0-9-]+)/gi;

  let aMatch: RegExpExecArray | null;
  while ((aMatch = anchorRegex.exec(cleanSchedule)) !== null) {
    const creditUnits = Number(aMatch[1]);
    if (!Number.isFinite(creditUnits) || creditUnits > MAX_COURSE_UNITS) continue;
    const anchorIndex = aMatch.index;

    const rowStart = cleanSchedule.lastIndexOf('\n', anchorIndex) + 1;
    const textBeforeAnchor = cleanSchedule.substring(rowStart, anchorIndex).trimStart();
    if (METADATA.test(textBeforeAnchor)) continue;
    const lastCodeMatch = textBeforeAnchor.match(CODE_AT_START);
    if (lastCodeMatch) {
      const code = normalizeCode(lastCodeMatch[1]);
      // Course description is the exact text between the code end index and unit anchor start index
      let name = textBeforeAnchor.slice(lastCodeMatch[0].length).trim();

      // Clean up unwanted artifacts
      name = name.replace(/^Subject\s+/i, '').replace(/^Code\s+/i, '').trim();

      // Avoid duplicates
      if (!newSubjects.some((s) => s.code === code)) {
        newSubjects.push({
          code,
          name: name || 'Scanned Course',
          grade: '',
          units: creditUnits,
        });
      }
    }
  }

  // 4. Fallback if anchors were not detected
  if (newSubjects.length === 0) {
    const lines = cleanSchedule.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || METADATA.test(trimmed)) return;
      const lMatch = trimmed.match(PLAIN_COURSE_ROW);
      if (lMatch) {
        const code = normalizeCode(lMatch[1]);
        const units = Number(lMatch[3]);
        if (!Number.isFinite(units) || units > MAX_COURSE_UNITS) return;
        if (!newSubjects.some((s) => s.code === code)) {
          newSubjects.push({
            code,
            name: lMatch[2].trim(),
            grade: '',
            units,
          });
        }
      }
    });
  }

  return {
    semesterTitle,
    subjects: newSubjects,
  };
}
