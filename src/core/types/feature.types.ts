/**
 * Core Feature System Types
 *
 * Defines the structure and contracts for the feature/plugin system.
 */

import type { IEventBus } from './event.types';

/**
 * Route definition for a feature
 */
export interface RouteDefinition {
  path: string;
  component?: () => Promise<any>;
  handler?: () => Promise<any>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Service definition for a feature
 */
export interface ServiceDefinition {
  id: string;
  factory: () => any;
}

/**
 * Component definition for a feature
 */
export interface ComponentDefinition {
  id: string;
  component: () => Promise<any>;
}

/**
 * Event definitions for a feature
 */
export interface FeatureEvents {
  emits: string[];
  listens: string[];
}

/**
 * What a feature provides to the system
 */
export interface FeatureProvides {
  routes?: RouteDefinition[];
  services?: Record<string, () => any>;
  components?: Record<string, () => Promise<any>>;
  events?: FeatureEvents;
  tables?: string[];
  componentSlots?: Record<string, () => Promise<any>>;
}

/**
 * Feature context provided during initialization
 */
export interface FeatureContext {
  eventBus: IEventBus;
  registry: IFeatureRegistry;
  db: any; // Database instance
  config: FeatureConfig;
}

/**
 * Feature configuration options
 */
export interface FeatureConfig {
  enabled: boolean;
  flags?: Record<string, boolean>;
  settings?: Record<string, any>;
}

/**
 * Complete feature definition
 */
export interface FeatureDefinition {
  /**
   * Unique identifier for the feature
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Version (semver)
   */
  version: string;

  /**
   * Feature dependencies (other feature IDs)
   */
  dependencies?: string[];

  /**
   * What this feature provides
   */
  provides: FeatureProvides;

  /**
   * Initialize the feature
   */
  initialize(context: FeatureContext): Promise<void> | void;

  /**
   * Cleanup when feature is disabled/removed
   */
  cleanup?(context: FeatureContext): Promise<void> | void;

  /**
   * Health check
   */
  healthCheck?(): Promise<boolean> | boolean;
}

/**
 * Feature metadata
 */
export interface FeatureMetadata {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  initialized: boolean;
  error?: Error;
  initTime?: number;
}

/**
 * Feature registry interface
 */
export interface IFeatureRegistry {
  /**
   * Register a feature
   */
  register(feature: FeatureDefinition): Promise<void>;

  /**
   * Unregister a feature
   */
  unregister(featureId: string): Promise<void>;

  /**
   * Get a feature by ID
   */
  getFeature(featureId: string): FeatureDefinition | undefined;

  /**
   * Get all registered features
   */
  getFeatures(): FeatureDefinition[];

  /**
   * Get a service from a feature
   */
  getService<T = any>(featureId: string, serviceId: string): T | undefined;

  /**
   * Get all routes from all features
   */
  getAllRoutes(): RouteDefinition[];

  /**
   * Get all components for a slot
   */
  getComponentSlot(slotId: string): Array<() => Promise<any>>;

  /**
   * Check if feature is registered
   */
  hasFeature(featureId: string): boolean;

  /**
   * Get feature metadata
   */
  getMetadata(featureId: string): FeatureMetadata | undefined;

  /**
   * Get all metadata
   */
  getAllMetadata(): FeatureMetadata[];
}

/**
 * Plugin loader interface
 */
export interface IPluginLoader {
  /**
   * Discover all features in the features directory
   */
  discoverFeatures(): Promise<FeatureDefinition[]>;

  /**
   * Load and initialize all features
   */
  loadFeatures(): Promise<void>;

  /**
   * Sort features by dependencies (topological sort)
   */
  sortByDependencies(features: FeatureDefinition[]): FeatureDefinition[];
}
