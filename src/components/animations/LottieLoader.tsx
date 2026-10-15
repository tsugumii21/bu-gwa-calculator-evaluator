import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';

interface LottieLoaderProps {
  src?: string;
  data?: object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  fallbackIcon?: React.ReactNode;
}

// In-memory cache for fetched animation JSONs (zero latency on repeat calculations)
const lottieJsonCache = new Map<string, object>();

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  src,
  data,
  className = 'w-32 h-32',
  loop = true,
  autoplay = true,
  fallbackIcon,
}) => {
  const [animationData, setAnimationData] = useState<object | null>(() => {
    if (data) return data;
    if (src && lottieJsonCache.has(src)) return lottieJsonCache.get(src)!;
    return null;
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (data) {
      setAnimationData(data);
      return;
    }

    if (!src) return;

    if (lottieJsonCache.has(src)) {
      setAnimationData(lottieJsonCache.get(src)!);
      return;
    }

    let isMounted = true;
    setHasError(false);

    if (src.startsWith('http') || src.includes('.json')) {
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((fetched) => {
          lottieJsonCache.set(src, fetched);
          if (isMounted) setAnimationData(fetched);
        })
        .catch(() => {
          if (isMounted) setHasError(true);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [src, data]);

  const activeData = data || animationData;

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
      <Lottie animationData={activeData} loop={loop} autoplay={autoplay} />
    </div>
  );
};
