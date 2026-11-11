import { useState } from 'react';
import { LEGACY_POLICY_ARTICLES as REFERENCES } from './legacy-policy-data';
import { LegacyPolicySections } from './legacy-policy-sections';
import { TermPolicyDialog } from '../modals/term-policy-dialog';

export const HANDBOOK_PDF = 'BU-Student-Handbook.pdf';
export const HANDBOOK_SOURCE = 'https://bicol-u.edu.ph/wp-content/uploads/2024/05/492555631-BU-Student-Handbook.pdf';


/** Indexed reading material separates existing summaries from verified source documents. */
export function HandbookReference() {
  const [policy, setPolicy] = useState<'midyear' | 'underload' | null>(null);
  return <>
    <section className="hb-source" aria-labelledby="hb-source-title"><span className="hb-eyebrow">START WITH THE SOURCE</span><h2 id="hb-source-title">Bicol University Student Handbook</h2><p>Reprinted Version 2019 · copyright page: 2015. Edition checked against the bundled PDF cover.</p><div className="hb-links"><a className="hb-primary" href={HANDBOOK_PDF} target="_blank" rel="noreferrer">Read handbook PDF ↗</a><a href={HANDBOOK_SOURCE} target="_blank" rel="noreferrer">University source ↗</a></div><p className="hb-small">Recognition, grading, and load summaries below were checked against the bundled handbook. Printed and PDF viewer pages are identified separately. Summaries are not verbatim quotations or a complete policy verification.</p></section>
    <nav className="hb-section-index" aria-label="Policy sections"><a href="#hb-grades">Grade ratings</a><a href="#hb-honors">Semester honors</a><a href="#hb-latin">Latin honors</a><a href="#hb-terms">Midyear &amp; underload</a><a href="#hb-articles">Article index</a><a href="#hb-review">Review notes</a></nav>
    <LegacyPolicySections onOpenPolicy={setPolicy}/>
    <section className="hb-card" id="hb-articles"><span className="hb-eyebrow">04 / FIND A REFERENCE</span><h2>Governing Bicol University Student Handbook Articles</h2><p>App summaries with handbook section titles and printed/PDF page references. The maximum-residency entry remains a legacy reference requiring confirmation.</p>{REFERENCES.map(([title, reference, content]) => <details key={title}><summary>{title}<span>{reference}</span></summary><p>{content}</p></details>)}</section>
    <section className="hb-card hb-review" id="hb-review"><span className="hb-eyebrow">05 / INTERPRETATION AND ASSUMPTIONS</span><h2>What still needs policy review</h2><ul><li>Recognition now uses the handbook’s distinct PL/DL intervals and shared 2.4 subject-grade cap. Calculations compare the unrounded average.</li><li>No manual curriculum-load confirmation is required by the calculator. A midyear label alone establishes neither an exemption nor an underload; the app does not approve exceptions.</li><li>Legacy 45/105/140-unit milestones are not universal handbook requirements. Degree completion, residency and applicable institutional rulings still require University verification.</li><li>The grade table’s former 3.1–4.0 range conflicts with the current input validator, which accepts 4.0 but not 3.1–3.9.</li></ul><p>This is an unofficial tool. Information is sourced from the University Student Handbook. Confirm applicable policies and approved exceptions with your college or the University Registrar.</p></section>
    <TermPolicyDialog kind={policy ?? 'midyear'} isOpen={policy !== null} onClose={() => setPolicy(null)}/>
  </>;
}
