/**
 * useJournal Hook
 *
 * React hook for journal operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalStats } from '../schema';
import type { CreateJournalEntryInput, UpdateJournalEntryInput, JournalFilters } from '../types';

export const useJournal = (userId: string, filters?: JournalFilters) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ userId });
      if (filters?.mood) params.append('mood', filters.mood);
      if (filters?.tag) params.append('tag', filters.tag);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.searchQuery) params.append('search', filters.searchQuery);

      const response = await fetch(`/api/journal?${params}`);
      if (!response.ok) throw new Error('Failed to fetch entries');

      const data = await response.json();
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/journal/stats?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [userId]);

  const createEntry = async (data: Omit<CreateJournalEntryInput, 'userId'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) throw new Error('Failed to create entry');

      const result = await response.json();
      await fetchEntries();
      await fetchStats();
      return result.entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (id: string, data: UpdateJournalEntryInput) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update entry');

      const result = await response.json();
      await fetchEntries();
      return result.entry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/journal?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      await fetchEntries();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTodayEntry = async () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(entry => entry.date === today) || null;
  };

  const refresh = useCallback(async () => {
    await Promise.all([fetchEntries(), fetchStats()]);
  }, [fetchEntries, fetchStats]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    entries,
    stats,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    getTodayEntry,
    refresh,
  };
};
