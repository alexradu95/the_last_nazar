/**
 * Gamification Event Listeners Index
 *
 * Exports all gamification event listeners and provides
 * a convenience function to register them all at once.
 */

import type { IEventBus } from '@/core/types/event.types';
import type { IGamificationService } from '../services/gamification-service';
import { registerTaskListeners } from './task-listeners';
import { registerJournalListeners } from './journal-listeners';
import { registerUserListeners } from './user-listeners';

export * from './task-listeners';
export * from './journal-listeners';
export * from './user-listeners';

/**
 * Register all gamification event listeners
 */
export function registerGamificationListeners(
  eventBus: IEventBus,
  gamificationService: IGamificationService
): void {
  console.log('[Gamification] Registering all event listeners...');

  registerTaskListeners(eventBus, gamificationService);
  registerJournalListeners(eventBus, gamificationService);
  registerUserListeners(eventBus, gamificationService);

  console.log('[Gamification] All event listeners registered successfully');
}
