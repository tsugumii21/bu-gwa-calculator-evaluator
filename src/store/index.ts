import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Semester, Subject, AppTab, ThemeMode } from '../types';

// ─── Storage Keys ───────────────────────────────────────────
const STORAGE_KEY = 'bu_gwa_semesters_v2';
const SETTINGS_KEY = 'bu_gwa_settings_v2';

// ─── App Store ──────────────────────────────────────────────

interface AppState {
  /** Active navigation tab */
  activeTab: AppTab;
  /** Theme preference */
  theme: ThemeMode;
  /** Whether the welcome screen has been dismissed */
  isWelcomeDismissed: boolean;

  setActiveTab: (tab: AppTab) => void;
  setTheme: (theme: ThemeMode) => void;
  dismissWelcome: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'calculator',
      theme: 'system',
      isWelcomeDismissed: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setTheme: (theme) => set({ theme }),
      dismissWelcome: () => set({ isWelcomeDismissed: true }),
    }),
    { name: SETTINGS_KEY }
  )
);

// ─── Semester Store ─────────────────────────────────────────

interface SemesterState {
  semesters: Semester[];

  addSemester: (semester: Semester) => void;
  removeSemester: (id: string) => void;
  updateSemester: (id: string, updates: Partial<Semester>) => void;
  moveSemester: (id: string, direction: 'up' | 'down') => void;
  reorderSemesters: (semesters: Semester[]) => void;

  addSubject: (semesterId: string, subject: Subject) => void;
  updateSubject: (semesterId: string, subjectIndex: number, updates: Partial<Subject>) => void;
  removeSubject: (semesterId: string, subjectIndex: number) => void;

  computeSemester: (id: string) => void;
  unComputeSemester: (id: string) => void;
  computeAllSemesters: () => void;

  importSemesters: (semesters: Semester[]) => void;
  clearAll: () => void;
}

export const useSemesterStore = create<SemesterState>()(
  persist(
    (set) => ({
      semesters: [],

      addSemester: (semester) =>
        set((state) => ({
          semesters: [...state.semesters, semester],
        })),

      removeSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.filter((s) => s.id !== id),
        })),

      updateSemester: (id, updates) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      moveSemester: (id, direction) =>
        set((state) => {
          const index = state.semesters.findIndex((s) => s.id === id);
          if (index === -1) return state;

          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= state.semesters.length) return state;

          const newSemesters = [...state.semesters];
          const temp = newSemesters[index];
          newSemesters[index] = newSemesters[newIndex];
          newSemesters[newIndex] = temp;

          return { semesters: newSemesters };
        }),

      reorderSemesters: (semesters) => set({ semesters }),

      addSubject: (semesterId, subject) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? { ...s, subjects: [...s.subjects, subject], computed: false }
              : s
          ),
        })),

      updateSubject: (semesterId, subjectIndex, updates) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                  subjects: s.subjects.map((sub, i) =>
                    i === subjectIndex ? { ...sub, ...updates } : sub
                  ),
                  computed: false,
                }
              : s
          ),
        })),

      removeSubject: (semesterId, subjectIndex) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                  subjects: s.subjects.filter((_, i) => i !== subjectIndex),
                  computed: false,
                }
              : s
          ),
        })),

      computeSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, computed: true } : s
          ),
        })),

      unComputeSemester: (id) =>
        set((state) => ({
          semesters: state.semesters.map((s) =>
            s.id === id ? { ...s, computed: false } : s
          ),
        })),

      computeAllSemesters: () =>
        set((state) => ({
          semesters: state.semesters.map((s) => ({
            ...s,
            computed:
              s.subjects &&
              s.subjects.some(
                (sub) => sub.grade && sub.grade.trim() !== '' && !isNaN(parseFloat(sub.grade))
              )
                ? true
                : s.computed,
          })),
        })),

      importSemesters: (newSemesters) =>
        set((state) => ({
          semesters: [...state.semesters, ...newSemesters],
        })),

      clearAll: () => set({ semesters: [] }),
    }),
    { name: STORAGE_KEY }
  )
);
