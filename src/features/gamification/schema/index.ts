/**
 * Gamification Schema
 *
 * Database schema for gamification feature using Drizzle ORM.
 */

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * User stats table - tracks XP, level, and streaks
 */
export const userStats = sqliteTable(
  'feature_gamification_user_stats',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().unique(),
    totalXP: integer('total_xp').default(0).notNull(),
    currentLevel: integer('current_level').default(1).notNull(),
    xpToNextLevel: integer('xp_to_next_level').default(100).notNull(),
    currentStreak: integer('current_streak').default(0).notNull(),
    longestStreak: integer('longest_streak').default(0).notNull(),
    lastActivityDate: text('last_activity_date'), // YYYY-MM-DD
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: uniqueIndex('gamification_user_idx').on(table.userId),
    levelIdx: index('gamification_level_idx').on(table.currentLevel),
    streakIdx: index('gamification_streak_idx').on(table.currentStreak),
  })
);

/**
 * XP history table - tracks all XP awards
 */
export const xpHistory = sqliteTable(
  'feature_gamification_xp_history',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    amount: integer('amount').notNull(),
    source: text('source', { enum: ['task', 'journal', 'achievement', 'streak', 'manual'] }).notNull(),
    sourceId: text('source_id'), // ID of task/journal that triggered XP
    reason: text('reason'), // Human-readable description
    timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('xp_history_user_idx').on(table.userId),
    timestampIdx: index('xp_history_timestamp_idx').on(table.timestamp),
    sourceIdx: index('xp_history_source_idx').on(table.source),
  })
);

/**
 * Achievements table - defines available achievements
 */
export const achievements = sqliteTable('feature_gamification_achievements', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(), // 'first_task', 'streak_7', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'), // Emoji or icon name
  xpReward: integer('xp_reward').default(0).notNull(),
  tier: text('tier', { enum: ['bronze', 'silver', 'gold', 'platinum'] }).default('bronze').notNull(),
  criteria: text('criteria').notNull(), // JSON string of unlock criteria
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * User achievements table - tracks unlocked achievements per user
 */
export const userAchievements = sqliteTable(
  'feature_gamification_user_achievements',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    achievementId: text('achievement_id').notNull(),
    unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userAchievementIdx: uniqueIndex('user_achievement_idx').on(table.userId, table.achievementId),
    userIdIdx: index('user_achievements_user_idx').on(table.userId),
  })
);

/**
 * Relations
 */
export const userStatsRelations = relations(userStats, ({ many }) => ({
  xpHistory: many(xpHistory),
  userAchievements: many(userAchievements),
}));

export const xpHistoryRelations = relations(xpHistory, ({ one }) => ({
  userStats: one(userStats, {
    fields: [xpHistory.userId],
    references: [userStats.userId],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
  userStats: one(userStats, {
    fields: [userAchievements.userId],
    references: [userStats.userId],
  }),
}));

/**
 * Export schema for aggregator
 */
export const schema = {
  userStats,
  xpHistory,
  achievements,
  userAchievements,
};

/**
 * TypeScript types inferred from schema
 */
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;

export type XPHistory = typeof xpHistory.$inferSelect;
export type NewXPHistory = typeof xpHistory.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
