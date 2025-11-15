/**
 * Animation Listener Component
 *
 * Listens to gamification events and triggers appropriate animations
 */

'use client';

import { useEffect, useState } from 'react';
import { XPAnimation } from './XPAnimation';
import { LevelUpCelebration, AchievementUnlock } from './LevelUpCelebration';

interface XPAnimationItem {
  id: string;
  amount: number;
}

interface LevelUpItem {
  id: string;
  level: number;
}

interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
}

export function AnimationListener() {
  const [xpAnimations, setXpAnimations] = useState<XPAnimationItem[]>([]);
  const [levelUps, setLevelUps] = useState<LevelUpItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if eventBus is available
    const checkEventBus = async () => {
      try {
        const { eventBus } = await import('@/src/core/event-bus');

        // XP handler
        const xpHandler = (payload: any) => {
          const id = Math.random().toString(36).substring(7);
          setXpAnimations((prev) => [...prev, { id, amount: payload.amount }]);
        };

        // Level up handler
        const levelHandler = (payload: any) => {
          const id = Math.random().toString(36).substring(7);
          setLevelUps((prev) => [...prev, { id, level: payload.newLevel }]);
        };

        // Achievement handler
        const achievementHandler = (payload: any) => {
          const id = Math.random().toString(36).substring(7);
          setAchievements((prev) => [
            ...prev,
            {
              id,
              title: payload.achievement?.name || 'Achievement Unlocked!',
              description: payload.achievement?.description,
              icon: payload.achievement?.icon || '🏆',
            },
          ]);
        };

        // Subscribe to events
        eventBus.on('xp.awarded', xpHandler);
        eventBus.on('level.up', levelHandler);
        eventBus.on('achievement.unlocked', achievementHandler);

        // Cleanup
        return () => {
          eventBus.off('xp.awarded', xpHandler);
          eventBus.off('level.up', levelHandler);
          eventBus.off('achievement.unlocked', achievementHandler);
        };
      } catch (error) {
        // EventBus not available, animations will still work for manual triggers
        console.log('EventBus not available, animation listener in standalone mode');
        return undefined;
      }
    };

    let cleanup: (() => void) | undefined;
    checkEventBus().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  const removeXPAnimation = (id: string) => {
    setXpAnimations((prev) => prev.filter((a) => a.id !== id));
  };

  const removeLevelUp = (id: string) => {
    setLevelUps((prev) => prev.filter((l) => l.id !== id));
  };

  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <>
      {/* XP Animations */}
      {xpAnimations.map(({ id, amount }) => (
        <XPAnimation key={id} amount={amount} onComplete={() => removeXPAnimation(id)} />
      ))}

      {/* Level Up Celebrations */}
      {levelUps.map(({ id, level }) => (
        <LevelUpCelebration key={id} level={level} onComplete={() => removeLevelUp(id)} />
      ))}

      {/* Achievement Unlocks */}
      {achievements.map(({ id, title, description, icon }) => (
        <AchievementUnlock
          key={id}
          title={title}
          description={description}
          icon={icon}
          onComplete={() => removeAchievement(id)}
        />
      ))}
    </>
  );
}
