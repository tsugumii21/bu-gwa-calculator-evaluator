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

export const AcademicTrendChart: React.FC = () => {
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
          background: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          border: '1px dashed var(--color-border)',
        }}
      >
        <i
          className="fa-solid fa-chart-line text-primary"
          style={{ fontSize: '2.2rem', marginBottom: '10px', opacity: 0.8 }}
        ></i>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>Academic Trend Visualizer</h4>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
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
        <div>
          <h3 className="panel-title" style={{ fontSize: '1.15rem', margin: 0 }}>
            <i className="fa-solid fa-chart-line text-primary" style={{ marginRight: '8px' }}></i>
            Multi-Semester Academic Trend &amp; Latin Honor Trajectory
          </h3>
          <p className="section-desc" style={{ marginTop: '4px', marginBottom: 0, fontSize: '0.8rem' }}>
            Visualizes semestral GPA versus cumulative GWA against official BU Honor thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#3b82f6', borderRadius: '2px' }}></span>
            <span>Term GPA</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#f59e0b', borderRadius: '2px' }}></span>
            <span>Cumulative GWA</span>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          background: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          padding: '6px',
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '440px', display: 'block' }}
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
                  stroke="var(--color-border)"
                  strokeDasharray="2,2"
                  opacity={0.5}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="var(--color-text-muted)"
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
            opacity={0.7}
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
            opacity={0.7}
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
            opacity={0.7}
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
                    stroke="var(--color-primary)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                )}

                <circle cx={x} cy={yTerm} r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <circle cx={x} cy={yCum} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--color-text)"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {d.title.length > 13 ? `${d.title.slice(0, 11)}…` : d.title}
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
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              pointerEvents: 'none',
              zIndex: 10,
              fontSize: '0.8rem',
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '3px' }}>
              {hoveredPoint.title}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>GPA: </span>
                <strong style={{ color: '#3b82f6' }}>{hoveredPoint.termGpa.toFixed(4)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>GWA: </span>
                <strong style={{ color: '#f59e0b' }}>{hoveredPoint.cumulativeGwa.toFixed(4)}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>Units: </span>
                <strong>{hoveredPoint.units}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
