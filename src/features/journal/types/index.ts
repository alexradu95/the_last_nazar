/**
 * Journal Feature Types
 */

import type { Mood, PromptCategory } from '../schema';

/**
 * Journal statistics
 */
export type JournalStats = {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  totalWords: number;
  averageWordsPerEntry: number;
  moodDistribution: Record<Mood, number>;
  entriesByMonth: Record<string, number>;
};

/**
 * Mood insights
 */
export type MoodInsights = {
  dominantMood: Mood;
  moodTrends: Array<{ date: string; mood: Mood }>;
  moodCorrelations: {
    happyDays: string[];
    stressedDays: string[];
  };
};

/**
 * Mood entry
 */
export type MoodEntry = {
  date: string;
  mood: Mood;
  note?: string;
};

/**
 * Journal filters
 */
export type JournalFilters = {
  mood?: Mood;
  tag?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
};

/**
 * Streak information
 */
export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
};

/**
 * Journal creation input
 */
export type CreateJournalEntryInput = {
  userId: string;
  title?: string;
  content: string;
  mood?: Mood;
  tags?: string[];
  isPrivate?: boolean;
  date?: string; // Defaults to today
};

/**
 * Journal update input
 */
export type UpdateJournalEntryInput = {
  title?: string;
  content?: string;
  mood?: Mood;
  tags?: string[];
  isPrivate?: boolean;
};

/**
 * Service result types
 */
export type JournalServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
