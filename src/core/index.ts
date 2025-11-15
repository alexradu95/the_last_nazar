/**
 * Core System Exports
 *
 * Central export point for all core systems.
 */

// Event Bus
export { EventBus, eventBus } from './event-bus';
export type * from './event-bus';

// Feature Registry
export { FeatureRegistry } from './feature-registry';
export type * from './feature-registry';

// Plugin Loader
export { PluginLoader, initializePluginSystem } from './plugin-loader';
export type * from './plugin-loader';

// Database
export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  isDatabaseConnected,
  getDatabaseStats,
} from './database';
export { DatabaseMigrator, migrator, runMigrations } from './database/migrator';
export { SchemaAggregator, schemaAggregator } from './database/schema-aggregator';

// AI Services
export {
  AIService,
  initializeAIService,
  getAIService,
  createAgentAI,
  MockAIProvider,
  createMockProvider,
} from './ai';
export type * from './ai';

// Types
export type * from './types/event.types';
export type * from './types/feature.types';

/**
 * Initialize the entire core system
 */
export async function initializeCore(config?: {
  databaseUrl?: string;
  useMockAI?: boolean;
}) {
  console.log('[Core] Initializing Life OS...');

  // 1. Initialize Database
  const db = initializeDatabase({
    url: config?.databaseUrl || './dev.db',
    verbose: process.env.NODE_ENV === 'development',
  });

  // 2. Run migrations
  await runMigrations(db);

  // 3. Initialize AI Service
  const aiService = initializeAIService({
    provider: 'mock',
    useMock: config?.useMockAI !== false,
  });

  // 4. Initialize Feature Registry
  const registry = new FeatureRegistry(eventBus, db);

  // 5. Initialize Plugin Loader and load features
  const pluginLoader = await initializePluginSystem(registry);

  console.log('[Core] System initialized successfully');

  return {
    db,
    eventBus,
    registry,
    pluginLoader,
    aiService,
  };
}
