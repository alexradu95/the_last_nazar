/**
 * XP Counter Component
 *
 * Displays user's current XP, level, and progress to next level.
 * Shows level-up animations when user levels up.
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UserStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

interface XPCounterProps {
  stats: UserStats;
  showLevelUp?: boolean;
  onLevelUpComplete?: () => void;
  className?: string;
}

export function XPCounter({
  stats,
  showLevelUp = false,
  onLevelUpComplete,
  className = '',
}: XPCounterProps) {
  const [isAnimating, setIsAnimating] = useState(showLevelUp);

  useEffect(() => {
    if (showLevelUp) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onLevelUpComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showLevelUp, onLevelUpComplete]);

  // Calculate XP progress percentage
  const xpForCurrentLevel = stats.totalXP - (stats.totalXP - stats.xpToNextLevel);
  const progressPercentage = (xpForCurrentLevel / stats.xpToNextLevel) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Level Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm shadow-lg">
            {stats.currentLevel}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Level {stats.currentLevel}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stats.totalXP.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Streak Indicator */}
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <span className="text-orange-600 dark:text-orange-400">🔥</span>
            <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
              {stats.currentStreak}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* XP Remaining */}
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 text-right">
        {stats.xpToNextLevel - xpForCurrentLevel} XP to Level {stats.currentLevel + 1}
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <motion.div
                className="text-6xl mb-2"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⭐
              </motion.div>
              <div className="text-2xl font-bold text-white mb-1">Level Up!</div>
              <div className="text-lg text-blue-300">Level {stats.currentLevel}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
