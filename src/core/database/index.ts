/**
 * Database Connection and Management
 *
 * Handles database connection, schema aggregation, and migrations.
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

/**
 * Database configuration
 */
export interface DatabaseConfig {
  url: string;
  verbose?: boolean;
}

/**
 * Global database instance
 */
let db: BetterSQLite3Database | null = null;
let sqlite: Database.Database | null = null;

/**
 * Initialize database connection
 */
export function initializeDatabase(config: DatabaseConfig): BetterSQLite3Database {
  if (db) {
    return db;
  }

  try {
    // Create SQLite connection
    sqlite = new Database(config.url);

    // Enable WAL mode for better concurrency
    sqlite.pragma('journal_mode = WAL');

    // Enable foreign keys
    sqlite.pragma('foreign_keys = ON');

    // Create Drizzle instance
    db = drizzle(sqlite, {
      logger: config.verbose,
    });

    console.log(`[Database] Connected to: ${config.url}`);

    return db;
  } catch (error) {
    console.error('[Database] Failed to connect:', error);
    throw error;
  }
}

/**
 * Get database instance
 * Auto-initializes if not already initialized
 */
export function getDatabase(): BetterSQLite3Database {
  if (!db) {
    // Auto-initialize with default config
    console.log('[Database] Auto-initializing with default config');
    initializeDatabase({
      url: process.env.DATABASE_URL || './dev.db',
      verbose: process.env.NODE_ENV === 'development',
    });
  }
  return db!;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close();
    sqlite = null;
    db = null;
    console.log('[Database] Connection closed');
  }
}

/**
 * Check database connection health
 */
export function isDatabaseConnected(): boolean {
  return db !== null && sqlite !== null;
}

/**
 * Execute raw SQL (for debugging)
 */
export function executeRawSQL(sql: string): any {
  if (!sqlite) {
    throw new Error('Database not initialized');
  }
  return sqlite.exec(sql);
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  if (!sqlite) {
    return null;
  }

  try {
    const tables = sqlite.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all();

    const stats = {
      connected: true,
      tables: tables.length,
      tableNames: (tables as any[]).map((t) => t.name),
    };

    return stats;
  } catch (error) {
    console.error('[Database] Failed to get stats:', error);
    return null;
  }
}

/**
 * Default export
 */
export { db, sqlite };
