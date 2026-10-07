import { useAppStore } from '../../store';
import { Calculator, FlaskConical, GraduationCap, BookOpen, Info } from 'lucide-react';
import type { AppTab } from '../../types';

interface NavItem {
  tab: AppTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'calculator', label: 'Calculator', icon: Calculator },
  { tab: 'simulator', label: 'Simulator', icon: FlaskConical },
  { tab: 'scholarship', label: 'Scholar', icon: GraduationCap },
  { tab: 'policies', label: 'Policies', icon: BookOpen },
  { tab: 'about', label: 'About', icon: Info },
];

export function MobileBottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-lg md:hidden dark:border-slate-800 dark:bg-slate-950/90"
      style={{ height: 'var(--bottom-nav-height)' }}
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full max-w-lg items-stretch justify-around">
        {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={`
                flex min-w-[48px] cursor-pointer flex-col items-center justify-center gap-0.5
                px-2 py-1 text-[10px] font-medium transition-colors
                ${isActive
                  ? 'text-bu-amber'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }
              `}
              style={{ transitionDuration: 'var(--duration-fast)' }}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-bu-amber" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
