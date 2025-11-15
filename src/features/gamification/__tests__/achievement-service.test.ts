/**
 * Achievement Service Tests
 *
 * Tests for achievement unlock logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Achievement } from '../types';

const mockDb = {
  userStats: {
    findByUserId: vi.fn(),
  },
  achievements: {
    findAll: vi.fn(),
    findByKey: vi.fn(),
  },
  userAchievements: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    hasAchievement: vi.fn(),
  },
  tasks: {
    countCompleted: vi.fn(),
  },
  journal: {
    countEntries: vi.fn(),
  },
};

const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

describe('AchievementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAchievements', () => {
    it('should unlock "first_task" achievement when user completes first task', async () => {
      const userId = 'user-123';

      const firstTaskAchievement: Achievement = {
        id: 'ach-1',
        key: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        tier: 'bronze',
        criteria: JSON.stringify({ taskCount: 1 }),
        createdAt: new Date(),
      };

      mockDb.achievements.findAll.mockResolvedValue([firstTaskAchievement]);
      mockDb.userAchievements.findByUserId.mockResolvedValue([]);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(false);
      mockDb.tasks.countCompleted.mockResolvedValue(1);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const unlocked = await service.checkAchievements(userId);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].key).toBe('first_task');
      expect(mockDb.userAchievements.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          achievementId: 'ach-1',
        })
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'achievement.unlocked',
        expect.objectContaining({
          userId,
          achievementKey: 'first_task',
          xpReward: 50,
        })
      );
    });

    it('should unlock "streak_7" achievement when user reaches 7-day streak', async () => {
      const userId = 'user-123';

      const streakAchievement: Achievement = {
        id: 'ach-2',
        key: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 200,
        tier: 'gold',
        criteria: JSON.stringify({ streakDays: 7 }),
        createdAt: new Date(),
      };

      mockDb.achievements.findAll.mockResolvedValue([streakAchievement]);
      mockDb.userAchievements.findByUserId.mockResolvedValue([]);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(false);
      mockDb.userStats.findByUserId.mockResolvedValue({
        userId,
        currentStreak: 7,
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const unlocked = await service.checkAchievements(userId);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].key).toBe('streak_7');
    });

    it('should not unlock achievements user already has', async () => {
      const userId = 'user-123';

      const achievement: Achievement = {
        id: 'ach-1',
        key: 'first_task',
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        tier: 'bronze',
        criteria: JSON.stringify({ taskCount: 1 }),
        createdAt: new Date(),
      };

      mockDb.achievements.findAll.mockResolvedValue([achievement]);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(true);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const unlocked = await service.checkAchievements(userId);

      expect(unlocked).toHaveLength(0);
      expect(mockDb.userAchievements.create).not.toHaveBeenCalled();
    });

    it('should check multiple criteria types in one pass', async () => {
      const userId = 'user-123';

      const achievements: Achievement[] = [
        {
          id: 'ach-1',
          key: 'task_10',
          name: 'Task Master',
          description: 'Complete 10 tasks',
          icon: '⭐',
          xpReward: 100,
          tier: 'silver',
          criteria: JSON.stringify({ taskCount: 10 }),
          createdAt: new Date(),
        },
        {
          id: 'ach-2',
          key: 'level_5',
          name: 'Level 5 Hero',
          description: 'Reach level 5',
          icon: '👑',
          xpReward: 150,
          tier: 'gold',
          criteria: JSON.stringify({ level: 5 }),
          createdAt: new Date(),
        },
      ];

      mockDb.achievements.findAll.mockResolvedValue(achievements);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(false);
      mockDb.tasks.countCompleted.mockResolvedValue(10);
      mockDb.userStats.findByUserId.mockResolvedValue({
        userId,
        currentLevel: 5,
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const unlocked = await service.checkAchievements(userId);

      expect(unlocked).toHaveLength(2);
      expect(mockDb.userAchievements.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('unlockAchievement', () => {
    it('should unlock a specific achievement by key', async () => {
      const userId = 'user-123';
      const achievementKey = 'first_task';

      const achievement: Achievement = {
        id: 'ach-1',
        key: achievementKey,
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        tier: 'bronze',
        criteria: JSON.stringify({ taskCount: 1 }),
        createdAt: new Date(),
      };

      mockDb.achievements.findByKey.mockResolvedValue(achievement);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(false);
      mockDb.userAchievements.create.mockResolvedValue({
        id: 'ua-1',
        userId,
        achievementId: 'ach-1',
        unlockedAt: new Date(),
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.unlockAchievement(userId, achievementKey);

      expect(result).toEqual(achievement);
      expect(mockDb.userAchievements.create).toHaveBeenCalled();
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'achievement.unlocked',
        expect.objectContaining({
          achievementKey,
        })
      );
    });

    it('should throw error if achievement does not exist', async () => {
      const userId = 'user-123';
      const achievementKey = 'nonexistent';

      mockDb.achievements.findByKey.mockResolvedValue(null);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await expect(
        service.unlockAchievement(userId, achievementKey)
      ).rejects.toThrow('Achievement not found');
    });

    it('should not unlock achievement if user already has it', async () => {
      const userId = 'user-123';
      const achievementKey = 'first_task';

      const achievement: Achievement = {
        id: 'ach-1',
        key: achievementKey,
        name: 'Getting Started',
        description: 'Complete your first task',
        icon: '🎯',
        xpReward: 50,
        tier: 'bronze',
        criteria: JSON.stringify({ taskCount: 1 }),
        createdAt: new Date(),
      };

      mockDb.achievements.findByKey.mockResolvedValue(achievement);
      mockDb.userAchievements.hasAchievement.mockResolvedValue(true);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.unlockAchievement(userId, achievementKey);

      expect(result).toEqual(achievement);
      expect(mockDb.userAchievements.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserAchievements', () => {
    it('should return all unlocked achievements for a user', async () => {
      const userId = 'user-123';

      const userAchievements = [
        {
          id: 'ua-1',
          userId,
          achievementId: 'ach-1',
          unlockedAt: new Date(),
          achievement: {
            id: 'ach-1',
            key: 'first_task',
            name: 'Getting Started',
            description: 'Complete your first task',
            icon: '🎯',
            xpReward: 50,
            tier: 'bronze',
            criteria: JSON.stringify({ taskCount: 1 }),
            createdAt: new Date(),
          },
        },
      ];

      mockDb.userAchievements.findByUserId.mockResolvedValue(userAchievements);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.getUserAchievements(userId);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('first_task');
    });
  });

  describe('getAvailableAchievements', () => {
    it('should return achievements user has not yet unlocked', async () => {
      const userId = 'user-123';

      const allAchievements = [
        {
          id: 'ach-1',
          key: 'first_task',
          name: 'Getting Started',
          tier: 'bronze',
        },
        {
          id: 'ach-2',
          key: 'task_10',
          name: 'Task Master',
          tier: 'silver',
        },
      ];

      const userAchievements = [
        {
          achievementId: 'ach-1',
        },
      ];

      mockDb.achievements.findAll.mockResolvedValue(allAchievements);
      mockDb.userAchievements.findByUserId.mockResolvedValue(userAchievements);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.getAvailableAchievements(userId);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('task_10');
    });
  });
});
