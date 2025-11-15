/**
 * Journal Event Listeners for Gamification
 *
 * Listens to journal-related events and awards XP accordingly.
 */

import type { IEventBus } from '@/core/types/event.types';
import type { IGamificationService } from '../services/gamification-service';
import { GAMIFICATION_EVENTS } from '../events';

export interface JournalCreatedPayload {
  timestamp: number;
  userId: string;
  journalId: string;
  wordCount: number;
  hasMood: boolean;
}

/**
 * XP rewards for journal activities
 */
const JOURNAL_XP = {
  base: 15,
  withMood: 5,
  longEntry: 10, // 500+ words
} as const;

/**
 * Register journal event listeners
 */
export function registerJournalListeners(
  eventBus: IEventBus,
  gamificationService: IGamificationService
): void {
  // Listen for journal creation events
  eventBus.on<JournalCreatedPayload>(
    GAMIFICATION_EVENTS.LISTENS.JOURNAL_CREATED,
    async (payload) => {
      try {
        let xpAmount = JOURNAL_XP.base;

        // Bonus for including mood
        if (payload.hasMood) {
          xpAmount += JOURNAL_XP.withMood;
        }

        // Bonus for longer entries
        if (payload.wordCount >= 500) {
          xpAmount += JOURNAL_XP.longEntry;
        }

        console.log(
          `[Gamification] Journal created (${payload.wordCount} words) - Awarding ${xpAmount} XP`
        );

        await gamificationService.awardXP(
          payload.userId,
          xpAmount,
          'journal',
          payload.journalId,
          'Created journal entry'
        );

        // Check for achievements after journal creation
        await gamificationService.checkAchievements(payload.userId);
      } catch (error) {
        console.error('[Gamification] Error handling journal creation:', error);
      }
    },
    {
      featureId: 'gamification',
      priority: 10,
    }
  );

  console.log('[Gamification] Journal listeners registered');
}
