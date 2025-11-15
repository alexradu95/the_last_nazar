/**
 * AI Agents Feature
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const AgentsFeature: FeatureDefinition = {
  id: 'agents',
  name: 'AI Agents',
  version: '1.0.0',
  dependencies: [],

  provides: {
    routes: [
      { path: '/api/agents/dawn', handler: () => import('./dawn/api/route') },
      { path: '/api/agents/atlas', handler: () => import('./atlas/api/route') },
      { path: '/api/agents/luna', handler: () => import('./luna/api/route') },
    ],
    events: {
      emits: ['agent.message', 'agent.suggestion'],
      listens: ['user.login', 'task.created', 'task.completed', 'journal.created'],
    },
    services: {
      'dawn-agent': () => import('./dawn/service'),
      'atlas-agent': () => import('./atlas/service'),
      'luna-agent': () => import('./luna/service'),
    },
    tables: ['feature_agent_interactions'],
  },

  async initialize({ eventBus }) {
    console.log('[Agents] Feature initialized');
  },
};

export default AgentsFeature;
