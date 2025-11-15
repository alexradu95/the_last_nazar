/**
 * User Feature Types
 */

import type { User } from '../schema';

/**
 * User profile data for updates
 */
export interface UserProfile {
  name?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
}

/**
 * User statistics
 */
export interface UserStats {
  totalTasks: number;
  completedTasks: number;
  totalXP: number;
  currentLevel: number;
  journalEntries: number;
  accountAge: number; // days
  lastActive: Date | null;
}

/**
 * User preferences type
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  language?: string;
  [key: string]: unknown;
}

/**
 * API request/response types
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  timezone?: string;
}

export interface UpdatePreferencesRequest {
  preferences: Record<string, unknown>;
}

export interface UserResponse {
  user: User;
  stats?: UserStats;
}

export interface PreferencesResponse {
  preferences: Record<string, unknown>;
}
