/**
 * Authentication Service
 *
 * Core authentication business logic including registration, login,
 * session management, password reset, and security features.
 */

import type { Database } from '@/core/types/database.types';
import type { IEventBus } from '@/core/types/event.types';
import { eq, and, gte, desc } from 'drizzle-orm';
import { sessions, credentials, verificationTokens, loginAttempts } from '../schema';
import type { Session, NewSession, Credential, NewCredential } from '../schema';
import { users, type User, type NewUser } from '@/features/user/schema';
import { hashPassword, verifyPassword } from '../utils/password';
import { validatePassword, validateEmail } from '../utils/validation';
import { generateSessionToken, generateVerificationToken, generateId } from '../utils/token';
import { AuthError } from '../types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SessionInfo,
} from '../types';

/**
 * Rate limiting configuration
 */
const RATE_LIMITS = {
  loginAttempts: 5,
  timeWindow: 15 * 60 * 1000, // 15 minutes
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
};

/**
 * Session expiration configuration
 */
const SESSION_EXPIRATION = {
  default: 24 * 60 * 60 * 1000, // 24 hours
  rememberMe: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Authentication Service
 */
export class AuthService {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const { email, password, name } = request;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      throw new AuthError('INVALID_EMAIL', emailValidation.error || 'Invalid email');
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new AuthError('WEAK_PASSWORD', passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      throw new AuthError('EMAIL_EXISTS', 'An account with this email already exists');
    }

    // Hash password
    const { hash, salt } = await hashPassword(password);

    // Create user
    const userId = generateId('usr');
    const [user] = await this.db
      .insert(users)
      .values({
        id: userId,
        email: email.toLowerCase(),
        name,
        timezone: 'UTC',
      })
      .returning();

    // Create credentials
    const credentialId = generateId('cred');
    await this.db.insert(credentials).values({
      id: credentialId,
      userId: user.id,
      passwordHash: hash,
      salt,
    });

    // Create verification token
    const verificationToken = generateVerificationToken();
    const tokenId = generateId('token');
    await this.db.insert(verificationTokens).values({
      id: tokenId,
      userId: user.id,
      token: verificationToken,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Create session
    const sessionToken = await this.createSession(user.id);

    // Emit event
    await this.eventBus.emit('user.registered', {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: Date.now(),
    });

    console.log(`[AuthService] User registered: ${user.id} - ${user.email}`);

    return {
      user,
      token: sessionToken,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login user
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const { email, password, rememberMe } = request;

    // Check rate limit
    const canAttempt = await this.checkRateLimit(email);
    if (!canAttempt) {
      await this.logLoginAttempt(email, false);
      throw new AuthError('RATE_LIMIT_EXCEEDED', 'Too many failed login attempts. Please try again later.');
    }

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      await this.logLoginAttempt(email, false);
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Get credentials
    const [cred] = await this.db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, user.id))
      .limit(1);

    if (!cred) {
      await this.logLoginAttempt(email, false);
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(password, cred.passwordHash);
    if (!isValid) {
      await this.logLoginAttempt(email, false);
      throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Log successful attempt
    await this.logLoginAttempt(email, true);

    // Update last login
    await this.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Create session
    const sessionToken = await this.createSession(user.id, undefined, undefined, rememberMe);

    // Emit event
    await this.eventBus.emit('user.login', {
      userId: user.id,
      email: user.email,
      timestamp: Date.now(),
    });

    console.log(`[AuthService] User logged in: ${user.id}`);

    return {
      user,
      token: sessionToken,
    };
  }

  /**
   * Logout user
   */
  async logout(token: string): Promise<void> {
    const session = await this.findSessionByToken(token);
    if (!session) {
      return; // Already logged out or invalid token
    }

    await this.deleteSession(token);

    // Emit event
    await this.eventBus.emit('user.logout', {
      userId: session.userId,
      timestamp: Date.now(),
    });

    console.log(`[AuthService] User logged out: ${session.userId}`);
  }

  /**
   * Validate session and return user
   */
  async validateSession(token: string): Promise<User | null> {
    const session = await this.findSessionByToken(token);
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.deleteSession(token);
      return null;
    }

    // Get user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    return user || null;
  }

  /**
   * Create session
   */
  async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
    rememberMe?: boolean
  ): Promise<string> {
    const token = generateSessionToken();
    const sessionId = generateId('sess');
    const expiresAt = new Date(
      Date.now() + (rememberMe ? SESSION_EXPIRATION.rememberMe : SESSION_EXPIRATION.default)
    );

    await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });

    console.log(`[AuthService] Session created for user: ${userId}`);

    return token;
  }

  /**
   * Delete session
   */
  async deleteSession(token: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.token, token));
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string, currentToken?: string): Promise<SessionInfo[]> {
    const userSessions = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.createdAt));

    return userSessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt),
      expiresAt: session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt),
      isCurrent: session.token === currentToken,
    }));
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllSessions(userId: string, exceptToken?: string): Promise<void> {
    if (exceptToken) {
      const [currentSession] = await this.db
        .select()
        .from(sessions)
        .where(eq(sessions.token, exceptToken))
        .limit(1);

      if (currentSession) {
        await this.db
          .delete(sessions)
          .where(and(eq(sessions.userId, userId), eq(sessions.id, currentSession.id)));
      }
    } else {
      await this.db.delete(sessions).where(eq(sessions.userId, userId));
    }

    console.log(`[AuthService] All sessions deleted for user: ${userId}`);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    // Find user (don't reveal if user exists)
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      // Don't reveal that user doesn't exist
      console.log(`[AuthService] Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = generateVerificationToken();
    const tokenId = generateId('token');

    await this.db.insert(verificationTokens).values({
      id: tokenId,
      userId: user.id,
      token: resetToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // TODO: Send email with reset token
    console.log(`[AuthService] Password reset token generated for: ${user.email}`);
    console.log(`[AuthService] Reset token: ${resetToken}`); // Remove this in production
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      throw new AuthError('WEAK_PASSWORD', validation.errors.join(', '));
    }

    // Find token
    const [verificationToken] = await this.db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, 'password_reset')))
      .limit(1);

    if (!verificationToken) {
      throw new AuthError('INVALID_TOKEN', 'Invalid or expired reset token');
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      throw new AuthError('TOKEN_EXPIRED', 'Reset token has expired');
    }

    // Check if token was already used
    if (verificationToken.usedAt) {
      throw new AuthError('INVALID_TOKEN', 'Reset token has already been used');
    }

    // Hash new password
    const { hash, salt } = await hashPassword(newPassword);

    // Update credentials
    await this.db
      .update(credentials)
      .set({
        passwordHash: hash,
        salt,
        lastPasswordChange: new Date(),
      })
      .where(eq(credentials.userId, verificationToken.userId));

    // Mark token as used
    await this.db
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, verificationToken.id));

    // Delete all sessions for this user (force re-login)
    await this.deleteAllSessions(verificationToken.userId);

    console.log(`[AuthService] Password reset for user: ${verificationToken.userId}`);
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      throw new AuthError('WEAK_PASSWORD', validation.errors.join(', '));
    }

    // Get credentials
    const [cred] = await this.db
      .select()
      .from(credentials)
      .where(eq(credentials.userId, userId))
      .limit(1);

    if (!cred) {
      throw new AuthError('USER_NOT_FOUND', 'User credentials not found');
    }

    // Verify old password
    const isValid = await verifyPassword(oldPassword, cred.passwordHash);
    if (!isValid) {
      throw new AuthError('INVALID_CREDENTIALS', 'Current password is incorrect');
    }

    // Hash new password
    const { hash, salt } = await hashPassword(newPassword);

    // Update credentials
    await this.db
      .update(credentials)
      .set({
        passwordHash: hash,
        salt,
        lastPasswordChange: new Date(),
      })
      .where(eq(credentials.userId, userId));

    console.log(`[AuthService] Password changed for user: ${userId}`);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<boolean> {
    const [verificationToken] = await this.db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.token, token), eq(verificationTokens.type, 'email_verification')))
      .limit(1);

    if (!verificationToken) {
      throw new AuthError('INVALID_TOKEN', 'Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new AuthError('TOKEN_EXPIRED', 'Verification token has expired');
    }

    if (verificationToken.usedAt) {
      return true; // Already verified
    }

    // Mark token as used
    await this.db
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, verificationToken.id));

    console.log(`[AuthService] Email verified for user: ${verificationToken.userId}`);

    return true;
  }

  /**
   * Check rate limit
   */
  private async checkRateLimit(email: string): Promise<boolean> {
    const since = new Date(Date.now() - RATE_LIMITS.timeWindow);

    const attempts = await this.db
      .select()
      .from(loginAttempts)
      .where(and(eq(loginAttempts.email, email.toLowerCase()), gte(loginAttempts.timestamp, since)));

    const failedAttempts = attempts.filter((a) => !a.success).length;

    return failedAttempts < RATE_LIMITS.loginAttempts;
  }

  /**
   * Log login attempt
   */
  private async logLoginAttempt(email: string, success: boolean): Promise<void> {
    const attemptId = generateId('attempt');

    await this.db.insert(loginAttempts).values({
      id: attemptId,
      email: email.toLowerCase(),
      success,
    });
  }

  /**
   * Find session by token
   */
  private async findSessionByToken(token: string): Promise<Session | null> {
    const [session] = await this.db.select().from(sessions).where(eq(sessions.token, token)).limit(1);

    return session || null;
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.db.delete(sessions).where(gte(sessions.expiresAt, new Date()));

    console.log(`[AuthService] Cleaned up expired sessions`);

    return 0; // SQLite doesn't return affected rows easily
  }

  /**
   * Clean up old login attempts (should be run periodically)
   */
  async cleanupOldLoginAttempts(): Promise<void> {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    await this.db.delete(loginAttempts).where(gte(loginAttempts.timestamp, cutoff));

    console.log(`[AuthService] Cleaned up old login attempts`);
  }
}

/**
 * Factory function to create AuthService
 */
export function createAuthService(db: Database, eventBus: IEventBus): AuthService {
  return new AuthService(db, eventBus);
}
