import { MascotReference } from '../illustrations/mascot-reference';
import { useSemesterStore, useAppStore } from '../../store';
import { useScholarshipStore } from '../../store/scholarship-store';
import { evaluateScholarship } from '../../core/scholarship';
import { SCHOLARSHIP_PRESETS } from '../../core/constants';

const STATUS_COPY = {
  unconfigured: ['Set your requirements first', 'Choose a starting point, check the values against your scholarship agreement, then confirm below.'],
  invalid: ['Check your entries', 'Requirements must be between 1.00 and 5.00. Correct invalid grades or units in Calculator before reviewing.'],
  incomplete: ['More information needed', 'Your record has missing grades or no graded baseline. Complete it before relying on this comparison.'],
  unmet: ['Some entered criteria are not met', 'Review the evidence below. Your scholarship office determines retention and any exceptions.'],
  met: ['Entered academic criteria met', 'The saved grades meet these entered checks. Other scholarship conditions still need review.'],
} as const;
const CHECK_LABELS = ['Cumulative GWA', 'Individual grade cap', 'Unresolved INC', 'Conditional or failing grades (4.00 / 5.00)'];
const CHECK_STATUS = { met: 'Met', unmet: 'Not met', unknown: 'Unknown', 'not-required': 'Not required' };

/** Result-first comparison of editable scholarship requirements and saved grades. */
export function ScholarshipView() {
  const semesters = useSemesterStore(state => state.semesters);
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const { requirements, update } = useScholarshipStore();
  const result = evaluateScholarship(semesters, requirements);
  const [title, description] = STATUS_COPY[result.state];
  const applyPreset = (key: string) => {
    const preset = SCHOLARSHIP_PRESETS[key as keyof typeof SCHOLARSHIP_PRESETS];
    update(preset ? { preset: key, maxGWA: String(preset.maxGWA), lowestGrade: String(preset.lowestGrade), noInc: preset.noInc, noFail: preset.noFail } : { preset: '' });
  };
  const evidence = [
    result.stats.gradedUnits ? `${result.stats.cumulativeGWA.toFixed(4)} · entered maximum ${requirements.maxGWA}` : 'No graded baseline yet',
    result.worstGrade === null ? 'No numeric grades yet' : `${result.worstGrade.toFixed(2)} highest numeric grade · cap ${requirements.lowestGrade}`,
    result.stats.hasInc ? 'INC found in the saved record' : 'No INC found in entered courses',
    result.stats.hasFailingGrade ? `${result.stats.failingCount} conditional / failing marks found` : 'No 4.00 or 5.00 found in entered courses',
  ];
  return <div className="tab-content active v2-scholarship" id="tab-scholarship">
    <header className="sch-heading sch-heading-with-scene">
      <span className="sch-eyebrow">KEEP YOUR NEXT STEP IN SIGHT</span>
      <h1>A little clarity.<br/>For your scholarship.</h1>
      <MascotReference scene="scholarship" className="scholarship-scene" />
      <p>Bring your requirements. See how your record compares.</p>
    </header>
    <section className="sch-overview" aria-label="Requirement check summary" data-state={result.state}>
      <div><span className="sch-eyebrow">YOUR REQUIREMENT CHECK</span><h2 id="sch-status-title" aria-live="polite">{title}</h2><p>{description}</p><span className="sch-status-tag">Unofficial · academic checks only</span></div>
      <dl><div><dt>Current cumulative GWA</dt><dd>{result.stats.gradedUnits ? result.stats.cumulativeGWA.toFixed(4) : '—'}</dd></div><div><dt>Graded units</dt><dd>{result.stats.gradedUnits || '—'}</dd></div><div><dt>Pending entries</dt><dd>{result.pending}</dd></div></dl>
    </section>
    <div className="sch-workspace">
      <section className="sch-panel sch-requirements" aria-labelledby="sch-requirements-title"><span className="sch-step">01 / YOUR AGREEMENT</span><h2 id="sch-requirements-title">Set your requirements</h2><p className="sch-muted">Settings save on this browser. Reconfirm after each change.</p>
        <label htmlFor="scholarship-preset">Start with an existing preset</label><select id="scholarship-preset" value={requirements.preset} onChange={event => applyPreset(event.target.value)}><option value="">Custom requirements</option>{Object.entries(SCHOLARSHIP_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.name}</option>)}</select>
        <p className="sch-caption">Presets are existing app examples, not verified current scholarship rules. Check your own agreement.</p>
        <div className="sch-fields"><div><label htmlFor="sch-max-gwa">Maximum allowed GWA</label><input id="sch-max-gwa" type="number" min="1" max="5" step="0.05" value={requirements.maxGWA} onChange={event => update({ maxGWA: event.target.value })}/></div><div><label htmlFor="sch-lowest-grade">Highest numeric grade allowed</label><input id="sch-lowest-grade" type="number" min="1" max="5" step="0.05" value={requirements.lowestGrade} onChange={event => update({ lowestGrade: event.target.value })}/></div></div>
        <label className="sch-checkbox"><input id="sch-no-inc" type="checkbox" checked={requirements.noInc} onChange={event => update({ noInc: event.target.checked })}/>No unresolved INC allowed</label>
        <label className="sch-checkbox"><input id="sch-no-fail" type="checkbox" checked={requirements.noFail} onChange={event => update({ noFail: event.target.checked })}/>No conditional or failing grades allowed</label>
        {result.invalidRequirements && <p role="alert">Enter both limits between 1.00 and 5.00.</p>}
        <button className="sch-primary" disabled={result.invalidRequirements || requirements.confirmed} onClick={() => update({ confirmed: true })}>{requirements.confirmed ? 'Requirements confirmed' : 'Confirm these requirements'}</button>
      </section>
      <section className="sch-panel" aria-labelledby="sch-evidence-title"><span className="sch-step">02 / YOUR SAVED RECORD</span><h2 id="sch-evidence-title">Review the evidence</h2><p className="sch-muted">Uses all saved semesters, including uncomputed terms.</p>
        <ul className="sch-evidence">{CHECK_LABELS.map((label, index) => <li key={label}><div><strong>{label}</strong><span>{evidence[index]}</span></div><b className="sch-check-state" data-state={requirements.confirmed && !result.invalidRequirements && !result.errors.length ? result.checks[index] : 'unknown'}>{requirements.confirmed && !result.invalidRequirements && !result.errors.length ? CHECK_STATUS[result.checks[index]] : 'Not assessed'}</b></li>)}</ul>
        <aside className="sch-note"><strong>Still outside this check</strong><p>Required load, financial or residency conditions, service obligations, renewals and approved exceptions must be reviewed with your scholarship office.</p></aside>
        {result.errors.length > 0 && <p role="alert">{result.errors[0]}</p>}
        <button className="sch-secondary" onClick={() => setActiveTab('calculator')}>Review grades in Calculator</button>
      </section>
    </div>
  </div>;
}
