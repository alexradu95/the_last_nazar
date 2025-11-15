/**
 * Test Helper Utilities
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Event capture helper for testing event bus
 */
export class EventCapture<T = any> {
  private events: Array<{ event: string; payload: T }> = [];

  capture(event: string, payload: T): void {
    this.events.push({ event, payload });
  }

  getEvents(): Array<{ event: string; payload: T }> {
    return [...this.events];
  }

  findEvent(eventName: string): { event: string; payload: T } | undefined {
    return this.events.find((e) => e.event === eventName);
  }

  findEvents(eventName: string): Array<{ event: string; payload: T }> {
    return this.events.filter((e) => e.event === eventName);
  }

  clear(): void {
    this.events = [];
  }

  get count(): number {
    return this.events.length;
  }
}

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
};

/**
 * Sleep helper for tests
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Custom render with providers
 */
type CustomRenderOptions = {
  wrapper?: ({ children }: { children: ReactNode }) => ReactElement;
} & Omit<RenderOptions, 'wrapper'>;

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  return render(ui, options);
};

/**
 * Date helpers for consistent testing
 */
export const testDates = {
  now: () => new Date('2024-01-15T12:00:00.000Z'),
  yesterday: () => new Date('2024-01-14T12:00:00.000Z'),
  tomorrow: () => new Date('2024-01-16T12:00:00.000Z'),
  lastWeek: () => new Date('2024-01-08T12:00:00.000Z'),
  nextWeek: () => new Date('2024-01-22T12:00:00.000Z'),
  addDays: (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  addHours: (date: Date, hours: number) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  },
};

/**
 * Mock timer helpers
 */
export const mockTimers = () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  return {
    advance: (ms: number) => vi.advanceTimersByTime(ms),
    runAll: () => vi.runAllTimers(),
    runPending: () => vi.runOnlyPendingTimers(),
  };
};

/**
 * Spy helper for function calls
 */
export const createSpy = <T extends (...args: any[]) => any>() => {
  return vi.fn<T>();
};

/**
 * Assert helpers
 */
export const assertDefined = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
};

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${value}`);
};
