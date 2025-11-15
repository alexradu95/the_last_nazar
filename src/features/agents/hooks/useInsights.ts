/**
 * useInsights Hook
 *
 * React hook for managing agent insights
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Insight } from '../schema';

interface UseInsightsOptions {
  userId: string;
  category?: string;
  unreadOnly?: boolean;
  autoLoad?: boolean;
}

interface UseInsightsReturn {
  insights: Insight[];
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInsights({
  userId,
  category,
  unreadOnly = false,
  autoLoad = true,
}: UseInsightsOptions): UseInsightsReturn {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (category) {
        params.append('category', category);
      }
      if (unreadOnly) {
        params.append('unreadOnly', 'true');
      }

      const response = await fetch(`/api/agents/insights?${params}`);

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, category, unreadOnly]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        setError(null);

        // Optimistically update UI
        setInsights((prev) =>
          prev.map((insight) =>
            insight.id === id ? { ...insight, isRead: true } : insight
          )
        );

        // TODO: Implement mark as read API endpoint
        // For now, just update local state

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark as read');
        console.error('Error marking insight as read:', err);
        // Reload on error
        await loadInsights();
      }
    },
    [loadInsights]
  );

  const refresh = useCallback(async () => {
    await loadInsights();
  }, [loadInsights]);

  // Auto-load insights
  useEffect(() => {
    if (autoLoad && userId) {
      loadInsights();
    }
  }, [autoLoad, userId, loadInsights]);

  return {
    insights,
    loading,
    error,
    markAsRead,
    refresh,
  };
}
