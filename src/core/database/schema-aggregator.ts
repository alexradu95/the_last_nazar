/**
 * Schema Aggregator
 *
 * Collects and combines schemas from all features.
 */

/**
 * Schema registry for all features
 */
export class SchemaAggregator {
  private schemas = new Map<string, any>();

  /**
   * Register a feature's schema
   */
  registerSchema(featureId: string, schema: any): void {
    if (this.schemas.has(featureId)) {
      console.warn(`[SchemaAggregator] Schema already registered for: ${featureId}`);
      return;
    }

    this.schemas.set(featureId, schema);
    console.log(`[SchemaAggregator] Registered schema for: ${featureId}`);
  }

  /**
   * Get schema for a specific feature
   */
  getSchema(featureId: string): any {
    return this.schemas.get(featureId);
  }

  /**
   * Get all schemas combined
   */
  getAllSchemas(): Record<string, any> {
    const combined: Record<string, any> = {};

    for (const [featureId, schema] of this.schemas.entries()) {
      combined[featureId] = schema;
    }

    return combined;
  }

  /**
   * Get all table names
   */
  getAllTableNames(): string[] {
    const tables: string[] = [];

    for (const schema of this.schemas.values()) {
      // Extract table names from schema object
      if (typeof schema === 'object') {
        tables.push(...Object.keys(schema));
      }
    }

    return tables;
  }

  /**
   * Validate that table names are properly namespaced
   */
  validateTableNames(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const tableNames = this.getAllTableNames();
    const seenTables = new Set<string>();

    for (const tableName of tableNames) {
      // Check for duplicates
      if (seenTables.has(tableName)) {
        errors.push(`Duplicate table name: ${tableName}`);
      }
      seenTables.add(tableName);

      // Check for proper namespacing (should start with 'feature_')
      if (!tableName.startsWith('feature_') && !tableName.startsWith('core_')) {
        errors.push(
          `Table '${tableName}' should be namespaced with 'feature_' or 'core_' prefix`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear all schemas
   */
  clear(): void {
    this.schemas.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalFeatures: this.schemas.size,
      totalTables: this.getAllTableNames().length,
      features: Array.from(this.schemas.keys()),
      tables: this.getAllTableNames(),
    };
  }
}

/**
 * Global schema aggregator instance
 */
export const schemaAggregator = new SchemaAggregator();
