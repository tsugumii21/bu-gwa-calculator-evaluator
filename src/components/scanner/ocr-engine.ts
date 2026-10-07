// Bicol University GWA Calculator — Client-Side Screenshot OCR Engine
// Powered by Tesseract.js & Canvas Image Preprocessing

import { createWorker, PSM } from 'tesseract.js';
import type { Subject } from '../../types';

const KNOWN_BU_PREFIXES = [
  'IT ELECT',
  'GE ELECT',
  'FREE ELECT',
  'PATHFIT',
  'PATH FIT',
  'PATH',
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
  'CPE',
  'ECE',
  'CE',
  'EE',
  'ME',
  'ARCH',
  'IS',
];

/**
 * Preprocesses a screenshot to dramatically increase OCR accuracy:
 * 1. Safe cropping: only crops top/bottom for tall mobile screenshots (aspect ratio > 1.9)
 * 2. High-quality scaling: scales small screenshots so font height is optimal for Tesseract OCR
 * 3. Automatic dark mode detection and inversion to crisp black text on white background
 * 4. Contrast stretching: preserves decimal points while pushing backgrounds to pure white
 */
export function preprocessGradeScreenshot(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // Only auto-crop status/home bar if aspect ratio indicates a tall phone screenshot
  const isTallPhoneScreenshot = image.naturalHeight / image.naturalWidth > 1.9;
  const cropTop = isTallPhoneScreenshot ? Math.floor(image.naturalHeight * 0.04) : 0;
  const cropBottom = isTallPhoneScreenshot ? Math.floor(image.naturalHeight * 0.04) : 0;
  const sourceHeight = Math.max(10, image.naturalHeight - cropTop - cropBottom);

  // Scale up small screenshots to optimal OCR resolution (width between 1800px and 2500px)
  const scale = Math.max(1.8, Math.min(2.5, 2400 / image.naturalWidth));
  const targetWidth = Math.round(image.naturalWidth * scale);
  const targetHeight = Math.round(sourceHeight * scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    0,
    cropTop,
    image.naturalWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Measure luminance to detect dark mode
  let totalLuminance = 0;
  const sampleStep = 16;
  let sampleCount = 0;
  for (let i = 0; i < data.length; i += sampleStep) {
    totalLuminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sampleCount++;
  }
  const isDarkMode = totalLuminance / sampleCount < 128;

  // Grayscale + Inversion + Contrast Stretch
  for (let i = 0; i < data.length; i += 4) {
    let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (isDarkMode) {
      gray = 255 - gray;
    }

    // Linear contrast stretch with preserved midtones for small decimal points
    if (gray > 210) {
      gray = 255;
    } else if (gray < 80) {
      gray = 0;
    } else {
      gray = Math.round(((gray - 80) / 130) * 255);
    }

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Runs client-side OCR on preprocessed canvas using PSM.SINGLE_BLOCK and preserve_interword_spaces
 * to maintain strict column boundaries across table cells.
 */
export async function scanScreenshotCanvas(
  canvas: HTMLCanvasElement,
  onProgress?: (percent: number) => void,
): Promise<Subject[]> {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
  });

  const { data } = await worker.recognize(canvas);
  await worker.terminate();

  return parseOCRTextToSubjects(data.text);
}

/**
 * Heals common OCR optical confusions on Bicol University course lines:
 * 1. "17120" -> "IT 120", "1T120" -> "IT 120" (sans-serif IT misread as 17 or 1T)
 * 2. "17 ELECT" -> "IT ELECT", "1T ELECT" -> "IT ELECT"
 * 3. "GEC12" -> "GEC 12" (insert missing space between letters and numbers)
 */
function healOcrLine(line: string): string {
  let clean = line.trim().replace(/^[^a-zA-Z0-9]+/, '');

  // Heal 17/1T misread for IT before subject numbers: "17120" -> "IT 120", "1T 120" -> "IT 120", "1T102" -> "IT 102"
  clean = clean.replace(/^(?:17|1T)\s*(\d{2,3}[A-Z]?)\b/i, 'IT $1');
  clean = clean.replace(/^(?:17|1T)\s*ELECT\b/i, 'IT ELECT');

  // Heal GECT1 -> GEC 11, GECT(\d) -> GEC 1$1
  clean = clean.replace(/^GEC\s*T(\d+)/i, 'GEC 1$1');

  // Heal NSTP 1 at start where it should be NSTP 11
  clean = clean.replace(/^NSTP\s+1\b/i, 'NSTP 11');

  // Heal IT 19 -> IT 119 (Bicol University curriculum code)
  clean = clean.replace(/\bIT\s+19\b/i, 'IT 119');

  // Insert space between known prefixes and numbers if stuck together: "GEC12" -> "GEC 12", "IT121" -> "IT 121", "PATHFIT1" -> "PATHFit 1"
  clean = clean.replace(/^(GEC|IT|CS|MATH|ENG|CHEM|BIO|PHYS|PE|NSTP|PATHFIT|PATH)(\d+)/i, '$1 $2');

  return clean;
}

/**
 * Normalizes units extracted by OCR (e.g. 3.0, 3, or OCR reading 30 for 3.0).
 */
function normalizeUnits(val: string): number {
  if (!val || val === 'an') return 3.0;
  const num = parseFloat(val);
  if (isNaN(num)) return 3.0;
  if (num >= 10 && num <= 60 && num % 10 === 0) {
    return num / 10;
  }
  if (num >= 0 && num <= 6) {
    return num;
  }
  return 3.0;
}

/**
 * Normalizes laboratory units (allows 0.0, 0, or integers).
 */
function normalizeLabUnits(val: string): number {
  if (!val || val === '0' || val === '0.0' || val === '00') return 0;
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  if (num >= 10 && num <= 60 && num % 10 === 0) {
    return num / 10;
  }
  if (num >= 0 && num <= 6) {
    return num;
  }
  return 0;
}

/**
 * Normalizes academic grades (1.0 to 5.0, INC, DRP, handling missing decimal points).
 */
function normalizeGrade(val: string): string {
  if (!val) return '';
  let clean = val.toUpperCase().trim();
  clean = clean.replace(/[^0-9.INCDRP]/g, '');

  if (clean === 'INC' || clean === 'DRP') return clean;

  const num = parseFloat(clean);
  if (!isNaN(num)) {
    // In BU and the Philippine grading system, a grade of 0 does not exist (it is the green dot badge)
    if (num === 0) return '';

    if (num >= 1.0 && num <= 5.0) {
      return clean.includes('.') ? clean : num.toFixed(1);
    }
    // Handle OCR missing decimal points: 17 -> 1.7, 12 -> 1.2, 120 -> 1.2, 125 -> 1.25
    if (num >= 10 && num <= 50) {
      return (num / 10).toFixed(1);
    }
    if (num >= 100 && num <= 500) {
      if (num % 10 === 0) {
        return (num / 100).toFixed(1);
      }
      return (num / 100).toFixed(2);
    }
  }

  return clean;
}

/**
 * Desktop table row parser using Right-to-Left Reverse Token Anchoring.
 */
export function parseDesktopRowLayout(rawText: string): Subject[] {
  const lines = rawText.split('\n');
  const subjects: Subject[] = [];

  // Ignore table headers, page titles, and portal navigation text
  const ignorePatterns = [
    /Code\s+Course/i,
    /Class\s+Schedules/i,
    /Academic\s+Records/i,
    /Student\s+Portal/i,
    /To\s+view\s+your\s+grades/i,
    /Faculty\s+Evaluations/i,
    /Payments/i,
    /Registration/i,
    /Ask\s+Gemini/i,
    /All\s+Bookmarks/i,
  ];

  // BU course code regex at start of line: "IT Elect 3", "IT 120", "IT121", "GEC 12"
  const codeRegex = /^([A-Z]{2,6}(?:\s+ELECT)?)\s*[-]?\s*(\d+[A-Z]?)\b/i;

  // Regex matching candidate unit/grade tokens at column positions
  const tokenRegex = /\b(\d+(?:\.\d+)?|an|\d+[s.]|[1-5]\.\d+|INC|DRP)\b/gi;

  lines.forEach((line) => {
    const cleanLine = healOcrLine(line);
    if (!cleanLine || cleanLine.length < 6) return;

    if (ignorePatterns.some((pattern) => pattern.test(cleanLine))) return;

    const codeMatch = cleanLine.match(codeRegex);
    if (!codeMatch) return;

    const prefix = codeMatch[1].trim().toUpperCase();
    const isBUCode = KNOWN_BU_PREFIXES.some((p) => prefix.startsWith(p));
    if (!isBUCode) return;

    const code = `${codeMatch[1].trim().toUpperCase()} ${codeMatch[2].trim().toUpperCase()}`.replace(/\s+/g, ' ');
    const codeEndIdx = cleanLine.indexOf(codeMatch[0]) + codeMatch[0].length;
    const textAfterCode = cleanLine.substring(codeEndIdx).trim();

    // Find all candidate numeric/grade tokens in the line after code
    const tokens = [...textAfterCode.matchAll(tokenRegex)];

    // Scenario A: 4 or more tokens (Units, Lec, Lab, Grade [Dot])
    if (tokens.length >= 4) {
      if (tokens.length >= 5) {
        const lastTokenStr = tokens[tokens.length - 1][0].trim().toLowerCase();
        if (lastTokenStr === '0' || lastTokenStr === '0.0' || lastTokenStr === 'o') {
          tokens.pop();
        }
      }

      const four = tokens.slice(-4);
      const unitsToken = four[0];
      const lecToken = four[1];
      const labToken = four[2];
      const gradeToken = four[3];

      let units = normalizeUnits(unitsToken[0]);
      const lec = normalizeUnits(lecToken[0]);
      const lab = normalizeLabUnits(labToken[0]);
      let grade = normalizeGrade(gradeToken[0]);

      if (!grade || grade === '0' || grade === '0.0') {
        grade = normalizeGrade(labToken[0]);
      }

      if (lec + lab > 0 && (unitsToken[0] === 'an' || units < lec + lab)) {
        units = lec + lab;
      }

      const courseEndIdx = unitsToken.index ?? 0;
      let courseName = textAfterCode.substring(0, courseEndIdx).trim();
      courseName = courseName.replace(/\s+[1-6]\.0$/g, '');
      courseName = courseName.replace(/^[^\w]+|[^\w]+$/g, '').trim();

      subjects.push({
        code,
        name: courseName || 'Imported Course',
        units,
        grade,
      });
      return;
    }

    // Scenario B: 2 tokens (Units, Grade) e.g. for simplified views
    if (tokens.length >= 2) {
      const two = tokens.slice(-2);
      const unitsToken = two[0];
      const gradeToken = two[1];

      const units = normalizeUnits(unitsToken[0]);
      const grade = normalizeGrade(gradeToken[0]);

      const courseEndIdx = unitsToken.index ?? 0;
      let courseName = textAfterCode.substring(0, courseEndIdx).trim();
      courseName = courseName.replace(/\s+[1-6]\.0$/g, '');
      courseName = courseName.replace(/^[^\w]+|[^\w]+$/g, '').trim();

      subjects.push({
        code,
        name: courseName || 'Imported Course',
        units,
        grade,
      });
      return;
    }
  });

  return subjects;
}

/**
 * Detects whether OCR text originates from the mobile iBU card-based interface.
 */
export function isMobileCardLayout(rawText: string): boolean {
  return (
    /\b(?:UNits|Units):\s*[0-9.]+/i.test(rawText) ||
    /\bLec\s+Units:/i.test(rawText) ||
    /\bLab\s+Units:/i.test(rawText)
  );
}

const cardCodeRegex = /^([A-Z]{2,10}(?:\s+ELECT)?)\s*[-]?\s*(\d+[A-Z]?)\b/i;

/**
 * Mobile Card Parser for iBU portal screenshots where each course is rendered
 * across multiple vertical lines with labels (Units, Lec Units, Lab Units, Status).
 */
export function parseMobileCardLayout(rawText: string): Subject[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const subjects: Subject[] = [];

  let currentCard: {
    code: string;
    headerLine: string;
    codeEndIndex: number;
    lines: string[];
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const healed = healOcrLine(rawLine);

    const match = healed.match(cardCodeRegex);
    let isHeader = false;
    let codeStr = '';

    if (match) {
      const prefixStr = match[1].trim().toUpperCase().replace(/\s+/g, ' ');
      if (KNOWN_BU_PREFIXES.some((p) => prefixStr.startsWith(p) || p.startsWith(prefixStr))) {
        isHeader = true;
        codeStr = `${match[1].trim()} ${match[2].trim()}`.toUpperCase().replace(/\s+/g, ' ');
      }
    }

    if (isHeader) {
      if (currentCard && (currentCard.code || currentCard.lines.length > 0)) {
        subjects.push(finalizeMobileCard(currentCard));
      }
      currentCard = {
        code: codeStr,
        headerLine: healed,
        codeEndIndex: match ? match[0].length : 0,
        lines: [],
      };
      continue;
    }

    if (currentCard) {
      currentCard.lines.push(rawLine);
    }
  }

  if (currentCard && (currentCard.code || currentCard.lines.length > 0)) {
    subjects.push(finalizeMobileCard(currentCard));
  }

  return subjects.filter((s) => s.code && (s.name || s.grade));
}

function finalizeMobileCard(card: {
  code: string;
  headerLine: string;
  codeEndIndex: number;
  lines: string[];
}): Subject {
  const afterCode = card.headerLine.substring(card.codeEndIndex).trim();
  let grade = '';

  const gradeMatches = [...afterCode.matchAll(/\b([1-5]\.\d+|[1-5]\d{1,2}|INC|DRP)\b/gi)];
  if (gradeMatches.length > 0) {
    grade = normalizeGrade(gradeMatches[0][0]);
  } else if (/\bMe\b/i.test(afterCode)) {
    grade = '1.1';
  }

  let courseName = '';
  let units: number | null = null;
  let lecUnits: number | null = null;
  let labUnits: number | null = null;

  for (const line of card.lines) {
    const labMatch = line.match(/\bLab\s+Units:\s*([0-9.]+)/i);
    if (labMatch) {
      labUnits = normalizeLabUnits(labMatch[1]);
      continue;
    }

    const lecMatch = line.match(/\bLec\s+Units:\s*([0-9.]+)/i);
    if (lecMatch) {
      lecUnits = normalizeUnits(lecMatch[1]);
      continue;
    }

    const unitsMatch = line.match(/\b(?:UNits|Units):\s*([0-9.]+)/i);
    if (unitsMatch) {
      units = normalizeUnits(unitsMatch[1]);
      continue;
    }

    if (/^(?:PASSED|FAILED|INCOMPLETE|DROPPED)/i.test(line)) {
      continue;
    }

    if (!courseName && !line.includes('Faculty') && !line.includes('Evaluation') && line.length > 2) {
      courseName = line.replace(/^[^\w]+|[^\w]+$/g, '').trim();
    }
  }

  if (units === null) {
    if (lecUnits !== null || labUnits !== null) {
      units = (lecUnits || 0) + (labUnits || 0);
    } else {
      units = card.code.startsWith('NSTP') ? 0 : 3.0;
    }
  }

  return {
    code: card.code,
    name: courseName || 'Imported Course',
    units: units ?? 3.0,
    grade: grade || '1.0',
  };
}

/**
 * Parses raw OCR text into structured Subject records.
 * Automatically switches between Mobile Card Parser and Desktop Table Row Parser.
 */
export function parseOCRTextToSubjects(rawText: string): Subject[] {
  if (isMobileCardLayout(rawText)) {
    return parseMobileCardLayout(rawText);
  }
  return parseDesktopRowLayout(rawText);
}

function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeTitle(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function scoreSubjectQuality(sub: Subject): number {
  let score = 0;
  const cleanCode = normalizeCode(sub.code);
  if (cleanCode && cleanCode.length >= 4) score += 10;
  if (/\b(?:11|12|13|14|15|101|102|103|1|2)\b/.test(sub.code)) score += 5;

  if (sub.name && sub.name !== 'Imported Course' && sub.name.length > 3) {
    score += 15;
  }

  if (typeof sub.units === 'number') {
    if (sub.units > 0) score += 10;
    else if (sub.units === 0 && cleanCode.startsWith('NSTP')) score += 10;
  }

  if (sub.grade && sub.grade !== '') {
    score += 10;
    if (sub.grade !== '1.0' && sub.grade !== '1') score += 5;
  }

  return score;
}

/**
 * Deduplicates subjects across multiple overlapping screenshots (e.g. from 2-3 screenshots)
 * using two-tier matching (Course Code + Course Name) and completeness scoring.
 */
export function mergeMultiScreenshotResults(screenshotBatches: Subject[][]): Subject[] {
  const merged: Subject[] = [];

  for (const batch of screenshotBatches) {
    for (const subject of batch) {
      const codeKey = normalizeCode(subject.code);
      const titleKey = normalizeTitle(subject.name);

      if (!codeKey && !titleKey) continue;

      // Find match either by Code OR by Course Title
      const existingIndex = merged.findIndex((item) => {
        const itemCodeKey = normalizeCode(item.code);
        const itemTitleKey = normalizeTitle(item.name);

        const codeMatch = Boolean(codeKey && itemCodeKey && codeKey === itemCodeKey);
        const titleMatch = Boolean(
          titleKey &&
          itemTitleKey &&
          titleKey.length > 5 &&
          itemTitleKey.length > 5 &&
          titleKey === itemTitleKey
        );

        return codeMatch || titleMatch;
      });

      if (existingIndex === -1) {
        merged.push({ ...subject });
      } else {
        const existing = merged[existingIndex];
        const existingScore = scoreSubjectQuality(existing);
        const newScore = scoreSubjectQuality(subject);

        if (newScore > existingScore) {
          // Replace with higher quality card, keeping any missing fields from existing
          merged[existingIndex] = {
            code: subject.code || existing.code,
            name: (subject.name && subject.name !== 'Imported Course') ? subject.name : existing.name,
            units: (subject.units !== undefined && subject.units !== null) ? subject.units : existing.units,
            grade: subject.grade || existing.grade,
          };
        } else {
          // Keep existing, merge any missing fields from new subject
          if ((!existing.name || existing.name === 'Imported Course') && subject.name) {
            existing.name = subject.name;
          }
          if ((!existing.grade || existing.grade === '1.0') && subject.grade && subject.grade !== '1.0') {
            existing.grade = subject.grade;
          }
          if ((existing.units === undefined || existing.units === null) && subject.units !== undefined) {
            existing.units = subject.units;
          }
        }
      }
    }
  }

  return merged;
}
