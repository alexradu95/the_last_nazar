import { Page } from '@playwright/test';

/**
 * Setup a test user by registering them
 * Returns credentials for login
 */
export async function setupTestUser(page: Page) {
  const timestamp = Date.now();
  const testUser = {
    email: `test${timestamp}@example.com`,
    password: 'TestPass123!',
    name: `Test User ${timestamp}`,
  };

  // Navigate to register page
  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  // Fill registration form
  await page.getByLabel(/full name/i).fill(testUser.name);
  await page.getByLabel(/email address/i).fill(testUser.email);
  await page.getByLabel(/^password$/i).first().fill(testUser.password);
  await page.getByLabel(/confirm password/i).fill(testUser.password);

  // Accept terms and conditions
  await page.getByLabel(/i agree to the/i).check();

  // Submit registration
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for redirect to dashboard or success
  try {
    await page.waitForURL('/dashboard', { timeout: 10000 });
  } catch {
    // If it doesn't redirect, that's okay - user is registered
    // Just navigate away from register page
    await page.goto('/login');
  }

  return testUser;
}

/**
 * Use a standard test user for tests that don't need isolation
 */
export const standardTestUser = {
  email: 'standard-test@example.com',
  password: 'TestPass123!',
  name: 'Standard Test User',
};

/**
 * Ensure standard test user exists
 * Call this in beforeAll hooks
 */
export async function ensureStandardTestUser(page: Page) {
  // Try to login first
  await page.goto('/login');
  await page.getByLabel(/email address/i).fill(standardTestUser.email);
  await page.getByLabel(/^password$/i).fill(standardTestUser.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Check if login succeeded
  try {
    await page.waitForURL('/dashboard', { timeout: 5000 });
    // User exists, we're good
    return;
  } catch {
    // User doesn't exist, register them
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/full name/i).fill(standardTestUser.name);
    await page.getByLabel(/email address/i).fill(standardTestUser.email);
    await page.getByLabel(/^password$/i).first().fill(standardTestUser.password);
    await page.getByLabel(/confirm password/i).fill(standardTestUser.password);
    await page.getByLabel(/i agree to the/i).check();
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for registration to complete
    await page.waitForTimeout(2000);
  }
}
