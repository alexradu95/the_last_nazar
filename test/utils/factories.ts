/**
 * Test Data Factories
 *
 * Factory functions for creating test data with sensible defaults.
 * Use the pattern: getMock[EntityName](overrides?: Partial<EntityType>)
 */

import { randomUUID } from 'crypto';

/**
 * User factory
 */
export type MockUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

export const getMockUser = (overrides?: Partial<MockUser>): MockUser => {
  return {
    id: randomUUID(),
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    ...overrides,
  };
};

/**
 * Task factory
 */
export type MockTask = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'archived';
  xpReward: number;
  categoryId?: string;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
};

export const getMockTask = (overrides?: Partial<MockTask>): MockTask => {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: 'user-123',
    title: 'Test Task',
    description: 'Test task description',
    priority: 'medium',
    status: 'active',
    xpReward: 20,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * Category factory
 */
export type MockCategory = {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
};

export const getMockCategory = (overrides?: Partial<MockCategory>): MockCategory => {
  return {
    id: randomUUID(),
    userId: 'user-123',
    name: 'Test Category',
    color: '#3b82f6',
    icon: '📁',
    createdAt: new Date(),
    ...overrides,
  };
};

/**
 * Achievement factory
 */
export type MockAchievement = {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  xpReward: number;
  unlockedAt: Date;
};

export const getMockAchievement = (
  overrides?: Partial<MockAchievement>
): MockAchievement => {
  return {
    id: randomUUID(),
    userId: 'user-123',
    type: 'task_complete',
    title: 'First Task',
    description: 'Complete your first task',
    xpReward: 50,
    unlockedAt: new Date(),
    ...overrides,
  };
};

/**
 * Event factory for testing event bus
 */
export type MockEvent<T = any> = {
  event: string;
  payload: T;
  timestamp: Date;
};

export const getMockEvent = <T = any>(
  event: string,
  payload: T,
  overrides?: Partial<MockEvent<T>>
): MockEvent<T> => {
  return {
    event,
    payload,
    timestamp: new Date(),
    ...overrides,
  };
};

/**
 * Helper to create multiple instances
 */
export const createMany = <T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overridesFn?: (index: number) => Partial<T>
): T[] => {
  return Array.from({ length: count }, (_, index) =>
    factory(overridesFn ? overridesFn(index) : {})
  );
};
