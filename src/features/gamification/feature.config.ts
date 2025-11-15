/**
 * Gamification Feature Configuration
 *
 * XP system, levels, achievements, and streaks to gamify productivity.
 */

import type { FeatureDefinition } from '@/core/types/feature.types';
import type {
  TaskCompletedPayload,
  JournalCreatedPayload,
  UserLoginPayload,
} from './events';

export const GamificationFeature: FeatureDefinition = {
  id: 'gamification',
  name: 'Gamification & XP System',
  version: '1.0.0',

  // No dependencies - this feature listens to events from other features
  dependencies: [],

  provides: {
    // Routes would be defined in src/app/ directory (Next.js App Router)
    // Listed here for documentation/feature discovery only
    // Note: These routes are NOT yet implemented in src/app/
    routes: [
      {
        path: '/api/gamification/stats',
        handler: () => import('./api/stats/route'),
      },
      {
        path: '/api/gamification/xp-history',
        handler: () => import('./api/xp-history/route'),
      },
      {
        path: '/api/gamification/achievements',
        handler: () => import('./api/achievements/route'),
      },
      {
        path: '/api/gamification/leaderboard',
        handler: () => import('./api/leaderboard/route'),
      },
      {
        path: '/api/gamification/award-xp',
        handler: () => import('./api/award-xp/route'),
      },
    ],

    events: {
      emits: ['xp.awarded', 'level.up', 'achievement.unlocked', 'streak.updated'],
      listens: ['task.completed', 'journal.created', 'user.login'],
    },

    services: {
      'gamification-service': () => import('./services/gamification-service'),
    },

    tables: [
      'feature_gamification_user_stats',
      'feature_gamification_xp_history',
      'feature_gamification_achievements',
      'feature_gamification_user_achievements',
    ],
  },

  async initialize({ eventBus, db }) {
    console.log('[Gamification] Initializing feature...');

    // Import service
    const { createGamificationService } = await import('./services/gamification-service');
    const gamificationService = createGamificationService(db, eventBus);

    // Seed achievements
    try {
      await gamificationService.seedAchievements();
      console.log('[Gamification] Achievements seeded successfully');
    } catch (error) {
      console.error('[Gamification] Error seeding achievements:', error);
    }

    // ========================================
    // Event Listeners
    // ========================================

    /**
     * Listen to task.completed event
     * Award XP when tasks are completed
     */
    eventBus.on('task.completed', async (payload: TaskCompletedPayload) => {
      try {
        console.log(`[Gamification] Task completed by user ${payload.userId}, awarding ${payload.xpReward} XP`);

        await gamificationService.awardXP(
          payload.userId,
          payload.xpReward,
          'task',
          payload.taskId,
          `Completed task: ${payload.taskId}`
        );

        // Check for achievements after task completion
        const newAchievements = await gamificationService.checkAchievements(payload.userId);
        if (newAchievements.length > 0) {
          console.log(`[Gamification] User ${payload.userId} unlocked ${newAchievements.length} achievement(s)`);
        }
      } catch (error) {
        console.error('[Gamification] Error handling task.completed event:', error);
      }
    });

    /**
     * Listen to journal.created event
     * Award XP based on word count
     */
    eventBus.on('journal.created', async (payload: JournalCreatedPayload) => {
      try {
        // Award XP based on word count (1 XP per 10 words, max 100 XP)
        const xpAmount = Math.min(Math.floor(payload.wordCount / 10), 100);

        if (xpAmount > 0) {
          console.log(`[Gamification] Journal entry created by user ${payload.userId}, awarding ${xpAmount} XP`);

          await gamificationService.awardXP(
            payload.userId,
            xpAmount,
            'journal',
            payload.journalId,
            `Wrote journal entry (${payload.wordCount} words)`
          );

          // Check for achievements
          await gamificationService.checkAchievements(payload.userId);
        }
      } catch (error) {
        console.error('[Gamification] Error handling journal.created event:', error);
      }
    });

    /**
     * Listen to user.login event
     * Update daily streak
     */
    eventBus.on('user.login', async (payload: UserLoginPayload) => {
      try {
        console.log(`[Gamification] User ${payload.userId} logged in, checking streak`);

        const streakInfo = await gamificationService.updateStreak(payload.userId);

        if (streakInfo.streakIncreased) {
          console.log(`[Gamification] Streak increased to ${streakInfo.currentStreak} days`);

          // Award bonus XP for maintaining streak
          if (streakInfo.currentStreak >= 7) {
            const bonusXP = streakInfo.currentStreak * 2;
            await gamificationService.awardXP(
              payload.userId,
              bonusXP,
              'streak',
              undefined,
              `Streak bonus: ${streakInfo.currentStreak} days`
            );
          }

          // Check for streak achievements
          await gamificationService.checkAchievements(payload.userId);
        }

        if (streakInfo.streakBroken) {
          console.log(`[Gamification] Streak broken for user ${payload.userId}, reset to 1`);
        }
      } catch (error) {
        console.error('[Gamification] Error handling user.login event:', error);
      }
    });

    /**
     * Listen to level.up event (our own event)
     * Check for level-based achievements
     */
    eventBus.on('level.up', async (payload: any) => {
      try {
        console.log(`[Gamification] User ${payload.userId} leveled up to level ${payload.newLevel}!`);

        // Check for level-based achievements
        await gamificationService.checkAchievements(payload.userId);
      } catch (error) {
        console.error('[Gamification] Error handling level.up event:', error);
      }
    });

    console.log('[Gamification] Feature initialized successfully');
    console.log('[Gamification] Listening to: task.completed, journal.created, user.login');
    console.log('[Gamification] Emitting: xp.awarded, level.up, achievement.unlocked, streak.updated');
  },

  async cleanup({ eventBus }) {
    console.log('[Gamification] Cleaning up feature...');
    // Event listeners are automatically cleaned up by the event bus
    console.log('[Gamification] Feature cleanup complete');
  },

  healthCheck() {
    // Feature is always healthy if initialized
    return true;
  },
};

export default GamificationFeature;
