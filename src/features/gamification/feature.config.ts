/**
 * Gamification Feature
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const GamificationFeature: FeatureDefinition = {
  id: 'gamification',
  name: 'Gamification & XP',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/api/game', handler: () => import('./api/route') },
    ],
    events: {
      emits: ['xp.awarded', 'level.up', 'achievement.unlocked', 'streak.updated'],
      listens: ['task.completed', 'journal.created', 'habit.completed'],
    },
    services: {
      'xp-service': () => import('./services/xp-service'),
      'achievement-service': () => import('./services/achievement-service'),
    },
    tables: ['feature_user_game_state', 'feature_achievements', 'feature_user_achievements'],
  },

  async initialize({ eventBus }) {
    console.log('[Gamification] Feature initialized');
    // TODO: Listen to events and award XP
  },
};

export default GamificationFeature;
