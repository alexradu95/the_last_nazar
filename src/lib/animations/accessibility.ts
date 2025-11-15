/**
 * Animation Accessibility Helpers
 *
 * Ensures animations respect user preferences for reduced motion
 */

import { anime } from './config';

/**
 * Check if user prefers reduced motion
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wrapper for anime() that respects reduced motion preferences
 * If reduced motion is preferred, animations complete instantly
 */
export function accessibleAnime(config: Record<string, any>) {
  if (shouldReduceMotion()) {
    return anime({
      ...config,
      duration: 0,
      delay: 0,
    });
  }
  return anime(config);
}

/**
 * Create an animation that can be disabled based on user preference
 */
export function createAccessibleAnimation(
  config: Record<string, any>,
  fallback?: () => void
) {
  if (shouldReduceMotion()) {
    if (fallback) {
      fallback();
    }
    return anime({
      ...config,
      duration: 0,
      delay: 0,
    });
  }
  return anime(config);
}

/**
 * Hook to listen for changes in motion preference
 */
export function onMotionPreferenceChange(callback: (prefersReduced: boolean) => void) {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handler);

  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}

/**
 * Performance optimization: Use will-change for better animation performance
 */
export function optimizedAnimation(element: HTMLElement, properties: string[]) {
  element.style.willChange = properties.join(', ');

  return () => {
    element.style.willChange = 'auto';
  };
}

/**
 * Throttle function for scroll-based animations
 */
export function throttleScrollAnimation(callback: (...args: any[]) => void, delay: number) {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback.apply(this, args);
    }
  };
}

/**
 * Debounce function for resize-based animations
 */
export function debounceAnimation(callback: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, args), delay);
  };
}
