/**
 * User Management Feature
 *
 * Handles user profiles, preferences, and settings
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const UserFeature: FeatureDefinition = {
  id: 'user',
  name: 'User Management',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/settings', component: () => import('./components/SettingsPage') },
      { path: '/api/users', handler: () => import('./api/route') },
      { path: '/api/users/:id', handler: () => import('./api/[id]/route') },
      {
        path: '/api/users/:id/preferences',
        handler: () => import('./api/[id]/preferences/route'),
      },
    ],

    events: {
      emits: ['user.registered', 'user.updated', 'user.deleted', 'preferences.changed'],
      listens: ['user.login', 'user.logout'],
    },

    services: {
      'user-service': () => import('./services/user-service'),
    },

    components: {
      UserAvatar: () => import('./components/UserAvatar'),
      UserProfilePage: () => import('./components/UserProfilePage'),
      UserSettings: () => import('./components/UserSettings'),
    },

    tables: ['feature_users', 'feature_user_preferences'],
  },

  async initialize({ eventBus, db }) {
    console.log('[User] Initializing feature...');

    // Import user service for event handlers
    const { createUserService } = await import('./services/user-service');
    const userService = createUserService(db, eventBus);

    // Setup event listeners
    eventBus.on('user.login', async (payload: any) => {
      console.log(`[User] User logged in: ${payload.userId}`);
      // Update last login timestamp
      await userService.updateLastLogin(payload.userId);
    });

    eventBus.on('user.logout', async (payload: any) => {
      console.log(`[User] User logged out: ${payload.userId}`);
    });

    console.log('[User] Feature initialized successfully');
    console.log('[User] Listening to: user.login, user.logout');
    console.log(
      '[User] Emitting: user.registered, user.updated, user.deleted, preferences.changed'
    );
  },

  async cleanup({ eventBus }) {
    console.log('[User] Cleaning up feature...');
    // Event listeners are automatically cleaned up by the event bus
    console.log('[User] Feature cleanup complete');
  },
};

export default UserFeature;
