/**
 * Authentication Events
 *
 * Event definitions for authentication feature.
 */

/**
 * Event names
 */
export const AUTH_EVENTS = {
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTERED: 'user.registered',
  AUTH_FAILED: 'auth.failed',
  PASSWORD_CHANGED: 'auth.password_changed',
  PASSWORD_RESET_REQUESTED: 'auth.password_reset_requested',
  EMAIL_VERIFIED: 'auth.email_verified',
} as const;

/**
 * User login event
 */
export type UserLoginEvent = {
  userId: string;
  email: string;
  timestamp: number;
};

/**
 * User logout event
 */
export type UserLogoutEvent = {
  userId: string;
  timestamp: number;
};

/**
 * User registered event
 */
export type UserRegisteredEvent = {
  userId: string;
  email: string;
  name: string;
  timestamp: number;
};

/**
 * Auth failed event
 */
export type AuthFailedEvent = {
  email: string;
  reason: string;
  timestamp: number;
};

/**
 * Password changed event
 */
export type PasswordChangedEvent = {
  userId: string;
  timestamp: number;
};

/**
 * Password reset requested event
 */
export type PasswordResetRequestedEvent = {
  email: string;
  timestamp: number;
};

/**
 * Email verified event
 */
export type EmailVerifiedEvent = {
  userId: string;
  email: string;
  timestamp: number;
};
