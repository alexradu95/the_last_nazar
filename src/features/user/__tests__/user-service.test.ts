/**
 * User Service Tests
 *
 * Following TDD principles - tests written first before implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { EventBus } from '@/core/event-bus';
import { UserService } from '../services/user-service';
import { users, userPreferences } from '../schema';
import { USER_EVENTS } from '../events';

describe('UserService', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let eventBus: EventBus;
  let service: UserService;
  let emittedEvents: Array<{ event: string; payload: unknown }> = [];

  beforeEach(() => {
    // Create in-memory database
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);

    // Create tables
    sqlite.exec(`
      CREATE TABLE feature_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        timezone TEXT DEFAULT 'UTC',
        last_login_at INTEGER,
        created_at INTEGER,
        updated_at INTEGER
      );

      CREATE TABLE feature_user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES feature_users(id),
        UNIQUE(user_id, key)
      );
    `);

    // Create event bus and capture events
    eventBus = new EventBus();
    emittedEvents = [];

    // Listen to all events
    eventBus.on('*', (event, payload) => {
      emittedEvents.push({ event, payload });
    });

    service = new UserService(db, eventBus);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('create', () => {
    it('should create a user with all required fields', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await service.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.timezone).toBe('UTC');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should create a user with optional fields', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
        avatar: 'https://example.com/avatar.jpg',
        timezone: 'America/New_York',
      };

      const user = await service.create(userData);

      expect(user.bio).toBe('Test bio');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.timezone).toBe('America/New_York');
    });

    it('should emit user.registered event on creation', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const user = await service.create(userData);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe(USER_EVENTS.REGISTERED);
      expect(emittedEvents[0].payload).toMatchObject({
        userId: user.id,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should reject duplicate email addresses', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'User One',
      };

      await service.create(userData);

      // Attempt to create another user with same email
      await expect(
        service.create({
          email: 'duplicate@example.com',
          name: 'User Two',
        })
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find an existing user by ID', async () => {
      const created = await service.create({
        email: 'find@example.com',
        name: 'Find Me',
      });

      const found = await service.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('find@example.com');
    });

    it('should return null for non-existent user ID', async () => {
      const found = await service.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find an existing user by email', async () => {
      await service.create({
        email: 'email@example.com',
        name: 'Email User',
      });

      const found = await service.findByEmail('email@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('email@example.com');
      expect(found?.name).toBe('Email User');
    });

    it('should return null for non-existent email', async () => {
      const found = await service.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });

    it('should be case-sensitive for email lookup', async () => {
      await service.create({
        email: 'case@example.com',
        name: 'Case User',
      });

      const found = await service.findByEmail('CASE@example.com');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user profile fields', async () => {
      const user = await service.create({
        email: 'update@example.com',
        name: 'Original Name',
      });

      const updated = await service.update(user.id, {
        name: 'Updated Name',
        bio: 'New bio',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.bio).toBe('New bio');
      expect(updated?.email).toBe('update@example.com'); // Unchanged
    });

    it('should emit user.updated event with change details', async () => {
      const user = await service.create({
        email: 'update@example.com',
        name: 'Original Name',
      });

      // Clear creation event
      emittedEvents = [];

      await service.update(user.id, {
        name: 'Updated Name',
        avatar: 'https://example.com/new-avatar.jpg',
      });

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe(USER_EVENTS.UPDATED);
      expect(emittedEvents[0].payload).toMatchObject({
        userId: user.id,
        changes: {
          name: true,
          avatar: true,
        },
      });
    });

    it('should return null for non-existent user', async () => {
      const result = await service.update('non-existent-id', {
        name: 'New Name',
      });

      expect(result).toBeNull();
    });

    it('should not emit event if no changes made', async () => {
      const user = await service.create({
        email: 'nochange@example.com',
        name: 'Name',
      });

      emittedEvents = [];

      await service.update(user.id, {});

      // Should still return user but not emit event
      expect(emittedEvents).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete an existing user', async () => {
      const user = await service.create({
        email: 'delete@example.com',
        name: 'Delete Me',
      });

      const result = await service.delete(user.id);

      expect(result).toBe(true);

      const found = await service.findById(user.id);
      expect(found).toBeNull();
    });

    it('should emit user.deleted event', async () => {
      const user = await service.create({
        email: 'delete@example.com',
        name: 'Delete Me',
      });

      emittedEvents = [];

      await service.delete(user.id);

      expect(emittedEvents).toHaveLength(1);
      expect(emittedEvents[0].event).toBe(USER_EVENTS.DELETED);
      expect(emittedEvents[0].payload).toMatchObject({
        userId: user.id,
      });
    });

    it('should return false for non-existent user', async () => {
      const result = await service.delete('non-existent-id');

      expect(result).toBe(false);
    });

    it('should cascade delete user preferences', async () => {
      const user = await service.create({
        email: 'cascade@example.com',
        name: 'Cascade User',
      });

      await service.setPreference(user.id, 'theme', 'dark');

      await service.delete(user.id);

      const prefs = await service.getPreferences(user.id);
      expect(Object.keys(prefs)).toHaveLength(0);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const user = await service.create({
        email: 'login@example.com',
        name: 'Login User',
      });

      expect(user.lastLoginAt).toBeNull();

      await service.updateLastLogin(user.id);

      const updated = await service.findById(user.id);
      expect(updated?.lastLoginAt).toBeDefined();
      expect(updated?.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should not emit event for last login update', async () => {
      const user = await service.create({
        email: 'login@example.com',
        name: 'Login User',
      });

      emittedEvents = [];

      await service.updateLastLogin(user.id);

      expect(emittedEvents).toHaveLength(0);
    });
  });

  describe('preferences management', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await service.create({
        email: 'prefs@example.com',
        name: 'Prefs User',
      });
      userId = user.id;
    });

    describe('getPreferences', () => {
      it('should return empty object for new user', async () => {
        const prefs = await service.getPreferences(userId);

        expect(prefs).toEqual({});
      });

      it('should return all user preferences as object', async () => {
        await service.setPreference(userId, 'theme', 'dark');
        await service.setPreference(userId, 'notifications', true);

        const prefs = await service.getPreferences(userId);

        expect(prefs).toEqual({
          theme: 'dark',
          notifications: true,
        });
      });
    });

    describe('setPreference', () => {
      it('should set a single preference', async () => {
        await service.setPreference(userId, 'theme', 'dark');

        const prefs = await service.getPreferences(userId);
        expect(prefs.theme).toBe('dark');
      });

      it('should update existing preference', async () => {
        await service.setPreference(userId, 'theme', 'light');
        await service.setPreference(userId, 'theme', 'dark');

        const prefs = await service.getPreferences(userId);
        expect(prefs.theme).toBe('dark');
      });

      it('should handle complex values as JSON', async () => {
        const complexValue = {
          enabled: true,
          settings: {
            email: true,
            push: false,
          },
        };

        await service.setPreference(userId, 'notifications', complexValue);

        const prefs = await service.getPreferences(userId);
        expect(prefs.notifications).toEqual(complexValue);
      });

      it('should emit preferences.changed event', async () => {
        emittedEvents = [];

        await service.setPreference(userId, 'theme', 'dark');

        expect(emittedEvents).toHaveLength(1);
        expect(emittedEvents[0].event).toBe(USER_EVENTS.PREFERENCES_CHANGED);
        expect(emittedEvents[0].payload).toMatchObject({
          userId,
          keys: ['theme'],
        });
      });
    });

    describe('updatePreferences', () => {
      it('should update multiple preferences at once', async () => {
        await service.updatePreferences(userId, {
          theme: 'dark',
          language: 'en',
          notifications: true,
        });

        const prefs = await service.getPreferences(userId);
        expect(prefs).toEqual({
          theme: 'dark',
          language: 'en',
          notifications: true,
        });
      });

      it('should emit single event with all changed keys', async () => {
        emittedEvents = [];

        await service.updatePreferences(userId, {
          theme: 'dark',
          language: 'en',
        });

        expect(emittedEvents).toHaveLength(1);
        expect(emittedEvents[0].event).toBe(USER_EVENTS.PREFERENCES_CHANGED);
        expect(emittedEvents[0].payload).toMatchObject({
          userId,
          keys: expect.arrayContaining(['theme', 'language']),
        });
      });

      it('should merge with existing preferences', async () => {
        await service.setPreference(userId, 'existing', 'value');

        await service.updatePreferences(userId, {
          new: 'preference',
        });

        const prefs = await service.getPreferences(userId);
        expect(prefs.existing).toBe('value');
        expect(prefs.new).toBe('preference');
      });
    });
  });

  describe('getUserStats', () => {
    it('should return basic stats for new user', async () => {
      const user = await service.create({
        email: 'stats@example.com',
        name: 'Stats User',
      });

      const stats = await service.getUserStats(user.id);

      expect(stats).toEqual({
        totalTasks: 0,
        completedTasks: 0,
        totalXP: 0,
        currentLevel: 1,
        journalEntries: 0,
        accountAge: 0,
        lastActive: null,
      });
    });

    it('should calculate account age in days', async () => {
      const user = await service.create({
        email: 'age@example.com',
        name: 'Age User',
      });

      // Manually set created date to 5 days ago
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      await db
        .update(users)
        .set({ createdAt: fiveDaysAgo })
        .where(eq(users.id, user.id));

      const stats = await service.getUserStats(user.id);

      expect(stats.accountAge).toBeGreaterThanOrEqual(4);
      expect(stats.accountAge).toBeLessThanOrEqual(5);
    });

    it('should include last login in stats', async () => {
      const user = await service.create({
        email: 'lastactive@example.com',
        name: 'Active User',
      });

      await service.updateLastLogin(user.id);

      const stats = await service.getUserStats(user.id);

      expect(stats.lastActive).toBeDefined();
      expect(stats.lastActive).toBeInstanceOf(Date);
    });
  });
});
