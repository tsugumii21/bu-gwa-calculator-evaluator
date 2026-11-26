import { useState } from 'react';
import { CircleHelp, ListChecks, RotateCcw } from 'lucide-react';

import { useAppStore } from '../../store';
import { MascotReference } from '../illustrations/mascot-reference';
import { AcademicTrendChart } from '../charts/AcademicTrendChart';
import { SubjectTargetAllocator } from './SubjectTargetAllocator';
import { SimulatorInfoModal, SimulatorActionDialog, type SimulatorTopic } from './SimulatorInfoModal';
import { PlanChoice, SimulatorInputs } from './simulator-inputs';
import { SimulatorBrief, SimulatorResult } from './simulator-result';
import { SimulatorEvidenceDialog } from './simulator-evidence-dialog';
import { useSimulatorPlan } from './use-simulator-plan';

/** One planning workspace: saved evidence + future assumptions = explained result. */
export function SimulatorView() {
  const plan = useSimulatorPlan();
  const setActiveTab = useAppStore(state => state.setActiveTab);
  const degreeUnits = useAppStore(state => state.degreeRequirements.creditUnits);
  const [topic, setTopic] = useState<SimulatorTopic | null>(null);
  const [action, setAction] = useState<'reset' | 'review' | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [evidenceView, setEvidenceView] = useState<'record' | 'calculation' | null>(null);
  const { draft, report } = plan;
  const format = (value: number) => value.toString();
  const finishAction = () => { if (action === 'reset') plan.resetDraft(); else plan.reviewChanges(); setAction(null); };
  return <div className="tab-content active v2-simulator" id="tab-simulator">
    <header className="plan-header">
      <div><h1>Plan your grades</h1><p>Explore future grades without changing your saved record.</p>
        <button type="button" className="plan-help-link" onClick={() => setTopic('what-if')}><CircleHelp size={18} aria-hidden="true" /> How this planner works</button>
      </div><MascotReference scene="simulator" className="planning-student" />
    </header>
    <div className="plan-toolbar"><PlanChoice label="Planning horizon" value={plan.horizon} onChange={plan.chooseHorizon}
      options={[{ value: 'semester', label: 'Next semester' }, { value: 'degree', label: 'Remaining degree' }]} />
      <button type="button" className="plan-reset" onClick={() => setAction('reset')}><RotateCcw size={17} aria-hidden="true" /><span>Reset scenario</span></button></div>
    <section className="plan-baseline" aria-labelledby="plan-baseline-title">
      <div><h2 id="plan-baseline-title">Your starting record</h2><p>Saved numeric grades, across all semesters</p></div>
      <dl><div><dt>Current cumulative GWA</dt><dd>{report.baseline.average === null ? '—' : report.baseline.average.toFixed(4)}</dd></div>
        <div><dt>Graded units</dt><dd>{format(report.baseline.units)}</dd></div><div><dt>Semesters included</dt><dd>{report.includedTerms.length}</dd></div></dl>
      <button type="button" className="plan-record-trigger" aria-haspopup="dialog" onClick={() => setEvidenceView('record')}><ListChecks size={18} aria-hidden="true" /> View included grades</button>
    </section>
    {plan.storageMessage && <p className="plan-warning" role="status">{plan.storageMessage}</p>}
    <div className="plan-workspace">
      <SimulatorInputs draft={draft} degreeUnits={degreeUnits} courseSummary={<SimulatorBrief draft={draft} report={report} />} errors={report.recordInvalid ? [] : report.errors} invalidFields={report.invalidFields} onChange={plan.update} onHelp={() => setTopic(draft.method === 'courses' ? 'allocator' : 'what-if')}>
        <SubjectTargetAllocator key={`${plan.horizon}-${plan.editorRevision}`} draft={draft} semesters={plan.semesters} onImport={plan.importCourses} onUpdate={plan.updateCourse} onRemove={plan.removeCourse} onAdd={plan.addCourse} onUndo={plan.undoRemove} canUndo={plan.canUndo} />
      </SimulatorInputs>
      <SimulatorResult draft={draft} report={report} onReview={() => setAction('review')} onCalculator={() => setActiveTab('calculator')} onDetails={() => setEvidenceView('calculation')} />
    </div>
    <details className="plan-history" onToggle={event => setIsHistoryOpen(event.currentTarget.open)}><summary>Your recorded history <span>Saved grades only</span></summary><p>These averages come from Calculator. Changes to your hypothetical scenario do not alter this history.</p>
      {isHistoryOpen && <AcademicTrendChart onOpenInfo={() => setTopic('trend')} />}
    </details>
    <SimulatorInfoModal isOpen={topic !== null} initialTopic={topic ?? 'what-if'} onClose={() => setTopic(null)} />
    <SimulatorActionDialog action={action} onClose={() => setAction(null)} onConfirm={finishAction} />
    <SimulatorEvidenceDialog view={evidenceView} draft={draft} report={report} evidence={plan.evidence} onClose={() => setEvidenceView(null)} onCalculator={() => { setEvidenceView(null); setActiveTab('calculator'); }} />
  </div>;
}
