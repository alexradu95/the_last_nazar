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
    // Routes would be defined in src/app/ directory (Next.js App Router)
    // Listed here for documentation/feature discovery only
    // Note: These routes are NOT yet implemented in src/app/
    routes: [
            '/journal',
            '/api/journal',
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
