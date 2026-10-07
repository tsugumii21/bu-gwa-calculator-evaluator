import React from 'react';
import { useAppStore } from '../../store';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { ThemeMode } from '../../types';

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];

const THEME_ICONS: Record<ThemeMode, React.FC<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
};

export const ThemeToggle: React.FC = () => {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const nextTheme = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
  const Icon = THEME_ICONS[theme];

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className="h-10 w-10 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/25 hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95"
      aria-label={`Current: ${THEME_LABELS[theme]}. Click to switch.`}
      title={THEME_LABELS[theme]}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
