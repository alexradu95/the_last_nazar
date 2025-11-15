import { test, expect, testData, generateTestUser } from '../../fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies();
  });

  test('should load login page successfully', async ({ authPage, page }) => {
    await authPage.goToLogin();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should login with valid credentials', async ({ authPage }) => {
    await authPage.login(testData.users.standard.email, testData.users.standard.password);

    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('should show error for invalid credentials', async ({ authPage, page }) => {
    await authPage.goToLogin();

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for error message
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should show error for empty fields', async ({ authPage, page }) => {
    await authPage.goToLogin();

    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Should show validation errors or not submit
    const url = page.url();
    expect(url).toContain('/auth/login');
  });

  test('should logout successfully', async ({ authPage }) => {
    // First login
    await authPage.login(testData.users.standard.email, testData.users.standard.password);
    expect(await authPage.isLoggedIn()).toBe(true);

    // Then logout
    await authPage.logout();
    expect(await authPage.isLoggedIn()).toBe(false);
  });

  test('should persist session on page reload', async ({ authPage, page }) => {
    await authPage.login(testData.users.standard.email, testData.users.standard.password);

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('should redirect to dashboard after login', async ({ authPage, page }) => {
    await authPage.login(testData.users.standard.email, testData.users.standard.password);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate between login and register pages', async ({ authPage, page }) => {
    await authPage.goToLogin();

    // Click link to register
    const registerLink = page.getByRole('link', { name: /register|sign up/i });
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/auth\/register/);
    }
  });
});
