import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { TasksPage } from '../pages/tasks.page';
import { GamificationPage } from '../pages/gamification.page';

/**
 * Extended test fixtures with page objects
 */
type PageFixtures = {
  authPage: AuthPage;
  tasksPage: TasksPage;
  gamificationPage: GamificationPage;
};

/**
 * Test data fixtures
 */
export const testData = {
  users: {
    standard: {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
    },
    admin: {
      email: 'admin@example.com',
      password: 'AdminPass123!',
      name: 'Admin User',
    },
  },
  tasks: {
    simple: {
      title: 'Simple test task',
      description: 'A basic task for testing',
    },
    complex: {
      title: 'Complex test task',
      description: 'A task with more details for comprehensive testing',
    },
  },
};

/**
 * Generate unique test user
 */
export const generateTestUser = () => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPass123!',
  name: `Test User ${Date.now()}`,
});

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<PageFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  tasksPage: async ({ page }, use) => {
    const tasksPage = new TasksPage(page);
    await use(tasksPage);
  },

  gamificationPage: async ({ page }, use) => {
    const gamificationPage = new GamificationPage(page);
    await use(gamificationPage);
  },
});

export { expect } from '@playwright/test';
