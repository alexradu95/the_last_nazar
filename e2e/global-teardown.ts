/**
 * Playwright Global Teardown
 *
 * Runs once after all tests to clean up the test environment.
 * This includes removing test data from the database.
 */

import { FullConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase, closeDatabase } from '../src/core/database';
import { users } from '../src/features/user/schema';
import { credentials } from '../src/features/auth/schema';
import { sessions } from '../src/features/auth/schema';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEST_USER_EMAIL = 'test@example.com';

async function globalTeardown(config: FullConfig) {
  console.log('\n[Global Teardown] Starting cleanup...\n');

  try {
    // Clean up test user and related data
    console.log('[Global Teardown] Cleaning up test data...');
    await cleanupTestUser();

    console.log('\n[Global Teardown] ✅ Cleanup complete\n');
  } catch (error) {
    console.error('\n[Global Teardown] ⚠️  Cleanup failed:', error);
    // Don't throw - teardown failures shouldn't fail the test suite
  }
}

async function cleanupTestUser() {
  try {
    // Always use local SQLite for E2E tests (ignore DATABASE_URL)
    const dbPath = join(__dirname, '..', 'dev.db');

    console.log(`[Global Teardown] Using database at: ${dbPath}`);

    // Initialize database connection
    const db = initializeDatabase({
      url: dbPath,
      verbose: false,
    });

    // Get test user
    const testUser = await db
      .select()
      .from(users)
      .where(eq(users.email, TEST_USER_EMAIL))
      .limit(1);

    if (testUser.length === 0) {
      console.log('[Global Teardown] No test user to clean up');
      closeDatabase();
      return;
    }

    const userId = testUser[0].id;

    // Delete sessions (if any)
    try {
      await db.delete(sessions).where(eq(sessions.userId, userId));
      console.log('[Global Teardown] Deleted test user sessions');
    } catch (error) {
      // Sessions table might not exist or be empty
    }

    // Delete credentials (cascade should handle this, but being explicit)
    try {
      await db.delete(credentials).where(eq(credentials.userId, userId));
      console.log('[Global Teardown] Deleted test user credentials');
    } catch (error) {
      console.warn('[Global Teardown] Could not delete credentials:', error);
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));
    console.log('[Global Teardown] ✅ Test user deleted');

    closeDatabase();
  } catch (error) {
    console.error('[Global Teardown] Failed to cleanup test user:', error);
    closeDatabase();
    throw error;
  }
}

export default globalTeardown;
