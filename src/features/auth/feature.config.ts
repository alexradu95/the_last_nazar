/**
 * Authentication Feature
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const AuthFeature: FeatureDefinition = {
  id: 'auth',
  name: 'Authentication',
  version: '1.0.0',
  dependencies: ['user'],

  provides: {
    routes: [
      { path: '/login', component: () => import('./components/LoginPage') },
      { path: '/register', component: () => import('./components/RegisterPage') },
      { path: '/api/auth', handler: () => import('./api/route') },
    ],
    events: {
      emits: ['user.login', 'user.logout', 'user.registered'],
      listens: [],
    },
  },

  async initialize({ eventBus }) {
    console.log('[Auth] Feature initialized');
  },
};

export default AuthFeature;
