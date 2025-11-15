/**
 * Gamification Service
 *
 * Core service for XP, levels, streaks, and achievements.
 */

import { eq, desc, and, sql } from 'drizzle-orm';
import type { IEventBus } from '@/core/types/event.types';
import { userStats, xpHistory, achievements, userAchievements } from '../schema';
import type {
  UserStats,
  XPHistory,
  Achievement,
  LevelInfo,
  StreakInfo,
  LeaderboardEntry,
  AchievementCriteria,
} from '../types';

/**
 * Level progression configuration
 */
const LEVEL_CONFIG = {
  baseXP: 100,
  multiplier: 1.5,
};

/**
 * Calculate XP required for a specific level
 */
function calculateXPForLevel(level: number): number {
  if (level === 1) return 0;
  return Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.multiplier, level - 2));
}

/**
 * Calculate cumulative XP required to reach a level
 */
function calculateCumulativeXP(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i + 1);
  }
  return total;
}

/**
 * Gamification Service Interface
 */
export interface IGamificationService {
  // XP Management
  awardXP(userId: string, amount: number, source: string, sourceId?: string, reason?: string): Promise<void>;
  getUserStats(userId: string): Promise<UserStats>;
  getXPHistory(userId: string, limit?: number): Promise<XPHistory[]>;

  // Level System
  calculateLevel(totalXP: number): Promise<LevelInfo>;
  checkLevelUp(userId: string): Promise<boolean>;

  // Streak System
  updateStreak(userId: string): Promise<StreakInfo>;
  checkStreak(userId: string): Promise<StreakInfo>;

  // Achievement System
  checkAchievements(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, achievementKey: string): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  getAvailableAchievements(userId: string): Promise<Achievement[]>;
  seedAchievements(): Promise<void>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getUserRank(userId: string): Promise<number>;
}

/**
 * Create Gamification Service
 */
export function createGamificationService(db: any, eventBus: IEventBus): IGamificationService {
  /**
   * Get or create user stats
   */
  async function getOrCreateUserStats(userId: string): Promise<UserStats> {
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length > 0) {
      return stats[0];
    }

    // Create initial stats
    const newStats = {
      id: `stats-${userId}-${Date.now()}`,
      userId,
      totalXP: 0,
      currentLevel: 1,
      xpToNextLevel: 100,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userStats).values(newStats);
    return newStats as UserStats;
  }

  /**
   * Award XP to a user
   */
  async function awardXP(
    userId: string,
    amount: number,
    source: string,
    sourceId?: string,
    reason?: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('XP amount must be positive');
    }

    // Get current stats
    const stats = await getOrCreateUserStats(userId);
    const newTotalXP = stats.totalXP + amount;

    // Update user stats
    await db
      .update(userStats)
      .set({
        totalXP: newTotalXP,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    // Create XP history entry
    await db.insert(xpHistory).values({
      id: `xp-${userId}-${Date.now()}`,
      userId,
      amount,
      source,
      sourceId: sourceId || null,
      reason: reason || null,
      timestamp: new Date(),
    });

    // Emit event
    await eventBus.emit('xp.awarded', {
      userId,
      amount,
      source,
      newTotal: newTotalXP,
      timestamp: Date.now(),
    });

    // Check for level up
    const levelInfo = await calculateLevel(newTotalXP);
    if (levelInfo.level > stats.currentLevel) {
      await db
        .update(userStats)
        .set({
          currentLevel: levelInfo.level,
          xpToNextLevel: levelInfo.xpToNext,
        })
        .where(eq(userStats.userId, userId));

      await eventBus.emit('level.up', {
        userId,
        oldLevel: stats.currentLevel,
        newLevel: levelInfo.level,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get user stats
   */
  async function getUserStats(userId: string): Promise<UserStats> {
    return getOrCreateUserStats(userId);
  }

  /**
   * Get XP history
   */
  async function getXPHistory(userId: string, limit: number = 50): Promise<XPHistory[]> {
    const history = await db
      .select()
      .from(xpHistory)
      .where(eq(xpHistory.userId, userId))
      .orderBy(desc(xpHistory.timestamp))
      .limit(limit);

    return history;
  }

  /**
   * Calculate level from total XP
   */
  async function calculateLevel(totalXP: number): Promise<LevelInfo> {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = LEVEL_CONFIG.baseXP;

    while (totalXP >= xpForNextLevel) {
      level++;
      xpForCurrentLevel = xpForNextLevel;
      xpForNextLevel = xpForCurrentLevel + Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.multiplier, level - 2));
    }

    return {
      level,
      xpToNext: xpForNextLevel - totalXP,
      xpCurrent: totalXP - xpForCurrentLevel,
      xpForCurrentLevel,
    };
  }

  /**
   * Check if user should level up
   */
  async function checkLevelUp(userId: string): Promise<boolean> {
    const stats = await getUserStats(userId);
    const levelInfo = await calculateLevel(stats.totalXP);

    if (levelInfo.level > stats.currentLevel) {
      await db
        .update(userStats)
        .set({
          currentLevel: levelInfo.level,
          xpToNextLevel: levelInfo.xpToNext,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId));

      await eventBus.emit('level.up', {
        userId,
        oldLevel: stats.currentLevel,
        newLevel: levelInfo.level,
        timestamp: Date.now(),
      });

      return true;
    }

    return false;
  }

  /**
   * Update user streak
   */
  async function updateStreak(userId: string): Promise<StreakInfo> {
    const stats = await getUserStats(userId);
    const today = new Date().toISOString().split('T')[0];

    // If already updated today, return current streak
    if (stats.lastActivityDate === today) {
      return {
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastActivityDate: stats.lastActivityDate,
        streakIncreased: false,
        streakBroken: false,
      };
    }

    let newStreak = stats.currentStreak;
    let streakIncreased = false;
    let streakBroken = false;

    if (!stats.lastActivityDate) {
      // First activity
      newStreak = 1;
      streakIncreased = true;
    } else {
      const lastDate = new Date(stats.lastActivityDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak = stats.currentStreak + 1;
        streakIncreased = true;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
        streakBroken = true;
      }
    }

    const newLongestStreak = Math.max(stats.longestStreak, newStreak);

    await db
      .update(userStats)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    const streakInfo: StreakInfo = {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: today,
      streakIncreased,
      streakBroken,
    };

    await eventBus.emit('streak.updated', {
      userId,
      ...streakInfo,
      timestamp: Date.now(),
    });

    return streakInfo;
  }

  /**
   * Check current streak without updating
   */
  async function checkStreak(userId: string): Promise<StreakInfo> {
    const stats = await getUserStats(userId);

    return {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastActivityDate: stats.lastActivityDate,
      streakIncreased: false,
      streakBroken: false,
    };
  }

  /**
   * Check and unlock eligible achievements
   */
  async function checkAchievements(userId: string): Promise<Achievement[]> {
    const allAchievements = await db.select().from(achievements);
    const userAchievementsList = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(userAchievementsList.map((ua) => ua.achievementId));
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria: AchievementCriteria = JSON.parse(achievement.criteria);
      const eligible = await checkAchievementCriteria(userId, criteria);

      if (eligible) {
        await db.insert(userAchievements).values({
          id: `ua-${userId}-${achievement.id}-${Date.now()}`,
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
        });

        newlyUnlocked.push(achievement);

        await eventBus.emit('achievement.unlocked', {
          userId,
          achievementId: achievement.id,
          achievementKey: achievement.key,
          achievementName: achievement.name,
          xpReward: achievement.xpReward,
          timestamp: Date.now(),
        });

        // Award XP for achievement
        if (achievement.xpReward > 0) {
          await awardXP(userId, achievement.xpReward, 'achievement', achievement.id, `Unlocked: ${achievement.name}`);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if user meets achievement criteria
   */
  async function checkAchievementCriteria(userId: string, criteria: AchievementCriteria): Promise<boolean> {
    const stats = await getUserStats(userId);

    if (criteria.taskCount !== undefined) {
      // Count completed tasks (mock for now)
      const taskCount = await db.tasks?.countCompleted?.(userId) || 0;
      if (taskCount < criteria.taskCount) return false;
    }

    if (criteria.streakDays !== undefined) {
      if (stats.currentStreak < criteria.streakDays) return false;
    }

    if (criteria.level !== undefined) {
      if (stats.currentLevel < criteria.level) return false;
    }

    if (criteria.totalXP !== undefined) {
      if (stats.totalXP < criteria.totalXP) return false;
    }

    if (criteria.journalCount !== undefined) {
      const journalCount = await db.journal?.countEntries?.(userId) || 0;
      if (journalCount < criteria.journalCount) return false;
    }

    return true;
  }

  /**
   * Unlock specific achievement
   */
  async function unlockAchievement(userId: string, achievementKey: string): Promise<Achievement> {
    const achievement = await db
      .select()
      .from(achievements)
      .where(eq(achievements.key, achievementKey))
      .limit(1);

    if (achievement.length === 0) {
      throw new Error('Achievement not found');
    }

    const ach = achievement[0];

    // Check if already unlocked
    const existing = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, ach.id)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userAchievements).values({
        id: `ua-${userId}-${ach.id}-${Date.now()}`,
        userId,
        achievementId: ach.id,
        unlockedAt: new Date(),
      });

      await eventBus.emit('achievement.unlocked', {
        userId,
        achievementId: ach.id,
        achievementKey: ach.key,
        achievementName: ach.name,
        xpReward: ach.xpReward,
        timestamp: Date.now(),
      });

      if (ach.xpReward > 0) {
        await awardXP(userId, ach.xpReward, 'achievement', ach.id, `Unlocked: ${ach.name}`);
      }
    }

    return ach;
  }

  /**
   * Get user's unlocked achievements
   */
  async function getUserAchievements(userId: string): Promise<Achievement[]> {
    const userAchs = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const achIds = userAchs.map((ua) => ua.achievementId);
    if (achIds.length === 0) return [];

    const achs = await db
      .select()
      .from(achievements)
      .where(sql`${achievements.id} IN ${achIds}`);

    return achs;
  }

  /**
   * Get available (not yet unlocked) achievements
   */
  async function getAvailableAchievements(userId: string): Promise<Achievement[]> {
    const allAchs = await db.select().from(achievements);
    const userAchs = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(userAchs.map((ua) => ua.achievementId));
    return allAchs.filter((ach) => !unlockedIds.has(ach.id));
  }

  /**
   * Seed initial achievements
   */
  async function seedAchievements(): Promise<void> {
    const ACHIEVEMENTS = [
      {
        id: 'ach-first-task',
        key: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        tier: 'bronze' as const,
        criteria: JSON.stringify({ taskCount: 1 }),
      },
      {
        id: 'ach-task-10',
        key: 'task_10',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '⭐',
        xpReward: 100,
        tier: 'silver' as const,
        criteria: JSON.stringify({ taskCount: 10 }),
      },
      {
        id: 'ach-task-50',
        key: 'task_50',
        name: 'Productivity Pro',
        description: 'Complete 50 tasks',
        icon: '💎',
        xpReward: 300,
        tier: 'gold' as const,
        criteria: JSON.stringify({ taskCount: 50 }),
      },
      {
        id: 'ach-streak-7',
        key: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 200,
        tier: 'gold' as const,
        criteria: JSON.stringify({ streakDays: 7 }),
      },
      {
        id: 'ach-streak-30',
        key: 'streak_30',
        name: 'Month Champion',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        xpReward: 500,
        tier: 'platinum' as const,
        criteria: JSON.stringify({ streakDays: 30 }),
      },
      {
        id: 'ach-level-5',
        key: 'level_5',
        name: 'Level 5 Hero',
        description: 'Reach level 5',
        icon: '👑',
        xpReward: 150,
        tier: 'silver' as const,
        criteria: JSON.stringify({ level: 5 }),
      },
      {
        id: 'ach-level-10',
        key: 'level_10',
        name: 'Level 10 Legend',
        description: 'Reach level 10',
        icon: '👑',
        xpReward: 500,
        tier: 'platinum' as const,
        criteria: JSON.stringify({ level: 10 }),
      },
    ];

    for (const ach of ACHIEVEMENTS) {
      const existing = await db
        .select()
        .from(achievements)
        .where(eq(achievements.key, ach.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(achievements).values({
          ...ach,
          createdAt: new Date(),
        });
      }
    }
  }

  /**
   * Get leaderboard
   */
  async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const topUsers = await db
      .select()
      .from(userStats)
      .orderBy(desc(userStats.totalXP))
      .limit(limit);

    return topUsers.map((stats, index) => ({
      userId: stats.userId,
      username: undefined,
      totalXP: stats.totalXP,
      currentLevel: stats.currentLevel,
      rank: index + 1,
      currentStreak: stats.currentStreak,
    }));
  }

  /**
   * Get user's rank
   */
  async function getUserRank(userId: string): Promise<number> {
    const stats = await getUserStats(userId);
    const higherRanked = await db
      .select()
      .from(userStats)
      .where(sql`${userStats.totalXP} > ${stats.totalXP}`);

    return higherRanked.length + 1;
  }

  return {
    awardXP,
    getUserStats,
    getXPHistory,
    calculateLevel,
    checkLevelUp,
    updateStreak,
    checkStreak,
    checkAchievements,
    unlockAchievement,
    getUserAchievements,
    getAvailableAchievements,
    seedAchievements,
    getLeaderboard,
    getUserRank,
  };
}
