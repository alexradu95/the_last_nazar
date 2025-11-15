/**
 * Database Schema for Agents Feature
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Agent ID type
export type AgentId = 'dawn' | 'atlas' | 'luna';

// Conversations table
export const conversations = sqliteTable('feature_agents_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id', { enum: ['dawn', 'atlas', 'luna'] }).notNull(),
  title: text('title'), // Auto-generated or user-set
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userAgentIdx: index('conversations_user_agent_idx').on(table.userId, table.agentId),
}));

// Messages table
export const messages = sqliteTable('feature_agents_messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').notNull().references(() => conversations.id),
  role: text('role', { enum: ['user', 'agent'] }).notNull(),
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON: context, triggers, etc.
  timestamp: integer('timestamp', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  timestampIdx: index('messages_timestamp_idx').on(table.timestamp),
}));

// Suggestions table
export const suggestions = sqliteTable('feature_agents_suggestions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id', { enum: ['dawn', 'atlas', 'luna'] }).notNull(),
  type: text('type').notNull(), // 'task', 'insight', 'prompt', 'tip'
  content: text('content').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
  status: text('status', { enum: ['active', 'dismissed', 'completed'] }).default('active'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userStatusIdx: index('suggestions_user_status_idx').on(table.userId, table.status),
}));

// Insights table
export const insights = sqliteTable('feature_agents_insights', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  agentId: text('agent_id').notNull(),
  category: text('category').notNull(), // 'productivity', 'mood', 'patterns'
  title: text('title').notNull(),
  content: text('content').notNull(),
  data: text('data'), // JSON: supporting data/metrics
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  userCategoryIdx: index('insights_user_category_idx').on(table.userId, table.category),
}));

// Export types
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestion = typeof suggestions.$inferInsert;

export type Insight = typeof insights.$inferSelect;
export type NewInsight = typeof insights.$inferInsert;
