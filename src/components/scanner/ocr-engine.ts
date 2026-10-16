// Bicol University GWA Calculator — Client-Side Screenshot OCR Engine
// Powered by Tesseract.js & Canvas Image Preprocessing

import { createWorker, PSM } from 'tesseract.js';
import type { Subject } from '../../types';

export const KNOWN_BU_PREFIXES = [
  'IT ELECT',
  'IT-ELECT',
  'CS ELECT',
  'CS-ELECT',
  'IS ELECT',
  'IS-ELECT',
  'EMC ELECT',
  'EMC-ELECT',
  'IT',
  'CS',
  'IS',
  'EMC',
  'GE ELECT',
  'GE-ELECT',
  'GEC ELECT',
  'GEC-ELECT',
  'FREE ELECT',
  'FREE-ELECT',
  'ELECT',
  'ELEC',
  'GE',
  'GEC',
  'PATHFIT',
  'PATH FIT',
  'PATH',
  'PE',
  'PE ELECT',
  'PE-ELECT',
  'BTL-ELEC',
  'BTL-ELECT',
  'BTL',
  'BTLED',
  'BTLE',
  'TVET',
  'TLE',
  'IA',
  'HE',
  'ICT',
  'MATH',
  'STAT',
  'CHEM',
  'PHYS',
  'BIO',
  'ENV',
  'ES',
  'METEO',
  'ENG',
  'ENGR',
  'CPE',
  'ECE',
  'CE',
  'EE',
  'ME',
  'ARCH',
  'GEO',
  'EM',
  'IE',
  'CHE',
  'NURS',
  'NUR',
  'MED',
  'MEDTECH',
  'MLS',
  'PHARM',
  'MID',
  'PUBHEALTH',
  'EDUC',
  'ED',
  'BEED',
  'BSED',
  'BPED',
  'SNED',
  'ECED',
  'BPE',
  'BSE',
  'BM',
  'BMA',
  'ACT',
  'ACC',
  'BSA',
  'BSBA',
  'BSHM',
  'BSTM',
  'FIN',
  'MKTG',
  'HRM',
  'ENTR',
  'ENTREP',
  'TOUR',
  'HOSP',
  'SOC',
  'SOCIO',
  'HUM',
  'FIL',
  'FILIP',
  'LIT',
  'HIST',
  'POL',
  'POLSCI',
  'PSY',
  'PSYCH',
  'ECON',
  'AB',
  'COMM',
  'JOURN',
  'DEVCOMM',
  'PA',
  'PUBAD',
  'AGRI',
  'AGRIBUS',
  'FOR',
  'FOREST',
  'AGENG',
  'BSAF',
  'BSF',
  'CRIM',
  'CRIMINOLOGY',
  'LAW',
  'JD',
  'LEGAL',
  'NSTP',
  'ROTC',
  'CWTS',
  'LTS',
];

export function isValidBUCoursePrefix(prefix: string): boolean {
  const norm = prefix.trim().toUpperCase().replace(/\s+/g, ' ');
  return KNOWN_BU_PREFIXES.some(
    (p) => norm === p || norm.startsWith(p + ' ') || norm.startsWith(p + '-')
  );
}

export function formatCourseCode(prefix: string, num: string): string {
  let p = prefix.trim().toUpperCase().replace(/\s+/g, ' ');
  let n = num.trim().toUpperCase();

  // Restore eaten decimal point in elective codes: e.g. 201 -> 20.1, 211 -> 21.1, 212 -> 21.2
  if (/^2[0-9][1-9]$/.test(n) && (p.startsWith('GEC') || p.startsWith('GE') || p.includes('ELECT') || p.includes('ELEC'))) {
    n = `${n.slice(0, 2)}.${n.slice(2)}`;
  }

  if (p === 'PATHFIT' || p === 'PATH FIT') p = 'PATHFit';
  else if (p.startsWith('BTL-ELEC') || p.startsWith('BTL ELEC') || p.startsWith('BTL-ELECT')) p = 'BTL-Elec';
  else if (p.startsWith('GEC ELECT') || p.startsWith('GEC-ELECT')) p = 'GEC Elect';
  else if (p.startsWith('IT ELECT') || p.startsWith('IT-ELECT')) p = 'IT Elect';
  else if (p.startsWith('CS ELECT') || p.startsWith('CS-ELECT')) p = 'CS Elect';
  else if (p === 'PHYS') p = 'Phys';
  return `${p} ${n}`;
}

export const BU_COURSE_CODE_REGEX =
  /^([A-Za-z]{2,8}(?:[- ](?:ELECT|ELEC|[A-Za-z]{2,6}))?)\s*[-]?\s*(\d+(?:\.\d+)?(?:[A-Za-z])?)\b/i;

/**
 * Samples the average luminance of a horizontal band within a canvas.
 * Used to detect whether browser chrome (address bar, tabs) is present
 * by comparing the brightness of the top region vs the table content region.
 */
function sampleBandLuminance(
  ctx: CanvasRenderingContext2D,
  width: number,
  yStart: number,
  yEnd: number,
): number {
  const bandHeight = Math.max(1, yEnd - yStart);
  const bandData = ctx.getImageData(0, yStart, width, bandHeight).data;
  let total = 0;
  let count = 0;
  const step = 16; // Sample every 16th pixel for speed
  for (let i = 0; i < bandData.length; i += step) {
    total += 0.299 * bandData[i] + 0.587 * bandData[i + 1] + 0.114 * bandData[i + 2];
    count++;
  }
  return count > 0 ? total / count : 128;
}

/**
 * Detects whether a widescreen image contains browser chrome (tabs, address bar,
 * bookmarks bar) at the top by comparing luminance between the top strip and
 * the middle content strip.
 *
 * Browser chrome creates a distinctly brighter or darker band compared to the
 * uniform table content below. A large luminance delta (> 30) indicates chrome
 * is present and safe to crop.
 */
export function detectBrowserChrome(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  // Sample the top 12% (browser tabs + address bar + bookmarks bar region)
  const topEnd = Math.floor(height * 0.12);
  const topLum = sampleBandLuminance(ctx, width, 0, topEnd);

  // Sample the middle 30% (where the table content lives)
  const midStart = Math.floor(height * 0.40);
  const midEnd = Math.floor(height * 0.70);
  const midLum = sampleBandLuminance(ctx, width, midStart, midEnd);

  // A luminance delta > 30 means the top region is visually distinct from the
  // table area — browser chrome is present. If delta is small, the image was
  // already cropped/zoomed to just the table and no chrome exists.
  const CHROME_LUMINANCE_THRESHOLD = 30;
  return Math.abs(topLum - midLum) > CHROME_LUMINANCE_THRESHOLD;
}

/**
 * Preprocesses a screenshot to dramatically increase OCR accuracy:
 * 1. Content-aware cropping: detects browser chrome via luminance band analysis
 *    before cropping, preventing data loss on pre-cropped/zoomed screenshots
 * 2. High-quality scaling: scales small screenshots so font height is optimal for Tesseract OCR
 * 3. Automatic dark mode detection and inversion to crisp black text on white background
 * 4. Contrast stretching: preserves decimal points while pushing backgrounds to pure white
 */
export function preprocessGradeScreenshot(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const aspectRatio = image.naturalHeight / image.naturalWidth;
  let cropTop = 0;
  let cropBottom = 0;

  if (aspectRatio < 0.8) {
    // Widescreen image detected (e.g. 16:9 desktop capture or cropped table).
    // Instead of blindly cropping 35%, probe whether browser chrome actually
    // exists by comparing the luminance of the top strip vs the middle content.
    // Draw full image onto a temporary probe canvas at low resolution for speed.
    const probeWidth = Math.min(image.naturalWidth, 512);
    const probeScale = probeWidth / image.naturalWidth;
    const probeHeight = Math.round(image.naturalHeight * probeScale);

    const probeCanvas = document.createElement('canvas');
    probeCanvas.width = probeWidth;
    probeCanvas.height = probeHeight;
    const probeCtx = probeCanvas.getContext('2d', { willReadFrequently: true });

    if (probeCtx) {
      probeCtx.drawImage(image, 0, 0, probeWidth, probeHeight);
      const hasBrowserChrome = detectBrowserChrome(probeCtx, probeWidth, probeHeight);

      if (hasBrowserChrome) {
        // Full desktop capture with tabs/URL bar/bookmarks — crop them out
        cropTop = Math.floor(image.naturalHeight * 0.35);
        // Crop bottom 9% to cleanly eliminate Windows/macOS taskbars (~52px)
        cropBottom = Math.floor(image.naturalHeight * 0.09);
      }
      // Otherwise: already a clean crop/zoom of the table — keep 100%
    }
  } else if (aspectRatio > 1.8) {
    // Tall mobile phone capture (e.g. 1080x2400)
    // Crop out status bar (clock, battery) and bottom home gesture pill
    cropTop = Math.floor(image.naturalHeight * 0.04);
    cropBottom = Math.floor(image.naturalHeight * 0.04);
  }

  const sourceHeight = Math.max(10, image.naturalHeight - cropTop - cropBottom);
  const sourceWidth = image.naturalWidth;

  // Scale small screenshots up to optimal resolution (target width ~2800px to 3200px)
  // Ensures 6px fonts in 1024px captures become ~18-20px glyphs with sharp stems
  const scale = Math.max(1.8, Math.min(3.2, 3000 / sourceWidth));
  const targetWidth = Math.round(sourceWidth * scale);
  const targetHeight = Math.round(sourceHeight * scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    0,
    cropTop,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight,
  );

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;

  // Measure luminance across the cropped table area
  let totalLuminance = 0;
  const sampleStep = 16;
  let sampleCount = 0;
  for (let i = 0; i < data.length; i += sampleStep) {
    totalLuminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sampleCount++;
  }
  const isDarkMode = totalLuminance / sampleCount < 128;

  // Grayscale + Inversion (if dark) + Green Dot Badge Suppression + Adaptive Contrast
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    if (isDarkMode) {
      gray = 255 - gray;
    }

    // Suppress green dot badge (●) next to grades by detecting high green saturation
    const isGreenDot = g > 80 && g > r * 1.25 && g > b * 1.25;
    if (isGreenDot) {
      gray = 255;
    } else {
      // Linear contrast stretching with smooth tone curve (preserves anti-aliased font edges)
      if (gray > 220) {
        gray = 255;
      } else if (gray < 70) {
        gray = 0;
      } else {
        gray = Math.round(((gray - 70) / 150) * 255);
      }
    }

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export type OCRWorker = Awaited<ReturnType<typeof createWorker>>;

/**
 * Creates and configures a shared Tesseract worker for batch OCR processing.
 */
export async function createOCRWorker(onProgress?: (percent: number) => void): Promise<OCRWorker> {
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

  return worker;
}

/**
 * Runs client-side OCR on preprocessed canvas using PSM.SINGLE_BLOCK and preserve_interword_spaces
 * to maintain strict column boundaries across table cells.
 * Accepts an optional existing worker to avoid re-instantiating WebAssembly instances in batch runs.
 */
export async function scanScreenshotCanvas(
  canvas: HTMLCanvasElement,
  onProgress?: (percent: number) => void,
  existingWorker?: OCRWorker,
): Promise<Subject[]> {
  const shouldTerminate = !existingWorker;
  const worker = existingWorker || (await createOCRWorker(onProgress));

  try {
    const { data } = await worker.recognize(canvas);
    return parseOCRTextToSubjects(data.text);
  } finally {
    if (shouldTerminate) {
      await worker.terminate();
    }
  }
}

/**
 * Heals common OCR optical confusions on Bicol University course lines:
 * 1. "17120" -> "IT 120", "1T120" -> "IT 120" (sans-serif IT misread as 17 or 1T)
 * 2. "17 ELECT" -> "IT ELECT", "1T ELECT" -> "IT ELECT"
 * 3. "GEC12" -> "GEC 12" (insert missing space between letters and numbers)
 */
function healOcrLine(line: string): string {
  let clean = line.trim().replace(/^[^a-zA-Z0-9]+/, '');

  // 1. Heal NSTP variations: sans-serif 11 misread as TM, TN, NM, TH, TI, II, ll, 1T, 1I, 1M, IM, 1
  clean = clean.replace(/^NSTP\s*(?:TM|TN|NM|TH|TI|II|ll|1T|1I|1M|IM|1)\b/i, 'NSTP 11');
  clean = clean.replace(/^NSTP\s*(?:12|1Z|T2|N2|TZ|2M|ZM)\b/i, 'NSTP 12');

  // 2. Heal GEC variations:
  // Heal missing course number before known Bicol University general education subjects
  clean = clean.replace(/^GEC\s+(?=Understanding)/i, 'GEC 11 ');
  clean = clean.replace(/^GEC\s+(?=Readings)/i, 'GEC 12 ');
  clean = clean.replace(/^GEC\s+(?=The Contemporary|Contemporary)/i, 'GEC 13 ');
  clean = clean.replace(/^GEC\s+(?=Mathematics|Math)/i, 'GEC 14 ');
  clean = clean.replace(/^GEC\s+(?=Purposive)/i, 'GEC 15 ');
  clean = clean.replace(/^GEC\s+(?=Art)/i, 'GEC 16 ');
  clean = clean.replace(/^GEC\s+(?=Science)/i, 'GEC 17 ');
  clean = clean.replace(/^GEC\s+(?=Ethics)/i, 'GEC 18 ');
  clean = clean.replace(/^GEC\s+(?=Living)/i, 'GEC 20.1 ');

  // GEC 1-9 -> GEC 11-19 (leading 1 dropped by OCR in sans-serif)
  clean = clean.replace(/^GEC\s*([1-9])\b/i, 'GEC 1$1');
  clean = clean.replace(/^GEC\s*(?:TM|TN|NM|TH|TI|II|ll|1T|1I|1M|IM)\b/i, 'GEC 11');
  clean = clean.replace(/^GECT([0-9]+)\b/i, 'GEC 1$1');
  clean = clean.replace(/^GEC\s*1A\b/i, 'GEC 14');
  clean = clean.replace(/^GEC\s*1S\b/i, 'GEC 15');

  // 3. Sans-serif vertical stem ("fencepost") repairs for IT and numbers:
  clean = clean.replace(/^(?:17|1T|1E|IE|TT|II)\s*(\d{2,3}[A-Z]?)\b/i, 'IT $1');
  clean = clean.replace(/^(?:17|1T|1E|IE)\s*ELECT\b/i, 'IT ELECT');

  // Heal IT 111 fencepost merging: TH, T11, T111, 1T111, 17111
  clean = clean.replace(/^(?:TH|T11|T111)\s+(?=Platform|Systems|Integrat|om\b|[A-Za-z])/i, 'IT 111 ');
  clean = clean.replace(/^(?:TH|T11|T111)\b/i, 'IT 111');
  clean = clean.replace(/\b(?:om\s+Tecmobges|om\s+Technologies)\b/i, 'Platform Technologies');

  // Heal IT 114 stem collisions: ne, nE
  clean = clean.replace(/^(?:ne|nE)\s+(?=Networking|Information|Assurance|Security|[A-Za-z])/i, 'IT 114 ');
  clean = clean.replace(/^(?:ne|nE)\b/i, 'IT 114');

  // Heal IT 13 -> IT 113 (middle 1 absorbed in sans-serif)
  clean = clean.replace(/\bIT\s*13\b(?!\d)/i, 'IT 113');

  // 4. Heal IT 107 -> IT 101 when followed by Introduction to Computing
  if (/^IT\s*107\s+Intro/i.test(clean)) {
    clean = clean.replace(/^IT\s*107/i, 'IT 101');
  }

  // 5. Heal Phys without a number -> Phys 1
  clean = clean.replace(/^Phys\b(?!\s*\d)/i, 'Phys 1');

  // 6. Heal IT 19 -> IT 119 (Bicol University curriculum code)
  clean = clean.replace(/\bIT\s+19\b/i, 'IT 119');

  // 7. Normalize PATH Fit -> PATHFit
  clean = clean.replace(/^PATH\s+Fit\b/i, 'PATHFit');
  clean = clean.replace(/^PATHFIT\s*[TI1]\b/i, 'PATHFit 1');
  clean = clean.replace(/^PATHFIT\s*[Z2]\b/i, 'PATHFit 2');
  clean = clean.replace(/^PATHFIT\s*[E3]\b/i, 'PATHFit 3');
  clean = clean.replace(/^PATHFIT\s*[A4]\b/i, 'PATHFit 4');

  // 8. Insert space between prefixes and numbers if stuck together: "GEC12" -> "GEC 12", "IT121" -> "IT 121", "PATHFIT1" -> "PATHFit 1"
  clean = clean.replace(/^([A-Za-z]{2,8})(\d+)/i, '$1 $2');
  clean = clean.replace(/^([A-Za-z]+[- ](?:ELECT|ELEC))(\d+)/i, '$1 $2');

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

  // Not a valid academic grade in the Philippine / BU grading scale (1.00 - 5.00)
  return '';
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
    /Search/i,
    /localhost/i,
    /\b(?:ENG|US|PM|AM)\b.*\b\d{1,2}:\d{2}\b/i,
  ];

  // Regex matching candidate unit/grade tokens at column positions
  const tokenRegex = /\b(\d+(?:\.\d+)?|an|\d+[s.]|[1-5]\.\d+|INC|DRP)\b/gi;

  lines.forEach((line) => {
    const cleanLine = healOcrLine(line);
    if (!cleanLine || cleanLine.length < 6) return;

    if (ignorePatterns.some((pattern) => pattern.test(cleanLine))) return;

    // Strip trailing remarks (e.g. PASSED, FASSTO, PASSO, PEE, BA, PARE, VEST, BST, INE, Led, tel, etc.)
    const cleanedLine = cleanLine
      .replace(
        /\b(?:PASSED|PASSID|PASSIO|PASSO|FASSTO|PasLE0|PEE|BA|PARE|VEST|BST|INE|Led|tel|FAILED|INCOMPLETE|DROPPED)(?:[- ]?\d+)?\b.*$/i,
        ''
      )
      .replace(/\s+[a-zA-Z]{1,2}$/, '')
      .trim();

    const tokens = [...cleanedLine.matchAll(tokenRegex)];
    if (tokens.length < 2) return;

    // Strip trailing OCR artifacts (dot badge, checkbox, or stray symbols after grade)
    while (tokens.length >= 5) {
      const lastTokenVal = tokens[tokens.length - 1][0].trim().toLowerCase();
      const secondLastVal = tokens[tokens.length - 2][0].trim();
      const isSecondLastGrade = /^(?:[1-5]\.\d+|[1-5]\b|INC|DRP)$/i.test(secondLastVal);
      if (
        isSecondLastGrade &&
        (lastTokenVal === '0' ||
          lastTokenVal === '0.0' ||
          lastTokenVal === 'o' ||
          lastTokenVal === 'c')
      ) {
        tokens.pop();
      } else {
        break;
      }
    }

    let units = 3.0;
    let lec = 3.0;
    let lab = 0.0;
    let grade = '';
    let unitsTokenIndex = -1;

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

      units = normalizeUnits(unitsToken[0]);
      lec = normalizeUnits(lecToken[0]);
      lab = normalizeLabUnits(labToken[0]);
      grade = normalizeGrade(gradeToken[0]);

      if (!grade || grade === '0' || grade === '0.0') {
        grade = normalizeGrade(labToken[0]);
      }
      unitsTokenIndex = unitsToken.index ?? -1;
    } else if (tokens.length >= 2) {
      const two = tokens.slice(-2);
      const unitsToken = two[0];
      const gradeToken = two[1];

      grade = normalizeGrade(gradeToken[0]);
      units = normalizeUnits(unitsToken[0]);
      unitsTokenIndex = unitsToken.index ?? -1;
    }

    // Must have a valid academic grade and units token position
    if (!grade || unitsTokenIndex < 0) return;

    // The text preceding the units column contains [Code] [Course Description]
    const rowHeader = cleanedLine.substring(0, unitsTokenIndex).trim();
    if (!rowHeader) return;

    let code = '';
    let courseName = '';

    const codeMatch = rowHeader.match(BU_COURSE_CODE_REGEX);
    if (codeMatch && isValidBUCoursePrefix(codeMatch[1].trim())) {
      code = formatCourseCode(codeMatch[1], codeMatch[2]);
      courseName = rowHeader.substring(codeMatch[0].length).trim();
    } else {
      // Resilient fallback: Known prefix without numbers (e.g. "GEC Understanding the Self")
      const prefixMatch = rowHeader.match(/^([A-Za-z]{2,8}(?:[- ](?:ELECT|ELEC|[A-Za-z]{2,6}))?)\s+([A-Za-z].*)$/i);
      if (prefixMatch && isValidBUCoursePrefix(prefixMatch[1].trim())) {
        const rawPrefix = prefixMatch[1].trim();
        const rest = prefixMatch[2].trim();
        if (/^Understanding/i.test(rest)) code = 'GEC 11';
        else if (/^Readings/i.test(rest)) code = 'GEC 12';
        else if (/^The Contemporary|Contemporary/i.test(rest)) code = 'GEC 13';
        else if (/^Mathematics|Math/i.test(rest)) code = 'GEC 14';
        else if (/^Purposive/i.test(rest)) code = 'GEC 15';
        else if (/^Art/i.test(rest)) code = 'GEC 16';
        else if (/^Science/i.test(rest)) code = 'GEC 17';
        else if (/^Ethics/i.test(rest)) code = 'GEC 18';
        else if (/^Living/i.test(rest)) code = 'GEC 20.1';
        else if (/^Intro/i.test(rest)) code = 'IT 101';
        else if (/^Computer Prog/i.test(rest)) code = 'IT 102';
        else if (/^Physics/i.test(rest)) code = 'Phys 1';
        else if (/^Movement/i.test(rest)) code = 'PATHFit 1';
        else if (/^CWTS|LTS|ROTC/i.test(rest)) code = 'NSTP 11';
        else code = rawPrefix.toUpperCase();

        courseName = rest;
      } else {
        // Universal Token Extraction: Never drop a row with valid academic units and grade!
        const words = rowHeader.split(/\s+/);
        if (words.length >= 2) {
          const joinedCodeMatch = words[0].match(/^([A-Za-z]{2,8})(\d+(?:\.\d+)?)$/);
          if (joinedCodeMatch) {
            code = formatCourseCode(joinedCodeMatch[1], joinedCodeMatch[2]);
            courseName = words.slice(1).join(' ');
          } else if (/^[A-Za-z]{2,8}$/.test(words[0]) && /^\d+(?:\.\d+)?$/.test(words[1])) {
            code = formatCourseCode(words[0], words[1]);
            courseName = words.slice(2).join(' ');
          } else {
            code = words[0].toUpperCase();
            courseName = words.slice(1).join(' ');
          }
        } else {
          code = rowHeader.toUpperCase();
          courseName = rowHeader;
        }
      }
    }

    if (code.toUpperCase().startsWith('NSTP')) {
      units = 0;
    } else if (
      code.toUpperCase().startsWith('GEC') &&
      !code.toUpperCase().includes('ELECT') &&
      units === 2
    ) {
      units = 3;
    } else if (lec + lab > 0 && (tokens[0]?.[0] === 'an' || units < lec + lab)) {
      units = lec + lab;
    }

    courseName = courseName.replace(/\s+[1-6]\.0$/g, '');
    courseName = courseName.replace(/^[^\w]+|[^\w]+$/g, '').trim();

    // Skip if course name contains obvious OCR noise (e.g. backslashes, taskbar fragments)
    if (/\\|[|~_{}]|\b(?:TT\s+TT|Soa\s+ati|Toa\s+WR)\b/i.test(courseName)) return;

    subjects.push({
      code,
      name: courseName || 'Imported Course',
      units,
      grade,
    });
  });

  return subjects;
}

/**
 * Detects whether OCR text originates from the mobile iBU card-based interface.
 */
export function isMobileCardLayout(rawText: string): boolean {
  // Desktop table header check:
  // Tables feature horizontal column headers containing Code AND Course AND Units/Remarks
  const hasTableHeader =
    /\bCode\b[\s\S]{1,60}\bCourse\b[\s\S]{1,60}\bUnits\b/i.test(rawText);
  if (hasTableHeader) return false;

  // Mobile card screenshots have vertical labeled fields with colons:
  // e.g. "Units: 3.0", "Lec Units: 2.0", "Lab Units: 1.0", "Status: PASSED", "Rating: 1.2"
  return /\b(?:Units|Lec\s+Units|Lab\s+Units|Status|Rating)\s*:\s*[0-9.]+/i.test(
    rawText
  );
}

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

    const match = healed.match(BU_COURSE_CODE_REGEX);
    let isHeader = false;
    let codeStr = '';

    if (match) {
      const prefixStr = match[1].trim();
      if (isValidBUCoursePrefix(prefixStr)) {
        isHeader = true;
        codeStr = formatCourseCode(match[1], match[2]);
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
    const labMatch = line.match(/\bLab(?:\s+Units)?:\s*([0-9.]+)/i);
    if (labMatch) {
      labUnits = normalizeLabUnits(labMatch[1]);
      continue;
    }

    const lecMatch = line.match(/\bLec(?:\s+Units)?:\s*([0-9.]+)/i);
    if (lecMatch) {
      lecUnits = normalizeUnits(lecMatch[1]);
      continue;
    }

    const unitsMatch = line.match(/\b(?:UNits|Units)\s*[:]?\s*([0-9.]+)/i);
    if (unitsMatch) {
      units = normalizeUnits(unitsMatch[1]);
      continue;
    }

    if (!grade) {
      const explicitGradeMatch = line.match(
        /(?:Grade|Final Grade|Rating):\s*([1-5]\.\d+|[1-5]\d{1,2}|INC|DRP)\b/i
      );
      if (explicitGradeMatch) {
        grade = normalizeGrade(explicitGradeMatch[1]);
        continue;
      }

      const lineGradeMatch = line.match(
        /\b([1-5]\.\d{1,2}|INC|DRP)\b(?:\s+(?:PASSED|FAILED|INCOMPLETE|DROPPED))?/i
      );
      if (lineGradeMatch && !/Units/i.test(line)) {
        const candidate = normalizeGrade(lineGradeMatch[1]);
        if (candidate && candidate !== '0' && candidate !== '0.0') {
          grade = candidate;
          continue;
        }
      }
    }

    if (/^(?:PASSED|FAILED|INCOMPLETE|DROPPED)/i.test(line)) {
      continue;
    }

    if (
      !courseName &&
      !line.includes('Faculty') &&
      !line.includes('Evaluation') &&
      line.length > 2
    ) {
      courseName = line.replace(/^[^\w]+|[^\w]+$/g, '').trim();
    }
  }

  if (units === null) {
    if (lecUnits !== null || labUnits !== null) {
      units = (lecUnits || 0) + (labUnits || 0);
    } else {
      units = card.code.toUpperCase().startsWith('NSTP') ? 0 : 3.0;
    }
  }

  if (card.code.toUpperCase().startsWith('NSTP')) {
    units = 0;
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
 * Automatically switches between Mobile Card Parser and Desktop Table Row Parser,
 * with mutual fallback to prevent dropped courses.
 */
export function parseOCRTextToSubjects(rawText: string): Subject[] {
  if (isMobileCardLayout(rawText)) {
    const mobileResults = parseMobileCardLayout(rawText);
    if (mobileResults.length > 0) return mobileResults;
  }
  const desktopResults = parseDesktopRowLayout(rawText);
  if (desktopResults.length > 0) return desktopResults;

  // Fallback: If desktop parser returned 0, try mobile parser
  return parseMobileCardLayout(rawText);
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
