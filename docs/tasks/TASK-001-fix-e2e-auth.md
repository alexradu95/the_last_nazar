# TASK-001: Fix E2E Authentication Tests

**Sprint**: Next Sprint
**Priority**: 🔴 Critical (Blocker)
**Status**: 📋 Ready
**Estimate**: 4 hours
**Assignee**: TBD

---

## 📝 Description

Currently, 3 out of 5 E2E tests are failing due to authentication issues. Tests attempt to login with credentials that don't exist in the database (`test@example.com` / `TestPass123!`), causing timeouts waiting for redirect to `/dashboard`.

**Current State**: 2/5 tests passing (40%)
**Target State**: 5/5 tests passing (100%)

---

## 🎯 Acceptance Criteria

- [ ] All 5 E2E tests pass consistently
- [ ] Test user exists in database with correct credentials
- [ ] Tests can successfully login and navigate to dashboard
- [ ] No console errors during test execution
- [ ] Tests run successfully in CI/CD pipeline
- [ ] Test database properly seeded before each test run

---

## 🔗 Dependencies

**Depends on:**
- Authentication system (✅ Already implemented)
- Playwright test infrastructure (✅ Already implemented)

**Blocks:**
- Deployment to staging/production
- Confidence in auth system reliability

---

## 🛠️ Implementation Approach

### Option A: Create Test User in Database (Recommended)

```typescript
// scripts/seed-test-user.ts
import { db } from '@/lib/db';
import { users, credentials } from '@/features/auth/schema';
import bcrypt from 'bcryptjs';

export async function seedTestUser() {
  const testUser = {
    id: 'test-user-e2e',
    email: 'test@example.com',
    name: 'E2E Test User',
  };

  const hashedPassword = await bcrypt.hash('TestPass123!', 10);

  await db.insert(users).values(testUser);
  await db.insert(credentials).values({
    userId: testUser.id,
    passwordHash: hashedPassword,
  });

  console.log('✅ Test user seeded successfully');
}
```

**Steps:**
1. Create seed script for test user
2. Update E2E test setup to run seed before tests
3. Add teardown to clean test data after tests
4. Update CI/CD pipeline to include seeding

### Option B: Add Registration to Test Flow

Update tests to register user before attempting login.

**Pros/Cons**: Self-contained but slower, adds complexity to tests.

---

## 📋 Tasks Breakdown

1. **Create seed script** (1 hour)
   - Write `scripts/seed-test-user.ts`
   - Add npm script: `"test:e2e:seed": "tsx scripts/seed-test-user.ts"`

2. **Update Playwright config** (1 hour)
   - Add `globalSetup` to run seed script
   - Add `globalTeardown` to clean test data
   - Ensure test database isolation

3. **Verify all tests pass** (1 hour)
   - Run: `npm run test:e2e`
   - Debug any remaining issues
   - Verify in Playwright UI

4. **Update CI/CD pipeline** (1 hour)
   - Update GitHub Actions workflow
   - Add database seeding step
   - Verify tests pass in CI environment

---

## 🧪 Testing Requirements

### Unit Tests
- Test seed script creates user correctly
- Test seed script is idempotent (can run multiple times)

### E2E Tests
All existing tests should pass:
- ✅ "should load the application"
- ✅ "should load login page"
- ✅ "should complete full user journey"
- ✅ "should not crash on any page"
- ✅ "should have no console errors"

### Manual Testing
- [ ] Run `npm run test:e2e` locally - all pass
- [ ] Run in CI - all pass
- [ ] Verify test user doesn't interfere with development

---

## 📚 Related Documentation

- [CLAUDE-troubleshooting.md](../CLAUDE-troubleshooting.md#e2e-testing-issues) - Known auth issues
- [CLAUDE-activeContext.md](../CLAUDE-activeContext.md) - Current blocker status
- [TEST_FIXES_SUMMARY.md](../current/IMPLEMENTATION-SUMMARY.md) - Previous test fixes

---

## 🔍 Implementation Notes

### Security Considerations
- Test user should only exist in test database
- Use environment variable to prevent test user in production
- Test credentials should be documented but not secret

### Database Considerations
- Use separate test database (`test.db` for SQLite)
- Ensure clean state before each test run
- Consider using transactions for test isolation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Seed test database
  run: npm run test:e2e:seed
  env:
    DATABASE_URL: file:./test.db

- name: Run E2E tests
  run: npm run test:e2e
```

---

## ✅ Definition of Done

- [ ] All 5 E2E tests pass locally
- [ ] All 5 E2E tests pass in CI/CD
- [ ] Test database seeding script created
- [ ] Playwright config updated with global setup/teardown
- [ ] CI/CD pipeline updated
- [ ] Documentation updated (if needed)
- [ ] Code reviewed and approved
- [ ] Merged to main branch

---

## 📊 Success Metrics

- **Test Pass Rate**: 40% → 100%
- **Test Execution Time**: No significant increase
- **Flakiness**: 0% (tests should be deterministic)
- **CI/CD Success Rate**: 100%

---

**Created**: 2025-11-15
**Last Updated**: 2025-11-15
