import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LottieLoader } from './LottieLoader';
import { getRandomAnimation, type AnimationEntry } from './animations';

interface ComputeModalProps {
  isOpen: boolean;
  onComplete: () => void;
  termTitle?: string;
}

const TOTAL_DURATION_MS = 2500;
const TICK_INTERVAL_MS = 20;

export const ComputeModal: React.FC<ComputeModalProps> = ({
  isOpen,
  onComplete,
  termTitle = 'Semester GPA',
}) => {
  const [animation, setAnimation] = useState<AnimationEntry | null>(null);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const isFinishedRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setAnimation(null);
      isFinishedRef.current = false;
      return;
    }

    // Accessibility: Instant bypass for users with reduced motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    // Pick a non-consecutive animation from the shuffle bag
    const anim = getRandomAnimation('compute');
    setAnimation(anim);
    setProgress(0);
    isFinishedRef.current = false;

    const startTime = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / TOTAL_DURATION_MS) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(handleFinish, 120);
      }
    }, TICK_INTERVAL_MS);

    // Escape listener to skip immediately if in a hurry
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearInterval(timer);
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleFinish]);

  if (!isOpen || !animation) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Computing ${termTitle}`}
      style={{ zIndex: 1100 }}
      onClick={handleFinish}
    >
      <div
        className="modal-content compute-modal-content animate__animated animate__zoomIn animate__faster"
        style={{
          position: 'relative',
          maxWidth: 420,
          textAlign: 'center',
          alignItems: 'center',
          margin: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Corner Pill with ESC Badge (Desktop only) */}
        <button
          type="button"
          onClick={handleFinish}
          aria-label="Skip computation animation"
          className="compute-skip-btn-desktop"
        >
          <span>Skip</span>
          <kbd
            style={{
              fontSize: '0.62rem',
              padding: '1px 5px',
              borderRadius: 4,
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontFamily: 'monospace',
              lineHeight: 1.2,
            }}
          >
            ESC
          </kbd>
        </button>

        <LottieLoader
          key={animation.id}
          data={animation.data}
          src={animation.src}
          className="w-36 h-36"
        />

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: 800,
            marginTop: 10,
            color: 'var(--text-primary)',
          }}
        >
          Computing {termTitle}
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Applying Bicol University 4-decimal weighting engine...
        </p>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            marginTop: 14,
            background: 'var(--card-header-bg)',
            borderRadius: 10,
            height: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(90deg, var(--bu-orange), var(--bu-gold))',
              height: '100%',
              borderRadius: 10,
              transition: 'width 0.04s linear',
              width: `${Math.min(100, Math.round(progress))}%`,
            }}
          />
        </div>

        {/* Footer Status Bar: Centered on desktop, space-between with Skip pill on mobile */}
        <div className="compute-footer-status">
          <span
            style={{
              fontSize: '0.74rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              textAlign: 'left',
            }}
          >
            {Math.min(100, Math.round(progress))}% · {animation.name}
          </span>
          <button
            type="button"
            onClick={handleFinish}
            aria-label="Skip animation"
            className="compute-skip-btn-mobile"
          >
            <span>Skip</span>
            <i className="fa-solid fa-angles-right" style={{ fontSize: '0.62rem' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
};
