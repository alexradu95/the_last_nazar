/**
 * Skeleton Component
 *
 * Loading skeleton with pulsing animation
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ width = '100%', height = '20px', className = '', variant = 'rectangular' }: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !shouldReduceMotion()) {
      anime({
        targets: ref.current,
        opacity: [0.5, 1, 0.5],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine',
      });
    }
  }, []);

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div
      ref={ref}
      className={`bg-gray-300 dark:bg-gray-700 ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

/**
 * Card Skeleton
 */
export function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <Skeleton height="200px" />
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="16px" width="70%" />
    </div>
  );
}

/**
 * List Skeleton
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width="48px" height="48px" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton height="16px" width="40%" />
            <Skeleton height="12px" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}
