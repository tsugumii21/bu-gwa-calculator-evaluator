import { describe, it, expect } from 'vitest';
import {
  parseDesktopRowLayout,
  parseMobileCardLayout,
  isMobileCardLayout,
  parseOCRTextToSubjects,
  mergeMultiScreenshotResults,
} from '../ocr-engine';

describe('OCR Engine — Desktop Table Parsing', () => {
  it('parses all courses from Screenshot 1 (8 courses)', () => {
    const raw = `
Code Course Units Lec Units Lab Units Grade Remarks
IT 105 Application Dev't and Emerging Tech 3.0 2.0 1.0 1.7 PASSED
IT 112 Integrative Programming and Technologies 1 3.0 2.0 1.0 1.5 PASSED
IT 113 Social Issues and Professional Practice 3.0 3.0 0.0 1.5 PASSED
IT 114 Information Assurance and Security 1 3.0 2.0 1.0 1.9 PASSED
GEC 17 Science, Technology, and Society 3.0 3.0 0.0 1.8 PASSED
GEC 18 Ethics 3.0 3.0 0.0 1.4 PASSED
GEC Elect 21.2 Philippine Indigenous Communities 3.0 3.0 0.0 1.7 PASSED
PATHFit 4 Physical Activity Towards Health and Fitness 4 2.0 2.0 0.0 1.1 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(8);
  });

  it('parses all courses from Screenshot 2 (8 courses)', () => {
    const raw = `
IT 104 Object-Oriented Programming 3.0 2.0 1.0 1.7 PASSED
IT 108 Enterprise Architecture 3.0 3.0 0.0 1.8 PASSED
GEC 13 The Contemporary World 3.0 3.0 0.0 1.9 PASSED
GEC 20.1 Living in the IT Era 3.0 3.0 0.0 1.6 PASSED
BTL-Elec 2 Entrepreneurial Mindset 3.0 3.0 0.0 1.8 PASSED
IT 110 Networking 2 3.0 2.0 1.0 1.6 PASSED
IT 111 Systems Integration and Architecture 1 3.0 2.0 1.0 1.8 PASSED
PATHFit 3 Physical Activity Towards Health and Fitness 3 2.0 2.0 0.0 1.4 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(8);
  });

  it('parses all courses from Screenshot 3 (7 courses)', () => {
    const raw = `
IT 103 Data Structures and Algorithms 3.0 2.0 1.0 1.6 PASSED
IT 107 Networking 1 3.0 2.0 1.0 1.9 PASSED
IT 109 Advanced Database Systems 3.0 2.0 1.0 1.8 PASSED
Gec Elect 21.1 Environmental Science 3.0 3.0 0.0 1.7 PASSED
PATHFit 2 Physical Activity Towards Health and Fitness 2 2.0 2.0 0.0 1.1 PASSED
GEC 15 Purposive Communication 3.0 3.0 0.0 1.8 PASSED
NSTP 12 National Service Training Program 2 0.0 0.0 0.0 1.2 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(7);
  });

  it('parses all courses from Screenshot 4 (7 courses)', () => {
    const raw = `
NSTP 11 National Service Training Program 1 0.0 0.0 0.0 1.2 PASSED
IT 101 Introduction to Computing 3.0 2.0 1.0 1.5 PASSED
IT 102 Fundamentals of Programming 3.0 2.0 1.0 1.6 PASSED
Phys 1 Physics for IT 3.0 2.0 1.0 2.0 PASSED
GEC 11 Understanding the Self 3.0 3.0 0.0 2.1 PASSED
GEC 14 Mathematics in the Modern World 3.0 3.0 0.0 2.5 PASSED
PATHFit 1 Physical Activity Towards Health and Fitness 1 2.0 2.0 0.0 1.1 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(7);
  });

  it('parses latest Year 2 Sem 2 courses with Roman numerals and long titles (8 courses)', () => {
    const raw = `
IT 105 Information Management I 3.0 2.0 1.0 1.1 PASSED
IT 112 Web Systems and Technologies 3.0 2.0 1.0 1.9 PASSED
IT 113 Special Topics in IT 1.0 1.0 0.0 1.9 PASSED
IT 114 Networking 1 3.0 2.0 1.0 1.9 PASSED
GEC 17 Science, Technology, and Society 3.0 3.0 0.0 2.0 PASSED
GEC 18 Ethics 3.0 3.0 0.0 1.8 PASSED
GEC Elect 21.2 People and the Earth's Ecosystem 3.0 3.0 0.0 1.4 PASSED
PATHFit 4 Menu of Dance, Sports, Martial Arts, Group Exercise, Outdoor and Adventure Activities 2.0 2.0 0.0 1.4 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(8);
    expect(subjects[0].name).toBe('Information Management I');
    expect(subjects[0].grade).toBe('1.1');
    expect(subjects[2].units).toBe(1.0);
    expect(subjects[2].grade).toBe('1.9');
    expect(subjects[6].code).toBe('GEC Elect 21.2');
    expect(subjects[7].code).toBe('PATHFit 4');
  });

  it('parses latest Year 1 Sem 1 & 2 with CWTS/LTS/ROTC slashes (7 courses)', () => {
    const raw = `
NSTP 11 CWTS/LTS/ROTC 0.0 0.0 0.0 1.2 PASSED
IT 101 Introduction to Computing 3.0 2.0 1.0 2.0 PASSED
IT 102 Computer Programming 1 3.0 2.0 1.0 2.0 PASSED
Phys 1 Physics for Computing 3.0 3.0 0.0 1.5 PASSED
GEC 11 Understanding the Self 3.0 3.0 0.0 1.5 PASSED
GEC 14 Mathematics in the Modern World 3.0 3.0 0.0 1.7 PASSED
PATHFit 1 Movement Competency Training 2.0 2.0 0.0 1.1 PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    expect(subjects.length).toBe(7);
    expect(subjects[0].code).toBe('NSTP 11');
    expect(subjects[0].name).toBe('CWTS/LTS/ROTC');
    expect(subjects[0].units).toBe(0);
    expect(subjects[0].grade).toBe('1.2');
    expect(subjects[3].code).toBe('Phys 1');
    expect(subjects[3].units).toBe(3);
  });

  it('parses real raw Tesseract output with optical character confusions', () => {
    const raw = `
Code                                                              Course                                                        Units                  Lec Units                     Lab Units                  Grade                    Remarks
NSTP TN                       CWTS/LTS/ROTC                                                                                 0.0                   0.0                               0.0                                1.2                         PASSED
IT 101                        Introduction to Computing                                                            30                 20                            1.0                             2.0                     PASSID
IT 102                     Computer Programming 1                                                       3.0               20                         1.0                          2.0                   PASSED
Phys 1                     Physics for Computing                                                             3.0                3.0                          0.0                           18                     PASSED
GEC NM                     Understanding the Self                                                             3.0                3.0                          0.0                           15                     PASS-0
GEC 14                   Mathematics in the Modern World                                           3.0               3.0                         0.0                         17                    PASS-1
PATHFit1                  Movement Competency Training                                                 20                2.0                           0.0                           11                      PASSED
    `;

    const subjects = parseDesktopRowLayout(raw);
    console.log('Real OCR test output:', subjects);
    expect(subjects.length).toBe(7);
    expect(subjects[0].code).toBe('NSTP 11');
    expect(subjects[1].code).toBe('IT 101');
    expect(subjects[2].code).toBe('IT 102');
    expect(subjects[3].code).toBe('Phys 1');
    expect(subjects[4].code).toBe('GEC 11');
    expect(subjects[5].code).toBe('GEC 14');
    expect(subjects[6].code).toBe('PATHFit 1');
  });

  it('correctly routes desktop table through parseOCRTextToSubjects without falling into mobile parser', () => {
    const raw = `
Code Course Units Lec Units Lab Units Grade Remarks
NSTP TM CWTS/LTS/ROTC 0.0 0.0 0.0 1.2 FASSTO
IT101 Introduction to Computing 30 2.0 1.0 2.0 PASSIO
IT102 Computer Programming 1 3.0 2.0 1.0 20 PASSO
Phys 1 Physics for Computing 3.0 3.0 0.0 15 PasLE0
GECTN Understanding the Self 3.0 3.0 0.0 15 PEE
GEC 14 Mathematics in the Modern World 30 3.0 0.0 17 BA
PATHFit1 Movement Competency Training 20 20 0.0 1 PARE
    `;

    expect(isMobileCardLayout(raw)).toBe(false);
    const subjects = parseOCRTextToSubjects(raw);
    expect(subjects.length).toBe(7);
    expect(subjects.map((s) => s.code)).toEqual([
      'NSTP 11',
      'IT 101',
      'IT 102',
      'Phys 1',
      'GEC 11',
      'GEC 14',
      'PATHFit 1',
    ]);
  });

  it('correctly extracts all 7 courses from Light Mode OCR output', () => {
    const lightRaw = `
Code Course Units Lec Units Lab Units Grade Remarks
NSTP 11 CWTS/LTS/ROTC 0.0 0.0 0.0 1.2 VEST
IT107 Introduction to Computing 3.0 2.0 1.0 20 BST
IT102 Computer Programming 1 3.0 2.0 1.0 2.0 INE
Phys 1 Physics for Computing 3.0 3.0 0.0 15 Led
GEC 1 Understanding the Self 2.0 3.0 0.0 1.5 tel
GEC 4 Mathematics 'n the Modern World 20 20 0.0 17 i
PATHFIt 1 Movement Competency Training 20 2.0 0.0 11 i
    `;

    expect(isMobileCardLayout(lightRaw)).toBe(false);
    const subjects = parseOCRTextToSubjects(lightRaw);
    expect(subjects.length).toBe(7);
    expect(subjects.map((s) => s.code)).toEqual([
      'NSTP 11',
      'IT 101',
      'IT 102',
      'Phys 1',
      'GEC 11',
      'GEC 14',
      'PATHFit 1',
    ]);
    expect(subjects[0].units).toBe(0);
    expect(subjects[4].units).toBe(3);
    expect(subjects[5].units).toBe(3);
  });
});

describe('OCR Engine — Mobile Card Parsing', () => {
  it('parses multi-line mobile card with units and grades', () => {
    const raw = `
BTL-Elec 2 1.8
Entrepreneurial Mindset
Units: 3.0
Lec Units: 3.0
Lab Units: 0.0
PASSED

GEC 20.1 1.6
Living in the IT Era
Units: 3.0
Lec Units: 3.0
Lab Units: 0.0
PASSED

PATHFit 3 1.4
Physical Activity Towards Health and Fitness 3
Units: 2.0
Lec Units: 2.0
Lab Units: 0.0
PASSED
    `;

    const subjects = parseMobileCardLayout(raw);
    expect(subjects.length).toBe(3);
    expect(subjects[0].code).toBe('BTL-Elec 2');
    expect(subjects[0].grade).toBe('1.8');
    expect(subjects[1].code).toBe('GEC 20.1');
    expect(subjects[1].grade).toBe('1.6');
    expect(subjects[2].code).toBe('PATHFit 3');
    expect(subjects[2].grade).toBe('1.4');
  });

  it('parses mobile card when grade is on a separate line or with remarks', () => {
    const raw = `
IT 105
Application Dev't and Emerging Tech
Units: 3.0
Lec Units: 2.0
Lab Units: 1.0
Grade: 1.7
PASSED

NSTP 11
National Service Training Program 1
Units: 0.0
Lec Units: 0.0
Lab Units: 0.0
1.2 PASSED
    `;

    const subjects = parseMobileCardLayout(raw);
    expect(subjects.length).toBe(2);
    expect(subjects[0].code).toBe('IT 105');
    expect(subjects[0].grade).toBe('1.7');
    expect(subjects[0].units).toBe(3);
    expect(subjects[1].code).toBe('NSTP 11');
    expect(subjects[1].grade).toBe('1.2');
    expect(subjects[1].units).toBe(0);
  });
});


