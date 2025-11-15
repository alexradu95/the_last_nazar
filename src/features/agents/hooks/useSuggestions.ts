/**
 * useSuggestions Hook
 *
 * React hook for managing agent suggestions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Suggestion } from '../schema';

interface UseSuggestionsOptions {
  userId: string;
  status?: 'active' | 'dismissed' | 'completed';
  autoLoad?: boolean;
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  dismissSuggestion: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSuggestions({
  userId,
  status,
  autoLoad = true,
}: UseSuggestionsOptions): UseSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/agents/suggestions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to load suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
      console.error('Error loading suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, status]);

  const dismissSuggestion = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const response = await fetch(`/api/agents/suggestions/${id}/dismiss`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to dismiss suggestion');
        }

        // Update local state optimistically
        setSuggestions((prev) =>
          prev.map((suggestion) =>
            suggestion.id === id
              ? { ...suggestion, status: 'dismissed' }
              : suggestion
          )
        );

        // Reload to ensure consistency
        await loadSuggestions();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to dismiss suggestion'
        );
        console.error('Error dismissing suggestion:', err);
      }
    },
    [loadSuggestions]
  );

  const refresh = useCallback(async () => {
    await loadSuggestions();
  }, [loadSuggestions]);

  // Auto-load suggestions
  useEffect(() => {
    if (autoLoad && userId) {
      loadSuggestions();
    }
  }, [autoLoad, userId, loadSuggestions]);

  return {
    suggestions,
    loading,
    error,
    dismissSuggestion,
    refresh,
  };
}
