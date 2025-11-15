/**
 * Validation Schemas
 *
 * Zod schemas for user feature API validation.
 */

import { z } from 'zod';

/**
 * Create user schema
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  timezone: z.string().optional(),
});

/**
 * Update user schema
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  timezone: z.string().optional(),
});

/**
 * Preferences schema
 */
export const PreferencesSchema = z.record(z.unknown());

/**
 * Update preferences schema
 */
export const UpdatePreferencesSchema = z.object({
  preferences: z.record(z.unknown()),
});
