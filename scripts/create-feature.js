#!/usr/bin/env node

/**
 * Feature Scaffolding Tool
 *
 * Generates a complete feature directory structure with all necessary files.
 * Usage: npm run create-feature <feature-name>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get feature name from command line
const featureName = process.argv[2];

if (!featureName) {
  console.error('❌ Error: Please provide a feature name');
  console.log('Usage: npm run create-feature <feature-name>');
  console.log('Example: npm run create-feature habits');
  process.exit(1);
}

// Validate feature name (lowercase, alphanumeric, hyphens)
if (!/^[a-z][a-z0-9-]*$/.test(featureName)) {
  console.error('❌ Error: Feature name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens');
  process.exit(1);
}

// Convert kebab-case to PascalCase for naming
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

const featureNamePascal = toPascalCase(featureName);
const featurePath = path.join(__dirname, '..', 'src', 'features', featureName);

// Check if feature already exists
if (fs.existsSync(featurePath)) {
  console.error(`❌ Error: Feature "${featureName}" already exists at ${featurePath}`);
  process.exit(1);
}

console.log(`\n🚀 Creating feature: ${featureName}\n`);

// Create directory structure
const directories = [
  '',
  'components',
  'services',
  'api',
  'schema',
  'events',
  'hooks',
  'utils',
  'types',
  '__tests__',
];

directories.forEach(dir => {
  const dirPath = path.join(featurePath, dir);
  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`✓ Created directory: ${path.relative(process.cwd(), dirPath)}`);
});

// File templates
const templates = {
  'feature.config.ts': `/**
 * ${featureNamePascal} Feature Configuration
 */

import type { FeatureDefinition } from '@/core/types/feature.types';

export const ${featureNamePascal}Feature: FeatureDefinition = {
  id: '${featureName}',
  name: '${featureNamePascal}',
  version: '1.0.0',

  // TODO: Add feature dependencies if needed
  dependencies: [],

  provides: {
    // TODO: Define routes
    routes: [
      // { path: '/${featureName}', component: () => import('./components/${featureNamePascal}Page') },
      // { path: '/api/${featureName}', handler: () => import('./api/route') },
    ],

    // TODO: Define events this feature emits and listens to
    events: {
      emits: [
        // '${featureName}.created',
        // '${featureName}.updated',
      ],
      listens: [
        // 'user.login',
      ],
    },

    // TODO: Define services
    services: {
      // '${featureName}-service': () => import('./services/${featureName}-service'),
    },

    // TODO: Define database tables
    tables: [
      // 'feature_${featureName.replace(/-/g, '_')}',
    ],
  },

  async initialize({ eventBus, registry, db }) {
    console.log('[${featureNamePascal}] Feature initialized');

    // TODO: Setup event listeners
    // eventBus.on('user.login', async (payload) => {
    //   // Handle event
    // });

    // TODO: Register services
    // const service = await registry.getService('${featureName}-service');

    // TODO: Initialize feature-specific logic
  },

  async cleanup({ eventBus }) {
    console.log('[${featureNamePascal}] Feature cleanup');
    // TODO: Cleanup resources, unsubscribe from events
  },
};

export default ${featureNamePascal}Feature;
`,

  'README.md': `# ${featureNamePascal} Feature

## Overview

TODO: Describe what this feature does

## Implementation Checklist

### Phase 1: Core Setup
- [x] Feature directory structure created
- [ ] Feature configuration completed
- [ ] Dependencies identified and declared
- [ ] Database schema designed
- [ ] Event definitions created

### Phase 2: Data Layer
- [ ] Database schema implemented (\`schema/index.ts\`)
- [ ] Database migrations created
- [ ] Service layer implemented (\`services/${featureName}-service.ts\`)
- [ ] Data access patterns defined

### Phase 3: API Layer
- [ ] API routes implemented (\`api/route.ts\`)
- [ ] Input validation with Zod
- [ ] Error handling
- [ ] API documentation

### Phase 4: Business Logic
- [ ] Core business logic in services
- [ ] Event handlers implemented
- [ ] Integration with other features via events
- [ ] AI agent integration (if applicable)

### Phase 5: UI Components
- [ ] Main page component (\`components/${featureNamePascal}Page.tsx\`)
- [ ] UI components created
- [ ] Component animations
- [ ] Responsive design
- [ ] Accessibility (ARIA labels, keyboard navigation)

### Phase 6: Testing
- [ ] Unit tests for services
- [ ] Integration tests for API
- [ ] Component tests
- [ ] E2E tests for critical flows

### Phase 7: Documentation
- [ ] API documentation
- [ ] Component documentation
- [ ] Integration guide for other features
- [ ] User documentation

## Architecture

### Dependencies
TODO: List feature dependencies and why they're needed

### Events

#### Emits
TODO: Document events this feature emits

#### Listens
TODO: Document events this feature listens to

### Database Schema
TODO: Describe database tables and relationships

### Services
TODO: Document service layer architecture

### API Endpoints
TODO: List and document API endpoints

## Development

### Local Setup
\`\`\`bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
\`\`\`

### Testing
\`\`\`bash
# Run tests
npm test src/features/${featureName}

# Run with coverage
npm run test:coverage -- src/features/${featureName}
\`\`\`

## Integration Points

### With Other Features
TODO: Document how this feature integrates with others

### Events Flow
TODO: Describe event flows involving this feature

## Notes
TODO: Add any additional notes, considerations, or future improvements
`,

  'schema/index.ts': `/**
 * Database Schema for ${featureNamePascal} Feature
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// TODO: Define your database schema
// IMPORTANT: Use 'feature_${featureName.replace(/-/g, '_')}' as table name prefix

export const ${featureName.replace(/-/g, '_')} = sqliteTable('feature_${featureName.replace(/-/g, '_')}', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),

  // TODO: Add your columns here
  // title: text('title').notNull(),
  // status: text('status', { enum: ['active', 'completed'] }).default('active'),
  // priority: integer('priority').default(0),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// TODO: Export types
export type ${featureNamePascal} = typeof ${featureName.replace(/-/g, '_')}.$inferSelect;
export type New${featureNamePascal} = typeof ${featureName.replace(/-/g, '_')}.$inferInsert;

// TODO: Define additional tables if needed
`,

  'events/index.ts': `/**
 * Event Definitions for ${featureNamePascal} Feature
 */

import type { BaseEventPayload } from '@/core/types/event.types';

// TODO: Define event payloads

export interface ${featureNamePascal}CreatedEvent extends BaseEventPayload {
  ${featureName}Id: string;
  userId: string;
  // TODO: Add event-specific fields
}

export interface ${featureNamePascal}UpdatedEvent extends BaseEventPayload {
  ${featureName}Id: string;
  userId: string;
  changes: Record<string, unknown>;
}

// Event name constants
export const ${featureName.toUpperCase().replace(/-/g, '_')}_EVENTS = {
  CREATED: '${featureName}.created',
  UPDATED: '${featureName}.updated',
  DELETED: '${featureName}.deleted',
} as const;
`,

  'services/index.ts': `/**
 * ${featureNamePascal} Service
 *
 * Business logic for the ${featureName} feature
 */

import type { Database } from '@/core/types/database.types';
import type { IEventBus } from '@/core/types/event.types';
import { ${featureName.replace(/-/g, '_')}, type ${featureNamePascal}, type New${featureNamePascal} } from '../schema';
import { ${featureName.toUpperCase().replace(/-/g, '_')}_EVENTS } from '../events';
import { eq } from 'drizzle-orm';

export class ${featureNamePascal}Service {
  constructor(
    private db: Database,
    private eventBus: IEventBus
  ) {}

  // TODO: Implement CRUD operations

  async create(data: Omit<New${featureNamePascal}, 'id' | 'createdAt' | 'updatedAt'>): Promise<${featureNamePascal}> {
    const id = crypto.randomUUID();

    const [item] = await this.db
      .insert(${featureName.replace(/-/g, '_')})
      .values({
        ...data,
        id,
      })
      .returning();

    // Emit event
    await this.eventBus.emit(${featureName.toUpperCase().replace(/-/g, '_')}_EVENTS.CREATED, {
      ${featureName}Id: item.id,
      userId: item.userId,
      timestamp: Date.now(),
    });

    return item;
  }

  async findById(id: string): Promise<${featureNamePascal} | null> {
    const [item] = await this.db
      .select()
      .from(${featureName.replace(/-/g, '_')})
      .where(eq(${featureName.replace(/-/g, '_')}.id, id))
      .limit(1);

    return item || null;
  }

  async findByUserId(userId: string): Promise<${featureNamePascal}[]> {
    return await this.db
      .select()
      .from(${featureName.replace(/-/g, '_')})
      .where(eq(${featureName.replace(/-/g, '_')}.userId, userId));
  }

  async update(id: string, data: Partial<Omit<${featureNamePascal}, 'id' | 'createdAt'>>): Promise<${featureNamePascal} | null> {
    const [item] = await this.db
      .update(${featureName.replace(/-/g, '_')})
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(${featureName.replace(/-/g, '_')}.id, id))
      .returning();

    if (item) {
      await this.eventBus.emit(${featureName.toUpperCase().replace(/-/g, '_')}_EVENTS.UPDATED, {
        ${featureName}Id: item.id,
        userId: item.userId,
        changes: data,
        timestamp: Date.now(),
      });
    }

    return item || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(${featureName.replace(/-/g, '_')})
      .where(eq(${featureName.replace(/-/g, '_')}.id, id));

    if (result.changes > 0) {
      await this.eventBus.emit(${featureName.toUpperCase().replace(/-/g, '_')}_EVENTS.DELETED, {
        ${featureName}Id: id,
        timestamp: Date.now(),
      });
      return true;
    }

    return false;
  }
}

// Export factory function
export function create${featureNamePascal}Service(db: Database, eventBus: IEventBus): ${featureNamePascal}Service {
  return new ${featureNamePascal}Service(db, eventBus);
}
`,

  'components/index.tsx': `/**
 * ${featureNamePascal} Components
 *
 * Export all components for this feature
 */

// TODO: Create and export your components
// export { ${featureNamePascal}Page } from './${featureNamePascal}Page';
// export { ${featureNamePascal}List } from './${featureNamePascal}List';
// export { ${featureNamePascal}Item } from './${featureNamePascal}Item';
`,

  'api/route.ts': `/**
 * API Routes for ${featureNamePascal} Feature
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDatabase } from '@/core/database';
import { eventBus } from '@/core/event-bus';
import { create${featureNamePascal}Service } from '../services';

// TODO: Define validation schemas
const Create${featureNamePascal}Schema = z.object({
  userId: z.string(),
  // TODO: Add validation fields
});

// GET - List items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const service = create${featureNamePascal}Service(db, eventBus);

    const items = await service.findByUserId(userId);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[${featureNamePascal} API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST - Create item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = Create${featureNamePascal}Schema.parse(body);

    const db = getDatabase();
    const service = create${featureNamePascal}Service(db, eventBus);

    const item = await service.create(validated);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[${featureNamePascal} API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

// PATCH - Update item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const service = create${featureNamePascal}Service(db, eventBus);

    const item = await service.update(id, data);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('[${featureNamePascal} API] PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const service = create${featureNamePascal}Service(db, eventBus);

    const success = await service.delete(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[${featureNamePascal} API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
`,

  'types/index.ts': `/**
 * TypeScript Type Definitions for ${featureNamePascal} Feature
 */

// Re-export schema types
export type { ${featureNamePascal}, New${featureNamePascal} } from '../schema';

// Re-export event types
export type * from '../events';

// TODO: Add additional type definitions
`,

  '__tests__/service.test.ts': `/**
 * Tests for ${featureNamePascal} Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { EventBus } from '@/core/event-bus';
import { create${featureNamePascal}Service } from '../services';
import { ${featureName.replace(/-/g, '_')} } from '../schema';

describe('${featureNamePascal}Service', () => {
  let db: ReturnType<typeof drizzle>;
  let sqlite: Database.Database;
  let eventBus: EventBus;
  let service: ReturnType<typeof create${featureNamePascal}Service>;

  beforeEach(() => {
    // Create in-memory database for testing
    sqlite = new Database(':memory:');
    db = drizzle(sqlite);

    // Create tables
    sqlite.exec(\`
      CREATE TABLE feature_${featureName.replace(/-/g, '_')} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      )
    \`);

    eventBus = new EventBus();
    service = create${featureNamePascal}Service(db, eventBus);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const data = {
        userId: 'user-1',
      };

      const item = await service.create(data);

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.userId).toBe(data.userId);
    });

    // TODO: Add more tests
  });

  describe('findById', () => {
    it('should find an item by id', async () => {
      const created = await service.create({ userId: 'user-1' });
      const found = await service.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent id', async () => {
      const found = await service.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  // TODO: Add more test suites for update, delete, etc.
});
`,

  '.gitkeep': '',
};

// Write all template files
Object.entries(templates).forEach(([filename, content]) => {
  const filePath = path.join(featurePath, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Created file: ${path.relative(process.cwd(), filePath)}`);
});

console.log(`\n✅ Feature "${featureName}" created successfully!\n`);
console.log('📋 Next steps:');
console.log(`   1. Review the generated files in src/features/${featureName}`);
console.log(`   2. Complete the TODOs in feature.config.ts`);
console.log(`   3. Implement your database schema in schema/index.ts`);
console.log(`   4. Add your business logic in services/index.ts`);
console.log(`   5. Create your UI components in components/`);
console.log(`   6. Enable the feature in config/features.config.ts`);
console.log(`   7. Document events in config/events.config.ts\n`);
console.log(`📖 See src/features/${featureName}/README.md for detailed checklist\n`);
