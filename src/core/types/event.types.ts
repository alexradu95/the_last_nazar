/**
 * Core Event System Types
 *
 * These types define the event-driven communication system
 * that enables features to interact without tight coupling.
 */

/**
 * Base event payload that all events must extend
 */
export interface BaseEventPayload {
  timestamp: number;
  userId?: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends BaseEventPayload = BaseEventPayload> = (
  payload: T
) => void | Promise<void>;

/**
 * Event listener with metadata
 */
export interface EventListener<T extends BaseEventPayload = BaseEventPayload> {
  handler: EventHandler<T>;
  featureId: string;
  priority?: number;
}

/**
 * Event definition for the event catalog
 */
export interface EventDefinition<T extends BaseEventPayload = BaseEventPayload> {
  name: string;
  description: string;
  emitter: string; // Which feature emits this event
  payload: T;
  version?: string;
}

/**
 * Event bus interface
 */
export interface IEventBus {
  /**
   * Subscribe to an event
   */
  on<T extends BaseEventPayload>(
    event: string,
    handler: EventHandler<T>,
    options?: EventListenerOptions
  ): void;

  /**
   * Unsubscribe from an event
   */
  off<T extends BaseEventPayload>(
    event: string,
    handler: EventHandler<T>
  ): void;

  /**
   * Emit an event to all listeners
   */
  emit<T extends BaseEventPayload>(
    event: string,
    payload: T
  ): Promise<void>;

  /**
   * Emit an event and collect results from all handlers
   */
  emitCollect<T extends BaseEventPayload, R = any>(
    event: string,
    payload: T
  ): Promise<R[]>;

  /**
   * Remove all listeners for an event
   */
  clear(event: string): void;

  /**
   * Get all registered events
   */
  getEvents(): string[];

  /**
   * Get listener count for an event
   */
  getListenerCount(event: string): number;
}

/**
 * Options for event listeners
 */
export interface EventListenerOptions {
  /**
   * Feature ID (automatically set by feature registry)
   */
  featureId?: string;

  /**
   * Priority (higher = earlier execution, default: 0)
   */
  priority?: number;

  /**
   * Execute only once then unsubscribe
   */
  once?: boolean;
}

/**
 * Event metadata for debugging
 */
export interface EventMetadata {
  event: string;
  timestamp: number;
  listenerCount: number;
  emitter?: string;
}

/**
 * Event history entry for debugging
 */
export interface EventHistoryEntry {
  event: string;
  payload: BaseEventPayload;
  timestamp: number;
  emitter: string;
  listeners: string[];
  duration?: number;
  error?: Error;
}
