/**
 * Plugin Loader
 *
 * Discovers and loads features from the features directory.
 * Handles dependency resolution and initialization order.
 */

import type {
  IPluginLoader,
  FeatureDefinition,
} from '../types/feature.types';
import type { FeatureRegistry } from '../feature-registry';

export class PluginLoader implements IPluginLoader {
  private registry: FeatureRegistry;
  private featuresPath = '/src/features';

  constructor(registry: FeatureRegistry) {
    this.registry = registry;
  }

  /**
   * Discover all features in the features directory
   * Uses Vite's import.meta.glob for dynamic imports
   */
  async discoverFeatures(): Promise<FeatureDefinition[]> {
    try {
      // Use Vite's glob import to find all feature.config.ts files
      const featureModules = import.meta.glob('/src/features/**/feature.config.ts');

      const features: FeatureDefinition[] = [];

      for (const [path, importFn] of Object.entries(featureModules)) {
        try {
          const module = await importFn() as any;
          const feature = module.default || module.feature || module;

          if (this.isValidFeature(feature)) {
            features.push(feature);
            console.log(`[PluginLoader] Discovered feature: ${feature.id} (${path})`);
          } else {
            console.warn(`[PluginLoader] Invalid feature at ${path}`);
          }
        } catch (error) {
          console.error(`[PluginLoader] Failed to load feature from ${path}:`, error);
        }
      }

      return features;
    } catch (error) {
      console.error('[PluginLoader] Failed to discover features:', error);
      return [];
    }
  }

  /**
   * Load and initialize all features
   */
  async loadFeatures(): Promise<void> {
    console.log('[PluginLoader] Starting feature discovery...');

    // Discover all features
    const features = await this.discoverFeatures();

    if (features.length === 0) {
      console.warn('[PluginLoader] No features discovered');
      return;
    }

    console.log(`[PluginLoader] Found ${features.length} features`);

    // Sort by dependencies
    const sorted = this.sortByDependencies(features);

    console.log('[PluginLoader] Loading features in dependency order:');
    sorted.forEach((f, i) => console.log(`  ${i + 1}. ${f.id}`));

    // Register features in order
    for (const feature of sorted) {
      try {
        await this.registry.register(feature);
      } catch (error) {
        console.error(`[PluginLoader] Failed to register ${feature.id}:`, error);
        // Continue with other features
      }
    }

    console.log('[PluginLoader] Feature loading complete');
  }

  /**
   * Sort features by dependencies using topological sort
   * Ensures features are loaded after their dependencies
   */
  sortByDependencies(features: FeatureDefinition[]): FeatureDefinition[] {
    const sorted: FeatureDefinition[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    // Create a map for quick lookup
    const featureMap = new Map<string, FeatureDefinition>();
    for (const feature of features) {
      featureMap.set(feature.id, feature);
    }

    // Depth-first search
    const visit = (featureId: string) => {
      // Already processed
      if (visited.has(featureId)) {
        return;
      }

      // Circular dependency check
      if (visiting.has(featureId)) {
        throw new Error(`Circular dependency detected: ${featureId}`);
      }

      const feature = featureMap.get(featureId);
      if (!feature) {
        throw new Error(`Feature not found: ${featureId}`);
      }

      visiting.add(featureId);

      // Visit dependencies first
      if (feature.dependencies) {
        for (const dep of feature.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(featureId);
      visited.add(featureId);
      sorted.push(feature);
    };

    // Process all features
    for (const feature of features) {
      try {
        visit(feature.id);
      } catch (error) {
        console.error(`[PluginLoader] Error processing ${feature.id}:`, error);
        throw error;
      }
    }

    return sorted;
  }

  /**
   * Validate that an object is a valid feature definition
   */
  private isValidFeature(obj: any): obj is FeatureDefinition {
    return (
      obj &&
      typeof obj === 'object' &&
      typeof obj.id === 'string' &&
      typeof obj.name === 'string' &&
      typeof obj.version === 'string' &&
      typeof obj.provides === 'object' &&
      typeof obj.initialize === 'function'
    );
  }

  /**
   * Reload a specific feature (hot reload support)
   */
  async reloadFeature(featureId: string): Promise<void> {
    console.log(`[PluginLoader] Reloading feature: ${featureId}`);

    // Unregister if already registered
    if (this.registry.hasFeature(featureId)) {
      await this.registry.unregister(featureId);
    }

    // Discover and reload
    const features = await this.discoverFeatures();
    const feature = features.find((f) => f.id === featureId);

    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }

    await this.registry.register(feature);
    console.log(`[PluginLoader] Feature reloaded: ${featureId}`);
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      totalFeatures: this.registry.getFeatures().length,
      features: this.registry.getAllMetadata(),
    };
  }
}

/**
 * Helper function to create and initialize the plugin system
 */
export async function initializePluginSystem(
  registry: FeatureRegistry
): Promise<PluginLoader> {
  const loader = new PluginLoader(registry);
  await loader.loadFeatures();
  return loader;
}

/**
 * Re-export types
 */
export type * from '../types/feature.types';
