/**
 * Journal Service
 *
 * Business logic for journal feature
 */

import { eq, and, desc, sql, like, gte, lte } from 'drizzle-orm';
import { journalEntries, journalPrompts, journalInsights } from '../schema';
import type { JournalEntry, NewJournalEntry, JournalPrompt, Mood } from '../schema';
import type {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
  JournalFilters,
  JournalStats,
  StreakInfo,
  MoodInsights,
  MoodEntry,
  JournalServiceResult,
} from '../types';

/**
 * Generate unique ID
 */
const generateId = () => `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Calculate word count from text
 */
const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Create journal service
 */
export const createJournalService = (db: any, eventBus: any) => {
  return {
    /**
     * Create a new journal entry
     */
    async create(input: CreateJournalEntryInput): Promise<JournalServiceResult<JournalEntry>> {
      try {
        const wordCount = calculateWordCount(input.content);
        const date = input.date || getTodayDate();

        const newEntry: NewJournalEntry = {
          id: generateId(),
          userId: input.userId,
          title: input.title || null,
          content: input.content,
          mood: input.mood || null,
          wordCount,
          isPrivate: input.isPrivate ?? true,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          date,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const [entry] = await db.insert(journalEntries).values(newEntry).returning();

        // Emit event
        eventBus.emit('journal.created', {
          userId: input.userId,
          entryId: entry.id,
          wordCount,
          mood: input.mood,
        });

        return { success: true, data: entry };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    /**
     * Find entry by ID
     */
    async findById(id: string): Promise<JournalEntry | null> {
      const results = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id));

      return results[0] || null;
    },

    /**
     * Find all entries for a user
     */
    async findByUserId(userId: string, filters?: JournalFilters): Promise<JournalEntry[]> {
      let query = db.select().from(journalEntries).where(eq(journalEntries.userId, userId));

      // Apply filters
      if (filters?.mood) {
        query = query.where(eq(journalEntries.mood, filters.mood));
      }

      if (filters?.startDate) {
        query = query.where(gte(journalEntries.date, filters.startDate));
      }

      if (filters?.endDate) {
        query = query.where(lte(journalEntries.date, filters.endDate));
      }

      if (filters?.searchQuery) {
        query = query.where(
          sql`${journalEntries.content} LIKE ${`%${filters.searchQuery}%`}`
        );
      }

      const results = await query.orderBy(desc(journalEntries.createdAt));
      return results;
    },

    /**
     * Update an entry
     */
    async update(
      id: string,
      data: UpdateJournalEntryInput
    ): Promise<JournalServiceResult<JournalEntry>> {
      try {
        const updateData: Partial<JournalEntry> = {
          ...data,
          updatedAt: new Date(),
        };

        if (data.content) {
          updateData.wordCount = calculateWordCount(data.content);
        }

        if (data.tags) {
          updateData.tags = JSON.stringify(data.tags);
        }

        const [entry] = await db
          .update(journalEntries)
          .set(updateData)
          .where(eq(journalEntries.id, id))
          .returning();

        if (!entry) {
          return { success: false, error: 'Entry not found' };
        }

        // Emit event
        eventBus.emit('journal.updated', {
          entryId: id,
          updates: Object.keys(data),
        });

        return { success: true, data: entry };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },

    /**
     * Delete an entry
     */
    async delete(id: string): Promise<boolean> {
      const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));

      if (result.rowsAffected > 0) {
        eventBus.emit('journal.deleted', { entryId: id });
        return true;
      }

      return false;
    },

    /**
     * Get entries by date
     */
    async getEntriesByDate(userId: string, date: string): Promise<JournalEntry[]> {
      return await db
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, date)))
        .orderBy(desc(journalEntries.createdAt));
    },

    /**
     * Get entries by date range
     */
    async getEntriesByDateRange(
      userId: string,
      startDate: string,
      endDate: string
    ): Promise<JournalEntry[]> {
      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            gte(journalEntries.date, startDate),
            lte(journalEntries.date, endDate)
          )
        )
        .orderBy(desc(journalEntries.date));
    },

    /**
     * Get entry for today
     */
    async getEntryForToday(userId: string): Promise<JournalEntry | null> {
      const today = getTodayDate();
      const results = await this.getEntriesByDate(userId, today);
      return results[0] || null;
    },

    /**
     * Log mood
     */
    async logMood(userId: string, mood: Mood, note?: string): Promise<void> {
      eventBus.emit('mood.logged', {
        userId,
        mood,
        note,
        timestamp: new Date(),
      });
    },

    /**
     * Get mood history
     */
    async getMoodHistory(userId: string, days: number = 30): Promise<MoodEntry[]> {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const entries = await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            gte(journalEntries.date, startDateStr),
            sql`${journalEntries.mood} IS NOT NULL`
          )
        )
        .orderBy(desc(journalEntries.date));

      return entries
        .filter((e: JournalEntry) => e.mood)
        .map((e: JournalEntry) => ({
          date: e.date,
          mood: e.mood!,
        }));
    },

    /**
     * Get mood insights
     */
    async getMoodInsights(userId: string): Promise<MoodInsights> {
      const moodHistory = await this.getMoodHistory(userId, 90);

      // Calculate dominant mood
      const moodCounts: Record<string, number> = {};
      moodHistory.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      const dominantMood = (Object.keys(moodCounts).sort(
        (a, b) => moodCounts[b] - moodCounts[a]
      )[0] || 'calm') as Mood;

      // Get correlations
      const happyDays = moodHistory
        .filter(e => e.mood === 'happy' || e.mood === 'excited' || e.mood === 'grateful')
        .map(e => e.date);

      const stressedDays = moodHistory
        .filter(e => e.mood === 'stressed' || e.mood === 'angry' || e.mood === 'sad')
        .map(e => e.date);

      return {
        dominantMood,
        moodTrends: moodHistory.slice(0, 30),
        moodCorrelations: {
          happyDays: happyDays.slice(0, 10),
          stressedDays: stressedDays.slice(0, 10),
        },
      };
    },

    /**
     * Search entries
     */
    async searchEntries(userId: string, query: string): Promise<JournalEntry[]> {
      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            sql`${journalEntries.content} LIKE ${`%${query}%`}`
          )
        )
        .orderBy(desc(journalEntries.createdAt));
    },

    /**
     * Get entries by tag
     */
    async getEntriesByTag(userId: string, tag: string): Promise<JournalEntry[]> {
      return await db
        .select()
        .from(journalEntries)
        .where(
          and(
            eq(journalEntries.userId, userId),
            sql`${journalEntries.tags} LIKE ${`%"${tag}"%`}`
          )
        )
        .orderBy(desc(journalEntries.createdAt));
    },

    /**
     * Get entries by mood
     */
    async getEntriesByMood(userId: string, mood: Mood): Promise<JournalEntry[]> {
      return await db
        .select()
        .from(journalEntries)
        .where(and(eq(journalEntries.userId, userId), eq(journalEntries.mood, mood)))
        .orderBy(desc(journalEntries.createdAt));
    },

    /**
     * Get daily prompt
     */
    async getDailyPrompt(): Promise<JournalPrompt> {
      const prompts = await db
        .select()
        .from(journalPrompts)
        .where(eq(journalPrompts.isActive, true));

      if (prompts.length === 0) {
        // Return default prompt if none exist
        return {
          id: 'default',
          category: 'reflection',
          prompt: 'What did you learn about yourself today?',
          description: 'Reflect on your personal growth',
          isActive: true,
          usageCount: 0,
          createdAt: new Date(),
        };
      }

      // Return random prompt
      return prompts[Math.floor(Math.random() * prompts.length)];
    },

    /**
     * Get prompts by category
     */
    async getPromptsByCategory(category: string): Promise<JournalPrompt[]> {
      return await db
        .select()
        .from(journalPrompts)
        .where(and(eq(journalPrompts.category, category), eq(journalPrompts.isActive, true)));
    },

    /**
     * Mark prompt as used
     */
    async markPromptUsed(promptId: string): Promise<void> {
      await db
        .update(journalPrompts)
        .set({ usageCount: sql`${journalPrompts.usageCount} + 1` })
        .where(eq(journalPrompts.id, promptId));
    },

    /**
     * Get journal statistics
     */
    async getJournalStats(userId: string): Promise<JournalStats> {
      const entries = await this.findByUserId(userId);

      const totalEntries = entries.length;
      const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
      const averageWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

      // Calculate mood distribution
      const moodDistribution: Record<Mood, number> = {
        happy: 0,
        sad: 0,
        stressed: 0,
        excited: 0,
        calm: 0,
        tired: 0,
        angry: 0,
        grateful: 0,
      };

      entries.forEach(entry => {
        if (entry.mood) {
          moodDistribution[entry.mood]++;
        }
      });

      // Calculate entries by month
      const entriesByMonth: Record<string, number> = {};
      entries.forEach(entry => {
        const month = entry.date.substring(0, 7); // YYYY-MM
        entriesByMonth[month] = (entriesByMonth[month] || 0) + 1;
      });

      const streak = await this.getWritingStreak(userId);

      return {
        totalEntries,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        totalWords,
        averageWordsPerEntry,
        moodDistribution,
        entriesByMonth,
      };
    },

    /**
     * Get writing streak
     */
    async getWritingStreak(userId: string): Promise<StreakInfo> {
      const entries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.date));

      if (entries.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastEntryDate: null,
        };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Get unique dates
      const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse();

      // Check if there's an entry today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterdayStr) {
        currentStreak = 1;
        let checkDate = new Date(uniqueDates[0]);

        for (let i = 1; i < uniqueDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const expectedDate = checkDate.toISOString().split('T')[0];

          if (uniqueDates[i] === expectedDate) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.round(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      longestStreak = Math.max(longestStreak, currentStreak, 1);

      return {
        currentStreak,
        longestStreak,
        lastEntryDate: entries[0].date,
      };
    },

    /**
     * Generate insight (placeholder for Luna integration)
     */
    async generateInsight(entryId: string): Promise<string> {
      // This will be implemented when Luna agent is available
      return 'Reflection insight will be generated by Luna agent';
    },

    /**
     * Get insights for user
     */
    async getInsights(userId: string, unreadOnly: boolean = false): Promise<any[]> {
      let query = db.select().from(journalInsights).where(eq(journalInsights.userId, userId));

      if (unreadOnly) {
        query = query.where(eq(journalInsights.isRead, false));
      }

      return await query.orderBy(desc(journalInsights.createdAt));
    },

    /**
     * Seed journal prompts
     */
    async seedPrompts(): Promise<void> {
      const existingPrompts = await db.select().from(journalPrompts);

      if (existingPrompts.length > 0) {
        return; // Already seeded
      }

      const prompts = [
        // Reflection
        {
          id: 'prompt_reflection_1',
          category: 'reflection',
          prompt: 'What did you learn about yourself today?',
          description: 'Reflect on personal growth and self-discovery',
        },
        {
          id: 'prompt_reflection_2',
          category: 'reflection',
          prompt: 'What would you do differently if you could redo today?',
          description: 'Think about lessons learned',
        },
        {
          id: 'prompt_reflection_3',
          category: 'reflection',
          prompt: 'What challenged you today, and how did you respond?',
          description: 'Examine your resilience and problem-solving',
        },

        // Gratitude
        {
          id: 'prompt_gratitude_1',
          category: 'gratitude',
          prompt: "What are three things you're grateful for today?",
          description: 'Practice gratitude and appreciation',
        },
        {
          id: 'prompt_gratitude_2',
          category: 'gratitude',
          prompt: 'Who made a positive impact on your day?',
          description: 'Acknowledge the people in your life',
        },
        {
          id: 'prompt_gratitude_3',
          category: 'gratitude',
          prompt: 'What small moment brought you joy?',
          description: 'Find happiness in the little things',
        },

        // Growth
        {
          id: 'prompt_growth_1',
          category: 'growth',
          prompt: 'What skill or habit are you working to improve?',
          description: 'Track your personal development',
        },
        {
          id: 'prompt_growth_2',
          category: 'growth',
          prompt: "What's one step you took toward your goals today?",
          description: 'Celebrate progress and momentum',
        },
        {
          id: 'prompt_growth_3',
          category: 'growth',
          prompt: 'What feedback did you receive, and how will you use it?',
          description: 'Learn from constructive criticism',
        },

        // Creativity
        {
          id: 'prompt_creativity_1',
          category: 'creativity',
          prompt: 'If today was a movie, what genre would it be?',
          description: 'Use metaphors to process your day',
        },
        {
          id: 'prompt_creativity_2',
          category: 'creativity',
          prompt: 'Describe your day using only metaphors.',
          description: 'Practice creative expression',
        },
        {
          id: 'prompt_creativity_3',
          category: 'creativity',
          prompt: 'What would your future self say about today?',
          description: 'Gain perspective on the present',
        },
      ];

      for (const prompt of prompts) {
        await db.insert(journalPrompts).values({
          ...prompt,
          isActive: true,
          usageCount: 0,
          createdAt: new Date(),
        });
      }
    },
  };
};
