/**
 * Task Event Listeners for Gamification
 *
 * Listens to task-related events and awards XP accordingly.
 */

import type { IEventBus } from '@/core/types/event.types';
import type { IGamificationService } from '../services/gamification-service';
import { GAMIFICATION_EVENTS } from '../events';

export interface TaskCompletedPayload {
  timestamp: number;
  userId: string;
  taskId: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
}

/**
 * XP rewards by task priority
 */
const XP_REWARDS = {
  low: 10,
  medium: 25,
  high: 50,
} as const;

/**
 * Register task event listeners
 */
export function registerTaskListeners(
  eventBus: IEventBus,
  gamificationService: IGamificationService
): void {
  // Listen for task completion events
  eventBus.on<TaskCompletedPayload>(
    GAMIFICATION_EVENTS.LISTENS.TASK_COMPLETED,
    async (payload) => {
      try {
        const xpAmount = XP_REWARDS[payload.priority];

        console.log(
          `[Gamification] Task completed: ${payload.title} (${payload.priority}) - Awarding ${xpAmount} XP`
        );

        await gamificationService.awardXP(
          payload.userId,
          xpAmount,
          'task',
          payload.taskId,
          `Completed task: ${payload.title}`
        );

        // Check for achievements after task completion
        await gamificationService.checkAchievements(payload.userId);
      } catch (error) {
        console.error('[Gamification] Error handling task completion:', error);
      }
    },
    {
      featureId: 'gamification',
      priority: 10,
    }
  );

  console.log('[Gamification] Task listeners registered');
}
