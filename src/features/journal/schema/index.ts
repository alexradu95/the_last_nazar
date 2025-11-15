/**
 * Journal Feature Database Schema
 *
 * Defines tables for journal entries, moods, and prompts.
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * Journal Entries Table
 *
 * Stores user journal entries with content, mood, and metadata.
 */
export const journalEntries = sqliteTable(
  'feature_journal_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    mood: integer('mood'), // 1-5 scale: 1=very bad, 2=bad, 3=neutral, 4=good, 5=very good
    wordCount: integer('word_count').default(0).notNull(),
    tags: text('tags'), // JSON array of tags
    promptId: text('prompt_id'), // Reference to daily prompt if used
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('journal_entries_user_id_idx').on(table.userId),
    createdAtIdx: index('journal_entries_created_at_idx').on(table.createdAt),
    moodIdx: index('journal_entries_mood_idx').on(table.mood),
    userCreatedIdx: index('journal_entries_user_created_idx').on(
      table.userId,
      table.createdAt
    ),
  })
);

/**
 * Daily Prompts Table
 *
 * Stores writing prompts to inspire journal entries.
 */
export const dailyPrompts = sqliteTable('feature_journal_prompts', {
  id: text('id').primaryKey(),
  prompt: text('prompt').notNull(),
  category: text('category', {
    enum: ['reflection', 'gratitude', 'goals', 'creativity', 'wellbeing'],
  }).notNull(),
  difficulty: text('difficulty', { enum: ['easy', 'medium', 'hard'] })
    .default('medium')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * User Prompt History Table
 *
 * Tracks which prompts have been shown to users to avoid repetition.
 */
export const userPromptHistory = sqliteTable(
  'feature_journal_user_prompts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    promptId: text('prompt_id').notNull(),
    shownAt: integer('shown_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    used: integer('used', { mode: 'boolean' }).default(false).notNull(), // Did they write with this prompt?
  },
  (table) => ({
    userIdIdx: index('user_prompts_user_id_idx').on(table.userId),
    promptIdIdx: index('user_prompts_prompt_id_idx').on(table.promptId),
  })
);

/**
 * Journal Streaks Table
 *
 * Tracks journaling streaks for users.
 */
export const journalStreaks = sqliteTable('feature_journal_streaks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  currentStreak: integer('current_streak').default(0).notNull(),
  longestStreak: integer('longest_streak').default(0).notNull(),
  lastEntryDate: integer('last_entry_date', { mode: 'timestamp' }),
  totalEntries: integer('total_entries').default(0).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Type exports
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type DailyPrompt = typeof dailyPrompts.$inferSelect;
export type NewDailyPrompt = typeof dailyPrompts.$inferInsert;
export type UserPromptHistory = typeof userPromptHistory.$inferSelect;
export type NewUserPromptHistory = typeof userPromptHistory.$inferInsert;
export type JournalStreak = typeof journalStreaks.$inferSelect;
export type NewJournalStreak = typeof journalStreaks.$inferInsert;
