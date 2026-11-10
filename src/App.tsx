import { useEffect, useLayoutEffect } from 'react';
import { useAppStore } from './store';
import { AppShell } from './components/layout/AppShell';
import { WelcomeV2 } from './components/layout/welcome-v2';

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
  const activeTab = useAppStore((s) => s.activeTab);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const resetScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.addEventListener('pageshow', resetScroll);
    return () => {
      window.history.scrollRestoration = previous;
      window.removeEventListener('pageshow', resetScroll);
    };
  }, []);

  useLayoutEffect(() => {
    // A footer/skip-link fragment from the previous page must not move the new page.
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, isWelcomeDismissed]);

  return (
    <>
      {isWelcomeDismissed ? <AppShell /> : <WelcomeV2 />}
    </>
  );
}
