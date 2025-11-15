/**
 * User Management Feature
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
      { path: '/api/user', handler: () => import('./api/route') },
    ],
    events: {
      emits: ['user.updated', 'preferences.changed'],
      listens: ['user.login'],
    },
    services: {
      'user-service': () => import('./services/user-service'),
    },
    tables: ['feature_users', 'feature_user_preferences'],
  },

  async initialize({ eventBus }) {
    console.log('[User] Feature initialized');
  },
};

export default UserFeature;
