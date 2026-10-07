// Bicol University GWA Calculator — Core Type Definitions

/** A single subject/course in a semester */
export interface Subject {
  code: string;
  name: string;
  grade: string; // '1.00' | '1.25' | ... | '5.00' | 'INC' | 'DRP'
  units: number;
}

/** A semester containing subjects */
export interface Semester {
  id: string; // unique ID (crypto.randomUUID())
  title: string;
  subjects: Subject[];
  underload: boolean;
  computed: boolean;
}

/** Result of cumulative GWA calculation */
export interface CumulativeStats {
  totalPoints: number;
  totalUnits: number;
  gradedUnits: number;
  totalCourses: number;
  hasUnderload: boolean;
  hasFailingGrade: boolean;
  hasInc: boolean;
  failingCount: number;
  cumulativeGWA: number;
}

/** Honor standing evaluation result */
export type HonorLevel =
  | 'summa'
  | 'magna'
  | 'cum-laude'
  | 'regular'
  | 'not-eligible'
  | 'pending';

export interface HonorEvaluation {
  level: HonorLevel;
  label: string;
  description: string;
}

/** Academic standing */
export type StandingLevel = 'good' | 'warning' | 'probation' | 'dismissal-risk';

export interface StandingEvaluation {
  level: StandingLevel;
  label: string;
  description: string;
}

/** Scholarship preset */
export interface ScholarshipPreset {
  name: string;
  maxGWA: number;
  lowestGrade: number;
  noInc: boolean;
  noFail: boolean;
}

/** Valid grade option for the grade selector */
export interface GradeOption {
  value: string;
  label: string;
}

/** Scanned subject from OCR or PDF */
export interface ScannedSubject {
  code: string;
  description: string;
  grade: string;
  units: number;
}

/** College preset semester template */
export interface CollegePresetSemester {
  title: string;
  underload: boolean;
  subjects: Subject[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppTab = 'calculator' | 'simulator' | 'scholarship' | 'policies' | 'about';

/** Term honor evaluation (per-semester) */
export type TermHonorLevel = 'president' | 'dean' | 'none';

export interface TermHonorEvaluation {
  level: TermHonorLevel;
  label: string;
  reason: string;
}

/** Honor message categories */
export type HonorMessageCategory =
  | 'PL'
  | 'DL'
  | 'REGULAR'
  | 'UNDERLOAD'
  | 'SUMMA'
  | 'MAGNA'
  | 'CUM'
  | 'NOT_LAUDE';
