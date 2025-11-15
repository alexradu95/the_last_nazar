# Task 08: Playwright E2E Testing Infrastructure

**Status**: Not Started
**Priority**: High
**Estimated Effort**: 3-4 hours
**Dependencies**: Tasks 01-07 (all features implemented)

## Objective

Set up comprehensive Playwright end-to-end testing infrastructure to enable automated runtime issue detection, user flow validation, and cross-browser testing for the Life OS platform.

## Context

While the project has excellent unit and integration test coverage with Vitest, we lack E2E tests that:
- Validate complete user workflows across multiple features
- Detect runtime issues in the browser environment
- Test event-driven communication between features
- Verify animations and UI interactions
- Ensure accessibility in real browser contexts
- Test authentication flows end-to-end

## Success Criteria

1. ✅ Playwright installed and configured with TypeScript
2. ✅ Test infrastructure with page objects and utilities
3. ✅ Authentication flow tests (login, logout, session)
4. ✅ Task management workflow tests (create, complete, delete)
5. ✅ Gamification integration tests (XP earned, achievements unlocked)
6. ✅ Animation system tests (verify animations run, no crashes)
7. ✅ Cross-browser testing configuration (Chromium, Firefox, WebKit)
8. ✅ CI/CD integration ready
9. ✅ Accessibility testing with axe-core
10. ✅ Visual regression testing setup (optional)

## Implementation Steps

### Phase 1: Setup & Configuration (30 mins)

1. **Install Playwright**
   ```bash
   npm install -D @playwright/test @axe-core/playwright
   npx playwright install
   ```

2. **Create Playwright config**
   ```typescript
   // playwright.config.ts
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [
       ['html'],
       ['json', { outputFile: 'test-results/results.json' }],
       ['junit', { outputFile: 'test-results/junit.xml' }],
     ],
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
       video: 'retain-on-failure',
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] },
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] },
       },
       {
         name: 'mobile-chrome',
         use: { ...devices['Pixel 5'] },
       },
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
       timeout: 120 * 1000,
     },
   });
   ```

3. **Create directory structure**
   ```
   e2e/
   ├── fixtures/           # Test data and setup
   ├── pages/             # Page object models
   ├── tests/             # Test files
   │   ├── auth/          # Authentication tests
   │   ├── tasks/         # Task feature tests
   │   ├── gamification/  # Gamification tests
   │   └── animations/    # Animation tests
   └── utils/             # Helper functions
   ```

### Phase 2: Page Objects & Utilities (45 mins)

1. **Create base page object**
   ```typescript
   // e2e/pages/base.page.ts
   import { Page } from '@playwright/test';

   export class BasePage {
     constructor(protected page: Page) {}

     async goto(path: string) {
       await this.page.goto(path);
       await this.page.waitForLoadState('networkidle');
     }

     async waitForToast(message: string) {
       await this.page.getByText(message).waitFor({ state: 'visible' });
     }

     async checkAccessibility() {
       // Will implement with axe-core
     }
   }
   ```

2. **Create authentication page object**
   ```typescript
   // e2e/pages/auth.page.ts
   import { Page } from '@playwright/test';
   import { BasePage } from './base.page';

   export class AuthPage extends BasePage {
     async login(email: string, password: string) {
       await this.goto('/auth/login');
       await this.page.getByLabel('Email').fill(email);
       await this.page.getByLabel('Password').fill(password);
       await this.page.getByRole('button', { name: 'Login' }).click();
       await this.page.waitForURL('/dashboard');
     }

     async register(userData: {
       email: string;
       password: string;
       name: string;
     }) {
       await this.goto('/auth/register');
       await this.page.getByLabel('Name').fill(userData.name);
       await this.page.getByLabel('Email').fill(userData.email);
       await this.page.getByLabel('Password').fill(userData.password);
       await this.page.getByRole('button', { name: 'Register' }).click();
       await this.waitForToast('Registration successful');
     }

     async logout() {
       await this.page.getByRole('button', { name: 'Logout' }).click();
       await this.page.waitForURL('/auth/login');
     }

     async isLoggedIn(): Promise<boolean> {
       return this.page.url().includes('/dashboard');
     }
   }
   ```

3. **Create tasks page object**
   ```typescript
   // e2e/pages/tasks.page.ts
   import { Page } from '@playwright/test';
   import { BasePage } from './base.page';

   export class TasksPage extends BasePage {
     async createTask(title: string, description: string) {
       await this.page.getByRole('button', { name: 'New Task' }).click();
       await this.page.getByLabel('Title').fill(title);
       await this.page.getByLabel('Description').fill(description);
       await this.page.getByRole('button', { name: 'Create' }).click();
       await this.waitForToast('Task created');
     }

     async completeTask(title: string) {
       const task = this.page.getByText(title).locator('..');
       await task.getByRole('checkbox').check();
       await this.waitForToast('Task completed');
     }

     async deleteTask(title: string) {
       const task = this.page.getByText(title).locator('..');
       await task.getByRole('button', { name: 'Delete' }).click();
       await this.page.getByRole('button', { name: 'Confirm' }).click();
       await this.waitForToast('Task deleted');
     }

     async getTaskCount(): Promise<number> {
       return this.page.locator('[data-testid="task-item"]').count();
     }
   }
   ```

4. **Create gamification page object**
   ```typescript
   // e2e/pages/gamification.page.ts
   import { Page } from '@playwright/test';
   import { BasePage } from './base.page';

   export class GamificationPage extends BasePage {
     async getCurrentXP(): Promise<number> {
       const xp = await this.page
         .getByTestId('current-xp')
         .textContent();
       return parseInt(xp || '0', 10);
     }

     async getCurrentLevel(): Promise<number> {
       const level = await this.page
         .getByTestId('current-level')
         .textContent();
       return parseInt(level || '1', 10);
     }

     async getAchievements() {
       return this.page.locator('[data-testid="achievement"]').all();
     }

     async waitForLevelUp() {
       await this.page
         .getByText('Level Up!')
         .waitFor({ state: 'visible' });
     }

     async waitForAchievementUnlock(name: string) {
       await this.page
         .getByText(`Achievement Unlocked: ${name}`)
         .waitFor({ state: 'visible' });
     }
   }
   ```

5. **Create test fixtures**
   ```typescript
   // e2e/fixtures/index.ts
   import { test as base } from '@playwright/test';
   import { AuthPage } from '../pages/auth.page';
   import { TasksPage } from '../pages/tasks.page';
   import { GamificationPage } from '../pages/gamification.page';

   type Pages = {
     authPage: AuthPage;
     tasksPage: TasksPage;
     gamificationPage: GamificationPage;
   };

   export const test = base.extend<Pages>({
     authPage: async ({ page }, use) => {
       await use(new AuthPage(page));
     },
     tasksPage: async ({ page }, use) => {
       await use(new TasksPage(page));
     },
     gamificationPage: async ({ page }, use) => {
       await use(new GamificationPage(page));
     },
   });

   export { expect } from '@playwright/test';
   ```

### Phase 3: Authentication Tests (30 mins)

```typescript
// e2e/tests/auth/login.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies();
  });

  test('should register new user successfully', async ({ authPage }) => {
    await authPage.register({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
    });

    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('should login existing user', async ({ authPage }) => {
    await authPage.login('existing@example.com', 'password123');
    expect(await authPage.isLoggedIn()).toBe(true);
  });

  test('should logout successfully', async ({ authPage }) => {
    await authPage.login('existing@example.com', 'password123');
    await authPage.logout();
    expect(await authPage.isLoggedIn()).toBe(false);
  });

  test('should show error for invalid credentials', async ({ authPage, page }) => {
    await authPage.goto('/auth/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should persist session on page reload', async ({ authPage, page }) => {
    await authPage.login('existing@example.com', 'password123');
    await page.reload();
    expect(await authPage.isLoggedIn()).toBe(true);
  });
});
```

### Phase 4: Task Management Tests (30 mins)

```typescript
// e2e/tests/tasks/task-workflow.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Task Management', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.login('test@example.com', 'password123');
  });

  test('should create new task', async ({ tasksPage }) => {
    await tasksPage.goto('/dashboard');
    const initialCount = await tasksPage.getTaskCount();

    await tasksPage.createTask(
      'Complete E2E tests',
      'Implement Playwright testing'
    );

    const newCount = await tasksPage.getTaskCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should complete task and earn XP', async ({
    tasksPage,
    gamificationPage,
  }) => {
    await tasksPage.goto('/dashboard');

    const initialXP = await gamificationPage.getCurrentXP();

    await tasksPage.createTask('Quick task', 'For XP testing');
    await tasksPage.completeTask('Quick task');

    const newXP = await gamificationPage.getCurrentXP();
    expect(newXP).toBeGreaterThan(initialXP);
  });

  test('should delete task', async ({ tasksPage }) => {
    await tasksPage.goto('/dashboard');

    await tasksPage.createTask('Temporary task', 'Will be deleted');
    const beforeDelete = await tasksPage.getTaskCount();

    await tasksPage.deleteTask('Temporary task');
    const afterDelete = await tasksPage.getTaskCount();

    expect(afterDelete).toBe(beforeDelete - 1);
  });

  test('should filter tasks by category', async ({ tasksPage, page }) => {
    await tasksPage.goto('/dashboard');

    await tasksPage.createTask('Work task', 'Work category');
    await page.selectOption('[name="category"]', 'work');

    const visibleTasks = page.locator('[data-testid="task-item"]');
    await expect(visibleTasks).toHaveCount(1);
  });
});
```

### Phase 5: Gamification Integration Tests (30 mins)

```typescript
// e2e/tests/gamification/xp-system.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Gamification System', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.login('test@example.com', 'password123');
  });

  test('should award XP for completing tasks', async ({
    tasksPage,
    gamificationPage,
  }) => {
    await tasksPage.goto('/dashboard');
    const initialXP = await gamificationPage.getCurrentXP();

    await tasksPage.createTask('XP Test Task', 'Testing XP award');
    await tasksPage.completeTask('XP Test Task');

    const finalXP = await gamificationPage.getCurrentXP();
    expect(finalXP).toBe(initialXP + 10); // Assuming 10 XP per task
  });

  test('should level up at XP threshold', async ({
    tasksPage,
    gamificationPage,
  }) => {
    await tasksPage.goto('/dashboard');
    const initialLevel = await gamificationPage.getCurrentLevel();

    // Complete enough tasks to level up
    for (let i = 0; i < 10; i++) {
      await tasksPage.createTask(`Task ${i}`, `Description ${i}`);
      await tasksPage.completeTask(`Task ${i}`);
    }

    await gamificationPage.waitForLevelUp();
    const newLevel = await gamificationPage.getCurrentLevel();
    expect(newLevel).toBeGreaterThan(initialLevel);
  });

  test('should unlock achievement', async ({
    tasksPage,
    gamificationPage,
  }) => {
    await tasksPage.goto('/dashboard');

    // Complete 5 tasks to unlock "Getting Started" achievement
    for (let i = 0; i < 5; i++) {
      await tasksPage.createTask(`Achievement ${i}`, `Desc ${i}`);
      await tasksPage.completeTask(`Achievement ${i}`);
    }

    await gamificationPage.waitForAchievementUnlock('Getting Started');
  });

  test('should track daily streak', async ({ page, gamificationPage }) => {
    await page.goto('/dashboard');

    const streak = await page.getByTestId('daily-streak').textContent();
    expect(parseInt(streak || '0', 10)).toBeGreaterThanOrEqual(0);
  });
});
```

### Phase 6: Animation Tests (30 mins)

```typescript
// e2e/tests/animations/animation-system.spec.ts
import { test, expect } from '../../fixtures';

test.describe('Animation System', () => {
  test('should play confetti on level up', async ({
    authPage,
    tasksPage,
    page,
  }) => {
    await authPage.login('test@example.com', 'password123');
    await tasksPage.goto('/dashboard');

    // Trigger level up
    for (let i = 0; i < 10; i++) {
      await tasksPage.createTask(`Task ${i}`, `Desc ${i}`);
      await tasksPage.completeTask(`Task ${i}`);
    }

    // Check for confetti canvas
    const confetti = page.locator('canvas');
    await expect(confetti).toBeVisible();
  });

  test('should animate task completion', async ({ authPage, tasksPage, page }) => {
    await authPage.login('test@example.com', 'password123');
    await tasksPage.goto('/dashboard');

    await tasksPage.createTask('Animation test', 'Testing animations');

    const task = page.getByText('Animation test').locator('..');

    // Check initial state
    await expect(task).toBeVisible();

    // Complete task
    await task.getByRole('checkbox').check();

    // Verify animation classes or transitions (adjust based on implementation)
    await expect(task).toHaveClass(/completed/);
  });

  test('should load animations demo page without errors', async ({ page }) => {
    await page.goto('/animations-demo');

    // Check no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000); // Let animations run
    expect(errors).toHaveLength(0);
  });
});
```

### Phase 7: Accessibility Tests (30 mins)

```typescript
// e2e/tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should have no accessibility violations on login page', async ({
    page,
  }) => {
    await page.goto('/auth/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations on dashboard', async ({
    page,
  }) => {
    // Login first
    await page.goto('/auth/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/login');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Login' })).toBeFocused();
  });
});
```

### Phase 8: CI/CD Integration (15 mins)

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, prod]
  pull_request:
    branches: [main, prod]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npx playwright test --project=${{ matrix.browser }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
```

## Testing Strategy

### Test Categories

1. **Smoke Tests** (run on every commit)
   - Login flow
   - Dashboard loads
   - Critical user paths

2. **Regression Tests** (run on PR)
   - All feature workflows
   - Cross-browser compatibility
   - Accessibility checks

3. **Visual Regression** (optional)
   - Screenshot comparisons
   - Animation consistency

### Test Data Management

```typescript
// e2e/fixtures/test-data.ts
export const testUsers = {
  standard: {
    email: 'standard@test.com',
    password: 'TestPass123!',
    name: 'Standard User',
  },
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    name: 'Admin User',
  },
};

export const testTasks = {
  simple: {
    title: 'Simple task',
    description: 'A basic task for testing',
  },
  complex: {
    title: 'Complex task',
    description: 'A task with many properties',
    category: 'work',
    priority: 'high',
  },
};
```

## Scripts to Add

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:codegen": "playwright codegen http://localhost:3000"
  }
}
```

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before asserting
3. **Use page objects** for maintainable tests
4. **Avoid hardcoded waits** - use Playwright's auto-waiting
5. **Test user journeys**, not implementation details
6. **Run tests in parallel** for speed
7. **Use fixtures** for setup/teardown
8. **Take screenshots on failure** for debugging

## Deliverables

1. ✅ Playwright configuration file
2. ✅ Page object models for all features
3. ✅ 20+ E2E tests covering critical paths
4. ✅ Accessibility tests with axe-core
5. ✅ CI/CD workflow configuration
6. ✅ Test data fixtures
7. ✅ Documentation on running tests

## Validation Steps

1. Run `npx playwright test` - all tests pass
2. Run `npx playwright test --ui` - tests are visible
3. Check coverage of critical user paths
4. Verify cross-browser compatibility
5. Confirm CI/CD integration works
6. Review test execution time (< 5 mins for smoke tests)

## Notes

- Focus on user-visible behavior, not implementation
- Keep tests independent and isolated
- Use descriptive test names
- Maintain test data in fixtures
- Document flaky tests and fix them
