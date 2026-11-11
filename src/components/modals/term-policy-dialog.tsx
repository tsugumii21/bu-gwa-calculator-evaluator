import { DialogFrame } from './dialog-frame';

/** Curriculum-load explanations grounded in the bundled 2019 handbook. */
export function TermPolicyDialog({ kind, isOpen, onClose }: { kind: 'midyear' | 'underload'; isOpen: boolean; onClose: () => void }) {
  const isMidyear = kind === 'midyear';
  return <DialogFrame title={isMidyear ? 'Midyear & Summer Term Academic Policy' : 'Underloaded Term in Bicol University'} isOpen={isOpen} onClose={onClose}>
    <div className="v2-handbook-reference"><i className="fa-solid fa-book" aria-hidden="true"/><span>{isMidyear ? 'BU Student Handbook: Academic Load, printed pp. 10–11 / PDF pp. 20–21; Academic Distinctions, printed p. 32 / PDF p. 42' : 'BU Student Handbook: Academic Load and Graduation with Honors, printed pp. 10, 20–21 / PDF pp. 20, 30–31'}</span></div>
    {isMidyear ? <MidyearContent /> : <UnderloadContent />}
    <aside className="v2-dialog-note">This is an unofficial tool. Information is sourced from the University Student Handbook. Confirm applicable policies and approved exceptions with your college or the University Registrar.</aside>
  </DialogFrame>;
}

function MidyearContent() {
  return <>
    <p>Midyear is the separate summer term. A midterm grade is an interim mark within a term. Enter the final course grade for GWA.</p>
    <div className="v2-help-card"><strong>Why Midyear still changes your GWA</strong><p>Final numeric grades with positive units count with the same weighting as regular-term grades. For example, a final grade of 1.50 in a 3-unit Midyear course adds 4.50 weighted points and 3 graded units. INC and DRP stay out of the numeric average.</p></div>
    <div className="v2-help-card"><strong>What changes in the calculator</strong><p>Midyear adds graded units toward the curriculum target. The app reserves PL/DL and the six-semester eligibility count for regular semesters. Its regular-term underload check skips Midyear, so confirm the actual summer load with your college.</p></div>
    <div className="v2-help-card"><strong>What the handbook says</strong><p>The summer load is nine units or the load prescribed by your curriculum. The handbook also describes when the Dean or Director may approve a higher summer load.</p></div>
  </>;
}

function UnderloadContent() {
  return <>
    <p className="v2-dialog-lede">An <strong>underloaded term</strong> means carrying fewer credit units than the regular load prescribed in your curriculum for that specific semester.</p>
    <div className="v2-help-card"><strong>Use the load your program prescribes</strong><p>If your curriculum requires 18 units and you carry 15, that is below the prescribed load. If it prescribes 15 units for your practicum term and you carry all 15, you are carrying the prescribed load. Check with your college if a withdrawal or approved change affects your load.</p></div>
    <div className="v2-help-card"><strong>Why GWA still computes</strong><p>The Underloaded Term flag does not change the grades or units in the weighted average. On a regular term it prevents a PL/DL estimate and flags the Latin honors record for review, because the handbook requires the prescribed regular load for recognition and graduation honors.</p></div>
    <div className="v2-policy-context"><strong>Review withdrawals and exceptions</strong><p>An official DRP is excluded from the numeric average. A dropped course can still leave you below your required load. Your college or the Registrar determines how approved changes affect official recognition.</p></div>
  </>;
}
