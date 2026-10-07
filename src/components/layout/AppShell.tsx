import { useAppStore } from '../../store';
import { AppHeader } from './AppHeader';
import { CalculatorView } from '../dashboard/CalculatorView';
import { SimulatorView } from '../simulator/SimulatorView';
import { ScholarshipView } from '../scholarship/ScholarshipView';
import { PoliciesView } from '../policies/PoliciesView';
import { AboutView } from '../about/AboutView';
import { BuenoAiDrawer } from '../ai/BuenoAiDrawer';
import type { AppTab } from '../../types';

const TAB_COMPONENTS: Record<AppTab, React.FC> = {
  calculator: CalculatorView,
  simulator: SimulatorView,
  scholarship: ScholarshipView,
  policies: PoliciesView,
  about: AboutView,
};

export function AppShell() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const ActiveTabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with desktop navigation & theme toggle */}
      <AppHeader onOpenGuide={() => setActiveTab('about')} />

      {/* Main content area — natural window scrolling */}
      <main className="main-container">
        <ActiveTabComponent />
      </main>

      {/* Authentic BU Footer */}
      <footer className="footer">
        <p><em>&quot;Scholarship • Leadership • Service • Character&quot;</em> • Bicol University Core Values</p>
        <p>Built by <a href="https://github.com/tsugumii21" target="_blank" rel="noopener noreferrer">Allen Del Valle</a> · <a href="https://github.com/tsugumii21/bu-gwa-calculator-evaluator" target="_blank" rel="noopener noreferrer">GitHub Repository</a></p>
      </footer>

      {/* Floating Bueño AI Assistant */}
      <BuenoAiDrawer />
    </div>
  );
}
