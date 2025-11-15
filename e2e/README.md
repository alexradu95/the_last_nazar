# E2E Testing with Playwright

This directory contains end-to-end tests for Life OS using Playwright.

## Directory Structure

```
e2e/
├── fixtures/          # Test fixtures and page object factory
├── pages/            # Page object models
│   ├── base.page.ts
│   ├── auth.page.ts
│   ├── tasks.page.ts
│   └── gamification.page.ts
├── tests/            # Test files
│   ├── auth/         # Authentication tests
│   ├── tasks/        # Task management tests
│   ├── gamification/ # Gamification tests
│   ├── accessibility/# Accessibility tests
│   └── smoke.spec.ts # Quick smoke tests
└── utils/            # Helper utilities
```

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Specific Browser
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### View Report
```bash
npm run test:e2e:report
```

## Test Categories

### Smoke Tests
Quick sanity checks that run critical user paths:
- Application loads
- Login works
- Basic task creation
- No console errors

### Authentication Tests
- Login with valid/invalid credentials
- Registration
- Logout
- Session persistence

### Task Management Tests
- Create tasks
- Complete tasks
- Delete tasks
- Task persistence

### Gamification Tests
- XP display
- Level tracking
- Achievements
- Streaks

### Accessibility Tests
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management

## Page Object Pattern

Tests use the Page Object pattern for maintainability:

```typescript
import { test, expect } from '../fixtures';

test('should create task', async ({ tasksPage }) => {
  await tasksPage.createTask('My Task', 'Description');
  expect(await tasksPage.taskExists('My Task')).toBe(true);
});
```

## Writing New Tests

1. Use the test fixtures for page objects
2. Follow the existing patterns
3. Keep tests independent (no interdependencies)
4. Clean up test data when possible
5. Use meaningful test descriptions

Example:

```typescript
import { test, expect, testData } from '../fixtures';

test.describe('New Feature', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.login(
      testData.users.standard.email,
      testData.users.standard.password
    );
  });

  test('should do something', async ({ page }) => {
    // Your test here
  });
});
```

## Configuration

See `playwright.config.ts` for configuration options:
- Base URL
- Timeouts
- Browser projects
- Screenshots/videos on failure
- Trace on retry

## CI/CD Integration

Tests automatically run in CI when:
- Pull requests are created
- Code is pushed to main/prod branches

See `.github/workflows/e2e-tests.yml` for CI configuration.

## Debugging Tips

1. **Use UI Mode**: `npm run test:e2e:ui` - Interactive test runner
2. **Use Debug Mode**: `npm run test:e2e:debug` - Step through tests
3. **Screenshots**: Automatically captured on failure
4. **Videos**: Recorded for failed tests
5. **Traces**: Available for retried tests
6. **Console Logs**: Check browser console in headed mode

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data when possible
3. **Waits**: Use Playwright's auto-waiting, avoid hardcoded waits
4. **Selectors**: Prefer role-based selectors over CSS
5. **Page Objects**: Update page objects when UI changes
6. **Test Data**: Use fixtures for consistent test data

## Common Issues

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Verify network conditions

### Flaky Tests
- Check for race conditions
- Use proper waits
- Ensure test independence

### Element Not Found
- Update selectors in page objects
- Check if UI has changed
- Verify element is visible before interaction

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
