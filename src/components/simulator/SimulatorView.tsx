import React, { useState } from 'react';
import { MascotReference } from '../illustrations/mascot-reference';
import { useSemesterStore, useAppStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { validateCalculationEntries } from '../../core/calculation-report';
import { calculateTargetGrade } from '../../core/honor-rules';
import { HONOR_THRESHOLDS } from '../../core/constants';
import { projectGWA, SIMULATION_DEFAULT_UNITS, SIMULATION_MAX_UNITS, SIMULATION_DEFAULT_GRADE } from '../../core/simulation';
import { UNOFFICIAL_NOTICE } from '../dashboard/calculation-result';
import { AcademicTrendChart } from '../charts/AcademicTrendChart';
import { SubjectTargetAllocator } from './SubjectTargetAllocator';
import { SimulatorInfoModal, SimulatorTopic } from './SimulatorInfoModal';

export const SimulatorView: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const stats = calculateCumulativeStats(semesters);
  const baselineError = validateCalculationEntries(semesters)[0];

  const currentGWA = stats.cumulativeGWA;
  const currentUnits = stats.gradedUnits;

  // Simulator Inputs
  const [futureUnits, setFutureUnits] = useState<number>(SIMULATION_DEFAULT_UNITS);
  const [anticipatedGrade, setAnticipatedGrade] = useState<number>(SIMULATION_DEFAULT_GRADE);
  const [targetHonor, setTargetHonor] = useState<number | null>(null);

  // Info Modal State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoTopic, setInfoTopic] = useState<SimulatorTopic>('what-if');

  const openInfo = (topic: SimulatorTopic) => {
    setInfoTopic(topic);
    setInfoModalOpen(true);
  };

  // Projected GWA Calculation
  const projectedGWA = baselineError ? null : projectGWA(stats.totalPoints, currentUnits, futureUnits, anticipatedGrade);

  const getProjectedHonor = (gwa: number) => {
    if (gwa <= HONOR_THRESHOLDS.SUMMA.maxGWA) return 'Summa Cum Laude Pace (≤ 1.2500)';
    if (gwa <= HONOR_THRESHOLDS.MAGNA.maxGWA) return 'Magna Cum Laude Pace (≤ 1.4500)';
    if (gwa <= HONOR_THRESHOLDS.CUM.maxGWA) return 'Cum Laude Pace (≤ 1.7500)';
    return 'Regular Academic Standing Pace (GWA > 1.7500)';
  };

  const targetResult =
    !baselineError && targetHonor !== null && futureUnits > 0
      ? calculateTargetGrade(currentGWA, currentUnits, futureUnits, targetHonor)
      : null;

  return (
    <div className="tab-content active v2-simulator" id="tab-simulator">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div className="v2-sim-heading-tools"><span className="v2-sim-eyebrow">YOUR NEXT CHAPTER</span>        <button
          type="button"
          className="sim-help-btn"
          onClick={() => openInfo('what-if')}
          title="How does What-If Scenario Simulator work?"
          aria-label="What-If Simulator Reference Guide"
        >
          <i className="fa-solid fa-question"></i>
        </button></div>
          <div className="v2-sim-title-scene"><h1>A little planning.<br />A clearer next step.</h1><MascotReference scene="simulator" className="planning-student" /></div>
          <p className="section-desc">Explore your next semester. Your saved grades stay as they are.</p>
        </div>
      </div>

      {baselineError && <p role="alert">Correct the saved course before projecting. {baselineError}</p>}
      <section className="projected-result-box v2-sim-result" aria-label="Hypothetical projection">
        <div><span className="proj-label">Projected cumulative GWA</span><strong className="proj-gwa" id="proj-gwa-result" aria-live="polite">{projectedGWA === null ? '—' : projectedGWA.toFixed(4)}</strong><span className="proj-honor" id="proj-honor-result">{futureUnits > 0 && projectedGWA !== null ? getProjectedHonor(projectedGWA) : 'Add future units to explore a scenario'}</span></div>
        <div className="v2-sim-result-context"><span className="v2-sim-badge">Hypothetical · not an award</span><p>{futureUnits} future units at an average of {anticipatedGrade.toFixed(2)}</p><p>{currentUnits > 0 ? `Based on ${currentUnits} graded units in your record.` : 'No graded baseline yet. This shows only your future scenario.'}</p></div>
      </section>
      <p className="v2-sim-disclaimer">{UNOFFICIAL_NOTICE}</p>

      <div className="sim-grid">
        <div className="sim-panel sim-input-panel">
          <div className="sim-section-group current-group">
            <h3 className="panel-title">
              <i className="fa-solid fa-chart-pie text-primary" style={{ marginRight: '6px' }}></i> Your starting point{' '}
              <span className="read-only-badge"><i className="fa-solid fa-lock"></i> Auto-calculated</span>
            </h3>
            <div className="sim-form-row">
              <div className="form-group">
                <label htmlFor="sim-current-gwa">Current Cumulative GWA</label>
                <input
                  type="text"
                  id="sim-current-gwa"
                  className="form-control readonly-input"
                  readOnly
                  value={!baselineError && currentUnits > 0 ? currentGWA.toFixed(4) : '—'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sim-current-units">Current graded units</label>
                <input
                  type="text"
                  id="sim-current-units"
                  className="form-control readonly-input"
                  readOnly
                  value={baselineError ? '—' : String(currentUnits)}
                />
              </div>
            </div>
          </div>
          <p className="v2-sim-baseline-note">Uses numeric grades from all saved semesters, including uncomputed terms. Blank, INC and DRP entries do not contribute to this average.</p>

          <div className="sim-section-group future-group">
            <h3 className="panel-title">
              <i className="fa-solid fa-sliders text-gold" style={{ marginRight: '6px' }}></i> Try a future scenario
            </h3>
            <div className="form-group">
              <label htmlFor="sim-future-units">Remaining Future Units</label>
              <input
                type="number"
                id="sim-future-units"
                className="form-control"
                value={futureUnits}
                min="0"
                max={SIMULATION_MAX_UNITS}
                step="1"
                inputMode="numeric"
                onChange={(e) => setFutureUnits(Math.min(SIMULATION_MAX_UNITS, Math.max(0, parseInt(e.target.value) || 0)))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label htmlFor="sim-grade-slider" style={{ marginBottom: 0 }}>Anticipated Average Grade</label>
                <span className="slider-badge">
                  <strong id="sim-slider-val">{anticipatedGrade.toFixed(2)}</strong>
                </span>
              </div>
              <input
                type="range"
                id="sim-grade-slider"
                className="slider"
                min="1.00"
                max="3.00"
                step="0.05"
                value={anticipatedGrade}
                onChange={(e) => setAnticipatedGrade(parseFloat(e.target.value))}
              />
              <div className="slider-labels">
                <span>1.00 (Highest)</span>
                <span>2.00</span>
                <span>3.00 (Passing)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sim-panel sim-output-panel">
          <div className="target-finder">
            <h3 className="panel-title">
              <i className="fa-solid fa-bullseye text-danger" style={{ marginRight: '6px' }}></i> Work toward a target
            </h3>
            <p className="section-desc">Select a target honor level to find the minimum grade needed in remaining units:</p>
            <div className="target-buttons">
              <button
                className={`btn btn-gold btn-sm ${targetHonor === 1.25 ? 'ring-2' : ''}`}
                aria-pressed={targetHonor === HONOR_THRESHOLDS.SUMMA.maxGWA}
                onClick={() => setTargetHonor(HONOR_THRESHOLDS.SUMMA.maxGWA)}
              >
                <i className="fa-solid fa-crown"></i> Summa (≤1.25)
              </button>
              <button
                className={`btn btn-orange btn-sm ${targetHonor === 1.45 ? 'ring-2' : ''}`}
                aria-pressed={targetHonor === HONOR_THRESHOLDS.MAGNA.maxGWA}
                onClick={() => setTargetHonor(HONOR_THRESHOLDS.MAGNA.maxGWA)}
              >
                <i className="fa-solid fa-medal"></i> Magna (≤1.45)
              </button>
              <button
                className={`btn btn-primary btn-sm ${targetHonor === 1.75 ? 'ring-2' : ''}`}
                aria-pressed={targetHonor === HONOR_THRESHOLDS.CUM.maxGWA}
                onClick={() => setTargetHonor(HONOR_THRESHOLDS.CUM.maxGWA)}
              >
                <i className="fa-solid fa-award"></i> Cum Laude (≤1.75)
              </button>
            </div>
            <div className="target-result" id="target-result-output" aria-live="polite">
              {targetResult === null ? (
                futureUnits === 0 ? 'Add future units to calculate a target average.' : 'Choose a GWA target to see the average you would need.'
              ) : targetResult < 1.0 ? (
                <span className="text-danger font-bold">
                  Mathematically unreachable: requires an average grade of {targetResult.toFixed(2)}, which is higher than the maximum grade (1.00).
                </span>
              ) : targetResult > 3.0 ? (
                <span className="text-success font-bold">
                  A passing average of 3.00 would meet this GWA target in this scenario. Honor eligibility is not verified.
                </span>
              ) : (
                <span>
                  Aim for an average of <strong>{targetResult.toFixed(4)}</strong> or numerically lower across your remaining {futureUnits} units. This is a GWA target, not confirmed honors.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {semesters.length === 0 ? (
        <div className="sim-empty-grid">
          {/* Allocator Empty Card */}
          <div className="sim-empty-card">
            <div className="sim-empty-icon-wrap">
              <i className="fa-solid fa-bullseye"></i>
            </div>
            <div className="sim-empty-content">
              <h4 className="sim-empty-title">
                Per-Subject Target Allocator
              </h4>
              <p className="sim-empty-desc">
                Reverse-solve required grades for major subjects by locking expected ratings in general courses.
              </p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm sim-empty-btn"
                onClick={() => setActiveTab('calculator')}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
                Add Courses in Calculator
              </button>
            </div>
          </div>

          {/* Trend Chart Empty Card */}
          <div className="sim-empty-card">
            <div className="sim-empty-icon-wrap">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <div className="sim-empty-content">
              <h4 className="sim-empty-title">
                Academic Trend Visualizer
              </h4>
              <p className="sim-empty-desc">
                See how your term averages and cumulative GWA change across your recorded semesters.
              </p>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm sim-empty-btn"
                onClick={() => setActiveTab('calculator')}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: '6px' }}></i>
                Add Semesters to Plot
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Per-Subject Target Allocator (Reverse Solver) */}
          {!baselineError && <SubjectTargetAllocator onOpenInfo={() => openInfo('allocator')} />}

          {/* Multi-Semester Academic Trend & Latin Honor Trajectory */}
          <AcademicTrendChart onOpenInfo={() => openInfo('trend')} />
        </>
      )}

      {/* Dedicated Simulator & Suite Reference Modal */}
      <SimulatorInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        initialTopic={infoTopic}
      />
    </div>
  );
};
