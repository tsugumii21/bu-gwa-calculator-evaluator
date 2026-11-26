import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

export type SimulatorTopic = 'what-if' | 'allocator' | 'trend';
interface HelpProps { isOpen: boolean; onClose: () => void; initialTopic?: SimulatorTopic }
const topics: { value: SimulatorTopic; label: string }[] = [
  { value: 'what-if', label: 'Estimates & goals' }, { value: 'allocator', label: 'Plan by course' }, { value: 'trend', label: 'Recorded history' },
];

function HelpContent({ topic }: { topic: SimulatorTopic }) {
  if (topic === 'allocator') return <>
    <h3>One course plan, one explained result</h3>
    <p>Type future course units and expected grades. Names are optional. Use the BU course-grade scale: 1.00–3.00 in 0.10 steps, or 4.00 and 5.00.</p>
    <ol><li><strong>Explore expected grades:</strong> assign a grade to every positive-unit course.</li>
      <li><strong>Find grades for a goal:</strong> assign any grades you want to assume, and leave the rest blank. The result shows the average needed across those unassigned units.</li>
      <li><strong>Import ungraded courses:</strong> bring in blank-grade rows from one saved semester. Its numeric grades are already in your record and are never added twice.</li></ol>
    <p>An average such as 1.45 can come from a mix of course grades; it is not an individual course mark. The solver never fills every course with that average.</p>
    <p>INC, DRP, repeated-course replacement and transfer-credit decisions are not inferred. Resolve these in your record with your college’s guidance.</p>
  </>;
  if (topic === 'trend') return <>
    <h3>History shows your saved grades</h3><p><strong>Semester GWA</strong> uses numeric grades within each recorded semester. <strong>Cumulative GWA</strong> combines the recorded numeric grades up to that point.</p>
    <p>The full 1.00–5.00 scale is shown; lower values are better. Use the table beneath the chart for exact averages and graded units.</p>
    <p>This is a historical view, not a prediction. Hypothetical future grades never appear here. A historical GWA alone does not confirm PL/DL, Latin honors or academic standing.</p>
  </>;
  return <>
    <h3>What could your next grades change?</h3><p>Start with <strong>Next semester</strong>, or choose <strong>Remaining degree</strong> to cover all additional graded coursework you enter. No program length or future load is assumed.</p>
    <p><strong>What if I earn these grades?</strong> combines your recorded weighted points with your expected future points. <strong>What grades do I need?</strong> works backward from your chosen numerical goal.</p>
    <div className="plan-help-formula">Projected cumulative GWA = (recorded points + future points) ÷ (recorded graded units + future graded units)</div>
    <p><strong>Overall GWA</strong> includes your saved academic record. A <strong>Semester average</strong> goal covers only the semester you are planning; imported unfinished semesters include their already recorded grades once.</p>
    <p>In BU’s scale, 1.00 is best and 3.00 is passing. Averages above 3.00 may include conditional or failing marks. An unreachable goal needs better assumptions, a different target or more planned units.</p>
    <p>Curriculum credits and graded units may differ. Enter remaining graded units yourself rather than subtracting the current count from your curriculum total.</p>
  </>;
}

export function SimulatorInfoModal({ isOpen, onClose, initialTopic = 'what-if' }: HelpProps) {
  const [topic, setTopic] = useState(initialTopic);
  const dialogRef = useAccessibleDialog(isOpen, onClose);
  useEffect(() => { if (isOpen) setTopic(initialTopic); }, [isOpen, initialTopic]);
  if (!isOpen) return null;
  return <div className="modal-overlay plan-dialog-overlay" onClick={onClose}>
    <div className="modal-content v2-info-dialog plan-help-dialog" role="dialog" aria-modal="true" aria-labelledby="sim-info-modal-title" ref={dialogRef} onClick={event => event.stopPropagation()}>
      <div className="modal-header"><div><h2 id="sim-info-modal-title">How grade planning works</h2><p>Understand the inputs, scope and result.</p></div><button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close planner help"><X size={22} /></button></div>
      <div className="plan-help-topics" role="group" aria-label="Planner help topics">{topics.map(item => <button type="button" key={item.value} aria-pressed={topic === item.value} onClick={() => setTopic(item.value)}>{item.label}</button>)}</div>
      <div className="modal-body"><HelpContent topic={topic} /><p className="plan-help-notice">Planning estimates only. GWA cutoff references do not confirm awards. Bicol University’s Office of the University Registrar determines final grades and eligibility.</p></div>
      <div className="modal-footer"><button type="button" className="plan-primary" onClick={onClose}>Back to my plan</button></div>
    </div>
  </div>;
}

export function SimulatorActionDialog({ action, onClose, onConfirm }: { action: 'reset' | 'review' | null; onClose: () => void; onConfirm: () => void }) {
  const dialogRef = useAccessibleDialog(action !== null, onClose);
  if (action === null) return null;
  return <div className="modal-overlay plan-dialog-overlay" onClick={onClose}>
    <div className="modal-content v2-info-dialog plan-help-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="plan-action-title" onClick={event => event.stopPropagation()}>
      <div className="modal-header"><h2 id="plan-action-title">{action === 'reset' ? 'Reset this scenario?' : 'Use your updated record?'}</h2><button type="button" className="modal-close-btn" aria-label="Close scenario dialog" onClick={onClose}><X size={22} /></button></div>
      <div className="modal-body"><p>{action === 'reset' ? 'This clears the current planning horizon’s assumptions. Your other scenario and saved academic grades stay intact.' : 'Recalculate from the current saved grades. Imported courses that now have grades or were removed will leave this future plan. Changed imported rows are refreshed with blank assumptions. Manual rows and unchanged imported assumptions stay.'}</p></div>
      <div className="modal-footer"><button type="button" onClick={onClose} data-dialog-initial-focus>Keep my plan</button><button type="button" className="plan-primary" onClick={onConfirm}>{action === 'reset' ? 'Reset scenario' : 'Use updated record'}</button></div>
    </div>
  </div>;
}
