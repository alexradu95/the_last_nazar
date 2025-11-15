/**
 * Page Transition Component
 *
 * Smooth transitions between page navigations
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
}

export function PageTransition({ children, type = 'fade' }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current && !shouldReduceMotion()) {
      // Exit animation
      anime({
        targets: ref.current,
        opacity: 0,
        translateY: type === 'slide' ? -20 : 0,
        scale: type === 'scale' ? 0.95 : 1,
        duration: 200,
        easing: 'easeInCubic',
        complete: () => {
          // Enter animation
          if (ref.current) {
            anime({
              targets: ref.current,
              opacity: [0, 1],
              translateY: type === 'slide' ? [20, 0] : 0,
              scale: type === 'scale' ? [1.05, 1] : 1,
              duration: 400,
              easing: 'easeOutCubic',
            });
          }
        },
      });
    }
  }, [pathname, type]);

  return <div ref={ref}>{children}</div>;
}

/**
 * Route transition wrapper for entire app
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  return <PageTransition type="fade">{children}</PageTransition>;
}
