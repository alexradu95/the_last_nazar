/**
 * Authentication Schema
 *
 * Database schema for authentication and session management.
 */

import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from '@/features/user/schema';

/**
 * Sessions table - stores active user sessions
 */
export const sessions = sqliteTable(
  'feature_auth_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    tokenIdx: uniqueIndex('sessions_token_idx').on(table.token),
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  })
);

/**
 * Credentials table - stores password hashes and salts
 */
export const credentials = sqliteTable(
  'feature_auth_credentials',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    passwordHash: text('password_hash').notNull(),
    salt: text('salt').notNull(),
    lastPasswordChange: integer('last_password_change', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: uniqueIndex('credentials_user_id_idx').on(table.userId),
  })
);

/**
 * Verification tokens table - for email verification and password reset
 */
export const verificationTokens = sqliteTable(
  'feature_auth_verification_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    type: text('type', { enum: ['email_verification', 'password_reset'] }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    usedAt: integer('used_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    tokenIdx: uniqueIndex('verification_tokens_token_idx').on(table.token),
    userIdIdx: index('verification_tokens_user_id_idx').on(table.userId),
    typeIdx: index('verification_tokens_type_idx').on(table.type),
  })
);

/**
 * Login attempts table - for rate limiting and security
 */
export const loginAttempts = sqliteTable(
  'feature_auth_login_attempts',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    ipAddress: text('ip_address'),
    success: integer('success', { mode: 'boolean' }).notNull(),
    timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => ({
    emailIdx: index('login_attempts_email_idx').on(table.email),
    timestampIdx: index('login_attempts_timestamp_idx').on(table.timestamp),
  })
);

/**
 * Relations
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const credentialsRelations = relations(credentials, ({ one }) => ({
  user: one(users, {
    fields: [credentials.userId],
    references: [users.id],
  }),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

/**
 * Export schema for aggregator
 */
export const schema = {
  sessions,
  credentials,
  verificationTokens,
  loginAttempts,
};

/**
 * TypeScript types
 */
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type NewLoginAttempt = typeof loginAttempts.$inferInsert;
