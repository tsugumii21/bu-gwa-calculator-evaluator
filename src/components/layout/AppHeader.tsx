import React, { useState } from 'react';
import buAppLogo from '../../assets/images/bu-app-logo.png';
import { useAppStore } from '../../store';
import type { AppTab } from '../../types';

interface AppHeaderProps {
  onOpenGuide?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenGuide }) => {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const navItems: { tab: AppTab; label: string; icon: string }[] = [
    { tab: 'calculator', label: 'Calculator', icon: 'fa-calculator' },
    { tab: 'simulator', label: 'Simulator', icon: 'fa-flask' },
    { tab: 'scholarship', label: 'Scholarship', icon: 'fa-graduation-cap' },
    { tab: 'policies', label: 'Policies', icon: 'fa-book-open' },
    { tab: 'about', label: 'About', icon: 'fa-circle-info' },
  ];

  return (
    <header className="navbar" role="banner">
      <div className={`navbar-inner ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {/* Brand Logo */}
        <div
          className="brand-section"
          onClick={() => setActiveTab('calculator')}
        >
          <div className="brand-logo">
            <img src={buAppLogo} alt="BU GWA Logo" />
          </div>
          <div className="app-title">
            <span className="app-name">
              BU GWA Calculator<span className="desktop-only-title"> & Academic Evaluator</span>
            </span>
            <span className="app-subtitle">Bicol University Academic Evaluator</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="nav-tabs-container" role="tablist" aria-label="Main navigation">
          {navItems.map(({ tab, label, icon }) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
            >
              <i className={`fa-solid ${icon}`}></i>
              <span className="tab-label">{label}</span>
            </button>
          ))}
        </nav>

        {/* Actions Group (Theme Toggle + Guide + Mobile Menu) */}
        <div className="nav-actions-group">
          {onOpenGuide && (
            <button
              className="guide-toggle-btn"
              id="btn-guide-toggle"
              title="How to Use Guide"
              aria-label="Open guide"
              onClick={onOpenGuide}
            >
              <i className="fa-solid fa-circle-question"></i>
            </button>
          )}

          <button
            className="theme-toggle-btn"
            id="btn-theme-toggle"
            title="Toggle Dark/Light Mode"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-yellow-400' : 'fa-moon'}`}></i>
          </button>

          <button
            className="mobile-menu-btn"
            id="btn-mobile-menu"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};
