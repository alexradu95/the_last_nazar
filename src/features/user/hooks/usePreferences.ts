/**
 * usePreferences Hook
 *
 * React hook for user preferences management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences } from '../types';

interface UsePreferencesResult {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  updatePreference: (key: string, value: unknown) => Promise<void>;
  updateMultiple: (prefs: Record<string, unknown>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePreferences(userId: string): UsePreferencesResult {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/preferences`);

      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[usePreferences] Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updatePreference = useCallback(
    async (key: string, value: unknown) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const newPrefs = { ...preferences, [key]: value };

        const response = await fetch(`/api/users/${userId}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: newPrefs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preference');
        }

        const data = await response.json();
        setPreferences(data.preferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[usePreferences] Error updating preference:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, preferences]
  );

  const updateMultiple = useCallback(
    async (prefs: Record<string, unknown>) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const newPrefs = { ...preferences, ...prefs };

        const response = await fetch(`/api/users/${userId}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            preferences: newPrefs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }

        const data = await response.json();
        setPreferences(data.preferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[usePreferences] Error updating preferences:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, preferences]
  );

  const refresh = useCallback(async () => {
    await fetchPreferences();
  }, [fetchPreferences]);

  // Fetch preferences on mount and when userId changes
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreference,
    updateMultiple,
    refresh,
  };
}
