# Testing Quick Start Guide

Get started with testing in 5 minutes! This guide will help you write your first test following TDD principles.

## Prerequisites

All dependencies are already installed. You're ready to start testing!

## Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for TDD)
npm test -- --watch

# Run specific test file
npm test -- path/to/your.test.ts

# Run with coverage
npm run test:coverage
```

## Write Your First Test (TDD Style)

### Step 1: RED - Write a Failing Test

Create a new test file (e.g., `src/features/calculator/calculator.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';

describe('Calculator', () => {
  it('should add two numbers', () => {
    const result = add(2, 3);

    expect(result).toBe(5);
  });
});
```

Run the test - it will fail because `add` doesn't exist yet:

```bash
npm test -- calculator.test.ts --run
```

### Step 2: GREEN - Make It Pass

Create the implementation (`src/features/calculator/calculator.ts`):

```typescript
export const add = (a: number, b: number): number => {
  return a + b;
};
```

Update your test to import it:

```typescript
import { describe, it, expect } from 'vitest';
import { add } from './calculator';

describe('Calculator', () => {
  it('should add two numbers', () => {
    const result = add(2, 3);

    expect(result).toBe(5);
  });
});
```

Run the test again - it passes! ✅

### Step 3: REFACTOR - Improve the Code

The code is already clean for this simple example. If we had multiple calculations, we might extract constants or helper functions.

**Always assess refactoring after green, but only refactor if it adds value.**

## Testing Patterns

### Using Test Factories

```typescript
import { getMockUser, getMockTask } from '@/test/utils';

it('should create a task for a user', () => {
  const user = getMockUser({ email: 'test@example.com' });
  const task = getMockTask({ userId: user.id, title: 'My Task' });

  expect(task.userId).toBe(user.id);
  expect(task.title).toBe('My Task');
});
```

### Testing React Components

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/react';
import { MyButton } from './MyButton';

describe('MyButton', () => {
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = renderWithProviders(
      <MyButton onClick={handleClick}>Click me</MyButton>
    );

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Async Code

```typescript
import { describe, it, expect, vi } from 'vitest';

it('should fetch data successfully', async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'test' }),
  });

  const result = await fetchData();

  expect(result.data).toBe('test');
  expect(fetch).toHaveBeenCalledWith('/api/data');
});
```

### Testing Database Operations

```typescript
import { createTestDb, createTestTables } from '@/test/utils';

describe('User Repository', () => {
  let db: TestDb;
  let sqlite: Database.Database;

  beforeEach(() => {
    const testDb = createTestDb();
    db = testDb.db;
    sqlite = testDb.sqlite;

    createTestTables(sqlite, {
      users: `CREATE TABLE users (id TEXT, email TEXT)`,
    });
  });

  afterEach(() => {
    sqlite.close();
  });

  it('should insert user', async () => {
    await db.insert(users).values({ id: '1', email: 'test@example.com' });

    const result = await db.select().from(users);

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe('test@example.com');
  });
});
```

## Common Commands

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Run specific file
npm test -- my-feature.test.ts

# Run tests matching pattern
npm test -- --grep "user login"

# Coverage report
npm run test:coverage

# UI mode (visual test runner)
npm test -- --ui

# Type check
npm run type-check
```

## Key Principles

1. **Always write tests first** (RED)
2. **Write minimum code to pass** (GREEN)
3. **Assess and refactor if it adds value** (REFACTOR)
4. **Test behavior, not implementation**
5. **Use real schemas from production code**
6. **Keep tests focused and readable**

## Example Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Run before each test
  });

  afterEach(() => {
    // Run after each test (cleanup)
  });

  describe('Specific Behavior', () => {
    it('should do something when condition is met', () => {
      // Arrange - set up test data
      const input = createTestInput();

      // Act - execute the behavior
      const result = performAction(input);

      // Assert - verify the outcome
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Tips

- **Use descriptive test names**: "should calculate total with discount" not "test1"
- **One assertion per concept**: Focus on one behavior per test
- **No magic numbers**: Use named constants or factory functions
- **Clean up after tests**: Use `afterEach` for cleanup
- **Mock external dependencies**: Use `vi.fn()` for mocks
- **Avoid test interdependence**: Each test should run independently

## Next Steps

1. **Read the full documentation**: See `test/README.md` for comprehensive guide
2. **Check examples**: Look at `test/examples/` for detailed patterns
3. **Explore utilities**: Review `test/utils/` for available helpers
4. **Start writing tests**: Follow TDD for your next feature!

## Getting Help

- **Full Documentation**: `test/README.md`
- **Example Tests**: `test/examples/*.test.ts`
- **Test Utilities**: `test/utils/index.ts`
- **Vitest Docs**: https://vitest.dev/

## Remember

**No production code without a failing test first!**

Happy testing! 🎯
