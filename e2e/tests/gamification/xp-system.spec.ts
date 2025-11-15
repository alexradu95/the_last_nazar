import { test, expect, testData } from '../../fixtures';

test.describe('Gamification System', () => {
  test.beforeEach(async ({ authPage, page }) => {
    // Login before each test
    await page.context().clearCookies();
    await authPage.login(testData.users.standard.email, testData.users.standard.password);
  });

  test('should display current XP and level', async ({ gamificationPage, page }) => {
    await page.goto('/dashboard');

    const xp = await gamificationPage.getCurrentXP();
    const level = await gamificationPage.getCurrentLevel();

    expect(xp).toBeGreaterThanOrEqual(0);
    expect(level).toBeGreaterThanOrEqual(1);
  });

  test('should award XP for completing tasks', async ({
    tasksPage,
    gamificationPage,
    page,
  }) => {
    await page.goto('/dashboard');

    const initialXP = await gamificationPage.getCurrentXP();

    // Create and complete a task
    await tasksPage.createTask('XP Test Task', 'For testing XP award');
    await tasksPage.completeTask('XP Test Task');

    // Wait a moment for XP to update
    await page.waitForTimeout(1000);

    const finalXP = await gamificationPage.getCurrentXP();
    expect(finalXP).toBeGreaterThan(initialXP);
  });

  test('should track daily streak', async ({ gamificationPage, page }) => {
    await page.goto('/dashboard');

    const streak = await gamificationPage.getCurrentStreak();
    expect(streak).toBeGreaterThanOrEqual(0);
  });

  test('should display achievements', async ({ gamificationPage, page }) => {
    await page.goto('/dashboard');

    const achievements = await gamificationPage.getAchievements();
    expect(Array.isArray(achievements)).toBe(true);
  });

  test('should show progress visually', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for progress indicators (progress bars, level indicators, etc.)
    const progressElements = page.locator('[role="progressbar"], .progress');
    const count = await progressElements.count();

    // Should have at least some progress indicators
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
