import React, { useState } from 'react';
import { HandbookPolicies } from './HandbookPolicies';
import { AboutGuide } from '../about/AboutGuide';
import { AboutOverview } from '../about/AboutOverview';
import { AboutDeveloper } from '../about/AboutDeveloper';

type HandbookSubtab = 'policies' | 'guide' | 'overview' | 'developer';

export const HandbookView: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState<HandbookSubtab>('policies');

  return (
    <div className="tab-pane active" id="tab-handbook">
      <div className="section-header">
        <h2>
          <i className="fa-solid fa-book-bookmark text-primary"></i> Bicol University Academic Handbook &amp; Guide
        </h2>
        <p className="section-desc">
          Official academic grading scales, semestral recognition (PL/DL), Latin graduation honors, midyear policies, platform user guides, and developer governance.
        </p>
      </div>

      {/* SUB-TAB BAR */}
      <div className="subtab-bar" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`subtab-btn ${activeSubtab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('policies')}
        >
          <i className="fa-solid fa-landmark"></i> Academic Policies &amp; Midyear
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
          className={`subtab-btn ${activeSubtab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubtab('overview')}
        >
          <i className="fa-solid fa-book-open"></i> Overview &amp; Disclaimer
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
      {activeSubtab === 'policies' && <HandbookPolicies />}
      {activeSubtab === 'guide' && <AboutGuide />}
      {activeSubtab === 'overview' && <AboutOverview />}
      {activeSubtab === 'developer' && <AboutDeveloper />}
    </div>
  );
};
