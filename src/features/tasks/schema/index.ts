/**
 * Task Schema
 *
 * Database schema for tasks feature.
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Tasks table
 */
export const tasks = sqliteTable('feature_tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  xpReward: integer('xp_reward').default(10),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

/**
 * Task categories table (optional)
 */
export const taskCategories = sqliteTable('feature_task_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  color: text('color'),
});

/**
 * Export schema for aggregator
 */
export const schema = {
  tasks,
  taskCategories,
};

/**
 * TypeScript types
 */
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskCategory = typeof taskCategories.$inferSelect;
