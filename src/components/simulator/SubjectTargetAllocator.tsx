import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Plus, Undo2, X } from 'lucide-react';

import type { Semester } from '../../types';
import type { PlannedCourse, ScenarioDraft } from '../../core/scenario-planner';
import { parseGrade } from '../../core/gwa-engine';
import { SIMULATION_MAX_UNITS, addSimulationTotals, EMPTY_SIMULATION_TOTALS, simulationNumbers, simulationTotals } from '../../core/simulation';
import { SIMULATOR_MAX_COURSES } from '../../store/simulator-store';

const DESKTOP_PAGE_SIZE = 6;
const MOBILE_PAGE_SIZE = 4;
const MOBILE_QUERY = '(max-width: 768px)';
interface CourseProps {
  draft: ScenarioDraft; semesters: Semester[];
  onImport: (id: string) => void;
  onUpdate: (id: string, changes: Partial<PlannedCourse>) => void;
  onRemove: (id: string) => void;
  onAdd: () => string | null; onUndo: () => string | null; canUndo: boolean;
}
function unfinishedField(course: PlannedCourse, isForecast: boolean) {
  const units = Number(course.units);
  if (!course.units.trim() || !Number.isFinite(units) || units < 0 || units > SIMULATION_MAX_UNITS) return 'units';
  if ((isForecast && units > 0 && !course.grade) || (course.grade && parseGrade(course.grade) === null)) return 'grade';
  return null;
}

/** Pages presentation only; the scenario engine always receives every course. */
export function SubjectTargetAllocator({ draft, semesters, onImport, onUpdate, onRemove, onAdd, onUndo, canUndo }: CourseProps) {
  const [pageSize, setPageSize] = useState(() => window.matchMedia(MOBILE_QUERY).matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
  const [anchor, setAnchor] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selected, setSelected] = useState(draft.sourceSemesterId || '');
  const [replacePending, setReplacePending] = useState(false);
  const [notice, setNotice] = useState('');
  const pendingFocus = useRef<{ id: string; field: string } | null>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const importable = semesters.filter(term => term.subjects.some(subject => !subject.grade.trim()));
  const count = draft.courses.length;
  const page = Math.floor(Math.min(anchor, Math.max(0, count - 1)) / pageSize);
  const start = page * pageSize;
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const unfinished = draft.courses.flatMap((course, index) => unfinishedField(course, draft.question.kind === 'forecast') ? [index] : []);
  const hiddenUnfinished = unfinished.filter(index => index < start || index >= start + pageSize).length;
  const units = simulationNumbers(draft.courses.reduce((total, course) => {
    const value = Number(course.units);
    return Number.isFinite(value) && value > 0 && value <= SIMULATION_MAX_UNITS ? addSimulationTotals(total, simulationTotals(value, 0)) : total;
  }, EMPTY_SIMULATION_TOTALS)).units;
  const assigned = draft.courses.filter(course => parseGrade(course.grade) !== null).length;
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const resize = () => setPageSize(query.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    query.addEventListener('change', resize);
    return () => query.removeEventListener('change', resize);
  }, []);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    const index = draft.courses.findIndex(course => course.id === target.id);
    if (index >= 0 && (index < start || index >= start + pageSize)) { setAnchor(index); return; }
    const input = document.getElementById(`plan-${target.field}-${target.id}`);
    if (input) { input.focus(); pendingFocus.current = null; }
  }, [draft.courses, start, pageSize]);
  const reveal = (id: string | null, index: number, field = 'units') => {
    if (!id) { addRef.current?.focus(); return; }
    pendingFocus.current = { id, field }; setAnchor(index);
    // Same-page navigation needs focus even when the page index does not change.
    const input = document.getElementById(`plan-${field}-${id}`);
    if (input) { input.focus(); pendingFocus.current = null; }
  };
  const add = () => {
    const id = onAdd();
    if (!id) { setNotice(`Maximum ${SIMULATOR_MAX_COURSES} courses per scenario.`); return; }
    reveal(id, count); setNotice(`Course ${count + 1} added. Enter its units.`);
  };
  const remove = (course: PlannedCourse, index: number) => {
    const nearest = draft.courses[index + 1] ?? draft.courses[index - 1];
    onRemove(course.id); reveal(nearest?.id ?? null, Math.max(0, Math.min(index, count - 2)));
    setNotice(`Course ${index + 1} removed. Undo is available.`);
  };
  const undo = () => {
    const id = onUndo();
    if (id) { pendingFocus.current = { id, field: 'units' }; setNotice('Course restored.'); }
  };
  const importSelected = () => {
    if (!selected || !importable.some(term => term.id === selected)) { setNotice('Choose a semester with ungraded courses.'); return; }
    onImport(selected); setReplacePending(false); setIsImportOpen(false); setAnchor(0);
  };
  const requestImport = () => {
    if (draft.sourceSemesterId && selected !== draft.sourceSemesterId && draft.courses.some(course => course.source)) setReplacePending(true);
    else importSelected();
  };
  const goToUnfinished = () => {
    const index = unfinished[0];
    if (index !== undefined) reveal(draft.courses[index].id, index, unfinishedField(draft.courses[index], draft.question.kind === 'forecast') ?? 'units');
  };
  return <div className="plan-course-editor">
    <div className="plan-course-toolbar"><div><h3>Future courses</h3><p className="plan-hint">{count} courses · {units} units · {assigned} assumed · {count - assigned} {draft.question.kind === 'goal' ? 'to solve' : 'unassigned'}</p></div><button type="button" onClick={add} ref={addRef}><Plus size={18} aria-hidden="true" /> Add course</button></div>
    <p className="plan-hint" id="plan-course-grade-note">Type units and expected grades. BU course grades: 1.00–3.00 in 0.10 steps, or 4.00 and 5.00. {draft.question.kind === 'goal' ? 'Leave grades blank to solve their average.' : 'Enter a grade for each positive-unit course.'} Names are optional.</p>
    <div className="plan-course-actions">{importable.length > 0 && <button type="button" aria-expanded={isImportOpen} aria-controls="plan-import-controls" onClick={() => setIsImportOpen(!isImportOpen)}><Download size={17} aria-hidden="true" /> Import from saved semester</button>}{canUndo && <button type="button" onClick={undo}><Undo2 size={17} aria-hidden="true" /> Undo removal</button>}</div>
    {isImportOpen && <div className="plan-import" id="plan-import-controls"><label className="plan-field" htmlFor="plan-source"><span>Saved semester with ungraded courses</span><select id="plan-source" value={selected} onChange={event => { setSelected(event.target.value); setReplacePending(false); }}><option value="">Choose a semester</option>{importable.map(term => <option key={term.id} value={term.id}>{term.title}</option>)}</select></label><p className="plan-hint">Only blank-grade courses are imported. Numeric grades are already included; INC and DRP stay excluded.</p><button type="button" onClick={requestImport}>Import ungraded courses</button>{replacePending && <div className="plan-warning" role="group" aria-label="Confirm replacement of imported courses"><p>Replace imported assumptions with this semester’s ungraded courses? Manual courses stay.</p><button type="button" onClick={importSelected}>Replace imported courses</button><button type="button" onClick={() => setReplacePending(false)}>Keep current courses</button></div>}</div>}
    {unfinished.length > 0 && <div className="plan-course-check"><span>{unfinished.length} courses need entries{hiddenUnfinished ? ` · ${hiddenUnfinished} on other pages` : ''}</span><button type="button" onClick={goToUnfinished}>Go to first unfinished course</button></div>}
    <div className="plan-ledger-head" aria-hidden="true"><span>Course name (optional)</span><span>Units</span><span>Expected grade</span><span /></div>
    <div className="plan-course-list">{!count && <p className="plan-course-empty">Add future courses to begin. Your saved academic record stays unchanged.</p>}
      {draft.courses.slice(start, start + pageSize).map((course, offset) => {
        const index = start + offset;
        const missing = unfinishedField(course, draft.question.kind === 'forecast');
        return <div className="plan-course" key={course.id} role="group" aria-label={`Planned course ${index + 1}`} onFocusCapture={() => setAnchor(index)}>
          <label className="plan-field plan-course-name" htmlFor={`plan-name-${course.id}`}><span className="plan-sr-only">Course {index + 1} name (optional)</span><input id={`plan-name-${course.id}`} type="text" maxLength={500} placeholder={`Course ${index + 1}${course.source ? ' · imported' : ''}`} value={course.name} onChange={event => onUpdate(course.id, { name: event.target.value })} /></label>
          <label className="plan-field plan-course-units" htmlFor={`plan-units-${course.id}`}><span><span className="plan-sr-only">Course {index + 1} </span>Units{course.source ? ' · imported' : ''}</span><input id={`plan-units-${course.id}`} type="text" inputMode="decimal" maxLength={500} placeholder="e.g. 3" value={course.units} readOnly={!!course.source} aria-invalid={missing === 'units' && !!course.units} onChange={event => onUpdate(course.id, { units: event.target.value })} /></label>
          <label className="plan-field plan-course-grade" htmlFor={`plan-grade-${course.id}`}><span><span className="plan-sr-only">Course {index + 1} </span>Expected grade</span><input id={`plan-grade-${course.id}`} type="text" inputMode="decimal" maxLength={500} placeholder={draft.question.kind === 'goal' ? 'Blank = solve' : 'e.g. 1.50'} value={course.grade} aria-invalid={!!course.grade && missing === 'grade'} aria-describedby="plan-course-grade-note" onChange={event => onUpdate(course.id, { grade: event.target.value })} /></label>
          <button type="button" className="plan-icon-button plan-remove" aria-label={`Remove planned course ${index + 1}`} onClick={() => remove(course, index)}><X size={18} aria-hidden="true" /></button>
        </div>;
      })}
    </div>
    {count > 0 && <div className="plan-pagination"><p className="plan-hint">Courses {start + 1}–{Math.min(count, start + pageSize)} of {count}<br />All {count} included in the calculation</p>{count > pageSize && <nav aria-label="Future course pages"><button type="button" aria-label="Previous course page" disabled={page === 0} onClick={() => setAnchor((page - 1) * pageSize)}><ChevronLeft size={18} aria-hidden="true" /></button><span aria-live="polite">{page + 1} / {pageCount}</span><button type="button" aria-label="Next course page" disabled={page + 1 === pageCount} onClick={() => setAnchor((page + 1) * pageSize)}><ChevronRight size={18} aria-hidden="true" /></button></nav>}</div>}
    <p className="plan-import-notice plan-hint" role="status">{notice}</p>
  </div>;
}
