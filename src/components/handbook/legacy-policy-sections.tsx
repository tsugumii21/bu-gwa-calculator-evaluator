import { LEGACY_POLICY_TABLES } from './legacy-policy-data';

/** Verified handbook policy data rendered with the current reader's semantic tables and cards. */
export function LegacyPolicySections({ onOpenPolicy }: { onOpenPolicy: (kind: 'midyear' | 'underload') => void }) {
  return <>
    <section className="hb-card" id="hb-grades"><h2>Official Academic Grading Scale (Discrete Tenths)</h2><p className="hb-small">Bicol University Student Handbook: Grading System, printed p. 18 / PDF p. 28 · BOR Res. 89 s. 2006</p><p>Handbook grade ratings, percentage equivalents, and adjectival descriptions:</p><PolicyTable index={0} caption="Official Academic Grading Scale (Discrete Tenths)"/><p className="hb-note">A course grade alone does not confirm recognition. Both PL and DL exclude a grade numerically above 2.4, including 2.5. The calculator accepts 4.0 as conditional, but not midterm ratings 3.1–3.9.</p></section>
    <section className="hb-card" id="hb-honors"><h2>Semester Academic Recognition Criteria (PL &amp; DL)</h2><p className="hb-small">Bicol University Student Handbook: Scholarship General Policies &amp; Academic Distinctions, printed pp. 31–32 / PDF pp. 41–42 · BOR Res. 89 s. 2006</p><PolicyTable index={1} caption="Semester Academic Recognition Criteria (PL & DL)"/></section>
    <section className="hb-card" id="hb-latin"><h2>Latin Graduation Honors Criteria (Degree-Wide)</h2><p className="hb-small">Bicol University Student Handbook: Graduation with Honors, printed pp. 20–21 / PDF pp. 30–31 · BOR Res. 89 s. 2006</p><PolicyTable index={2} caption="Latin Graduation Honors Criteria (Degree-Wide)"/></section>
    <section className="hb-card" id="hb-terms"><h2>Midyear / Summer Term Policy &amp; Academic Governance</h2><p className="hb-small">Bicol University Student Handbook: Curriculum load, printed pp. 21, 31–32 / PDF pp. 31, 41–42</p>
      <details open><summary>100% GWA &amp; Unit Inclusion<span>Midyear Grades Fully Count</span></summary><p>All subjects and numerical grades earned during a Midyear or Summer term are mathematically factored into your Cumulative Degree GWA and credit total with identical weight as regular semester courses.</p></details>
      <details><summary>Semester recognition<span>Check the prescribed curriculum load</span></summary><p>The cited academic-distinction clause does not impose a blanket midyear PL/DL exclusion or a universal 15-unit minimum. The same grade criteria apply; the calculator uses entered grades and explicit underload flags. Missing grades keep the result provisional.</p></details>
      <details><summary>Load and graduation honors<span>The curriculum determines regular load</span></summary><p>A midyear label or a small unit total alone cannot establish underloading or guarantee eligibility. Compare the actual course load with your prescribed curriculum when setting the underload flag. The University must verify graduation requirements and any applicable ruling.</p></details>
      <div className="hb-links"><button onClick={() => onOpenPolicy('midyear')}>Midyear explanation</button><button onClick={() => onOpenPolicy('underload')}>Underload explanation</button></div>
    </section>
  </>;
}

function PolicyTable({ index, caption }: { index: number; caption: string }) {
  const table = LEGACY_POLICY_TABLES[index];
  return <div className="hb-table-scroll hb-legacy-table" tabIndex={0} role="region" aria-label={caption}><table><caption>{caption}</caption><thead><tr>{table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map(row => <tr key={row[0]}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
