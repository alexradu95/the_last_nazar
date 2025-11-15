import { Page, Locator } from '@playwright/test';

/**
 * BasePage - Abstract base class for all page objects
 * Provides common functionality for page navigation and interactions
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a path and wait for page to be ready
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for toast notification to appear
   */
  async waitForToast(message: string) {
    const toast = this.page.getByText(message, { exact: false });
    await toast.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Wait for any toast to appear
   */
  async waitForAnyToast() {
    const toast = this.page.locator('[role="status"], [role="alert"]').first();
    await toast.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get text content of an element
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Check if element exists
   */
  async elementExists(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Reload the current page
   */
  async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }
}
