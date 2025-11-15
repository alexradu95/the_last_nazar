/**
 * Feature Registry
 *
 * Manages feature registration, initialization, and service location.
 */

import type {
  IFeatureRegistry,
  FeatureDefinition,
  FeatureContext,
  FeatureMetadata,
  RouteDefinition,
} from '../types/feature.types';
import type { IEventBus } from '../types/event.types';

export class FeatureRegistry implements IFeatureRegistry {
  private features = new Map<string, FeatureDefinition>();
  private metadata = new Map<string, FeatureMetadata>();
  private services = new Map<string, any>();
  private componentSlots = new Map<string, Array<() => Promise<any>>>();
  private eventBus: IEventBus;
  private db: any;

  constructor(eventBus: IEventBus, db?: any) {
    this.eventBus = eventBus;
    this.db = db;
  }

  /**
   * Register a feature
   */
  async register(feature: FeatureDefinition): Promise<void> {
    const startTime = performance.now();

    // Validate feature
    this.validateFeature(feature);

    // Check dependencies
    this.checkDependencies(feature);

    // Check for duplicates
    if (this.features.has(feature.id)) {
      throw new Error(`Feature already registered: ${feature.id}`);
    }

    // Initialize metadata
    this.metadata.set(feature.id, {
      id: feature.id,
      name: feature.name,
      version: feature.version,
      enabled: true,
      initialized: false,
    });

    try {
      // Store feature
      this.features.set(feature.id, feature);

      // Register services
      if (feature.provides.services) {
        for (const [serviceId, factory] of Object.entries(feature.provides.services)) {
          const fullServiceId = `${feature.id}.${serviceId}`;
          this.services.set(fullServiceId, factory());
        }
      }

      // Register component slots
      if (feature.provides.componentSlots) {
        for (const [slotId, component] of Object.entries(feature.provides.componentSlots)) {
          if (!this.componentSlots.has(slotId)) {
            this.componentSlots.set(slotId, []);
          }
          this.componentSlots.get(slotId)!.push(component);
        }
      }

      // Create context for initialization
      const context: FeatureContext = {
        eventBus: this.eventBus,
        registry: this,
        db: this.db,
        config: {
          enabled: true,
          flags: {},
          settings: {},
        },
      };

      // Initialize feature
      await feature.initialize(context);

      // Update metadata
      const initTime = performance.now() - startTime;
      this.metadata.set(feature.id, {
        ...this.metadata.get(feature.id)!,
        initialized: true,
        initTime,
      });

      console.log(`[FeatureRegistry] Registered: ${feature.id} (${initTime.toFixed(2)}ms)`);

      // Emit event
      this.eventBus.emit('feature.registered', {
        featureId: feature.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      // Update metadata with error
      this.metadata.set(feature.id, {
        ...this.metadata.get(feature.id)!,
        error: error as Error,
      });

      // Remove from registry
      this.features.delete(feature.id);

      console.error(`[FeatureRegistry] Failed to register ${feature.id}:`, error);
      throw new Error(`Failed to register feature ${feature.id}: ${(error as Error).message}`);
    }
  }

  /**
   * Unregister a feature
   */
  async unregister(featureId: string): Promise<void> {
    const feature = this.features.get(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    try {
      // Call cleanup if available
      if (feature.cleanup) {
        const context: FeatureContext = {
          eventBus: this.eventBus,
          registry: this,
          db: this.db,
          config: { enabled: false },
        };
        await feature.cleanup(context);
      }

      // Remove services
      if (feature.provides.services) {
        for (const serviceId of Object.keys(feature.provides.services)) {
          const fullServiceId = `${featureId}.${serviceId}`;
          this.services.delete(fullServiceId);
        }
      }

      // Remove from maps
      this.features.delete(featureId);
      this.metadata.delete(featureId);

      console.log(`[FeatureRegistry] Unregistered: ${featureId}`);

      // Emit event
      this.eventBus.emit('feature.unregistered', {
        featureId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[FeatureRegistry] Failed to unregister ${featureId}:`, error);
      throw error;
    }
  }

  /**
   * Get a feature by ID
   */
  getFeature(featureId: string): FeatureDefinition | undefined {
    return this.features.get(featureId);
  }

  /**
   * Get all registered features
   */
  getFeatures(): FeatureDefinition[] {
    return Array.from(this.features.values());
  }

  /**
   * Get a service from a feature
   */
  getService<T = any>(featureId: string, serviceId: string): T | undefined {
    const fullServiceId = `${featureId}.${serviceId}`;
    return this.services.get(fullServiceId);
  }

  /**
   * Get all routes from all features
   */
  getAllRoutes(): RouteDefinition[] {
    const routes: RouteDefinition[] = [];

    for (const feature of this.features.values()) {
      if (feature.provides.routes) {
        routes.push(...feature.provides.routes);
      }
    }

    return routes;
  }

  /**
   * Get all components for a slot
   */
  getComponentSlot(slotId: string): Array<() => Promise<any>> {
    return this.componentSlots.get(slotId) || [];
  }

  /**
   * Check if feature is registered
   */
  hasFeature(featureId: string): boolean {
    return this.features.has(featureId);
  }

  /**
   * Get feature metadata
   */
  getMetadata(featureId: string): FeatureMetadata | undefined {
    return this.metadata.get(featureId);
  }

  /**
   * Get all metadata
   */
  getAllMetadata(): FeatureMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Validate feature definition
   */
  private validateFeature(feature: FeatureDefinition): void {
    if (!feature.id) {
      throw new Error('Feature must have an id');
    }
    if (!feature.name) {
      throw new Error('Feature must have a name');
    }
    if (!feature.version) {
      throw new Error('Feature must have a version');
    }
    if (!feature.provides) {
      throw new Error('Feature must define what it provides');
    }
    if (!feature.initialize) {
      throw new Error('Feature must have an initialize function');
    }
  }

  /**
   * Check if all dependencies are available
   */
  private checkDependencies(feature: FeatureDefinition): void {
    if (!feature.dependencies || feature.dependencies.length === 0) {
      return;
    }

    const missing = feature.dependencies.filter((dep) => !this.hasFeature(dep));

    if (missing.length > 0) {
      throw new Error(
        `Feature ${feature.id} has missing dependencies: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Get registry statistics
   */
  getStats() {
    return {
      totalFeatures: this.features.size,
      totalServices: this.services.size,
      features: this.getAllMetadata(),
    };
  }
}

/**
 * Re-export types
 */
export type * from '../types/feature.types';
