/**
 * Achievement Card Component
 *
 * Displays an individual achievement with unlock status and progress.
 */

'use client';

import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  showUnlockAnimation?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  bronze: {
    gradient: 'from-amber-700 to-amber-900',
    ring: 'ring-amber-600',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  silver: {
    gradient: 'from-gray-400 to-gray-600',
    ring: 'ring-gray-500',
    text: 'text-gray-700 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    ring: 'ring-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  platinum: {
    gradient: 'from-cyan-400 to-blue-600',
    ring: 'ring-cyan-500',
    text: 'text-cyan-700 dark:text-cyan-400',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
} as const;

export function AchievementCard({
  achievement,
  showUnlockAnimation = false,
  className = '',
}: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;
  const tierConfig = TIER_CONFIG[achievement.tier];
  const progress = achievement.progress ?? 0;
  const maxProgress = achievement.maxProgress ?? 100;
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border-2 ${
        isUnlocked
          ? `${tierConfig.ring} bg-white dark:bg-gray-800`
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
      } ${className}`}
      initial={showUnlockAnimation ? { scale: 0.8, opacity: 0 } : false}
      animate={
        showUnlockAnimation
          ? {
              scale: [0.8, 1.1, 1],
              opacity: 1,
              rotate: [0, -5, 5, 0],
            }
          : {}
      }
      transition={{ duration: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Gradient Background for Unlocked */}
      {isUnlocked && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${tierConfig.gradient} opacity-5`}
        />
      )}

      <div className="relative p-4">
        {/* Icon and Title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              isUnlocked
                ? `bg-gradient-to-br ${tierConfig.gradient}`
                : 'bg-gray-300 dark:bg-gray-700'
            } text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}
          >
            {achievement.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`font-semibold ${
                isUnlocked
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {achievement.name}
            </div>
            <div
              className={`text-sm ${
                isUnlocked
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {achievement.description}
            </div>
          </div>

          {/* Tier Badge */}
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${tierConfig.bg} ${tierConfig.text}`}
          >
            {achievement.tier.toUpperCase()}
          </div>
        </div>

        {/* Progress Bar (for progressive achievements) */}
        {!isUnlocked && maxProgress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>
                {progress} / {maxProgress}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${tierConfig.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          {isUnlocked ? (
            <>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span>✓</span>
                <span className="font-medium">Unlocked</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {achievement.unlockedAt &&
                  new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            </>
          ) : (
            <>
              <div className="text-gray-500 dark:text-gray-500">🔒 Locked</div>
              <div className={tierConfig.text}>+{achievement.xpReward} XP</div>
            </>
          )}
        </div>
      </div>

      {/* Shine Effect for Unlocked */}
      {isUnlocked && showUnlockAnimation && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1, repeat: 2, delay: 0.3 }}
        />
      )}
    </motion.div>
  );
}
