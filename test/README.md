# Testing Infrastructure

This project follows strict **Test-Driven Development (TDD)** principles with behavior-driven testing patterns. Every line of production code must be written in response to a failing test.

## Table of Contents

- [Core Principles](#core-principles)
- [TDD Workflow](#tdd-workflow)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Testing Patterns](#testing-patterns)
- [Coverage Requirements](#coverage-requirements)

## Core Principles

### 1. Test-Driven Development (TDD)

**TDD is non-negotiable.** Follow the Red-Green-Refactor cycle:

1. **Red**: Write a failing test for desired behavior
2. **Green**: Write minimum code to make the test pass
3. **Refactor**: Assess and improve code structure (only if it adds value)

**Never write production code without a failing test first.**

### 2. Behavior-Driven Testing

- Test **behavior** through public APIs, not implementation details
- No 1:1 mapping between test files and source files
- Tests should document expected business behavior
- Implementation details should be invisible to tests

### 3. Type Safety

- No `any` types in tests (same as production code)
- No type assertions unless absolutely necessary
- All test code follows TypeScript strict mode

## TDD Workflow

### Example: Adding a Feature

```typescript
// Step 1: RED - Write failing test
describe('Order processing', () => {
  it('should calculate total with shipping cost', () => {
    const order = createOrder({
      items: [{ price: 30, quantity: 1 }],
      shippingCost: 5.99,
    });

    const processed = processOrder(order);

    expect(processed.total).toBe(35.99);
  });
});

// Test fails - processOrder doesn't exist yet

// Step 2: GREEN - Minimal implementation
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    ...order,
    total: itemsTotal + order.shippingCost,
  };
};

// Test passes!

// Step 3: RED - Add next behavior
it('should apply free shipping over $50', () => {
  const order = createOrder({
    items: [{ price: 60, quantity: 1 }],
    shippingCost: 5.99,
  });

  const processed = processOrder(order);

  expect(processed.shippingCost).toBe(0);
  expect(processed.total).toBe(60);
});

// Step 4: GREEN - Implement new behavior
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost = itemsTotal > 50 ? 0 : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: itemsTotal + shippingCost,
  };
};

// Step 5: REFACTOR - Assess and improve (only if needed)
const FREE_SHIPPING_THRESHOLD = 50;

const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = calculateItemsTotal(order.items);
  const shippingCost = itemsTotal > FREE_SHIPPING_THRESHOLD
    ? 0
    : order.shippingCost;

  return {
    ...order,
    shippingCost,
    total: itemsTotal + shippingCost,
  };
};

// Commit: git commit -m "feat: add order processing with free shipping"
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/file.test.ts

# Run tests matching pattern
npm test -- --grep "order processing"

# Run tests in UI mode
npm test -- --ui

# Type check
npm run type-check
```

## Writing Tests

### Test File Organization

```
src/
  features/
    payments/
      services/
        payment-processor.ts
        payment-validator.ts
      __tests__/
        payment-processor.test.ts  # Tests both files through behavior
```

### Using Test Factories

**CRITICAL**: Always use real schemas from production code, never redefine them in tests.

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getMockUser, getMockTask, createMany } from '@/test/utils';

describe('Task Service', () => {
  it('should create task with default values', () => {
    // Use factory with defaults
    const task = getMockTask();

    expect(task.status).toBe('active');
    expect(task.priority).toBe('medium');
  });

  it('should create task with custom values', () => {
    // Override specific fields
    const task = getMockTask({
      title: 'Custom Task',
      priority: 'high',
      xpReward: 100,
    });

    expect(task.title).toBe('Custom Task');
    expect(task.priority).toBe('high');
  });

  it('should create multiple tasks', () => {
    // Create many instances
    const tasks = createMany(getMockTask, 5, (index) => ({
      title: `Task ${index + 1}`,
    }));

    expect(tasks).toHaveLength(5);
    expect(tasks[0].title).toBe('Task 1');
  });
});
```

### Database Testing

```typescript
import { createTestDb, createTestTables, seedTestData } from '@/test/utils';
import { tasks } from '@/features/tasks/schema';

describe('Task Database Operations', () => {
  let db: TestDb;
  let sqlite: Database.Database;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    sqlite = testDb.sqlite;

    // Create tables
    createTestTables(sqlite, {
      tasks: `
        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          status TEXT DEFAULT 'active'
        )
      `,
    });
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should insert and retrieve task', async () => {
    const task = getMockTask();

    await db.insert(tasks).values(task);

    const retrieved = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, task.id));

    expect(retrieved[0]).toMatchObject(task);
  });
});
```

### React Component Testing

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/react';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  it('should display list of tasks', async () => {
    const tasks = createMany(getMockTask, 3);
    const { user } = renderWithProviders(<TaskList tasks={tasks} />);

    // Verify all tasks are displayed
    tasks.forEach((task) => {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });

  it('should handle task completion', async () => {
    const onComplete = vi.fn();
    const task = getMockTask({ title: 'Test Task' });
    const { user } = renderWithProviders(
      <TaskList tasks={[task]} onComplete={onComplete} />
    );

    // Click complete button
    const completeButton = screen.getByRole('button', { name: /complete/i });
    await user.click(completeButton);

    expect(onComplete).toHaveBeenCalledWith(task.id);
  });

  it('should show empty state when no tasks', () => {
    renderWithProviders(<TaskList tasks={[]} />);

    expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
  });
});
```

### Event Testing

```typescript
import { EventCapture } from '@/test/utils';
import { EventBus } from '@/core/event-bus';

describe('Task Events', () => {
  let eventBus: EventBus;
  let capture: EventCapture;

  beforeEach(() => {
    eventBus = new EventBus();
    capture = new EventCapture();

    // Capture all events
    eventBus.on('*', (event, payload) => {
      capture.capture(event, payload);
    });
  });

  it('should emit task.created event', async () => {
    await taskService.create(getMockTask());

    const event = capture.findEvent('task.created');
    expect(event).toBeDefined();
    expect(event?.payload.title).toBe('Test Task');
  });

  it('should emit multiple events', async () => {
    await taskService.create(getMockTask());
    await taskService.create(getMockTask());

    expect(capture.findEvents('task.created')).toHaveLength(2);
  });
});
```

## Test Utilities

### Available Utilities

#### Factories (`test/utils/factories.ts`)

- `getMockUser(overrides?)` - Create test user
- `getMockTask(overrides?)` - Create test task
- `getMockCategory(overrides?)` - Create test category
- `getMockAchievement(overrides?)` - Create test achievement
- `createMany(factory, count, overridesFn?)` - Create multiple instances

#### Database (`test/utils/db.ts`)

- `createTestDb()` - Create in-memory test database
- `createTestTables(sqlite, tables)` - Create test tables
- `seedTestData(db, table, data)` - Seed test data
- `clearTestTable(db, table)` - Clear table data

#### Test Helpers (`test/utils/test-helpers.ts`)

- `EventCapture` - Capture and assert on events
- `waitFor(condition, options?)` - Wait for condition
- `sleep(ms)` - Async delay
- `testDates` - Consistent test dates
- `mockTimers()` - Mock timer utilities
- `createSpy<T>()` - Create type-safe spy

#### React (`test/utils/react.tsx`)

- `renderWithProviders(ui, options?)` - Render with providers
- `testAccessibility(container)` - Run accessibility checks
- `findByTextContent(text)` - Case-insensitive text finder
- `createMockFormHandlers()` - Mock form event handlers

## Testing Patterns

### Pattern 1: Testing Through Public API

```typescript
// ❌ WRONG - Testing implementation details
it('should call validateAmount method', () => {
  const spy = vi.spyOn(paymentService, 'validateAmount');
  paymentService.process(payment);
  expect(spy).toHaveBeenCalled();
});

// ✅ CORRECT - Testing behavior
it('should reject payment with invalid amount', () => {
  const payment = getMockPayment({ amount: -100 });

  const result = paymentService.process(payment);

  expect(result.success).toBe(false);
  expect(result.error).toBe('Invalid amount');
});
```

### Pattern 2: No Schema Redefinition

```typescript
// ❌ WRONG - Redefining schemas in tests
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  // ... duplicating production schema
});

// ✅ CORRECT - Import from production code
import { TaskSchema, type Task } from '@/features/tasks/schema';

const getMockTask = (overrides?: Partial<Task>): Task => {
  const baseTask = { /* defaults */ };
  return TaskSchema.parse({ ...baseTask, ...overrides });
};
```

### Pattern 3: Achieving 100% Coverage Through Behavior

```typescript
// payment-validator.ts (implementation detail - not tested directly)
export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

// payment-processor.ts (public API - tested)
export const processPayment = (payment: Payment): Result<Payment> => {
  if (!validateAmount(payment.amount)) {
    return { success: false, error: 'Invalid amount' };
  }
  // ...
};

// payment-processor.test.ts
// These tests achieve 100% coverage of validation without testing it directly
describe('Payment processing', () => {
  it('should reject negative amounts', () => {
    const payment = getMockPayment({ amount: -100 });
    expect(processPayment(payment).success).toBe(false);
  });

  it('should reject amounts over limit', () => {
    const payment = getMockPayment({ amount: 10001 });
    expect(processPayment(payment).success).toBe(false);
  });

  it('should accept valid amounts', () => {
    const payment = getMockPayment({ amount: 100 });
    expect(processPayment(payment).success).toBe(true);
  });
});
```

### Pattern 4: Immutable Test Data

```typescript
// ✅ CORRECT - Immutable operations
it('should not mutate original task', () => {
  const original = getMockTask({ status: 'active' });

  const updated = updateTask(original, { status: 'completed' });

  expect(original.status).toBe('active'); // Original unchanged
  expect(updated.status).toBe('completed');
});
```

## Coverage Requirements

- **Lines**: 80% minimum (aim for 100%)
- **Functions**: 80% minimum
- **Branches**: 80% minimum
- **Statements**: 80% minimum

**Important**: Coverage must be achieved through behavior testing, not implementation testing.

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

## Best Practices

### DO

✅ Write tests first (TDD)
✅ Test behavior through public APIs
✅ Use factory functions for test data
✅ Keep tests focused and readable
✅ Use descriptive test names
✅ Follow the arrange-act-assert pattern
✅ Mock external dependencies
✅ Clean up after tests (afterEach)
✅ Use real schemas from production code

### DON'T

❌ Write production code without a failing test
❌ Test implementation details
❌ Use `any` types in tests
❌ Redefine schemas in test files
❌ Skip the refactor assessment step
❌ Create abstractions prematurely
❌ Commit failing tests
❌ Skip test cleanup

## Troubleshooting

### Tests Failing Unexpectedly

1. Check if you're testing behavior, not implementation
2. Verify test data uses correct schemas
3. Ensure proper cleanup in `afterEach`
4. Check for test pollution (shared state)

### Coverage Not Increasing

1. Ensure tests exercise all code paths
2. Test edge cases and error conditions
3. Verify tests are actually running
4. Check coverage exclude patterns

### Type Errors in Tests

1. Verify TypeScript strict mode compliance
2. Check that real schemas are being used
3. Ensure proper type inference in factories
4. Avoid type assertions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Testing Best Practices](https://testingjavascript.com/)

## Questions?

If you're unsure whether to test something or how to test it:

1. Ask: "What is the behavior I want to verify?"
2. Write a test that describes that behavior
3. Implement the minimum code to make it pass
4. Assess if refactoring would add value
5. Commit and move to next behavior

Remember: **No production code without a failing test first!**
