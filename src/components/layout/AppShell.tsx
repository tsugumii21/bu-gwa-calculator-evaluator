import { useAppStore } from '../../store';
import { ShellHeader } from './shell-header';
import { SiteFooter } from './site-footer';


import { CalculatorView } from '../dashboard/CalculatorView';
import { SimulatorView } from '../simulator/SimulatorView';
import { ScholarshipView } from '../scholarship/ScholarshipView';
import { HandbookView } from '../handbook/HandbookView';
import { BuenoAiDrawer } from '../ai/BuenoAiDrawer';
import type { AppTab } from '../../types';

const TAB_COMPONENTS: Record<AppTab, React.FC> = {
  calculator: CalculatorView,
  simulator: SimulatorView,
  scholarship: ScholarshipView,
  handbook: HandbookView,
  guide: HandbookView,
  // Backward compatibility aliases
  policies: HandbookView,
  about: HandbookView,
};

export function AppShell() {
  const activeTab = useAppStore((s) => s.activeTab);
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] || HandbookView;

  return (
    <div className="rd-app-shell">
      {/* Header with desktop navigation & theme toggle */}
      <ShellHeader />


      {/* Main content area — natural window scrolling */}
      <main className={activeTab === 'calculator' ? 'rd-calculator-main' : 'main-container'} id="academic-workspace" tabIndex={-1}>
        <ActiveTabComponent />
      </main>

      <SiteFooter />

      {/* Floating Bueño AI Assistant */}
      <BuenoAiDrawer />
    </div>
  );
}
