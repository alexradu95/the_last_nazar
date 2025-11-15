/**
 * Task Schema
 *
 * Database schema for tasks feature.
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * Tasks table
 */
export const tasks = sqliteTable(
  'feature_tasks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
    status: text('status', { enum: ['active', 'completed', 'archived'] }).default('active'),
    categoryId: text('category_id'),
    xpReward: integer('xp_reward').default(10),
    dueDate: integer('due_date', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('tasks_user_id_idx').on(table.userId),
    statusIdx: index('tasks_status_idx').on(table.status),
    categoryIdIdx: index('tasks_category_id_idx').on(table.categoryId),
  })
);

/**
 * Task categories table
 */
export const taskCategories = sqliteTable('feature_task_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
  color: text('color').default('#3b82f6'),
  icon: text('icon'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

/**
 * Relations
 */
export const tasksRelations = relations(tasks, ({ one }) => ({
  category: one(taskCategories, {
    fields: [tasks.categoryId],
    references: [taskCategories.id],
  }),
}));

export const taskCategoriesRelations = relations(taskCategories, ({ many }) => ({
  tasks: many(tasks),
}));

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
