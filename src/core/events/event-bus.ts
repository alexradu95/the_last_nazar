/**
 * Event Bus Implementation
 *
 * A simple, type-safe event bus for inter-feature communication.
 * Features can emit and listen to events without tight coupling.
 */

import type {
  IEventBus,
  EventHandler,
  BaseEventPayload,
  EventListenerOptions,
  EventHistoryEntry,
} from '@/core/types/event.types';

interface RegisteredListener<T extends BaseEventPayload = BaseEventPayload> {
  handler: EventHandler<T>;
  options: EventListenerOptions;
}

export class EventBus implements IEventBus {
  private listeners: Map<string, RegisteredListener[]> = new Map();
  private history: EventHistoryEntry[] = [];
  private readonly maxHistorySize: number;
  private readonly enableHistory: boolean;

  constructor(options: { maxHistorySize?: number; enableHistory?: boolean } = {}) {
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.enableHistory = options.enableHistory ?? process.env.NODE_ENV === 'development';
  }

  /**
   * Subscribe to an event
   */
  on<T extends BaseEventPayload>(
    event: string,
    handler: EventHandler<T>,
    options: EventListenerOptions = {}
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listeners = this.listeners.get(event)!;

    // Check if already registered
    const existing = listeners.find((l) => l.handler === handler);
    if (existing) {
      console.warn(`[EventBus] Handler already registered for event: ${event}`);
      return;
    }

    listeners.push({ handler, options });

    // Sort by priority (higher first)
    listeners.sort((a, b) => (b.options.priority ?? 0) - (a.options.priority ?? 0));

    console.log(
      `[EventBus] Registered listener for "${event}" (feature: ${options.featureId ?? 'unknown'})`
    );
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends BaseEventPayload>(event: string, handler: EventHandler<T>): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const filtered = listeners.filter((l) => l.handler !== handler);
    this.listeners.set(event, filtered);

    console.log(`[EventBus] Unregistered listener for "${event}"`);
  }

  /**
   * Emit an event to all listeners
   */
  async emit<T extends BaseEventPayload>(event: string, payload: T): Promise<void> {
    const startTime = Date.now();
    const listeners = this.listeners.get(event) ?? [];

    if (listeners.length === 0) {
      console.debug(`[EventBus] No listeners for event: ${event}`);
      return;
    }

    console.log(
      `[EventBus] Emitting "${event}" to ${listeners.length} listener(s)`,
      payload
    );

    const errors: Error[] = [];
    const handlerPromises: Promise<void>[] = [];

    for (const { handler, options } of listeners) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          handlerPromises.push(result);
        }

        // Remove if once option is set
        if (options.once) {
          this.off(event, handler);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push(err);
        console.error(`[EventBus] Error in listener for "${event}":`, err);
      }
    }

    // Wait for all async handlers
    try {
      await Promise.all(handlerPromises);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push(err);
      console.error(`[EventBus] Error in async listener for "${event}":`, err);
    }

    // Record in history
    if (this.enableHistory) {
      const duration = Date.now() - startTime;
      this.addToHistory({
        event,
        payload,
        timestamp: Date.now(),
        emitter: payload.userId ?? 'system',
        listeners: listeners.map((l) => l.options.featureId ?? 'unknown'),
        duration,
        error: errors.length > 0 ? errors[0] : undefined,
      });
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  /**
   * Emit an event and collect results from all handlers
   */
  async emitCollect<T extends BaseEventPayload, R = any>(
    event: string,
    payload: T
  ): Promise<R[]> {
    const listeners = this.listeners.get(event) ?? [];

    if (listeners.length === 0) {
      return [];
    }

    console.log(
      `[EventBus] Emitting (collect) "${event}" to ${listeners.length} listener(s)`
    );

    const results: R[] = [];

    for (const { handler, options } of listeners) {
      try {
        const result = await handler(payload);
        if (result !== undefined) {
          results.push(result as R);
        }

        if (options.once) {
          this.off(event, handler);
        }
      } catch (error) {
        console.error(`[EventBus] Error in listener for "${event}":`, error);
      }
    }

    return results;
  }

  /**
   * Remove all listeners for an event
   */
  clear(event: string): void {
    this.listeners.delete(event);
    console.log(`[EventBus] Cleared all listeners for "${event}"`);
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
    return this.listeners.get(event)?.length ?? 0;
  }

  /**
   * Get event history (for debugging)
   */
  getHistory(): EventHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Add entry to history with size limit
   */
  private addToHistory(entry: EventHistoryEntry): void {
    this.history.push(entry);

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
}

// Global event bus singleton
let globalEventBus: EventBus | null = null;

/**
 * Get the global event bus instance
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus({
      maxHistorySize: 100,
      enableHistory: process.env.NODE_ENV === 'development',
    });
  }
  return globalEventBus;
}

/**
 * Reset the global event bus (for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.getEvents().forEach((event) => {
      globalEventBus!.clear(event);
    });
    globalEventBus.clearHistory();
  }
  globalEventBus = null;
}
