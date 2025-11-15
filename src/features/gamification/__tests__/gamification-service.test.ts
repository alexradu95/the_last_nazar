/**
 * Gamification Service Tests
 *
 * Test-driven development: These tests define the expected behavior
 * of the gamification service before implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UserStats } from '../types';

// Mock database and event bus
const mockDb = {
  userStats: {
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  xpHistory: {
    create: vi.fn(),
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
};

const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

describe('GamificationService - XP System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('awardXP', () => {
    it('should award XP to a user and create history entry', async () => {
      const userId = 'user-123';
      const amount = 50;
      const source = 'task';

      const existingStats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(existingStats);
      mockDb.userStats.update.mockResolvedValue({ ...existingStats, totalXP: 150 });
      mockDb.xpHistory.create.mockResolvedValue({
        id: 'history-1',
        userId,
        amount,
        source,
        sourceId: null,
        reason: null,
        timestamp: new Date(),
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await service.awardXP(userId, amount, source);

      // Should update user stats
      expect(mockDb.userStats.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ totalXP: 150 })
      );

      // Should create XP history entry
      expect(mockDb.xpHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          amount,
          source,
        })
      );

      // Should emit xp.awarded event
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'xp.awarded',
        expect.objectContaining({
          userId,
          amount,
          newTotal: 150,
        })
      );
    });

    it('should create user stats if user does not exist', async () => {
      const userId = 'new-user';
      const amount = 25;

      mockDb.userStats.findByUserId.mockResolvedValue(null);
      mockDb.userStats.create.mockResolvedValue({
        id: 'stats-new',
        userId,
        totalXP: 25,
        currentLevel: 1,
        xpToNextLevel: 75,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await service.awardXP(userId, amount, 'task');

      expect(mockDb.userStats.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          totalXP: 25,
          currentLevel: 1,
        })
      );
    });

    it('should reject negative XP amounts', async () => {
      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await expect(
        service.awardXP('user-123', -50, 'task')
      ).rejects.toThrow('XP amount must be positive');
    });

    it('should trigger level up when XP threshold is reached', async () => {
      const userId = 'user-123';
      const existingStats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 90,
        currentLevel: 1,
        xpToNextLevel: 10, // Only needs 10 more XP to level up
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(existingStats);
      mockDb.userStats.update.mockResolvedValue({
        ...existingStats,
        totalXP: 115,
        currentLevel: 2,
        xpToNextLevel: 135, // New threshold for level 3
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await service.awardXP(userId, 25, 'task');

      // Should emit level.up event
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'level.up',
        expect.objectContaining({
          userId,
          oldLevel: 1,
          newLevel: 2,
        })
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user stats if they exist', async () => {
      const userId = 'user-123';
      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 250,
        currentLevel: 3,
        xpToNextLevel: 150,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: '2024-01-15',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.getUserStats(userId);

      expect(result).toEqual(stats);
      expect(mockDb.userStats.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should create and return initial stats for new users', async () => {
      const userId = 'new-user';

      mockDb.userStats.findByUserId.mockResolvedValue(null);
      mockDb.userStats.create.mockResolvedValue({
        id: 'stats-new',
        userId,
        totalXP: 0,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.getUserStats(userId);

      expect(result.totalXP).toBe(0);
      expect(result.currentLevel).toBe(1);
      expect(mockDb.userStats.create).toHaveBeenCalled();
    });
  });

  describe('getXPHistory', () => {
    it('should return XP history for a user', async () => {
      const userId = 'user-123';
      const history = [
        {
          id: 'h1',
          userId,
          amount: 50,
          source: 'task' as const,
          sourceId: 'task-1',
          reason: 'Completed task',
          timestamp: new Date(),
        },
        {
          id: 'h2',
          userId,
          amount: 25,
          source: 'journal' as const,
          sourceId: 'journal-1',
          reason: 'Journal entry',
          timestamp: new Date(),
        },
      ];

      mockDb.xpHistory.findByUserId.mockResolvedValue(history);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.getXPHistory(userId, 10);

      expect(result).toEqual(history);
      expect(mockDb.xpHistory.findByUserId).toHaveBeenCalledWith(userId, 10);
    });

    it('should limit XP history results', async () => {
      const userId = 'user-123';

      mockDb.xpHistory.findByUserId.mockResolvedValue([]);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      await service.getXPHistory(userId, 5);

      expect(mockDb.xpHistory.findByUserId).toHaveBeenCalledWith(userId, 5);
    });
  });
});

describe('GamificationService - Level System', () => {
  describe('calculateLevel', () => {
    it('should calculate level 1 for XP below 100', async () => {
      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.calculateLevel(50);

      expect(result.level).toBe(1);
      expect(result.xpToNext).toBe(50); // 100 - 50 = 50 XP to next level
    });

    it('should calculate level 2 for XP between 100-250', async () => {
      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.calculateLevel(150);

      expect(result.level).toBe(2);
      expect(result.xpToNext).toBe(100); // 250 - 150 = 100 XP to level 3
    });

    it('should calculate higher levels with exponential progression', async () => {
      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      // Level progression: 100, 250, 475, 812, 1318... (multiplier 1.5)
      const result = await service.calculateLevel(500);

      expect(result.level).toBe(3);
    });

    it('should handle level 10+', async () => {
      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.calculateLevel(10000);

      expect(result.level).toBeGreaterThan(10);
    });
  });

  describe('checkLevelUp', () => {
    it('should return true and update level when threshold is exceeded', async () => {
      const userId = 'user-123';
      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 250, // Just reached level 3 threshold
        currentLevel: 2,
        xpToNextLevel: 225, // Old threshold
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);
      mockDb.userStats.update.mockResolvedValue({ ...stats, currentLevel: 3 });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const leveledUp = await service.checkLevelUp(userId);

      expect(leveledUp).toBe(true);
      expect(mockDb.userStats.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ currentLevel: 3 })
      );
    });

    it('should return false when no level up occurs', async () => {
      const userId = 'user-123';
      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 50,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const leveledUp = await service.checkLevelUp(userId);

      expect(leveledUp).toBe(false);
      expect(mockDb.userStats.update).not.toHaveBeenCalled();
    });
  });
});
