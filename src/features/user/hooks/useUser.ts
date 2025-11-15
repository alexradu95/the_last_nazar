/**
 * useUser Hook
 *
 * React hook for user profile management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User, UserStats, UserProfile } from '../types';

interface UseUserResult {
  user: User | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: UserProfile) => Promise<void>;
  uploadAvatar: (imageData: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useUser(userId: string): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[useUser] Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(
    async (updates: UserProfile) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('[useUser] Error updating profile:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const uploadAvatar = useCallback(
    async (imageData: string) => {
      await updateProfile({ avatar: imageData });
    },
    [updateProfile]
  );

  const deleteAccount = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setUser(null);
      setStats(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[useUser] Error deleting account:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Fetch user on mount and when userId changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    stats,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAccount,
    refresh,
  };
}
