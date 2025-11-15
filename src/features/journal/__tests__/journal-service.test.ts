/**
 * Journal Service Tests
 *
 * Following TDD - these tests define the expected behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createJournalService } from '../services/journal-service';
import type { CreateJournalEntryInput } from '../types';

describe('JournalService', () => {
  let service: ReturnType<typeof createJournalService>;
  let mockDb: any;
  let mockEventBus: any;

  beforeEach(() => {
    // Mock database
    mockDb = {
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([{
            id: 'entry-1',
            userId: 'user-1',
            title: 'Test Entry',
            content: 'Test content',
            wordCount: 2,
            date: '2025-11-15',
            createdAt: new Date(),
            updatedAt: new Date(),
          }])
        })
      }),
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([])
        })
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([])
          })
        })
      }),
      delete: () => ({
        where: () => Promise.resolve({ rowsAffected: 1 })
      }),
    };

    // Mock event bus
    mockEventBus = {
      emit: () => {},
      on: () => {},
    };

    service = createJournalService(mockDb, mockEventBus);
  });

  describe('create', () => {
    it('should create a journal entry with word count', async () => {
      const input: CreateJournalEntryInput = {
        userId: 'user-1',
        title: 'My Day',
        content: 'Today was a great day!',
      };

      const result = await service.create(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.wordCount).toBeGreaterThan(0);
    });

    it('should set date to today if not provided', async () => {
      const input: CreateJournalEntryInput = {
        userId: 'user-1',
        content: 'Test content',
      };

      const result = await service.create(input);
      const today = new Date().toISOString().split('T')[0];

      expect(result.success).toBe(true);
      expect(result.data?.date).toBe(today);
    });

    it('should calculate word count correctly', async () => {
      const input: CreateJournalEntryInput = {
        userId: 'user-1',
        content: 'This is a test entry with multiple words',
      };

      const result = await service.create(input);

      expect(result.success).toBe(true);
      expect(result.data?.wordCount).toBe(8);
    });

    it('should handle tags as JSON array', async () => {
      const input: CreateJournalEntryInput = {
        userId: 'user-1',
        content: 'Tagged entry',
        tags: ['personal', 'reflection'],
      };

      const result = await service.create(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should emit journal.created event', async () => {
      let emittedEvent: any = null;
      mockEventBus.emit = (event: string, payload: any) => {
        emittedEvent = { event, payload };
      };

      const input: CreateJournalEntryInput = {
        userId: 'user-1',
        content: 'Test',
      };

      await service.create(input);

      expect(emittedEvent).not.toBeNull();
      expect(emittedEvent.event).toBe('journal.created');
      expect(emittedEvent.payload.userId).toBe('user-1');
    });
  });

  describe('findById', () => {
    it('should return null for non-existent entry', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return empty array when no entries exist', async () => {
      const result = await service.findByUserId('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getEntryForToday', () => {
    it('should return null when no entry exists for today', async () => {
      const result = await service.getEntryForToday('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getJournalStats', () => {
    it('should calculate correct statistics', async () => {
      const result = await service.getJournalStats('user-1');

      expect(result).toHaveProperty('totalEntries');
      expect(result).toHaveProperty('currentStreak');
      expect(result).toHaveProperty('totalWords');
      expect(result).toHaveProperty('moodDistribution');
    });
  });

  describe('getWritingStreak', () => {
    it('should return zero streak for new users', async () => {
      const result = await service.getWritingStreak('user-1');

      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
    });
  });

  describe('getDailyPrompt', () => {
    it('should return a random active prompt', async () => {
      mockDb.select = () => ({
        from: () => ({
          where: () => Promise.resolve([
            {
              id: 'prompt-1',
              category: 'reflection',
              prompt: 'What did you learn today?',
              isActive: true,
            }
          ])
        })
      });

      const result = await service.getDailyPrompt();

      expect(result).toBeDefined();
      expect(result.prompt).toBeTruthy();
    });
  });

  describe('searchEntries', () => {
    it('should search entries by content', async () => {
      const result = await service.searchEntries('user-1', 'test query');

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
