/**
 * User Event Listeners for Gamification
 *
 * Listens to user-related events like login for streak tracking.
 */

import type { IEventBus } from '@/core/types/event.types';
import type { IGamificationService } from '../services/gamification-service';
import { GAMIFICATION_EVENTS } from '../events';

export interface UserLoginPayload {
  timestamp: number;
  userId: string;
}

/**
 * Register user event listeners
 */
export function registerUserListeners(
  eventBus: IEventBus,
  gamificationService: IGamificationService
): void {
  // Listen for user login events to update streaks
  eventBus.on<UserLoginPayload>(
    GAMIFICATION_EVENTS.LISTENS.USER_LOGIN,
    async (payload) => {
      try {
        console.log(`[Gamification] User logged in: ${payload.userId} - Updating streak`);

        const streakInfo = await gamificationService.updateStreak(payload.userId);

        // Award bonus XP if streak milestone reached
        if (streakInfo.currentStreak % 7 === 0 && streakInfo.currentStreak > 0) {
          const bonusXP = streakInfo.currentStreak * 5;
          console.log(
            `[Gamification] Streak milestone! ${streakInfo.currentStreak} days - Awarding ${bonusXP} bonus XP`
          );

          await gamificationService.awardXP(
            payload.userId,
            bonusXP,
            'streak',
            undefined,
            `${streakInfo.currentStreak}-day streak milestone`
          );
        }

        // Check for streak-related achievements
        await gamificationService.checkAchievements(payload.userId);
      } catch (error) {
        console.error('[Gamification] Error handling user login:', error);
      }
    },
    {
      featureId: 'gamification',
      priority: 5,
    }
  );

  console.log('[Gamification] User listeners registered');
}
