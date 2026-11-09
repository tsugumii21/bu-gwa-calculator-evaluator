import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SCHOLARSHIP_REQUIREMENTS, type ScholarshipRequirements } from '../core/scholarship';

interface ScholarshipState {
  requirements: ScholarshipRequirements;
  update: (changes: Partial<ScholarshipRequirements>) => void;
}
/** Persists only the student's editable requirement settings, separately from grades. */
export const useScholarshipStore = create<ScholarshipState>()(persist((set) => ({
  requirements: DEFAULT_SCHOLARSHIP_REQUIREMENTS,
  update: changes => set(state => ({ requirements: { ...state.requirements, confirmed: false, ...changes } })),
}), { name: 'bu_gwa_scholarship_v2' }));
