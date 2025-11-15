/**
 * Level Up Celebration Component
 *
 * Displays a celebration animation when user levels up
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';
import confetti from 'canvas-confetti';

interface LevelUpCelebrationProps {
  level: number;
  onComplete?: () => void;
}

export function LevelUpCelebration({ level, onComplete }: LevelUpCelebrationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion()) {
      setTimeout(() => onComplete?.(), 500);
      return;
    }

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB'],
    });

    // Additional confetti bursts
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500'],
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500'],
      });
    }, 400);

    // Animate level up text
    if (ref.current) {
      anime
        .timeline()
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

/**
 * Achievement Unlock Animation
 */
export function AchievementUnlock({
  title,
  description,
  icon = '🏆',
  onComplete,
}: {
  title: string;
  description?: string;
  icon?: string;
  onComplete?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion()) {
      setTimeout(() => onComplete?.(), 500);
      return;
    }

    // Small confetti burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FFD700', '#FFA500'],
    });

    if (ref.current) {
      anime
        .timeline()
        .add({
          targets: ref.current,
          translateY: [100, 0],
          opacity: [0, 1],
          duration: 500,
          easing: 'easeOutCubic',
        })
        .add({
          targets: ref.current,
          scale: [1, 1.05, 1],
          duration: 300,
        })
        .add({
          targets: ref.current,
          translateY: [0, -100],
          opacity: [1, 0],
          duration: 500,
          delay: 2000,
          complete: onComplete,
        });
    }
  }, [onComplete]);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
      style={{ opacity: 0 }}
    >
      <div className="flex items-center gap-4 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-white shadow-xl">
        <div className="text-4xl">{icon}</div>
        <div>
          <div className="text-lg font-bold">{title}</div>
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
    </div>
  );
}
