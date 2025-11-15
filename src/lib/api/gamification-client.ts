/**
 * Gamification API Client
 *
 * Client-side helpers for fetching gamification data from API routes.
 */

export interface UserStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface XPHistoryItem {
  id: string;
  userId: string;
  amount: number;
  source: 'task' | 'journal' | 'achievement' | 'streak';
  sourceId: string | null;
  reason: string;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

/**
 * Fetch user gamification stats
 */
export async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch('/api/gamification/stats', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  const data = await response.json();

  // Convert date strings to Date objects
  return {
    ...data.stats,
    createdAt: new Date(data.stats.createdAt),
    updatedAt: new Date(data.stats.updatedAt),
  };
}

/**
 * Fetch XP history with pagination
 */
export async function fetchXPHistory(limit = 10): Promise<XPHistoryItem[]> {
  const response = await fetch(`/api/gamification/xp-history?limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error(`Failed to fetch XP history: ${response.statusText}`);
  }

  const data = await response.json();

  // Convert timestamp strings to Date objects
  return data.history.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));
}

/**
 * Fetch user achievements (both unlocked and locked)
 */
export async function fetchUserAchievements(): Promise<Achievement[]> {
  const response = await fetch('/api/gamification/achievements', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error(`Failed to fetch achievements: ${response.statusText}`);
  }

  const data = await response.json();

  // Convert unlockedAt strings to Date objects
  return data.achievements.map((achievement: any) => ({
    ...achievement,
    unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
  }));
}

/**
 * Fetch leaderboard data
 */
export async function fetchLeaderboard(limit = 10): Promise<Array<{
  userId: string;
  totalXP: number;
  currentLevel: number;
  rank: number;
}>> {
  const response = await fetch(`/api/gamification/leaderboard?limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
  }

  const data = await response.json();
  return data.leaderboard;
}
