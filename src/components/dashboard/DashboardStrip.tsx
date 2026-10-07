import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats, calculateComputedCumulativeStats } from '../../core/gwa-engine';
import { evaluateHonorStanding, evaluateAcademicStanding } from '../../core/honor-rules';
import { InfoModal, type InfoModalType } from './InfoModal';

export const DashboardStrip: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const [modalType, setModalType] = useState<InfoModalType>(null);

  const allStats = calculateCumulativeStats(semesters);
  const computedStats = calculateComputedCumulativeStats(semesters);
  const computedCount = semesters.filter((s) => s.computed).length;

  const honorEval = evaluateHonorStanding(computedStats);
  const standingEval = evaluateAcademicStanding(allStats);

  // 1. Cumulative GWA
  const hasComputedGrades = computedStats.gradedUnits > 0;
  const gwaDisplay = hasComputedGrades
    ? computedStats.cumulativeGWA.toFixed(4)
    : '0.0000';
  const gwaSubtext = hasComputedGrades
    ? `${computedStats.gradedUnits.toFixed(1)} units · ${computedCount} term${computedCount > 1 ? 's' : ''}`
    : 'Awaiting computation';

  // 2. Honor Qualification
  const honorDisplay = hasComputedGrades ? honorEval.label : 'Pending Evaluation';
  const honorSubtext = hasComputedGrades
    ? honorEval.description
    : "Click 'Compute GPA' to evaluate";

  const honorBadgeClass =
    !hasComputedGrades || honorEval.level === 'pending'
      ? 'text-black-white'
      : honorEval.level === 'not-eligible'
        ? 'text-danger'
        : 'text-gold';

  // 3. Academic Standing
  const standingDisplay = allStats.totalCourses > 0 ? standingEval.label : 'Good Standing';
  const standingSubtext =
    allStats.failingCount === 0 && !allStats.hasInc
      ? '0 deficiencies detected'
      : standingEval.description;

  const standingBadgeClass =
    standingEval.level === 'good'
      ? 'text-success'
      : standingEval.level === 'warning'
        ? 'text-gold'
        : 'text-danger';

  // 4. Total Units
  const unitsDisplay = allStats.totalUnits.toFixed(allStats.totalUnits % 1 === 0 ? 0 : 1);
  const unitsSubtext = `${allStats.totalCourses} courses recorded`;

  return (
    <>
      <section className="dashboard-summary" aria-label="Academic summary dashboard">
        {/* CARD 1: CUMULATIVE GWA */}
        <div className="summary-card" id="card-gwa">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('gwa');
            }}
            title="Explain Cumulative GWA"
            aria-label="Cumulative GWA Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className="icon-circle icon-blue">
              <i className="fa-solid fa-chart-line"></i>
            </div>
          </div>
          <div className="card-content">
            <span className="summary-label">Cumulative GWA</span>
            <span className="summary-value" id="overall-gwa">{gwaDisplay}</span>
            <span className="summary-subtext" id="gwa-subtext">{gwaSubtext}</span>
          </div>
        </div>

        {/* CARD 2: HONOR QUALIFICATION */}
        <div className="summary-card" id="card-honor">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('honor');
            }}
            title="Explain Honor Qualification"
            aria-label="Honor Qualification Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className="icon-circle icon-gold">
              <i className="fa-solid fa-medal"></i>
            </div>
          </div>
          <div className="card-content">
            <span className="summary-label">Honor Qualification</span>
            <span className={`summary-value honor-badge ${honorBadgeClass}`} id="honor-status">
              {honorDisplay}
            </span>
            <span className="summary-subtext" id="honor-subtext">{honorSubtext}</span>
          </div>
        </div>

        {/* CARD 3: ACADEMIC STANDING */}
        <div className="summary-card" id="card-standing">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('standing');
            }}
            title="Explain Academic Standing"
            aria-label="Academic Standing Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className="icon-circle icon-green">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
          </div>
          <div className="card-content">
            <span className="summary-label">Academic Standing</span>
            <span className={`summary-value standing-badge ${standingBadgeClass}`} id="academic-standing">
              {standingDisplay}
            </span>
            <span className="summary-subtext" id="standing-subtext">{standingSubtext}</span>
          </div>
        </div>

        {/* CARD 4: TOTAL UNITS */}
        <div className="summary-card" id="card-units">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('units');
            }}
            title="Explain Total Units"
            aria-label="Total Units Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className="icon-circle icon-purple">
              <i className="fa-solid fa-layer-group"></i>
            </div>
          </div>
          <div className="card-content">
            <span className="summary-label">Total Units</span>
            <span className="summary-value" id="total-units">{unitsDisplay}</span>
            <span className="summary-subtext" id="units-subtext">{unitsSubtext}</span>
          </div>
        </div>
      </section>

      {/* Explainer Info Modal */}
      <InfoModal
        type={modalType}
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
      />
    </>
  );
};
