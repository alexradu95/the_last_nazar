/**
 * Animation Configuration
 *
 * Centralized configuration for all animations using Anime.js
 */

export const ANIMATION_CONFIG = {
  duration: {
    instant: 150,
    fast: 300,
    normal: 500,
    slow: 800,
    verySlow: 1200,
  },
  easing: {
    default: 'easeOutQuad',
    spring: 'spring(1, 80, 10, 0)',
    elastic: 'easeOutElastic(1, .6)',
    bounce: 'easeOutBounce',
  },
  stagger: {
    small: 50,
    medium: 100,
    large: 200,
  },
} as const;

export const defaultAnimation = {
  duration: ANIMATION_CONFIG.duration.normal,
  easing: ANIMATION_CONFIG.easing.default,
};

// Lazy-load anime only on client side to avoid SSR issues
let animeInstance: any = null;

const getAnime = () => {
  if (typeof window === 'undefined') {
    console.warn('[Anime] Attempted to use animations on server - skipping');
    // Return a mock object with common anime methods
    return {
      timeline: () => ({
        add: () => ({ add: () => ({}) }),
      }),
      remove: () => {},
      finished: Promise.resolve(),
    };
  }

  if (!animeInstance) {
    // Dynamically import anime only when first needed (v3 uses default export)
    // @ts-ignore - animejs types are incomplete
    animeInstance = require('animejs').default || require('animejs');
  }

  return animeInstance;
};

// Export a proxy that lazy-loads anime and supports both function calls and method access
export const anime = new Proxy(
  (() => {}) as any,
  {
    apply(_target, _thisArg, args) {
      const animeLib = getAnime();
      return animeLib(...args);
    },
    get(_target, prop) {
      const animeLib = getAnime();
      return animeLib[prop];
    },
  }
);
