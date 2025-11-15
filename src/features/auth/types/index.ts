/**
 * Authentication types
 */

import type { User } from '@/features/user/schema';

/**
 * Login request payload
 */
export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/**
 * Login response
 */
export type LoginResponse = {
  user: User;
  token: string;
};

/**
 * Registration request payload
 */
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

/**
 * Registration response
 */
export type RegisterResponse = {
  user: User;
  token: string;
  message: string;
};

/**
 * Password reset request
 */
export type PasswordResetRequest = {
  email: string;
};

/**
 * Password reset confirmation
 */
export type PasswordResetConfirmation = {
  token: string;
  newPassword: string;
};

/**
 * Change password request
 */
export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

/**
 * Email verification request
 */
export type EmailVerificationRequest = {
  token: string;
};

/**
 * Session info for display
 */
export type SessionInfo = {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
};

/**
 * Auth error types
 */
export type AuthErrorType =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL';

/**
 * Auth error
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
