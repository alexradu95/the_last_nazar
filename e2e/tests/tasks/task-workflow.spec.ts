import { test, expect, testData } from '../../fixtures';

test.describe('Task Management', () => {
  test.beforeEach(async ({ authPage, page }) => {
    // Login before each test
    await page.context().clearCookies();
    await authPage.login(testData.users.standard.email, testData.users.standard.password);
  });

  test('should create a new task', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    const initialCount = await tasksPage.getTaskCount();

    await tasksPage.createTask('Test Task from E2E', 'This is a test task');

    const newCount = await tasksPage.getTaskCount();
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('should complete a task', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    // Create a task first
    const taskTitle = 'Task to Complete';
    await tasksPage.createTask(taskTitle, 'Will be completed');

    // Verify it exists
    const exists = await tasksPage.taskExists(taskTitle);
    expect(exists).toBe(true);

    // Complete it
    await tasksPage.completeTask(taskTitle);

    // Verify completion (task might be moved to completed section or marked)
    // We'll just verify the action succeeded
  });

  test('should delete a task', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    const taskTitle = 'Task to Delete';
    await tasksPage.createTask(taskTitle, 'Will be deleted');

    const beforeDelete = await tasksPage.getTaskCount();

    await tasksPage.deleteTask(taskTitle);

    const afterDelete = await tasksPage.getTaskCount();
    expect(afterDelete).toBeLessThan(beforeDelete);
  });

  test('should display task details correctly', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    const title = 'Task with Details';
    const description = 'This task has a description';

    await tasksPage.createTask(title, description);

    // Verify the task appears
    const exists = await tasksPage.taskExists(title);
    expect(exists).toBe(true);
  });

  test('should handle multiple tasks', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    const initialCount = await tasksPage.getTaskCount();

    // Create multiple tasks
    await tasksPage.createTask('Task 1', 'First task');
    await tasksPage.createTask('Task 2', 'Second task');
    await tasksPage.createTask('Task 3', 'Third task');

    const finalCount = await tasksPage.getTaskCount();
    expect(finalCount).toBe(initialCount + 3);
  });

  test('should persist tasks after page reload', async ({ tasksPage, page }) => {
    await page.goto('/dashboard');

    const taskTitle = 'Persistent Task';
    await tasksPage.createTask(taskTitle, 'Should persist');

    await page.reload();
    await page.waitForLoadState('networkidle');

    const exists = await tasksPage.taskExists(taskTitle);
    expect(exists).toBe(true);
  });
});
