/**
 * Event Bus Implementation
 *
 * Provides event-driven communication between features.
 * Features emit events and listen to events without direct dependencies.
 */

import type {
  IEventBus,
  EventHandler,
  EventListener,
  EventListenerOptions,
  BaseEventPayload,
  EventHistoryEntry,
} from '../types/event.types';

export class EventBus implements IEventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private history: EventHistoryEntry[] = [];
  private maxHistorySize = 100;
  private debug = process.env.NODE_ENV === 'development';

  /**
   * Subscribe to an event
   */
  on<T extends BaseEventPayload>(
    event: string,
    handler: EventHandler<T>,
    options: EventListenerOptions = {}
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const listener: EventListener<T> = {
      handler: handler as EventHandler,
      featureId: options.featureId || 'unknown',
      priority: options.priority || 0,
    };

    // Wrap with once logic if needed
    if (options.once) {
      const originalHandler = listener.handler;
      listener.handler = async (payload) => {
        await originalHandler(payload);
        this.off(event, handler);
      };
    }

    this.listeners.get(event)!.add(listener);

    if (this.debug) {
      console.log(`[EventBus] Listener added: ${event} (${listener.featureId})`);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends BaseEventPayload>(
    event: string,
    handler: EventHandler<T>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const listener of eventListeners) {
      if (listener.handler === handler) {
        eventListeners.delete(listener);
        if (this.debug) {
          console.log(`[EventBus] Listener removed: ${event} (${listener.featureId})`);
        }
        break;
      }
    }

    // Clean up empty event sets
    if (eventListeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event to all listeners
   */
  async emit<T extends BaseEventPayload>(
    event: string,
    payload: T
  ): Promise<void> {
    const startTime = performance.now();
    const eventListeners = this.listeners.get(event);

    if (!eventListeners || eventListeners.size === 0) {
      if (this.debug) {
        console.warn(`[EventBus] No listeners for event: ${event}`);
      }
      return;
    }

    // Add timestamp if not present
    if (!payload.timestamp) {
      payload.timestamp = Date.now();
    }

    // Sort by priority (higher first)
    const sorted = Array.from(eventListeners).sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    const listenerIds = sorted.map((l) => l.featureId);

    if (this.debug) {
      console.log(`[EventBus] Emitting: ${event}`, {
        payload,
        listeners: listenerIds,
      });
    }

    // Execute all handlers
    const results = await Promise.allSettled(
      sorted.map((listener) => listener.handler(payload))
    );

    // Log errors
    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => r.reason);

    if (errors.length > 0) {
      console.error(`[EventBus] Errors in ${event} handlers:`, errors);
    }

    // Record in history
    this.recordEvent({
      event,
      payload,
      timestamp: payload.timestamp,
      emitter: 'unknown', // Will be set by feature context
      listeners: listenerIds,
      duration: performance.now() - startTime,
      error: errors[0],
    });
  }

  /**
   * Emit an event and collect results from all handlers
   */
  async emitCollect<T extends BaseEventPayload, R = any>(
    event: string,
    payload: T
  ): Promise<R[]> {
    const eventListeners = this.listeners.get(event);

    if (!eventListeners || eventListeners.size === 0) {
      return [];
    }

    // Add timestamp if not present
    if (!payload.timestamp) {
      payload.timestamp = Date.now();
    }

    // Sort by priority
    const sorted = Array.from(eventListeners).sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    if (this.debug) {
      console.log(`[EventBus] Emitting (collect): ${event}`, { payload });
    }

    // Execute all handlers and collect results
    const results = await Promise.allSettled(
      sorted.map((listener) => listener.handler(payload))
    );

    // Filter out errors and return successful results
    return results
      .filter((r): r is PromiseFulfilledResult<R> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  /**
   * Remove all listeners for an event
   */
  clear(event: string): void {
    this.listeners.delete(event);
    if (this.debug) {
      console.log(`[EventBus] Cleared all listeners for: ${event}`);
    }
  }

  /**
   * Get all registered events
   */
  getEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(limit?: number): EventHistoryEntry[] {
    return limit ? this.history.slice(-limit) : [...this.history];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Enable/disable debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Record event in history
   */
  private recordEvent(entry: EventHistoryEntry): void {
    this.history.push(entry);

    // Keep history size manageable
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Get statistics about event usage
   */
  getStats() {
    const events = this.getEvents();
    return {
      totalEvents: events.length,
      totalListeners: Array.from(this.listeners.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      events: events.map((event) => ({
        name: event,
        listenerCount: this.getListenerCount(event),
      })),
      historySize: this.history.length,
    };
  }
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();

/**
 * Re-export types
 */
export type * from '../types/event.types';
