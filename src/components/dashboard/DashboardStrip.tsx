import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import {
  calculateCumulativeStats,
  calculateComputedCumulativeStats,
  calculateSemesterGWA,
} from '../../core/gwa-engine';
import {
  evaluateHonorStanding,
  evaluateAcademicStanding,
  evaluateTermHonor,
} from '../../core/honor-rules';
import { InfoModal, type InfoModalType } from './InfoModal';

function formatSemShort(title: string): string {
  return title
    .replace(/Year\s*(\d+)\s*-\s*(\d+)(?:st|nd|rd|th)?\s*Semester/i, 'Y$1 S$2')
    .replace(/(\d+)(?:st|nd|rd|th)?\s*Year\s*-\s*(\d+)(?:st|nd|rd|th)?\s*Semester/i, 'Y$1 S$2')
    .replace(/AY\s*\d{2}(\d{2})-\d{2}(\d{2})\s*(?:-\s*)?(\d+)(?:st|nd|rd|th)?\s*Sem(?:ester)?/i, '$1-$2 S$3');
}

export const DashboardStrip: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const [modalType, setModalType] = useState<InfoModalType>(null);

  const allStats = calculateCumulativeStats(semesters);
  const computedStats = calculateComputedCumulativeStats(semesters);
  const computedCount = semesters.filter((s) => s.computed).length;

  const latinHonorEval = evaluateHonorStanding(computedStats);
  const standingEval = evaluateAcademicStanding(allStats);

  // 1. Cumulative GWA
  const hasComputedGrades = computedStats.gradedUnits > 0;
  const gwaDisplay = hasComputedGrades
    ? computedStats.cumulativeGWA.toFixed(4)
    : '0.0000';
  const formattedGradedUnits = computedStats.gradedUnits.toFixed(
    computedStats.gradedUnits % 1 === 0 ? 0 : 1,
  );
  const gwaSubtext = hasComputedGrades
    ? `${formattedGradedUnits} units · ${computedCount} term${computedCount > 1 ? 's' : ''}`
    : 'Awaiting computation';

  // 2. Semestral Honor (PL / DL) — Evaluates latest computed term
  const computedSemesters = semesters.filter((s) => s.computed);
  const latestComputedSem =
    computedSemesters.length > 0
      ? computedSemesters[computedSemesters.length - 1]
      : null;

  let termHonorLabel = 'Pending';
  let termHonorSubtext = "Click 'Compute GPA'";
  let termBadgeClass = 'text-black-white';
  let termIconCircle = 'icon-gold';
  let termIcon = 'fa-solid fa-crown';

  if (latestComputedSem) {
    const termGpa = calculateSemesterGWA(latestComputedSem);
    const termEval = evaluateTermHonor(
      termGpa,
      latestComputedSem.subjects,
      !!latestComputedSem.underload,
    );

    const semShort = formatSemShort(latestComputedSem.title);

    if (termEval.level === 'president') {
      termHonorLabel = "President's Lister";
      termHonorSubtext = `${semShort} · GPA ${termGpa.toFixed(4)}`;
      termBadgeClass = 'text-gold';
      termIconCircle = 'icon-gold';
      termIcon = 'fa-solid fa-crown';
    } else if (termEval.level === 'dean') {
      termHonorLabel = "Dean's Lister";
      termHonorSubtext = `${semShort} · GPA ${termGpa.toFixed(4)}`;
      termBadgeClass = 'text-blue';
      termIconCircle = 'icon-blue';
      termIcon = 'fa-solid fa-medal';
    } else {
      termHonorLabel = 'Regular Standing';
      termHonorSubtext = `${semShort} · GPA ${termGpa.toFixed(4)}`;
      termBadgeClass = 'text-secondary';
      termIconCircle = 'icon-blue';
      termIcon = 'fa-solid fa-award';
    }
  }

  // 3. Latin Graduation Honors — Evaluates cumulative graduation standing
  const latinHonorDisplay = hasComputedGrades
    ? latinHonorEval.label
    : 'Pending';

  const isLatinCumLaude =
    latinHonorEval.level === 'cum-laude' || latinHonorEval.label === 'Cum Laude';

  const latinHonorSubtext = hasComputedGrades
    ? isLatinCumLaude
      ? 'Target: ≤ 1.7500'
      : latinHonorEval.level === 'magna'
        ? 'Target: ≤ 1.4500'
        : latinHonorEval.level === 'summa'
          ? 'Target: ≤ 1.2500'
          : latinHonorEval.description
    : 'Evaluates degree GWA';

  const latinBadgeClass =
    !hasComputedGrades || latinHonorEval.level === 'pending'
      ? 'text-black-white'
      : latinHonorEval.level === 'not-eligible'
        ? 'text-danger'
        : isLatinCumLaude
          ? 'text-blue'
          : 'text-gold';

  const latinIconCircle = isLatinCumLaude ? 'icon-blue' : 'icon-gold';
  const latinIcon = isLatinCumLaude ? 'fa-solid fa-award' : 'fa-solid fa-crown';

  // 4. Academic Standing
  const standingDisplay =
    allStats.totalCourses > 0 ? standingEval.label : 'Good Standing';
  const standingSubtext =
    allStats.failingCount === 0 && !allStats.hasInc
      ? '0 deficiencies'
      : standingEval.description;

  const standingBadgeClass =
    standingEval.level === 'good'
      ? 'text-success'
      : standingEval.level === 'warning'
        ? 'text-gold'
        : 'text-danger';

  // 5. Total Units
  const unitsDisplay = allStats.totalUnits.toFixed(
    allStats.totalUnits % 1 === 0 ? 0 : 1,
  );
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

        {/* CARD 2: SEMESTRAL HONOR (PL / DL) */}
        <div className="summary-card" id="card-term-honor">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('honor');
            }}
            title="Explain Semestral Honors (PL & DL)"
            aria-label="Semestral Honors Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className={`icon-circle ${termIconCircle}`}>
              <i className={termIcon}></i>
            </div>
          </div>

          <div className="card-content">
            <span className="summary-label">Semestral Honor</span>
            <span className={`summary-value honor-badge ${termBadgeClass}`} id="term-honor-status">
              {termHonorLabel}
            </span>
            <span className="summary-subtext" id="term-honor-subtext">{termHonorSubtext}</span>
          </div>
        </div>

        {/* CARD 3: LATIN GRADUATION HONORS */}
        <div className="summary-card" id="card-latin-honor">
          <button
            className="info-help-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setModalType('latin-honor');
            }}
            title="Explain Latin Graduation Honors"
            aria-label="Latin Honors Info"
          >
            <i className="fa-solid fa-circle-question"></i>
          </button>
          <div className="card-icon-row">
            <div className={`icon-circle ${latinIconCircle}`}>
              <i className={latinIcon}></i>
            </div>
          </div>

          <div className="card-content">
            <span className="summary-label">Latin Honor</span>
            <span className={`summary-value honor-badge ${latinBadgeClass}`} id="latin-honor-status">
              {latinHonorDisplay}
            </span>
            <span className="summary-subtext" id="latin-honor-subtext">{latinHonorSubtext}</span>
          </div>
        </div>

        {/* CARD 4: ACADEMIC STANDING */}
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

        {/* CARD 5: TOTAL UNITS */}
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
