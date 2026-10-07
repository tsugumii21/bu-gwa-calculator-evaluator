import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { SCHOLARSHIP_PRESETS } from '../../core/constants';

export const ScholarshipView: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const stats = calculateCumulativeStats(semesters);

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [maxGWA, setMaxGWA] = useState<number>(2.5);
  const [lowestGrade, setLowestGrade] = useState<number>(3.0);
  const [noInc, setNoInc] = useState<boolean>(true);
  const [noFail, setNoFail] = useState<boolean>(true);

  const applyPreset = (key: string) => {
    setSelectedPreset(key);
    if (key && key in SCHOLARSHIP_PRESETS) {
      const p = SCHOLARSHIP_PRESETS[key as keyof typeof SCHOLARSHIP_PRESETS];
      setMaxGWA(p.maxGWA);
      setLowestGrade(p.lowestGrade);
      setNoInc(p.noInc);
      setNoFail(p.noFail);
    }
  };

  // Find lowest individual grade
  let lowestIndividualGrade = 1.0;
  semesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      const g = parseFloat(sub.grade);
      if (!isNaN(g) && g > lowestIndividualGrade) {
        lowestIndividualGrade = g;
      }
    });
  });

  const hasData = stats.gradedUnits > 0;
  const isGwaCompliant = hasData ? stats.cumulativeGWA <= maxGWA : false;
  const isLowestCompliant = hasData ? lowestIndividualGrade <= lowestGrade : false;
  const isIncCompliant = noInc ? !stats.hasInc : true;
  const isFailCompliant = noFail ? !stats.hasFailingGrade : true;

  const isOverallCompliant =
    hasData && isGwaCompliant && isLowestCompliant && isIncCompliant && isFailCompliant;

  return (
    <div className="tab-content active" id="tab-scholarship">
      <div className="section-header">
        <h2><i className="fa-solid fa-graduation-cap"></i> Scholarship Retention Monitor</h2>
        <p className="section-desc">Track whether your current academic performance meets scholarship retention criteria.</p>
      </div>

      <div className="sch-grid">
        <div className="sim-panel sch-config-panel">
          <h3 className="panel-title">Scholarship Requirements</h3>

          <div className="form-group">
            <label htmlFor="scholarship-preset">Quick Preset</label>
            <select
              id="scholarship-preset"
              className="form-control"
              value={selectedPreset}
              onChange={(e) => applyPreset(e.target.value)}
            >
              <option value="">Select Scholarship</option>
              <option value="dost">DOST-SEI Merit Scholarship</option>
              <option value="ched_full">CHED Full Merit Scholarship</option>
              <option value="ched_half">CHED Half Merit Scholarship</option>
              <option value="tes">TES (Tertiary Education Subsidy)</option>
              <option value="bu_athletic">BU Athletic Scholarship</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sch-max-gwa">Maximum Allowed GWA</label>
            <input
              type="number"
              id="sch-max-gwa"
              className="form-control"
              value={maxGWA}
              min="1.00"
              max="5.00"
              step="0.05"
              inputMode="decimal"
              onChange={(e) => setMaxGWA(parseFloat(e.target.value) || 2.5)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sch-lowest-grade">Lowest Acceptable Individual Grade</label>
            <input
              type="number"
              id="sch-lowest-grade"
              className="form-control"
              value={lowestGrade}
              min="1.0"
              max="5.0"
              step="0.1"
              inputMode="decimal"
              onChange={(e) => setLowestGrade(parseFloat(e.target.value) || 3.0)}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="sch-no-inc"
                checked={noInc}
                onChange={(e) => setNoInc(e.target.checked)}
              />
              <span>No Incomplete (INC) grades allowed</span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="sch-no-fail"
                checked={noFail}
                onChange={(e) => setNoFail(e.target.checked)}
              />
              <span>No Failing (5.0) grades allowed</span>
            </label>
          </div>
        </div>

        <div className="sim-panel sch-status-panel">
          <div className="sch-status-container" id="sch-status-container">
            <div className="sch-status-icon" id="sch-icon">
              {!hasData ? (
                <i className="fa-solid fa-circle-info text-gold"></i>
              ) : isOverallCompliant ? (
                <i className="fa-solid fa-circle-check text-success"></i>
              ) : (
                <i className="fa-solid fa-circle-xmark text-danger"></i>
              )}
            </div>
            <div className="sch-status-text">
              <h3 id="sch-status-title">
                {!hasData
                  ? 'Awaiting Data'
                  : isOverallCompliant
                    ? 'Compliant with Scholarship'
                    : 'Non-Compliant / At Risk'}
              </h3>
              <p id="sch-status-desc">
                {!hasData
                  ? 'Add your subject grades in the Calculator tab to evaluate compliance.'
                  : isOverallCompliant
                    ? 'All current grades meet or exceed the selected scholarship retention criteria.'
                    : 'One or more of your grades do not satisfy the retention guidelines.'}
              </p>
            </div>
          </div>

          <h3 className="panel-title" style={{ marginTop: 'var(--space-lg)' }}>Compliance Checklist</h3>
          <ul className="sch-checklist">
            <li id="chk-gwa">
              {!hasData ? (
                <>
                  <i className="fa-solid fa-circle-dot text-muted"></i> GWA Threshold Check (Max {maxGWA.toFixed(2)})
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isGwaCompliant ? 'fa-check text-success' : 'fa-xmark text-danger'}`}></i>{' '}
                  {isGwaCompliant ? 'GWA Check Passed' : 'GWA Check Failed'} ({stats.cumulativeGWA.toFixed(4)} {isGwaCompliant ? '≤' : '>'} {maxGWA.toFixed(2)})
                </>
              )}
            </li>
            <li id="chk-grade">
              {!hasData ? (
                <>
                  <i className="fa-solid fa-circle-dot text-muted"></i> Individual Grade Cap Check (Limit {lowestGrade.toFixed(2)})
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isLowestCompliant ? 'fa-check text-success' : 'fa-xmark text-danger'}`}></i>{' '}
                  {isLowestCompliant ? 'Grade Cap Passed' : 'Grade Cap Exceeded'} (Lowest: {lowestIndividualGrade.toFixed(2)} {isLowestCompliant ? '≤' : '>'} {lowestGrade.toFixed(2)})
                </>
              )}
            </li>
            <li id="chk-inc">
              {!hasData ? (
                <>
                  <i className="fa-solid fa-circle-dot text-muted"></i> Incomplete (INC) Check
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isIncCompliant ? 'fa-check text-success' : 'fa-xmark text-danger'}`}></i>{' '}
                  {isIncCompliant ? 'No INC Grades Check Passed' : 'Disqualified: Unresolved INC Grade Found'}
                </>
              )}
            </li>
            <li id="chk-fail">
              {!hasData ? (
                <>
                  <i className="fa-solid fa-circle-dot text-muted"></i> Failing Mark (5.0) Check
                </>
              ) : (
                <>
                  <i className={`fa-solid ${isFailCompliant ? 'fa-check text-success' : 'fa-xmark text-danger'}`}></i>{' '}
                  {isFailCompliant ? 'No Failing Mark Check Passed' : `Disqualified: ${stats.failingCount} Failing Mark(s) Found`}
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
