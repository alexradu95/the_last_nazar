/**
 * Journal Feature Events
 *
 * Defines event payload types for journal feature communication.
 */

import type { BaseEventPayload } from '@/core/types/event.types';

/**
 * Journal entry created event
 */
export interface JournalCreatedPayload extends BaseEventPayload {
  journalId: string;
  wordCount: number;
  hasMood: boolean;
  mood?: number;
  tags?: string[];
}

/**
 * Journal entry updated event
 */
export interface JournalUpdatedPayload extends BaseEventPayload {
  journalId: string;
  wordCount: number;
  changes: string[];
}

/**
 * Journal entry deleted event
 */
export interface JournalDeletedPayload extends BaseEventPayload {
  journalId: string;
}

/**
 * Journal streak updated event
 */
export interface JournalStreakUpdatedPayload extends BaseEventPayload {
  currentStreak: number;
  longestStreak: number;
  isNewRecord: boolean;
}

/**
 * Event names for journal feature
 */
export const JOURNAL_EVENTS = {
  EMITS: {
    JOURNAL_CREATED: 'journal.created',
    JOURNAL_UPDATED: 'journal.updated',
    JOURNAL_DELETED: 'journal.deleted',
    STREAK_UPDATED: 'journal.streak.updated',
  },
  LISTENS: {
    // Journal feature doesn't listen to external events currently
    // But could listen to USER_LOGIN for daily prompt generation
  },
};
