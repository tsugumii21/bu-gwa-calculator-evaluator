import React, { useState } from 'react';
import { AboutOverview } from './AboutOverview';
import { AboutGuide } from './AboutGuide';
import { AboutPolicies } from './AboutPolicies';
import { AboutDeveloper } from './AboutDeveloper';

type AboutSubtab = 'overview' | 'guide' | 'policies' | 'developer';

export const AboutView: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<AboutSubtab>('overview');

  return (
    <div className="tab-pane active" id="tab-about">
      <div className="section-header">
        <h2>
          <i className="fa-solid fa-circle-info text-primary"></i> About &amp; Official Academic Governance
        </h2>
        <p className="section-desc">
          Learn more about the project, official policies, platform capabilities, and developer.
        </p>
      </div>

      {/* SUB-TAB BAR */}
      <div className="subtab-bar" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('overview')}
        >
          <i className="fa-solid fa-book-open"></i> Overview &amp; Disclaimer
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('guide')}
        >
          <i className="fa-solid fa-circle-question"></i> How to Use
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('policies')}
        >
          <i className="fa-solid fa-landmark"></i> Handbook Policy Governance
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'developer' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('developer')}
        >
          <i className="fa-solid fa-user-gear"></i> Developer &amp; Feedback
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      {activeSubtab === 'overview' && <AboutOverview />}
      {activeSubtab === 'guide' && <AboutGuide />}
      {activeSubtab === 'policies' && <AboutPolicies />}
      {activeSubtab === 'developer' && <AboutDeveloper />}
    </div>
  );
};
