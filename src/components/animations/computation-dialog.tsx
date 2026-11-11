import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { getRandomAnimation, type AnimationEntry } from './animations';
import { LottieLoader } from './LottieLoader';

const PRESENTATION_DURATION_MS = 2_700;
const ARTWORK_READY_TIMEOUT_MS = 4_000;

/** Presents one local study scene; the reveal track and result handoff share one clock. */
export function ComputationDialog({ scope, onFinish, minimumDurationMs = PRESENTATION_DURATION_MS }: { scope: string; onFinish: () => void; minimumDurationMs?: number }) {
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const chosen = useRef<AnimationEntry | null>(null);
  const hasFinished = useRef(false);
  const isMounted = useRef(true);
  const fillRef = useRef<HTMLDivElement>(null);
  const [animation, setAnimation] = useState<AnimationEntry | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasArtworkError, setHasArtworkError] = useState(false);
  const duration = Number.isFinite(minimumDurationMs) ? Math.max(0, minimumDurationMs) : PRESENTATION_DURATION_MS;
  const finish = useCallback(() => {
    if (!isMounted.current || hasFinished.current) return;
    hasFinished.current = true;
    finishRef.current();
  }, []);
  const ref = useAccessibleDialog(true, finish);
  const ready = useCallback(() => { if (isMounted.current && !hasFinished.current) setIsReady(true); }, []);
  const failArtwork = useCallback(() => {
    if (!isMounted.current || hasFinished.current) return;
    setHasArtworkError(true);
    setIsReady(true);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    let frame = 0;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame = requestAnimationFrame(finish);
    } else {
      // The ref survives StrictMode's effect replay, so the shuffle bag advances only once.
      chosen.current ??= getRandomAnimation('compute');
      setAnimation(chosen.current);
    }
    return () => { isMounted.current = false; cancelAnimationFrame(frame); };
  }, [finish]);

  useEffect(() => {
    if (!animation || isReady) return;
    const deadline = setTimeout(failArtwork, ARTWORK_READY_TIMEOUT_MS);
    return () => clearTimeout(deadline);
  }, [animation, isReady, failArtwork]);

  useEffect(() => {
    if (!isReady) return;
    let isActive = true;
    let reveal: Animation | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (hasFinished.current) return;
    if (!duration) { finish(); return; }
    if (fillRef.current?.animate) {
      reveal = fillRef.current.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration, easing: 'linear', fill: 'forwards' });
      void reveal.finished.then(() => { if (isActive) finish(); }, () => { if (isActive) finish(); });
    } else {
      // Older engines still finish on time; the result never depends on animation support.
      fallbackTimer = setTimeout(finish, duration);
    }
    return () => { isActive = false; reveal?.cancel(); clearTimeout(fallbackTimer); };
  }, [isReady, duration, finish]);

  return <div className="modal-overlay v2-computing-overlay" role="dialog" aria-modal="true" aria-labelledby="computing-title" ref={ref}>
    <div className={`modal-content v2-computing-dialog${isReady ? ' is-presenting' : ''}`} style={{ '--compute-duration': `${duration}ms` } as CSSProperties}>
      <button type="button" className="compute-skip" onClick={finish}>Skip animation <kbd>Esc</kbd></button>
      <div className="compute-animation" aria-hidden="true" data-animation-id={animation?.id}>
        {hasArtworkError ? <span className="compute-fallback">Your next step starts here.</span> : animation
          ? <LottieLoader key={animation.id} src={animation.src} data={animation.data} className="legacy-compute-lottie" onReady={ready} onError={failArtwork} />
          : <span className="compute-static">Getting your result ready</span>}
      </div>
      <h2 id="computing-title">Preparing your result</h2>
      <p className="compute-scope">{scope}</p>
      <p className="compute-status" role="status">A moment for your next milestone.</p>
      <div className="compute-reveal-track" aria-hidden="true"><div className="compute-reveal-fill" ref={fillRef} /></div>
    </div>
  </div>;
}
