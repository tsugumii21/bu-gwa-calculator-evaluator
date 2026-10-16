import React, { useState, useMemo, useEffect } from 'react';
import { useSemesterStore } from '../../store';
import { calculateSemesterGWA, calculateSemesterUnits } from '../../core/gwa-engine';
import { HONOR_THRESHOLDS, TERM_HONOR_THRESHOLDS } from '../../core/constants';

export type ChartMode = 'term' | 'cumulative';

interface DataPoint {
  index: number;
  semesterId: string;
  title: string;
  termGpa: number;
  cumulativeGwa: number;
  units: number;
  totalUnitsToDate: number;
}

export interface AcademicTrendChartProps {
  onOpenInfo?: () => void;
}

function formatSemesterTick(title: string): string {
  const t = title.trim();

  // Pattern: "AY 2025-2026 1st Semester" or "AY 2025-2026 - 1st Semester"
  const ayMatch = t.match(/(?:AY|A\.Y\.|School\s*Year:?\s*AY?)\s*(\d{2,4})[-–](\d{2,4})\s*(?:-\s*)?(\d(?:st|nd|rd|th)?|Midyear|Summer)?\s*(?:Sem(?:ester)?)?/i);
  if (ayMatch) {
    const y1 = ayMatch[1].slice(-2);
    const y2 = ayMatch[2].slice(-2);
    let term = '1';
    if (ayMatch[3]) {
      if (/midyear|summer/i.test(ayMatch[3])) term = 'Mid';
      else term = ayMatch[3].replace(/(st|nd|rd|th)/i, '');
    }
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

/**
 * Extracts a deterministic chronological sort key so multi-semester trajectories
 * always flow from the earliest academic term on the left to the latest on the right.
 */
function getSemesterSortKey(title: string, originalIndex: number, minAyYear: number | null): number {
  const t = title.trim();

  // 1. AY pattern: e.g. "AY 2024-2025 1st Semester"
  const ayMatch = t.match(/(?:AY|A\.Y\.|School\s*Year:?\s*AY?)\s*(\d{2,4})[-–](\d{2,4})?/i);
  if (ayMatch) {
    let startYear = parseInt(ayMatch[1], 10);
    if (startYear < 100) startYear += 2000;
    let term = 1;
    if (/midyear|summer/i.test(t)) {
      term = 3;
    } else if (/\b2nd\b|\bsecond\b|\bsem\s*2\b|\bs2\b/i.test(t)) {
      term = 2;
    } else if (/\b1st\b|\bfirst\b|\bsem\s*1\b|\bs1\b/i.test(t)) {
      term = 1;
    }
    return startYear * 10 + term;
  }

  // 2. Year pattern: e.g. "Year 1 - 1st Semester" or "1st Year - 2nd Semester"
  const yrMatch = t.match(/(?:Year\s*(\d)|(\d)(?:st|nd|rd|th)?\s*Year)/i);
  if (yrMatch) {
    const yr = parseInt(yrMatch[1] || yrMatch[2], 10);
    let term = 1;
    if (/midyear|summer/i.test(t)) {
      term = 3;
    } else if (/\b2nd\b|\bsecond\b|\bsem\s*2\b|\bs2\b/i.test(t)) {
      term = 2;
    } else if (/\b1st\b|\bfirst\b|\bsem\s*1\b|\bs1\b/i.test(t)) {
      term = 1;
    }

    if (minAyYear !== null) {
      const effectiveYear = minAyYear - 1 + (yr - 1);
      return effectiveYear * 10 + term;
    }
    return yr * 10 + term;
  }

  // 3. Fallback: preserve original index
  return originalIndex * 10;
}

export const AcademicTrendChart: React.FC<AcademicTrendChartProps> = ({ onOpenInfo }) => {
  const semesters = useSemesterStore((s) => s.semesters);
  const [chartMode, setChartMode] = useState<ChartMode>('term');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine minimum AY year across all semesters to normalize mixed AY/Year entries
  const minAyYear = useMemo(() => {
    let min: number | null = null;
    for (const sem of semesters) {
      const match = sem.title.match(/(?:AY|A\.Y\.|School\s*Year:?\s*AY?)\s*(\d{2,4})[-–](\d{2,4})?/i);
      if (match) {
        let yr = parseInt(match[1], 10);
        if (yr < 100) yr += 2000;
        if (min === null || yr < min) min = yr;
      }
    }
    return min;
  }, [semesters]);

  // Chronologically sort semesters from oldest term (left) to newest term (right)
  const sortedSemesters = useMemo(() => {
    if (semesters.length <= 1) return semesters;
    return [...semesters].sort((a, b) => {
      const idxA = semesters.indexOf(a);
      const idxB = semesters.indexOf(b);
      const keyA = getSemesterSortKey(a.title, idxA, minAyYear);
      const keyB = getSemesterSortKey(b.title, idxB, minAyYear);
      if (keyA !== keyB) return keyA - keyB;
      return idxA - idxB;
    });
  }, [semesters, minAyYear]);

  const chartData: DataPoint[] = useMemo(() => {
    if (sortedSemesters.length === 0) return [];

    let runningPoints = 0;
    let runningUnits = 0;

    return sortedSemesters.map((sem, idx) => {
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
        totalUnitsToDate: runningUnits,
      };
    });
  }, [sortedSemesters]);

  const width = isMobile ? 380 : 740;
  const height = isMobile ? 240 : 280;
  const padding = isMobile
    ? { top: 22, right: 32, bottom: 40, left: 42 }
    : { top: 24, right: 36, bottom: 44, left: 48 };
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

  const yPresident = getY(TERM_HONOR_THRESHOLDS.PRESIDENT.maxGPA);
  const yDean = getY(TERM_HONOR_THRESHOLDS.DEAN.maxGPA);
  const ySumma = getY(HONOR_THRESHOLDS.SUMMA.maxGWA);
  const yMagna = getY(HONOR_THRESHOLDS.MAGNA.maxGWA);
  const yCum = getY(HONOR_THRESHOLDS.CUM.maxGWA);

  const termLinePath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.termGpa).toFixed(1)}`)
      .join(' ');
  }, [chartData, isMobile]);

  const cumulativeLinePath = useMemo(() => {
    if (chartData.length < 2) return '';
    return chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.cumulativeGwa).toFixed(1)}`)
      .join(' ');
  }, [chartData, isMobile]);

  if (semesters.length === 0) {
    return (
      <div className="sim-empty-card" style={{ marginTop: '24px', marginBottom: '36px' }}>
        <div className="sim-empty-icon-wrap">
          <i className="fa-solid fa-chart-line text-primary"></i>
        </div>
        <div className="sim-empty-content">
          <h4 className="sim-empty-title">
            Academic Trend Visualizer
          </h4>
          <p className="sim-empty-desc">
            Record semesters to unlock real-time term GPA volatility and 4-year cumulative Latin Honor trajectory lines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-panel" style={{ marginTop: '24px', marginBottom: '40px', padding: '20px' }}>
      <div
        className="section-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <h3 className="panel-title" style={{ fontSize: '1.15rem', margin: 0 }}>
            <i className={`fa-solid ${chartMode === 'term' ? 'fa-award' : 'fa-graduation-cap'} text-primary`} style={{ marginRight: '8px' }}></i>
            {chartMode === 'term'
              ? 'Multi-Semester Academic Trend (Term GPA)'
              : 'Graduation Trajectory (Cumulative GWA)'}
          </h3>
          <p className="section-desc" style={{ marginTop: '4px', marginBottom: '10px', fontSize: '0.82rem' }}>
            {chartMode === 'term'
              ? 'Visualizes single-term GPA progression against official BU Semestral Honor cutoffs (BOR Res. 89 s. 2006).'
              : 'Tracks cumulative GWA progression across all completed terms against official BU Latin Honor thresholds.'}
          </p>

          {/* Mode Switcher Segmented Control */}
          <div className="chart-mode-toggle" role="tablist" aria-label="Academic trend mode">
            <button
              type="button"
              role="tab"
              aria-selected={chartMode === 'term'}
              className={`chart-mode-btn ${chartMode === 'term' ? 'active' : ''}`}
              onClick={() => setChartMode('term')}
            >
              <i className="fa-solid fa-award"></i>
              <span>Semestral Honors (Term GPA)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={chartMode === 'cumulative'}
              className={`chart-mode-btn ${chartMode === 'cumulative' ? 'active' : ''}`}
              onClick={() => setChartMode('cumulative')}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>Graduation Trajectory (Cumulative GWA)</span>
            </button>
          </div>

          {/* Mode-Specific Legend */}
          {chartMode === 'term' ? (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '3px', background: '#2563eb', borderRadius: '2px' }}></span>
                <span style={{ color: 'var(--text-secondary, #475569)' }}>Term GPA Curve</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #8b5cf6' }}></span>
                <span style={{ color: '#8b5cf6' }}>President&apos;s Lister (&le; 1.45)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #0284c7' }}></span>
                <span style={{ color: '#0284c7' }}>Dean&apos;s Lister (&le; 1.75)</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '3px', background: '#f59e0b', borderRadius: '2px' }}></span>
                <span style={{ color: 'var(--text-secondary, #475569)' }}>Cumulative GWA Curve</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #10b981' }}></span>
                <span style={{ color: '#10b981' }}>Summa (&le; 1.25)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #2563eb' }}></span>
                <span style={{ color: '#2563eb' }}>Magna (&le; 1.45)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '2px', borderTop: '2px dashed #d97706' }}></span>
                <span style={{ color: '#d97706' }}>Cum Laude (&le; 1.75)</span>
              </div>
            </div>
          )}
        </div>

        {onOpenInfo && (
          <button
            type="button"
            className="sim-help-btn"
            onClick={onOpenInfo}
            title="How does Academic Trend Visualizer work?"
            aria-label="Academic Trend Reference Guide"
          >
            <i className="fa-solid fa-question"></i>
          </button>
        )}
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
                  y={y + 4}
                  textAnchor="end"
                  fontSize={isMobile ? "11.5" : "9.5"}
                  fill="var(--text-muted, #94a3b8)"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Benchmarks for Term Honors Mode */}
          {chartMode === 'term' && (
            <>
              {/* President's Lister (≤ 1.45) */}
              <line
                x1={padding.left}
                y1={yPresident}
                x2={width - padding.right}
                y2={yPresident}
                stroke="#8b5cf6"
                strokeWidth={isMobile ? "1.4" : "1.2"}
                strokeDasharray="4,4"
                opacity={0.85}
              />
              <text
                x={width - padding.right - 4}
                y={yPresident - 4}
                textAnchor="end"
                fontSize={isMobile ? "10" : "8.5"}
                fill="#8b5cf6"
                fontWeight="700"
              >
                {isMobile ? "President ≤1.45" : "President's Lister (≤1.45)"}
              </text>

              {/* Dean's Lister (≤ 1.75) */}
              <line
                x1={padding.left}
                y1={yDean}
                x2={width - padding.right}
                y2={yDean}
                stroke="#0284c7"
                strokeWidth={isMobile ? "1.4" : "1.2"}
                strokeDasharray="4,4"
                opacity={0.85}
              />
              <text
                x={width - padding.right - 4}
                y={yDean - 4}
                textAnchor="end"
                fontSize={isMobile ? "10" : "8.5"}
                fill="#0284c7"
                fontWeight="700"
              >
                {isMobile ? "Dean ≤1.75" : "Dean's Lister (≤1.75)"}
              </text>
            </>
          )}

          {/* Benchmarks for Graduation Cumulative Trajectory Mode */}
          {chartMode === 'cumulative' && (
            <>
              {/* Summa Cum Laude (≤ 1.25) */}
              <line
                x1={padding.left}
                y1={ySumma}
                x2={width - padding.right}
                y2={ySumma}
                stroke="#10b981"
                strokeWidth={isMobile ? "1.4" : "1.2"}
                strokeDasharray="4,4"
                opacity={0.85}
              />
              <text
                x={width - padding.right - 4}
                y={ySumma - 4}
                textAnchor="end"
                fontSize={isMobile ? "10" : "8.5"}
                fill="#10b981"
                fontWeight="700"
              >
                {isMobile ? "Summa ≤1.25" : "Summa (≤1.25)"}
              </text>

              {/* Magna Cum Laude (≤ 1.45) */}
              <line
                x1={padding.left}
                y1={yMagna}
                x2={width - padding.right}
                y2={yMagna}
                stroke="#2563eb"
                strokeWidth={isMobile ? "1.4" : "1.2"}
                strokeDasharray="4,4"
                opacity={0.85}
              />
              <text
                x={width - padding.right - 4}
                y={yMagna - 4}
                textAnchor="end"
                fontSize={isMobile ? "10" : "8.5"}
                fill="#2563eb"
                fontWeight="700"
              >
                {isMobile ? "Magna ≤1.45" : "Magna (≤1.45)"}
              </text>

              {/* Cum Laude (≤ 1.75) */}
              <line
                x1={padding.left}
                y1={yCum}
                x2={width - padding.right}
                y2={yCum}
                stroke="#d97706"
                strokeWidth={isMobile ? "1.4" : "1.2"}
                strokeDasharray="4,4"
                opacity={0.85}
              />
              <text
                x={width - padding.right - 4}
                y={yCum - 4}
                textAnchor="end"
                fontSize={isMobile ? "10" : "8.5"}
                fill="#d97706"
                fontWeight="700"
              >
                {isMobile ? "Cum Laude ≤1.75" : "Cum Laude (≤1.75)"}
              </text>
            </>
          )}

          {/* Active Mode Curve Path */}
          {chartMode === 'term' && termLinePath && (
            <path
              d={termLinePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth={isMobile ? "3" : "2.5"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chartMode === 'cumulative' && cumulativeLinePath && (
            <path
              d={cumulativeLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={isMobile ? "3" : "2.5"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {chartData.map((d, idx) => {
            const x = getX(idx);
            const activeY = chartMode === 'term' ? getY(d.termGpa) : getY(d.cumulativeGwa);
            const activeColor = chartMode === 'term' ? '#2563eb' : '#f59e0b';

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
                    stroke={activeColor}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity={0.6}
                  />
                )}

                <circle
                  cx={x}
                  cy={activeY}
                  r={isMobile ? "5.5" : "4.5"}
                  fill={activeColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y={height - padding.bottom + (isMobile ? 16 : 18)}
                  textAnchor="middle"
                  fontSize={isMobile ? "11.5" : "10"}
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
            {chartMode === 'term' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Term GPA: </span>
                    <strong style={{ color: '#2563eb' }}>{hoveredPoint.termGpa.toFixed(4)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Units: </span>
                    <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{hoveredPoint.units}</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {hoveredPoint.termGpa <= 1.45 ? (
                    <span style={{ color: '#8b5cf6' }}>🏅 President&apos;s Lister Candidate</span>
                  ) : hoveredPoint.termGpa <= 1.75 ? (
                    <span style={{ color: '#0284c7' }}>🎖️ Dean&apos;s Lister Candidate</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary, #475569)' }}>📘 Regular Academic Standing</span>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Cumulative GWA: </span>
                    <strong style={{ color: '#f59e0b' }}>{hoveredPoint.cumulativeGwa.toFixed(4)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Total Units: </span>
                    <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{hoveredPoint.totalUnitsToDate}</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                  {hoveredPoint.cumulativeGwa <= 1.25 ? (
                    <span style={{ color: '#10b981' }}>🎓 Summa Cum Laude Track</span>
                  ) : hoveredPoint.cumulativeGwa <= 1.45 ? (
                    <span style={{ color: '#2563eb' }}>🎓 Magna Cum Laude Track</span>
                  ) : hoveredPoint.cumulativeGwa <= 1.75 ? (
                    <span style={{ color: '#d97706' }}>🎓 Cum Laude Track</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary, #475569)' }}>🎓 Regular Graduate Track</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
