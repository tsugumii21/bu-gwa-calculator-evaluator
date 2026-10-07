// Bicol University Academic Policies & Student Handbook Knowledge Base
// Extracted and curated from the official Bicol University Student Handbook

export interface HandbookPolicy {
  id: string;
  category: 'grading' | 'honors' | 'retention' | 'underload' | 'inc_drp' | 'shifting';
  title: string;
  summary: string;
  details: string;
  handbookReference: string;
  keywords: string[];
}

export const BU_HANDBOOK_KNOWLEDGE: HandbookPolicy[] = [
  {
    id: 'grading-scale',
    category: 'grading',
    title: 'BU Grading System & Point Scale',
    summary: 'Bicol University utilizes a 5-point numerical grading system with 1.00 as the highest and 3.00 as the passing mark.',
    details: 'Grades range from 1.00 (Excellent) down to 3.00 (Passing) in 0.25 decrements (1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00). A grade of 4.00 indicates conditional failure eligible for re-examination, while 5.00 signifies failure. Special marks include INC (Incomplete) and DRP (Officially Dropped).',
    handbookReference: 'BU Student Handbook, Article IX: Academic Standards & Grading System',
    keywords: ['grade', 'scale', 'passing', 'system', '4.00', '5.00', 'numerical', 'percentage']
  },
  {
    id: 'inc-rules',
    category: 'inc_drp',
    title: 'Removal of Incomplete (INC) Grades',
    summary: 'INC grades must be satisfactorily satisfied within one (1) calendar year, or they automatically become a failing mark (5.00).',
    details: 'A student who incurs an "INC" due to unfinished requirements or lack of a final examination has strictly one (1) academic year from the close of the semester in which it was incurred to complete it. If not complied with within this window, the grade automatically becomes 5.00 upon registrar evaluation. An unremoved INC also disqualifies the student from Latin Honors.',
    handbookReference: 'BU Student Handbook, Article IX, Section 4: Removal of Incomplete Grades',
    keywords: ['inc', 'incomplete', 'one year', 'deadline', 'lapse', '5.0', 'deficiency']
  },
  {
    id: 'underload-honors',
    category: 'underload',
    title: 'Underloading & Latin Honors Disqualification',
    summary: 'Enrolling in less than the regular curriculum units disqualifies a student from Latin Honors, unless formally excused.',
    details: 'To remain qualified for Latin Graduation Honors (Summa, Magna, Cum Laude), candidates must have carried the full semestral load prescribed in their program curriculum (minimum 15 academic units in regular semesters). Underloading is only excused if justified by: (1) certified health illness by the University Physician, (2) verified working student status approved prior by the Dean, or (3) lack of available subjects due to curriculum phase-out or course offerings.',
    handbookReference: 'BU Student Handbook, Article XI: Graduation Honors & Academic Distinctions',
    keywords: ['underload', 'units', 'minimum', 'disqualified', '15 units', 'latin', 'excuse', 'working student']
  },
  {
    id: 'latin-honors-criteria',
    category: 'honors',
    title: 'Latin Graduation Honors Criteria (Summa, Magna, Cum Laude)',
    summary: 'Awarded to graduating students who maintain required cumulative GWA ceilings without grades below 2.50 or academic deficiencies.',
    details: 'Thresholds for Latin Honors:\n• Summa Cum Laude: Cumulative GWA of 1.0000 to 1.2000 (no grade below 2.00)\n• Magna Cum Laude: Cumulative GWA of 1.2001 to 1.4500 (no grade below 2.25)\n• Cum Laude: Cumulative GWA of 1.4501 to 1.7500 (no grade below 2.50)\nAdditional requirements: Residency of at least 75% of units taken in BU, completed program within prescribed regular years, no failing grade (5.00), and no unexcused underloading.',
    handbookReference: 'BU Student Handbook, Article XI: Latin Honors & Recognition',
    keywords: ['latin', 'summa', 'magna', 'cum laude', 'honors', 'graduation', 'cutoff', 'criteria']
  },
  {
    id: 'term-honors-dl-pl',
    category: 'honors',
    title: "President's Lister & Dean's Lister Qualifications",
    summary: 'Semestral academic distinction awarded to top-performing students carrying regular course loads.',
    details: "Requirements per regular semester:\n• President's Lister (PL): Semestral GPA of 1.4500 or higher, at least 15 academic units, no individual grade lower than 2.00, and no INC or DRP.\n• Dean's Lister (DL): Semestral GPA of 1.7500 or higher, at least 15 academic units, no individual grade lower than 2.50, and no INC or DRP.",
    handbookReference: "BU Student Handbook, Article X: Term Honors (President's & Dean's Honor Roll)",
    keywords: ['pl', 'dl', 'president', 'dean', 'lister', 'semester', 'term honor', 'gpa']
  },
  {
    id: 'scholastic-delinquency',
    category: 'retention',
    title: 'Scholastic Delinquency (Warning, Probation, Dismissal)',
    summary: 'Sanctions imposed when a student fails a percentage of enrolled academic units in a given semester.',
    details: 'BU classifies scholastic delinquency into:\n• Warning: Failing grades in 25% to 49% of the total academic units enrolled.\n• Probation: Failing grades in 50% to 75% of total academic units enrolled.\n• Dismissal: Failing grades in more than 75% of enrolled units, or being on probation for two consecutive semesters.',
    handbookReference: 'BU Student Handbook, Article VIII: Scholastic Delinquency & College Retention',
    keywords: ['retention', 'warning', 'probation', 'dismissal', 'fail', 'failing', 'kicked out', 'delinquency']
  },
  {
    id: 'dropping-subjects',
    category: 'inc_drp',
    title: 'Official Dropping of Subjects',
    summary: 'Students may drop courses with official consent before the university deadline to avoid a failing grade.',
    details: 'Dropping of subjects must be filed officially using the prescribed university form, signed by the Instructor, Department Chair, and College Dean before the midterm examination period. Dropped subjects receive a grade of "DRP". Unofficial dropping (stopping attendance without filing) automatically results in a grade of 5.00.',
    handbookReference: 'BU Student Handbook, Article VII, Section 6: Dropping of Courses',
    keywords: ['dropping', 'drop', 'drp', 'unofficial drop', 'deadline', 'withdrawal']
  },
  {
    id: 'shifting-transferees',
    category: 'shifting',
    title: 'Shifting Programs & Cross-Enrollment',
    summary: 'Shifting to another program or college requires Dean clearance, quota availability, and specific GWA minimums.',
    details: 'A student who wishes to shift to another degree program within Bicol University must satisfy the minimum GWA set by the accepting college (often ≤ 2.25 or 2.00 in major prerequisites), obtain clearance from their mother college, and receive endorsement from the University Registrar before the enrollment period.',
    handbookReference: 'BU Student Handbook, Article VI: Admission, Shifting, and Transfer',
    keywords: ['shift', 'shifting', 'transfer', 'college transfer', 'change course', 'requirements']
  }
];

export function searchHandbook(query: string): HandbookPolicy[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return BU_HANDBOOK_KNOWLEDGE.slice(0, 4);

  const words = normalized.split(/\s+/).filter(w => w.length > 2);

  const scored = BU_HANDBOOK_KNOWLEDGE.map(policy => {
    let score = 0;
    const titleLower = policy.title.toLowerCase();
    const summaryLower = policy.summary.toLowerCase();
    const detailsLower = policy.details.toLowerCase();

    // Check query exact match
    if (titleLower.includes(normalized)) score += 10;
    if (summaryLower.includes(normalized)) score += 6;
    if (detailsLower.includes(normalized)) score += 4;

    // Check individual keywords
    for (const word of words) {
      if (policy.keywords.some(k => k.includes(word))) score += 5;
      if (titleLower.includes(word)) score += 3;
      if (summaryLower.includes(word)) score += 2;
      if (detailsLower.includes(word)) score += 1;
    }

    return { policy, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.policy);
}
