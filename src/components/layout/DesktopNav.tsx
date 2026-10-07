import React from 'react';
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
  { tab: 'scholarship', label: 'Scholarship', icon: GraduationCap },
  { tab: 'policies', label: 'Policies', icon: BookOpen },
  { tab: 'about', label: 'About', icon: Info },
];

export const DesktopNav: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  return (
    <nav
      className="flex items-center gap-1 bg-white/10 p-1 rounded-full backdrop-blur-md border border-white/10"
      role="tablist"
      aria-label="Main navigation"
    >
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
              flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150
              ${
                isActive
                  ? 'bg-white text-[#1b2a6f] shadow-sm scale-100 font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/15'
              }
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
