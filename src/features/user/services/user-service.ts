/**
 * User Service
 *
 * Business logic for user management including CRUD operations,
 * preference management, and event emission.
 */

import type { Database } from '@/core/types/database.types';
import type { IEventBus } from '@/core/types/event.types';
import { users, userPreferences, type User, type NewUser, type UserPreference } from '../schema';
import { eq, and } from 'drizzle-orm';
import {
  USER_EVENTS,
  type UserRegisteredEvent,
  type UserUpdatedEvent,
  type UserDeletedEvent,
  type PreferencesChangedEvent,
} from '../events';
import type { UserStats, UserProfile } from '../types';

/**
 * User Service
 */
export class UserService {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  /**
   * Create a new user
   */
  async create(data: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = crypto.randomUUID();

    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
        id,
        timezone: data.timezone || 'UTC',
      })
      .returning();

    // Emit event
    await this.eventBus.emit<UserRegisteredEvent>(USER_EVENTS.REGISTERED, {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: Date.now(),
    });

    console.log(`[UserService] User created: ${user.id} - "${user.email}"`);

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);

    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    return user || null;
  }

  /**
   * Update user profile
   */
  async update(id: string, data: Partial<UserProfile>): Promise<User | null> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    // Only proceed if there are actual changes
    if (Object.keys(data).length === 0) {
      return existingUser;
    }

    // Update user
    const [updatedUser] = await this.db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // Track which fields changed
    const changes: Record<string, boolean> = {};
    if (data.name !== undefined) changes.name = true;
    if (data.bio !== undefined) changes.bio = true;
    if (data.avatar !== undefined) changes.avatar = true;
    if (data.timezone !== undefined) changes.timezone = true;

    // Emit event
    await this.eventBus.emit<UserUpdatedEvent>(USER_EVENTS.UPDATED, {
      userId: id,
      changes,
      timestamp: Date.now(),
    });

    console.log(`[UserService] User updated: ${id}`);

    return updatedUser;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return false;
    }

    // Delete user preferences first (cascade)
    await this.db.delete(userPreferences).where(eq(userPreferences.userId, id));

    // Delete user
    await this.db.delete(users).where(eq(users.id, id));

    // Emit event
    await this.eventBus.emit<UserDeletedEvent>(USER_EVENTS.DELETED, {
      userId: id,
      timestamp: Date.now(),
    });

    console.log(`[UserService] User deleted: ${id}`);

    return true;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`[UserService] Last login updated: ${userId}`);
  }

  /**
   * Update user profile (alias for update with typed interface)
   */
  async updateProfile(userId: string, profile: UserProfile): Promise<User | null> {
    return this.update(userId, profile);
  }

  /**
   * Upload avatar (stores URL or base64)
   */
  async uploadAvatar(userId: string, imageData: string): Promise<string> {
    await this.update(userId, { avatar: imageData });
    return imageData;
  }

  /**
   * Get all user preferences
   */
  async getPreferences(userId: string): Promise<Record<string, unknown>> {
    const prefs = await this.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    const result: Record<string, unknown> = {};
    for (const pref of prefs) {
      try {
        result[pref.key] = JSON.parse(pref.value);
      } catch {
        result[pref.key] = pref.value;
      }
    }

    return result;
  }

  /**
   * Set a single preference
   */
  async setPreference(userId: string, key: string, value: unknown): Promise<void> {
    const id = crypto.randomUUID();
    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    // Try to update existing preference
    const existing = await this.db
      .select()
      .from(userPreferences)
      .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, key)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await this.db
        .update(userPreferences)
        .set({
          value: valueStr,
          updatedAt: new Date(),
        })
        .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, key)));
    } else {
      // Insert new
      await this.db.insert(userPreferences).values({
        id,
        userId,
        key,
        value: valueStr,
      });
    }

    // Emit event
    await this.eventBus.emit<PreferencesChangedEvent>(USER_EVENTS.PREFERENCES_CHANGED, {
      userId,
      keys: [key],
      timestamp: Date.now(),
    });

    console.log(`[UserService] Preference set: ${userId} - ${key}`);
  }

  /**
   * Update multiple preferences at once
   */
  async updatePreferences(userId: string, prefs: Record<string, unknown>): Promise<void> {
    const keys = Object.keys(prefs);

    // Set each preference
    for (const key of keys) {
      const id = crypto.randomUUID();
      const value = prefs[key];
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

      // Check if exists
      const existing = await this.db
        .select()
        .from(userPreferences)
        .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, key)))
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(userPreferences)
          .set({
            value: valueStr,
            updatedAt: new Date(),
          })
          .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, key)));
      } else {
        await this.db.insert(userPreferences).values({
          id,
          userId,
          key,
          value: valueStr,
        });
      }
    }

    // Emit single event with all keys
    if (keys.length > 0) {
      await this.eventBus.emit<PreferencesChangedEvent>(USER_EVENTS.PREFERENCES_CHANGED, {
        userId,
        keys,
        timestamp: Date.now(),
      });

      console.log(`[UserService] Preferences updated: ${userId} - ${keys.join(', ')}`);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.findById(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Calculate account age in days
    const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
    const now = new Date();
    const accountAge = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Return basic stats (other features will provide their own stats)
    return {
      totalTasks: 0, // Will be populated by tasks feature
      completedTasks: 0, // Will be populated by tasks feature
      totalXP: 0, // Will be populated by gamification feature
      currentLevel: 1, // Will be populated by gamification feature
      journalEntries: 0, // Will be populated by journal feature
      accountAge,
      lastActive: user.lastLoginAt || null,
    };
  }
}

/**
 * Factory function to create UserService
 */
export function createUserService(db: Database, eventBus: IEventBus): UserService {
  return new UserService(db, eventBus);
}
