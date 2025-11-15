# Task 07: Testing Infrastructure

**Priority**: P3 - Quality Infrastructure
**Dependencies**: None (can test any feature)
**Can Start**: Immediately
**Estimated Timeline**: 3-4 days
**Parallelizable**: Yes - Completely independent

---

## Overview

Implement comprehensive testing infrastructure including unit tests, integration tests, E2E tests, and CI/CD pipeline. This ensures code quality, prevents regressions, and enables confident parallel development.

## Objectives

- Unit testing setup with Vitest
- Integration testing framework
- E2E testing with Playwright
- Component testing with React Testing Library
- API testing utilities
- Test coverage reporting
- CI/CD pipeline with GitHub Actions
- Performance testing
- Visual regression testing (optional)

## Testing Strategy

### Test Pyramid

```
        /\
       /  \        E2E Tests (10%)
      /────\       - Critical user flows
     /      \      - Cross-feature integration
    /────────\     Integration Tests (30%)
   /          \    - API endpoints
  /────────────\   - Event flows
 /              \  - Database operations
/────────────────\ Unit Tests (60%)
                   - Services
                   - Utilities
                   - Pure functions
```

## Testing Tools

### Core Testing Stack

```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/user-event": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@playwright/test": "^1.40.0",
  "msw": "^2.0.0",
  "c8": "^8.0.0"
}
```

## Unit Testing Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
        '**/types/',
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## Test Utilities

### Database Test Helpers

```typescript
// tests/utils/database.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export function createTestDatabase() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);

  // Run migrations
  migrate(db, { migrationsFolder: './drizzle/migrations' });

  return { db, sqlite };
}

export function cleanupTestDatabase(sqlite: Database.Database) {
  sqlite.close();
}
```

### Event Bus Test Helpers

```typescript
// tests/utils/eventBus.ts
import { EventBus } from '@/core/event-bus';

export function createTestEventBus() {
  const eventBus = new EventBus();
  const emittedEvents: Array<{ event: string; payload: any }> = [];

  // Capture all events
  eventBus.on('*', (event, payload) => {
    emittedEvents.push({ event, payload });
  });

  return { eventBus, emittedEvents };
}

export function waitForEvent(
  eventBus: EventBus,
  eventName: string,
  timeout = 1000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event ${eventName} not emitted within ${timeout}ms`));
    }, timeout);

    eventBus.on(eventName, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}
```

### React Testing Utilities

```typescript
// tests/utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

interface CustomRenderOptions extends RenderOptions {
  initialUser?: User;
}

function AllTheProviders({ children, initialUser }: any) {
  return (
    <AuthProvider initialUser={initialUser}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} initialUser={options?.initialUser} />,
    ...options,
  });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
```

## Unit Test Examples

### Service Tests

```typescript
// src/features/tasks/__tests__/task-service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, cleanupTestDatabase } from '@tests/utils/database';
import { createTestEventBus } from '@tests/utils/eventBus';
import { TaskService } from '../services/task-service';

describe('TaskService', () => {
  let db: any;
  let sqlite: any;
  let eventBus: any;
  let service: TaskService;

  beforeEach(() => {
    const dbSetup = createTestDatabase();
    db = dbSetup.db;
    sqlite = dbSetup.sqlite;

    const { eventBus: testEventBus } = createTestEventBus();
    eventBus = testEventBus;

    service = new TaskService(db, eventBus);
  });

  afterEach(() => {
    cleanupTestDatabase(sqlite);
  });

  describe('create', () => {
    it('should create a task', async () => {
      const task = await service.create({
        userId: 'user-1',
        title: 'Test Task',
        priority: 'high',
      });

      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.xpReward).toBe(50); // High priority
    });

    it('should emit task.created event', async () => {
      const { eventBus, emittedEvents } = createTestEventBus();
      const service = new TaskService(db, eventBus);

      await service.create({
        userId: 'user-1',
        title: 'Test Task',
      });

      const createdEvent = emittedEvents.find((e) => e.event === 'task.created');
      expect(createdEvent).toBeDefined();
      expect(createdEvent?.payload.title).toBe('Test Task');
    });
  });
});
```

### Component Tests

```typescript
// src/features/tasks/__tests__/TaskItem.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@tests/utils/render';
import userEvent from '@testing-library/user-event';
import { TaskItem } from '../components/TaskItem';

describe('TaskItem', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    status: 'active',
    priority: 'high',
    xpReward: 50,
  };

  it('should render task title', () => {
    render(<TaskItem task={mockTask} onComplete={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onComplete when checkbox clicked', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<TaskItem task={mockTask} onComplete={onComplete} onDelete={vi.fn()} />);

    const checkbox = screen.getByRole('button', { name: /mark as complete/i });
    await user.click(checkbox);

    expect(onComplete).toHaveBeenCalledWith(mockTask.id);
  });

  it('should show XP reward badge', () => {
    render(<TaskItem task={mockTask} onComplete={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('50 XP')).toBeInTheDocument();
  });
});
```

## Integration Testing

### API Integration Tests

```typescript
// tests/integration/api/tasks.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase } from '@tests/utils/database';
import { POST, GET } from '@/features/tasks/api/route';

describe('Tasks API Integration', () => {
  let db: any;
  let sqlite: any;

  beforeEach(() => {
    const setup = createTestDatabase();
    db = setup.db;
    sqlite = setup.sqlite;
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          title: 'Integration Test Task',
          priority: 'high',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.task.title).toBe('Integration Test Task');
    });

    it('should validate required fields', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          // Missing title
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
```

### Event Flow Integration Tests

```typescript
// tests/integration/event-flows/task-completion.test.ts
import { describe, it, expect } from 'vitest';
import { createTestDatabase } from '@tests/utils/database';
import { createTestEventBus, waitForEvent } from '@tests/utils/eventBus';
import { TaskService } from '@/features/tasks/services/task-service';

describe('Task Completion Event Flow', () => {
  it('should emit task.completed when task is completed', async () => {
    const { db, sqlite } = createTestDatabase();
    const { eventBus, emittedEvents } = createTestEventBus();

    const taskService = new TaskService(db, eventBus);

    // Create task
    const task = await taskService.create({
      userId: 'user-1',
      title: 'Test',
      priority: 'high',
    });

    // Clear events
    emittedEvents.length = 0;

    // Complete task
    await taskService.complete(task.id);

    // Check event was emitted
    const completedEvent = emittedEvents.find((e) => e.event === 'task.completed');
    expect(completedEvent).toBeDefined();
    expect(completedEvent?.payload.xpReward).toBe(50);

    sqlite.close();
  });
});
```

## E2E Testing with Playwright

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
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
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

```typescript
// tests/e2e/tasks/task-completion.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Task Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('/tasks');
  });

  test('should complete a task and show XP animation', async ({ page }) => {
    // Create a task
    await page.click('button:has-text("New Task")');
    await page.fill('input[name="title"]', 'E2E Test Task');
    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button:has-text("Create Task")');

    // Wait for task to appear
    await expect(page.locator('text=E2E Test Task')).toBeVisible();

    // Complete the task
    await page.click('[aria-label="Mark as complete"]');

    // Verify XP animation appears
    await expect(page.locator('text="+50 XP"')).toBeVisible();

    // Verify task is marked complete
    await expect(page.locator('text=E2E Test Task').locator('..')).toHaveClass(/completed/);
  });

  test('should update statistics after task completion', async ({ page }) => {
    const initialCompleted = await page.locator('[data-testid="completed-count"]').textContent();

    // Complete a task
    await page.click('[aria-label="Mark as complete"]');

    // Wait for stats to update
    await expect(page.locator('[data-testid="completed-count"]')).not.toHaveText(initialCompleted || '');
  });
});
```

### Authentication E2E Tests

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('/tasks');
    await expect(page.locator('h1')).toContainText('Tasks');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Registration successful')).toBeVisible();
  });
});
```

## Mock Service Worker (MSW)

### API Mocking

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Tasks API
  http.get('/api/tasks', () => {
    return HttpResponse.json({
      tasks: [
        { id: '1', title: 'Mock Task 1', status: 'active' },
        { id: '2', title: 'Mock Task 2', status: 'completed' },
      ],
    });
  }),

  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        task: {
          id: Math.random().toString(),
          ...body,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  }),

  // Auth API
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as any;

    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        user: { id: '1', email, name: 'Test User' },
        token: 'mock-jwt-token',
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
];
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## Performance Testing

### Load Testing

```typescript
// tests/performance/api-load.test.ts
import { describe, it, expect } from 'vitest';
import { performance } from 'perf_hooks';

describe('API Performance', () => {
  it('should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      fetch('http://localhost:3000/api/tasks?userId=user-1')
    );

    const start = performance.now();
    await Promise.all(requests);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5000); // Should complete in 5 seconds
  });
});
```

### Render Performance

```typescript
// tests/performance/component-render.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { TaskList } from '@/features/tasks/components/TaskList';

describe('Component Performance', () => {
  it('should render 1000 tasks quickly', () => {
    const tasks = Array.from({ length: 1000 }, (_, i) => ({
      id: `task-${i}`,
      title: `Task ${i}`,
      status: 'active',
      priority: 'medium',
      xpReward: 25,
    }));

    const start = performance.now();
    render(<TaskList tasks={tasks} categories={[]} onComplete={() => {}} onDelete={() => {}} onRefresh={async () => {}} />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // Should render in 1 second
  });
});
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run feature validation
        run: npm run validate-features

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20.x

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check build size
        run: |
          SIZE=$(du -sb .next | cut -f1)
          if [ $SIZE -gt 52428800 ]; then
            echo "Build size exceeds 50MB"
            exit 1
          fi
```

## Test Scripts

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

## Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Install testing dependencies
- [ ] Configure Vitest
- [ ] Configure Playwright
- [ ] Set up test utilities
- [ ] Create MSW handlers

### Phase 2: Unit Tests (Day 1-2)
- [ ] Write service layer tests
- [ ] Write utility function tests
- [ ] Write component tests
- [ ] Achieve 80%+ coverage

### Phase 3: Integration Tests (Day 2)
- [ ] Write API integration tests
- [ ] Write event flow tests
- [ ] Write database integration tests

### Phase 4: E2E Tests (Day 2-3)
- [ ] Write critical user flow tests
- [ ] Write authentication tests
- [ ] Write cross-feature tests

### Phase 5: CI/CD (Day 3)
- [ ] Set up GitHub Actions
- [ ] Configure coverage reporting
- [ ] Set up automated checks
- [ ] Add pre-commit hooks

### Phase 6: Documentation (Day 3-4)
- [ ] Write testing guide
- [ ] Document test patterns
- [ ] Create examples
- [ ] Training materials

## Success Criteria

- [ ] 80%+ code coverage
- [ ] All critical flows have E2E tests
- [ ] CI/CD pipeline running
- [ ] Tests run in < 5 minutes
- [ ] Documentation complete
- [ ] Team trained on testing

## Deliverables

1. Complete testing setup
2. Unit test suite (80%+ coverage)
3. Integration test suite
4. E2E test suite
5. CI/CD pipeline
6. Testing documentation
7. Testing best practices guide

---

**Ready to start? Install dependencies**: `npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test msw c8`
