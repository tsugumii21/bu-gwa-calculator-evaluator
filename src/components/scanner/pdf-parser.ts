import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import type { Subject } from '../../types';
import { ScanFailure } from '../../types/scan';

export interface PdfCorParseResult {
  semesterTitle: string;
  subjects: Subject[];
  unreadableCourseCodes: string[];
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
const CODE_AT_START = new RegExp("^(" + COURSE_CODE + ")(?:[ \\t]+|$)", 'i');
const PLAIN_COURSE_ROW = /^(.+?)[ \t]+(-?\d+(?:\.\d+)?)$/;
const METADATA = /^(?:SCHOOL YEAR|STUDENT NUMBER|ID NUMBER|SUBJECT CODE|COURSE CODE|ROOM|(?:CLASS[ \t]+)?SCHEDULE)\b/i;
const UNIT_COLUMNS = /\b(?:CREDIT(?:ED)?(?:[ \t]+UNITS?)?|UNITS?|LEC(?:TURE)?(?:[ \t]+(?:UNITS?|HOURS?))?|LAB(?:ORATORY)?(?:[ \t]+(?:UNITS?|HOURS?))?)\b/gi;
const UNIT_RUN = /(?<!\S)-?\d+(?:\.\d+)?(?:[ \t]+-?\d+(?:\.\d+)?){2,}(?=[ \t]|$)/g;
const normalizeCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, ' ').replace(/(?<=[A-Z])(?=\d+[A-Z]?(?:\.\d+)?$)/, ' ');

function creditColumnFromHeader(line: string) {
  const columns = line.match(UNIT_COLUMNS);
  if (!columns?.some(column => /^LEC/i.test(column)) || !columns.some(column => /^LAB/i.test(column))) return undefined;
  return columns.findIndex(column => /^(?:CREDIT|UNITS?$)/i.test(column));
}

function readCourseRow(body: string, creditColumn: number) {
  const runs = [...body.matchAll(UNIT_RUN)];
  if (runs.length > 1) return null;
  const run = runs[0];
  if (!run) {
    const plain = body.match(PLAIN_COURSE_ROW);
    // A pair of trailing decimals may be a schedule row with a missing unit column.
    if (!plain || /(?:^|\s)-?\d+\.\d+$/.test(plain[1])) return null;
    return { name: plain[1], units: Number(plain[2]) };
  }

  const values = run[0].split(/[ \t]+/);
  // A title may end in a whole number before the three schedule columns.
  const titleSuffix = values.length === 4 && /^\d+$/.test(values[0])
    && values.slice(1).every(value => value.includes('.')) ? values.shift() : undefined;
  if (values.length !== 3 || creditColumn < 0 || creditColumn >= values.length) return null;
  if (values.some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) return null;
  const title = body.slice(0, run.index).trim();
  if (!title) return null;
  return { name: titleSuffix ? [title, titleSuffix].join(' ') : title, units: Number(values[creditColumn]) };
}

/** Parses course rows only within a COR schedule. */
export function extractCORSubjectsFromText(text: string): PdfCorParseResult {
  const syMatch = text.match(/School Year:\s*(AY\s*[\d-]+\s*[\d\w\s]+Semester)/i)
    ?? text.match(/(AY\s*\d{4}-\d{4}\s*\d(?:st|nd|rd|th)?\s*Semester)/i);
  const semesterTitle = syMatch?.[1].trim() || 'Scanned COR';
  const heading = text.match(/(?:^|\n)[ \t]*(?:CLASS[ \t]+)?SCHEDULE\b[ \t]*:?/i);
  if (heading?.index === undefined) return { semesterTitle, subjects: [], unreadableCourseCodes: [] };

  const schedule = text.slice(heading.index + heading[0].length).split(/\r?\n/);
  const subjects = new Map<string, Subject>();
  const unreadable = new Set<string>();
  let creditColumn = 0;

  for (const rawLine of schedule) {
    const line = rawLine.trim();
    if (/^(?:TOTALS?|ASSESSED FEES)\b/i.test(line)) break;
    const match = METADATA.test(line) ? null : line.match(CODE_AT_START);
    if (!match) {
      creditColumn = creditColumnFromHeader(line) ?? creditColumn;
      continue;
    }

    const code = normalizeCode(match[1]);
    if (unreadable.has(code)) continue;
    const row = readCourseRow(line.slice(match[0].length), creditColumn);
    const previous = subjects.get(code);
    if (!row || !Number.isFinite(row.units) || row.units < 0 || row.units > MAX_COURSE_UNITS
      || (previous && previous.units !== row.units)) {
      unreadable.add(code);
      subjects.delete(code);
      continue;
    }

    const name = row.name.replace(/^Subject\s+/i, '').replace(/^Code\s+/i, '').trim() || 'Scanned Course';
    if (!previous) subjects.set(code, { code, name, units: row.units, grade: '' });
  }

  return { semesterTitle, subjects: [...subjects.values()], unreadableCourseCodes: [...unreadable] };
}
