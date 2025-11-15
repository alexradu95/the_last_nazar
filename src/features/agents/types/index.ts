/**
 * TypeScript Type Definitions for Agents Feature
 */

// Re-export schema types
export type {
  AgentId,
  Conversation,
  NewConversation,
  Message,
  NewMessage,
  Suggestion,
  NewSuggestion,
  Insight,
  NewInsight,
} from '../schema';

// Re-export event types
export type {
  AgentMessageEvent,
  AgentSuggestionEvent,
  AgentInsightEvent,
} from '../events';

// Re-export utility types
export type { AgentContext, AgentPersonality } from '../utils/agent-templates';

// Agent status types
export type AgentStatus = 'online' | 'typing' | 'offline';

// Chat-related types
export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error?: string;
}

// Suggestion types
export type SuggestionType = 'task' | 'insight' | 'prompt' | 'tip';
export type SuggestionPriority = 'low' | 'medium' | 'high';
export type SuggestionStatus = 'active' | 'dismissed' | 'completed';

// Insight categories
export type InsightCategory = 'productivity' | 'mood' | 'patterns' | 'growth';
