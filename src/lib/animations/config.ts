/**
 * Animation Configuration
 *
 * Centralized configuration for all animations using Anime.js
 */

// @ts-ignore - animejs types are incomplete
import { animate } from 'animejs';

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

// Export as 'anime' for compatibility with existing code
export { animate as anime };
