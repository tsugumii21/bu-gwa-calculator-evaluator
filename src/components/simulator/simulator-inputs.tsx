import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';

import type { ScenarioDraft } from '../../core/scenario-planner';
import { HONOR_THRESHOLDS, TERM_HONOR_THRESHOLDS } from '../../core/constants';
import { SIMULATION_MAX_UNITS } from '../../core/simulation';

interface ChoiceProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string; detail?: string }[];
  onChange: (value: T) => void;
}

export function PlanChoice<T extends string>({ label, value, options, onChange }: ChoiceProps<T>) {
  return <fieldset className="plan-choice"><legend>{label}</legend><div>
    {options.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
      <span>{option.label}</span>{option.detail && <small>{option.detail}</small>}
    </button>)}
  </div></fieldset>;
}

interface InputProps {
  draft: ScenarioDraft;
  degreeUnits: string;
  onChange: (changes: Partial<ScenarioDraft>) => void;
  onHelp: () => void;
  children: ReactNode;
  errors: string[];
  invalidFields: string[];
  courseSummary?: ReactNode;
}

function GoalInputs({ draft, onChange, invalidFields }: Pick<InputProps, 'draft' | 'onChange' | 'invalidFields'>) {
  if (draft.question.kind !== 'goal') return null;
  const question = draft.question;
  const presets = question.scope === 'term'
    ? [{ label: 'PL cutoff', value: TERM_HONOR_THRESHOLDS.PRESIDENT.maxGPA }, { label: 'DL cutoff', value: TERM_HONOR_THRESHOLDS.DEAN.maxGPA }]
    : Object.values(HONOR_THRESHOLDS).map(rule => ({ label: rule.label, value: rule.maxGWA }));
  return <div className="plan-goal-inputs">
    {draft.horizon === 'semester' && <PlanChoice label="Apply the goal to" value={question.scope}
      options={[{ value: 'overall', label: 'Overall GWA' }, { value: 'term', label: 'Semester average' }]}
      onChange={scope => onChange({ question: { ...question, scope } })} />}
    <label className="plan-field" htmlFor="plan-target"><span>{question.scope === 'term' ? 'Semester average goal' : 'Overall GWA goal'}</span>
      <input id="plan-target" type="number" inputMode="decimal" min="1" max="3" step="0.0001" placeholder="Enter your goal" value={question.target}
        onChange={event => onChange({ question: { ...question, target: event.target.value } })} aria-invalid={invalidFields.includes('target')} aria-describedby={invalidFields.includes('target') ? 'plan-input-errors plan-goal-note' : 'plan-goal-note'} />
    </label>
    <div className="plan-presets" role="group" aria-label="GWA cutoff references">
      {presets.map(preset => <button type="button" key={preset.label} aria-pressed={Number(question.target) === preset.value}
        onClick={() => onChange({ question: { ...question, target: String(preset.value) } })}>{preset.label} <span>{preset.value.toFixed(2)}</span></button>)}
    </div>
    <p className="plan-hint" id="plan-goal-note">GWA cutoffs only. Averages alone do not establish eligibility for an award. Lower numbers are better.</p>
  </div>;
}

function QuickInputs({ draft, onChange, invalidFields }: Pick<InputProps, 'draft' | 'onChange' | 'invalidFields'>) {
  return <div className="plan-quick-inputs">
    <label className="plan-field" htmlFor="plan-units"><span>{draft.horizon === 'degree' ? 'Remaining graded units' : 'Additional graded units'}</span>
      <input id="plan-units" type="number" inputMode="decimal" min="0" max={SIMULATION_MAX_UNITS} step="any" placeholder="Enter units, e.g. 21"
        value={draft.units} onChange={event => onChange({ units: event.target.value })} aria-invalid={invalidFields.includes('units')} aria-describedby={invalidFields.includes('units') ? 'plan-input-errors plan-units-note' : 'plan-units-note'} />
      <small id="plan-units-note">Include only coursework that will receive numeric grades. Fractional units are supported.</small>
    </label>
    {draft.question.kind === 'forecast' && <>
      <label className="plan-field" htmlFor="plan-average"><span>Expected average in those units</span>
        <input id="plan-average" type="number" inputMode="decimal" min="1" max="5" step="0.0001" placeholder="Enter an average, e.g. 1.50"
          value={draft.average} onChange={event => onChange({ average: event.target.value })} aria-invalid={invalidFields.includes('average')} aria-describedby={invalidFields.includes('average') ? 'plan-input-errors plan-average-note' : 'plan-average-note'} />
        <small id="plan-average-note">Your assumption, not a prediction. Averages may fall between individual BU course grades.</small>
      </label>
      <label className="plan-slider" htmlFor="plan-average-slider"><span>Adjust expected average <output>{draft.average && Number.isFinite(Number(draft.average)) ? Number(draft.average).toFixed(2) : '—'}</output></span>
        <input id="plan-average-slider" type="range" min="1" max="5" step="0.05" value={draft.average || '1'}
          onChange={event => onChange({ average: Number(event.target.value).toFixed(2) })} />
        <small>1.00 best <span>3.00 passing</span> 5.00 failing</small>
      </label>
    </>}
  </div>;
}

export function SimulatorInputs({ draft, onChange, onHelp, degreeUnits, children, errors, invalidFields, courseSummary }: InputProps) {
  return <section className="plan-panel plan-input-panel" aria-labelledby="plan-input-title">
    <div className="plan-section-heading"><h2 id="plan-input-title">Your future scenario</h2><button type="button" className="plan-icon-button" onClick={onHelp} aria-label="Help with planning inputs"><CircleHelp size={20} /></button></div>
    <PlanChoice label="What would you like to find out?" value={draft.question.kind}
      options={[{ value: 'forecast', label: 'What if I earn these grades?' }, { value: 'goal', label: 'What grades do I need?' }]}
      onChange={kind => onChange({ question: kind === 'forecast' ? { kind } : { kind, scope: 'overall', target: '' } })} />
    <GoalInputs draft={draft} onChange={onChange} invalidFields={invalidFields} />
    {draft.horizon === 'semester' ? <PlanChoice label="Enter future grades using" value={draft.method}
      options={[{ value: 'quick', label: 'Quick estimate' }, { value: 'courses', label: 'Plan by course' }]}
      onChange={method => onChange({ method })} /> : <p className="plan-hint">Enter all remaining coursework you want to explore. This does not assume a four-year program.
        {degreeUnits && <> Your Review record curriculum target is <strong>{degreeUnits} credits</strong>. Remaining graded units must be entered separately.</>}</p>}
    {draft.horizon === 'semester' && draft.method === 'courses' ? <>{courseSummary}{children}</> : <QuickInputs draft={draft} onChange={onChange} invalidFields={invalidFields} />}
    {errors.length > 0 && <ul className="plan-errors" id="plan-input-errors" role="alert">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
    <a href="#plan-result" className="plan-result-jump">View explained result ↓</a>
  </section>;
}
