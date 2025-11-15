/**
 * Micro-Interaction Animations
 *
 * Small, delightful animations for user interactions
 */

import { anime, ANIMATION_CONFIG } from './config';
import { shouldReduceMotion } from './accessibility';

/**
 * Hover scale effect
 */
export function hoverScale(element: HTMLElement, scale = 1.05) {
  if (shouldReduceMotion()) return;

  element.addEventListener('mouseenter', () => {
    anime({
      targets: element,
      scale: scale,
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });

  element.addEventListener('mouseleave', () => {
    anime({
      targets: element,
      scale: 1,
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });
}

/**
 * Hover glow effect
 */
export function hoverGlow(element: HTMLElement, color = 'rgba(59, 130, 246, 0.5)') {
  if (shouldReduceMotion()) return;

  element.addEventListener('mouseenter', () => {
    anime({
      targets: element,
      boxShadow: `0 0 20px ${color}`,
      duration: ANIMATION_CONFIG.duration.normal,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });

  element.addEventListener('mouseleave', () => {
    anime({
      targets: element,
      boxShadow: `0 0 0px ${color}`,
      duration: ANIMATION_CONFIG.duration.normal,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });
}

/**
 * Hover lift effect (translate up with shadow)
 */
export function hoverLift(element: HTMLElement) {
  if (shouldReduceMotion()) return;

  const originalShadow = window.getComputedStyle(element).boxShadow;

  element.addEventListener('mouseenter', () => {
    anime({
      targets: element,
      translateY: -4,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });

  element.addEventListener('mouseleave', () => {
    anime({
      targets: element,
      translateY: 0,
      boxShadow: originalShadow,
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });
}

/**
 * Click ripple effect
 */
export function clickRipple(element: HTMLElement, event: MouseEvent) {
  if (shouldReduceMotion()) return;

  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.borderRadius = '50%';
  ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  ripple.style.width = '20px';
  ripple.style.height = '20px';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.transform = 'translate(-50%, -50%)';
  ripple.style.pointerEvents = 'none';

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  anime({
    targets: ripple,
    scale: [0, 4],
    opacity: [1, 0],
    duration: 600,
    easing: 'easeOutCubic',
    complete: () => {
      ripple.remove();
    },
  });
}

/**
 * Click bounce effect
 */
export function clickBounce(element: HTMLElement) {
  if (shouldReduceMotion()) return;

  anime({
    targets: element,
    scale: [1, 0.95, 1],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.spring,
  });
}

/**
 * Focus ring animation
 */
export function focusRing(element: HTMLElement) {
  if (shouldReduceMotion()) return;

  element.addEventListener('focus', () => {
    anime({
      targets: element,
      outlineWidth: ['0px', '3px'],
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });

  element.addEventListener('blur', () => {
    anime({
      targets: element,
      outlineWidth: ['3px', '0px'],
      duration: ANIMATION_CONFIG.duration.fast,
      easing: ANIMATION_CONFIG.easing.default,
    });
  });
}

/**
 * Add ripple effect to all buttons
 */
export function enableRippleEffects() {
  if (typeof document === 'undefined' || shouldReduceMotion()) return;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.tagName === 'BUTTON' ? target : target.closest('button')!;
      clickRipple(button, event as MouseEvent);
    }
  });
}
