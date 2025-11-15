/**
 * Feature Configuration
 *
 * Controls which features are enabled and their settings.
 */

/**
 * Enabled features
 * Features are loaded in this order (respecting dependencies)
 */
export const enabledFeatures = [
  // Core features (no dependencies)
  'user',
  'gamification',

  // Features with dependencies
  'auth',         // depends on: user
  'agents',       // no dependencies
  'tasks',        // depends on: gamification
  'journal',      // depends on: agents

  // Future features (disabled for now)
  // 'habits',
  // 'mood-tracker',
  // 'social',
  // 'calendar',
] as const;

/**
 * Feature flags for gradual rollout
 */
export const featureFlags = {
  // Tasks feature flags
  'tasks.categories': true,
  'tasks.ai-suggestions': false,
  'tasks.drag-drop': true,

  // Journal feature flags
  'journal.mood-tracking': true,
  'journal.ai-insights': true,
  'journal.voice-input': false,

  // Gamification feature flags
  'gamification.leaderboards': false,
  'gamification.custom-themes': true,
  'gamification.achievements': true,

  // Agent feature flags
  'agents.voice-mode': false,
  'agents.custom-personalities': false,
  'agents.multi-agent-chat': false,

  // Global flags
  'animations.enabled': true,
  'analytics.enabled': false,
  'debug.mode': process.env.NODE_ENV === 'development',
} as const;

/**
 * Feature-specific settings
 */
export const featureSettings = {
  tasks: {
    maxTasksPerUser: 1000,
    defaultPriority: 'medium' as const,
    xpMultipliers: {
      low: 1,
      medium: 1.5,
      high: 2,
    },
  },

  journal: {
    maxEntriesPerDay: 10,
    minWordCount: 10,
    enabledMoods: ['happy', 'sad', 'stressed', 'excited', 'calm', 'tired'],
  },

  gamification: {
    baseXP: 100,
    levelMultiplier: 1.5,
    maxLevel: 100,
    streakBonusXP: 25,
  },

  agents: {
    responseDelay: 50, // ms per word for mock provider
    maxHistoryLength: 50,
    defaultTemperature: 0.7,
  },
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureId: string): boolean {
  return enabledFeatures.includes(featureId as any);
}

/**
 * Check if a feature flag is enabled
 */
export function isFlagEnabled(flag: string): boolean {
  return featureFlags[flag as keyof typeof featureFlags] === true;
}

/**
 * Get feature settings
 */
export function getFeatureSettings<T extends keyof typeof featureSettings>(
  feature: T
): typeof featureSettings[T] {
  return featureSettings[feature];
}

/**
 * TypeScript types
 */
export type EnabledFeature = typeof enabledFeatures[number];
export type FeatureFlag = keyof typeof featureFlags;
export type FeatureSetting = keyof typeof featureSettings;
