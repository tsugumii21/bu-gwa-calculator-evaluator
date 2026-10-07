import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { calculateTargetGrade } from '../../core/honor-rules';
import { HONOR_THRESHOLDS } from '../../core/constants';
import { AcademicTrendChart } from '../charts/AcademicTrendChart';
import { SubjectTargetAllocator } from './SubjectTargetAllocator';
import { SimulatorInfoModal, SimulatorTopic } from './SimulatorInfoModal';

export const SimulatorView: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const stats = calculateCumulativeStats(semesters);

  const currentGWA = stats.cumulativeGWA;
  const currentUnits = stats.gradedUnits;

  // Simulator Inputs
  const [futureUnits, setFutureUnits] = useState<number>(21);
  const [anticipatedGrade, setAnticipatedGrade] = useState<number>(1.5);
  const [targetHonor, setTargetHonor] = useState<number | null>(null);

  // Info Modal State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoTopic, setInfoTopic] = useState<SimulatorTopic>('what-if');

  const openInfo = (topic: SimulatorTopic) => {
    setInfoTopic(topic);
    setInfoModalOpen(true);
  };

  // Projected GWA Calculation
  const totalProjectedUnits = currentUnits + futureUnits;
  const totalProjectedPoints =
    currentGWA * currentUnits + anticipatedGrade * futureUnits;
  const projectedGWA =
    totalProjectedUnits > 0 ? totalProjectedPoints / totalProjectedUnits : 0;

  const getProjectedHonor = (gwa: number) => {
    if (gwa <= HONOR_THRESHOLDS.SUMMA.maxGWA) return 'Summa Cum Laude Pace (≤ 1.2500)';
    if (gwa <= HONOR_THRESHOLDS.MAGNA.maxGWA) return 'Magna Cum Laude Pace (≤ 1.4500)';
    if (gwa <= HONOR_THRESHOLDS.CUM.maxGWA) return 'Cum Laude Pace (≤ 1.7500)';
    return 'Regular Academic Standing Pace (GWA > 1.7500)';
  };

  const targetResult =
    targetHonor !== null
      ? calculateTargetGrade(currentGWA, currentUnits, futureUnits, targetHonor)
      : null;

  return (
    <div className="tab-content active" id="tab-simulator">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2><i className="fa-solid fa-flask"></i> What-If Scenario Simulator</h2>
          <p className="section-desc">Project your future GWA by simulating anticipated grades for remaining units.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => openInfo('what-if')}
          title="How does What-If Scenario Simulator work?"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '4px',
          }}
        >
          <i className="fa-solid fa-circle-question" style={{ fontSize: '0.95rem' }}></i>
        </button>
      </div>

      <div className="sim-grid">
        <div className="sim-panel sim-input-panel">
          <div className="sim-section-group current-group">
            <h3 className="panel-title">
              <i className="fa-solid fa-chart-pie text-primary" style={{ marginRight: '6px' }}></i> Current Performance{' '}
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
                  value={currentUnits > 0 ? currentGWA.toFixed(4) : '0.0000'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="sim-current-units">Current Total Units</label>
                <input
                  type="text"
                  id="sim-current-units"
                  className="form-control readonly-input"
                  readOnly
                  value={currentUnits.toFixed(0)}
                />
              </div>
            </div>
          </div>

          <div className="sim-section-group future-group">
            <h3 className="panel-title">
              <i className="fa-solid fa-sliders text-gold" style={{ marginRight: '6px' }}></i> Future Projection Simulation
            </h3>
            <div className="form-group">
              <label htmlFor="sim-future-units">Remaining Future Units</label>
              <input
                type="number"
                id="sim-future-units"
                className="form-control"
                value={futureUnits}
                min="0"
                max="200"
                step="1"
                inputMode="numeric"
                onChange={(e) => setFutureUnits(Math.max(0, parseInt(e.target.value) || 0))}
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
          <div className="projected-result-box">
            <span className="proj-label">
              <i className="fa-solid fa-calculator" style={{ marginRight: '4px' }}></i> Projected Cumulative GWA
            </span>
            <span className="proj-gwa" id="proj-gwa-result">
              {projectedGWA.toFixed(4)}
            </span>
            <span className="proj-honor" id="proj-honor-result">
              {futureUnits > 0 ? getProjectedHonor(projectedGWA) : 'Add future units to simulate'}
            </span>
          </div>

          <div className="target-finder">
            <h3 className="panel-title">
              <i className="fa-solid fa-bullseye text-danger" style={{ marginRight: '6px' }}></i> Target Honor Finder
            </h3>
            <p className="section-desc">Select a target honor level to find the minimum grade needed in remaining units:</p>
            <div className="target-buttons">
              <button
                className={`btn btn-gold btn-sm ${targetHonor === 1.25 ? 'ring-2' : ''}`}
                onClick={() => setTargetHonor(1.25)}
              >
                <i className="fa-solid fa-crown"></i> Summa (≤1.25)
              </button>
              <button
                className={`btn btn-orange btn-sm ${targetHonor === 1.45 ? 'ring-2' : ''}`}
                onClick={() => setTargetHonor(1.45)}
              >
                <i className="fa-solid fa-medal"></i> Magna (≤1.45)
              </button>
              <button
                className={`btn btn-primary btn-sm ${targetHonor === 1.75 ? 'ring-2' : ''}`}
                onClick={() => setTargetHonor(1.75)}
              >
                <i className="fa-solid fa-award"></i> Cum Laude (≤1.75)
              </button>
            </div>
            <div className="target-result" id="target-result-output">
              {targetResult === null ? (
                'Select a target honor above and specify remaining units.'
              ) : targetResult < 1.0 ? (
                <span className="text-danger font-bold">
                  Mathematically unreachable: requires an average grade of {targetResult.toFixed(2)}, which is higher than the maximum grade (1.00).
                </span>
              ) : targetResult > 3.0 ? (
                <span className="text-success font-bold">
                  Already secured! Even with a passing grade average (3.00), you will qualify for this honor.
                </span>
              ) : (
                <span>
                  You need an average grade of <strong>{targetResult.toFixed(2)}</strong> across your remaining {futureUnits} units.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Per-Subject Target Allocator (Reverse Solver) */}
      <SubjectTargetAllocator onOpenInfo={() => openInfo('allocator')} />

      {/* Multi-Semester Academic Trend & Latin Honor Trajectory */}
      <AcademicTrendChart onOpenInfo={() => openInfo('trend')} />

      {/* Dedicated Simulator & Suite Reference Modal */}
      <SimulatorInfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        initialTopic={infoTopic}
      />
    </div>
  );
};
