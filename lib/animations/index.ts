/**
 * Animation Library
 *
 * Re-export all animation utilities for easy importing
 */

// Configuration
export { anime, ANIMATION_CONFIG, defaultAnimation } from './config';

// Core animations
export {
  fadeIn,
  fadeOut,
  slideInUp,
  slideInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  scaleOut,
  pulse,
  rotate,
  spin,
  shake,
  bounce,
  staggerFadeIn,
  staggerSlideIn,
  staggerScaleIn,
  heartbeat,
  wiggle,
  flash,
} from './core';

// Accessibility helpers
export {
  shouldReduceMotion,
  accessibleAnime,
  createAccessibleAnimation,
  onMotionPreferenceChange,
  optimizedAnimation,
  throttleScrollAnimation,
  debounceAnimation,
} from './accessibility';

// Micro-interactions
export {
  hoverScale,
  hoverGlow,
  hoverLift,
  clickRipple,
  clickBounce,
  focusRing,
  enableRippleEffects,
} from './microInteractions';
