/**
 * User Feature Events
 *
 * Event definitions for user management feature.
 */

/**
 * Event names
 */
export const USER_EVENTS = {
  REGISTERED: 'user.registered',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
  PREFERENCES_CHANGED: 'preferences.changed',
} as const;

/**
 * Event payloads
 */
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  timestamp: number;
}

export interface UserUpdatedEvent {
  userId: string;
  changes: {
    name?: boolean;
    bio?: boolean;
    avatar?: boolean;
    timezone?: boolean;
  };
  timestamp: number;
}

export interface UserDeletedEvent {
  userId: string;
  timestamp: number;
}

export interface PreferencesChangedEvent {
  userId: string;
  keys: string[];
  timestamp: number;
}
