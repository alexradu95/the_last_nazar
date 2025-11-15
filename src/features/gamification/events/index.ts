/**
 * Gamification Event Definitions
 *
 * Defines all events emitted and listened to by the gamification feature.
 */

import type { BaseEventPayload } from '@/core/types/event.types';

/**
 * XP Awarded Event
 * Emitted when XP is awarded to a user
 */
export interface XPAwardedPayload extends BaseEventPayload {
  userId: string;
  amount: number;
  source: string;
  newTotal: number;
  timestamp: number;
}

/**
 * Level Up Event
 * Emitted when a user reaches a new level
 */
export interface LevelUpPayload extends BaseEventPayload {
  userId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
}

/**
 * Achievement Unlocked Event
 * Emitted when a user unlocks an achievement
 */
export interface AchievementUnlockedPayload extends BaseEventPayload {
  userId: string;
  achievementId: string;
  achievementKey: string;
  achievementName: string;
  xpReward: number;
  timestamp: number;
}

/**
 * Streak Updated Event
 * Emitted when a user's streak is updated
 */
export interface StreakUpdatedPayload extends BaseEventPayload {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakIncreased: boolean;
  streakBroken: boolean;
  timestamp: number;
}

/**
 * Task Completed Event (listened to)
 * Emitted by tasks feature when a task is completed
 */
export interface TaskCompletedPayload extends BaseEventPayload {
  taskId: string;
  userId: string;
  xpReward: number;
  priority?: string;
  timestamp: number;
}

/**
 * Journal Created Event (listened to)
 * Emitted by journal feature when a journal entry is created
 */
export interface JournalCreatedPayload extends BaseEventPayload {
  journalId: string;
  userId: string;
  wordCount: number;
  timestamp: number;
}

/**
 * User Login Event (listened to)
 * Emitted by auth feature when a user logs in
 */
export interface UserLoginPayload extends BaseEventPayload {
  userId: string;
  timestamp: number;
}

/**
 * Event catalog for gamification feature
 */
export const GAMIFICATION_EVENTS = {
  // Events emitted by this feature
  EMITS: {
    XP_AWARDED: 'xp.awarded',
    LEVEL_UP: 'level.up',
    ACHIEVEMENT_UNLOCKED: 'achievement.unlocked',
    STREAK_UPDATED: 'streak.updated',
  },

  // Events this feature listens to
  LISTENS: {
    TASK_COMPLETED: 'task.completed',
    JOURNAL_CREATED: 'journal.created',
    USER_LOGIN: 'user.login',
  },
} as const;
