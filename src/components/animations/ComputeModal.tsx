import React, { useEffect, useState } from 'react';
import { LottieLoader } from './LottieLoader';
import { getRandomAnimation, type AnimationEntry } from './animations';

interface ComputeModalProps {
  isOpen: boolean;
  onComplete: () => void;
  termTitle?: string;
}

export const ComputeModal: React.FC<ComputeModalProps> = ({
  isOpen,
  onComplete,
  termTitle = 'Semester GPA',
}) => {
  const [animation, setAnimation] = useState<AnimationEntry | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Pick random non-repeating animation on every open!
    const anim = getRandomAnimation('compute');
    setAnimation(anim);
    setProgress(0);

    const DURATION = 2700; // Exact 2.7 seconds requested
    const INTERVAL = 30;
    const increment = 100 / (DURATION / INTERVAL);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 150);
          return 100;
        }
        return next;
      });
    }, INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen, onComplete]);

  if (!isOpen || !animation) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" style={{ zIndex: 1100 }}>
      <div
        className="modal-content compute-modal-content animate__animated animate__zoomIn animate__faster"
        style={{
          maxWidth: 420,
          textAlign: 'center',
          alignItems: 'center',
          margin: 'auto',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <LottieLoader src={animation.src} className="w-40 h-40" />

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            marginTop: 12,
            color: 'var(--text-primary)',
          }}
        >
          Computing {termTitle}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
          Applying Bicol University 4-decimal weighting engine...
        </p>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            marginTop: 16,
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
              transition: 'width 0.05s linear',
              width: `${Math.min(100, Math.round(progress))}%`,
            }}
          />
        </div>

        <span style={{ marginTop: 8, fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
          {Math.min(100, Math.round(progress))}% · {animation.name}
        </span>
      </div>
    </div>
  );
};
