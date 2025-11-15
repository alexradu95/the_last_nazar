/**
 * Database Initialization Script
 *
 * Runs migrations and seeds initial data.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { createGamificationService } from '../src/features/gamification/services/gamification-service';
import { createJournalService } from '../src/features/journal/services/journal-service';
import { getEventBus } from '../src/core/events/event-bus';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
  console.log('[Init] Starting database initialization...\n');

  try {
    // Connect to database
    const dbPath = join(__dirname, '..', 'dev.db');
    console.log(`[Init] Database path: ${dbPath}`);

    const sqlite = new Database(dbPath);
    const db = drizzle(sqlite);

    // Enable foreign keys and WAL mode
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('journal_mode = WAL');

    // Step 1: Run migrations
    console.log('\n[Init] Step 1: Running migrations...');
    const migrationsFolder = join(__dirname, '..', 'drizzle', 'migrations');
    await migrate(db, { migrationsFolder });
    console.log('[Init] ✅ Migrations completed');

    // Step 2: Seed gamification data
    console.log('\n[Init] Step 2: Seeding gamification achievements...');
    const eventBus = getEventBus();
    const gamificationService = createGamificationService(db, eventBus);
    await gamificationService.seedAchievements();
    console.log('[Init] ✅ Achievements seeded');

    // Step 3: Seed journal prompts
    console.log('\n[Init] Step 3: Seeding journal prompts...');
    const journalService = createJournalService(db, eventBus);
    await journalService.seedPrompts();
    console.log('[Init] ✅ Journal prompts seeded');

    // Step 4: Display summary
    console.log('\n[Init] Step 4: Database summary...');
    const tables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle_%'"
    ).all();

    console.log(`[Init] Total tables: ${tables.length}`);
    console.log('[Init] Tables:', (tables as any[]).map((t) => t.name).join(', '));

    console.log('\n[Init] ✅ Database initialization completed successfully!\n');

    sqlite.close();
  } catch (error) {
    console.error('\n[Init] ❌ Initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase().catch((error) => {
  console.error('[Init] Fatal error:', error);
  process.exit(1);
});
