# Task 06: Animation System

**Priority**: P3 - Enhancement Feature
**Dependencies**: None (UI enhancement)
**Can Start**: Immediately
**Estimated Timeline**: 2-3 days
**Parallelizable**: Yes - Completely independent

---

## Overview

Implement a comprehensive animation system using Anime.js to enhance user experience with smooth transitions, micro-interactions, and delightful UI animations. This system provides reusable animation utilities and components.

## Objectives

- Anime.js integration and setup
- Reusable animation components
- Page transition animations
- Micro-interactions (hover, click, focus)
- Loading and skeleton animations
- Success/error animations
- Gamification celebrations (XP gains, level ups)
- Performance-optimized animations
- Accessibility considerations

## Dependencies

### Depends On
- None (pure UI enhancement)

### Enhances
- All features (provides animation utilities)

## Event Integration

### Listens To (Optional)
- `xp.awarded` - Trigger XP animation
- `level.up` - Trigger celebration animation
- `achievement.unlocked` - Trigger achievement animation
- `task.completed` - Trigger completion animation

### Emits
- None (visual enhancement only)

## Core Animation Library

### Anime.js Setup
```typescript
// lib/animations/config.ts
import anime from 'animejs';

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
};

export const defaultAnimation = {
  duration: ANIMATION_CONFIG.duration.normal,
  easing: ANIMATION_CONFIG.easing.default,
};
```

## Animation Utilities

### Core Animation Functions

```typescript
// lib/animations/core.ts

// Fade animations
export function fadeIn(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function fadeOut(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    opacity: [1, 0],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Slide animations
export function slideInUp(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

export function slideInDown(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    translateY: [-50, 0],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Scale animations
export function scaleIn(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    scale: [0.9, 1],
    opacity: [0, 1],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.spring,
    ...options,
  });
}

export function pulse(element: HTMLElement | string, options = {}) {
  return anime({
    targets: element,
    scale: [1, 1.05, 1],
    duration: ANIMATION_CONFIG.duration.fast,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Rotate animations
export function rotate(element: HTMLElement | string, degrees: number, options = {}) {
  return anime({
    targets: element,
    rotate: degrees,
    duration: ANIMATION_CONFIG.duration.normal,
    easing: ANIMATION_CONFIG.easing.default,
    ...options,
  });
}

// Shake animation
export function shake(element: HTMLElement | string, options = {}) {
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
export function bounce(element: HTMLElement | string, options = {}) {
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
export function staggerFadeIn(elements: HTMLElement[] | string, options = {}) {
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
```

## React Animation Components

### `AnimatedComponent.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { fadeIn } from '@/lib/animations/core';

interface AnimatedComponentProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn';
  delay?: number;
  className?: string;
}

export function AnimatedComponent({ children, animation = 'fadeIn', delay = 0, className }: AnimatedComponentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const animationMap = {
        fadeIn: () => fadeIn(ref.current!, { delay }),
        slideUp: () => slideInUp(ref.current!, { delay }),
        scaleIn: () => scaleIn(ref.current!, { delay }),
      };

      animationMap[animation]();
    }
  }, [animation, delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
```

### `XPAnimation.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface XPAnimationProps {
  amount: number;
  onComplete?: () => void;
}

export function XPAnimation({ amount, onComplete }: XPAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
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

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 text-4xl font-bold text-yellow-500"
      style={{ opacity: 0 }}
    >
      +{amount} XP
    </div>
  );
}
```

### `LevelUpCelebration.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import confetti from 'canvas-confetti';

interface LevelUpCelebrationProps {
  level: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({ level, onComplete }: LevelUpCelebrationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Animate level up text
    if (ref.current) {
      anime.timeline()
        .add({
          targets: ref.current,
          scale: [0, 1.5],
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutElastic(1, .6)',
        })
        .add({
          targets: ref.current,
          scale: [1.5, 1],
          duration: 300,
        })
        .add({
          targets: ref.current,
          opacity: 0,
          duration: 500,
          delay: 1500,
          complete: onComplete,
        });
    }
  }, [level, onComplete]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      style={{ opacity: 0 }}
    >
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white shadow-2xl">
        <div className="text-6xl font-bold">Level {level}!</div>
        <div className="mt-2 text-2xl">🎉 Amazing! 🎉</div>
      </div>
    </div>
  );
}
```

### `ProgressBar.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: string;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  color = 'bg-blue-600',
  height = 'h-2',
  animated = true,
}: ProgressBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prevProgress = useRef(0);

  useEffect(() => {
    if (ref.current && animated) {
      anime({
        targets: ref.current,
        width: `${progress}%`,
        duration: 800,
        easing: 'easeOutCubic',
      });
    }
    prevProgress.current = progress;
  }, [progress, animated]);

  return (
    <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${height}`}>
      <div
        ref={ref}
        className={`${color} ${height} rounded-full transition-all`}
        style={{ width: animated ? `${prevProgress.current}%` : `${progress}%` }}
      />
    </div>
  );
}
```

### `LoadingSpinner.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function LoadingSpinner({ size = 40, color = '#3b82f6' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current,
        rotate: 360,
        duration: 1000,
        loop: true,
        easing: 'linear',
      });
    }
  }, []);

  return (
    <div ref={ref} className="inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray="80, 200"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
```

### `Skeleton.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function Skeleton({ width = '100%', height = '20px', className = '' }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      anime({
        targets: ref.current,
        opacity: [0.5, 1, 0.5],
        duration: 1500,
        loop: true,
        easing: 'easeInOutSine',
      });
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded bg-gray-300 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    />
  );
}
```

## Page Transition System

### `PageTransition.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import anime from 'animejs';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) {
      // Exit animation
      anime({
        targets: ref.current,
        opacity: 0,
        translateY: -20,
        duration: 200,
        easing: 'easeInCubic',
        complete: () => {
          // Enter animation
          anime({
            targets: ref.current,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 400,
            easing: 'easeOutCubic',
          });
        },
      });
    }
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
```

## Micro-Interactions

### Hover Effects
```typescript
// lib/animations/microInteractions.ts

export function hoverScale(element: HTMLElement) {
  element.addEventListener('mouseenter', () => {
    anime({
      targets: element,
      scale: 1.05,
      duration: 200,
      easing: 'easeOutQuad',
    });
  });

  element.addEventListener('mouseleave', () => {
    anime({
      targets: element,
      scale: 1,
      duration: 200,
      easing: 'easeOutQuad',
    });
  });
}

export function hoverGlow(element: HTMLElement) {
  element.addEventListener('mouseenter', () => {
    anime({
      targets: element,
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      duration: 300,
      easing: 'easeOutQuad',
    });
  });

  element.addEventListener('mouseleave', () => {
    anime({
      targets: element,
      boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
      duration: 300,
      easing: 'easeOutQuad',
    });
  });
}
```

### Click Effects
```typescript
export function clickRipple(element: HTMLElement, event: MouseEvent) {
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
```

## Toast Notifications

### `Toast.tsx`
```typescript
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      // Enter animation
      anime({
        targets: ref.current,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic',
      });

      // Auto close after duration
      const timer = setTimeout(() => {
        if (ref.current) {
          anime({
            targets: ref.current,
            translateX: 300,
            opacity: 0,
            duration: 300,
            easing: 'easeInCubic',
            complete: onClose,
          });
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      ref={ref}
      className={`${colors[type]} fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg px-6 py-4 text-white shadow-lg`}
      style={{ opacity: 0 }}
    >
      <span className="text-2xl">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}
```

## Gamification Animations

### Listen to Events
```typescript
// components/AnimationListener.tsx
'use client';

import { useEffect, useState } from 'react';
import { eventBus } from '@/core/event-bus';
import { XPAnimation } from './XPAnimation';
import { LevelUpCelebration } from './LevelUpCelebration';

export function AnimationListener() {
  const [xpAnimations, setXpAnimations] = useState<Array<{ id: string; amount: number }>>([]);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    // Listen for XP awards
    eventBus.on('xp.awarded', (payload) => {
      const id = Math.random().toString(36);
      setXpAnimations(prev => [...prev, { id, amount: payload.amount }]);
    });

    // Listen for level ups
    eventBus.on('level.up', (payload) => {
      setLevelUp(payload.newLevel);
    });
  }, []);

  const removeXPAnimation = (id: string) => {
    setXpAnimations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <>
      {xpAnimations.map(({ id, amount }) => (
        <XPAnimation key={id} amount={amount} onComplete={() => removeXPAnimation(id)} />
      ))}
      {levelUp && (
        <LevelUpCelebration level={levelUp} onComplete={() => setLevelUp(null)} />
      )}
    </>
  );
}
```

## Implementation Checklist

### Phase 1: Setup (Day 1 Morning)
- [ ] Install Anime.js and dependencies
- [ ] Create animation configuration
- [ ] Set up core animation utilities
- [ ] Create animation constants

### Phase 2: Core Components (Day 1)
- [ ] Create AnimatedComponent
- [ ] Create ProgressBar
- [ ] Create LoadingSpinner
- [ ] Create Skeleton
- [ ] Test core animations

### Phase 3: Gamification Animations (Day 1-2)
- [ ] Create XPAnimation
- [ ] Create LevelUpCelebration
- [ ] Create AchievementUnlock
- [ ] Create AnimationListener
- [ ] Integrate with event system

### Phase 4: Micro-Interactions (Day 2)
- [ ] Implement hover effects
- [ ] Implement click ripples
- [ ] Implement focus animations
- [ ] Create Toast notifications

### Phase 5: Page Transitions (Day 2-3)
- [ ] Create PageTransition component
- [ ] Implement route change animations
- [ ] Test transitions across pages

### Phase 6: Polish & Performance (Day 3)
- [ ] Optimize animations for performance
- [ ] Add reduced motion support
- [ ] Test on different devices
- [ ] Documentation

## Accessibility Considerations

### Reduced Motion
```typescript
// lib/animations/accessibility.ts

export function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function accessibleAnime(config: any) {
  if (shouldReduceMotion()) {
    return anime({
      ...config,
      duration: 0,
    });
  }
  return anime(config);
}
```

## Performance Optimization

```typescript
// Use will-change for better performance
export function optimizedAnimation(element: HTMLElement, properties: string[]) {
  element.style.willChange = properties.join(', ');

  return () => {
    element.style.willChange = 'auto';
  };
}

// Throttle scroll animations
export function throttleScrollAnimation(callback: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
}
```

## Success Criteria

- [ ] All core animations working
- [ ] Gamification animations integrated
- [ ] Page transitions smooth
- [ ] Micro-interactions responsive
- [ ] Performance optimized (60fps)
- [ ] Reduced motion supported
- [ ] Documentation complete

## Notes

- Keep animations subtle and purposeful
- Always provide reduced motion alternatives
- Test on low-end devices
- Use GPU-accelerated properties (transform, opacity)
- Avoid animating layout properties (width, height, margin)
- Consider battery life on mobile

## Deliverables

1. Complete animation system
2. Reusable animation components
3. Gamification celebration animations
4. Page transition system
5. Micro-interaction library
6. Accessibility support
7. Documentation and examples

---

**Ready to start? Install dependencies**: `npm install animejs canvas-confetti`
