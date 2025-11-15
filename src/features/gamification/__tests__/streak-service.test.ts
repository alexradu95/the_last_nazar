/**
 * Streak Service Tests
 *
 * Tests for daily streak tracking logic.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UserStats } from '../types';

const mockDb = {
  userStats: {
    findByUserId: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
};

const mockEventBus = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

describe('StreakService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateStreak', () => {
    it('should increment streak when user logs in on consecutive day', async () => {
      const userId = 'user-123';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: yesterdayStr,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);
      mockDb.userStats.update.mockResolvedValue({
        ...stats,
        currentStreak: 6,
        lastActivityDate: new Date().toISOString().split('T')[0],
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.updateStreak(userId);

      expect(result.currentStreak).toBe(6);
      expect(result.streakIncreased).toBe(true);
      expect(result.streakBroken).toBe(false);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'streak.updated',
        expect.objectContaining({
          userId,
          currentStreak: 6,
          streakIncreased: true,
        })
      );
    });

    it('should maintain streak when user logs in same day', async () => {
      const userId = 'user-123';
      const todayStr = new Date().toISOString().split('T')[0];

      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 3,
        longestStreak: 5,
        lastActivityDate: todayStr,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.updateStreak(userId);

      expect(result.currentStreak).toBe(3); // No change
      expect(result.streakIncreased).toBe(false);
      expect(result.streakBroken).toBe(false);
      expect(mockDb.userStats.update).not.toHaveBeenCalled();
    });

    it('should reset streak when gap is more than one day', async () => {
      const userId = 'user-123';
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 7,
        longestStreak: 10,
        lastActivityDate: threeDaysAgoStr,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);
      mockDb.userStats.update.mockResolvedValue({
        ...stats,
        currentStreak: 1,
        lastActivityDate: new Date().toISOString().split('T')[0],
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.updateStreak(userId);

      expect(result.currentStreak).toBe(1);
      expect(result.streakIncreased).toBe(false);
      expect(result.streakBroken).toBe(true);
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'streak.updated',
        expect.objectContaining({
          userId,
          streakBroken: true,
        })
      );
    });

    it('should update longest streak when current streak exceeds it', async () => {
      const userId = 'user-123';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 10,
        longestStreak: 10,
        lastActivityDate: yesterdayStr,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);
      mockDb.userStats.update.mockResolvedValue({
        ...stats,
        currentStreak: 11,
        longestStreak: 11,
        lastActivityDate: new Date().toISOString().split('T')[0],
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.updateStreak(userId);

      expect(result.currentStreak).toBe(11);
      expect(result.longestStreak).toBe(11);
      expect(mockDb.userStats.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          currentStreak: 11,
          longestStreak: 11,
        })
      );
    });

    it('should start streak at 1 for users with no previous activity', async () => {
      const userId = 'user-123';

      const stats: UserStats = {
        id: 'stats-1',
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

      mockDb.userStats.findByUserId.mockResolvedValue(stats);
      mockDb.userStats.update.mockResolvedValue({
        ...stats,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date().toISOString().split('T')[0],
      });

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.updateStreak(userId);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
      expect(result.streakIncreased).toBe(true);
    });
  });

  describe('checkStreak', () => {
    it('should return current streak information without updating', async () => {
      const userId = 'user-123';
      const stats: UserStats = {
        id: 'stats-1',
        userId,
        totalXP: 100,
        currentLevel: 1,
        xpToNextLevel: 100,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: '2024-01-15',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.userStats.findByUserId.mockResolvedValue(stats);

      const { createGamificationService } = await import('../services/gamification-service');
      const service = createGamificationService(mockDb as any, mockEventBus as any);

      const result = await service.checkStreak(userId);

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(10);
      expect(result.lastActivityDate).toBe('2024-01-15');
      expect(mockDb.userStats.update).not.toHaveBeenCalled();
    });
  });
});
