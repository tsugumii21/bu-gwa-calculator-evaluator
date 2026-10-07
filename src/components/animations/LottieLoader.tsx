import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { Loader2 } from 'lucide-react';

interface LottieLoaderProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  fallbackIcon?: React.ReactNode;
}

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  src,
  className = 'w-32 h-32',
  loop = true,
  autoplay = true,
  fallbackIcon,
}) => {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    // If src is already a direct JSON object or local path
    if (src.startsWith('http') || src.endsWith('.json')) {
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (isMounted) setAnimationData(data);
        })
        .catch(() => {
          if (isMounted) setHasError(true);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (hasError || !animationData) {
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
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
};
