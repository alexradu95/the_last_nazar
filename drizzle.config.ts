import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Use SQLite for development
  dialect: 'sqlite',
  schema: [
    './src/features/**/schema/index.ts',
    './src/features/**/schema/luna-schema.ts',
  ],
  out: './drizzle/migrations',

  dbCredentials: {
    url: './dev.db',
  },

  verbose: true,
  strict: true,
});
