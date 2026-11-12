import { describe, expect, it } from 'vitest';

import { extractCORSubjectsFromText } from '../pdf-parser';

describe('COR course extraction', () => {
  it('reads mixed rows with hyphenated, compact, irregular, and blank sections', () => {
    const result = extractCORSubjectsFromText([
      'School Year: AY 2025-2026 2nd Semester',
      'CLASS SCHEDULE',
      'Course Code Description Units Lec Lab Section',
      'NSTP 11 Civic Welfare 0.0 3.0 0.0 BSIT-P-1A',
      'IT 101 Introduction to Computing 3.0 2.0 1.0 IRREG M 8:00 AM',
      'IT 102 Networking 2 3.0 2.0 1.0 BSIT3A',
      'IT 103 Databases 3.0 2.0 1.0 T 9:00 AM',
      'IT 104 Operating Systems 3.0 2.0 1.0',
      'PATHFit 1 Movement Competency Training 2.0',
      'TOTAL UNITS 14',
      'IT 999 Outside Schedule 3.0',
    ].join('\r\n'));

    expect(result).toEqual({
      semesterTitle: 'AY 2025-2026 2nd Semester',
      unreadableCourseCodes: [],
      subjects: [
        { code: 'NSTP 11', name: 'Civic Welfare', units: 0, grade: '' },
        { code: 'IT 101', name: 'Introduction to Computing', units: 3, grade: '' },
        { code: 'IT 102', name: 'Networking 2', units: 3, grade: '' },
        { code: 'IT 103', name: 'Databases', units: 3, grade: '' },
        { code: 'IT 104', name: 'Operating Systems', units: 3, grade: '' },
        { code: 'PATHFIT 1', name: 'Movement Competency Training', units: 2, grade: '' },
      ],
    });
  });

  it('uses the labeled credit column when lecture and lab hours come first', () => {
    const result = extractCORSubjectsFromText([
      'SCHEDULE',
      'Course Code Description Lecture Hours Lab Hours Credit Units Section',
      'NSTP11 Civic Welfare 3.0 0.0 0.0 IRREG',
    ].join('\n'));

    expect(result.subjects).toEqual([{ code: 'NSTP 11', name: 'Civic Welfare', units: 0, grade: '' }]);
  });

  it('lists unreadable and conflicting rows without importing them', () => {
    const result = extractCORSubjectsFromText([
      'SCHEDULE',
      'IT 101 Missing Credit 2.0 1.0',
      'IT 102 Invalid Credit -1.0 2.0 1.0',
      'IT 103 Ambiguous 1.0 2.0 3.0 4.0 IRREG',
      'IT 104 Conflicting Credit 3.0 2.0 1.0 IRREG',
      'IT 104 Conflicting Credit 2.0',
      'IT 105',
      'IT 106 Valid 3.0',
      'IT 106 Valid 3.0 2.0 1.0 IRREG',
    ].join('\n'));

    expect(result).toMatchObject({
      unreadableCourseCodes: ['IT 101', 'IT 102', 'IT 103', 'IT 104', 'IT 105'],
      subjects: [{ code: 'IT 106', units: 3 }],
    });
  });

  it('ignores course-shaped text outside the schedule', () => {
    const result = extractCORSubjectsFromText('IT 101 Computing 3.0\nSTUDENT NUMBER 12345');

    expect(result).toMatchObject({ subjects: [], unreadableCourseCodes: [] });
  });
});
