/**
 * Event Definitions for Agents Feature
 */

import type { BaseEventPayload } from '@/core/types/event.types';
import type { AgentId } from '../schema';

export interface AgentMessageEvent extends BaseEventPayload {
  conversationId: string;
  agentId: AgentId;
  userId: string;
  message: string;
  trigger?: string;
}

export interface AgentSuggestionEvent extends BaseEventPayload {
  suggestionId: string;
  agentId: AgentId;
  userId: string;
  type: string;
  content: string;
}

export interface AgentInsightEvent extends BaseEventPayload {
  insightId: string;
  agentId: AgentId;
  userId: string;
  category: string;
  title: string;
}

// Event name constants
export const AGENT_EVENTS = {
  MESSAGE: 'agent.message',
  SUGGESTION: 'agent.suggestion',
  INSIGHT: 'agent.insight',
} as const;
