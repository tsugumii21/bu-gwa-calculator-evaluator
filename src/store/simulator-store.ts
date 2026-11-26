import { create } from 'zustand';

import { emptyScenario, type PlannedCourse, type PlanningHorizon, type ScenarioDraft } from '../core/scenario-planner';

export const SIMULATOR_STORAGE_KEY = 'bu_gwa_simulator_v1';
export const SIMULATOR_MAX_COURSES = 200;
const MAX_TEXT_LENGTH = 500;
const MAX_SIGNATURE_LENGTH = 500000;
type DraftStorage = Pick<Storage, 'getItem' | 'setItem'>;
type SavedPlans = { version: 1; horizon: PlanningHorizon; drafts: Record<PlanningHorizon, ScenarioDraft> };

interface SimulatorState extends SavedPlans {
  storageMessage: string;
  chooseHorizon: (horizon: PlanningHorizon) => void;
  replaceDraft: (draft: ScenarioDraft) => void;
  resetDraft: () => void;
}

const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object';
const isText = (value: unknown, limit = MAX_TEXT_LENGTH): value is string => typeof value === 'string' && value.length <= limit;

function isCourse(value: unknown): value is PlannedCourse {
  if (!isObject(value) || !['id', 'name', 'units', 'grade'].every(key => isText(value[key]))) return false;
  if (value.source === undefined) return true;
  const source = value.source;
  return isObject(source) && isText(source.semesterId) && isText(source.fingerprint, MAX_SIGNATURE_LENGTH)
    && Number.isInteger(source.rowIndex) && Number(source.rowIndex) >= 0;
}

function isDraft(value: unknown, horizon: PlanningHorizon): value is ScenarioDraft {
  if (!isObject(value) || value.horizon !== horizon || !['quick', 'courses'].includes(String(value.method))) return false;
  if (!['units', 'average', 'sourceSemesterId'].every(key => isText(value[key])) || !isText(value.reviewedRecord, MAX_SIGNATURE_LENGTH)) return false;
  if (!Array.isArray(value.courses) || value.courses.length > SIMULATOR_MAX_COURSES || !value.courses.every(isCourse)) return false;
  if (new Set(value.courses.map(course => course.id)).size !== value.courses.length) return false;
  const question = value.question;
  if (!isObject(question)) return false;
  if (horizon === 'degree' && (value.method !== 'quick' || (question.kind === 'goal' && question.scope !== 'overall'))) return false;
  return question.kind === 'forecast' || (question.kind === 'goal' && ['overall', 'term'].includes(String(question.scope)) && isText(question.target));
}

function readPlans(storage?: DraftStorage): { plans: SavedPlans; message: string } {
  const fallback: SavedPlans = { version: 1, horizon: 'semester', drafts: { semester: emptyScenario('semester'), degree: emptyScenario('degree') } };
  if (!storage) return { plans: fallback, message: 'This plan is temporary; browser storage is unavailable.' };
  try {
    const raw = storage.getItem(SIMULATOR_STORAGE_KEY);
    if (!raw) return { plans: fallback, message: '' };
    const parsed: unknown = JSON.parse(raw);
    if (isObject(parsed) && parsed.version === 1 && ['semester', 'degree'].includes(String(parsed.horizon))
      && isObject(parsed.drafts) && isDraft(parsed.drafts.semester, 'semester') && isDraft(parsed.drafts.degree, 'degree')) {
      return { plans: parsed as SavedPlans, message: '' };
    }
    return { plans: fallback, message: 'The saved plan could not be read. Start a new scenario; your academic record is unaffected.' };
  } catch {
    return { plans: fallback, message: 'The saved plan could not be read. Your academic record is unaffected.' };
  }
}

function savePlans(storage: DraftStorage | undefined, state: SavedPlans): string {
  if (!storage) return 'Changes remain in this tab; browser storage is unavailable.';
  try {
    storage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify({ version: state.version, horizon: state.horizon, drafts: state.drafts }));
    return '';
  } catch {
    return 'This plan could not be saved in this browser. Keep this tab open to retain your changes.';
  }
}

/** Separate scenario persistence, with visible storage failures and no grade-store dependency. */
export function createSimulatorStore(storage?: DraftStorage) {
  const initial = readPlans(storage);
  return create<SimulatorState>()((set, get) => {
    const commit = (changes: Partial<SavedPlans>) => {
      const next = { ...get(), ...changes };
      set({ ...changes, storageMessage: savePlans(storage, next) });
    };
    return {
      ...initial.plans, storageMessage: initial.message,
      chooseHorizon: horizon => commit({ horizon }),
      replaceDraft: draft => commit({ drafts: { ...get().drafts, [draft.horizon]: draft } }),
      resetDraft: () => {
        const { horizon, drafts } = get();
        commit({ drafts: { ...drafts, [horizon]: emptyScenario(horizon) } });
      },
    };
  });
}

function browserStorage(): DraftStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; }
  catch { return undefined; }
}

export const useSimulatorStore = createSimulatorStore(browserStorage());
