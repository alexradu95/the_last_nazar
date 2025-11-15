/**
 * Playwright Global Setup
 *
 * Runs once before all tests to prepare the test environment.
 * This includes seeding the test database with required test data.
 */

import { chromium, FullConfig } from '@playwright/test';
import { initializeDatabase, closeDatabase } from '../src/core/database';
import { users } from '../src/features/user/schema';
import { credentials } from '../src/features/auth/schema';
import { hashPassword } from '../src/features/auth/utils/password';
import { eq } from 'drizzle-orm';

const TEST_USER = {
  id: 'test-user-e2e',
  email: 'test@example.com',
  password: 'TestPass123!',
  name: 'Test User',
};

async function globalSetup(config: FullConfig) {
  console.log('\n[Global Setup] Starting E2E test environment setup...\n');

  try {
    // 1. Seed test user
    console.log('[Global Setup] Seeding test user...');
    await seedTestUser();

    // 2. Verify the application is accessible (optional)
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
    console.log(`[Global Setup] Verifying application at ${baseURL}...`);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
      await page.goto(baseURL, { timeout: 10000 });
      console.log('[Global Setup] ✅ Application is accessible');
    } catch (error) {
      console.warn('[Global Setup] ⚠️  Application not yet accessible (this is okay if dev server is starting)');
    } finally {
      await browser.close();
    }

    console.log('\n[Global Setup] ✅ Environment setup complete\n');
  } catch (error) {
    console.error('\n[Global Setup] ❌ Setup failed:', error);
    throw error;
  }
}

async function seedTestUser() {
  try {
    // Initialize database connection
    const db = initializeDatabase({
      url: process.env.DATABASE_URL || './dev.db',
      verbose: false,
    });

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, TEST_USER.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('[Global Setup] Test user already exists');
      closeDatabase();
      return;
    }

    // Hash password
    const { hash, salt } = await hashPassword(TEST_USER.password);

    // Create user
    await db.insert(users).values({
      id: TEST_USER.id,
      email: TEST_USER.email,
      name: TEST_USER.name,
    });

    // Create credentials
    await db.insert(credentials).values({
      id: `cred-${TEST_USER.id}`,
      userId: TEST_USER.id,
      passwordHash: hash,
      salt,
    });

    console.log('[Global Setup] ✅ Test user seeded');
    console.log(`[Global Setup]    Email: ${TEST_USER.email}`);
    console.log(`[Global Setup]    Password: ${TEST_USER.password}`);

    closeDatabase();
  } catch (error) {
    console.error('[Global Setup] Failed to seed test user:', error);
    closeDatabase();
    throw error;
  }
}

export default globalSetup;
