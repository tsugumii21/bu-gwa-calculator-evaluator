import { isValidBUGrade } from './constants';
import type { ScanBox, ScanCandidate, ScanWord } from '../types/scan';

const LOW_CONFIDENCE = 65;
const centerX = (word: ScanWord) => (word.bbox.x0 + word.bbox.x1) / 2;
const centerY = (word: ScanWord) => (word.bbox.y0 + word.bbox.y1) / 2;
const normalized = (word: ScanWord) => word.text.replace(/[^a-z]/gi, '').toLowerCase();

function headerColumns(words: ScanWord[]) {
  const grade = words.find(word => normalized(word) === 'grade');
  if (!grade) return null;
  const height = grade.bbox.y1 - grade.bbox.y0;
  const line = words.filter(word => Math.abs(centerY(word) - centerY(grade)) < height).sort((a, b) => centerX(a) - centerX(b));
  const units = line.find(word => normalized(word) === 'units');
  const lec = line.find(word => normalized(word) === 'lec');
  const lab = line.find(word => normalized(word) === 'lab');
  const remarks = line.find(word => normalized(word) === 'remarks');
  if (!units || !lec || !lab || !line.some(word => normalized(word) === 'code')) return null;
  return { units: centerX(units), lec: centerX(lec), lab: centerX(lab), grade: centerX(grade),
    remarks: remarks ? centerX(remarks) : centerX(grade) + (centerX(grade) - centerX(lab)), bottom: grade.bbox.y1 };
}

function wordRows(words: ScanWord[]): ScanWord[][] {
  const rows: ScanWord[][] = [];
  for (const word of [...words].sort((a, b) => centerY(a) - centerY(b))) {
    const row = rows.find(items => Math.abs(centerY(items[0]) - centerY(word)) < Math.max(8, (word.bbox.y1 - word.bbox.y0) * .8));
    if (row) row.push(word); else rows.push([word]);
  }
  return rows.map(row => row.sort((a, b) => a.bbox.x0 - b.bbox.x0));
}

function numericCell(words: ScanWord[], left: number, right: number, grade = false): string {
  const text = words.filter(word => centerX(word) >= left && centerX(word) < right).map(word => word.text).join('').trim().toUpperCase();
  const cleaned = text.replace(/^[^\dID]+|[^\d.PINC DR]+$/g, '').replace(/\s/g, '');
  if (grade) return isValidBUGrade(cleaned) ? cleaned : '';
  return /^\d+(?:\.\d+)?$/.test(cleaned) ? cleaned : '';
}

function extractCardRows(words: ScanWord[], sourceId: string) {
  const rows = wordRows(words);
  const candidates: ScanCandidate[] = [];
  for (const row of rows) {
    const text = row.map(word => word.text).join(' ').trim();
    const code = text.match(/^([A-Za-z]{2,12}(?:[- ](?:Elect|Elec))?)\s*(\d+(?:\.\d+)?[A-Za-z]?)\b/i);
    if (code) {
      candidates.push({ id: `${sourceId}:${candidates.length}`, code: `${code[1]} ${code[2]}`, name: text.slice(code[0].length).trim(),
        units: null, grade: '', reviewed: false, sourceIds: [sourceId], issues: ['Card or headerless layout: verify each field against the source.'] });
      continue;
    }
    const current = candidates[candidates.length - 1];
    if (!current) continue;
    const units = text.match(/^(?:Total\s+)?Units\s*:?\s*(\d+(?:\.\d+)?)$/i);
    const grade = text.match(/^(?:Final\s+)?Grade\s*:?\s*(\S+)$/i);
    if (units) current.units = Number(units[1]);
    else if (grade && isValidBUGrade(grade[1])) current.grade = grade[1].toUpperCase();
    else if (!current.name && !/^(?:Lec|Lab|Faculty|Evaluation|Remarks|Passed|Failed)/i.test(text)) current.name = text;
  }
  return { candidates, expectedRows: null, issues: ['Row coverage is unknown for this layout. Compare every source row before importing.'] };
}

function candidateFromRow(words: ScanWord[], sourceId: string, index: number, columns: NonNullable<ReturnType<typeof headerColumns>>): ScanCandidate {
  const unitLeft = columns.units - (columns.lec - columns.units) / 2;
  const observedLabel = words.filter(word => centerX(word) < unitLeft).map(word => word.text).join(' ').trim();
  const labelWords = words.filter(word => centerX(word) < unitLeft);
  let codeEnd = labelWords.length;
  for (let i = 1; i < labelWords.length; i++) {
    if (labelWords[i].bbox.x0 - labelWords[i - 1].bbox.x1 > (labelWords[i].bbox.y1 - labelWords[i].bbox.y0) * 1.2) { codeEnd = i; break; }
  }
  const codeWords = labelWords.slice(0, codeEnd);
  const codeBox = codeWords.length ? { x0: codeWords[0].bbox.x0, x1: codeWords[codeWords.length - 1].bbox.x1,
    y0: Math.min(...codeWords.map(w => w.bbox.y0)), y1: Math.max(...codeWords.map(w => w.bbox.y1)) } : undefined;
  const label = observedLabel.replace(/^(?:1T|lT|I T|1 T)(?=\s|\d)/, 'IT');
  const codeMatch = label.match(/^([A-Za-z]{2,12}(?:[- ](?:Elect|Elec))?)\s*(\d+(?:\.\d+)?[A-Za-z]?)\b/i);
  const code = codeMatch ? `${codeMatch[1]} ${codeMatch[2]}` : '';
  const name = codeMatch ? label.slice(codeMatch[0].length).trim() : label;
  const unitsText = numericCell(words, unitLeft, (columns.units + columns.lec) / 2);
  const grade = numericCell(words, (columns.lab + columns.grade) / 2, (columns.grade + columns.remarks) / 2, true);
  const gradeWords = words.filter(word => centerX(word) >= (columns.lab + columns.grade) / 2 && centerX(word) < (columns.grade + columns.remarks) / 2);
  const rawGrade = gradeWords.map(word => word.text).join('').trim();
  const gradeBox = gradeWords.length ? { x0: Math.min(...gradeWords.map(w => w.bbox.x0)), y0: Math.min(...gradeWords.map(w => w.bbox.y0)), x1: Math.max(...gradeWords.map(w => w.bbox.x1)), y1: Math.max(...gradeWords.map(w => w.bbox.y1)) } : undefined;
  const issues: string[] = [];
  if (label !== observedLabel) issues.push('Course-code character normalized; verify against the source.');
  if (!code) issues.push('Course code unreadable.');
  if (!name) issues.push('Course description unreadable.');
  if (!unitsText) issues.push('Total units unreadable.');
  if (!grade) issues.push('Grade unreadable or pending; check source.');
  if (words.some(word => word.confidence < LOW_CONFIDENCE)) issues.push('Some text has low recognition confidence.');
  const bbox: ScanBox | undefined = words.length ? { x0: Math.min(...words.map(w => w.bbox.x0)), y0: Math.min(...words.map(w => w.bbox.y0)), x1: Math.max(...words.map(w => w.bbox.x1)), y1: Math.max(...words.map(w => w.bbox.y1)) } : undefined;
  return { id: `${sourceId}:${index}`, code, name, units: unitsText ? Number(unitsText) : null, grade,
    sourceIds: [sourceId], issues, reviewed: false, bbox, rawGrade, gradeBox, codeBox, rawCode: codeWords.map(word => word.text).join(' '),
    codeConfidence: codeWords.length ? codeWords.reduce((sum, word) => sum + word.confidence, 0) / codeWords.length : 0 };
}

/** Extracts fields by column geometry and retains blank rows found by visual detection. */
export function extractTableRows(words: ScanWord[], sourceId: string, rowEdges: number[] = []) {
  const columns = headerColumns(words);
  if (!columns) return extractCardRows(words, sourceId);
  const body = words.filter(word => word.bbox.y0 > columns.bottom + 2);
  const rows = rowEdges.length >= 2 ? rowEdges.slice(0, -1).map((top, i) => body.filter(word => centerY(word) >= top && centerY(word) < rowEdges[i + 1])) : wordRows(body);
  const candidates = rows.map((row, i) => candidateFromRow(row, sourceId, i, columns));
  return { candidates, expectedRows: rowEdges.length >= 2 ? rows.length : null,
    issues: rowEdges.length >= 2 ? [] : ['Row coverage inferred from text; compare with the source image.'] };
}
