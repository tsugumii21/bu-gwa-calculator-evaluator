import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import type { Semester } from '../../types';
import { X, Plus, Calendar } from 'lucide-react';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_PRESETS = [
  '1st Year - 1st Semester',
  '1st Year - 2nd Semester',
  '2nd Year - 1st Semester',
  '2nd Year - 2nd Semester',
  '3rd Year - 1st Semester',
  '3rd Year - 2nd Semester',
  '4th Year - 1st Semester',
  '4th Year - 2nd Semester',
  'Midyear / Summer Term',
];

export const AddSemesterModal: React.FC<AddSemesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addSemester, semesters } = useSemesterStore();

  // Smart suggestion: pick the next sequential semester title
  const nextPreset = COMMON_PRESETS[Math.min(semesters.length, COMMON_PRESETS.length - 1)] || 'New Semester';
  const [title, setTitle] = useState(nextPreset);
  const [underload, setUnderload] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSem: Semester = {
      id: crypto.randomUUID(),
      title: title.trim(),
      subjects: [
        { code: '', name: '', grade: '1.25', units: 3.0 },
      ],
      underload,
      computed: false,
    };

    addSemester(newSem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm">
      <div className="card w-full sm:max-w-[480px] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Add New Semester
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Semester Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-md px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. 1st Year - 1st Semester"
              autoFocus
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="block text-[11px] text-slate-400 font-semibold mb-1.5 uppercase">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTitle(preset)}
                  className={`
                    px-2 py-1 rounded text-[11px] transition-colors
                    ${
                      title === preset
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Underload Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={underload}
                onChange={(e) => setUnderload(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span>
                <strong>Underloaded term:</strong> carried less than the prescribed curriculum units (disqualifies from Latin Graduation Honors per handbook).
              </span>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-bu-navy hover:bg-bu-navy-light text-white dark:bg-bu-amber dark:text-slate-900 dark:hover:bg-bu-amber-light disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Semester
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
