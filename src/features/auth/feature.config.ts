/**
 * Authentication Feature Configuration
 *
 * Complete feature configuration for authentication system.
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const AuthFeature: FeatureDefinition = {
  id: 'auth',
  name: 'Authentication',
  version: '1.0.0',
  dependencies: ['user'],

  provides: {
    // Routes are defined in src/app/ directory (Next.js App Router)
    // Listed here for documentation/feature discovery only
    routes: [
      // API Routes (actual files in src/app/api/auth/)
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/change-password',
      '/api/auth/verify-email',

      // UI Routes (actual files in src/app/)
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
    ],

    events: {
      emits: [
        'user.login',
        'user.logout',
        'user.registered',
        'auth.failed',
        'auth.password_changed',
        'auth.password_reset_requested',
        'auth.email_verified',
      ],
      listens: [],
    },

    services: {
      'auth-service': () => import('./services/auth-service'),
    },

    tables: [
      'feature_auth_sessions',
      'feature_auth_credentials',
      'feature_auth_verification_tokens',
      'feature_auth_login_attempts',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Auth] Initializing authentication feature...');

    try {
      // Import and create auth service
      const { createAuthService } = await import('./services/auth-service');
      const authService = createAuthService(db, eventBus);

      // Clean up expired sessions on startup
      await authService.cleanupExpiredSessions();
      console.log('[Auth] Cleaned up expired sessions');

      // Clean up old login attempts (older than 7 days)
      await authService.cleanupOldLoginAttempts();
      console.log('[Auth] Cleaned up old login attempts');

      console.log('[Auth] Authentication feature initialized successfully');
    } catch (error) {
      console.error('[Auth] Failed to initialize authentication feature:', error);
      throw error;
    }
  },
};

export default AuthFeature;
