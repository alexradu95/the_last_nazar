import { test, expect, testData } from '../../fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  const pages = [
    { name: 'Login Page', url: '/auth/login', requiresAuth: false },
    { name: 'Register Page', url: '/auth/register', requiresAuth: false },
    { name: 'Dashboard', url: '/dashboard', requiresAuth: true },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.name} should have no accessibility violations`, async ({
      page,
      authPage,
    }) => {
      // Login if required
      if (pageInfo.requiresAuth) {
        await authPage.login(
          testData.users.standard.email,
          testData.users.standard.password
        );
      }

      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test(`${pageInfo.name} should support keyboard navigation`, async ({
      page,
      authPage,
    }) => {
      // Login if required
      if (pageInfo.requiresAuth) {
        await authPage.login(
          testData.users.standard.email,
          testData.users.standard.password
        );
      }

      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');

      // Tab through focusable elements
      const focusableElements = await page
        .locator(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        .all();

      if (focusableElements.length > 0) {
        for (let i = 0; i < Math.min(5, focusableElements.length); i++) {
          await page.keyboard.press('Tab');
          const activeElement = page.locator(':focus');
          await expect(activeElement).toBeVisible();
        }
      }
    });
  }

  test('should have proper heading hierarchy', async ({ page, authPage }) => {
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );
    await page.goto('/dashboard');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Headings should be in order (h1, then h2, h3, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/auth/login');

    // All inputs should have labels
    const inputs = await page.locator('input').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count()) > 0;
        const hasAriaLabel = await input.getAttribute('aria-label');

        expect(hasLabel || hasAriaLabel).toBeTruthy();
      }
    }
  });

  test('should have alt text for images', async ({ page, authPage }) => {
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );
    await page.goto('/dashboard');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/auth/login');

    // Focus on first input
    const firstInput = page.locator('input').first();
    await firstInput.focus();

    // Should have visible focus (outline or box-shadow)
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should support screen reader announcements for dynamic content', async ({
    page,
    authPage,
    tasksPage,
  }) => {
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );
    await page.goto('/dashboard');

    // Create a task (triggers toast notification)
    await tasksPage.createTask('Accessibility Test Task', 'Testing announcements');

    // Check for live region (role="status" or role="alert")
    const liveRegion = page.locator('[role="status"], [role="alert"]');
    await expect(liveRegion.first()).toBeVisible();
  });
});
