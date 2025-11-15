/**
 * Progress Bar Component
 *
 * Animated progress bar with smooth transitions
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: string;
  animated?: boolean;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = 'bg-blue-600',
  height = 'h-2',
  animated = true,
  showLabel = false,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prevProgress = useRef(0);

  useEffect(() => {
    if (ref.current && animated && !shouldReduceMotion()) {
      anime({
        targets: ref.current,
        width: `${progress}%`,
        duration: 800,
        easing: 'easeOutCubic',
      });
    } else if (ref.current) {
      ref.current.style.width = `${progress}%`;
    }
    prevProgress.current = progress;
  }, [progress, animated]);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${height}`}>
        <div
          ref={ref}
          className={`${color} ${height} rounded-full transition-all`}
          style={{ width: animated ? `${prevProgress.current}%` : `${progress}%` }}
        />
      </div>
    </div>
  );
}
