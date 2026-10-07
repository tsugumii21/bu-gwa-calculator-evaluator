import { useEffect } from 'react';
import { useAppStore } from './store';
import { AppShell } from './components/layout/AppShell';
import { WelcomeScreen } from './components/layout/WelcomeScreen';

/** Applies dark/light class to <html> based on store preference */
function useThemeEffect() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function apply(isDark: boolean) {
      root.classList.toggle('dark', isDark);
      root.classList.toggle('light', !isDark);
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    if (theme === 'system') {
      apply(prefersDark.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      prefersDark.addEventListener('change', handler);
      return () => prefersDark.removeEventListener('change', handler);
    }

    apply(theme === 'dark');
  }, [theme]);
}

export function App() {
  useThemeEffect();

  const isWelcomeDismissed = useAppStore((s) => s.isWelcomeDismissed);

  return (
    <>
      {!isWelcomeDismissed && <WelcomeScreen />}
      <AppShell />
    </>
  );
}
