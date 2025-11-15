# Common Issues and Proven Solutions

This document contains known issues, their root causes, and proven solutions.

---

## E2E Testing Issues

### Issue: E2E Tests Failing with Authentication Redirect Timeout

**Symptoms**:
```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
waiting for navigation to "/dashboard" until "load"
```

**Root Cause**:
Test attempts to login with credentials that don't exist in the database:
- Email: `test@example.com`
- Password: `TestPass123!`

**Affected Tests**:
- "should complete full user journey"
- "should not crash on any page"
- "should have no console errors"

**Solutions** (choose one):

#### Option A: Create Test User in Database (Recommended)
```typescript
// scripts/seed-test-user.ts
import { db } from '@/lib/db';
import { users, credentials } from '@/features/auth/schema';
import bcrypt from 'bcryptjs';

const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
};

const hashedPassword = await bcrypt.hash('TestPass123!', 10);

await db.insert(users).values(testUser);
await db.insert(credentials).values({
  userId: testUser.id,
  passwordHash: hashedPassword,
});
```

**Pros**: Tests real authentication flow
**Cons**: Requires database setup

#### Option B: Update Tests to Register First
```typescript
test('should complete full user journey', async ({ authPage }) => {
  // Register first
  await authPage.register({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
  });

  // Then login
  await authPage.login('test@example.com', 'TestPass123!');
  // ... rest of test
});
```

**Pros**: Self-contained tests
**Cons**: Tests become longer, slower

#### Option C: Use Test Database with Seed Data
```bash
# Setup test database before running tests
NODE_ENV=test npm run db:migrate
NODE_ENV=test npm run db:seed
npm run test:e2e
```

**Status**: ⚠️ Active Issue - Choose and implement solution

---

### Issue: Wrong Routes in E2E Tests

**Symptoms**:
Tests navigate to `/auth/login` but actual route is `/login`

**Solution**:
```typescript
// ❌ Wrong
await page.goto('/auth/login');

// ✅ Correct
await page.goto('/login');
```

**Status**: ✅ Fixed

---

### Issue: Label Selectors Don't Match Form Fields

**Symptoms**:
```
Error: locator.fill: Error: No element found for selector 'Email'
```

**Root Cause**:
Test looks for label "Email" but form has "Email address"

**Solution**:
```typescript
// ❌ Exact match (brittle)
await page.getByLabel('Email')

// ✅ Regex match (flexible)
await page.getByLabel(/email address/i)
await page.getByLabel(/^password$/i)
```

**Status**: ✅ Fixed

---

## Database Issues

### Issue: Migration Failed - Table Already Exists

**Symptoms**:
```
Error: table "feature_tasks" already exists
```

**Cause**:
Running migrations on database that already has tables

**Solution**:
```bash
# Reset database (WARNING: Deletes all data)
rm dev.db
npm run db:migrate

# OR for production - create new migration
npm run db:generate
# Review generated migration before running
npm run db:migrate
```

**Prevention**:
Always version control migration files and track which have been applied

**Status**: ✅ Known solution

---

### Issue: Type Error - Property Doesn't Exist on Inferred Type

**Symptoms**:
```
Property 'completed' does not exist on type 'Task'
```

**Cause**:
Schema was updated but TypeScript types not regenerated

**Solution**:
```bash
# Regenerate Drizzle types
npm run db:generate

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Status**: ✅ Known solution

---

## Animation Issues

### Issue: Animations Not Respecting Reduced Motion Preference

**Symptoms**:
Users with `prefers-reduced-motion` still see animations

**Cause**:
Animations not checking user preference

**Solution**:
```typescript
// Always check preference before animating
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (shouldAnimate) {
  anime({
    targets: '.element',
    scale: [0, 1],
    duration: 600,
  });
} else {
  // Just show the element
  element.style.opacity = '1';
}
```

**Status**: ✅ Implemented in animation library

---

### Issue: Anime.js Timeline Not Completing

**Symptoms**:
Timeline animation starts but never fires `complete` callback

**Cause**:
Targets don't exist when timeline is created

**Solution**:
```typescript
// ❌ Bad - targets might not exist yet
const timeline = anime.timeline();
timeline.add({
  targets: '.dynamic-element', // Doesn't exist yet!
  opacity: [0, 1],
});

// ✅ Good - ensure targets exist
useEffect(() => {
  if (elementRef.current) {
    const timeline = anime.timeline();
    timeline.add({
      targets: elementRef.current,
      opacity: [0, 1],
    });
  }
}, []);
```

**Status**: ✅ Known pattern

---

## Event Bus Issues

### Issue: Event Listener Called Multiple Times

**Symptoms**:
Event handler fires 2x, 3x, or more for single event emission

**Cause**:
Listener registered multiple times (common in React components)

**Solution**:
```typescript
// ❌ Bad - registers new listener every render
function Component() {
  eventBus.on('task.completed', handler);
  return <div>...</div>;
}

// ✅ Good - cleanup in useEffect
function Component() {
  useEffect(() => {
    const handler = (payload) => {
      console.log('Task completed:', payload);
    };

    eventBus.on('task.completed', handler);

    return () => {
      eventBus.off('task.completed', handler);
    };
  }, []);

  return <div>...</div>;
}
```

**Status**: ✅ Known pattern

---

### Issue: Events Not Being Received

**Symptoms**:
Event emitted but listener never fires

**Debugging Steps**:
```typescript
// 1. Enable debug mode
eventBus.setDebugMode(true);

// 2. Check event history
const recent = eventBus.getHistory(10);
console.log('Recent events:', recent);

// 3. Verify listener is registered
console.log('Listeners:', eventBus.getListeners('task.completed'));

// 4. Listen to all events
eventBus.on('*', (event, payload) => {
  console.log(`[Event] ${event}:`, payload);
});
```

**Common Causes**:
- Event name typo
- Listener registered after event already emitted
- Listener in wrong feature initialization order

**Status**: ✅ Known debugging approach

---

## Next.js 15 Specific Issues

### Issue: "params is not iterable" Error

**Symptoms**:
```
TypeError: params is not iterable
```

**Cause**:
Next.js 15 made `params` async - must be awaited

**Solution**:
```typescript
// ❌ Old (Next.js 14)
export default function Page({ params }) {
  const { id } = params;
  return <div>Task {id}</div>;
}

// ✅ New (Next.js 15)
export default async function Page({ params }) {
  const { id } = await params;
  return <div>Task {id}</div>;
}
```

**Status**: ✅ Known migration issue

---

### Issue: "headers() must be awaited" Error

**Symptoms**:
```
Error: headers() must be awaited
```

**Solution**:
```typescript
// ❌ Old
import { headers } from 'next/headers';
const headersList = headers();

// ✅ New
import { headers } from 'next/headers';
const headersList = await headers();
```

**Status**: ✅ Known Next.js 15 change

---

## Build and Deployment Issues

### Issue: Build Fails with "Module not found"

**Symptoms**:
```
Module not found: Can't resolve '@/features/tasks'
```

**Cause**:
Missing `tsconfig.json` path alias or incorrect path

**Solution**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Status**: ✅ Known configuration

---

### Issue: TypeScript Errors in Production Build but Not Dev

**Cause**:
Dev mode is more lenient

**Solution**:
```bash
# Run type check before build
npm run type-check

# Fix all errors
# Then build
npm run build
```

**Status**: ✅ Known workflow

---

## Performance Issues

### Issue: Slow Page Load Times

**Debugging Checklist**:
1. Check bundle size: `npm run build` and review output
2. Verify images using `next/image`
3. Check for unnecessary client components
4. Review database query efficiency
5. Check for memory leaks in animations

**Common Fixes**:
```typescript
// 1. Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'));

// 2. Use next/image
<Image src="/large.jpg" width={800} height={600} />

// 3. Convert to Server Component where possible
// Remove 'use client' if component doesn't need interactivity

// 4. Add database indexes
export const tasks = pgTable('feature_tasks', {
  userId: text('user_id'),
}, (table) => ({
  userIdx: index('tasks_user_idx').on(table.userId), // Add this!
}));

// 5. Clean up animations
timeline.complete = () => {
  particles.forEach(p => p.remove()); // Clean up DOM
};
```

**Status**: ✅ Known optimization techniques

---

## Development Environment Issues

### Issue: Hot Reload Not Working

**Solutions**:
```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Restart dev server
npm run dev

# 3. If using Turbopack, try without
npm run dev -- --no-turbopack

# 4. Check file watchers (macOS/Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Status**: ✅ Known solutions

---

### Issue: Port Already in Use

**Symptoms**:
```
Error: Port 3000 is already in use
```

**Solutions**:
```bash
# Find and kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

**Status**: ✅ Known solution

---

## Testing Best Practices to Avoid Issues

### Always:
1. ✅ Clean up event listeners in `afterEach`
2. ✅ Use test factories for consistent data
3. ✅ Reset database between tests
4. ✅ Mock external APIs
5. ✅ Use `waitFor` for async assertions
6. ✅ Test edge cases (empty arrays, null values, errors)

### Never:
1. ❌ Depend on test execution order
2. ❌ Share state between tests
3. ❌ Use hard-coded IDs (use factories)
4. ❌ Test implementation details
5. ❌ Mock what you're testing

---

## Getting Help

If you encounter an issue not listed here:

1. **Check error message** - Often points to exact problem
2. **Enable debug mode** - Use eventBus debug, console logs
3. **Check recent changes** - Review git diff
4. **Search documentation** - Check Next.js, Drizzle, Anime.js docs
5. **Add to this document** - Once solved, document it here!

---

**Last Updated**: 2025-11-15

**Note**: This document should be updated whenever new issues are discovered and solved. Include symptoms, root cause, solution, and status.
