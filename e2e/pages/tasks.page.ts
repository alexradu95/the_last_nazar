import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * TasksPage - Page object for task management
 */
export class TasksPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Create a new task
   */
  async createTask(title: string, description?: string) {
    // Look for "New Task" or "Add Task" button
    const newTaskButton = this.page.getByRole('button', {
      name: /new task|add task|create task/i,
    });
    await newTaskButton.click();

    // Fill in the form
    await this.page.getByLabel(/title/i).fill(title);

    if (description) {
      await this.page.getByLabel(/description/i).fill(description);
    }

    // Submit the form
    await this.page.getByRole('button', { name: /create|save|add/i }).click();

    // Wait for success
    await this.waitForAnyToast();
  }

  /**
   * Complete a task by title
   */
  async completeTask(title: string) {
    const task = await this.findTaskByTitle(title);

    // Find checkbox or complete button within the task
    const checkbox = task.getByRole('checkbox');
    const completeButton = task.getByRole('button', { name: /complete/i });

    if (await checkbox.count() > 0) {
      await checkbox.check();
    } else {
      await completeButton.click();
    }

    // Wait for success
    await this.waitForAnyToast();
  }

  /**
   * Delete a task by title
   */
  async deleteTask(title: string) {
    const task = await this.findTaskByTitle(title);

    // Click delete button
    const deleteButton = task.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();

    // Confirm deletion if modal appears
    const confirmButton = this.page.getByRole('button', {
      name: /confirm|yes|delete/i,
    });

    if (await this.elementExists(confirmButton)) {
      await confirmButton.click();
    }

    // Wait for success
    await this.waitForAnyToast();
  }

  /**
   * Get task count
   */
  async getTaskCount(): Promise<number> {
    const tasks = this.page.locator('[data-testid="task-item"]');
    return await tasks.count();
  }

  /**
   * Find task element by title
   */
  private async findTaskByTitle(title: string) {
    return this.page.getByText(title).locator('..');
  }

  /**
   * Check if task exists
   */
  async taskExists(title: string): Promise<boolean> {
    const task = this.page.getByText(title, { exact: false });
    return await this.elementExists(task);
  }

  /**
   * Get all task titles
   */
  async getAllTaskTitles(): Promise<string[]> {
    const tasks = this.page.locator('[data-testid="task-item"]');
    const count = await tasks.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const title = await tasks.nth(i).textContent();
      if (title) titles.push(title.trim());
    }

    return titles;
  }
}
