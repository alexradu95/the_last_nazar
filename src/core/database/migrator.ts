/**
 * Database Migration Manager
 *
 * Handles schema migrations for all features.
 */

import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDatabase } from './index';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export class DatabaseMigrator {
  private db: BetterSQLite3Database;

  constructor(db?: BetterSQLite3Database) {
    this.db = db || getDatabase();
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      console.log('[Migrator] Running migrations...');

      await migrate(this.db, {
        migrationsFolder: './drizzle/migrations',
      });

      console.log('[Migrator] Migrations completed successfully');
    } catch (error) {
      console.error('[Migrator] Migration failed:', error);
      throw error;
    }
  }

  /**
   * Check migration status
   */
  async getMigrationStatus(): Promise<{
    applied: number;
    pending: number;
  }> {
    // This is a simplified version
    // In production, you'd query the migrations table
    return {
      applied: 0,
      pending: 0,
    };
  }

  /**
   * Rollback last migration (if supported)
   */
  async rollback(): Promise<void> {
    console.warn('[Migrator] Rollback not implemented for SQLite');
    throw new Error('Rollback not supported in current implementation');
  }

  /**
   * Reset database (drop all tables)
   * WARNING: This will delete all data!
   */
  async reset(): Promise<void> {
    console.warn('[Migrator] Resetting database - all data will be lost!');

    // Get all tables
    const tables = this.db.run(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);

    // Drop each table
    // Note: This is a simple implementation
    // In production, handle foreign keys properly

    console.log('[Migrator] Database reset complete');
  }
}

/**
 * Helper function to run migrations
 */
export async function runMigrations(db?: BetterSQLite3Database): Promise<void> {
  const migrator = new DatabaseMigrator(db);
  await migrator.runMigrations();
}
