/**
 * Animated Component
 *
 * Wrapper component that applies entrance animations to its children
 */

'use client';

import { useEffect, useRef } from 'react';
import { fadeIn, slideInUp, scaleIn } from '@/lib/animations/core';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

export type AnimationType = 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideDown' | 'slideLeft' | 'slideRight';

interface AnimatedComponentProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

export function AnimatedComponent({
  children,
  animation = 'fadeIn',
  delay = 0,
  className = '',
}: AnimatedComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !shouldReduceMotion()) {
      const animationMap = {
        fadeIn: () => fadeIn(ref.current!, { delay }),
        slideUp: () => slideInUp(ref.current!, { delay }),
        scaleIn: () => scaleIn(ref.current!, { delay }),
        slideDown: () => slideInUp(ref.current!, { delay }),
        slideLeft: () => slideInUp(ref.current!, { delay }),
        slideRight: () => slideInUp(ref.current!, { delay }),
      };

      animationMap[animation]();
    } else if (ref.current && shouldReduceMotion()) {
      // Skip animation if reduced motion is preferred
      ref.current.style.opacity = '1';
    }
  }, [animation, delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: shouldReduceMotion() ? 1 : 0 }}>
      {children}
    </div>
  );
}
