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
    routes: [
      // API Routes
      { path: '/api/auth/register', handler: () => import('./api/register/route') },
      { path: '/api/auth/login', handler: () => import('./api/login/route') },
      { path: '/api/auth/logout', handler: () => import('./api/logout/route') },
      { path: '/api/auth/me', handler: () => import('./api/me/route') },
      { path: '/api/auth/forgot-password', handler: () => import('./api/forgot-password/route') },
      { path: '/api/auth/reset-password', handler: () => import('./api/reset-password/route') },
      { path: '/api/auth/change-password', handler: () => import('./api/change-password/route') },
      { path: '/api/auth/verify-email', handler: () => import('./api/verify-email/route') },

      // UI Routes (for reference - actual routing handled by app directory)
      // { path: '/login', component: () => import('./components/LoginForm') },
      // { path: '/register', component: () => import('./components/RegisterForm') },
      // { path: '/forgot-password', component: () => import('./components/ForgotPasswordForm') },
      // { path: '/reset-password', component: () => import('./components/ResetPasswordForm') },
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
