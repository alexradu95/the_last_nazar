import { test, expect, testData } from '../fixtures';

/**
 * Smoke Tests - Quick sanity checks to run on every commit
 * These tests verify critical paths work without going into detail
 */
test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Life OS/i);
  });

  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test('should complete full user journey', async ({
    authPage,
    tasksPage,
    gamificationPage,
    page,
  }) => {
    // 1. Login
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );
    expect(await authPage.isLoggedIn()).toBe(true);

    // 2. View dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Create a task
    await tasksPage.createTask('Smoke Test Task', 'Testing critical path');
    const exists = await tasksPage.taskExists('Smoke Test Task');
    expect(exists).toBe(true);

    // 4. Check gamification is visible
    const xp = await gamificationPage.getCurrentXP();
    expect(xp).toBeGreaterThanOrEqual(0);

    // 5. Complete task
    await tasksPage.completeTask('Smoke Test Task');

    // 6. Logout
    await authPage.logout();
    expect(await authPage.isLoggedIn()).toBe(false);
  });

  test('should not crash on any page', async ({ page, authPage }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Login first
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );

    // Navigate to key pages
    const pages = ['/dashboard'];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    }

    expect(errors).toHaveLength(0);
  });

  test('should have no console errors', async ({ page, authPage }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors (if any)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') && !error.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});
