/**
 * Loading Spinner Component
 *
 * Animated loading spinner with continuous rotation
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LoadingSpinner({ size = 40, color = '#3b82f6', className = '' }: LoadingSpinnerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !shouldReduceMotion()) {
      anime({
        targets: ref.current,
        rotate: 360,
        duration: 1000,
        loop: true,
        easing: 'linear',
      });
    }
  }, []);

  return (
    <div ref={ref} className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 50 50" className="h-full w-full">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="80, 200"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Full-page loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <LoadingSpinner size={48} />
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
    </div>
  );
}
