/**
 * Agent Service
 *
 * Business logic for AI agents feature
 */

import type { Database } from '@/core/types/database.types';
import type { IEventBus } from '@/core/types/event.types';
import { eq, and, desc } from 'drizzle-orm';
import {
  conversations,
  messages,
  suggestions,
  insights,
  type Conversation,
  type Message,
  type NewMessage,
  type Suggestion,
  type NewSuggestion,
  type Insight,
  type NewInsight,
  type AgentId,
} from '../schema';
import { AGENT_EVENTS } from '../events';
import {
  getAgentTemplate,
  getTimeOfDay,
  type AgentContext,
} from '../utils/agent-templates';

export class AgentService {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  /**
   * Build context for agent responses
   */
  async buildContext(userId: string): Promise<AgentContext> {
    const context: AgentContext = {
      userId,
      timeOfDay: getTimeOfDay(),
    };

    // TODO: Fetch additional context from other features when integrated
    // For now, return basic context
    return context;
  }

  /**
   * Get or create a conversation between user and agent
   */
  async getOrCreateConversation(
    userId: string,
    agentId: AgentId
  ): Promise<Conversation> {
    // Try to find existing conversation
    const existing = await this.db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.agentId, agentId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new conversation
    const id = crypto.randomUUID();
    const [conversation] = await this.db
      .insert(conversations)
      .values({
        id,
        userId,
        agentId,
        title: null,
        lastMessageAt: new Date(),
      })
      .returning();

    return conversation;
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(
    conversationId: string,
    limit: number = 50
  ): Promise<Message[]> {
    return await this.db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(
    userId: string,
    agentId?: AgentId
  ): Promise<Conversation[]> {
    if (agentId) {
      return await this.db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.userId, userId),
            eq(conversations.agentId, agentId)
          )
        )
        .orderBy(desc(conversations.lastMessageAt));
    }

    return await this.db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.lastMessageAt));
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    role: 'user' | 'agent',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<Message> {
    const id = crypto.randomUUID();

    const [message] = await this.db
      .insert(messages)
      .values({
        id,
        conversationId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    // Update conversation's last message timestamp
    await this.db
      .update(conversations)
      .set({ lastMessageAt: message.timestamp })
      .where(eq(conversations.id, conversationId));

    return message;
  }

  /**
   * Generate agent response using templates
   */
  async generateResponse(
    agentId: AgentId,
    userMessage: string,
    context: AgentContext
  ): Promise<string> {
    // For now, use template-based responses
    // TODO: Integrate with real AI service when available

    // Simple keyword-based response selection
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return getAgentTemplate(agentId, 'default', context);
    }

    if (agentId === 'dawn') {
      if (lowerMessage.includes('morning') || lowerMessage.includes('today')) {
        return getAgentTemplate('dawn', 'morning_briefing', context);
      }
    }

    if (agentId === 'atlas') {
      if (lowerMessage.includes('productivity') || lowerMessage.includes('stats')) {
        return getAgentTemplate('atlas', 'weekly_insight', context);
      }
    }

    if (agentId === 'luna') {
      if (lowerMessage.includes('feel') || lowerMessage.includes('mood')) {
        return getAgentTemplate('luna', 'mood_response', { mood: 'neutral' });
      }
      if (lowerMessage.includes('journal') || lowerMessage.includes('write')) {
        return getAgentTemplate('luna', 'evening_prompt', {});
      }
    }

    // Default response
    return getAgentTemplate(agentId, 'default', context);
  }

  /**
   * Send automated message from agent (triggered by events)
   */
  async sendAutomatedMessage(
    userId: string,
    agentId: AgentId,
    trigger: string,
    context: any
  ): Promise<void> {
    const conversation = await this.getOrCreateConversation(userId, agentId);

    const content = getAgentTemplate(agentId, trigger, context);

    const message = await this.sendMessage(
      conversation.id,
      'agent',
      content,
      { trigger, automated: true, context }
    );

    // Emit event
    await this.eventBus.emit(AGENT_EVENTS.MESSAGE, {
      conversationId: conversation.id,
      agentId,
      userId,
      message: content,
      trigger,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a suggestion
   */
  async createSuggestion(
    data: Omit<NewSuggestion, 'id' | 'createdAt'>
  ): Promise<Suggestion> {
    const id = crypto.randomUUID();

    const [suggestion] = await this.db
      .insert(suggestions)
      .values({
        ...data,
        id,
      })
      .returning();

    // Emit event
    await this.eventBus.emit(AGENT_EVENTS.SUGGESTION, {
      suggestionId: suggestion.id,
      agentId: suggestion.agentId as AgentId,
      userId: suggestion.userId,
      type: suggestion.type,
      content: suggestion.content,
      timestamp: Date.now(),
    });

    return suggestion;
  }

  /**
   * Get user's suggestions
   */
  async getSuggestions(
    userId: string,
    status?: 'active' | 'dismissed' | 'completed'
  ): Promise<Suggestion[]> {
    if (status) {
      return await this.db
        .select()
        .from(suggestions)
        .where(
          and(
            eq(suggestions.userId, userId),
            eq(suggestions.status, status)
          )
        )
        .orderBy(desc(suggestions.createdAt));
    }

    return await this.db
      .select()
      .from(suggestions)
      .where(eq(suggestions.userId, userId))
      .orderBy(desc(suggestions.createdAt));
  }

  /**
   * Dismiss a suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<boolean> {
    const result = await this.db
      .update(suggestions)
      .set({ status: 'dismissed' })
      .where(eq(suggestions.id, suggestionId));

    return (result as any).changes > 0;
  }

  /**
   * Complete a suggestion
   */
  async completeSuggestion(suggestionId: string): Promise<boolean> {
    const result = await this.db
      .update(suggestions)
      .set({ status: 'completed' })
      .where(eq(suggestions.id, suggestionId));

    return (result as any).changes > 0;
  }

  /**
   * Generate an insight
   */
  async generateInsight(
    userId: string,
    agentId: AgentId,
    category: string,
    title: string,
    content: string,
    data?: Record<string, unknown>
  ): Promise<Insight> {
    const id = crypto.randomUUID();

    const [insight] = await this.db
      .insert(insights)
      .values({
        id,
        userId,
        agentId,
        category,
        title,
        content,
        data: data ? JSON.stringify(data) : null,
      })
      .returning();

    // Emit event
    await this.eventBus.emit(AGENT_EVENTS.INSIGHT, {
      insightId: insight.id,
      agentId,
      userId,
      category,
      title,
      timestamp: Date.now(),
    });

    return insight;
  }

  /**
   * Get user's insights
   */
  async getInsights(
    userId: string,
    category?: string,
    unreadOnly?: boolean
  ): Promise<Insight[]> {
    const conditions = [eq(insights.userId, userId)];

    if (category) {
      conditions.push(eq(insights.category, category));
    }

    if (unreadOnly) {
      conditions.push(eq(insights.isRead, false));
    }

    return await this.db
      .select()
      .from(insights)
      .where(and(...conditions))
      .orderBy(desc(insights.createdAt));
  }

  /**
   * Mark insight as read
   */
  async markInsightRead(insightId: string): Promise<boolean> {
    const result = await this.db
      .update(insights)
      .set({ isRead: true })
      .where(eq(insights.id, insightId));

    return (result as any).changes > 0;
  }
}

/**
 * Factory function to create AgentService
 */
export function createAgentService(
  db: Database,
  eventBus: IEventBus
): AgentService {
  return new AgentService(db, eventBus);
}
