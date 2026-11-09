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
    summary: 'Bicol University uses 1.0 as its highest grade and 3.0 as its passing mark.',
    details: 'The handbook lists grades in tenths from 1.0 through 3.0; 4.0 is conditional and 5.0 is failure. INC and DRP are non-numeric marks, excluded from weighted GWA. The calculator accepts the listed final-grade inputs and does not infer completion or an official award from one grade.',
    handbookReference: 'Grading System, printed p. 18 / PDF p. 28, BOR Resolution 89 s. 2006',
    keywords: ['grade', 'scale', 'passing', 'system', '4.00', '5.00', 'numerical', 'percentage']
  },
  {
    id: 'inc-rules',
    category: 'inc_drp',
    title: 'Removal of Incomplete (INC) Grades',
    summary: 'An INC is incomplete work and must be completed within one school year.',
    details: 'Until removed, INC is excluded from GWA. The handbook gives one school year for completion; the College Registrar converts an overdue INC to failure upon written instruction from the professor, with the Dean empowered to decide when the professor cannot be contacted. The app does not automatically convert stored grades.',
    handbookReference: 'Section III, The Grade of Incomplete, printed p. 20 / PDF p. 30',
    keywords: ['inc', 'incomplete', 'one year', 'deadline', 'lapse', '5.0', 'deficiency']
  },
  {
    id: 'underload-honors',
    category: 'underload',
    title: 'Underloading & Latin Honors Disqualification',
    summary: 'The prescribed curriculum load determines underloading; there is no universal 15-unit threshold in this clause.',
    details: 'Graduation with Honors requires the regular load prescribed by the curriculum each semester. Carrying fewer prescribed units is underload and disqualifies from graduation honors under the bundled text. Confirm the curriculum and any applicable institutional ruling with the college; the app cannot approve an exception. Midyear labeling alone does not establish load compliance.',
    handbookReference: 'Graduation with Honors, printed p. 21 / PDF p. 31',
    keywords: ['underload', 'units', 'minimum', 'disqualified', 'latin', 'excuse', 'working student']
  },
  {
    id: 'latin-honors-criteria',
    category: 'honors',
    title: 'Latin Graduation Honors Criteria (Summa, Magna, Cum Laude)',
    summary: 'Graduation honors use separate GWA brackets and a subject-grade ceiling of 3.0, not the PL/DL ceiling of 2.4.',
    details: 'Summa: 1.0000 ≤ GWA ≤ 1.2500; Magna: 1.2500 < GWA ≤ 1.4500; Cum Laude: 1.4500 < GWA ≤ 1.7500. The handbook requires no subject grade numerically above 3.0, curriculum completion and regular prescribed loads. Its adjacent academic-distinction clause specifies at least 75% of curriculum units at BU and six immediately preceding terms of residence. The Registrar must verify completion and applicable residency requirements; a calculated bracket does not certify eligibility.',
    handbookReference: 'Section III, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31',
    keywords: ['latin', 'summa', 'magna', 'cum laude', 'honors', 'graduation', 'cutoff', 'criteria']
  },
  {
    id: 'term-honors-dl-pl',
    category: 'honors',
    title: "President's Lister & Dean's Lister Qualifications",
    summary: 'PL and DL are separate semester distinctions with a shared maximum numeric subject grade of 2.4.',
    details: 'PL: 1.0000 ≤ unrounded semester GWA ≤ 1.4500. DL: 1.4500 < unrounded semester GWA ≤ 1.7500. Both require no recorded numeric subject grade above 2.4: 2.5 excludes both, even with a strong average. Scholarship general policies require regular curriculum load and no failing or incomplete marks. Missing or incomplete grades keep recognition provisional; no manual load confirmation is required. DRP prompts load review rather than an automatic failing grade. The cited clause has no universal 15-unit minimum or blanket midyear exclusion.',
    handbookReference: 'Section IV, Scholarship General Policies and Academic Distinctions, printed pp. 31–32 / PDF pp. 41–42',
    keywords: ['pl', 'dl', 'president', 'dean', 'lister', 'semester', 'term honor', 'gpa']
  },
  {
    id: 'midyear-gwa',
    category: 'grading',
    title: 'Midyear Grades and Cumulative GWA',
    summary: 'Valid numeric Midyear grades with positive units count in cumulative GWA.',
    details: 'The calculator applies the usual unit weighting to Midyear courses. Its term-distinction display and regular-term underload checks apply to regular semesters. Ask your college how its official requirements apply to your Midyear term.',
    handbookReference: 'Section III, Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31',
    keywords: ['midyear', 'summer', 'cumulative gwa']
  },
  {
    id: 'scholastic-delinquency',
    category: 'retention',
    title: 'Scholastic Delinquency (Warning, Probation, Dismissal)',
    summary: 'Scholastic advisories depend on failing subjects in their term, not percentages or cumulative failure counts.',
    details: 'One failing subject reduces the succeeding term load by one equivalent-unit subject. Two failing marks at the end of a term lead to probation, with at most 75% of regular load; passing all subjects during probation may remove it. A failure while already on probation, or three or more failing subjects at term end, triggers dismissal provisions subject to the college and petition process. INC and conditional marks need separate review; the app does not issue enrollment decisions.',
    handbookReference: 'Scholastic Deficiency, printed p. 15 / PDF p. 25',
    keywords: ['retention', 'warning', 'probation', 'dismissal', 'fail', 'failing', 'kicked out', 'delinquency']
  },
  {
    id: 'dropping-subjects',
    category: 'inc_drp',
    title: 'Official Dropping of Subjects',
    summary: 'Students may drop courses with official consent before the university deadline to avoid a failing grade.',
    details: 'File the prescribed form with Instructor and College Dean consent within three-fourths of the maximum prescribed class hours. Later dropping may be allowed for illness certified by a physician or another valid reason. The handbook assigns a failure for unofficial dropping after midterm grades have been obtained.',
    handbookReference: 'Section III, Dropping of Subjects, printed pp. 13–14 / PDF pp. 23–24',
    keywords: ['dropping', 'drop', 'drp', 'unofficial drop', 'deadline', 'withdrawal']
  },
  {
    id: 'shifting-transferees',
    category: 'shifting',
    title: 'Shifting from One Course or Program to Another',
    summary: 'Apply through your current Dean. Confirm the stated GPA of 2.40 and other admission requirements with the receiving college.',
    details: 'The handbook lists five conditions: (1) fewer than two failing grades in the current program, (2) less than half of its required units completed, (3) acceptance by the receiving Dean, (4) a stated GPA of 2.40, and (5) satisfaction of other admission requirements for the new program.',
    handbookReference: 'Section III, Shifting from One Course/Program to Another, printed p. 14 / PDF p. 24',
    keywords: ['shift', 'shifting', 'transfer', 'college transfer', 'change course', 'requirements']
  }
];

export function searchHandbook(query: string): HandbookPolicy[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return BU_HANDBOOK_KNOWLEDGE.slice(0, 4);

  const direct = [
    [/\b(?:midyear|summer)\b/i, 'midyear-gwa'],
    [/\b(?:inc|incomplete)\b/i, 'inc-rules'],
    [/\bunderload\w*\b/i, 'underload-honors'],
    [/\b(?:pl|dl|president(?:['’]s)?\s+list\w*|dean(?:['’]s)?\s+list\w*|term honors?)\b/i, 'term-honors-dl-pl'],
    [/\b\d+(?:\.\d+)?\s+units\b/i, 'underload-honors'],
  ] as const;
  const intent = direct.find(([pattern]) => pattern.test(normalized))?.[1];
  const words = normalized.match(/[a-z0-9]+(?:\.[0-9]+)?/g)?.filter(word => word.length > 2) ?? [];

  const scored = BU_HANDBOOK_KNOWLEDGE.map(policy => {
    let score = policy.id === intent ? 1000 : 0;
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
