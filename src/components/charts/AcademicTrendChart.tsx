import React, { useState, useMemo } from 'react';
import { useSemesterStore } from '../../store';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { HONOR_THRESHOLDS } from '../../core/constants';

interface DataPoint {
  index: number;
  semesterId: string;
  title: string;
  termGpa: number;
  cumulativeGwa: number;
  units: number;
}

export interface AcademicTrendChartProps {
  onOpenInfo?: () => void;
}

function formatSemesterTick(title: string): string {
  const t = title.trim();

  // Pattern: "AY 2025-2026 1st Semester" or "AY 2025-2026 - 1st Semester"
  const ayMatch = t.match(/AY\s*(\d{2,4})[-–](\d{2,4})\s*(?:-\s*)?(\d(?:st|nd|rd|th)?|Midyear|Summer)?\s*(?:Sem(?:ester)?)?/i);
  if (ayMatch) {
    const y1 = ayMatch[1].slice(-2);
    const y2 = ayMatch[2].slice(-2);
    const term = ayMatch[3] ? ayMatch[3].replace(/(st|nd|rd|th)/i, '') : '1';
    return `'${y1}-${y2} S${term}`;
  }

  // Pattern: "Year 1 - 1st Semester" or "1st Year - 1st Semester"
  const yrMatch = t.match(/(?:Year\s*(\d)|(\d)(?:st|nd|rd|th)?\s*Year)\s*(?:-\s*)?(\d)(?:st|nd|rd|th)?\s*Sem/i);
  if (yrMatch) {
    const yr = yrMatch[1] || yrMatch[2];
    const sem = yrMatch[3];
    return `Y${yr} S${sem}`;
  }

  // Pattern: "1st Semester" / "2nd Semester"
  const semOnlyMatch = t.match(/(\d)(?:st|nd|rd|th)?\s*Sem(?:ester)?/i);
  if (semOnlyMatch) {
    return `Sem ${semOnlyMatch[1]}`;
  }

  return t.length > 10 ? `${t.slice(0, 9)}…` : t;
}

export const AcademicTrendChart: React.FC<AcademicTrendChartProps> = ({ onOpenInfo }) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const chartData: DataPoint[] = useMemo(() => {
    if (semesters.length === 0) return [];

    let runningPoints = 0;
    let runningUnits = 0;

    return semesters.map((sem, idx) => {
      const semGpa = calculateSemesterGWA(sem);
      const semUnits = calculateSemesterUnits(sem);

      runningPoints += semGpa * semUnits;
      runningUnits += semUnits;

      const cumGwa = runningUnits > 0 ? runningPoints / runningUnits : semGpa;

      return {
        index: idx,
        semesterId: sem.id,
        title: sem.title,
        termGpa: semGpa > 0 ? semGpa : 1.0,
        cumulativeGwa: cumGwa > 0 ? cumGwa : 1.0,
        units: semUnits,
      };
    });
  }, [semesters]);

  const width = 740;
  const height = 280;
  const padding = { top: 24, right: 36, bottom: 44, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minY = 1.0;
  const maxY = 3.25;

  const getY = (grade: number) => {
    const clamped = Math.max(minY, Math.min(maxY, grade));
    const ratio = (clamped - minY) / (maxY - minY);
    return padding.top + ratio * innerHeight;
  };

  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const ySumma = getY(HONOR_THRESHOLDS.SUMMA.maxGWA);
  const yMagna = getY(HONOR_THRESHOLDS.MAGNA.maxGWA);
  const yCum = getY(HONOR_THRESHOLDS.CUM.maxGWA);

  const termLinePath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.termGpa).toFixed(1)}`)
      .join(' ');
  }, [chartData]);

  const cumulativeLinePath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.cumulativeGwa).toFixed(1)}`)
      .join(' ');
  }, [chartData]);

  if (semesters.length === 0) {
    return (
      <div
        className="sim-panel"
        style={{
          marginTop: '24px',
          marginBottom: '36px',
          padding: '28px 20px',
          textAlign: 'center',
          background: 'var(--card-header-bg, #f1f5f9)',
          borderRadius: '12px',
          border: '1px dashed var(--border-color, #e2e8f0)',
        }}
      >
        <i
          className="fa-solid fa-chart-line text-primary"
          style={{ fontSize: '2.2rem', marginBottom: '10px', opacity: 0.8 }}
        ></i>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-primary, #0f172a)' }}>
          Academic Trend Visualizer
        </h4>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
          Record semesters to unlock real-time term GPA and cumulative Latin Honor trajectory lines.
        </p>
      </div>
    );
  }

  return (
    <div className="sim-panel" style={{ marginTop: '24px', marginBottom: '40px', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>
            <h3 className="panel-title" style={{ fontSize: '1.15rem', margin: 0 }}>
              <i className="fa-solid fa-chart-line text-primary" style={{ marginRight: '8px' }}></i>
              Multi-Semester Academic Trend &amp; Latin Honor Trajectory
            </h3>
            <p className="section-desc" style={{ marginTop: '4px', marginBottom: 0, fontSize: '0.8rem' }}>
              Visualizes semestral GPA versus cumulative GWA against official BU Honor thresholds.
            </p>
          </div>
          {onOpenInfo && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onOpenInfo}
              title="How does Academic Trend Visualizer work?"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-circle-question" style={{ fontSize: '0.9rem' }}></i>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#3b82f6', borderRadius: '2px' }}></span>
            <span style={{ color: 'var(--text-secondary, #475569)' }}>Term GPA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#f59e0b', borderRadius: '2px' }}></span>
            <span style={{ color: 'var(--text-secondary, #475569)' }}>Cumulative GWA</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          background: 'var(--card-header-bg, #f1f5f9)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '8px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* Horizontal grid lines */}
          {[1.0, 1.5, 2.0, 2.5, 3.0].map((val) => {
            const y = getY(val);
            return (
              <g key={`grid-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-color, #334155)"
                  strokeDasharray="2,2"
                  opacity={0.6}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="var(--text-muted, #94a3b8)"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Summa Line (1.20) */}
          <line
            x1={padding.left}
            y1={ySumma}
            x2={width - padding.right}
            y2={ySumma}
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity={0.8}
          />
          <text
            x={width - padding.right - 4}
            y={ySumma - 4}
            textAnchor="end"
            fontSize="8.5"
            fill="#10b981"
            fontWeight="700"
          >
            Summa (≤1.20)
          </text>

          {/* Magna Line (1.45) */}
          <line
            x1={padding.left}
            y1={yMagna}
            x2={width - padding.right}
            y2={yMagna}
            stroke="#3b82f6"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity={0.8}
          />
          <text
            x={width - padding.right - 4}
            y={yMagna - 4}
            textAnchor="end"
            fontSize="8.5"
            fill="#3b82f6"
            fontWeight="700"
          >
            Magna (≤1.45)
          </text>

          {/* Cum Laude Line (1.75) */}
          <line
            x1={padding.left}
            y1={yCum}
            x2={width - padding.right}
            y2={yCum}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4,4"
            opacity={0.8}
          />
          <text
            x={width - padding.right - 4}
            y={yCum - 4}
            textAnchor="end"
            fontSize="8.5"
            fill="#f59e0b"
            fontWeight="700"
          >
            Cum Laude (≤1.75)
          </text>

          {/* Paths */}
          {termLinePath && (
            <path
              d={termLinePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {cumulativeLinePath && (
            <path
              d={cumulativeLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {chartData.map((d, idx) => {
            const x = getX(idx);
            const yTerm = getY(d.termGpa);
            const yCum = getY(d.cumulativeGwa);

            return (
              <g
                key={d.semesterId}
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                {hoveredPoint?.semesterId === d.semesterId && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="var(--bu-azure, #2563eb)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                )}

                <circle cx={x} cy={yTerm} r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <circle cx={x} cy={yCum} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                <text
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-primary, #f8fafc)"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {formatSemesterTick(d.title)}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: '3px' }}>
              {hoveredPoint.title}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>GPA: </span>
                <strong style={{ color: '#3b82f6' }}>{hoveredPoint.termGpa.toFixed(4)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>GWA: </span>
                <strong style={{ color: '#f59e0b' }}>{hoveredPoint.cumulativeGwa.toFixed(4)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Units: </span>
                <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{hoveredPoint.units}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
