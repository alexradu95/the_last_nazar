/**
 * Seed Test User Script
 *
 * Creates the standard test user for E2E tests.
 * This script is idempotent - it can be run multiple times without errors.
 */

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

async function seedTestUser() {
  try {
    console.log('[Seed] Starting test user seeding...');

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
      console.log('[Seed] ✅ Test user already exists');
      closeDatabase();
      return;
    }

    // Hash password
    console.log('[Seed] Hashing password...');
    const { hash, salt } = await hashPassword(TEST_USER.password);

    // Create user
    console.log('[Seed] Creating test user...');
    await db.insert(users).values({
      id: TEST_USER.id,
      email: TEST_USER.email,
      name: TEST_USER.name,
    });

    // Create credentials
    console.log('[Seed] Creating credentials...');
    await db.insert(credentials).values({
      id: `cred-${TEST_USER.id}`,
      userId: TEST_USER.id,
      passwordHash: hash,
      salt,
    });

    console.log('[Seed] ✅ Test user seeded successfully');
    console.log('[Seed] Email:', TEST_USER.email);
    console.log('[Seed] Password:', TEST_USER.password);

    closeDatabase();
  } catch (error) {
    console.error('[Seed] ❌ Failed to seed test user:', error);
    closeDatabase();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestUser().catch((error) => {
    console.error('[Seed] Fatal error:', error);
    process.exit(1);
  });
}

export { seedTestUser };
