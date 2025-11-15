/**
 * Database Migration Script
 *
 * Runs all pending migrations against the database.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('[Migrate] Starting database migrations...\n');

  try {
    // Connect to database
    const dbPath = join(__dirname, '..', 'dev.db');
    console.log(`[Migrate] Database path: ${dbPath}`);

    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);

    // Enable foreign keys and WAL mode
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('journal_mode = WAL');

    // Run migrations
    const migrationsFolder = join(__dirname, '..', 'drizzle', 'migrations');
    console.log(`[Migrate] Migrations folder: ${migrationsFolder}\n`);

    await migrate(db, { migrationsFolder });

    console.log('\n[Migrate] ✅ Migrations completed successfully!');

    sqlite.close();
  } catch (error) {
    console.error('\n[Migrate] ❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations().catch((error) => {
  console.error('[Migrate] Fatal error:', error);
  process.exit(1);
});
