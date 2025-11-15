/**
 * AI Agents Feature Configuration
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const AgentsFeature: FeatureDefinition = {
  id: 'agents',
  name: 'AI Agents',
  version: '1.0.0',
  dependencies: [],

  provides: {
    // Routes are defined in src/app/ directory (Next.js App Router)
    // Listed here for documentation/feature discovery only
    routes: [
      // UI Routes (actual files in src/app/agents/)
      '/agents',
      '/agents/[agentId]',

      // API Routes (actual files in src/app/api/agents/)
      '/api/agents/chat',
      '/api/agents/conversations',
      '/api/agents/messages',
      '/api/agents/suggestions',
      '/api/agents/suggestions/[id]/dismiss',
      '/api/agents/insights',
    ],

    events: {
      emits: ['agent.message', 'agent.suggestion', 'agent.insight'],
      listens: ['user.login', 'task.completed', 'level.up', 'journal.created', 'mood.logged'],
    },

    services: {
      'agent-service': () => import('./services'),
    },

    tables: [
      'feature_agents_conversations',
      'feature_agents_messages',
      'feature_agents_suggestions',
      'feature_agents_insights',
    ],
  },

  async initialize({ eventBus, registry, db }) {
    console.log('[Agents] Initializing...');

    const { createAgentService } = await import('./services');
    const agentService = createAgentService(db, eventBus);

    // Register service
    registry.registerService('agent-service', agentService);

    // Dawn: Morning briefings on user login
    eventBus.on('user.login', async (payload) => {
      const hour = new Date().getHours();
      // Send morning briefing between 6 AM and 12 PM
      if (hour >= 6 && hour < 12) {
        await agentService.sendAutomatedMessage(
          payload.userId,
          'dawn',
          'morning_briefing',
          { hour }
        );
      }
    });

    // Dawn: Task completion celebration
    eventBus.on('task.completed', async (payload) => {
      // Only respond occasionally to avoid spam (30% chance)
      if (Math.random() < 0.3) {
        await agentService.sendAutomatedMessage(
          payload.userId,
          'dawn',
          'task_completed',
          { xpReward: payload.xpReward, priority: payload.priority }
        );
      }
    });

    // Dawn: Level up celebration
    eventBus.on('level.up', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'dawn',
        'level_up',
        { newLevel: payload.newLevel }
      );
    });

    // Dawn: Streak milestones
    eventBus.on('streak.milestone', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'dawn',
        'streak_milestone',
        { streakDays: payload.streakDays }
      );
    });

    // Luna: Journal entry insights
    eventBus.on('journal.created', async (payload) => {
      // Respond to journal entries (50% chance to avoid spam)
      if (Math.random() < 0.5) {
        await agentService.sendAutomatedMessage(
          payload.userId,
          'luna',
          'journal_created',
          { wordCount: payload.wordCount }
        );
      }
    });

    // Luna: Mood logging
    eventBus.on('mood.logged', async (payload) => {
      await agentService.sendAutomatedMessage(
        payload.userId,
        'luna',
        'mood_response',
        { mood: payload.mood }
      );
    });

    // Atlas: Weekly productivity insights (would need scheduler in production)
    // For now, this would be triggered manually or by a cron job
    // eventBus.on('week.ended', async (payload) => {
    //   await agentService.sendAutomatedMessage(
    //     payload.userId,
    //     'atlas',
    //     'weekly_insight',
    //     { stats: payload.stats }
    //   );
    // });

    console.log('[Agents] Initialized successfully');
  },

  async cleanup({ eventBus }) {
    console.log('[Agents] Feature cleanup');
    // Event listeners are automatically cleaned up by the event bus
  },
};

export default AgentsFeature;
