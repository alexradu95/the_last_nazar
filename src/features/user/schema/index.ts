/**
 * User Schema
 *
 * Database schema for user management feature.
 */

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * Users table
 */
export const users = sqliteTable(
  'feature_users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    avatar: text('avatar'), // URL or base64
    bio: text('bio'),
    timezone: text('timezone').default('UTC'),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

/**
 * User preferences table
 */
export const userPreferences = sqliteTable(
  'feature_user_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    key: text('key').notNull(), // e.g., 'theme', 'notifications'
    value: text('value').notNull(), // JSON string
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userKeyIdx: uniqueIndex('user_prefs_user_key_idx').on(table.userId, table.key),
  })
);

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  preferences: many(userPreferences),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

/**
 * Export schema for aggregator
 */
export const schema = {
  users,
  userPreferences,
};

/**
 * TypeScript types
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
