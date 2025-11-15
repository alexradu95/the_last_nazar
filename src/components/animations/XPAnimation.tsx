/**
 * XP Animation Component
 *
 * Displays a floating XP gain animation
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

interface XPAnimationProps {
  amount: number;
  onComplete?: () => void;
  position?: { x: number; y: number };
}

export function XPAnimation({ amount, onComplete, position }: XPAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (shouldReduceMotion()) {
        // Skip animation, just call onComplete
        setTimeout(() => onComplete?.(), 100);
        return;
      }

      anime({
        targets: ref.current,
        translateY: [-50, -100],
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1.2, 1],
        duration: 2000,
        easing: 'easeOutCubic',
        complete: onComplete,
      });
    }
  }, [onComplete]);

  const style: React.CSSProperties = {
    opacity: 0,
    ...(position && {
      left: `${position.x}px`,
      top: `${position.y}px`,
    }),
  };

  return (
    <div
      ref={ref}
      className={`pointer-events-none ${position ? 'absolute' : 'fixed left-1/2 top-1/2 -translate-x-1/2'} z-50 text-4xl font-bold text-yellow-500 drop-shadow-lg`}
      style={style}
    >
      +{amount} XP
    </div>
  );
}

/**
 * Mini XP Animation (for smaller gains)
 */
export function MiniXPAnimation({ amount, onComplete }: { amount: number; onComplete?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !shouldReduceMotion()) {
      anime({
        targets: ref.current,
        translateY: [-20, -50],
        opacity: [0, 1, 0],
        scale: [0.5, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        complete: onComplete,
      });
    } else {
      setTimeout(() => onComplete?.(), 100);
    }
  }, [onComplete]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 text-xl font-semibold text-yellow-400"
      style={{ opacity: 0 }}
    >
      +{amount}
    </div>
  );
}
