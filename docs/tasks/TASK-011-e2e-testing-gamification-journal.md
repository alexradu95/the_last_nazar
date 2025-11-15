# TASK-011: E2E Testing for Gamification & Journal Features

**Status**: Not Started
**Priority**: High
**Dependencies**: TASK-006, TASK-007, TASK-008
**Estimated Effort**: 3-4 hours

---

## Objective

Create comprehensive end-to-end tests for gamification and journal features to ensure full user flows work correctly.

---

## Current State

- ✅ E2E testing framework set up (Playwright)
- ✅ Auth tests working
- ❌ No gamification feature tests
- ❌ No journal feature tests
- ❌ No integration tests for XP awards

---

## Requirements

### 1. Gamification E2E Tests

Test the complete user journey:
- View gamification dashboard
- Complete a task → Verify XP awarded
- Check XP history shows the award
- Unlock an achievement
- View leaderboard

### 2. Journal E2E Tests

Test the complete user journey:
- Create a new journal entry
- View entry in list
- Edit an existing entry
- Delete an entry with confirmation
- View entry in calendar
- Filter entries by date/mood

### 3. Integration Tests

Test cross-feature functionality:
- Complete task → XP awarded → Check dashboard updated
- Create journal entry → XP awarded → Check history
- Multiple actions → Achievement unlocked → Notification shown

### 4. Accessibility Tests

Ensure features are accessible:
- Keyboard navigation works
- Screen reader announcements
- ARIA labels correct
- Color contrast sufficient

---

## Implementation Plan

### Step 1: Create Gamification E2E Tests

**Create**: `tests/e2e/gamification.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser } from '../helpers/test-data';

test.describe('Gamification Features', () => {
  let testUserId: string;

  test.beforeEach(async () => {
    testUserId = await seedTestUser();
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUserId);
  });

  test('should display gamification dashboard', async ({ page }) => {
    await page.goto('/gamification');

    // Check for main sections
    await expect(page.getByRole('heading', { name: 'Gamification' })).toBeVisible();
    await expect(page.getByText(/Your Progress/i)).toBeVisible();
    await expect(page.getByText(/Recent XP Gains/i)).toBeVisible();
    await expect(page.getByText(/Achievements/i)).toBeVisible();
  });

  test('should show user level and XP', async ({ page }) => {
    await page.goto('/gamification');

    // Check level badge is visible
    await expect(page.getByText(/Level \d+/i)).toBeVisible();

    // Check XP progress bar exists
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should display XP history', async ({ page }) => {
    await page.goto('/gamification');

    // Check XP history section
    const historySection = page.getByText(/Recent XP Gains/i);
    await expect(historySection).toBeVisible();

    // If user has history, check items display
    const historyItems = page.locator('[data-testid="xp-history-item"]');
    const count = await historyItems.count();

    if (count > 0) {
      // Verify first item has required info
      const firstItem = historyItems.first();
      await expect(firstItem).toContainText(/\d+ XP/i);
    }
  });

  test('should display achievements', async ({ page }) => {
    await page.goto('/gamification');

    // Check achievements section
    await expect(page.getByText(/Achievements/i)).toBeVisible();

    // Check at least one achievement card is visible
    const achievementCards = page.locator('[data-testid="achievement-card"]');
    await expect(achievementCards.first()).toBeVisible();
  });

  test('should show achievement details on hover/click', async ({ page }) => {
    await page.goto('/gamification');

    const achievementCard = page.locator('[data-testid="achievement-card"]').first();
    await achievementCard.hover();

    // Check for achievement details (description, XP reward, etc.)
    await expect(achievementCard.getByText(/\d+ XP/i)).toBeVisible();
  });

  test.skip('should award XP when task completed', async ({ page }) => {
    // Navigate to tasks page
    await page.goto('/tasks');

    // Get initial XP
    await page.goto('/gamification');
    const initialXPText = await page.locator('[data-testid="total-xp"]').textContent();
    const initialXP = parseInt(initialXPText?.match(/\d+/)?.[0] || '0');

    // Complete a task
    await page.goto('/tasks');
    const taskCheckbox = page.locator('[data-testid="task-checkbox"]').first();
    await taskCheckbox.check();

    // Verify XP increased
    await page.goto('/gamification');
    await page.waitForTimeout(1000); // Wait for XP to update

    const newXPText = await page.locator('[data-testid="total-xp"]').textContent();
    const newXP = parseInt(newXPText?.match(/\d+/)?.[0] || '0');

    expect(newXP).toBeGreaterThan(initialXP);

    // Check XP history shows the award
    const latestHistory = page.locator('[data-testid="xp-history-item"]').first();
    await expect(latestHistory).toContainText(/task/i);
  });
});
```

### Step 2: Create Journal E2E Tests

**Create**: `tests/e2e/journal.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser } from '../helpers/test-data';

test.describe('Journal Features', () => {
  let testUserId: string;

  test.beforeEach(async () => {
    testUserId = await seedTestUser();
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUserId);
  });

  test('should display journal page with tabs', async ({ page }) => {
    await page.goto('/journal');

    // Check main heading
    await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible();

    // Check all tabs are present
    await expect(page.getByRole('button', { name: /Write/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Entries/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Calendar/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Luna Insights/i })).toBeVisible();
  });

  test('should create a new journal entry', async ({ page }) => {
    await page.goto('/journal');

    // Ensure we're on the Write tab
    await page.getByRole('button', { name: /Write/i }).click();

    // Fill in journal entry
    const titleInput = page.getByLabel(/Title/i);
    const contentInput = page.getByLabel(/Content/i);

    await titleInput.fill('Test Journal Entry');
    await contentInput.fill('This is a test journal entry with some content.');

    // Select mood
    const moodButton = page.getByRole('button', { name: /😊/i });
    if (await moodButton.isVisible()) {
      await moodButton.click();
    }

    // Save entry
    const saveButton = page.getByRole('button', { name: /Save/i });
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Verify entry appears in Entries tab
    await page.getByRole('button', { name: /Entries/i }).click();
    await expect(page.getByText('Test Journal Entry')).toBeVisible();
  });

  test('should edit an existing journal entry', async ({ page }) => {
    // First create an entry
    await page.goto('/journal');
    await page.getByLabel(/Content/i).fill('Original content');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(1000);

    // Go to Entries tab
    await page.getByRole('button', { name: /Entries/i }).click();

    // Click to edit
    const entryCard = page.locator('[data-testid="journal-entry"]').first();
    await entryCard.click();

    // Should be back on Write tab with entry loaded
    await expect(page.getByLabel(/Content/i)).toHaveValue(/Original content/i);

    // Edit the content
    await page.getByLabel(/Content/i).fill('Updated content');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(1000);

    // Verify update in Entries tab
    await page.getByRole('button', { name: /Entries/i }).click();
    await expect(page.getByText('Updated content')).toBeVisible();
  });

  test('should delete a journal entry', async ({ page }) => {
    // Create an entry first
    await page.goto('/journal');
    await page.getByLabel(/Content/i).fill('Entry to delete');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(1000);

    // Go to Entries tab
    await page.getByRole('button', { name: /Entries/i }).click();

    // Find and click delete button
    const deleteButton = page.locator('[data-testid="delete-entry"]').first();
    await deleteButton.click();

    // Confirm deletion in dialog
    await page.getByRole('button', { name: /Confirm/i }).click();

    // Verify entry is gone
    await expect(page.getByText('Entry to delete')).not.toBeVisible();
  });

  test('should display mood selector', async ({ page }) => {
    await page.goto('/journal');

    // Check mood selector is visible
    const moodSelector = page.locator('[data-testid="mood-selector"]');
    await expect(moodSelector).toBeVisible();

    // Check all mood options
    await expect(page.getByRole('button', { name: /😢/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /😕/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /😐/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /😊/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /😄/i })).toBeVisible();
  });

  test('should show word count', async ({ page }) => {
    await page.goto('/journal');

    const contentInput = page.getByLabel(/Content/i);
    await contentInput.fill('This is a test with multiple words to count.');

    // Check word count displays
    const wordCount = page.locator('[data-testid="word-count"]');
    await expect(wordCount).toBeVisible();
    await expect(wordCount).toContainText(/\d+ words/i);
  });

  test('should display calendar view', async ({ page }) => {
    await page.goto('/journal');

    // Switch to Calendar tab
    await page.getByRole('button', { name: /Calendar/i }).click();

    // Check calendar is visible
    const calendar = page.locator('[data-testid="journal-calendar"]');
    await expect(calendar).toBeVisible();
  });

  test('should display Luna insights', async ({ page }) => {
    await page.goto('/journal');

    // Switch to Luna Insights tab
    await page.getByRole('button', { name: /Luna Insights/i }).click();

    // Check insights section is visible
    await expect(page.getByText(/insights/i)).toBeVisible();
  });
});
```

### Step 3: Create Luna Chat E2E Tests

**Create**: `tests/e2e/luna-chat.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser } from '../helpers/test-data';

test.describe('Luna Chat', () => {
  let testUserId: string;

  test.beforeEach(async () => {
    testUserId = await seedTestUser();
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUserId);
  });

  test('should display Luna chat interface', async ({ page }) => {
    await page.goto('/journal/luna');

    // Check heading
    await expect(page.getByRole('heading', { name: /Chat with Luna/i })).toBeVisible();

    // Check chat interface elements
    await expect(page.getByPlaceholder(/Type a message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send/i })).toBeVisible();
  });

  test('should display initial greeting', async ({ page }) => {
    await page.goto('/journal/luna');

    // Check for Luna's initial message
    await expect(page.getByText(/Hi! I'm Luna/i)).toBeVisible();
  });

  test.skip('should send and receive messages', async ({ page }) => {
    await page.goto('/journal/luna');

    // Type a message
    const input = page.getByPlaceholder(/Type a message/i);
    await input.fill('Hello Luna!');

    // Send message
    await page.getByRole('button', { name: /Send/i }).click();

    // Verify user message appears
    await expect(page.getByText('Hello Luna!')).toBeVisible();

    // Wait for Luna's response
    await page.waitForTimeout(2000);

    // Check that a new assistant message appeared
    const messages = page.locator('[data-testid="chat-message"]');
    const count = await messages.count();
    expect(count).toBeGreaterThan(1);
  });

  test('should show loading state while Luna responds', async ({ page }) => {
    await page.goto('/journal/luna');

    const input = page.getByPlaceholder(/Type a message/i);
    await input.fill('Test message');
    await page.getByRole('button', { name: /Send/i }).click();

    // Check for loading indicator
    await expect(page.getByText(/Luna is typing/i)).toBeVisible();
  });
});
```

### Step 4: Create Integration Tests

**Create**: `tests/e2e/integration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { seedTestUser, cleanupTestUser } from '../helpers/test-data';

test.describe('Feature Integration', () => {
  let testUserId: string;

  test.beforeEach(async () => {
    testUserId = await seedTestUser();
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUserId);
  });

  test.skip('should award XP for creating journal entry', async ({ page }) => {
    // Get initial XP
    await page.goto('/gamification');
    const initialXPText = await page.locator('[data-testid="total-xp"]').textContent();
    const initialXP = parseInt(initialXPText?.match(/\d+/)?.[0] || '0');

    // Create journal entry
    await page.goto('/journal');
    await page.getByLabel(/Content/i).fill('Test entry for XP award');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(1000);

    // Check XP increased
    await page.goto('/gamification');
    await page.waitForTimeout(1000);

    const newXPText = await page.locator('[data-testid="total-xp"]').textContent();
    const newXP = parseInt(newXPText?.match(/\d+/)?.[0] || '0');

    expect(newXP).toBeGreaterThan(initialXP);

    // Verify XP history shows journal award
    const latestHistory = page.locator('[data-testid="xp-history-item"]').first();
    await expect(latestHistory).toContainText(/journal/i);
  });

  test.skip('should unlock achievement after first task', async ({ page }) => {
    // Check initial achievement status
    await page.goto('/gamification');
    const gettingStarted = page.getByText(/Getting Started/i);
    const isUnlocked = await gettingStarted.locator('..').locator('[data-testid="achievement-unlocked"]').isVisible();

    if (!isUnlocked) {
      // Complete first task
      await page.goto('/tasks');
      const taskCheckbox = page.locator('[data-testid="task-checkbox"]').first();
      await taskCheckbox.check();

      // Go back to gamification
      await page.goto('/gamification');
      await page.waitForTimeout(1000);

      // Verify "Getting Started" achievement is now unlocked
      const unlockedBadge = page.getByText(/Getting Started/i)
        .locator('..')
        .locator('[data-testid="achievement-unlocked"]');
      await expect(unlockedBadge).toBeVisible();
    }
  });

  test('should maintain user stats across pages', async ({ page }) => {
    // Get stats from gamification page
    await page.goto('/gamification');
    const levelText = await page.getByText(/Level \d+/i).textContent();

    // Navigate to journal
    await page.goto('/journal');

    // Navigate back to gamification
    await page.goto('/gamification');

    // Verify level is the same
    await expect(page.getByText(levelText || '')).toBeVisible();
  });
});
```

### Step 5: Add Accessibility Tests

**Update**: `tests/e2e/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('gamification page should not have accessibility violations', async ({ page }) => {
    await page.goto('/gamification');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('journal page should not have accessibility violations', async ({ page }) => {
    await page.goto('/journal');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('luna chat page should not have accessibility violations', async ({ page }) => {
    await page.goto('/journal/luna');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation on gamification page', async ({ page }) => {
    await page.goto('/gamification');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support keyboard navigation in journal editor', async ({ page }) => {
    await page.goto('/journal');

    // Tab to content editor
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Type content with keyboard
    await page.keyboard.type('Testing keyboard input');

    // Verify content was entered
    const content = page.getByLabel(/Content/i);
    await expect(content).toHaveValue(/Testing keyboard input/i);
  });
});
```

### Step 6: Update Test Data Helpers

**Update**: `tests/helpers/test-data.ts`

Add helpers for gamification and journal test data:

```typescript
export async function seedTestUser(): Promise<string> {
  const userId = `test-user-${Date.now()}`;

  // Create user in database with initial gamification stats
  // Implementation depends on your database setup

  return userId;
}

export async function cleanupTestUser(userId: string): Promise<void> {
  // Clean up user data, journal entries, XP history, etc.
  // Implementation depends on your database setup
}

export async function seedJournalEntries(userId: string, count: number) {
  // Create test journal entries for user
}

export async function seedXPHistory(userId: string) {
  // Create test XP history for user
}
```

---

## Testing Checklist

- [ ] All gamification E2E tests pass
- [ ] All journal E2E tests pass
- [ ] All Luna chat tests pass
- [ ] Integration tests pass
- [ ] Accessibility tests pass
- [ ] Tests run in CI/CD pipeline
- [ ] Test coverage > 80% for new features
- [ ] No flaky tests

---

## Success Criteria

1. ✅ Complete E2E test coverage for gamification features
2. ✅ Complete E2E test coverage for journal features
3. ✅ Integration tests verify XP awards work
4. ✅ Accessibility tests pass for all pages
5. ✅ All tests run reliably in CI/CD
6. ✅ Test data helpers properly clean up after tests
7. ✅ No false positives or flaky tests

---

## Files to Create/Modify

**Create**:
- `tests/e2e/gamification.spec.ts`
- `tests/e2e/journal.spec.ts`
- `tests/e2e/luna-chat.spec.ts`
- `tests/e2e/integration.spec.ts`

**Modify**:
- `tests/e2e/accessibility.spec.ts` - Add new page tests
- `tests/helpers/test-data.ts` - Add gamification/journal helpers

---

## Notes

- Some tests marked as `.skip()` until features are fully connected
- Remove `.skip()` after completing TASK-006, TASK-007, TASK-008
- Consider adding visual regression tests later
- May want to add performance tests for analytics queries
- Add data-testid attributes to components as needed
