import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';
import { getCachedLottieAsset, loadLottieAsset } from './lottie-assets';

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
    if (data || !src || getCachedLottieAsset(src)) return;
    setLoaded({ source: src });
    void loadLottieAsset(src).then(result => {
      if (!isMounted) return;
      if (result.ok) setLoaded({ source: src, data: result.data });
      else {
        setLoaded({ source: src, hasError: true });
        callbacks.current.onError?.();
      }
    });
    // Other consumers may share this request, so only detach this subscriber.
    return () => { isMounted = false; };
  }, [src, data]);

  // A changed source must never display the previous source's cached state.
  const activeData = data || (loaded.source === src ? loaded.data : undefined) || (src ? getCachedLottieAsset(src) : undefined);
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
