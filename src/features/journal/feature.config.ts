/**
 * Journal Feature Configuration
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const JournalFeature: FeatureDefinition = {
  id: 'journal',
  name: 'Journal & Reflection',
  version: '1.0.0',
  dependencies: [], // Agents is optional - can work without it

  provides: {
    routes: [
      { path: '/journal', component: () => import('./components/JournalPage') },
      { path: '/api/journal', handler: () => import('./api/route') },
      { path: '/api/journal/stats', handler: () => import('./api/stats/route') },
      { path: '/api/journal/prompts', handler: () => import('./api/prompts/route') },
      { path: '/api/journal/mood', handler: () => import('./api/mood/route') },
    ],

    events: {
      emits: [
        'journal.created',
        'journal.updated',
        'journal.deleted',
        'mood.logged',
        'journal.daily-prompt-ready',
        'journal.streak-milestone',
      ],
      listens: ['user.login', 'xp.gained'],
    },

    services: {
      'journal-service': () => import('./services/journal-service'),
    },

    tables: [
      'feature_journal_entries',
      'feature_journal_prompts',
      'feature_journal_insights',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Journal] Initializing journal feature...');

    try {
      const { createJournalService } = await import('./services/journal-service');
      const journalService = createJournalService(db, eventBus);

      // Seed journal prompts
      await journalService.seedPrompts();
      console.log('[Journal] Journal prompts seeded');

      // Setup event listeners
      const { setupJournalEventListeners, setupGamificationIntegration } = await import(
        './events'
      );

      setupJournalEventListeners(eventBus, journalService);
      setupGamificationIntegration(eventBus);
      console.log('[Journal] Event listeners registered');

      // Listen for user login to show daily prompt
      eventBus.on('user.login', async (payload: { userId: string }) => {
        const todayEntry = await journalService.getEntryForToday(payload.userId);

        if (!todayEntry) {
          const prompt = await journalService.getDailyPrompt();
          console.log(`[Journal] 📝 Daily prompt ready: "${prompt.prompt}"`);
        }
      });

      console.log('[Journal] ✓ Feature initialized successfully');
    } catch (error) {
      console.error('[Journal] ✗ Initialization failed:', error);
      throw error;
    }
  },
};

export default JournalFeature;
