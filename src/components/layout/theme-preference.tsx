import { useAppStore } from '../../store';
import { ThemeSky } from './theme-sky';

/** Toggle the effective theme; existing system preferences resolve centrally in App. */
export function ThemePreference() {
  const setTheme = useAppStore(s => s.setTheme);
  return <button type="button" className="rd-theme rd-theme-toggle"
    aria-label="Toggle light and dark mode" title="Toggle light and dark mode"
    onClick={() => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark')}>
    <ThemeSky />
  </button>;
}
