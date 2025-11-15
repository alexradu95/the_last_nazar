/**
 * Core Animation Functions
 *
 * Reusable animation utilities using Anime.js
 */

import { anime, ANIMATION_CONFIG } from './config';

// Fade animations
export function fadeIn(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function fadeOut(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    opacity: [1, 0],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Slide animations
export function slideInUp(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function slideInDown(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function slideInLeft(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateX: [-50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function slideInRight(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateX: [50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Scale animations
export function scaleIn(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.spring,
    ...options,
  });
}

export function scaleOut(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    scale: [1, 0.9],
    opacity: [1, 0],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function pulse(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    scale: [1, 1.05, 1],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Rotate animations
export function rotate(element: HTMLElement | string, degrees: number, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    rotate: degrees,
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function spin(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    rotate: 360,
    duration: ANIMATION_CONFIG.duration.slow,
    easing: 'linear',
    loop: true,
    ...options,
  });
}

// Shake animation
export function shake(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateX: [
      { value: -10, duration: 100 },
      { value: 10, duration: 100 },
      { value: -10, duration: 100 },
      { value: 10, duration: 100 },
      { value: 0, duration: 100 },
    ],
    easing: 'easeInOutSine',
    ...options,
  });
}

// Bounce animation
export function bounce(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    translateY: [
      { value: -30, duration: 200 },
      { value: 0, duration: 200 },
      { value: -15, duration: 200 },
      { value: 0, duration: 200 },
    ],
    easing: ANIMATION_CONFIG.easing.bounce,
    ...options,
  });
}

// Stagger animations
export function staggerFadeIn(elements: HTMLElement[] | string, options: Record<string, any> = {}) {
  return anime({
    targets: elements,
    opacity: [0, 1],
    translateY: [20, 0],
    duration: ANIMATION_CONFIG.duration.normal,
    delay: anime.stagger(ANIMATION_CONFIG.stagger.medium),
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function staggerSlideIn(elements: HTMLElement[] | string, options: Record<string, any> = {}) {
  return anime({
    targets: elements,
    translateX: [50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    delay: anime.stagger(ANIMATION_CONFIG.stagger.medium),
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function staggerScaleIn(elements: HTMLElement[] | string, options: Record<string, any> = {}) {
  return anime({
    targets: elements,
    scale: [0, 1],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    delay: anime.stagger(ANIMATION_CONFIG.stagger.small),
    easing: ANIMATION_CONFIG.easing.spring,
    ...options,
  });
}

// Attention seekers
export function heartbeat(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    scale: [1, 1.3, 1, 1.3, 1],
    duration: 1300,
    easing: 'easeInOutSine',
    ...options,
  });
}

export function wiggle(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    rotate: [-5, 5, -5, 5, 0],
    duration: ANIMATION_CONFIG.duration.slow,
    easing: 'easeInOutSine',
    ...options,
  });
}

// Utility animations
export function flash(element: HTMLElement | string, options: Record<string, any> = {}) {
  return anime({
    targets: element,
    opacity: [1, 0, 1, 0, 1],
    duration: ANIMATION_CONFIG.duration.slow,
    easing: 'linear',
    ...options,
  });
}
