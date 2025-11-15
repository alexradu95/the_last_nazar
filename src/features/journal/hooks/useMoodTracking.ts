/**
 * useMoodTracking Hook
 *
 * React hook for mood tracking operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Mood } from '../schema';
import type { MoodEntry, MoodInsights } from '../types';

export const useMoodTracking = (userId: string) => {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodData = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/journal/mood?userId=${userId}&days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch mood data');

      const data = await response.json();
      setMoodHistory(data.history);
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const logMood = async (mood: Mood, note?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/journal/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mood, note }),
      });

      if (!response.ok) throw new Error('Failed to log mood');

      await fetchMoodData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMoodTrends = useCallback(() => {
    return insights?.moodTrends || [];
  }, [insights]);

  const refresh = useCallback(async () => {
    await fetchMoodData();
  }, [fetchMoodData]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    moodHistory,
    insights,
    loading,
    error,
    logMood,
    getMoodTrends,
    refresh,
  };
};
