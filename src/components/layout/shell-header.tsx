import { useRef, useState } from 'react';
import { useAppStore } from '../../store';
import type { AppTab } from '../../types';
import { ThemePreference } from './theme-preference';

const NAV_ITEMS: { tab: AppTab; label: string }[] = [
  { tab: 'calculator', label: 'Calculator' }, { tab: 'simulator', label: 'Simulator' },
  { tab: 'scholarship', label: 'Scholarship' }, { tab: 'handbook', label: 'Handbook' },
];

/** Responsive navigation with one shared theme preference and stable tab identities. */
export function ShellHeader() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const [isOpen, setIsOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const currentTab = activeTab === 'about' || activeTab === 'policies' || activeTab === 'guide' ? 'handbook' : activeTab;
  function navigate(tab: AppTab) {
    setActiveTab(tab);
    if (isOpen) menuButton.current?.focus();
    setIsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  return <header className="rd-welcome rd-shell-header" onKeyDown={e => {
    if (e.key === 'Escape' && isOpen) { setIsOpen(false); menuButton.current?.focus(); }
  }}>
    <a className="rd-skip" href="#academic-workspace">Skip to workspace</a>
    <button className="rd-brand rd-brand-button" onClick={() => navigate('calculator')} aria-label="BU GWA calculator home">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
      <span className="rd-brand-copy">BU GWA <span className="rd-brand-descriptor">Calculator</span></span>
    </button>
    <ThemePreference/>
    <button ref={menuButton} className="rd-menu-button" aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => setIsOpen(!isOpen)}>Menu <i aria-hidden="true" className={isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}/></button>
    <nav id="primary-navigation" className={isOpen ? 'rd-navigation is-open' : 'rd-navigation'} aria-label="Main navigation">
      {NAV_ITEMS.map(({tab,label}) => <button key={tab} aria-current={currentTab === tab ? 'page' : undefined} onClick={() => navigate(tab)}>{label}</button>)}
      <button className="v2-welcome-link" onClick={() => useAppStore.setState({ isWelcomeDismissed: false })}>Welcome</button>
    </nav>
  </header>;
}
