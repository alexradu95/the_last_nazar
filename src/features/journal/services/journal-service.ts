/**
 * Journal Service
 *
 * Manages journal entries, prompts, and streaks.
 */

import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import type { IEventBus } from '@/core/types/event.types';
import {
  journalEntries,
  dailyPrompts,
  userPromptHistory,
  journalStreaks,
  type JournalEntry,
  type NewJournalEntry,
  type DailyPrompt,
  type JournalStreak,
} from '../schema';
import { JOURNAL_EVENTS } from '../events';

export interface IJournalService {
  // Journal Entries
  createEntry(userId: string, entry: Omit<NewJournalEntry, 'id' | 'userId'>): Promise<JournalEntry>;
  updateEntry(entryId: string, userId: string, updates: Partial<NewJournalEntry>): Promise<JournalEntry>;
  deleteEntry(entryId: string, userId: string): Promise<void>;
  getEntry(entryId: string, userId: string): Promise<JournalEntry | undefined>;
  getUserEntries(userId: string, limit?: number, offset?: number): Promise<JournalEntry[]>;
  getEntriesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  getEntriesByMood(userId: string, mood: number): Promise<JournalEntry[]>;
  searchEntries(userId: string, query: string): Promise<JournalEntry[]>;

  // Streaks
  updateStreak(userId: string): Promise<JournalStreak>;
  getStreak(userId: string): Promise<JournalStreak | undefined>;

  // Prompts
  getDailyPrompt(userId: string): Promise<DailyPrompt | undefined>;
  seedPrompts(): Promise<void>;

  // Analytics
  getMoodTrend(userId: string, days: number): Promise<Array<{ date: Date; avgMood: number }>>;
  getWritingStats(userId: string): Promise<{
    totalEntries: number;
    totalWords: number;
    avgWordsPerEntry: number;
    currentStreak: number;
    longestStreak: number;
    moodDistribution: Record<number, number>;
  }>;
}

export function createJournalService(db: any, eventBus: IEventBus): IJournalService {
  return {
    async createEntry(userId, entry) {
      const id = `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const wordCount = entry.content.trim().split(/\s+/).length;

      const [newEntry] = await db
        .insert(journalEntries)
        .values({
          id,
          userId,
          ...entry,
          wordCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update streak
      await this.updateStreak(userId);

      // Emit event for gamification
      await eventBus.emit(JOURNAL_EVENTS.EMITS.JOURNAL_CREATED, {
        timestamp: Date.now(),
        userId,
        journalId: id,
        wordCount,
        hasMood: !!entry.mood,
        mood: entry.mood,
        tags: entry.tags ? JSON.parse(entry.tags) : undefined,
      });

      return newEntry;
    },

    async updateEntry(entryId, userId, updates) {
      // Verify ownership
      const existing = await this.getEntry(entryId, userId);
      if (!existing) {
        throw new Error('Journal entry not found');
      }

      const updatedData: any = {
        ...updates,
        updatedAt: new Date(),
      };

      // Recalculate word count if content changed
      if (updates.content) {
        updatedData.wordCount = updates.content.trim().split(/\s+/).length;
      }

      const [updated] = await db
        .update(journalEntries)
        .set(updatedData)
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
        .returning();

      await eventBus.emit(JOURNAL_EVENTS.EMITS.JOURNAL_UPDATED, {
        timestamp: Date.now(),
        userId,
        journalId: entryId,
        wordCount: updated.wordCount,
        changes: Object.keys(updates),
      });

      return updated;
    },

    async deleteEntry(entryId, userId) {
      await db
        .delete(journalEntries)
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)));

      await eventBus.emit(JOURNAL_EVENTS.EMITS.JOURNAL_DELETED, {
        timestamp: Date.now(),
        userId,
        journalId: entryId,
      });
    },

    async getEntry(entryId, userId) {
      const result = await db
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.id, entryId), eq(journalEntries.userId, userId)))
        .limit(1);

      return result[0];
    },

    async getUserEntries(userId, limit = 50, offset = 0) {
      return await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt))
        .limit(limit)
        .offset(offset);
    },

    async getEntriesByDateRange(userId, startDate, endDate) {
      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            gte(journalEntries.createdAt, startDate),
            lte(journalEntries.createdAt, endDate)
          )
        )
        .orderBy(desc(journalEntries.createdAt));
    },

    async getEntriesByMood(userId, mood) {
      return await db
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.userId, userId), eq(journalEntries.mood, mood)))
        .orderBy(desc(journalEntries.createdAt));
    },

    async searchEntries(userId, query) {
      const searchPattern = `%${query}%`;

      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            sql`${journalEntries.content} LIKE ${searchPattern} OR ${journalEntries.title} LIKE ${searchPattern}`
          )
        )
        .orderBy(desc(journalEntries.createdAt));
    },

    async updateStreak(userId) {
      // Get or create streak record
      let streak = await this.getStreak(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!streak) {
        const id = `streak-${userId}`;
        const [newStreak] = await db
          .insert(journalStreaks)
          .values({
            id,
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastEntryDate: today,
            totalEntries: 1,
            updatedAt: new Date(),
          })
          .returning();

        await eventBus.emit(JOURNAL_EVENTS.EMITS.STREAK_UPDATED, {
          timestamp: Date.now(),
          userId,
          currentStreak: 1,
          longestStreak: 1,
          isNewRecord: true,
        });

        return newStreak;
      }

      const lastEntry = streak.lastEntryDate ? new Date(streak.lastEntryDate) : null;
      if (lastEntry) {
        lastEntry.setHours(0, 0, 0, 0);
      }

      const daysSinceLastEntry = lastEntry
        ? Math.floor((today.getTime() - lastEntry.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      let newStreak = streak.currentStreak;
      let newLongest = streak.longestStreak;
      let isNewRecord = false;

      if (daysSinceLastEntry === 0) {
        // Same day, no change to streak
      } else if (daysSinceLastEntry === 1) {
        // Consecutive day, increment streak
        newStreak = streak.currentStreak + 1;
        if (newStreak > newLongest) {
          newLongest = newStreak;
          isNewRecord = true;
        }
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }

      const [updated] = await db
        .update(journalStreaks)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastEntryDate: today,
          totalEntries: streak.totalEntries + 1,
          updatedAt: new Date(),
        })
        .where(eq(journalStreaks.userId, userId))
        .returning();

      await eventBus.emit(JOURNAL_EVENTS.EMITS.STREAK_UPDATED, {
        timestamp: Date.now(),
        userId,
        currentStreak: newStreak,
        longestStreak: newLongest,
        isNewRecord,
      });

      return updated;
    },

    async getStreak(userId) {
      const result = await db
        .select()
        .from(journalStreaks)
        .where(eq(journalStreaks.userId, userId))
        .limit(1);

      return result[0];
    },

    async getDailyPrompt(userId) {
      // Get prompts user hasn't seen recently (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPrompts = await db
        .select({ promptId: userPromptHistory.promptId })
        .from(userPromptHistory)
        .where(
          and(
            eq(userPromptHistory.userId, userId),
            gte(userPromptHistory.shownAt, thirtyDaysAgo)
          )
        );

      const recentPromptIds = recentPrompts.map((p) => p.promptId);

      // Get a random prompt not in recent list
      const availablePrompts = await db
        .select()
        .from(dailyPrompts)
        .where(recentPromptIds.length > 0 ? sql`${dailyPrompts.id} NOT IN ${recentPromptIds}` : undefined);

      if (availablePrompts.length === 0) {
        // All prompts have been shown, just pick any random one
        const allPrompts = await db.select().from(dailyPrompts);
        if (allPrompts.length === 0) return undefined;
        return allPrompts[Math.floor(Math.random() * allPrompts.length)];
      }

      const selectedPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

      // Record that we showed this prompt
      const historyId = `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(userPromptHistory).values({
        id: historyId,
        userId,
        promptId: selectedPrompt.id,
        shownAt: new Date(),
        used: false,
      });

      return selectedPrompt;
    },

    async seedPrompts() {
      const prompts: NewDailyPrompt[] = [
        {
          id: 'prompt-1',
          prompt: 'What made you smile today?',
          category: 'gratitude',
          difficulty: 'easy',
        },
        {
          id: 'prompt-2',
          prompt: 'Describe a challenge you overcame recently and how it made you grow.',
          category: 'reflection',
          difficulty: 'medium',
        },
        {
          id: 'prompt-3',
          prompt: 'What are three things you are grateful for right now?',
          category: 'gratitude',
          difficulty: 'easy',
        },
        {
          id: 'prompt-4',
          prompt: 'If you could have dinner with anyone, living or dead, who would it be and why?',
          category: 'creativity',
          difficulty: 'medium',
        },
        {
          id: 'prompt-5',
          prompt: 'What is one goal you want to achieve this month?',
          category: 'goals',
          difficulty: 'easy',
        },
        {
          id: 'prompt-6',
          prompt: 'Reflect on a moment when you felt completely at peace. What were the circumstances?',
          category: 'wellbeing',
          difficulty: 'medium',
        },
        {
          id: 'prompt-7',
          prompt: 'Write about a person who has significantly influenced your life.',
          category: 'reflection',
          difficulty: 'medium',
        },
        {
          id: 'prompt-8',
          prompt: 'What does success mean to you?',
          category: 'reflection',
          difficulty: 'hard',
        },
        {
          id: 'prompt-9',
          prompt: 'Describe your perfect day from start to finish.',
          category: 'creativity',
          difficulty: 'easy',
        },
        {
          id: 'prompt-10',
          prompt: 'What is something you learned about yourself this week?',
          category: 'reflection',
          difficulty: 'easy',
        },
      ];

      for (const prompt of prompts) {
        const existing = await db
          .select()
          .from(dailyPrompts)
          .where(eq(dailyPrompts.id, prompt.id))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(dailyPrompts).values(prompt);
        }
      }

      console.log('[Journal] Seeded prompts successfully');
    },

    async getMoodTrend(userId, days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await this.getEntriesByDateRange(userId, startDate, new Date());

      // Group by date and calculate average mood
      const moodByDate = new Map<string, { sum: number; count: number }>();

      for (const entry of entries) {
        if (entry.mood === null) continue;

        const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
        const current = moodByDate.get(dateKey) ?? { sum: 0, count: 0 };
        moodByDate.set(dateKey, {
          sum: current.sum + entry.mood,
          count: current.count + 1,
        });
      }

      return Array.from(moodByDate.entries()).map(([date, data]) => ({
        date: new Date(date),
        avgMood: data.sum / data.count,
      }));
    },

    async getWritingStats(userId) {
      const entries = await this.getUserEntries(userId, 10000, 0);
      const streak = await this.getStreak(userId);

      const totalEntries = entries.length;
      const totalWords = entries.reduce((sum, e) => sum + e.wordCount, 0);
      const avgWordsPerEntry = totalEntries > 0 ? totalWords / totalEntries : 0;

      const moodDistribution: Record<number, number> = {};
      for (const entry of entries) {
        if (entry.mood !== null) {
          moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
        }
      }

      return {
        totalEntries,
        totalWords,
        avgWordsPerEntry: Math.round(avgWordsPerEntry),
        currentStreak: streak?.currentStreak ?? 0,
        longestStreak: streak?.longestStreak ?? 0,
        moodDistribution,
      };
    },
  };
}
