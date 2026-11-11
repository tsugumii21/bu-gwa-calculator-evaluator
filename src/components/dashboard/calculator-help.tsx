import { useState, type ReactNode } from 'react';
import type { CalculationMode } from '../../core/calculation-report';
import { HONOR_THRESHOLDS, TERM_HONOR_THRESHOLDS } from '../../core/constants';
import { LATIN_ELIGIBILITY_SEMESTERS } from '../../core/latin-honors';
import { DialogFrame } from '../modals/dialog-frame';
import { UNOFFICIAL_NOTICE } from './calculation-result';

// Verified against the bundled 2019 handbook; printed and PDF pages are distinct.
const HANDBOOK_REFERENCES = {
  average: 'Grading System, printed p. 18 / PDF p. 28',
  term: 'Scholarship General Policies & Academic Distinctions, printed pp. 31–32 / PDF pp. 41–42',
  latin: 'Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31',
  standing: 'Scholastic Deficiency, printed p. 15 / PDF p. 25',
  units: 'Graduation with Honors: curriculum load, printed p. 21 / PDF p. 31',
} as const;
const HANDBOOK_URL = 'https://bicol-u.edu.ph/wp-content/uploads/2024/05/492555631-BU-Student-Handbook.pdf';
const LATIN_RANGES = ['1.0000 ≤ GWA ≤ 1.2500', '1.2500 < GWA ≤ 1.4500', '1.4500 < GWA ≤ 1.7500'];

/** Mode-scoped explanations; these dialogs never evaluate or mutate records. */
export function CalculatorHelp({ mode, children }: { mode: CalculationMode; children?: (open: (topic: string) => void) => ReactNode }) {
  const [topic, setTopic] = useState<string | null>(null);
  const isTerm = mode === 'gwa';
  const scope = isTerm ? 'the selected semester' : 'all semesters in your record';
  const topics = {
    average: { title: isTerm ? 'Semester GWA' : 'Cumulative GWA', content: <>
      <p>Your weighted average uses final numeric course grades with positive credit units from {scope}.</p>
      <div className="v2-help-card"><strong>Weighted formula</strong><p>GWA = Σ (grade × units) ÷ Σ graded units</p></div>
      <p>For example, a 1.20 in a 3-unit course and a 1.80 in a 1-unit course yield (1.20 × 3 + 1.80 × 1) ÷ 4 = 1.3500.</p>
      <ul><li>GWA is shown to four decimal places. The app checks cutoffs using the unrounded value.</li><li>Blank grades, INC and DRP are excluded from the numeric average.</li><li>{isTerm ? 'Other saved semesters do not affect this result.' : 'Midyear grades count by unit just like other terms. This average is one input to the Latin honors check.'}</li></ul>
    </> },
    honors: { title: isTerm ? 'Semester honors (PL & DL)' : 'Graduation Latin honors', content: <>
      <p>{isTerm ? 'Semester recognition is separate from graduation honors. 2019 handbook grade thresholds:' : 'The handbook compares a unit-weighted GWA with these graduation honors ranges. Multiply each final grade by its credit units, add the products, then divide by the graded units.'}</p>
      {isTerm ? Object.values(TERM_HONOR_THRESHOLDS).map((rule, index) => <div className="v2-help-card" key={rule.label}><strong>{rule.label} ({index === 0 ? 'PL' : 'DL'})</strong><p><b>Unrounded semester GWA:</b> {index === 0 ? '1.0000 ≤ GWA ≤ 1.4500' : '1.4500 < GWA ≤ 1.7500'}</p><p><b>Grade cap:</b> No numeric course grade above {rule.maxSubjectGrade.toFixed(2)}.</p></div>) : Object.values(HONOR_THRESHOLDS).map((rule, index) => <div className="v2-help-card" key={rule.label}><strong>{rule.label}</strong><p><b>Cumulative GWA:</b> {LATIN_RANGES[index]}</p></div>)}
      <p className="v2-policy-context">{isTerm ? 'Both PL and DL require no recorded numeric grade above 2.40, complete grades, and the regular curriculum load. A 2.50 grade excludes both. An officially dropped course can affect the prescribed load.' : 'Graduation with Honors also requires completing the prescribed curriculum and regular loads, meeting applicable residency requirements, and having no subject grade numerically above 3.00. A strong average alone does not establish an award.'}</p>
      <p>{isTerm ? 'The calculator shows term distinctions for regular semesters. Midyear still counts in the weighted average. Confirm official Midyear recognition with your college.' : `The app waits for ${LATIN_ELIGIBILITY_SEMESTERS} completed regular semesters to show an unofficial eligibility status. Enter the required semesters and degree-credit units under Review record. Once both targets are met and the entries pass the app’s checks, it shows an unofficial graduation estimate. BU verifies your credited courses, residence, prescribed loads, and final honors.`}</p>
      {!isTerm && <p>The handbook’s separate academic distinction provision also discusses 75% of curriculum units at BU and six terms of residence immediately before graduation. A count of entered semesters does not verify residence.</p>}
    </> },
    standing: { title: isTerm ? 'Semester academic standing' : 'Academic standing across your record', content: <>
      <p>Review deficiencies in {scope}. A single semester cannot establish your official overall scholastic standing.</p>
      <div className="v2-help-card"><strong>Good Academic Standing</strong><p>An app summary for complete passing grades, separate from PL/DL. Missing grades, INC, conditional grades, or failures do not establish this status.</p></div>
      <div className="v2-help-card"><strong>One failing subject</strong><p>The handbook reduces the succeeding term load by one subject of equivalent units. Confirm the applicable restriction with your college.</p></div>
      <div className="v2-help-card"><strong>Academic Probation (2 failing subjects)</strong><p>Two failing marks at the end of a term lead to probation the following semester, with no more than 75% of the regular load. Passing all subjects during probation can remove it.</p></div>
      <p>Three or more failing grades at the end of a term, or a failing subject while already on probation, require college review for dismissal under the handbook. Conditional grades and INC require separate review; the app does not equate them with final failure.</p>
      <p>These are advisory labels, not University decisions. Failure counts belong to their semester; failures from different terms must not simply be added to declare current probation.</p>
      <p>Confirm any load restriction or academic status with your college or Registrar; the app does not determine enrollment eligibility.</p>
    </> },
    units: { title: isTerm ? 'Semester credit units' : 'Total academic credit units', content: <>
      <p>Unit totals here refer to {scope}.</p>
      <ul><li><strong>Graded units:</strong> positive units attached to valid numeric grades; these form the GWA denominator.</li><li><strong>Recorded units:</strong> positive units excluding DRP; these can include pending or failed courses.</li><li>Recorded units are not the same as officially earned credits and do not verify degree completion or full-time status.</li></ul>
    </> },
  };
  const selected = topic ? topics[topic as keyof typeof topics] : null;
  const reference = topic === 'honors' ? HANDBOOK_REFERENCES[isTerm ? 'term' : 'latin'] : HANDBOOK_REFERENCES[topic as 'average' | 'standing' | 'units'];
  return <div className="v2-calculator-help">
    {children ? children(setTopic) : <><span>Understand your {isTerm ? 'semester' : 'degree estimate'}</span>
    <div>{Object.entries(topics).map(([key, item]) => <button type="button" key={key} onClick={() => setTopic(key)} aria-haspopup="dialog"><span aria-hidden="true">ⓘ </span>{item.title}</button>)}</div></>}
    <DialogFrame isOpen={!!selected} title={selected?.title ?? ''} onClose={() => setTopic(null)}>
      <a className={`v2-handbook-reference v2-reference-${topic}`} href={HANDBOOK_URL} target="_blank" rel="noreferrer"><i className="fa-solid fa-book" aria-hidden="true" /><span>BU Student Handbook: {reference}</span></a>
      {selected?.content}
      <p className="v2-reference-note">References identify the bundled Reprinted Version 2019 handbook and its PDF viewer pages. Confirm any newer policy and your official status with your college.</p>
      <p className="v2-dialog-note">{UNOFFICIAL_NOTICE}</p>
    </DialogFrame>
  </div>;
}
