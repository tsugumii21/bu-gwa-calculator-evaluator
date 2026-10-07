import React, { useState, useEffect } from 'react';

export type SimulatorTopic = 'what-if' | 'allocator' | 'trend';

interface SimulatorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: SimulatorTopic;
}

export const SimulatorInfoModal: React.FC<SimulatorInfoModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'what-if',
}) => {
  const [activeTopic, setActiveTopic] = useState<SimulatorTopic>(initialTopic);

  useEffect(() => {
    if (isOpen) {
      setActiveTopic(initialTopic);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', zIndex: 1100 }}>
      <div
        className="modal-content animate__animated animate__fadeInUp animate__faster"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          width: '92%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--card-header-bg, #f1f5f9)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bu-blue, #1b2a6f)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <i className="fa-solid fa-circle-question" style={{ color: 'var(--bu-gold, #f59e0b)', fontSize: '1.15rem' }}></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                Academic Suite Reference Guide
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #475569)' }}>
                Official BU Handbook formulas &amp; simulator mechanics
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Topic Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px',
            gap: '8px',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className={`btn btn-sm ${activeTopic === 'what-if' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTopic('what-if')}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <i className="fa-solid fa-flask" style={{ marginRight: '6px' }}></i>
            What-If Simulator
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTopic === 'allocator' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTopic('allocator')}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <i className="fa-solid fa-bullseye" style={{ marginRight: '6px' }}></i>
            Target Allocator
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTopic === 'trend' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTopic('trend')}
            style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <i className="fa-solid fa-chart-line" style={{ marginRight: '6px' }}></i>
            Academic Trend Chart
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            color: 'var(--text-primary, #0f172a)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {activeTopic === 'what-if' && (
            <>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  <i className="fa-solid fa-flask text-primary" style={{ marginRight: '8px' }}></i>
                  What-If Scenario Simulator
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  The What-If Simulator forecasts your future <strong>Cumulative GWA</strong> by projecting anticipated grades across remaining academic units towards your degree completion.
                </p>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bu-azure, #2563eb)', marginBottom: '4px' }}>
                  <i className="fa-solid fa-circle-question" style={{ marginRight: '6px' }}></i>
                  Why does it show Latin Honor Pace instead of President&#39;s or Dean&#39;s List?
                </strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>President&#39;s Lister (≤ 1.4500)</strong> and <strong>Dean&#39;s Lister (≤ 1.7500)</strong> are <em>single-semester honors</em> evaluated strictly on that term&#39;s courses with specific constraints (no grade below 1.75 for PL, no grade below 2.50 for DL, minimum 15 units).
                </p>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  By contrast, the What-If Simulator projects your <strong>4-year cumulative graduation GWA</strong> across past and remaining future units. Graduation honors (Summa Cum Laude ≤ 1.2500, Magna Cum Laude ≤ 1.4500, Cum Laude ≤ 1.7500) are evaluated on your entire collegiate record, so the simulator benchmarks your long-term graduation trajectory.
                </p>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>Mathematical Formulas:</strong>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--card-header-bg, #f1f5f9)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  <div><strong>Projected Cumulative GWA:</strong></div>
                  <div>((Current GWA × Current Units) + (Anticipated Grade × Future Units)) ÷ (Current Units + Future Units)</div>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>Target Honor Finder (Reverse Calculation):</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Select a Latin Honor target (Summa, Magna, or Cum Laude) and enter remaining units. The engine calculates the exact grade average you must maintain to hit that graduation honor threshold:
                </p>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--card-header-bg, #f1f5f9)',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  <div><strong>Required Future Grade:</strong></div>
                  <div>((Target Honor GWA × Total Units) - (Current GWA × Current Units)) ÷ Future Units</div>
                </div>
              </div>
            </>
          )}

          {activeTopic === 'allocator' && (
            <>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  <i className="fa-solid fa-bullseye text-primary" style={{ marginRight: '8px' }}></i>
                  Per-Subject Target Grade Allocator (Reverse Solver)
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  The Allocator provides <strong>semestral course-level micro-planning</strong>. It calculates the exact minimum grades required across challenging subjects by leveraging locked expected grades in other courses.
                </p>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--bu-gold, #f59e0b)', marginBottom: '4px' }}>
                  <i className="fa-solid fa-lightbulb" style={{ marginRight: '6px' }}></i>
                  How Bueño Students Use This:
                </strong>
                <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong>Pick an Active Term</strong>: Select any recorded semester or use the default curriculum template.</li>
                  <li><strong>Set Your Target GPA</strong>: Tap Summa (1.25), President&#39;s Lister (1.45), Dean&#39;s Lister (1.75), or enter a custom GPA.</li>
                  <li><strong>Lock Known Subjects</strong>: Lock high marks (e.g. 1.00 or 1.25) in subjects you are confident about (GEs, PE, NSTP).</li>
                  <li><strong>Instant Reverse Solution</strong>: The solver computes the uniform grade required in all remaining unlocked major subjects.</li>
                  <li><strong>Apply to Semester</strong>: Tap &ldquo;Apply Target Grades&rdquo; to automatically populate the calculated values directly into that semester card!</li>
                </ol>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '6px' }}>Status Meanings:</strong>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li><strong className="text-primary">Target Achievable</strong>: Displays the exact uniform grade required across unlocked units.</li>
                  <li><strong className="text-success">Already Guaranteed</strong>: Even with a passing mark (3.00), your locked grades ensure your target GPA.</li>
                  <li><strong className="text-danger">Mathematically Unreachable</strong>: Required grade exceeds the BU maximum mark (1.00). You need higher locked grades in other courses.</li>
                </ul>
              </div>
            </>
          )}

          {activeTopic === 'trend' && (
            <>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                  <i className="fa-solid fa-chart-line text-primary" style={{ marginRight: '8px' }}></i>
                  Multi-Semester Academic Trend &amp; Latin Honor Trajectory
                </h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  Visualizes your semestral grade volatility versus long-term cumulative stability against official Bicol University Latin graduation honor benchmarks.
                </p>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--card-header-bg, #f1f5f9)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                }}
              >
                <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Chart Elements &amp; Legend:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '3px', background: '#3b82f6', borderRadius: '2px', flexShrink: 0 }} />
                    <div><strong>Blue Line (Term GPA)</strong>: Shows term-by-term performance and grade swings.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '3px', background: '#f59e0b', borderRadius: '2px', flexShrink: 0 }} />
                    <div><strong>Orange Line (Cumulative GWA)</strong>: Shows the cumulative weighted average over your entire stay.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '2px', borderTop: '2px dashed #10b981', flexShrink: 0 }} />
                    <div><strong>Summa Cum Laude (≤ 1.20)</strong>: Target safe zone for highest graduation honors.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '2px', borderTop: '2px dashed #3b82f6', flexShrink: 0 }} />
                    <div><strong>Magna Cum Laude (≤ 1.45)</strong>: Benchmark threshold for high graduation honors.</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '2px', borderTop: '2px dashed #f59e0b', flexShrink: 0 }} />
                    <div><strong>Cum Laude (≤ 1.75)</strong>: Graduation honors threshold under BU BOR Res. 89 s. 2006.</div>
                  </div>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Interactive Diagnostics:</strong>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Hover or tap any semester data node to inspect the exact 4-decimal Term GPA, Cumulative GWA, and total graded units recorded for that term.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--card-header-bg, #f1f5f9)',
          }}
        >
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
