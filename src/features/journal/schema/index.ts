/**
 * Journal Schema
 *
 * Database schema for journal feature.
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * Journal entries table
 */
export const journalEntries = sqliteTable(
  'feature_journal_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    mood: text('mood', {
      enum: ['happy', 'sad', 'stressed', 'excited', 'calm', 'tired', 'angry', 'grateful']
    }),
    wordCount: integer('word_count').default(0),
    isPrivate: integer('is_private', { mode: 'boolean' }).default(true),
    tags: text('tags'), // JSON array of strings
    date: text('date').notNull(), // YYYY-MM-DD for grouping by day
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('journal_user_id_idx').on(table.userId),
    dateIdx: index('journal_date_idx').on(table.date),
    moodIdx: index('journal_mood_idx').on(table.mood),
  })
);

/**
 * Journal prompts table
 */
export const journalPrompts = sqliteTable('feature_journal_prompts', {
  id: text('id').primaryKey(),
  category: text('category', {
    enum: ['reflection', 'gratitude', 'growth', 'creativity']
  }).notNull(),
  prompt: text('prompt').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  usageCount: integer('usage_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * Journal insights table
 */
export const journalInsights = sqliteTable(
  'feature_journal_insights',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    entryId: text('entry_id').references(() => journalEntries.id),
    insight: text('insight').notNull(),
    generatedBy: text('generated_by').default('luna'), // Which agent generated it
    isRead: integer('is_read', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('insights_user_id_idx').on(table.userId),
    entryIdIdx: index('insights_entry_id_idx').on(table.entryId),
  })
);

/**
 * Relations
 */
export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  insights: many(journalInsights),
}));

export const journalInsightsRelations = relations(journalInsights, ({ one }) => ({
  entry: one(journalEntries, {
    fields: [journalInsights.entryId],
    references: [journalEntries.id],
  }),
}));

/**
 * Export schema for aggregator
 */
export const schema = {
  journalEntries,
  journalPrompts,
  journalInsights,
};

/**
 * TypeScript types
 */
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalPrompt = typeof journalPrompts.$inferSelect;
export type NewJournalPrompt = typeof journalPrompts.$inferInsert;
export type JournalInsight = typeof journalInsights.$inferSelect;
export type NewJournalInsight = typeof journalInsights.$inferInsert;

export type Mood = 'happy' | 'sad' | 'stressed' | 'excited' | 'calm' | 'tired' | 'angry' | 'grateful';
export type PromptCategory = 'reflection' | 'gratitude' | 'growth' | 'creativity';
