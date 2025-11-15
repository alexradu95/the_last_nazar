/**
 * Journal Feature
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const JournalFeature: FeatureDefinition = {
  id: 'journal',
  name: 'Journal & Reflection',
  version: '1.0.0',
  dependencies: ['agents'],

  provides: {
    routes: [
      { path: '/journal', component: () => import('./components/JournalPage') },
      { path: '/api/journal', handler: () => import('./api/route') },
    ],
    events: {
      emits: ['journal.created', 'journal.updated', 'mood.logged'],
      listens: ['user.login'],
    },
    services: { 'journal-service': () => import('./services/journal-service') },
    tables: ['feature_journal_entries'],
  },

  async initialize({ eventBus }) {
    console.log('[Journal] Feature initialized');
  },
};

export default JournalFeature;
