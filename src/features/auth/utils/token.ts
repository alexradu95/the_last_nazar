/**
 * Token generation utilities
 */

import { randomBytes } from 'crypto';

/**
 * Generate a random secure token
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate a session token (64 characters)
 */
export function generateSessionToken(): string {
  return generateToken(32); // 32 bytes = 64 hex characters
}

/**
 * Generate a verification token (48 characters)
 */
export function generateVerificationToken(): string {
  return generateToken(24); // 24 bytes = 48 hex characters
}

/**
 * Generate a unique ID using timestamp and random bytes
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  const id = `${timestamp}${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}
