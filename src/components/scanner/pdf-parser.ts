// Bicol University GWA Calculator — Client-Side PDF COR Parser
// Exact logic from legacy js/import-export.js using Unit Anchor Backwards Search

import * as pdfjsLib from 'pdfjs-dist';
import type { Subject } from '../../types';

// Use standard CDN worker fallback
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface PdfCorParseResult {
  semesterTitle: string;
  subjects: Subject[];
}

/**
 * Parses official Bicol University Certificate of Registration (COR) PDF files.
 * Replicates 100% of the extraction logic from js/import-export.js.
 */
export async function parsePdfCOR(file: File): Promise<PdfCorParseResult> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  let extractedText = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    let lastY: number | null = null;
    let pageText = '';

    textContent.items.forEach((item: unknown) => {
      const textItem = item as { str?: string; transform?: number[] };
      const str = textItem.str || '';
      const y = textItem.transform ? textItem.transform[5] : null;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
        pageText += ' ';
      }
      pageText += str;
      if (y !== null) {
        lastY = y;
      }
    });

    extractedText += pageText + '\n';
  }

  return extractCORSubjectsFromText(extractedText);
}

/**
 * Pure BU COR PDF Text Parser using Unit Anchor Backwards Search.
 * Exact implementation from legacy js/import-export.js (lines 85-178).
 */
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

  // 2. Isolate SCHEDULE section text and collapse line breaks into spaces
  let scheduleText = text;
  const schedStart = text.search(/SCHEDULE/i);
  const schedEnd = text.search(/TOTALS:|ASSESSED FEES/i);

  if (schedStart !== -1) {
    if (schedEnd !== -1 && schedEnd > schedStart) {
      scheduleText = text.substring(schedStart, schedEnd);
    } else {
      scheduleText = text.substring(schedStart);
    }
  }

  const cleanSchedule = scheduleText.replace(/\r?\n|\r/g, ' ');

  // Known BU Course prefix codes
  const knownPrefixes = [
    'IT ELECT',
    'GE ELECT',
    'FREE ELECT',
    'IT',
    'GEC',
    'CS',
    'MATH',
    'CHEM',
    'ENG',
    'NURS',
    'EDUC',
    'BM',
    'ACT',
    'NSTP',
    'PE',
    'PHYS',
    'BIO',
    'SOC',
    'HUM',
    'FIL',
    'LIT',
    'HIST',
    'POL',
    'PSY',
    'ECON',
  ];

  // 3. Locate each subject row by finding unit anchors: "3.0 2.0 1.0 BSIT-P-3A" or "3.0 3.0 0.0 BSIT-P-3A"
  const anchorRegex = /(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+([A-Z]{2,6}-[A-Z0-9-]+)/gi;

  let aMatch: RegExpExecArray | null;
  while ((aMatch = anchorRegex.exec(cleanSchedule)) !== null) {
    const creditUnits = parseFloat(aMatch[1]) || 3;
    const anchorIndex = aMatch.index;

    // Inspect text leading up to this unit anchor
    const textBeforeAnchor = cleanSchedule.substring(0, anchorIndex);

    // Search backwards for the last occurrence of a course code matching BU prefixes
    const codeRegex = /(?:IT\s+Elect|GE\s+Elect|FREE\s+Elect|[A-Z]{2,6})\s+\d+[A-Z]?/gi;
    let lastCodeMatch: { code: string; index: number; endIndex: number } | null = null;
    let cMatch: RegExpExecArray | null;

    while ((cMatch = codeRegex.exec(textBeforeAnchor)) !== null) {
      const upper = cMatch[0].toUpperCase();
      if (knownPrefixes.some((p) => upper.startsWith(p))) {
        lastCodeMatch = {
          code: cMatch[0].trim().toUpperCase(),
          index: cMatch.index,
          endIndex: cMatch.index + cMatch[0].length,
        };
      }
    }

    if (lastCodeMatch) {
      // Course description is the exact text between the code end index and unit anchor start index
      let name = textBeforeAnchor.substring(lastCodeMatch.endIndex, anchorIndex).trim();

      // Clean up unwanted artifacts
      name = name.replace(/^Subject\s+/i, '').replace(/^Code\s+/i, '').trim();

      // Avoid duplicates
      if (!newSubjects.some((s) => s.code === lastCodeMatch!.code)) {
        newSubjects.push({
          code: lastCodeMatch.code,
          name: name || 'Scanned Course',
          grade: '',
          units: creditUnits,
        });
      }
    }
  }

  // 4. Fallback if anchors were not detected
  if (newSubjects.length === 0) {
    const lines = text.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const lMatch = trimmed.match(/([A-Z]{2,6}(?:\s+[A-Z0-9]+)?)\s+(.+?)\s+(\d+(?:\.\d+)?)/i);
      if (
        lMatch &&
        lMatch[1].length <= 10 &&
        !lMatch[1].includes('ROOM') &&
        !lMatch[1].includes('CLASS')
      ) {
        const code = lMatch[1].trim().toUpperCase();
        if (!newSubjects.some((s) => s.code === code)) {
          newSubjects.push({
            code,
            name: lMatch[2].trim(),
            grade: '',
            units: parseFloat(lMatch[3]) || 3,
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
