/**
 * Task Events
 *
 * Event definitions for the tasks feature.
 */

import type { BaseEventPayload } from '@/core/types/event.types';

/**
 * Task created event
 */
export interface TaskCreatedEvent extends BaseEventPayload {
  taskId: string;
  userId: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Task completed event
 */
export interface TaskCompletedEvent extends BaseEventPayload {
  taskId: string;
  userId: string;
  xpReward: number;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Task updated event
 */
export interface TaskUpdatedEvent extends BaseEventPayload {
  taskId: string;
  userId: string;
  changes: Record<string, any>;
}

/**
 * Task deleted event
 */
export interface TaskDeletedEvent extends BaseEventPayload {
  taskId: string;
  userId: string;
}

/**
 * Event names
 */
export const TASK_EVENTS = {
  CREATED: 'task.created',
  COMPLETED: 'task.completed',
  UPDATED: 'task.updated',
  DELETED: 'task.deleted',
} as const;
