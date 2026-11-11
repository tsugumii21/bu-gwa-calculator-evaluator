import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';

interface LottieLoaderProps {
  src?: string;
  data?: object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  fallbackIcon?: React.ReactNode;
  onReady?: () => void;
  onError?: () => void;
}

// In-memory cache for fetched animation JSONs (zero latency on repeat calculations)
const lottieJsonCache = new Map<string, object>();
const ANIMATION_LOAD_TIMEOUT_MS = 4_000;

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  src,
  data,
  className = 'w-32 h-32',
  loop = true,
  autoplay = true,
  fallbackIcon,
  onReady,
  onError,
}) => {
  const callbacks = useRef({ onReady, onError });
  callbacks.current = { onReady, onError };
  const [loaded, setLoaded] = useState<{ source?: string; data?: object; hasError?: boolean }>({ source: src });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoaded({ source: src });
    if (data || !src || lottieJsonCache.has(src)) return;
    const deadline = setTimeout(() => controller.abort(), ANIMATION_LOAD_TIMEOUT_MS);
    fetch(src, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((fetched) => {
          if (!fetched || typeof fetched !== 'object' || !Array.isArray(fetched.layers)) throw new Error('Invalid animation data');
          if (!isMounted) return;
          lottieJsonCache.set(src, fetched);
          setLoaded({ source: src, data: fetched });
        })
        .catch(() => {
          if (!isMounted) return;
          setLoaded({ source: src, hasError: true });
          callbacks.current.onError?.();
        })
        .finally(() => clearTimeout(deadline));
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(deadline);
    };
  }, [src, data]);

  // A changed source must never display the previous source's cached state.
  const activeData = data || (loaded.source === src ? loaded.data : undefined) || (src ? lottieJsonCache.get(src) : undefined);
  const hasError = loaded.source === src && loaded.hasError;

  if (hasError || !activeData) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {fallbackIcon || (
          <div className="relative flex items-center justify-center">
            <div className="absolute h-12 w-12 rounded-full border-2 border-amber-500/20 animate-ping" />
            <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Lottie animationData={activeData} loop={loop} autoplay={autoplay}
        onDOMLoaded={() => callbacks.current.onReady?.()}
        onDataFailed={() => {
          setLoaded({ source: src, hasError: true });
          callbacks.current.onError?.();
        }} />
    </div>
  );
};
