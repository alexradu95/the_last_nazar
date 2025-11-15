import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export type TestDb = BetterSQLite3Database;

export const createTestDb = (): {
  db: TestDb;
  sqlite: Database.Database;
  close: () => void;
} => {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);

  return {
    db,
    sqlite,
    close: () => sqlite.close(),
  };
};

export const createTestTables = (
  sqlite: Database.Database,
  tables: Record<string, string>
): void => {
  const createStatements = Object.entries(tables)
    .map(([name, schema]) => schema)
    .join('\n\n');

  sqlite.exec(createStatements);
};

export const seedTestData = async <T>(
  db: TestDb,
  table: any,
  data: T[]
): Promise<void> => {
  if (data.length === 0) return;
  await db.insert(table).values(data);
};

export const clearTestTable = async (db: TestDb, table: any): Promise<void> => {
  await db.delete(table);
};
