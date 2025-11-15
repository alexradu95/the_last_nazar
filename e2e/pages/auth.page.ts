import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * AuthPage - Page object for authentication flows
 */
export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.goto('/login');

    await this.page.getByLabel(/email address/i).fill(email);
    await this.page.getByLabel(/^password$/i).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  /**
   * Register a new user
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    await this.goto('/register');

    await this.page.getByLabel(/name/i).fill(userData.name);
    await this.page.getByLabel(/email address/i).fill(userData.email);
    await this.page.getByLabel(/^password$/i).fill(userData.password);
    await this.page.getByRole('button', { name: /sign up/i }).click();

    // Wait for success
    await this.waitForAnyToast();
  }

  /**
   * Logout current user
   */
  async logout() {
    const logoutButton = this.page.getByRole('button', { name: /logout|sign out/i });
    await logoutButton.click();

    // Wait for redirect to login
    await this.page.waitForURL(/\/login/, { timeout: 10000 });
  }

  /**
   * Check if user is logged in (on dashboard)
   */
  async isLoggedIn(): Promise<boolean> {
    return this.page.url().includes('/dashboard');
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.goto('/login');
  }

  /**
   * Navigate to register page
   */
  async goToRegister() {
    await this.goto('/register');
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const error = this.page.locator('[role="alert"], .error-message').first();
      await error.waitFor({ state: 'visible', timeout: 2000 });
      return await this.getText(error);
    } catch {
      return null;
    }
  }
}
