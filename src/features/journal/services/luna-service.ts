/**
 * Luna AI Service
 *
 * Provides AI-powered insights, chat, and personalized prompts for journaling.
 * Powered by OpenRouter AI for intelligent analysis and conversation.
 */

import { eq, and, desc, gte } from 'drizzle-orm';
import type { IEventBus } from '@/core/types/event.types';
import { generateCompletion } from '@/lib/ai/openrouter-client';
import {
  lunaInsights,
  lunaConversations,
  lunaAnalysisCache,
  lunaPrompts,
  type LunaInsight,
  type NewLunaInsight,
  type LunaConversation,
  type NewLunaConversation,
} from '../schema/luna-schema';
import type { JournalEntry } from '../schema';

export interface MoodTrendAnalysis {
  averageMood: number;
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  insights: string[];
}

export interface WritingPattern {
  averageWordCount: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  consistency: number; // 0-1 scale
  topics: Array<{ topic: string; frequency: number }>;
}

export interface ILunaService {
  // Insights
  generateInsight(userId: string, entries: JournalEntry[]): Promise<LunaInsight>;
  getUserInsights(userId: string, limit?: number): Promise<LunaInsight[]>;
  markInsightAsRead(insightId: string, userId: string): Promise<void>;

  // Analysis
  analyzeMoodTrend(userId: string, entries: JournalEntry[], days: number): Promise<MoodTrendAnalysis>;
  analyzeWritingPattern(userId: string, entries: JournalEntry[]): Promise<WritingPattern>;
  generateWeeklySummary(userId: string, entries: JournalEntry[]): Promise<string>;

  // Chat
  sendMessage(userId: string, message: string, entryId?: string): Promise<string>;
  getConversationHistory(userId: string, limit?: number): Promise<LunaConversation[]>;
  clearConversation(userId: string): Promise<void>;

  // Personalized Prompts
  generatePersonalizedPrompt(userId: string, entries: JournalEntry[]): Promise<string>;
  getUnusedPrompts(userId: string): Promise<Array<{ id: string; prompt: string; reasoning: string }>>;
}

export function createLunaService(db: any, eventBus: IEventBus): ILunaService {
  return {
    async generateInsight(userId, entries) {
      const recentEntries = entries.slice(0, 7);
      const entryIds = recentEntries.map(e => e.id);

      // Prepare context for AI
      const entriesContext = recentEntries
        .map((entry, index) => {
          const moodText = entry.mood ? `Mood: ${entry.mood}/5` : 'No mood recorded';
          const date = new Date(entry.createdAt).toLocaleDateString();
          return `Entry ${index + 1} (${date}, ${moodText}):\n${entry.content.slice(0, 500)}`;
        })
        .join('\n\n---\n\n');

      const systemPrompt = `You are Luna, an empathetic AI journaling companion. Analyze the user's recent journal entries and provide a thoughtful insight.

Your insights should:
- Be warm, supportive, and non-judgmental
- Identify meaningful patterns or themes
- Offer gentle encouragement or reflection prompts
- Be concise (2-3 sentences)
- Avoid being overly clinical or diagnostic

Based on the entries, determine the insight type and provide a title and content.`;

      const userPrompt = `Analyze these recent journal entries and provide an insight:\n\n${entriesContext}\n\nProvide your response in this format:
TYPE: [mood_trend|pattern|suggestion|reflection|milestone]
TITLE: [Short, engaging title]
CONTENT: [Your 2-3 sentence insight]`;

      try {
        const aiResponse = await generateCompletion(
          [{ role: 'user', content: userPrompt }],
          {
            systemPrompt,
            maxTokens: 300,
            temperature: 0.7,
          }
        );

        // Parse AI response
        const typeMatch = aiResponse.match(/TYPE:\s*(\w+)/i);
        const titleMatch = aiResponse.match(/TITLE:\s*(.+)/i);
        const contentMatch = aiResponse.match(/CONTENT:\s*(.+)/is);

        const type = (typeMatch?.[1] as 'mood_trend' | 'pattern' | 'suggestion' | 'reflection' | 'milestone') || 'reflection';
        const title = titleMatch?.[1]?.trim() || 'Weekly Reflection';
        const content = contentMatch?.[1]?.trim() || aiResponse;

        const id = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const [insight] = await db
          .insert(lunaInsights)
          .values({
            id,
            userId,
            type,
            title,
            content,
            relatedEntryIds: JSON.stringify(entryIds),
            isRead: false,
            createdAt: new Date(),
          })
          .returning();

        return insight;
      } catch (error) {
        console.error('[Luna] Failed to generate AI insight:', error);

        // Fallback to simple insight if AI fails
        const avgMood = recentEntries
          .filter(e => e.mood !== null)
          .reduce((sum, e) => sum + (e.mood ?? 0), 0) / recentEntries.length;

        const id = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const [insight] = await db
          .insert(lunaInsights)
          .values({
            id,
            userId,
            type: 'reflection',
            title: 'Weekly Check-In',
            content: `Your average mood this week was ${avgMood.toFixed(1)}/5. Keep reflecting on your experiences.`,
            relatedEntryIds: JSON.stringify(entryIds),
            isRead: false,
            createdAt: new Date(),
          })
          .returning();

        return insight;
      }
    },

    async getUserInsights(userId, limit = 10) {
      return await db
        .select()
        .from(lunaInsights)
        .where(eq(lunaInsights.userId, userId))
        .orderBy(desc(lunaInsights.createdAt))
        .limit(limit);
    },

    async markInsightAsRead(insightId, userId) {
      await db
        .update(lunaInsights)
        .set({ isRead: true })
        .where(and(eq(lunaInsights.id, insightId), eq(lunaInsights.userId, userId)));
    },

    async analyzeMoodTrend(userId, entries, days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentEntries = entries.filter(
        e => new Date(e.createdAt) >= cutoffDate && e.mood !== null
      );

      if (recentEntries.length === 0) {
        return {
          averageMood: 3,
          trend: 'stable',
          trendPercentage: 0,
          insights: ['Not enough data to analyze mood trends yet.'],
        };
      }

      const avgMood = recentEntries.reduce((sum, e) => sum + (e.mood ?? 0), 0) / recentEntries.length;

      // Compare first half vs second half
      const midpoint = Math.floor(recentEntries.length / 2);
      const firstHalf = recentEntries.slice(0, midpoint);
      const secondHalf = recentEntries.slice(midpoint);

      const firstHalfAvg = firstHalf.reduce((sum, e) => sum + (e.mood ?? 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, e) => sum + (e.mood ?? 0), 0) / secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;
      const trendPercentage = (difference / firstHalfAvg) * 100;

      let trend: 'improving' | 'declining' | 'stable';
      if (trendPercentage > 10) trend = 'improving';
      else if (trendPercentage < -10) trend = 'declining';
      else trend = 'stable';

      const insights: string[] = [];
      if (trend === 'improving') {
        insights.push('Your mood has been improving over time. Great progress!');
      } else if (trend === 'declining') {
        insights.push('Your mood seems to be declining. Consider what might be affecting you.');
      } else {
        insights.push('Your mood has been stable recently.');
      }

      return {
        averageMood: Math.round(avgMood * 10) / 10,
        trend,
        trendPercentage: Math.round(trendPercentage),
        insights,
      };
    },

    async analyzeWritingPattern(userId, entries) {
      if (entries.length === 0) {
        return {
          averageWordCount: 0,
          preferredTime: 'evening' as const,
          consistency: 0,
          topics: [],
        };
      }

      // Calculate average word count
      const avgWordCount = Math.round(
        entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length
      );

      // Determine preferred writing time
      const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      entries.forEach(entry => {
        const hour = new Date(entry.createdAt).getHours();
        if (hour >= 5 && hour < 12) timeSlots.morning++;
        else if (hour >= 12 && hour < 17) timeSlots.afternoon++;
        else if (hour >= 17 && hour < 21) timeSlots.evening++;
        else timeSlots.night++;
      });

      const preferredTime = Object.entries(timeSlots).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0] as 'morning' | 'afternoon' | 'evening' | 'night';

      // Calculate consistency (how regularly they write)
      const dates = entries.map(e => new Date(e.createdAt).toDateString());
      const uniqueDates = new Set(dates);
      const daysCovered = uniqueDates.size;
      const totalDays = entries.length > 0
        ? Math.ceil(
            (new Date(entries[0].createdAt).getTime() -
              new Date(entries[entries.length - 1].createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 1;
      const consistency = Math.min(daysCovered / totalDays, 1);

      return {
        averageWordCount: avgWordCount,
        preferredTime,
        consistency: Math.round(consistency * 100) / 100,
        topics: [], // Would use NLP in production
      };
    },

    async generateWeeklySummary(userId, entries) {
      // Placeholder - would use AI in production
      const wordCount = entries.reduce((sum, e) => sum + e.wordCount, 0);
      const avgMood = entries
        .filter(e => e.mood !== null)
        .reduce((sum, e) => sum + (e.mood ?? 0), 0) / entries.length;

      return `This week you wrote ${entries.length} journal entries totaling ${wordCount.toLocaleString()} words. Your average mood was ${avgMood.toFixed(1)}/5. Keep up the great work on your journaling journey!`;
    },

    async sendMessage(userId, message, entryId) {
      // Save user message
      const userMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(lunaConversations).values({
        id: userMsgId,
        userId,
        role: 'user',
        content: message,
        relatedEntryId: entryId,
        createdAt: new Date(),
      });

      try {
        // Get recent conversation history (last 10 messages)
        const conversationHistory = await db
          .select()
          .from(lunaConversations)
          .where(eq(lunaConversations.userId, userId))
          .orderBy(desc(lunaConversations.createdAt))
          .limit(10);

        // Reverse to get chronological order
        const recentMessages = conversationHistory.reverse();

        // Build conversation context
        const conversationMessages = recentMessages
          .slice(0, -1) // Exclude the message we just saved
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }));

        // Add current message
        conversationMessages.push({ role: 'user', content: message });

        const systemPrompt = `You are Luna, an empathetic AI journaling companion. You help users reflect on their thoughts and feelings through thoughtful conversation.

Your role is to:
- Listen actively and respond with empathy
- Ask gentle, open-ended questions to encourage deeper reflection
- Validate emotions without being dismissive
- Offer insights when appropriate, but don't be prescriptive
- Remember the context of the conversation
- Be warm, supportive, and non-judgmental

Keep your responses concise (2-4 sentences) and conversational.`;

        // Generate AI response
        const aiResponse = await generateCompletion(conversationMessages, {
          systemPrompt,
          maxTokens: 200,
          temperature: 0.8,
        });

        const response = aiResponse.trim();

        // Save assistant message
        const assistantMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(lunaConversations).values({
          id: assistantMsgId,
          userId,
          role: 'assistant',
          content: response,
          relatedEntryId: entryId,
          createdAt: new Date(),
        });

        return response;
      } catch (error) {
        console.error('[Luna] Failed to generate AI response:', error);

        // Fallback response if AI fails
        const fallbackResponse = "I'm here to listen. Could you tell me more about what's on your mind?";

        const assistantMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(lunaConversations).values({
          id: assistantMsgId,
          userId,
          role: 'assistant',
          content: fallbackResponse,
          relatedEntryId: entryId,
          createdAt: new Date(),
        });

        return fallbackResponse;
      }
    },

    async getConversationHistory(userId, limit = 50) {
      return await db
        .select()
        .from(lunaConversations)
        .where(eq(lunaConversations.userId, userId))
        .orderBy(desc(lunaConversations.createdAt))
        .limit(limit);
    },

    async clearConversation(userId) {
      await db
        .delete(lunaConversations)
        .where(eq(lunaConversations.userId, userId));
    },

    async generatePersonalizedPrompt(userId, entries) {
      try {
        // Get recent entries for context
        const recentEntries = entries.slice(0, 5);

        // Prepare context from entries
        const entriesContext = recentEntries.length > 0
          ? recentEntries
              .map((entry, index) => {
                const moodText = entry.mood ? `Mood: ${entry.mood}/5` : 'No mood';
                const date = new Date(entry.createdAt).toLocaleDateString();
                return `Entry ${index + 1} (${date}, ${moodText}):\n${entry.content.slice(0, 300)}...`;
              })
              .join('\n\n')
          : 'No recent entries available.';

        const systemPrompt = `You are Luna, an AI journaling companion. Generate a personalized journaling prompt based on the user's recent entries.

Your prompts should:
- Be thoughtful and encourage deep reflection
- Connect to patterns or themes you notice in their entries
- Be open-ended and non-judgmental
- Help them explore emotions, experiences, or insights
- Be concise (1-2 sentences)

Also provide a brief reasoning (1 sentence) explaining why this prompt might be helpful for them.`;

        const userPrompt = `Based on these recent journal entries, create a personalized journaling prompt:

${entriesContext}

Provide your response in this format:
PROMPT: [Your journaling prompt question]
REASONING: [Why this prompt is relevant to their recent entries]`;

        const aiResponse = await generateCompletion(
          [{ role: 'user', content: userPrompt }],
          {
            systemPrompt,
            maxTokens: 200,
            temperature: 0.8,
          }
        );

        // Parse AI response
        const promptMatch = aiResponse.match(/PROMPT:\s*(.+)/i);
        const reasoningMatch = aiResponse.match(/REASONING:\s*(.+)/is);

        const prompt = promptMatch?.[1]?.trim() || aiResponse.split('\n')[0];
        const reasoning = reasoningMatch?.[1]?.trim() || 'This prompt is tailored to your recent reflections.';

        const id = `luna-prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(lunaPrompts).values({
          id,
          userId,
          prompt,
          reasoning,
          isUsed: false,
          createdAt: new Date(),
        });

        return prompt;
      } catch (error) {
        console.error('[Luna] Failed to generate AI prompt:', error);

        // Fallback to thoughtful default prompts
        const fallbackPrompts = [
          {
            prompt: 'What challenged you most this week, and what did you learn from it?',
            reasoning: 'Reflecting on challenges helps build resilience and self-awareness.',
          },
          {
            prompt: 'Describe a moment when you felt truly yourself.',
            reasoning: 'Exploring authentic moments deepens self-understanding.',
          },
          {
            prompt: 'What are you grateful for today, and why does it matter to you?',
            reasoning: 'Gratitude practice enhances well-being and perspective.',
          },
          {
            prompt: 'What patterns do you notice in your thoughts or feelings lately?',
            reasoning: 'Recognizing patterns is the first step to meaningful change.',
          },
        ];

        const selected = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];

        const id = `luna-prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(lunaPrompts).values({
          id,
          userId,
          prompt: selected.prompt,
          reasoning: selected.reasoning,
          isUsed: false,
          createdAt: new Date(),
        });

        return selected.prompt;
      }
    },

    async getUnusedPrompts(userId) {
      const prompts = await db
        .select()
        .from(lunaPrompts)
        .where(and(eq(lunaPrompts.userId, userId), eq(lunaPrompts.isUsed, false)))
        .orderBy(desc(lunaPrompts.createdAt))
        .limit(5);

      return prompts.map(p => ({
        id: p.id,
        prompt: p.prompt,
        reasoning: p.reasoning ?? '',
      }));
    },
  };
}
