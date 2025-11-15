/**
 * Gamification Types
 *
 * Schema-first type definitions using Zod for runtime validation.
 */

import { z } from 'zod';

// ========================================
// Zod Schemas (Runtime Validation)
// ========================================

/**
 * User Stats Schema
 */
export const UserStatsSchema = z.object({
  id: z.string(),
  userId: z.string().min(1),
  totalXP: z.number().int().min(0).default(0),
  currentLevel: z.number().int().min(1).default(1),
  xpToNextLevel: z.number().int().min(0).default(100),
  currentStreak: z.number().int().min(0).default(0),
  longestStreak: z.number().int().min(0).default(0),
  lastActivityDate: z.string().nullable(), // YYYY-MM-DD format
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NewUserStatsSchema = UserStatsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

/**
 * XP History Schema
 */
export const XPHistorySchema = z.object({
  id: z.string(),
  userId: z.string().min(1),
  amount: z.number().int(),
  source: z.enum(['task', 'journal', 'achievement', 'streak', 'manual']),
  sourceId: z.string().nullable(),
  reason: z.string().nullable(),
  timestamp: z.date(),
});

export const NewXPHistorySchema = XPHistorySchema.omit({
  id: true,
  timestamp: true,
});

/**
 * Achievement Schema
 */
export const AchievementTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum']);

export const AchievementCriteriaSchema = z.object({
  taskCount: z.number().int().min(1).optional(),
  streakDays: z.number().int().min(1).optional(),
  level: z.number().int().min(1).optional(),
  totalXP: z.number().int().min(1).optional(),
  journalCount: z.number().int().min(1).optional(),
});

export const AchievementSchema = z.object({
  id: z.string(),
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().nullable(),
  xpReward: z.number().int().min(0).default(0),
  tier: AchievementTierSchema.default('bronze'),
  criteria: z.string(), // JSON string of AchievementCriteriaSchema
  createdAt: z.date(),
});

export const NewAchievementSchema = AchievementSchema.omit({
  id: true,
  createdAt: true,
});

/**
 * User Achievement Schema
 */
export const UserAchievementSchema = z.object({
  id: z.string(),
  userId: z.string().min(1),
  achievementId: z.string().min(1),
  unlockedAt: z.date(),
});

export const NewUserAchievementSchema = UserAchievementSchema.omit({
  id: true,
  unlockedAt: true,
});

/**
 * Level Info Schema
 */
export const LevelInfoSchema = z.object({
  level: z.number().int().min(1),
  xpToNext: z.number().int().min(0),
  xpCurrent: z.number().int().min(0),
  xpForCurrentLevel: z.number().int().min(0),
});

/**
 * Streak Info Schema
 */
export const StreakInfoSchema = z.object({
  currentStreak: z.number().int().min(0),
  longestStreak: z.number().int().min(0),
  lastActivityDate: z.string().nullable(),
  streakIncreased: z.boolean(),
  streakBroken: z.boolean(),
});

/**
 * Leaderboard Entry Schema
 */
export const LeaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  totalXP: z.number().int(),
  currentLevel: z.number().int(),
  rank: z.number().int(),
  currentStreak: z.number().int(),
});

/**
 * Award XP Request Schema
 */
export const AwardXPRequestSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().int().min(1),
  source: z.enum(['task', 'journal', 'achievement', 'streak', 'manual']),
  sourceId: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * Award XP Result Schema
 */
export const AwardXPResultSchema = z.object({
  newTotal: z.number().int(),
  leveledUp: z.boolean(),
  newLevel: z.number().int().optional(),
  achievementsUnlocked: z.array(z.string()).optional(),
});

// ========================================
// TypeScript Types (Derived from Schemas)
// ========================================

export type UserStats = z.infer<typeof UserStatsSchema>;
export type NewUserStats = z.infer<typeof NewUserStatsSchema>;

export type XPHistory = z.infer<typeof XPHistorySchema>;
export type NewXPHistory = z.infer<typeof NewXPHistorySchema>;

export type AchievementTier = z.infer<typeof AchievementTierSchema>;
export type AchievementCriteria = z.infer<typeof AchievementCriteriaSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type NewAchievement = z.infer<typeof NewAchievementSchema>;

export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type NewUserAchievement = z.infer<typeof NewUserAchievementSchema>;

export type LevelInfo = z.infer<typeof LevelInfoSchema>;
export type StreakInfo = z.infer<typeof StreakInfoSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

export type AwardXPRequest = z.infer<typeof AwardXPRequestSchema>;
export type AwardXPResult = z.infer<typeof AwardXPResultSchema>;

// ========================================
// Event Payload Types
// ========================================

export type XPAwardedPayload = {
  userId: string;
  amount: number;
  source: string;
  newTotal: number;
  timestamp: number;
};

export type LevelUpPayload = {
  userId: string;
  oldLevel: number;
  newLevel: number;
  timestamp: number;
};

export type AchievementUnlockedPayload = {
  userId: string;
  achievementId: string;
  achievementKey: string;
  achievementName: string;
  xpReward: number;
  timestamp: number;
};

export type StreakUpdatedPayload = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  streakIncreased: boolean;
  streakBroken: boolean;
  timestamp: number;
};
