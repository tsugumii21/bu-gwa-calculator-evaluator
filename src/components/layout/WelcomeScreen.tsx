import React from 'react';
import { useAppStore } from '../../store';

export const WelcomeScreen: React.FC = () => {
  const dismissWelcome = useAppStore((s) => s.dismissWelcome);

  return (
    <div
      className="welcome-screen"
      id="welcome-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        display: 'flex',
      }}
    >
      <div className="welcome-card animate__animated animate__zoomIn animate__faster">
        <div className="welcome-hero">
          <div className="welcome-logo">
            <img src="/images/bu-app-logo.png" alt="BU GWA Logo" />
          </div>
          <h1 className="welcome-title">BU GWA Calculator & Academic Evaluator</h1>
          <p className="welcome-subtitle">Bicol University Academic Evaluator & Scenario Simulator</p>
        </div>

        <div className="welcome-disclaimer-box">
          <div className="disclaimer-header">
            <i className="fa-solid fa-shield-halved"></i> Welcome Bueño Student!
          </div>
          <div className="disclaimer-text">
            This independent academic tool helps you calculate your General Weighted Average (GWA), check President's & Dean's Lister qualifications, project remaining unit grades, and monitor scholarship retention per official BU Academic Handbook policies.
          </div>
        </div>

        <div className="welcome-features">
          <span className="feat-chip">
            <i className="fa-solid fa-calculator text-primary"></i> 4-Decimal GWA Engine
          </span>
          <span className="feat-chip">
            <i className="fa-solid fa-file-pdf text-danger"></i> COR PDF Scanner
          </span>
          <span className="feat-chip">
            <i className="fa-solid fa-camera" style={{ color: '#2563eb' }}></i> Screenshot OCR
          </span>
          <span className="feat-chip">
            <i className="fa-solid fa-award text-gold"></i> Term Recognition (PL & DL)
          </span>
          <span className="feat-chip">
            <i className="fa-solid fa-medal text-gold"></i> Latin Graduation Honors
          </span>
          <span className="feat-chip">
            <i className="fa-solid fa-flask text-success"></i> Scenario Simulator
          </span>
        </div>

        <button
          type="button"
          className="btn btn-gold welcome-btn"
          onClick={dismissWelcome}
        >
          Start Academic Evaluation <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
        </button>
      </div>
    </div>
  );
};
