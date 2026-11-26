import { useMemo, useState } from 'react';

import { useSemesterStore } from '../../store';
import { useSimulatorStore, SIMULATOR_MAX_COURSES } from '../../store/simulator-store';
import { deriveScenario, importScenarioCourses, recordSignature, type PlannedCourse, type ScenarioDraft } from '../../core/scenario-planner';
import { buildSavedRecordEvidence } from '../../core/calculation-report';

/** Connects one saved-record snapshot and one draft to the pure planning report. */
export function useSimulatorPlan() {
  const semesters = useSemesterStore(state => state.semesters);
  const state = useSimulatorStore();
  const draft = state.drafts[state.horizon];
  const report = useMemo(() => deriveScenario(semesters, draft), [semesters, draft]);
  const evidence = useMemo(() => buildSavedRecordEvidence(semesters), [semesters]);
  const signature = recordSignature(semesters);
  const [removed, setRemoved] = useState<{ course: PlannedCourse; index: number; horizon: string; signature: string } | null>(null);
  const [editorRevision, setEditorRevision] = useState(0);
  const resetEditor = () => { setRemoved(null); setEditorRevision(value => value + 1); };
  const update = (changes: Partial<ScenarioDraft>) => state.replaceDraft({
    ...draft, ...changes, reviewedRecord: draft.reviewedRecord || recordSignature(semesters),
  });
  const updateCourse = (id: string, changes: Partial<PlannedCourse>) => update({
    courses: draft.courses.map(course => course.id === id ? { ...course, ...changes } : course),
  });
  const addCourse = () => {
    if (draft.courses.length >= SIMULATOR_MAX_COURSES) return null;
    const id = crypto.randomUUID();
    update({ courses: [...draft.courses, { id, name: '', units: '', grade: '' }] });
    return id;
  };
  const importCourses = (id: string) => { resetEditor(); state.replaceDraft(importScenarioCourses(draft, semesters, id)); };
  const reviewChanges = () => {
    resetEditor();
    const refreshed = draft.method === 'courses' ? importScenarioCourses(draft, semesters, draft.sourceSemesterId) : draft;
    state.replaceDraft({ ...refreshed, reviewedRecord: recordSignature(semesters) });
  };
  const canUndo = !!removed && removed.horizon === state.horizon && removed.signature === signature && draft.courses.length < SIMULATOR_MAX_COURSES;
  const undoRemove = () => {
    if (!canUndo || !removed) return null;
    const courses = [...draft.courses];
    courses.splice(removed.index, 0, removed.course);
    update({ courses }); setRemoved(null);
    return removed.course.id;
  };
  const removeCourse = (id: string) => {
    const index = draft.courses.findIndex(course => course.id === id);
    if (index < 0) return;
    setRemoved({ course: draft.courses[index], index, horizon: state.horizon, signature });
    update({ courses: draft.courses.filter(course => course.id !== id) });
  };
  return { ...state, draft, report, evidence, semesters, update, updateCourse, addCourse, importCourses, reviewChanges,
    removeCourse, undoRemove, canUndo, editorRevision,
    resetDraft: () => { resetEditor(); state.resetDraft(); },
    chooseHorizon: (horizon: ScenarioDraft['horizon']) => { resetEditor(); state.chooseHorizon(horizon); },
  };
}
