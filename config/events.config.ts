/**
 * Event Catalog
 *
 * Documents all events in the system for reference and validation.
 */

import type { BaseEventPayload } from '@/core/types/event.types';

/**
 * Event catalog with payload type definitions
 */
export const EventCatalog = {
  // ============================================
  // USER EVENTS
  // ============================================
  'user.login': {
    description: 'User successfully logged in',
    emitter: 'auth',
    payload: {
      userId: 'string',
      timestamp: 'number',
    },
  },

  'user.logout': {
    description: 'User logged out',
    emitter: 'auth',
    payload: {
      userId: 'string',
      timestamp: 'number',
    },
  },

  'user.registered': {
    description: 'New user registered',
    emitter: 'auth',
    payload: {
      userId: 'string',
      email: 'string',
      timestamp: 'number',
    },
  },

  'user.updated': {
    description: 'User profile updated',
    emitter: 'user',
    payload: {
      userId: 'string',
      changes: 'object',
      timestamp: 'number',
    },
  },

  'preferences.changed': {
    description: 'User preferences changed',
    emitter: 'user',
    payload: {
      userId: 'string',
      preferences: 'object',
      timestamp: 'number',
    },
  },

  // ============================================
  // TASK EVENTS
  // ============================================
  'task.created': {
    description: 'New task created',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      title: 'string',
      priority: 'string',
      timestamp: 'number',
    },
    listeners: ['gamification', 'agents'],
  },

  'task.completed': {
    description: 'Task marked as complete',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      xpReward: 'number',
      priority: 'string',
      timestamp: 'number',
    },
    listeners: ['gamification', 'agents'],
  },

  'task.updated': {
    description: 'Task details updated',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      changes: 'object',
      timestamp: 'number',
    },
  },

  'task.deleted': {
    description: 'Task deleted',
    emitter: 'tasks',
    payload: {
      taskId: 'string',
      userId: 'string',
      timestamp: 'number',
    },
  },

  // ============================================
  // GAMIFICATION EVENTS
  // ============================================
  'xp.awarded': {
    description: 'XP awarded to user',
    emitter: 'gamification',
    payload: {
      userId: 'string',
      amount: 'number',
      source: 'string',
      timestamp: 'number',
    },
    listeners: ['agents'],
  },

  'level.up': {
    description: 'User leveled up',
    emitter: 'gamification',
    payload: {
      userId: 'string',
      newLevel: 'number',
      timestamp: 'number',
    },
    listeners: ['agents'],
  },

  'achievement.unlocked': {
    description: 'Achievement unlocked',
    emitter: 'gamification',
    payload: {
      userId: 'string',
      achievementId: 'string',
      timestamp: 'number',
    },
    listeners: ['agents'],
  },

  'streak.updated': {
    description: 'Daily streak updated',
    emitter: 'gamification',
    payload: {
      userId: 'string',
      streakCount: 'number',
      timestamp: 'number',
    },
    listeners: ['agents'],
  },

  // ============================================
  // JOURNAL EVENTS
  // ============================================
  'journal.created': {
    description: 'New journal entry created',
    emitter: 'journal',
    payload: {
      entryId: 'string',
      userId: 'string',
      wordCount: 'number',
      timestamp: 'number',
    },
    listeners: ['gamification', 'agents'],
  },

  'journal.updated': {
    description: 'Journal entry updated',
    emitter: 'journal',
    payload: {
      entryId: 'string',
      userId: 'string',
      timestamp: 'number',
    },
  },

  'mood.logged': {
    description: 'User mood logged',
    emitter: 'journal',
    payload: {
      userId: 'string',
      mood: 'string',
      timestamp: 'number',
    },
    listeners: ['agents'],
  },

  // ============================================
  // AGENT EVENTS
  // ============================================
  'agent.message': {
    description: 'Agent sent a message',
    emitter: 'agents',
    payload: {
      agentId: 'string',
      userId: 'string',
      message: 'string',
      timestamp: 'number',
    },
  },

  'agent.suggestion': {
    description: 'Agent made a suggestion',
    emitter: 'agents',
    payload: {
      agentId: 'string',
      userId: 'string',
      suggestion: 'string',
      type: 'string',
      timestamp: 'number',
    },
  },

  // ============================================
  // FEATURE LIFECYCLE EVENTS
  // ============================================
  'feature.registered': {
    description: 'Feature registered in system',
    emitter: 'core',
    payload: {
      featureId: 'string',
      timestamp: 'number',
    },
  },

  'feature.unregistered': {
    description: 'Feature unregistered from system',
    emitter: 'core',
    payload: {
      featureId: 'string',
      timestamp: 'number',
    },
  },
} as const;

/**
 * Event flow diagram (for documentation)
 */
export const eventFlows = {
  taskCompletion: `
    user completes task
    → tasks emits 'task.completed'
    → gamification listens, awards XP
    → gamification emits 'xp.awarded'
    → agents listens, generates celebration message
    → if level up, gamification emits 'level.up'
  `,

  journalEntry: `
    user writes journal entry
    → journal emits 'journal.created'
    → gamification listens, awards XP
    → agents (Luna) listens, generates insight
    → journal emits 'mood.logged' if mood detected
  `,

  userLogin: `
    user logs in
    → auth emits 'user.login'
    → tasks listens, loads user tasks
    → journal listens, loads entries
    → agents (Dawn) listens, generates morning briefing
  `,
};

/**
 * Get all events for a feature
 */
export function getFeatureEvents(featureId: string): {
  emits: string[];
  listens: string[];
} {
  const emits: string[] = [];
  const listens: string[] = [];

  for (const [eventName, config] of Object.entries(EventCatalog)) {
    if (config.emitter === featureId) {
      emits.push(eventName);
    }
    if (config.listeners?.includes(featureId)) {
      listens.push(eventName);
    }
  }

  return { emits, listens };
}

/**
 * Validate event name exists
 */
export function isValidEvent(eventName: string): boolean {
  return eventName in EventCatalog;
}

/**
 * TypeScript types
 */
export type EventName = keyof typeof EventCatalog;
