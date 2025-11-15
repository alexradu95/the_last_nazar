/**
 * Journal Events
 *
 * Event definitions and handlers for journal feature
 */

/**
 * Event payloads
 */
export type JournalCreatedEvent = {
  userId: string;
  entryId: string;
  wordCount: number;
  mood?: string;
};

export type JournalUpdatedEvent = {
  entryId: string;
  updates: string[];
};

export type JournalDeletedEvent = {
  entryId: string;
};

export type MoodLoggedEvent = {
  userId: string;
  mood: string;
  note?: string;
  timestamp: Date;
};

/**
 * Event catalog for journal feature
 */
export const JOURNAL_EVENTS = {
  // Emitted events
  JOURNAL_CREATED: 'journal.created',
  JOURNAL_UPDATED: 'journal.updated',
  JOURNAL_DELETED: 'journal.deleted',
  MOOD_LOGGED: 'mood.logged',

  // Listened events
  USER_LOGIN: 'user.login',
} as const;

/**
 * Setup event listeners for journal feature
 */
export const setupJournalEventListeners = (eventBus: any, journalService: any) => {
  // Listen for user login to show daily prompt
  eventBus.on(JOURNAL_EVENTS.USER_LOGIN, async (payload: { userId: string }) => {
    try {
      const todayEntry = await journalService.getEntryForToday(payload.userId);

      if (!todayEntry) {
        const prompt = await journalService.getDailyPrompt();
        console.log(`[Journal] Daily prompt for user ${payload.userId}: "${prompt.prompt}"`);

        // Optionally emit an event that UI can listen to
        eventBus.emit('journal.daily-prompt-ready', {
          userId: payload.userId,
          prompt,
        });
      }
    } catch (error) {
      console.error('[Journal] Error handling user login:', error);
    }
  });
};

/**
 * Calculate XP reward for journal entry
 */
export const calculateJournalXP = (wordCount: number): number => {
  // Base XP: 10
  // Bonus XP for longer entries:
  // - 50+ words: +5 XP
  // - 100+ words: +10 XP
  // - 250+ words: +20 XP
  // - 500+ words: +30 XP

  let xp = 10;

  if (wordCount >= 500) {
    xp += 30;
  } else if (wordCount >= 250) {
    xp += 20;
  } else if (wordCount >= 100) {
    xp += 10;
  } else if (wordCount >= 50) {
    xp += 5;
  }

  return xp;
};

/**
 * Setup integration with gamification feature
 */
export const setupGamificationIntegration = (eventBus: any) => {
  // When journal entry is created, award XP
  eventBus.on(JOURNAL_EVENTS.JOURNAL_CREATED, (payload: JournalCreatedEvent) => {
    const xp = calculateJournalXP(payload.wordCount);

    // Emit XP gain event for gamification system
    eventBus.emit('xp.gained', {
      userId: payload.userId,
      amount: xp,
      source: 'journal',
      reason: `Wrote journal entry (${payload.wordCount} words)`,
    });

    console.log(`[Journal] User ${payload.userId} earned ${xp} XP for journal entry`);
  });

  // Award streak bonus
  eventBus.on('journal.streak-milestone', (payload: { userId: string; streak: number }) => {
    const streakXP = payload.streak * 5; // 5 XP per day in streak

    eventBus.emit('xp.gained', {
      userId: payload.userId,
      amount: streakXP,
      source: 'journal-streak',
      reason: `${payload.streak} day writing streak!`,
    });
  });
};
